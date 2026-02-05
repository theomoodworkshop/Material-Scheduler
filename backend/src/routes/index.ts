import { Router } from 'express';
import { materialController } from '../controllers/materialController.js';
import { projectController } from '../controllers/projectController.js';
import { scheduleController } from '../controllers/scheduleController.js';
import { syncController } from '../controllers/syncController.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.post('/sync/projects', syncController.syncProjects);
apiRouter.get('/schedule', scheduleController.list);
apiRouter.get('/projects', projectController.list);
apiRouter.get('/projects/:id', projectController.getOne);
apiRouter.get('/materials/:sku', materialController.getBySku);
