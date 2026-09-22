import { Router, Request, Response } from 'express';
import { readStore } from '../readmodel/store';
import { checkSystemHealth } from '../kafka/health-probe';

export const metricsRouter = Router();

metricsRouter.get('/', (_req: Request, res: Response) => {
  const metrics = readStore.getMetrics();
  res.json(metrics);
});

metricsRouter.get('/dashboard', async (_req: Request, res: Response) => {
  const customers = readStore.getAllCustomers();
  const metrics = readStore.getMetrics();
  const health = await checkSystemHealth();

  const activeCount = customers.filter((c) => c.lifecycle_status === 'ACTIVE').length;
  const watchCount = customers.filter((c) => c.current_risk_level === 'MEDIUM').length;
  const atRiskCount = customers.filter((c) => c.current_risk_level === 'HIGH').length;
  const criticalCount = customers.filter((c) => c.current_risk_level === 'CRITICAL').length;

  const avgRiskScore = Math.round(
    customers.reduce((sum, c) => sum + c.current_risk_score, 0) / (customers.length || 1)
  );

  const interventions = readStore.getAllInterventions();
  const pendingInterventions = interventions.filter((i) => i.status === 'PENDING').length;

  res.json({
    kpis: {
      total_customers: customers.length,
      active_customers: activeCount,
      watch_customers: watchCount,
      at_risk_customers: atRiskCount,
      critical_customers: criticalCount,
      avg_risk_score: avgRiskScore,
      mrr_exposed: metrics.mrr_total_exposed,
      pending_interventions: pendingInterventions,
      total_interventions_today: interventions.length,
    },
    system_health: health,
    metrics,
  });
});
