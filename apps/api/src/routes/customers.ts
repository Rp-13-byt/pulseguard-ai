import { Router, Request, Response } from 'express';
import { readStore } from '../readmodel/store';

export const customersRouter = Router();

customersRouter.get('/', (_req: Request, res: Response) => {
  const customers = readStore.getAllCustomers();
  res.json({
    total: customers.length,
    customers,
  });
});

customersRouter.get('/:id', (req: Request, res: Response) => {
  const customerId = parseInt(req.params.id as string, 10);
  const customer = readStore.getCustomer(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer ${customerId} not found` });
  }

  const riskEvent = readStore.getRiskEvent(customerId);
  const riskHistory = readStore.getRiskHistory(customerId);
  const audits = readStore.getAuditEvents(customerId);

  res.json({
    customer,
    risk: riskEvent,
    riskHistory,
    audits,
  });
});

customersRouter.get('/:id/timeline', (req: Request, res: Response) => {
  const customerId = parseInt(req.params.id as string, 10);
  const customer = readStore.getCustomer(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer ${customerId} not found` });
  }

  const audits = readStore.getAuditEvents(customerId);
  const history = readStore.getRiskHistory(customerId);

  res.json({
    customer_id: customerId,
    name: `${customer.first_name} ${customer.last_name}`,
    timeline: audits,
    history,
  });
});
