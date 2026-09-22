import dotenv from 'dotenv';
import path from 'path';

// Load from root .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.API_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Confluent Cloud Kafka
  confluent: {
    bootstrapServer: process.env.CONFLUENT_BOOTSTRAP_SERVER || '',
    apiKey: process.env.CONFLUENT_KAFKA_API_KEY || '',
    apiSecret: process.env.CONFLUENT_KAFKA_API_SECRET || '',
    isConfigured(): boolean {
      return Boolean(this.bootstrapServer && this.apiKey && this.apiSecret);
    },
  },

  // Schema Registry
  schemaRegistry: {
    url: process.env.CONFLUENT_SCHEMA_REGISTRY_URL || '',
    apiKey: process.env.CONFLUENT_SCHEMA_REGISTRY_API_KEY || '',
    apiSecret: process.env.CONFLUENT_SCHEMA_REGISTRY_API_SECRET || '',
    isConfigured(): boolean {
      return Boolean(this.url && this.apiKey && this.apiSecret);
    },
  },

  // Anthropic Claude
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    isConfigured(): boolean {
      return Boolean(this.apiKey);
    },
  },

  // PostgreSQL Source
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'retentiondb',
    user: process.env.POSTGRES_USER || 'confluent_cdc',
    password: process.env.POSTGRES_PASSWORD || 'confluent_cdc_password',
    ssl: process.env.POSTGRES_SSL === 'true',
  },

  // External Action Webhook
  actionWebhookUrl: process.env.ACTION_WEBHOOK_URL || '',
};
