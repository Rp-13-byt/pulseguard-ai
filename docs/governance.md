# Stream Governance, Schema Registry & Stream Lineage

PulseGuard AI puts Stream Governance at the core of its architecture rather than treating it as an afterthought.

## 1. Confluent Stream Governance Packages

- **Stream Governance Essentials** (Active by default):
  - Centralized Schema Registry for all Kafka topics.
  - JSON Schema compatibility enforcement (`BACKWARD` and `FULL`).
  - Business Metadata tags (`PII`, `FINANCIAL`, `SENSITIVE`, `PUBLIC`).
  - **Live Stream Lineage**: Real-time visual tracking of data flowing through connectors, Kafka topics, and Flink queries within a 10-minute rolling window.
- **Stream Governance Advanced** (Optional upgrade):
  - Historical Stream Lineage beyond 10 minutes.
  - Declarative Data Contracts and quality assertion rules.

## 2. Classification Tags & Automated Masking

Tags are provisioned via `scripts/governance/create-tags.ts` and applied via `scripts/governance/tag-fields.ts`:

| Entity Field | Classification | Action Gate Policy |
|---|---|---|
| `customer.email` | `PII` | Redacted in external webhook payloads (`s***@acmeglobal.com`) |
| `customer.first_name` | `PII` | Restricted from unauthorized third-party sinks |
| `customer.monthly_value` | `FINANCIAL` | Governs discount ceilings (Max 20% for Enterprise, 15% for Pro) |
| `orders.amount` | `FINANCIAL` | Governs monetary thresholds |
| `support_ticket.message` | `SENSITIVE` | Monitored for sentiment perception |

## 3. Registering Tags via CLI

```bash
npx ts-node scripts/governance/create-tags.ts
npx ts-node scripts/governance/tag-fields.ts
```
