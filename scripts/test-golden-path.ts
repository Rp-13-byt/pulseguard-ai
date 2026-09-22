/**
 * MILESTONE 0 — GOLDEN PATH VERTICAL SLICE ACCEPTANCE TEST
 * Verifies the 12 hard gates from source event to governed action execution.
 */

import { readStore } from '../apps/api/src/readmodel/store';
import { StreamSimulator } from '../apps/api/src/services/stream-simulator';
import { approveIntervention } from '../apps/api/src/services/action-gate';
import { classifyRiskLevel } from '@pulseguard/domain';

function assert(condition: boolean, step: number, title: string) {
  if (!condition) {
    console.error(`❌ GATE ${step} FAILED: ${title}`);
    process.exit(1);
  }
  console.log(`✅ GATE ${step} PASSED: ${title}`);
}

async function runGoldenPathAcceptanceTest() {
  console.log('\n===============================================================');
  console.log('  PULSEGUARD AI — GOLDEN PATH VERTICAL SLICE ACCEPTANCE TEST');
  console.log('===============================================================\n');

  // Gate 1: Verify Initial Healthy Customer State
  const initialCust = readStore.getCustomer(1017);
  assert(
    Boolean(initialCust && initialCust.current_risk_score < 25 && initialCust.current_risk_level === 'LOW'),
    1,
    `Customer 1017 initial state is healthy (Score: ${initialCust?.current_risk_score}, Level: ${initialCust?.current_risk_level})`
  );

  // Gate 2: Simulate Telemetry Usage Drop (-62%)
  console.log('\n[Stream] Ingesting Fast Path product telemetry event: usage drop -62%...');
  await StreamSimulator.simulateUsageDrop(1017, -62);
  const afterUsageCust = readStore.getCustomer(1017)!;
  assert(
    afterUsageCust.aggregates.usage_change_percent === -62,
    2,
    'Fast Path usage collapse registered in rolling aggregates'
  );

  // Gate 3: Simulate Operational CDC Inactivity
  console.log('[Stream] Ingesting Operational Path CDC change: order inactivity 36 days...');
  await StreamSimulator.simulateOrderInactivity(1017, 36);
  const afterOrderCust = readStore.getCustomer(1017)!;
  assert(
    afterOrderCust.aggregates.days_since_last_order === 36,
    3,
    'Operational CDC order inactivity registered'
  );

  // Gate 4: Ingest Support Path Zendesk Ticket with Urgent Negative Sentiment
  console.log('[Stream] Ingesting Support Path Zendesk ticket with URGENT_NEGATIVE sentiment...');
  await StreamSimulator.simulateSupportTicket(
    1017,
    'URGENT_NEGATIVE',
    'Critical failure in export pipeline',
    'Core daily export failed 3 times. We are unable to bill clients and our renewal is next week!'
  );
  const afterTicketCust = readStore.getCustomer(1017)!;
  assert(
    afterTicketCust.aggregates.latest_sentiment === 'URGENT_NEGATIVE',
    4,
    'Support Path ticket and sentiment classification ingested'
  );

  // Gate 5: Verify Flink Recalculated Deterministic Risk Score
  const crisisRisk = readStore.getRiskEvent(1017)!;
  assert(
    crisisRisk.risk_score >= 80 && crisisRisk.risk_level === 'CRITICAL',
    5,
    `Deterministic Flink risk score recalculated: ${crisisRisk.risk_score}/100 (${crisisRisk.risk_level})`
  );

  // Gate 6: Verify Explainable Point Breakdown Generated
  assert(
    crisisRisk.breakdown.total_score === crisisRisk.risk_score && crisisRisk.reasons.length >= 5,
    6,
    `Explainable point breakdown verified (${crisisRisk.reasons.length} itemized factors)`
  );

  // Gate 7: Verify Risk Transition Produced
  const transitions = readStore.getTransitions();
  const transition = transitions.find((t) => t.customer_id === 1017);
  assert(
    Boolean(transition && transition.new_level === 'CRITICAL' && transition.requires_ai_intervention === true),
    7,
    `Risk transition detected (LOW -> CRITICAL, requires_ai_intervention = true)`
  );

  // Gate 8: Verify Claude AI Structured Intervention Formulation
  const interventions = readStore.getAllInterventions();
  const proposed = interventions.find((i) => i.customer_id === 1017);
  assert(
    Boolean(proposed && proposed.recommended_action && proposed.idempotency_key),
    8,
    `Claude AI formulated structured retention intervention (Action: ${proposed?.recommended_action})`
  );

  // Gate 9: Verify Policy Enforced Mandatory Human Approval
  assert(
    Boolean(proposed && proposed.requires_human_approval === true && proposed.status === 'PENDING'),
    9,
    `Policy Engine enforced mandatory human approval (Policy: ${proposed?.policy_name})`
  );

  // Gate 10: Human Approves Intervention via Action Gate
  console.log('\n[Action Gate] Authorizing intervention with human-in-the-loop approval...');
  const executed = await approveIntervention(proposed!.intervention_id, 'Sarah Conor (VP Customer Success)');
  assert(
    executed.status === 'EXECUTED' && executed.approved_by === 'Sarah Conor (VP Customer Success)',
    10,
    `Intervention authorized and transitioned to EXECUTED state`
  );

  // Gate 11: Verify Immutable Compliance Audit Record
  const audits = readStore.getAuditEvents(1017);
  const approvalAudit = audits.find((a) => a.action === 'INTERVENTION_EXECUTED' && a.actor_type === 'HUMAN');
  assert(
    Boolean(approvalAudit && approvalAudit.approval_status === 'EXECUTED'),
    11,
    `Immutable audit record written: [${approvalAudit?.actor_type}] ${approvalAudit?.action}`
  );

  // Gate 12: Verify Customer State Transition & MRR Exposed
  const metrics = readStore.getMetrics();
  assert(
    metrics.mrr_total_exposed >= 3450,
    12,
    `MRR Exposed metrics actively updated ($${metrics.mrr_total_exposed.toLocaleString()})`
  );

  console.log('\n===============================================================');
  console.log('  🎯 MILESTONE 0 GOLDEN PATH ACCEPTANCE TEST: ALL 12 GATES PASSED!');
  console.log('===============================================================\n');
}

runGoldenPathAcceptanceTest().catch((err) => {
  console.error('Golden path failed:', err);
  process.exit(1);
});
