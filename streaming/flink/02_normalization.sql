-- ==============================================================================
-- 02_normalization.sql: Normalization & Unwrapping Views
-- Transforms Debezium CDC envelopes and diverse schemas into unified typed views
-- ==============================================================================

-- Normalized Customers View (always takes the latest state)
CREATE VIEW IF NOT EXISTS `v_customers_normalized` AS
SELECT 
    `after`.`customer_id` AS `customer_id`,
    `after`.`first_name` AS `first_name`,
    `after`.`last_name` AS `last_name`,
    `after`.`email` AS `email`,
    `after`.`plan` AS `plan`,
    `after`.`country` AS `country`,
    `after`.`signup_date` AS `signup_date`,
    `after`.`monthly_value` AS `monthly_value`,
    `after`.`last_login_at` AS `last_login_at`,
    `after`.`lifecycle_status` AS `lifecycle_status`,
    `event_time`
FROM `src_cdc_customers`
WHERE `op` <> 'd' AND `after` IS NOT NULL;

-- Normalized Orders View
CREATE VIEW IF NOT EXISTS `v_orders_normalized` AS
SELECT 
    `after`.`order_id` AS `order_id`,
    `after`.`customer_id` AS `customer_id`,
    `after`.`order_time` AS `order_time`,
    `after`.`amount` AS `amount`,
    `after`.`product_category` AS `product_category`,
    `after`.`status` AS `status`,
    `event_time`
FROM `src_cdc_orders`
WHERE `op` <> 'd' AND `after` IS NOT NULL;
