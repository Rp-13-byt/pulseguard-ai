# PulseGuard AI — System Architecture & Technical Specifications

PulseGuard AI is an enterprise-grade real-time customer intelligence and retention platform. It fundamentally demonstrates the shift from slow batch analytics to continuous, event-driven streaming intelligence.

## 1. The Three Layers of Intelligence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. APACHE FLINK: "What is happening?"                                       │
│    - Normalization of Debezium CDC change events                            │
│    - Decomposed windowed aggregations (order, usage, support metrics)       │
│    - Deterministic, mathematically explainable churn scoring (0-100)        │
│    - State transition detection (pulseguard.customer.risk.transitions)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CLAUDE AI INFERENCE: "Why does it matter & what should we do?"           │
│    - Contextual reasoning over customer profile, contract, and signals      │
│    - Root-cause explanation synthesis                                       │
│    - Personalized retention offer & outreach copy generation                │
│    - Structured JSON generation with strict validation schema               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. GOVERNED POLICY ENGINE: "Are we allowed to do it?"                       │
│    - Deterministic discount ceilings (Enterprise: 20%, Pro: 15%, Free: 0%)  │
│    - Mandatory human-approval escalation (VIP accounts in CRITICAL state)   │
│    - PII redaction (email and customer identity masking)                    │
│    - Immutable compliance audit trail logging                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Latency Tiers & Credible Timing

PulseGuard AI avoids naive "sub-second everywhere" claims and operates with explicit latency classes:

| Latency Class | Stream Origin | Delivery Profile | Typical Latency |
|---|---|---|---|
| **Fast Path** | Product Telemetry / In-App Events | Direct Kafka Producer | < 1 Second |
| **Operational Path** | PostgreSQL Tables (Customers, Orders) | Debezium CDC Source V2 | 1–3 Seconds |
| **Support Path** | Zendesk Customer Support Tickets | Managed Zendesk Source Connector | 15–30 Seconds (`request.interval.ms = 15000`) |

## 3. Decomposed Flink State Topology

To prevent state explosion from continuous 5-way joins, PulseGuard AI separates metrics into bounded aggregation views:

1. **`order_aggregates`**: 30-day hopping window computing `orders_last_30d`, `spend_last_30d`, and `days_since_last_order`.
2. **`usage_aggregates`**: 7-day rolling metrics computing usage minutes, previous week usage, and `usage_change_percent`.
3. **`support_aggregates`**: Windowed metrics tracking ticket frequency, unresolved cases, and negative sentiment.
4. **`customer_360`**: Bounded temporal join enriching the operational customer dimension with pre-aggregated metrics.
5. **`churn_scoring`**: Deterministic formula calculating the 0-100 score.
6. **`risk_transitions`**: Emits an event **only** when risk level changes (e.g., LOW -> CRITICAL) or $|\Delta| \ge 10$ points.

## 4. Transition-Driven AI Invocation & Cost Guard

Rather than invoking Claude on every micro-event (which causes noise and excessive cost), Claude is invoked **strictly upon state transitions**.

- Deduplication Key: `customer_id + risk_transition_id + policy_version`
- Dedup Metric: `ai_calls_avoided_by_dedup` (tracked in real-time on the Observability dashboard).

## 5. Security Action Gate & Fail-Safe Fallback

- **Action Gate**: Apache Flink and Claude propose interventions; the Node.js API acts as the final authorization gate and executes external mutations (e.g., CRM updates, Slack alerts, or email webhooks).
- **Fail-Safe Fallback**: If Claude times out or returns HTTP 429, the system triggers `generateFallbackIntervention` (`ESCALATE_TO_HUMAN`). Churn incidents are **never** silently dropped due to LLM provider downtime.
