import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { apiRouter } from './routes';
import { startKafkaConsumer } from './kafka/consumer';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // For SSE compatibility
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Main API Router mounted under /api
app.use('/api', apiRouter);

// Root greeting & status check
app.get('/', (_req, res) => {
  res.json({
    app: 'PulseGuard AI API',
    description: 'Real-Time Customer Retention & Personalization Agent',
    version: '1.0.0',
    mode: config.confluent.isConfigured() ? 'LIVE_CONFLUENT' : 'HIGH_FIDELITY_SIMULATOR',
    endpoints: {
      health: '/api/health',
      dashboard: '/api/metrics/dashboard',
      customers: '/api/customers',
      risk: '/api/risk',
      interventions: '/api/interventions',
      stream: '/api/events/stream',
    },
  });
});

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`PulseGuard AI API Server Running on port ${config.port}`);
  console.log(`Mode: ${config.confluent.isConfigured() ? 'LIVE CONFLUENT CLOUD' : 'HIGH-FIDELITY STREAMING SIMULATOR'}`);
  console.log(`Real-Time SSE: http://localhost:${config.port}/api/events/stream`);
  console.log(`=======================================================`);

  // Start background Kafka consumer
  startKafkaConsumer().catch((err) => {
    console.warn('[Server] Kafka consumer startup notice:', err);
  });
});

export { app, server };
