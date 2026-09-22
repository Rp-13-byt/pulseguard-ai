# Confluent Cloud Setup Guide — Step-by-Step

This guide provides the exact instructions to provision the PulseGuard AI streaming pipeline on Confluent Cloud.

## 1. Confluent Cloud Environment & Cluster

1. Log in to [Confluent Cloud](https://confluent.cloud/).
2. Create an Environment: `env-pulseguard-ai`.
3. Enable **Stream Governance Essentials** (provides Schema Registry, Business Metadata tags, and 10-minute live Stream Lineage).
4. Create a Kafka Cluster:
   - Type: **Standard** (or Basic for quick hackathon testing).
   - Provider: AWS or GCP.
   - Region: Choose the region closest to your cloud database.
5. Create a Service Account:
   - Name: `sa-pulseguard-connectors`.
   - Assign Role: `CloudClusterAdmin` or granular topic creation/read/write permissions.
   - Generate an API Key and Secret for this Service Account.

## 2. Topic Provisioning

Run the automated topic provisioning script from the repository root:

```bash
npm run setup:topics
```

Or provision manually in the Confluent Cloud Console matching `streaming/topics.md`:
- `pulseguard.cdc.public.customers` (Partitions: 3, Cleanup: compact)
- `pulseguard.cdc.public.orders` (Partitions: 3, Retention: 7 days)
- `pulseguard.cdc.public.product_events` (Partitions: 6, Retention: 3 days)
- `pulseguard.product.events` (Partitions: 6, Retention: 3 days)
- `pulseguard.zendesk.tickets` (Partitions: 3, Retention: 14 days)
- `pulseguard.customer.risk` (Partitions: 3, Cleanup: compact,delete)
- `pulseguard.customer.risk.transitions` (Partitions: 3, Retention: 30 days)
- `pulseguard.customer.interventions.proposed` (Partitions: 3, Retention: 30 days)
- `pulseguard.customer.audit` (Partitions: 3, Retention: 365 days)

## 3. PostgreSQL CDC Source V2 (Debezium) Connector

1. Go to **Connectors** -> **Add Connector** -> **PostgreSQL CDC Source V2 (Debezium)**.
2. Plug-in Name: `PostgresCdcSourceV2`.
3. Fill connection parameters:
   - **Hostname**: Your cloud PostgreSQL host (e.g. AWS RDS).
   - **Port**: 5432
   - **User**: `confluent_cdc`
   - **Password**: Your connector password.
   - **Database Name**: `retentiondb`
   - **SSL Mode**: `require`
4. Set CDC Settings:
   - **Topic prefix**: `pulseguard.cdc`
   - **Slot name**: `pulseguard_slot`
   - **Publication name**: `retention_publication`
   - **Table include list**: `public.customers,public.orders,public.product_events,public.subscriptions`
   - **Snapshot mode**: `initial`
   - **Output record value format**: `JSON_SR` (registers schemas into Schema Registry).
5. Launch connector and verify status is `RUNNING`.

## 4. Zendesk Source Connector (Optional / Near-Real-Time)

1. Go to **Connectors** -> **Add Connector** -> **Zendesk Source**.
2. Set URL: `https://<YOUR-SUBDOMAIN>.zendesk.com`.
3. Set Auth: Basic with `<YOUR-EMAIL>/token` and API token.
4. Set Tables: `tickets,ticket_audits,users,organizations`.
5. Set Topic pattern: `pulseguard.zendesk.${entityName}`.
6. Set Output format: `JSON_SR`.
7. Set Polling interval: `request.interval.ms = 15000` (15s polling).
