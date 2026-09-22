# Complete Step-by-Step Guide: Connecting Confluent Connectors for PulseGuard AI

This document provides a click-by-click, production-grade guide to setting up and connecting all managed connectors in **Confluent Cloud** for **PulseGuard AI**:

1. **PostgreSQL CDC Source V2 (Debezium)** (`PostgresCdcSourceV2`) — *The Operational Path*
2. **Zendesk Source Connector** (`ZendeskSource`) — *The Support Path*
3. **Datagen Source Connector** (`DatagenSource`) — *The Fallback Activity Path*

---

## Phase 1: Confluent Cloud Foundation Setup

Before launching connectors, your Confluent Cloud environment must have **Schema Registry** and a **Dedicated Service Account**.

### Step 1.1: Create Environment & Kafka Cluster
1. Log in to [Confluent Cloud](https://confluent.cloud/).
2. Click **Environments** -> **Add environment**. Name it: `env-pulseguard-ai`.
3. Under **Stream Governance**, ensure **Essentials** is enabled (provides Schema Registry, Business Metadata tags, and 10-minute live Stream Lineage).
4. Inside the environment, click **Create cluster**:
   - Cluster Type: **Standard** (multi-zone, supports managed connectors).
   - Cloud Provider: **AWS** or **GCP** (select the region closest to your cloud database).
   - Cluster Name: `pulseguard-kafka-cluster`.

### Step 1.2: Create Connector Service Account
Confluent's security documentation recommends using dedicated service accounts instead of personal user keys:
1. In the top navigation, click the **Settings icon (gear)** -> **Access management** -> **Service accounts**.
2. Click **Add service account**. Name it: `sa-pulseguard-connectors`.
3. In your Kafka cluster, navigate to **Cluster Overview** -> **API Keys** -> **Add key**.
4. Select **Service account** -> pick `sa-pulseguard-connectors` -> **Generate Key**.
5. **Save these credentials securely**:
   - `KAFKA_API_KEY`
   - `KAFKA_API_SECRET`
6. Assign Cluster Role: Give `sa-pulseguard-connectors` the **CloudClusterAdmin** role or granular Read/Write access on topic prefix `pulseguard.*`.

---

## Phase 2: Connector 1 — PostgreSQL CDC Source V2 (Debezium)

Confluent has deprecated V1. You must use **PostgreSQL CDC Source V2 (Debezium)**.

### Step 2.1: Prepare Your Cloud PostgreSQL Database
Confluent's managed connector cannot connect to `localhost` or `127.0.0.1`. Use a cloud PostgreSQL instance with public accessibility or VPC peering (e.g., AWS RDS, Supabase, Neon, or GCP Cloud SQL).

#### A. Enable Logical Replication
- **On AWS RDS PostgreSQL**:
  1. Open RDS Console -> **Parameter Groups**.
  2. Edit or create a custom parameter group.
  3. Set `rds.logical_replication = 1`.
  4. Associate the parameter group with your DB instance and **Reboot** the database.
- **On Supabase / Neon / Self-Hosted Cloud VM**:
  Ensure PostgreSQL configuration has:
  ```ini
  wal_level = logical
  max_replication_slots = 5
  max_wal_senders = 5
  ```
- **Verify**: Connect via `psql` or pgAdmin and run:
  ```sql
  SHOW wal_level; -- Must return 'logical'
  ```

#### B. Initialize Database Schema & Seed Data
Execute the PulseGuard SQL files in your PostgreSQL database (`retentiondb`):
```bash
# Using psql:
psql -h <YOUR_POSTGRES_HOST> -U postgres -d retentiondb -f database/schema.sql
psql -h <YOUR_POSTGRES_HOST> -U postgres -d retentiondb -f database/seed.sql
```

#### C. Create Connector User & Replication Privileges
Run this SQL script on your PostgreSQL database:
```sql
-- 1. Create connector user
CREATE USER confluent_cdc WITH PASSWORD 'YOUR_STRONG_CDC_PASSWORD';

-- 2. Grant connection and usage privileges
GRANT CONNECT ON DATABASE retentiondb TO confluent_cdc;
GRANT USAGE ON SCHEMA public TO confluent_cdc;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO confluent_cdc;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO confluent_cdc;

-- Ensure future tables grant select automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO confluent_cdc;

-- 3. Grant replication role
ALTER USER confluent_cdc REPLICATION;

-- 4. Create Publication for Debezium CDC
CREATE PUBLICATION retention_publication FOR TABLE 
    public.customers, 
    public.orders, 
    public.product_events, 
    public.subscriptions;
```

---

### Step 2.2: Launch PostgreSQL CDC V2 in Confluent Cloud Console
1. In Confluent Cloud, go to **Connectors** -> **Add connector**.
2. In the search box, type `PostgreSQL CDC` and select:
   **PostgreSQL CDC Source V2 (Debezium)** (Plugin name: `PostgresCdcSourceV2`).
3. **Kafka Cluster credentials**:
   - Select **Use an existing Service Account** -> pick `sa-pulseguard-connectors`.
4. **Database Connection Details**:
   - **Database Hostname**: `<your-postgres-host>.rds.amazonaws.com` (or cloud IP)
   - **Database Port**: `5432`
   - **Database Username**: `confluent_cdc`
   - **Database Password**: `<YOUR_STRONG_CDC_PASSWORD>`
   - **Database Name**: `retentiondb`
   - **SSL Mode**: `require` (or `prefer` based on your DB provider)
5. **Connector Configuration & Naming**:
   - **Connector Name**: `pulseguard-postgres-cdc`
   - **Topic prefix**: `pulseguard.cdc`
   - **Database server name**: `pulseguard`
   - **Slot name**: `pulseguard_slot`
   - **Publication name**: `retention_publication`
   - **Publication auto-create mode**: `filtered`
   - **Table include list**: `public.customers, public.orders, public.product_events, public.subscriptions`
   - **Snapshot mode**: `initial` *(Crucial: snapshots existing 105 seeded customers, then streams subsequent mutations!)*
6. **Data Format & Schema Registry**:
   - **Output record value format**: `JSON_SR` (registers schemas in Schema Registry).
   - **Output record key format**: `JSON`
   - **Tombstones on delete**: `true`
7. **Sizing & Launch**:
   - Tasks: `1`
   - Review Summary -> Click **Continue / Launch**.

### Step 2.3: Verify CDC Connector
1. Within 1–2 minutes, connector status will change to **RUNNING**.
2. Navigate to **Topics** in Confluent Cloud. You will see new topics created automatically:
   - `pulseguard.cdc.public.customers`
   - `pulseguard.cdc.public.orders`
   - `pulseguard.cdc.public.product_events`
   - `pulseguard.cdc.public.subscriptions`
3. Test a live mutation in PostgreSQL:
   ```sql
   UPDATE customers SET last_login_at = NOW() WHERE customer_id = 1017;
   ```
4. Open topic `pulseguard.cdc.public.customers` in Confluent Cloud -> **Messages tab**. You will immediately see the Debezium envelope showing `op: "u"`, `before`, and `after` state!

---

## Phase 3: Connector 2 — Zendesk Source Connector

The Zendesk connector brings customer support interactions into the streaming pipeline.

### Step 3.1: Generate Zendesk API Token
1. Log in to your Zendesk Admin Center: `https://<YOUR-SUBDOMAIN>.zendesk.com/admin`.
2. In the left sidebar, navigate to **Apps and integrations** -> **Zendesk API**.
3. Under the **Settings** tab, toggle **Token access** to `Active`.
4. Click **Add API token**:
   - Description: `confluent-pulseguard`
   - Copy and securely save the generated token.

### Step 3.2: Launch Zendesk Source in Confluent Cloud Console
1. In Confluent Cloud, go to **Connectors** -> **Add connector** -> search for **Zendesk Source**.
2. **Kafka Cluster credentials**:
   - Select `sa-pulseguard-connectors`.
3. **Zendesk Configuration**:
   - **Zendesk URL**: `https://<YOUR-SUBDOMAIN>.zendesk.com`
   - **Authentication type**: `basic`
   - **Username**: `<your-email>@domain.com/token` *(Note: Append `/token` to indicate API token auth)*
   - **Password**: `<YOUR_ZENDESK_API_TOKEN>`
   - **Tables to ingest**: `tickets,ticket_audits,users,organizations`
   - **Topic name pattern**: `pulseguard.zendesk.${entityName}`
   - **Output record value format**: `JSON_SR`
   - **Request interval (ms)**: `15000` (15-second polling interval — *Support Path*)
4. **Sizing & Launch**:
   - Tasks: `1`
   - Review -> Click **Launch**.

### Step 3.3: Verify Zendesk Ingestion
1. Verify the connector moves to **RUNNING**.
2. Open **Topics** -> inspect `pulseguard.zendesk.tickets`.
3. Create a test ticket in Zendesk. Within 15–30 seconds, the message appears in Kafka with the schema registered in Schema Registry.

---

## Phase 4: Connector 3 — Datagen Source (Demo / Development Fallback)

If Zendesk credentials are not available during local development or offline rehearsal, launch Confluent's managed Datagen connector as an active activity stream.

1. Go to **Connectors** -> **Add connector** -> **Datagen Source**.
2. Name: `pulseguard-datagen`.
3. Select Kafka Topic: `pulseguard.demo.activity`.
4. Quickstart template: `CLICKSTREAM` (or `ORDERS`).
5. Output format: `JSON_SR`.
6. Max interval: `1000` (generates 1 record per second).
7. Tasks: `1` -> Click **Launch**.

---

## Phase 5: Connecting the Connectors to PulseGuard AI

Now that Confluent Cloud is streaming records from the connectors, connect your local PulseGuard AI application.

### Step 5.1: Update `.env` with Confluent Credentials
Open `.env` in the root of your project:

```env
# Confluent Cloud Kafka
CONFLUENT_BOOTSTRAP_SERVER=pkc-xxxx.us-east-1.aws.confluent.cloud:9092
CONFLUENT_KAFKA_API_KEY=YOUR_KAFKA_API_KEY
CONFLUENT_KAFKA_API_SECRET=YOUR_KAFKA_API_SECRET

# Confluent Schema Registry
CONFLUENT_SCHEMA_REGISTRY_URL=https://psrc-xxxx.us-east-1.aws.confluent.cloud
CONFLUENT_SCHEMA_REGISTRY_API_KEY=YOUR_SR_API_KEY
CONFLUENT_SCHEMA_REGISTRY_API_SECRET=YOUR_SR_API_SECRET

# Operational Database
POSTGRES_HOST=your-cloud-postgres-host.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=retentiondb
POSTGRES_USER=confluent_cdc
POSTGRES_PASSWORD=YOUR_STRONG_CDC_PASSWORD
POSTGRES_SSL=true

# Anthropic Claude API (Optional live LLM reasoning)
CLAUDE_API_KEY=sk-ant-api03-...
```

### Step 5.2: Deploy Flink SQL Processing Topology
1. In Confluent Cloud, open your **Flink Compute Pool** -> **SQL Workspace**.
2. Copy and execute each file from `streaming/flink/`:
   - `01_sources.sql` (Creates source tables over `pulseguard.cdc.*` and `pulseguard.zendesk.*`)
   - `02_normalization.sql`
   - `03_aggregates.sql` (Windowed rollups for orders, usage, tickets)
   - `04_customer_360.sql`
   - `06_churn_scoring.sql` (0-100 deterministic risk engine)
   - `07_risk_transitions.sql` (Emits to `pulseguard.customer.risk.transitions`)
   - `08_ai_intervention.sql`
   - `09_sink_streams.sql`

### Step 5.3: Run PulseGuard Diagnostic Probe
Verify that PulseGuard detects the live Confluent Cloud cluster and connectors:

```bash
npm run health-check
```

**Expected Output:**
```
===============================================================
   PULSEGUARD AI — STREAMING PIPELINE HEALTH DIAGNOSTIC
===============================================================

Operating Mode: LIVE_CONFLUENT
Overall Status: CONNECTED

--- COMPONENT PROBE RESULTS ---
🟢 [KAFKA] Status: CONNECTED (24ms)
   Message: Connected to Confluent Cloud. (12 topics detected)
🟢 [SCHEMA_REGISTRY] Status: CONNECTED (38ms)
   Message: Connected to Confluent Schema Registry.
🟢 [FLINK] Status: CONNECTED (12ms)
   Message: Flink SQL stream processing topology active (9 query stages).
🟢 [AI_ENGINE] Status: CONNECTED (48ms)
   Message: Anthropic Claude API connected.
🟢 [CONNECTORS] Status: CONNECTED (8ms)
   Message: PostgreSQL CDC Source V2 (Debezium) and Zendesk Source active.
🟢 [API] Status: CONNECTED (1ms)
   Message: Action Security Gate and SSE Event Bus operational.
```

### Step 5.4: Launch the System
```bash
# Terminal 1: Backend API & Action Gate
npm run dev:api

# Terminal 2: React Control Center
npm run dev:web
```
Open `http://localhost:5173`. All status badges will illuminate as **CONNECTED**, and clicking **RUN CHURN SCENARIO** will trigger real events flowing through your live Confluent connectors!
