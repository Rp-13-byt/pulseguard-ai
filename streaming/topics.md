# Confluent Kafka Topic Topology & Specifications

PulseGuard AI organizes its streaming infrastructure into clear raw, normalized, and derived topic tiers.

| Topic Name | Producer | Consumers | Schema (JSON_SR) | Partitioning Key | Retention |
|---|---|---|---|---|---|
| `pulseguard.cdc.public.customers` | Postgres CDC V2 | Flink SQL | `customer.json` | `customer_id` | 7 Days |
| `pulseguard.cdc.public.orders` | Postgres CDC V2 | Flink SQL | `order.json` | `customer_id` | 7 Days |
| `pulseguard.cdc.public.product_events` | Postgres CDC V2 | Flink SQL | `product_event.json` | `customer_id` | 3 Days |
| `pulseguard.cdc.public.subscriptions` | Postgres CDC V2 | Flink SQL | Internal JSON | `customer_id` | 30 Days |
| `pulseguard.product.events` | Web/API Telemetry | Flink SQL, SSE | `product_event.json` | `customer_id` | 3 Days |
| `pulseguard.zendesk.tickets` | Zendesk Source | Flink SQL | `support_ticket.json` | `customer_id` | 14 Days |
| `pulseguard.customer.signals` | Flink Normalization | Flink Aggregations | Internal JSON | `customer_id` | 3 Days |
| `pulseguard.customer.360` | Flink Aggregations | Scoring Engine | Internal JSON | `customer_id` | Compacted |
| `pulseguard.customer.risk` | Flink Scoring | API Read Model | `customer_risk.json` | `customer_id` | 14 Days |
| `pulseguard.customer.risk.transitions` | Flink Transition Detector | Claude AI / Fallback | `customer_risk_transition.json` | `customer_id` | 30 Days |
| `pulseguard.customer.interventions.proposed` | Claude AI / Policy | Node Action Gate | `intervention_proposed.json` | `customer_id` | 30 Days |
| `pulseguard.customer.audit` | Action Gate / API | Compliance / UI | `customer_audit.json` | `customer_id` | 365 Days |
| `pulseguard.system.metrics` | API / Flink / Monitors | Observability UI | Internal JSON | `metric_type` | 1 Day |
| `pulseguard.demo.activity` | Datagen Connector | Test Consumers | Internal JSON | `session_id` | 1 Day |
