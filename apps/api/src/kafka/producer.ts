import { getKafkaClient } from './client';
import { ProductEvent } from '@pulseguard/domain';

export async function produceProductEvent(event: ProductEvent): Promise<boolean> {
  const kafka = getKafkaClient();
  if (!kafka) {
    // Simulator mode handles directly
    return false;
  }

  try {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'pulseguard.product.events',
      messages: [
        {
          key: String(event.customer_id),
          value: JSON.stringify(event),
        },
      ],
    });
    await producer.disconnect();
    return true;
  } catch (err) {
    console.error('[Kafka Producer] Failed to produce product event:', err);
    return false;
  }
}
