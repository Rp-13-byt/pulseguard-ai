# PostgreSQL CDC Source V2 (Debezium) Connector

This directory contains the production configuration and deployment guide for the **PostgreSQL CDC Source V2 (Debezium)** connector on Confluent Cloud (`PostgresCdcSourceV2`).

> [!NOTE]
> Confluent has designated PostgreSQL CDC V1 as End-of-Life (EOL). PulseGuard AI uses **PostgreSQL CDC Source V2**, which provides improved snapshotting, schema evolution handling, and exactly-once processing.

## 1. Cloud PostgreSQL Prerequisites

Confluent Cloud connectors require public network reachability or a Confluent Transit Gateway / Dedicated VPC peering connection.

### AWS RDS PostgreSQL Configuration
1. Set the DB parameter group parameter:
   ```ini
   rds.logical_replication = 1
   ```
2. Reboot the RDS instance to apply the change.
3. Verify logical replication is active:
   ```sql
   SHOW wal_level; -- Must return 'logical'
   ```

## 2. Database User & Permissions Setup

Connect to `retentiondb` as a superuser/admin and run:

```sql
-- 1. Create connector user
CREATE USER confluent_cdc WITH PASSWORD 'YOUR_STRONG_PASSWORD';

-- 2. Grant connection and schema privileges
GRANT CONNECT ON DATABASE retentiondb TO confluent_cdc;
GRANT USAGE ON SCHEMA public TO confluent_cdc;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO confluent_cdc;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO confluent_cdc;

-- Ensure future tables grant access automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO confluent_cdc;

-- 3. Grant replication permissions
ALTER USER confluent_cdc REPLICATION;

-- 4. Create Publication for captured tables
CREATE PUBLICATION retention_publication FOR TABLE 
    public.customers, 
    public.orders, 
    public.product_events, 
    public.subscriptions;
```

## 3. Confluent Cloud Connector Provisioning

1. In Confluent Cloud, navigate to **Connectors** -> **Add Connector** -> **PostgreSQL CDC Source V2 (Debezium)**.
2. Select connector plugin: `PostgresCdcSourceV2`.
3. Set **Topic prefix**: `pulseguard.cdc`
4. Set **Slot name**: `pulseguard_slot`
5. Set **Publication name**: `retention_publication`
6. Set **Table include list**: `public.customers,public.orders,public.product_events,public.subscriptions`
7. Set **Snapshot mode**: `initial` (captures existing seed records, then streams live mutations).
8. Set **Output record value format**: `JSON_SR` (registers schemas into Confluent Schema Registry).

## 4. Verification

After launching the connector, observe the status change to `RUNNING`.
In Confluent Cloud Topics, verify topics:
- `pulseguard.cdc.public.customers`
- `pulseguard.cdc.public.orders`
- `pulseguard.cdc.public.product_events`
- `pulseguard.cdc.public.subscriptions`
