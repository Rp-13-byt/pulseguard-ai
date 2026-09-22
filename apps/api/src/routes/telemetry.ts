import { Router, Request, Response } from 'express';
import { StreamSimulator } from '../services/stream-simulator';

export const telemetryRouter = Router();

telemetryRouter.post('/action', async (req: Request, res: Response) => {
  const { action, customer_id } = req.body;
  const customerId = customer_id ? parseInt(customer_id, 10) : 1017;

  try {
    switch (action) {
      case 'usage_drop':
        await StreamSimulator.simulateUsageDrop(customerId, -62);
        return res.json({ success: true, message: `Product usage decline simulated for customer ${customerId}` });

      case 'support_ticket':
        await StreamSimulator.simulateSupportTicket(customerId, 'URGENT_NEGATIVE');
        return res.json({ success: true, message: `Urgent negative support ticket created for customer ${customerId}` });

      case 'order_inactivity':
        await StreamSimulator.simulateOrderInactivity(customerId, 35);
        return res.json({ success: true, message: `Order inactivity simulated for customer ${customerId}` });

      case 'payment_failure':
        await StreamSimulator.simulatePaymentFailure(customerId);
        return res.json({ success: true, message: `Payment transaction failure simulated for customer ${customerId}` });

      case 'renewal_alert':
        await StreamSimulator.simulateRenewalAlert(customerId, 7);
        return res.json({ success: true, message: `Renewal window alert (< 7 days) triggered for customer ${customerId}` });

      case 'customer_recovery':
        await StreamSimulator.simulateCustomerRecovery(customerId);
        return res.json({ success: true, message: `Customer rebound and recovery simulated for customer ${customerId}` });

      default:
        return res.status(400).json({ error: `Unknown telemetry action: ${action}` });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
