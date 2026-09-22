# Confluent Cloud Apache Flink Deployment Guide

This guide details deploying the 9-stage Flink SQL stream processing topology in Confluent Cloud.

## 1. Create a Flink Compute Pool

1. In Confluent Cloud, navigate to your environment (`env-pulseguard-ai`).
2. Select **Flink** -> **Create Compute Pool**.
3. Choose Cloud Provider and Region matching your Kafka cluster.
4. Set Compute Pool Capacity: **5 to 10 CFUs** (Confluent Flink Units).
5. Open the **Flink SQL Workspace**.

## 2. Deploy Flink SQL Scripts in Sequence

Execute the SQL scripts located in `streaming/flink/` in the following order:

1. **`01_sources.sql`**: Registers external Kafka source tables with JSON_SR deserialization and event-time watermarks.
2. **`02_normalization.sql`**: Unwraps Debezium CDC records, discarding deletes and extracting typed `after` envelopes.
3. **`03_aggregates.sql`**: Creates bounded rolling aggregations (`v_order_aggregates`, `v_usage_aggregates`, `v_support_aggregates`) independently to prevent state explosion.
4. **`04_customer_360.sql`**: Enriches customer operational profiles with rolling metrics.
5. **`05_sentiment_inference.sql`**: Registers AI sentiment model connection for ticket perception.
6. **`06_churn_scoring.sql`**: Implements the deterministic 0-100 scoring engine with transparent point breakdown.
7. **`07_risk_transitions.sql`**: Detects state transitions (e.g. entering HIGH/CRITICAL or $|\Delta| \ge 10$) and emits to `pulseguard.customer.risk.transitions`.
8. **`08_ai_intervention.sql`**: Invokes Claude AI via `AI_COMPLETE` on transition events to formulate structured retention recommendations.
9. **`09_sink_streams.sql`**: Materializes outputs back into Confluent Kafka derived topics (`sink_customer_risk`, `sink_risk_transitions`, `sink_interventions_proposed`).
