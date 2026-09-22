import { Router, Request, Response } from 'express';
import { readStore } from '../readmodel/store';
import { RiskLevel } from '@pulseguard/domain';

export const riskRouter = Router();

riskRouter.get('/', (req: Request, res: Response) => {
  const levelFilter = req.query.level as RiskLevel | undefined;
  const customers = readStore.getAllCustomers();

  let filtered = customers;
  if (levelFilter) {
    filtered = customers.filter((c) => c.current_risk_level === levelFilter);
  }

  const riskTable = filtered.map((c) => {
    const risk = readStore.getRiskEvent(c.customer_id);
    return {
      customer_id: c.customer_id,
      name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      plan: c.plan,
      monthly_value: c.monthly_value,
      risk_score: c.current_risk_score,
      risk_level: c.current_risk_level,
      mrr_exposed: risk?.mrr_exposed ?? 0,
      risk_weighted_mrr: risk?.risk_weighted_mrr ?? 0,
      primary_reason: risk?.reasons[0] ?? 'Stable engagement',
      last_updated: c.last_updated,
    };
  });

  res.json({
    total: riskTable.length,
    customers: riskTable,
  });
});

riskRouter.get('/transitions', (_req: Request, res: Response) => {
  res.json({
    transitions: readStore.getTransitions(),
  });
});
