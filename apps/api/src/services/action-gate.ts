import {
  ProposedIntervention,
  CustomerAuditEvent,
  POLICY_VERSION,
  maskPIIEmail,
} from '@pulseguard/domain';
import { readStore } from '../readmodel/store';
import { sseBus } from '../sse/event-bus';
import { config } from '../config/env';

export async function processInterventionActionGate(
  intervention: ProposedIntervention
): Promise<ProposedIntervention> {
  const customer = readStore.getCustomer(intervention.customer_id);
  if (!customer) {
    throw new Error(`Customer ${intervention.customer_id} not found in read model`);
  }

  // If human approval is required, hold in PENDING state
  if (intervention.requires_human_approval) {
    intervention.status = 'PENDING';
    readStore.upsertIntervention(intervention);

    const auditEvent: CustomerAuditEvent = {
      audit_id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      customer_id: intervention.customer_id,
      actor_type: 'SYSTEM',
      actor_id: intervention.policy_name,
      action: 'INTERVENTION_HELD_FOR_HUMAN_APPROVAL',
      previous_state: 'DETECTED',
      new_state: 'PENDING_APPROVAL',
      risk_event_id: intervention.risk_event_id,
      policy_version: POLICY_VERSION,
      approval_required: true,
      approval_status: 'PENDING',
      reason: `Policy ${intervention.policy_name} requires human review for ${customer.plan} account in ${intervention.risk_level} churn risk.`,
    };
    readStore.addAuditEvent(auditEvent);
    sseBus.broadcast('AUDIT', auditEvent);
    sseBus.broadcast('INTERVENTION', intervention);

    return intervention;
  }

  // Otherwise, automatically authorize and execute
  return await executeInterventionSideEffect(intervention, 'SYSTEM', 'Automated policy rule authorization');
}

export async function approveIntervention(
  interventionId: string,
  approver: string = 'Operations Lead'
): Promise<ProposedIntervention> {
  const intervention = readStore.getIntervention(interventionId);
  if (!intervention) {
    throw new Error(`Intervention ${interventionId} not found`);
  }

  if (intervention.status !== 'PENDING') {
    throw new Error(`Intervention is already ${intervention.status}`);
  }

  return await executeInterventionSideEffect(intervention, 'HUMAN', `Approved by ${approver}`, approver);
}

export async function rejectIntervention(
  interventionId: string,
  reason: string,
  reviewer: string = 'Operations Lead'
): Promise<ProposedIntervention> {
  const intervention = readStore.getIntervention(interventionId);
  if (!intervention) {
    throw new Error(`Intervention ${interventionId} not found`);
  }

  intervention.status = 'REJECTED';
  readStore.upsertIntervention(intervention);

  const auditEvent: CustomerAuditEvent = {
    audit_id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    customer_id: intervention.customer_id,
    actor_type: 'HUMAN',
    actor_id: reviewer,
    action: 'INTERVENTION_REJECTED',
    previous_state: 'PENDING',
    new_state: 'REJECTED',
    risk_event_id: intervention.risk_event_id,
    policy_version: POLICY_VERSION,
    approval_required: true,
    approval_status: 'REJECTED',
    reason,
  };
  readStore.addAuditEvent(auditEvent);
  sseBus.broadcast('AUDIT', auditEvent);
  sseBus.broadcast('INTERVENTION', intervention);

  return intervention;
}

async function executeInterventionSideEffect(
  intervention: ProposedIntervention,
  actorType: CustomerAuditEvent['actor_type'],
  reason: string,
  actorId: string = 'SYSTEM'
): Promise<ProposedIntervention> {
  const customer = readStore.getCustomer(intervention.customer_id);
  intervention.status = 'EXECUTED';
  intervention.executed_at = new Date().toISOString();
  if (actorType === 'HUMAN') {
    intervention.approved_by = actorId;
  }
  readStore.upsertIntervention(intervention);

  // External Webhook side effect simulation
  if (config.actionWebhookUrl) {
    try {
      await fetch(config.actionWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CUSTOMER_RETENTION_INTERVENTION_EXECUTED',
          customer_id: intervention.customer_id,
          masked_email: customer ? maskPIIEmail(customer.email) : '***',
          action: intervention.recommended_action,
          offer: intervention.offer_type,
          discount_percent: intervention.discount_percent,
          message: intervention.message,
          policy: intervention.policy_name,
        }),
      });
    } catch (err) {
      console.warn('[Action Gate] External webhook dispatch failed:', err);
    }
  }

  const auditEvent: CustomerAuditEvent = {
    audit_id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    customer_id: intervention.customer_id,
    actor_type: actorType,
    actor_id: actorId,
    action: 'INTERVENTION_EXECUTED',
    previous_state: 'PENDING',
    new_state: 'EXECUTED',
    risk_event_id: intervention.risk_event_id,
    policy_version: POLICY_VERSION,
    approval_required: intervention.requires_human_approval,
    approval_status: 'EXECUTED',
    reason,
  };
  readStore.addAuditEvent(auditEvent);
  sseBus.broadcast('AUDIT', auditEvent);
  sseBus.broadcast('INTERVENTION', intervention);

  return intervention;
}
