import { MaterialStatus, Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';
import { inneryService } from './inngeryService.js';

const asDate = (value?: string | Date | null): Date | null => (value ? new Date(value) : null);

const determineStatus = (recommendedOrderDate: Date | null): MaterialStatus => {
  if (!recommendedOrderDate) return 'UPCOMING';
  const today = new Date();
  const dueSoonLimit = new Date();
  dueSoonLimit.setDate(today.getDate() + env.dueSoonWindowDays);

  if (recommendedOrderDate < today) return 'OVERDUE';
  if (recommendedOrderDate <= dueSoonLimit) return 'DUE_SOON';
  return 'UPCOMING';
};

const computeRequiredOnDate = (workOrderStart: Date | null, projectStart: Date | null, projectEnd: Date | null): Date | null => {
  return workOrderStart ?? projectStart ?? projectEnd;
};

export const scheduleService = {
  async syncAll(force: boolean): Promise<{ synced: boolean; message: string }> {
    const cache = await prisma.syncMeta.findUnique({ where: { key: 'lastSyncAt' } });
    if (!force && cache) {
      const lastSync = new Date(cache.value);
      const mins = (Date.now() - lastSync.getTime()) / 60000;
      if (mins < env.syncCacheMinutes) {
        return { synced: false, message: `Sync skipped: last run was ${Math.round(mins)} minute(s) ago.` };
      }
    }

    const now = new Date();
    const materialsLibrary = await inneryService.fetchMaterialsLibrary();
    const materialLibraryMap = new Map(materialsLibrary.map((item) => [item.materialSku, item]));

    await prisma.materialLibrary.deleteMany();
    if (materialsLibrary.length) {
      await prisma.materialLibrary.createMany({
        data: materialsLibrary.map((item) => ({
          materialSku: item.materialSku,
          name: item.name || item.materialSku,
          defaultLeadTimeDays: item.defaultLeadTimeDays ?? env.defaultLeadTimeDays,
          unit: item.unit ?? null,
          supplier: item.supplier ?? null
        }))
      });
    }

    const projects = await inneryService.fetchProjects();

    for (const project of projects) {
      try {
        const projectId = project.id;
        const workOrders = await inneryService.fetchProjectWorkOrders(projectId);
        const materials = await inneryService.fetchProjectBudgetMaterials(projectId);

        const projectStart = asDate(project.plannedStartDate);
        const projectEnd = asDate(project.plannedEndDate);

        await prisma.project.upsert({
          where: { id: projectId },
          update: {
            name: project.name || `Project ${projectId}`,
            status: project.status || 'UNKNOWN',
            projectNumber: project.projectNumber ?? null,
            plannedStartDate: projectStart,
            plannedEndDate: projectEnd
          },
          create: {
            id: projectId,
            name: project.name || `Project ${projectId}`,
            status: project.status || 'UNKNOWN',
            projectNumber: project.projectNumber ?? null,
            plannedStartDate: projectStart,
            plannedEndDate: projectEnd
          }
        });

        await prisma.workOrder.deleteMany({ where: { projectId } });
        if (workOrders.length) {
          await prisma.workOrder.createMany({
            data: workOrders.map((workOrder) => ({
              id: workOrder.id,
              projectId,
              name: workOrder.name || `Work Order ${workOrder.id}`,
              plannedStartDate: asDate(workOrder.plannedStartDate),
              plannedEndDate: asDate(workOrder.plannedEndDate)
            }))
          });
        }

        await prisma.materialRequirement.deleteMany({ where: { projectId } });
        for (const material of materials) {
          const library = material.materialSku ? materialLibraryMap.get(material.materialSku) : undefined;
          const leadTimeDays = material.leadTimeDays ?? library?.defaultLeadTimeDays ?? env.defaultLeadTimeDays;
          const workOrder = workOrders.find((wo) => wo.id === material.workOrderId);
          const requiredOnDate = computeRequiredOnDate(asDate(workOrder?.plannedStartDate), projectStart, projectEnd);
          const recommendedOrderDate = requiredOnDate ? new Date(requiredOnDate) : null;
          if (recommendedOrderDate) {
            recommendedOrderDate.setDate(recommendedOrderDate.getDate() - leadTimeDays);
          }

          await prisma.materialRequirement.create({
            data: {
              projectId,
              workOrderId: material.workOrderId ?? null,
              materialSku: material.materialSku || 'UNKNOWN-SKU',
              materialName: material.materialName ?? library?.name ?? null,
              quantityRequired: material.quantityRequired ?? 0,
              unit: material.unit ?? library?.unit ?? null,
              leadTimeDays,
              supplier: material.supplier ?? library?.supplier ?? null,
              requiredOnDate,
              recommendedOrderDate,
              status: determineStatus(recommendedOrderDate),
              lastSyncedAt: now
            }
          });
        }
      } catch (error) {
        logger.error('Project sync failed, continuing with remaining projects', {
          projectId: project.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    await prisma.syncMeta.upsert({
      where: { key: 'lastSyncAt' },
      update: { value: now.toISOString() },
      create: { key: 'lastSyncAt', value: now.toISOString() }
    });

    return { synced: true, message: 'Sync completed successfully.' };
  },

  async getSchedule(filters: {
    projectId?: string;
    status?: MaterialStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.MaterialRequirementWhereInput = {
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            recommendedOrderDate: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {})
            }
          }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { materialSku: { contains: filters.search, mode: 'insensitive' } },
              { materialName: { contains: filters.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const rows = await prisma.materialRequirement.findMany({
      where,
      include: {
        project: true,
        workOrder: true
      },
      orderBy: {
        recommendedOrderDate: 'asc'
      }
    });

    return rows.map((row) => ({
      id: row.id,
      title: `[${row.project.name}] ${row.materialSku} - ${row.quantityRequired}`,
      date: row.recommendedOrderDate,
      backgroundColor: row.status === 'OVERDUE' ? '#ef4444' : row.status === 'DUE_SOON' ? '#f59e0b' : '#10b981',
      extendedProps: {
        projectId: row.projectId,
        projectName: row.project.name,
        workOrderName: row.workOrder?.name ?? null,
        materialSku: row.materialSku,
        materialName: row.materialName,
        quantityRequired: row.quantityRequired,
        unit: row.unit,
        supplier: row.supplier,
        leadTimeDays: row.leadTimeDays,
        requiredOnDate: row.requiredOnDate,
        recommendedOrderDate: row.recommendedOrderDate,
        status: row.status
      }
    }));
  }
};
