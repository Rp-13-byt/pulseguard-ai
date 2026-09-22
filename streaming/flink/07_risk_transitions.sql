-- ==============================================================================
-- 07_risk_transitions.sql: State Transition Detection
-- Generates events only when risk crosses a boundary (LOW -> HIGH/CRITICAL) or jumps >= 10 pts
-- ==============================================================================

CREATE VIEW IF NOT EXISTS `v_risk_transitions` AS
SELECT 
    CONCAT('trans-', CAST(`customer_id` AS STRING), '-', CAST(UNIX_TIMESTAMP() AS STRING)) AS `transition_id`,
    `customer_id`,
    `risk_score` AS `new_score`,
    `risk_level` AS `new_level`,
    `computed_at` AS `timestamp`,
    CASE 
        WHEN `risk_level` IN ('HIGH', 'CRITICAL') THEN TRUE
        ELSE FALSE
    END AS `requires_ai_intervention`
FROM `v_customer_risk_summary`
WHERE `risk_level` IN ('HIGH', 'CRITICAL');
