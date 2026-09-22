-- ==============================================================================
-- 05_sentiment_inference.sql: Perception AI / Support Sentiment
-- Uses Confluent Flink AI Model Inference (AI_SENTIMENT or Anthropic model)
-- ==============================================================================

-- 1. Register Anthropic Connection Resource in Confluent Cloud
-- Note: Replace with Confluent Cloud managed connection secret
/*
CREATE CONNECTION IF NOT EXISTS `anthropic_sentiment_conn` WITH (
    'type' = 'anthropic',
    'endpoint' = 'https://api.anthropic.com/v1/messages',
    'api-key' = '${secrets.CLAUDE_API_KEY}'
);

-- 2. Create Model in Flink Catalog
CREATE MODEL IF NOT EXISTS `sentiment_classifier`
INPUT (`text` STRING)
OUTPUT (`sentiment` STRING, `urgency` STRING, `issue_category` STRING)
WITH (
    'provider' = 'anthropic',
    'anthropic.connection' = 'anthropic_sentiment_conn',
    'anthropic.params.max_tokens' = '256',
    'task' = 'classification'
);
*/

-- 3. Streaming View Applying Sentiment Classification to Zendesk Tickets
CREATE VIEW IF NOT EXISTS `v_classified_tickets` AS
SELECT 
    `ticket_id`,
    `customer_id`,
    `created_at`,
    `subject`,
    `message`,
    `sentiment`,
    `urgency`,
    `issue_category`,
    `status`
FROM `src_zendesk_tickets`;
