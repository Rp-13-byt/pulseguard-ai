import { Router, Request, Response } from 'express';
import { healthRouter } from './health';
import { customersRouter } from './customers';
import { riskRouter } from './risk';
import { interventionsRouter } from './interventions';
import { demoRouter } from './demo';
import { telemetryRouter } from './telemetry';
import { governanceRouter } from './governance';
import { metricsRouter } from './metrics';
import { sseBus } from '../sse/event-bus';

export const apiRouter = Router();

// Server-Sent Events (SSE) Live Feed
apiRouter.get('/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial handshake ping
  res.write(
    `data: ${JSON.stringify({
      type: 'EVENT',
      data: {
        source: 'SYSTEM',
        event_type: 'SSE_CONNECTED',
        detail: 'Connected to PulseGuard AI Real-Time Event Stream',
        timestamp: new Date().toISOString(),
      },
    })}\n\n`
  );

  sseBus.addClient(res);
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/risk', riskRouter);
apiRouter.use('/interventions', interventionsRouter);
apiRouter.use('/demo', demoRouter);
apiRouter.use('/telemetry', telemetryRouter);
apiRouter.use('/governance', governanceRouter);
apiRouter.use('/metrics', metricsRouter);
