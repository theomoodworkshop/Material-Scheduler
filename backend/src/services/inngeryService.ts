import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { inneryClient } from './inngeryClient.js';
import { InnergyBudgetMaterial, InnergyMaterialLibraryItem, InnergyProject, InnergyWorkOrder } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsePaged = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const maybeItems = (payload as { items?: T[]; data?: T[] }).items ?? (payload as { data?: T[] }).data;
    if (Array.isArray(maybeItems)) return maybeItems;
  }
  return [];
};

const loadMock = async <T>(fileName: string): Promise<T> => {
  const filePath = path.resolve(__dirname, '..', '..', 'mock', fileName);
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
};

export const inneryService = {
  async fetchProjects(): Promise<InnergyProject[]> {
    if (env.mockInnergy) {
      return loadMock<InnergyProject[]>('inngeryProjects.json');
    }
    return parsePaged<InnergyProject>(await inneryClient.get('/api/projects'));
  },

  async fetchProjectWorkOrders(projectId: string): Promise<InnergyWorkOrder[]> {
    if (env.mockInnergy) {
      const projects = await loadMock<Array<InnergyProject & { workOrders?: InnergyWorkOrder[] }>>('inngeryProjects.json');
      return projects.find((project) => project.id === projectId)?.workOrders ?? [];
    }
    return parsePaged<InnergyWorkOrder>(await inneryClient.get(`/api/projects/${projectId}/workOrders`));
  },

  async fetchProjectBudgetMaterials(projectId: string): Promise<InnergyBudgetMaterial[]> {
    if (env.mockInnergy) {
      const projects = await loadMock<Array<InnergyProject & { budgetMaterials?: InnergyBudgetMaterial[] }>>('inngeryProjects.json');
      return projects.find((project) => project.id === projectId)?.budgetMaterials ?? [];
    }
    return parsePaged<InnergyBudgetMaterial>(await inneryClient.get(`/api/projects/${projectId}/budgetMaterials`));
  },

  async fetchMaterialsLibrary(): Promise<InnergyMaterialLibraryItem[]> {
    if (env.mockInnergy) {
      return loadMock<InnergyMaterialLibraryItem[]>('inngeryMaterials.json');
    }
    return parsePaged<InnergyMaterialLibraryItem>(await inneryClient.get('/api/materials'));
  }
};
