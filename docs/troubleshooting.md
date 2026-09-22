# Troubleshooting & Diagnostic Guide

## 1. PostgreSQL CDC V2 Connector Troubleshooting

### Issue: Replication slot creation failure
- **Cause**: Logical replication not enabled on PostgreSQL host.
- **Fix**: Verify `SHOW wal_level;` returns `logical`. On AWS RDS, ensure DB parameter `rds.logical_replication = 1` and reboot the instance.

### Issue: Permission denied for relation
- **Cause**: Connector user lacks select privileges.
- **Fix**: Run:
  ```sql
  GRANT USAGE ON SCHEMA public TO confluent_cdc;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO confluent_cdc;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO confluent_cdc;
  ```

## 2. Flink Join State & Memory Management

### Issue: State explosion in multi-stream joins
- **Cause**: Joining unbounded continuous streams directly without windows or temporal semantics.
- **Fix**: PulseGuard AI uses decomposed bounded rolling aggregations (`v_order_aggregates`, `v_usage_aggregates`, `v_support_aggregates`) grouped by `customer_id` before joining with `v_customers_normalized`.

## 3. Anthropic Claude AI Rate Limits (HTTP 429)

### Issue: Claude returns 429 Too Many Requests
- **Resolution**: PulseGuard AI automatically catches 429 errors and invokes `generateFallbackIntervention` (`ESCALATE_TO_HUMAN`). The deterministic score breakdown is retained, human approval is enforced, and the incident is never lost.
