import { Customer, CustomerAggregates, RiskLevel, RiskScoreBreakdown } from './event-types';

export const RISK_MODEL_VERSION = 'v1.2-weighted';

export interface ScoringWeights {
  usage_max: number;       // 25
  inactivity_max: number;  // 20
  sentiment_max: number;   // 20
  tickets_max: number;     // 15
  renewal_max: number;     // 10
  value_max: number;       // 10
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  usage_max: 25,
  inactivity_max: 20,
  sentiment_max: 20,
  tickets_max: 15,
  renewal_max: 10,
  value_max: 10,
};

export function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

export function calculateRiskBreakdown(
  customer: Pick<Customer, 'plan' | 'monthly_value'>,
  aggregates: CustomerAggregates
): RiskScoreBreakdown {
  // 1. Usage Decline (0-25 pts)
  let usage_decline_pts = 0;
  if (aggregates.usage_change_percent <= -60) {
    usage_decline_pts = 25;
  } else if (aggregates.usage_change_percent <= -40) {
    usage_decline_pts = 20;
  } else if (aggregates.usage_change_percent <= -25) {
    usage_decline_pts = 14;
  } else if (aggregates.usage_change_percent <= -10) {
    usage_decline_pts = 7;
  }

  // 2. Order Inactivity (0-20 pts)
  let order_inactivity_pts = 0;
  if (aggregates.days_since_last_order >= 35) {
    order_inactivity_pts = 20;
  } else if (aggregates.days_since_last_order >= 25) {
    order_inactivity_pts = 14;
  } else if (aggregates.days_since_last_order >= 14) {
    order_inactivity_pts = 8;
  } else if (aggregates.days_since_last_order >= 7) {
    order_inactivity_pts = 4;
  }

  // 3. Negative Support Sentiment (0-20 pts)
  let negative_sentiment_pts = 0;
  if (aggregates.latest_sentiment === 'URGENT_NEGATIVE') {
    negative_sentiment_pts = 20;
  } else if (aggregates.latest_sentiment === 'NEGATIVE') {
    negative_sentiment_pts = aggregates.negative_tickets_last_7d >= 2 ? 18 : 14;
  } else if (aggregates.latest_sentiment === 'NEUTRAL') {
    negative_sentiment_pts = 2;
  }

  // 4. Unresolved Support Tickets (0-15 pts)
  let unresolved_tickets_pts = 0;
  if (aggregates.unresolved_tickets >= 3) {
    unresolved_tickets_pts = 15;
  } else if (aggregates.unresolved_tickets === 2) {
    unresolved_tickets_pts = 10;
  } else if (aggregates.unresolved_tickets === 1) {
    unresolved_tickets_pts = 5;
  }

  // 5. Renewal Proximity (0-10 pts)
  let renewal_proximity_pts = 0;
  if (aggregates.days_until_renewal <= 7 && aggregates.days_until_renewal >= 0) {
    renewal_proximity_pts = 10;
  } else if (aggregates.days_until_renewal <= 14 && aggregates.days_until_renewal >= 0) {
    renewal_proximity_pts = 7;
  } else if (aggregates.days_until_renewal <= 30 && aggregates.days_until_renewal >= 0) {
    renewal_proximity_pts = 4;
  }

  // 6. High-Value Customer Weight (0-10 pts)
  let customer_value_pts = 0;
  if (customer.plan === 'ENTERPRISE' || customer.monthly_value >= 2000) {
    customer_value_pts = 10;
  } else if (customer.plan === 'PRO' || customer.monthly_value >= 500) {
    customer_value_pts = 6;
  } else if (customer.monthly_value >= 100) {
    customer_value_pts = 3;
  }

  const total_score = Math.min(
    100,
    usage_decline_pts +
      order_inactivity_pts +
      negative_sentiment_pts +
      unresolved_tickets_pts +
      renewal_proximity_pts +
      customer_value_pts
  );

  return {
    usage_decline_pts,
    order_inactivity_pts,
    negative_sentiment_pts,
    unresolved_tickets_pts,
    renewal_proximity_pts,
    customer_value_pts,
    total_score,
  };
}

export function calculateMRRExposed(monthly_value: number, level: RiskLevel): number {
  if (level === 'CRITICAL' || level === 'HIGH') {
    return monthly_value;
  }
  return 0;
}

export function calculateRiskWeightedMRR(monthly_value: number, score: number): number {
  // Clear heuristic proxy: score / 100 * monthly_value
  return Math.round((monthly_value * (score / 100)) * 100) / 100;
}
