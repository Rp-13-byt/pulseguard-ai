# Confluent AI Hackathon — Google Forms Submission Reference

## 1. Screenshot Link Section

> **Google Form Prompt:**  
> *"Please link to a screenshot of your app or your Stream Lineage (In your Confluent Cloud environment, click on 'Stream Lineage' from the left menu. Then take a screenshot of your Stream Lineage, upload it to an image host such as Google Drive or imgbb.com and paste the link here.)"*

### Instructions to submit:
1. Save the generated **Confluent Stream Lineage** screenshot or **PulseGuard App Dashboard** screenshot.
2. Upload to [imgbb.com](https://imgbb.com/) or Google Drive (set sharing to *"Anyone with the link can view"*).
3. Paste the URL directly into the Google Form.

---

## 2. Schema Text Section (Ready to Copy-Paste)

> **Google Form Prompt:**  
> *"Please provide your schema(s) (JSON Schema, Avro, or Protobuf) or Schema Registry definitions used in your project."*

*(Copy and paste the text block below directly into the Google Forms text box)*

```json
/* ==============================================================================
   PulseGuard AI — Confluent Schema Registry JSON_SR Definitions
   Cluster: pulseguard-kafka-cluster | Environment: env-pulseguard-ai
   Classification Tags: PII, FINANCIAL, SENSITIVE, PUBLIC
   ============================================================================== */

// 1. SUBJECT: pulseguard.cdc.public.customers-value (Version: 4, Compatibility: BACKWARD)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Customer",
  "description": "Operational customer profile stream from PostgreSQL CDC Source V2",
  "type": "object",
  "properties": {
    "customer_id": { "type": "integer", "description": "Unique customer ID" },
    "first_name": { "type": "string", "confluent:tags": ["PII"] },
    "last_name": { "type": "string", "confluent:tags": ["PII"] },
    "email": { "type": "string", "format": "email", "confluent:tags": ["PII"] },
    "plan": { "type": "string", "enum": ["FREE", "STARTER", "PRO", "ENTERPRISE"] },
    "country": { "type": "string" },
    "signup_date": { "type": "string" },
    "monthly_value": { "type": "number", "confluent:tags": ["FINANCIAL"] },
    "last_login_at": { "type": "string" },
    "lifecycle_status": { "type": "string", "enum": ["ACTIVE", "WATCH", "AT_RISK", "CRITICAL", "CHURNED"] }
  },
  "required": ["customer_id", "first_name", "last_name", "email", "plan", "monthly_value"]
}

// 2. SUBJECT: pulseguard.cdc.public.orders-value (Version: 2, Compatibility: BACKWARD)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Order",
  "description": "Customer order transaction stream from PostgreSQL CDC Source V2",
  "type": "object",
  "properties": {
    "order_id": { "type": "integer" },
    "customer_id": { "type": "integer" },
    "order_time": { "type": "string" },
    "amount": { "type": "number", "confluent:tags": ["FINANCIAL"] },
    "product_category": { "type": "string" },
    "status": { "type": "string", "enum": ["COMPLETED", "CANCELLED", "REFUNDED", "FAILED"] }
  },
  "required": ["order_id", "customer_id", "order_time", "amount", "status"]
}

// 3. SUBJECT: pulseguard.product.events-value (Version: 3, Compatibility: FULL)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProductEvent",
  "description": "Real-time user telemetry and product interaction event stream (Fast Path)",
  "type": "object",
  "properties": {
    "event_id": { "type": "string" },
    "customer_id": { "type": "integer" },
    "event_time": { "type": "string" },
    "event_type": { "type": "string", "enum": ["LOGIN", "FEATURE_USE", "SESSION_START", "EXPORT_DATA", "INVITE_USER", "SETTINGS_CHANGE"] },
    "feature": { "type": "string" },
    "session_minutes": { "type": "number" },
    "success": { "type": "boolean" },
    "metadata": { "type": "object" }
  },
  "required": ["event_id", "customer_id", "event_time", "event_type"]
}

// 4. SUBJECT: pulseguard.zendesk.tickets-value (Version: 2, Compatibility: BACKWARD)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SupportTicket",
  "description": "Zendesk customer support ticket with AI perception sentiment tags",
  "type": "object",
  "properties": {
    "ticket_id": { "type": "integer" },
    "customer_id": { "type": "integer" },
    "created_at": { "type": "string" },
    "subject": { "type": "string" },
    "message": { "type": "string", "confluent:tags": ["SENSITIVE"] },
    "sentiment": { "type": "string", "enum": ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT_NEGATIVE"], "confluent:tags": ["SENSITIVE"] },
    "sentiment_score": { "type": "number" },
    "urgency": { "type": "string", "enum": ["LOW", "NORMAL", "HIGH", "URGENT"] },
    "issue_category": { "type": "string", "enum": ["BILLING", "PERFORMANCE", "BUG", "INTEGRATION", "CANCELLATION_REQUEST"] },
    "status": { "type": "string", "enum": ["OPEN", "PENDING", "SOLVED", "CLOSED"] }
  },
  "required": ["ticket_id", "customer_id", "created_at", "subject", "message", "sentiment", "urgency"]
}

// 5. SUBJECT: pulseguard.customer.risk-value (Version: 3, Compatibility: BACKWARD)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CustomerRisk",
  "description": "Deterministic churn risk score and point-by-point explainability breakdown calculated by Apache Flink",
  "type": "object",
  "properties": {
    "risk_event_id": { "type": "string" },
    "customer_id": { "type": "integer" },
    "risk_score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "risk_level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    "breakdown": {
      "type": "object",
      "properties": {
        "usage_decline_pts": { "type": "integer" },
        "order_inactivity_pts": { "type": "integer" },
        "negative_sentiment_pts": { "type": "integer" },
        "unresolved_tickets_pts": { "type": "integer" },
        "renewal_proximity_pts": { "type": "integer" },
        "customer_value_pts": { "type": "integer" },
        "total_score": { "type": "integer" }
      },
      "required": ["total_score"]
    },
    "reasons": {
      "type": "array",
      "items": { "type": "string" }
    },
    "mrr_exposed": { "type": "number", "confluent:tags": ["FINANCIAL"] },
    "risk_weighted_mrr": { "type": "number", "confluent:tags": ["FINANCIAL"] },
    "timestamp": { "type": "string" },
    "processing_version": { "type": "string" }
  },
  "required": ["risk_event_id", "customer_id", "risk_score", "risk_level", "breakdown", "reasons", "timestamp"]
}

// 6. SUBJECT: pulseguard.customer.risk.transitions-value (Version: 2, Compatibility: FULL)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CustomerRiskTransition",
  "description": "Trigger stream for significant churn risk state transitions requiring AI evaluation",
  "type": "object",
  "properties": {
    "transition_id": { "type": "string" },
    "customer_id": { "type": "integer" },
    "previous_score": { "type": "integer" },
    "new_score": { "type": "integer" },
    "previous_level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    "new_level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    "score_delta": { "type": "integer" },
    "trigger_reason": { "type": "string" },
    "timestamp": { "type": "string" },
    "requires_ai_intervention": { "type": "boolean" }
  },
  "required": ["transition_id", "customer_id", "previous_score", "new_score", "previous_level", "new_level", "trigger_reason", "timestamp", "requires_ai_intervention"]
}

// 7. SUBJECT: pulseguard.customer.interventions.proposed-value (Version: 3, Compatibility: FULL)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProposedIntervention",
  "description": "Governed retention intervention formulated by Claude AI inference with strict policy boundaries",
  "type": "object",
  "properties": {
    "intervention_id": { "type": "string" },
    "customer_id": { "type": "integer" },
    "risk_event_id": { "type": "string" },
    "transition_id": { "type": "string" },
    "risk_score": { "type": "integer" },
    "risk_level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    "recommended_action": { "type": "string" },
    "channel": { "type": "string", "enum": ["EMAIL", "SLACK", "IN_APP", "CRM", "PHONE"] },
    "priority": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "URGENT"] },
    "offer_type": { "type": "string", "enum": ["NONE", "DISCOUNT_10", "DISCOUNT_20", "EXECUTIVE_CALL", "PRIORITY_SUPPORT", "TRAINING_SESSION", "FEATURE_PREVIEW"] },
    "discount_percent": { "type": "number", "minimum": 0, "maximum": 50 },
    "message": { "type": "string" },
    "reasoning": { "type": "string" },
    "requires_human_approval": { "type": "boolean" },
    "policy_name": { "type": "string" },
    "status": { "type": "string", "enum": ["PENDING", "APPROVED", "EXECUTED", "REJECTED"] },
    "confidence": { "type": "number" },
    "risk_model_version": { "type": "string" },
    "policy_version": { "type": "string" },
    "ai_model": { "type": "string" },
    "prompt_version": { "type": "string" },
    "schema_version": { "type": "integer" },
    "idempotency_key": { "type": "string" },
    "created_at": { "type": "string" }
  },
  "required": [
    "intervention_id", "customer_id", "risk_score", "risk_level",
    "recommended_action", "channel", "message", "requires_human_approval",
    "policy_name", "status", "idempotency_key", "created_at"
  ]
}

// 8. SUBJECT: pulseguard.customer.audit-value (Version: 2, Compatibility: BACKWARD)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CustomerAudit",
  "description": "Immutable compliance and governance audit event recording state changes, AI proposals, and human actions",
  "type": "object",
  "properties": {
    "audit_id": { "type": "string" },
    "timestamp": { "type": "string" },
    "customer_id": { "type": "integer" },
    "actor_type": { "type": "string", "enum": ["SYSTEM", "AI", "HUMAN", "CONNECTOR", "FLINK"] },
    "actor_id": { "type": "string" },
    "action": { "type": "string" },
    "previous_state": { "type": "string" },
    "new_state": { "type": "string" },
    "risk_event_id": { "type": "string" },
    "policy_version": { "type": "string" },
    "model_version": { "type": "string" },
    "approval_required": { "type": "boolean" },
    "approval_status": { "type": "string", "enum": ["PENDING", "APPROVED", "EXECUTED", "REJECTED"] },
    "reason": { "type": "string" }
  },
  "required": ["audit_id", "timestamp", "customer_id", "actor_type", "actor_id", "action", "new_state", "policy_version", "reason"]
}
```
