import {
  calculateRiskBreakdown,
  classifyRiskLevel,
  generateRiskReasons,
  evaluateInterventionPolicy,
  generateFallbackIntervention,
  createIdempotencyKey,
  Customer,
  CustomerAggregates,
  ProposedIntervention,
} from '@pulseguard/domain';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('\n--- Running PulseGuard AI Domain & Risk Engine Unit Tests ---\n');

// Test 1: Classification Boundaries
assert(classifyRiskLevel(12) === 'LOW', 'Score 12 classified as LOW');
assert(classifyRiskLevel(25) === 'MEDIUM', 'Score 25 classified as MEDIUM');
assert(classifyRiskLevel(49) === 'MEDIUM', 'Score 49 classified as MEDIUM');
assert(classifyRiskLevel(50) === 'HIGH', 'Score 50 classified as HIGH');
assert(classifyRiskLevel(74) === 'HIGH', 'Score 74 classified as HIGH');
assert(classifyRiskLevel(75) === 'CRITICAL', 'Score 75 classified as CRITICAL');
assert(classifyRiskLevel(100) === 'CRITICAL', 'Score 100 classified as CRITICAL');

// Test 2: Hero Customer 1017 Baseline Healthy Score
const healthyCustomer: Pick<Customer, 'plan' | 'monthly_value'> = {
  plan: 'ENTERPRISE',
  monthly_value: 3450,
};
const healthyAggregates: CustomerAggregates = {
  orders_last_30d: 2,
  spend_last_30d: 1650,
  days_since_last_order: 3,
  usage_last_24h_mins: 45,
  usage_last_7d_mins: 380,
  usage_prev_7d_mins: 395,
  usage_change_percent: -3.8,
  days_since_last_login: 0,
  tickets_last_7d: 0,
  unresolved_tickets: 0,
  negative_tickets_last_7d: 0,
  latest_sentiment: 'POSITIVE',
  days_until_renewal: 65,
};
const healthyBreakdown = calculateRiskBreakdown(healthyCustomer, healthyAggregates);
assert(
  healthyBreakdown.total_score <= 15 && classifyRiskLevel(healthyBreakdown.total_score) === 'LOW',
  `Baseline healthy customer risk score is ${healthyBreakdown.total_score} (Expected <= 15 LOW)`
);

// Test 3: Churn Scenario Breakdown for Customer 1017 (Severe Deterioration)
const crisisAggregates: CustomerAggregates = {
  ...healthyAggregates,
  usage_change_percent: -62.0, // 25 pts
  days_since_last_order: 36,   // 20 pts
  latest_sentiment: 'URGENT_NEGATIVE', // 20 pts
  unresolved_tickets: 3,       // 15 pts
  days_until_renewal: 7,       // 10 pts
  // Enterprise plan = 10 pts
};
const crisisBreakdown = calculateRiskBreakdown(healthyCustomer, crisisAggregates);
assert(
  crisisBreakdown.total_score >= 85 && classifyRiskLevel(crisisBreakdown.total_score) === 'CRITICAL',
  `Crisis state score is ${crisisBreakdown.total_score} (Expected >= 85 CRITICAL)`
);
assert(crisisBreakdown.usage_decline_pts === 25, 'Usage decline awarded max 25 pts');
assert(crisisBreakdown.order_inactivity_pts === 20, 'Order inactivity awarded max 20 pts');
assert(crisisBreakdown.negative_sentiment_pts === 20, 'Urgent negative sentiment awarded max 20 pts');
assert(crisisBreakdown.unresolved_tickets_pts === 15, 'Unresolved tickets awarded max 15 pts');
assert(crisisBreakdown.renewal_proximity_pts === 10, 'Renewal <= 7 days awarded max 10 pts');
assert(crisisBreakdown.customer_value_pts === 10, 'Enterprise tier awarded max 10 pts');

// Test 4: Explainable Reason Generation
const reasons = generateRiskReasons(healthyCustomer, crisisAggregates, crisisBreakdown);
assert(reasons.length >= 5, `Generated ${reasons.length} explainable reason statements`);
assert(reasons.some((r) => r.includes('+25 Product usage declined 62%')), 'Contains usage drop reason');
assert(reasons.some((r) => r.includes('+20 Inactive for 36 days')), 'Contains order inactivity reason');

// Test 5: Governed Policy Rules (Enterprise Critical Mandatory Approval)
const proposedAction: Pick<
  ProposedIntervention,
  'recommended_action' | 'offer_type' | 'discount_percent' | 'channel'
> = {
  recommended_action: 'EXECUTIVE_ACCOUNT_OUTREACH',
  offer_type: 'EXECUTIVE_CALL',
  discount_percent: 15,
  channel: 'EMAIL',
};
const policyResult = evaluateInterventionPolicy(
  { ...healthyCustomer, email: 'sarah@acme.com' },
  'CRITICAL',
  proposedAction
);
assert(policyResult.allowed === true, 'Policy allows valid intervention');
assert(policyResult.requires_human_approval === true, 'Mandatory human approval enforced for Enterprise Critical');
assert(policyResult.policy_name === 'ENTERPRISE_VIP_ESCALATION', 'Correct policy rule activated');

// Test 6: Policy Discount Ceiling Guardrail (Excessive Discount Capped/Escalated)
const excessiveDiscountAction: typeof proposedAction = {
  ...proposedAction,
  discount_percent: 35, // Exceeds Enterprise 20% limit
};
const discountPolicyResult = evaluateInterventionPolicy(
  { ...healthyCustomer, email: 'sarah@acme.com' },
  'HIGH',
  excessiveDiscountAction
);
assert(
  discountPolicyResult.requires_human_approval === true,
  'Excessive discount automatically requires human approval'
);

// Test 7: Fail-Safe Deterministic Fallback Generation
const fallback = generateFallbackIntervention(
  1017,
  87,
  'CRITICAL',
  reasons,
  'ENTERPRISE'
);
assert(fallback.customer_id === 1017, 'Fallback assigns correct customer ID');
assert(fallback.requires_human_approval === true, 'Fallback requires human approval');
assert(fallback.policy_name === 'FAIL_SAFE_DETERMINISTIC_ESCALATION', 'Fallback policy name assigned');

// Test 8: Idempotency Key Formulation
const idempKey = createIdempotencyKey(1017, 'trans-1017-123', 'v1.1-governed');
assert(idempKey === 'idemp-1017-trans-1017-123-v1.1-governed', 'Idempotency key correctly formatted');

console.log('\n🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!\n');
