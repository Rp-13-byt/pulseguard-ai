import { Kafka, KafkaConfig } from 'kafkajs';
import { config } from '../config/env';

let kafkaInstance: Kafka | null = null;

export function getKafkaClient(): Kafka | null {
  if (!config.confluent.isConfigured()) {
    return null;
  }

  if (!kafkaInstance) {
    const kafkaConfig: KafkaConfig = {
      clientId: 'pulseguard-api-service',
      brokers: [config.confluent.bootstrapServer],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: config.confluent.apiKey,
        password: config.confluent.apiSecret,
      },
      connectionTimeout: 10000,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    };

    kafkaInstance = new Kafka(kafkaConfig);
  }

  return kafkaInstance;
}
