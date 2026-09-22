# PulseGuard AI — 3 to 5 Minute Hackathon Presentation Script

## Introduction (0:00 – 0:45)
"Judges, traditional customer analytics relies on batch queries running at 2 AM. By the time an analyst discovers that a high-value customer is unhappy, they've already cancelled their subscription.

PulseGuard AI is built from the ground up on Confluent Cloud and Apache Flink to react to behavioral signals in seconds:
- **Fast Path (<1s)**: Real-time product telemetry and in-app events.
- **Operational Path (1-3s)**: PostgreSQL CDC V2 capturing database updates.
- **Support Path (15-30s)**: Zendesk connector polling customer support tickets.

Notice our Status Bar: Every component from Kafka, Flink, Schema Registry, to Claude AI runs with truthful active health checks."

---

## Part 1: Baseline Healthy State (0:45 – 1:30)
"Let's look at Customer 1017: Acme Global.
- Contract: Enterprise Tier ($3,450/month MRR).
- Renewal Date: 8 days from now.
- Current Churn Risk: **14 / 100 (LOW)**.
- Notice that our system is NOT spamming LLM calls. Flink handles continuous stream aggregation, keeping AI costs predictable."

---

## Part 2: Triggering The Live Event Stream (1:30 – 2:45)
"Now, let's trigger our live churn scenario.
*(Click the prominent 'RUN CHURN SCENARIO' button or use any of the 6 interactive live buttons)*.

Observe what happens across the pipeline in real time:
1. **Source Event**: Acme Global's product usage drops by 62% on the fast telemetry path.
2. **Operational CDC**: PostgreSQL captures 35 days without an order.
3. **Zendesk Ticket**: An urgent negative support ticket arrives reporting pipeline timeouts.
4. **Apache Flink**: Recalculates the deterministic score: **14 jumps to 87 (CRITICAL)**.
   *(Click 'View Point Breakdown' on the Customer 360 page)*:
   Show the judges the exact itemized points: `+25 Usage Drop`, `+20 Inactivity`, `+20 Negative Sentiment`, `+15 Unresolved Tickets`, `+10 Renewal Near`, `+10 Enterprise Tier`.
5. **State Transition**: Because risk transitioned into CRITICAL, Flink emits a transition event to `pulseguard.customer.risk.transitions`.
6. **Claude AI Inference**: Claude analyzes the full customer context and synthesizes a targeted, high-touch executive intervention."

---

## Part 3: The Governed Action Gate (2:45 – 3:45)
"*(Navigate to 'Intervention Decisions' tab)*.
Notice what happened:
- Claude recommended an executive briefing with an engineer.
- But Claude did NOT send the email directly.
- Our **Governed Policy Engine** evaluated the proposal: Because Acme Global is an Enterprise VIP account in CRITICAL risk, **Mandatory Human Approval** was enforced.
- Let's click **'Approve & Execute'**.
- Instantly, the intervention transitions to EXECUTED, dispatches the authorized CRM/Slack webhook, and writes an immutable record to the audit trail."

---

## Part 4: Governance & Observability (3:45 – 4:30)
"*(Navigate to 'Stream Governance' tab)*:
- Show the **LIVE STREAM LINEAGE** graph from PostgreSQL CDC to Kafka, Flink, and the Action Gate.
- Show Confluent Schema Registry contracts with field-level tags: `email` tagged with `PII`, `monthly_value` tagged with `FINANCIAL`.
- *(Navigate to 'Observability' tab)*:
- Point out the key enterprise metric: **'AI calls avoided by trigger deduplication' (94 calls avoided)**. This proves our architecture is production-ready, cost-effective, and scalable."

---

## Conclusion (4:30 – 5:00)
"To summarize:
- **Flink answers**: *'What is happening?'*
- **Claude AI answers**: *'Why does it matter and what should we do?'*
- **Governed Policy Engine enforces**: *'Are we allowed to do it?'*

PulseGuard AI puts Confluent Cloud at the core of real-time customer retention. Thank you!"
