import { Customer, CustomerAggregates, RiskScoreBreakdown } from './event-types';

export function generateRiskReasons(
  customer: Pick<Customer, 'plan' | 'monthly_value'>,
  aggregates: CustomerAggregates,
  breakdown: RiskScoreBreakdown
): string[] {
  const reasons: string[] = [];

  if (breakdown.usage_decline_pts > 0) {
    reasons.push(
      `+${breakdown.usage_decline_pts} Product usage declined ${Math.abs(aggregates.usage_change_percent)}% in the last 7 days`
    );
  }

  if (breakdown.order_inactivity_pts > 0) {
    reasons.push(
      `+${breakdown.order_inactivity_pts} Inactive for ${aggregates.days_since_last_order} days (no orders placed)`
    );
  }

  if (breakdown.negative_sentiment_pts > 0) {
    const sentimentLabel =
      aggregates.latest_sentiment === 'URGENT_NEGATIVE'
        ? 'strongly negative / crisis'
        : 'negative';
    reasons.push(
      `+${breakdown.negative_sentiment_pts} Latest support sentiment detected as ${sentimentLabel}`
    );
  }

  if (breakdown.unresolved_tickets_pts > 0) {
    reasons.push(
      `+${breakdown.unresolved_tickets_pts} ${aggregates.unresolved_tickets} unresolved support tickets outstanding`
    );
  }

  if (breakdown.renewal_proximity_pts > 0) {
    reasons.push(
      `+${breakdown.renewal_proximity_pts} Subscription renewal is approaching in ${aggregates.days_until_renewal} days`
    );
  }

  if (breakdown.customer_value_pts > 0) {
    reasons.push(
      `+${breakdown.customer_value_pts} High-value ${customer.plan} account ($${customer.monthly_value}/mo MRR)`
    );
  }

  if (reasons.length === 0) {
    reasons.push('Customer exhibits normal, healthy engagement patterns across all metrics');
  }

  return reasons;
}
