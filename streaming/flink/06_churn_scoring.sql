-- ==============================================================================
-- 06_churn_scoring.sql: Deterministic Churn Risk Scoring Engine
-- Implements transparent, explainable scoring formulas matching packages/domain
-- ==============================================================================

CREATE VIEW IF NOT EXISTS `v_customer_risk_scored` AS
SELECT 
    `customer_id`,
    -- 1. Usage score component (0-25 pts)
    CASE 
        WHEN `usage_mins_last_7d` < 10 THEN 25
        WHEN `usage_mins_last_7d` < 30 THEN 18
        WHEN `usage_mins_last_7d` < 60 THEN 10
        ELSE 0
    END AS `usage_score`,
    -- 2. Inactivity component (0-20 pts)
    CASE 
        WHEN `orders_last_30d` = 0 THEN 20
        WHEN `orders_last_30d` = 1 THEN 8
        ELSE 0
    END AS `inactivity_score`,
    -- 3. Negative sentiment component (0-20 pts)
    CASE 
        WHEN `has_urgent_ticket` = 1 THEN 20
        WHEN `negative_tickets` >= 2 THEN 18
        WHEN `negative_tickets` = 1 THEN 12
        ELSE 0
    END AS `sentiment_score`,
    -- 4. Unresolved tickets (0-15 pts)
    CASE 
        WHEN `unresolved_tickets` >= 3 THEN 15
        WHEN `unresolved_tickets` = 2 THEN 10
        WHEN `unresolved_tickets` = 1 THEN 5
        ELSE 0
    END AS `ticket_score`,
    -- 5. Customer Tier Weight (0-10 pts)
    CASE 
        WHEN `plan` = 'ENTERPRISE' OR `monthly_value` >= 2000 THEN 10
        WHEN `plan` = 'PRO' OR `monthly_value` >= 500 THEN 6
        ELSE 2
    END AS `value_score`,
    `monthly_value`,
    `plan`,
    `email`,
    `first_name`,
    `last_name`
FROM `v_customer_360`;

-- Materialized Risk View with Total Score and Classification
CREATE VIEW IF NOT EXISTS `v_customer_risk_summary` AS
SELECT 
    `customer_id`,
    (`usage_score` + `inactivity_score` + `sentiment_score` + `ticket_score` + `value_score`) AS `risk_score`,
    CASE 
        WHEN (`usage_score` + `inactivity_score` + `sentiment_score` + `ticket_score` + `value_score`) >= 75 THEN 'CRITICAL'
        WHEN (`usage_score` + `inactivity_score` + `sentiment_score` + `ticket_score` + `value_score`) >= 50 THEN 'HIGH'
        WHEN (`usage_score` + `inactivity_score` + `sentiment_score` + `ticket_score` + `value_score`) >= 25 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS `risk_level`,
    CASE 
        WHEN (`usage_score` + `inactivity_score` + `sentiment_score` + `ticket_score` + `value_score`) >= 50 THEN `monthly_value`
        ELSE 0.0
    END AS `mrr_exposed`,
    CURRENT_TIMESTAMP AS `computed_at`
FROM `v_customer_risk_scored`;
