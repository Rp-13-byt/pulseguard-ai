import { Router, Request, Response } from 'express';
import { StreamSimulator } from '../services/stream-simulator';

export const demoRouter = Router();

// Master Walkthrough: Step-by-step Golden Path for Customer 1017
demoRouter.post('/walkthrough', async (_req: Request, res: Response) => {
  // Start walkthrough asynchronously so API responds immediately and SSE streams steps
  StreamSimulator.runFullChurnWalkthrough(1017).catch(console.error);

  res.json({
    status: 'STARTED',
    message: 'Master Churn Scenario Walkthrough initiated for Customer 1017 (Acme Global).',
    customer_id: 1017,
  });
});

demoRouter.post('/scenarios/:scenarioId', async (req: Request, res: Response) => {
  const scenarioId = req.params.scenarioId;

  try {
    switch (scenarioId) {
      case '1':
      case 'churn':
        StreamSimulator.runFullChurnWalkthrough(1017).catch(console.error);
        return res.json({ message: 'Scenario 1 (Acme Global Churn) initiated.' });

      case '2':
      case 'support-crisis':
        await StreamSimulator.simulateSupportTicket(1008, 'URGENT_NEGATIVE', 'Production down', 'API cluster dead.');
        return res.json({ message: 'Scenario 2 (Support Crisis) triggered for Customer 1008.' });

      case '3':
      case 'low-value':
        await StreamSimulator.simulateSupportTicket(1019, 'NEGATIVE', 'Need help', 'Cannot figure out export.');
        return res.json({ message: 'Scenario 3 (Free/Starter low-value education) triggered for Customer 1019.' });

      case '4':
      case 'early-warning':
        await StreamSimulator.simulateUsageDrop(1018, -25);
        return res.json({ message: 'Scenario 4 (Early warning watch) triggered for Customer 1018.' });

      case '5':
      case 'recovery':
        await StreamSimulator.simulateCustomerRecovery(1017);
        return res.json({ message: 'Scenario 5 (Customer Recovery & Rebound) executed for Customer 1017.' });

      default:
        return res.status(404).json({ error: `Scenario ${scenarioId} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
