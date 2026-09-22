# Confluent Stream Governance & Catalog Guide

This directory manages Stream Catalog tags and field-level classifications for PulseGuard AI.

## Confluent Stream Governance Package Alignment

| Feature | Stream Governance Essentials | Stream Governance Advanced |
|---|---|---|
| Centralized Schema Registry | Included | Included |
| Schema Compatibility Rules (BACKWARD, FULL) | Included | Included |
| Business Metadata & Tags (PII, Financial) | Included | Included |
| Stream Lineage History | Last 10 Minutes (Live Lineage) | Historical Lineage (Extended Retention) |
| Field-Level Data Contracts & Quality Rules | Not Included | Included |

> [!NOTE]
> PulseGuard AI UI specifically labels the visual graph as **LIVE STREAM LINEAGE** to reflect standard Stream Governance Essentials capability.
