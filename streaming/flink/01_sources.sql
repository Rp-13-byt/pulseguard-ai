-- ==============================================================================
-- 01_sources.sql: Confluent Cloud Flink Source Tables
-- Reads from raw Kafka topics registered via PostgreSQL CDC V2, Direct Telemetry, and Zendesk
-- ==============================================================================

-- 1. PostgreSQL CDC Source: Customers
CREATE TABLE IF NOT EXISTS `src_cdc_customers` (
    `before` ROW<
        `customer_id` BIGINT,
        `first_name` STRING,
        `last_name` STRING,
        `email` STRING,
        `plan` STRING,
        `country` STRING,
        `signup_date` TIMESTAMP(3),
        `monthly_value` DECIMAL(12, 2),
        `last_login_at` TIMESTAMP(3),
        `lifecycle_status` STRING
    >,
    `after` ROW<
        `customer_id` BIGINT,
        `first_name` STRING,
        `last_name` STRING,
        `email` STRING,
        `plan` STRING,
        `country` STRING,
        `signup_date` TIMESTAMP(3),
        `monthly_value` DECIMAL(12, 2),
        `last_login_at` TIMESTAMP(3),
        `lifecycle_status` STRING
    >,
    `op` STRING,
    `ts_ms` BIGINT,
    `proc_time` AS PROCTIME(),
    `event_time` AS TO_TIMESTAMP_LTZ(`ts_ms`, 3),
    WATERMARK FOR `event_time` AS `event_time` - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'pulseguard.cdc.public.customers',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'scan.startup.mode' = 'earliest-offset',
    'value.format' = 'json-registry'
);

-- 2. PostgreSQL CDC Source: Orders
CREATE TABLE IF NOT EXISTS `src_cdc_orders` (
    `before` ROW<
        `order_id` BIGINT,
        `customer_id` BIGINT,
        `order_time` TIMESTAMP(3),
        `amount` DECIMAL(12, 2),
        `product_category` STRING,
        `status` STRING
    >,
    `after` ROW<
        `order_id` BIGINT,
        `customer_id` BIGINT,
        `order_time` TIMESTAMP(3),
        `amount` DECIMAL(12, 2),
        `product_category` STRING,
        `status` STRING
    >,
    `op` STRING,
    `ts_ms` BIGINT,
    `event_time` AS TO_TIMESTAMP_LTZ(`ts_ms`, 3),
    WATERMARK FOR `event_time` AS `event_time` - INTERVAL '5' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'pulseguard.cdc.public.orders',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'scan.startup.mode' = 'earliest-offset',
    'value.format' = 'json-registry'
);

-- 3. Fast Path Direct Product Telemetry
CREATE TABLE IF NOT EXISTS `src_product_events` (
    `event_id` STRING,
    `customer_id` BIGINT,
    `event_time` STRING,
    `event_type` STRING,
    `feature` STRING,
    `session_minutes` DOUBLE,
    `success` BOOLEAN,
    `row_time` AS TO_TIMESTAMP_LTZ(CAST(`event_time` AS BIGINT), 3),
    WATERMARK FOR `row_time` AS `row_time` - INTERVAL '2' SECOND
) WITH (
    'connector' = 'kafka',
    'topic' = 'pulseguard.product.events',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'scan.startup.mode' = 'latest-offset',
    'value.format' = 'json-registry'
);

-- 4. Zendesk Customer Support Tickets
CREATE TABLE IF NOT EXISTS `src_zendesk_tickets` (
    `ticket_id` BIGINT,
    `customer_id` BIGINT,
    `created_at` STRING,
    `subject` STRING,
    `message` STRING,
    `sentiment` STRING,
    `urgency` STRING,
    `issue_category` STRING,
    `status` STRING,
    `proc_time` AS PROCTIME()
) WITH (
    'connector' = 'kafka',
    'topic' = 'pulseguard.zendesk.tickets',
    'properties.bootstrap.servers' = '${bootstrap.servers}',
    'scan.startup.mode' = 'earliest-offset',
    'value.format' = 'json-registry'
);
