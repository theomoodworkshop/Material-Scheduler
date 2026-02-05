import { Request, Response } from 'express';
import { scheduleService } from '../services/scheduleService.js';

export const syncController = {
  syncProjects: async (req: Request, res: Response) => {
    try {
      const force = req.query.force === 'true';
      const result = await scheduleService.syncAll(force);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      res.status(500).json({ message });
    }
  }
};
