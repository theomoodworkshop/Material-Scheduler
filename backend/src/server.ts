import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { apiRouter } from './routes/index.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());
app.use('/api', apiRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message });
  res.status(500).json({ message: err.message });
});

app.listen(env.port, () => {
  logger.info('Material Scheduler backend running', { port: env.port });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
