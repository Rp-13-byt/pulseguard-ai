-- ==============================================================================
-- 04_customer_360.sql: Customer 360 Dimension Join
-- Enriches the customer dimension with pre-aggregated order, telemetry, and support metrics
-- ==============================================================================

CREATE VIEW IF NOT EXISTS `v_customer_360` AS
SELECT 
    c.`customer_id`,
    c.`first_name`,
    c.`last_name`,
    c.`email`,
    c.`plan`,
    c.`country`,
    c.`monthly_value`,
    c.`last_login_at`,
    c.`lifecycle_status`,
    COALESCE(o.`orders_last_30d`, 0) AS `orders_last_30d`,
    COALESCE(o.`spend_last_30d`, 0.0) AS `spend_last_30d`,
    COALESCE(u.`usage_mins_last_7d`, 0.0) AS `usage_mins_last_7d`,
    COALESCE(s.`unresolved_tickets`, 0) AS `unresolved_tickets`,
    COALESCE(s.`negative_tickets`, 0) AS `negative_tickets`,
    COALESCE(s.`has_urgent_ticket`, 0) AS `has_urgent_ticket`
FROM `v_customers_normalized` c
LEFT JOIN `v_order_aggregates` o ON c.`customer_id` = o.`customer_id`
LEFT JOIN `v_usage_aggregates` u ON c.`customer_id` = u.`customer_id`
LEFT JOIN `v_support_aggregates` s ON c.`customer_id` = s.`customer_id`;
