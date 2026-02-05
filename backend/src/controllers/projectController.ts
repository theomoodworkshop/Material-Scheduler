import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const projectController = {
  list: async (_req: Request, res: Response) => {
    const projects = await prisma.project.findMany({ orderBy: { name: 'asc' } });
    res.json(projects);
  },

  getOne: async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        workOrders: true,
        materials: true
      }
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.json(project);
  }
};
