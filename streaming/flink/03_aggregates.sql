-- ==============================================================================
-- 03_aggregates.sql: Decomposed Aggregations
-- Computes bounded metric aggregations independently to prevent state explosion
-- ==============================================================================

-- 1. Order Aggregates (30-Day Window)
CREATE VIEW IF NOT EXISTS `v_order_aggregates` AS
SELECT 
    `customer_id`,
    COUNT(`order_id`) AS `orders_last_30d`,
    SUM(`amount`) AS `spend_last_30d`,
    MAX(`order_time`) AS `latest_order_time`
FROM `v_orders_normalized`
WHERE `status` = 'COMPLETED'
GROUP BY `customer_id`;

-- 2. Telemetry Usage Aggregates (7-Day Rolling Metrics)
CREATE VIEW IF NOT EXISTS `v_usage_aggregates` AS
SELECT 
    `customer_id`,
    COUNT(`event_id`) AS `events_last_7d`,
    SUM(`session_minutes`) AS `usage_mins_last_7d`,
    MAX(`event_time`) AS `latest_activity_time`
FROM `src_product_events`
GROUP BY `customer_id`;

-- 3. Support Aggregates (Ticket Frequency & Negative Sentiment)
CREATE VIEW IF NOT EXISTS `v_support_aggregates` AS
SELECT 
    `customer_id`,
    COUNT(`ticket_id`) AS `tickets_total`,
    SUM(CASE WHEN `status` IN ('OPEN', 'PENDING') THEN 1 ELSE 0 END) AS `unresolved_tickets`,
    SUM(CASE WHEN `sentiment` IN ('NEGATIVE', 'URGENT_NEGATIVE') THEN 1 ELSE 0 END) AS `negative_tickets`,
    MAX(CASE WHEN `sentiment` = 'URGENT_NEGATIVE' THEN 1 ELSE 0 END) AS `has_urgent_ticket`,
    MAX(`created_at`) AS `latest_ticket_time`
FROM `src_zendesk_tickets`
GROUP BY `customer_id`;
