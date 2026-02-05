import { MaterialStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { scheduleService } from '../services/scheduleService.js';

export const scheduleController = {
  list: async (req: Request, res: Response) => {
    try {
      const data = await scheduleService.getSchedule({
        projectId: req.query.projectId as string | undefined,
        status: req.query.status as MaterialStatus | undefined,
        search: req.query.search as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined
      });
      res.json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch schedule';
      res.status(500).json({ message });
    }
  }
};
