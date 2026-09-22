import { Customer, ProposedIntervention, RiskLevel } from './event-types';

export const POLICY_VERSION = 'v1.1-governed';

export interface PolicyValidationResult {
  allowed: boolean;
  policy_name: string;
  requires_human_approval: boolean;
  adjusted_offer_type?: ProposedIntervention['offer_type'];
  adjusted_discount_percent?: number;
  violation_reason?: string;
  notes: string[];
}

export const DISCOUNT_LIMITS = {
  ENTERPRISE: 20, // Max automated 20%
  PRO: 15,        // Max automated 15%
  STARTER: 10,    // Max automated 10%
  FREE: 0,        // No automated discount
};

export function evaluateInterventionPolicy(
  customer: Pick<Customer, 'plan' | 'monthly_value' | 'email'>,
  riskLevel: RiskLevel,
  proposed: Pick<
    ProposedIntervention,
    'recommended_action' | 'offer_type' | 'discount_percent' | 'channel'
  >
): PolicyValidationResult {
  const notes: string[] = [];
  let requiresHuman = false;
  let policyName = 'STANDARD_RETENTION_RULE';

  // 1. VIP / Enterprise Critical Rule
  if (customer.plan === 'ENTERPRISE' && riskLevel === 'CRITICAL') {
    policyName = 'ENTERPRISE_VIP_ESCALATION';
    requiresHuman = true;
    notes.push('Mandatory human approval required for Enterprise VIP accounts in CRITICAL churn risk state');
  }

  // 2. High MRR Account Rule (> $1,500/mo)
  if (customer.monthly_value >= 1500) {
    requiresHuman = true;
    notes.push(`High MRR account ($${customer.monthly_value}/mo) requires human-in-the-loop validation`);
  }

  // 3. Discount Ceiling Guardrails
  const maxAllowed = DISCOUNT_LIMITS[customer.plan] ?? 0;
  let adjustedDiscount = proposed.discount_percent;
  let adjustedOffer = proposed.offer_type;

  if (proposed.discount_percent > maxAllowed) {
    if (customer.plan === 'FREE') {
      adjustedDiscount = 0;
      adjustedOffer = 'TRAINING_SESSION';
      policyName = 'FREE_TIER_NO_FINANCIAL_COMPENSATION';
      notes.push(`Free tier accounts cannot receive financial discounts; converted to product training`);
    } else {
      requiresHuman = true;
      policyName = 'DISCOUNT_CEILING_EXCEEDED_HUMAN_REVIEW';
      notes.push(
        `Proposed discount (${proposed.discount_percent}%) exceeds automated limit (${maxAllowed}%); human authorization mandatory`
      );
    }
  }

  // 4. Low-Risk Guardrail
  if (riskLevel === 'LOW' && proposed.discount_percent > 0) {
    return {
      allowed: false,
      policy_name: 'REJECT_DISCOUNT_FOR_HEALTHY_CUSTOMER',
      requires_human_approval: true,
      violation_reason: 'Financial discount cannot be issued to customer with LOW churn risk score',
      notes: ['Policy violation: Unnecessary discount proposal blocked'],
    };
  }

  return {
    allowed: true,
    policy_name: policyName,
    requires_human_approval: requiresHuman,
    adjusted_offer_type: adjustedOffer,
    adjusted_discount_percent: adjustedDiscount,
    notes,
  };
}

/**
 * Deterministic Fallback Generator when Claude AI Model Inference is degraded / times out / 429
 */
export function generateFallbackIntervention(
  customerId: number,
  riskScore: number,
  riskLevel: RiskLevel,
  reasons: string[],
  plan: Customer['plan']
): Omit<ProposedIntervention, 'intervention_id' | 'risk_event_id' | 'transition_id' | 'created_at'> {
  return {
    customer_id: customerId,
    risk_score: riskScore,
    risk_level: riskLevel,
    recommended_action: riskLevel === 'CRITICAL' ? 'EXECUTIVE_ACCOUNT_OUTREACH' : 'PROACTIVE_ACCOUNT_SUPPORT',
    channel: 'EMAIL',
    priority: riskLevel === 'CRITICAL' ? 'URGENT' : 'HIGH',
    offer_type: plan === 'ENTERPRISE' ? 'EXECUTIVE_CALL' : 'PRIORITY_SUPPORT',
    discount_percent: 0,
    message: `Hello, our dedicated customer success team noticed a recent change in your account activity. We want to ensure you are getting maximum value and would love to connect for a 15-minute review.`,
    reasoning: `DETERMINISTIC FALLBACK (AI inference unavailable or rate-limited). Formulated by policy engine based on: ${reasons.slice(0, 2).join('; ')}.`,
    requires_human_approval: true,
    policy_name: 'FAIL_SAFE_DETERMINISTIC_ESCALATION',
    status: 'PENDING',
    confidence: 1.0,
    risk_model_version: 'v1.2-weighted',
    policy_version: POLICY_VERSION,
    ai_model: 'deterministic-fallback',
    prompt_version: 'retention-v2.0',
    schema_version: 3,
    idempotency_key: `fallback-${customerId}-${riskScore}-${Date.now()}`,
  };
}

export function maskPIIEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.com';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}
