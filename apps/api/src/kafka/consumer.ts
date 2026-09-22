import { getKafkaClient } from './client';
import { readStore } from '../readmodel/store';
import { sseBus } from '../sse/event-bus';
import { processInterventionActionGate } from '../services/action-gate';
import { ProposedIntervention } from '@pulseguard/domain';

export async function startKafkaConsumer(): Promise<void> {
  const kafka = getKafkaClient();
  if (!kafka) {
    console.log('[Kafka Consumer] Running in embedded simulator mode (no Confluent cluster attached).');
    return;
  }

  try {
    const consumer = kafka.consumer({ groupId: 'pulseguard-readmodel-sync' });
    await consumer.connect();
    await consumer.subscribe({
      topics: [
        'pulseguard.customer.risk',
        'pulseguard.customer.risk.transitions',
        'pulseguard.customer.interventions.proposed',
      ],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        const text = message.value.toString();
        try {
          const data = JSON.parse(text);

          if (topic === 'pulseguard.customer.risk') {
            sseBus.broadcast('RISK_UPDATE', data);
          } else if (topic === 'pulseguard.customer.risk.transitions') {
            readStore.addTransition(data);
            sseBus.broadcast('TRANSITION', data);
          } else if (topic === 'pulseguard.customer.interventions.proposed') {
            await processInterventionActionGate(data as ProposedIntervention);
          }
        } catch (e) {
          console.error(`[Kafka Consumer] Error parsing message from ${topic}:`, e);
        }
      },
    });

    console.log('[Kafka Consumer] Connected and listening to Confluent derived topics.');
  } catch (err) {
    console.warn('[Kafka Consumer] Could not start Kafka consumer. Continuing in simulator mode:', err);
  }
}
