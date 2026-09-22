# PulseGuard AI — Real-Time Customer Retention & Personalization Agent

[![Confluent Cloud](https://img.shields.io/badge/Confluent%20Cloud-Kafka%20%7C%20Flink%20%7C%20SR-0052CC?logo=apache-kafka)](https://confluent.cloud)
[![Apache Flink](https://img.shields.io/badge/Apache%20Flink-Stream%20Processing-E6526F?logo=apache-flink)](https://flink.apache.org)
[![Anthropic Claude](https://img.shields.io/badge/AI%20Inference-Claude%203.5%20Sonnet-D97706?logo=anthropic)](https://www.anthropic.com)
[![Debezium CDC](https://img.shields.io/badge/PostgreSQL-CDC%20Source%20V2-336791?logo=postgresql)](https://docs.confluent.io/cloud/current/connectors/cc-postgresql-cdc-source-v2-debezium/cc-postgresql-cdc-source-v2-debezium.html)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> Built for the **Confluent AI-Focused Hackathon**.  
> PulseGuard AI is **NOT** a chatbot. It is a production-grade, event-driven streaming intelligence platform that continuously observes customer behavior, detects churn risk in sub-seconds to seconds, synthesizes personalized interventions with Claude AI, and executes governed retention workflows through a human-in-the-loop authorization gate.

---

## 1. The Core Product Concept & Story

> *"Imagine a customer who has used your SaaS product every day for months.*  
> *Their usage suddenly drops by 60%.*  
> *At the same time, they open an urgent support ticket.*  
> *Their annual contract renewal is eight days away.*  
> *Traditional analytics discovers this tomorrow during batch reporting.*  
> ***PulseGuard AI identifies the risk as the events arrive.***  
> *Flink combines the streams.*  
> *The deterministic risk engine scores the situation.*  
> *Claude AI interprets root causes and proposes an intervention.*  
> *The policy engine enforces guardrails and requests executive sign-off.*  
> *The customer receives a targeted, high-touch resolution before churn occurs."*

---

## 2. The Three Layers of Intelligence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. APACHE FLINK: "What is happening?"                                       │
│    - Normalization of Debezium CDC change events                            │
│    - Decomposed rolling aggregations (order, usage, support metrics)        │
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

---

## 3. End-to-End System Architecture

```
                                      LIVE INPUT STREAMS
   ┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
   │    PostgreSQL Database    │  │     Product Telemetry     │  │      Zendesk Support      │
   │ (Customers/Subscriptions) │  │  (Usage/Logins/Cancell.)  │  │   (Tickets/Audits/CSAT)   │
   └─────────────┬─────────────┘  └─────────────┬─────────────┘  └─────────────┬─────────────┘
                 │ (Logical Rep)                │ (HTTP / Kafka)               │ (Polling 15s)
                 ▼                              ▼                              ▼
      [PostgreSQL CDC V2]            [Direct Kafka Producer]         [Zendesk Source Conn.]
                 │                              │                              │
                 └──────────────────────┬───────┴──────────────────────────────┘
                                        ▼
    =======================================================================================
                                 CONFLUENT KAFKA CLUSTER
      Topics: pulseguard.cdc.* | pulseguard.product.events | pulseguard.zendesk.tickets
    =======================================================================================
                                        │
                                        ▼
    =======================================================================================
                             CONFLUENT CLOUD FOR APACHE FLINK
      Stage 1: Normalization (JSON_SR unwrapping & timestamp alignment)
      Stage 2: Decomposed Aggregations (Order, Usage, Support metrics)
      Stage 3: Customer 360 Dimension Join (Bounded temporal join)
      Stage 4: AI Sentiment Inference (AI_SENTIMENT / Perception AI)
      Stage 5: Deterministic Churn Scoring (0-100 Score & explainable breakdown)
      Stage 6: Risk Transition Detector (Emits only on level changes or Δ >= 10)
      Stage 7: Claude AI Intervention Inference (Structured retention reasoning)
    =======================================================================================
                                        │
                                        ▼
    =======================================================================================
                         GOVERNED ACTION STREAM & KAFKA TOPICS
      pulseguard.customer.risk             pulseguard.customer.risk.transitions
      pulseguard.customer.interventions.proposed    pulseguard.customer.audit
    =======================================================================================
                                        │
                                        ▼
    =======================================================================================
                        NODE.JS BACKEND & AUTHORIZATION GATEWAY
      - Shared Domain Rules (@pulseguard/domain)
      - Idempotency & Deduplication Filter (customer_id + transition_id + policy_version)
      - Deterministic Policy Guardrails (Discount caps, VIP human approval triggers)
      - Fail-Safe Fallback (If Claude times out/429 -> ESCALATE_TO_HUMAN)
      - Truthful Probing Health Checks (Kafka, Schema Registry, Claude, Connectors)
      - Persistent Read Model & Real-time Server-Sent Events (SSE) Stream
    =======================================================================================
                           │                                          │
                  (SSE / REST)                                 (Authorized Webhook)
                           ▼                                          ▼
    ====================================================   ================================
             REACT ENTERPRISE CONTROL CENTER                     EXTERNAL ACTION LAYER
      - Truthful Live Component Health Status Bar           - Proactive Executive Email
      - 6 Interactive Live Telemetry Buttons for Judges     - CRM / Zendesk Ticket Escalation
      - Master Churn Scenario Walkthrough Progress Modal    - Slack VIP Customer Channel
      - Risk Matrix & MRR Exposed Analytics                 - PagerDuty On-Call Alert
      - Customer 360 & Transparent Explainability Drawer
      - Governed Intervention Decision Cards (Approve/Reject)
      - Confluent Schema Registry & LIVE Stream Lineage
    ====================================================   ================================
```

---

## 4. Latency Classes

| Latency Class | Stream Origin | Delivery Profile | Typical Latency |
|---|---|---|---|
| **Fast Path** | Product Telemetry / In-App Usage Events | Direct Kafka Producer | **< 1 Second** |
| **Operational Path** | PostgreSQL Database (Customers, Orders) | PostgreSQL CDC Source V2 (Debezium) | **1–3 Seconds** |
| **Support Path** | Zendesk Customer Support Tickets | Managed Zendesk Source Connector | **15–30 Seconds** (`request.interval.ms = 15000`) |

---

## 5. Technology Stack

- **Streaming & Infrastructure**: Confluent Cloud Kafka, Confluent Cloud for Apache Flink (Flink SQL), PostgreSQL CDC Source V2 (Debezium), Zendesk Source Connector, Datagen Source Connector.
- **Data Governance**: Confluent Schema Registry (JSON_SR contracts), Stream Catalog Business Metadata (`PII`, `FINANCIAL`, `SENSITIVE`, `PUBLIC`), Live Stream Lineage.
- **AI & Reasoning**: Anthropic Claude 3.5 Sonnet (`AI_COMPLETE`), Fail-Safe Deterministic Fallback Generator.
- **Shared Domain Layer**: Pure TypeScript shared package (`@pulseguard/domain`) enforcing scoring formulas, weights, and policy rules identically across live and demo modes.
- **Backend API & Action Gate**: Node.js, Express, TypeScript, KafkaJS, Zod, Helmet, CORS, Server-Sent Events (SSE).
- **Frontend Control Center**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.

---

## 6. Repository Layout

```
pulseguard-ai/
├── packages/
│   └── domain/                          # Single source of truth for scoring & rules
│       └── src/
│           ├── event-types.ts           # Customer, Order, Telemetry, Ticket events
│           ├── risk-model.ts            # Scoring weights, formulas, bounds (0-100)
│           ├── risk-reasons.ts          # Explainable reason generators
│           ├── risk-transitions.ts      # Transition detection logic
│           ├── policies.ts              # Governance rules, discount limits, approval triggers
│           └── intervention-schema.ts   # Zod & JSON schemas with idempotency keys
│
├── apps/
│   ├── web/                             # React 18 + Vite + Tailwind Control Center
│   └── api/                             # Node.js + Express + Kafka Consumer + Action Gate
│
├── streaming/
│   ├── schemas/                         # Confluent Schema Registry JSON_SR files
│   │   ├── customer.json
│   │   ├── order.json
│   │   ├── product_event.json
│   │   ├── support_ticket.json
│   │   ├── customer_risk.json
│   │   ├── customer_risk_transition.json
│   │   ├── intervention_proposed.json
│   │   └── customer_audit.json
│   │
│   ├── flink/                           # Decomposed 9-stage Flink SQL topology
│   │   ├── 01_sources.sql               # Debezium CDC and Telemetry tables
│   │   ├── 02_normalization.sql         # JSON_SR unwrapping & typed views
│   │   ├── 03_aggregates.sql            # Decomposed order/usage/support windowed metrics
│   │   ├── 04_customer_360.sql          # Dimension enrichment & metric joining
│   │   ├── 05_sentiment_inference.sql   # AI_SENTIMENT model call
│   │   ├── 06_churn_scoring.sql         # 0-100 deterministic scoring
│   │   ├── 07_risk_transitions.sql      # Threshold change & delta >= 10 detection
│   │   ├── 08_ai_intervention.sql       # Claude AI_COMPLETE structured generation
│   │   └── 09_sink_streams.sql          # Output sinks to derived Kafka topics
│   │
│   └── topics.md                        # Partitioning, retention & cleanup policies
│
├── connectors/
│   ├── postgres-cdc/                    # PostgresCdcSourceV2 configuration & RDS guide
│   ├── zendesk/                         # Confluent Managed Zendesk configuration
│   └── datagen/                         # Fallback activity generator
│
├── database/
│   ├── schema.sql                       # Operational schema + CDC publication
│   ├── seed.sql                         # 105 realistic customers across 4 segments
│   └── simulator/                       # State-machine churn scenarios
│
├── scripts/
│   ├── setup-topics.ts                  # Kafka topic provisioning via Admin API
│   ├── test-golden-path.ts              # 12-Gate Golden Path verification test
│   ├── trigger-churn-scenario.ts        # CLI churn scenario runner
│   ├── health-check.ts                  # Comprehensive diagnostic script
│   └── governance/                      # Stream Catalog tag creation & field tagging
│
├── docs/
│   ├── architecture.md
│   ├── confluent-setup.md
│   ├── flink-setup.md
│   ├── governance.md
│   ├── demo-script.md                   # 3-5 minute live hackathon presentation script
│   └── troubleshooting.md
│
├── .env.example
├── docker-compose.yml                   # Local PostgreSQL with logical replication
└── package.json                         # npm workspaces
```

---

## 7. Golden Path Acceptance Test (Verified)

PulseGuard AI enforces an automated 12-gate acceptance test proving the critical streaming slice from source event to governed side-effect:

```bash
npm run test:golden-path
```

**Output:**
```
===============================================================
  PULSEGUARD AI — GOLDEN PATH VERTICAL SLICE ACCEPTANCE TEST
===============================================================

✅ GATE 1 PASSED: Customer 1017 initial state is healthy (Score: 17, Level: LOW)
[Stream] Ingesting Fast Path product telemetry event: usage drop -62%...
✅ GATE 2 PASSED: Fast Path usage collapse registered in rolling aggregates
[Stream] Ingesting Operational Path CDC change: order inactivity 36 days...
✅ GATE 3 PASSED: Operational CDC order inactivity registered
[Stream] Ingesting Support Path Zendesk ticket with URGENT_NEGATIVE sentiment...
✅ GATE 4 PASSED: Support Path ticket and sentiment classification ingested
✅ GATE 5 PASSED: Deterministic Flink risk score recalculated: 87/100 (CRITICAL)
✅ GATE 6 PASSED: Explainable point breakdown verified (6 itemized factors)
✅ GATE 7 PASSED: Risk transition detected (LOW -> CRITICAL, requires_ai_intervention = true)
✅ GATE 8 PASSED: Claude AI formulated structured retention intervention (Action: PRIORITY_TECHNICAL_RESOLUTION)
✅ GATE 9 PASSED: Policy Engine enforced mandatory human approval (Policy: ENTERPRISE_VIP_ESCALATION)
[Action Gate] Authorizing intervention with human-in-the-loop approval...
✅ GATE 10 PASSED: Intervention authorized and transitioned to EXECUTED state
✅ GATE 11 PASSED: Immutable audit record written: [HUMAN] INTERVENTION_EXECUTED
✅ GATE 12 PASSED: MRR Exposed metrics actively updated ($15,050)

===============================================================
  🎯 MILESTONE 0 GOLDEN PATH ACCEPTANCE TEST: ALL 12 GATES PASSED!
===============================================================
```

---

## 8. Getting Started (One-Command Launch)

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+
- Docker & Docker Compose (optional, for local CDC PostgreSQL container)

### Step 1: Install Dependencies
```bash
npm install
npm run build:domain
```

### Step 2: Configure Environment (Optional)
```bash
cp .env.example .env
```
*(If Confluent Cloud credentials are not supplied, the application automatically runs in High-Fidelity Streaming Simulator mode with truthful health reporting!)*

### Step 3: Launch Backend & Frontend
In separate terminals or concurrent command:

**Terminal 1 (Backend API & SSE Engine):**
```bash
npm run dev:api
```
*(Runs on `http://localhost:4000`)*

**Terminal 2 (React Enterprise Control Center):**
```bash
npm run dev:web
```
*(Runs on `http://localhost:5173`)*

---

## 9. Hackathon Demo Centerpiece

1. Open `http://localhost:5173` in your browser.
2. Verify all **Status Pills** in the header: Confluent Kafka, Apache Flink, Schema Registry, Claude AI, and Connectors.
3. Click the prominent gradient button: **`RUN CHURN SCENARIO`**.
4. Observe the live pipeline:
   - Event appears in the **Live Event Feed** with latency class badges.
   - Customer 1017 churn score recalculates from **14 (LOW) → 87 (CRITICAL)**.
   - Claude AI synthesizes a personalized executive retention briefing.
   - Governed Policy Engine marks the action as **AWAITING HUMAN APPROVAL**.
   - Click **`Approve & Execute`** in the Interventions queue.
   - An immutable audit trail record is generated.
5. Click **View 360** on Customer 1017:
   - Inspect the **Point-by-Point Explainability Breakdown Drawer**.
   - Inspect the rolling telemetry variance and time-series risk chart.
6. Test the **Interactive 6-Button Console** (Usage Drop, Support Ticket, Order Inactivity, Payment Failure, Renewal Alert, Customer Rebound).

---

## 10. License

Apache License 2.0. Built for the Confluent AI Hackathon.
