import { Router, Request, Response } from 'express';
import { readStore } from '../readmodel/store';
import { approveIntervention, rejectIntervention } from '../services/action-gate';

export const interventionsRouter = Router();

interventionsRouter.get('/', (_req: Request, res: Response) => {
  const interventions = readStore.getAllInterventions();
  res.json({
    total: interventions.length,
    interventions,
  });
});

interventionsRouter.get('/:id', (req: Request, res: Response) => {
  const interventionId = req.params.id as string;
  const intervention = readStore.getIntervention(interventionId);
  if (!intervention) {
    return res.status(404).json({ error: `Intervention ${interventionId} not found` });
  }
  res.json(intervention);
});

interventionsRouter.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const interventionId = req.params.id as string;
    const approver = (req.body.approver as string) || 'VP Customer Success (Demo)';
    const updated = await approveIntervention(interventionId, approver);
    res.json({
      message: 'Intervention approved and executed through action gate.',
      intervention: updated,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

interventionsRouter.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const interventionId = req.params.id as string;
    const reason = (req.body.reason as string) || 'Rejected during operational triage';
    const reviewer = (req.body.reviewer as string) || 'VP Customer Success (Demo)';
    const updated = await rejectIntervention(interventionId, reason, reviewer);
    res.json({
      message: 'Intervention rejected.',
      intervention: updated,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
