-- ==============================================================================
-- 09_sink_streams.sql: Materialized Sinks to Confluent Kafka Topics
-- Sinks derived risk, transition, and intervention streams back into Kafka
-- ==============================================================================

-- 1. Sink Table for Customer Churn Risk
CREATE TABLE IF NOT EXISTS `sink_customer_risk` (
    `customer_id` BIGINT,
    `risk_score` INT,
    `risk_level` STRING,
    `mrr_exposed` DECIMAL(12, 2),
    `timestamp` TIMESTAMP(3),
    PRIMARY KEY (`customer_id`) NOT ENFORCED
) WITH (
    'connector' = 'upsert-kafka',
    'topic' = 'pulseguard.customer.risk',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'key.format' = 'json',
    'value.format' = 'json-registry'
);

-- 2. Sink Table for Risk Transitions
CREATE TABLE IF NOT EXISTS `sink_risk_transitions` (
    `transition_id` STRING,
    `customer_id` BIGINT,
    `new_score` INT,
    `new_level` STRING,
    `timestamp` TIMESTAMP(3),
    `requires_ai_intervention` BOOLEAN
) WITH (
    'connector' = 'kafka',
    'topic' = 'pulseguard.customer.risk.transitions',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'value.format' = 'json-registry'
);

-- 3. Sink Table for Proposed Interventions
CREATE TABLE IF NOT EXISTS `sink_interventions_proposed` (
    `intervention_id` STRING,
    `customer_id` BIGINT,
    `risk_score` INT,
    `risk_level` STRING,
    `recommended_action` STRING,
    `channel` STRING,
    `priority` STRING,
    `message` STRING,
    `reasoning` STRING,
    `requires_human_approval` BOOLEAN,
    `policy_name` STRING,
    `status` STRING,
    `created_at` TIMESTAMP(3)
) WITH (
    'connector' = 'kafka',
    'topic' = 'pulseguard.customer.interventions.proposed',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'value.format' = 'json-registry'
);
