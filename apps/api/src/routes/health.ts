import { Router, Request, Response } from 'express';
import { checkSystemHealth } from '../kafka/health-probe';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const health = await checkSystemHealth();
  res.json(health);
});
