/**
 * PulseGuard AI - Topic Provisioning Script
 * Creates all required raw and derived Kafka topics on Confluent Cloud with retention policies.
 */

import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface TopicSpec {
  topic: string;
  numPartitions: number;
  replicationFactor: number;
  configEntries: { name: string; value: string }[];
}

const TOPICS: TopicSpec[] = [
  // Input raw topics
  {
    topic: 'pulseguard.cdc.public.customers',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'cleanup.policy', value: 'compact' }],
  },
  {
    topic: 'pulseguard.cdc.public.orders',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '604800000' }], // 7 days
  },
  {
    topic: 'pulseguard.cdc.public.product_events',
    numPartitions: 6,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '259200000' }], // 3 days
  },
  {
    topic: 'pulseguard.cdc.public.subscriptions',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'cleanup.policy', value: 'compact' }],
  },
  {
    topic: 'pulseguard.product.events',
    numPartitions: 6,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '259200000' }], // 3 days
  },
  {
    topic: 'pulseguard.zendesk.tickets',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '1209600000' }], // 14 days
  },

  // Derived Flink stream topics
  {
    topic: 'pulseguard.customer.signals',
    numPartitions: 6,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '259200000' }],
  },
  {
    topic: 'pulseguard.customer.360',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'cleanup.policy', value: 'compact' }],
  },
  {
    topic: 'pulseguard.customer.risk',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'cleanup.policy', value: 'compact,delete' }, { name: 'retention.ms', value: '1209600000' }],
  },
  {
    topic: 'pulseguard.customer.risk.transitions',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '2592000000' }], // 30 days
  },
  {
    topic: 'pulseguard.customer.interventions.proposed',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '2592000000' }],
  },
  {
    topic: 'pulseguard.customer.audit',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '31536000000' }], // 1 year compliance
  },
  {
    topic: 'pulseguard.demo.activity',
    numPartitions: 3,
    replicationFactor: 3,
    configEntries: [{ name: 'retention.ms', value: '86400000' }],
  },
];

async function setupTopics() {
  const bootstrap = process.env.CONFLUENT_BOOTSTRAP_SERVER;
  const apiKey = process.env.CONFLUENT_KAFKA_API_KEY;
  const apiSecret = process.env.CONFLUENT_KAFKA_API_SECRET;

  if (!bootstrap || !apiKey || !apiSecret) {
    console.log('[Topic Setup] CONFLUENT credentials not present in .env. Documented topic inventory:');
    TOPICS.forEach((t) =>
      console.log(`  - ${t.topic} (Partitions: ${t.numPartitions}, Cleanup: ${t.configEntries[0]?.value})`)
    );
    return;
  }

  const kafka = new Kafka({
    clientId: 'pulseguard-topic-provisioner',
    brokers: [bootstrap],
    ssl: true,
    sasl: {
      mechanism: 'plain',
      username: apiKey,
      password: apiSecret,
    },
  });

  const admin = kafka.admin();
  try {
    console.log('[Topic Setup] Connecting to Confluent Cloud...');
    await admin.connect();
    const existing = await admin.listTopics();
    console.log(`[Topic Setup] Found ${existing.length} existing topics.`);

    const toCreate = TOPICS.filter((t) => !existing.includes(t.topic));
    if (toCreate.length === 0) {
      console.log('[Topic Setup] All PulseGuard AI topics already exist.');
    } else {
      console.log(`[Topic Setup] Creating ${toCreate.length} missing topics...`);
      await admin.createTopics({
        topics: toCreate.map((t) => ({
          topic: t.topic,
          numPartitions: t.numPartitions,
          replicationFactor: t.replicationFactor,
          configEntries: t.configEntries,
        })),
      });
      console.log('[Topic Setup] Successfully created missing topics.');
    }
  } catch (err) {
    console.error('[Topic Setup] Error during topic provisioning:', err);
  } finally {
    await admin.disconnect();
  }
}

if (require.main === module) {
  setupTopics().catch(console.error);
}

export { setupTopics, TOPICS };
