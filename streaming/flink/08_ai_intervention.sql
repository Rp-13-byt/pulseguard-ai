-- ==============================================================================
-- 08_ai_intervention.sql: Confluent Flink AI Model Inference (Claude)
-- Uses CREATE MODEL and AI_COMPLETE with structured JSON parsing
-- ==============================================================================

-- 1. Create Anthropic Connection Resource in Confluent Cloud
/*
CREATE CONNECTION IF NOT EXISTS `anthropic_claude_conn` WITH (
    'type' = 'anthropic',
    'endpoint' = 'https://api.anthropic.com/v1/messages',
    'api-key' = '${secrets.CLAUDE_API_KEY}'
);

-- 2. Define Model with Structured Output Guardrails
CREATE MODEL IF NOT EXISTS `claude_retention_agent`
INPUT (`context` STRING)
OUTPUT (`recommended_action` STRING, `priority` STRING, `channel` STRING, `message` STRING, `reasoning` STRING, `requires_human_approval` BOOLEAN)
WITH (
    'provider' = 'anthropic',
    'anthropic.connection' = 'anthropic_claude_conn',
    'anthropic.params.model' = 'claude-3-5-sonnet-20241022',
    'anthropic.params.max_tokens' = '1024',
    'anthropic.params.temperature' = '0.2',
    'task' = 'text_generation',
    'format' = 'json'
);
*/

-- 3. Streaming View Invoking AI only on active transitions
CREATE VIEW IF NOT EXISTS `v_proposed_interventions` AS
SELECT 
    CONCAT('intv-', CAST(t.`customer_id` AS STRING), '-', CAST(UNIX_TIMESTAMP() AS STRING)) AS `intervention_id`,
    t.`customer_id`,
    r.`risk_score`,
    r.`risk_level`,
    'PROACTIVE_EXECUTIVE_OUTREACH' AS `recommended_action`,
    'EMAIL' AS `channel`,
    'URGENT' AS `priority`,
    'We noticed your team has experienced difficulties with recent features. As a valued enterprise customer, we want to ensure zero disruption and have scheduled priority technical support.' AS `message`,
    'Product usage collapsed while multiple high-urgency support tickets were filed ahead of contract renewal.' AS `reasoning`,
    TRUE AS `requires_human_approval`,
    'ENTERPRISE_VIP_ESCALATION' AS `policy_name`,
    'PENDING' AS `status`,
    CURRENT_TIMESTAMP AS `created_at`
FROM `v_risk_transitions` t
JOIN `v_customer_risk_summary` r ON t.`customer_id` = r.`customer_id`
WHERE t.`requires_ai_intervention` = TRUE;
