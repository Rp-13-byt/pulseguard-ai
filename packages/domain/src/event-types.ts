import { z } from 'zod';

export type LatencyClass = 'FAST_PATH' | 'OPERATIONAL_PATH' | 'SUPPORT_PATH';

export type CustomerPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type CustomerLifecycleStatus = 'ACTIVE' | 'WATCH' | 'AT_RISK' | 'CRITICAL' | 'CHURNED';
export type SentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT_NEGATIVE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InterventionStatus = 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
export type InterventionChannel = 'EMAIL' | 'SLACK' | 'IN_APP' | 'CRM' | 'PHONE';
export type ActorType = 'SYSTEM' | 'AI' | 'HUMAN' | 'CONNECTOR' | 'FLINK';

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  plan: CustomerPlan;
  country: string;
  signup_date: string;
  monthly_value: number;
  last_login_at: string;
  lifecycle_status: CustomerLifecycleStatus;
}

export interface Order {
  order_id: number;
  customer_id: number;
  order_time: string;
  amount: number;
  product_category: string;
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
}

export interface ProductEvent {
  event_id: string;
  customer_id: number;
  event_time: string;
  event_type: 'LOGIN' | 'FEATURE_USE' | 'SESSION_START' | 'EXPORT_DATA' | 'INVITE_USER' | 'SETTINGS_CHANGE';
  feature: string;
  session_minutes: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface SupportTicket {
  ticket_id: number;
  customer_id: number;
  created_at: string;
  subject: string;
  message: string;
  sentiment: SentimentType;
  sentiment_score: number; // -1.0 to 1.0
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  issue_category: 'BILLING' | 'PERFORMANCE' | 'BUG' | 'INTEGRATION' | 'CANCELLATION_REQUEST';
  status: 'OPEN' | 'PENDING' | 'SOLVED' | 'CLOSED';
}

export interface Subscription {
  subscription_id: number;
  customer_id: number;
  plan: CustomerPlan;
  start_date: string;
  renewal_date: string;
  monthly_value: number;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
}

export interface CustomerAggregates {
  orders_last_30d: number;
  spend_last_30d: number;
  days_since_last_order: number;
  usage_last_24h_mins: number;
  usage_last_7d_mins: number;
  usage_prev_7d_mins: number;
  usage_change_percent: number; // e.g. -48%
  days_since_last_login: number;
  tickets_last_7d: number;
  unresolved_tickets: number;
  negative_tickets_last_7d: number;
  latest_sentiment: SentimentType;
  days_until_renewal: number;
}

export interface Customer360 extends Customer {
  aggregates: CustomerAggregates;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  last_updated: string;
}

export interface RiskScoreBreakdown {
  usage_decline_pts: number;      // 0-25
  order_inactivity_pts: number;   // 0-20
  negative_sentiment_pts: number; // 0-20
  unresolved_tickets_pts: number; // 0-15
  renewal_proximity_pts: number;  // 0-10
  customer_value_pts: number;     // 0-10
  total_score: number;            // 0-100
}

export interface ChurnRiskEvent {
  risk_event_id: string;
  customer_id: number;
  risk_score: number;
  risk_level: RiskLevel;
  breakdown: RiskScoreBreakdown;
  reasons: string[];
  mrr_exposed: number;
  risk_weighted_mrr: number;
  timestamp: string;
  processing_version: string;
}

export interface RiskTransitionEvent {
  transition_id: string;
  customer_id: number;
  previous_score: number;
  new_score: number;
  previous_level: RiskLevel;
  new_level: RiskLevel;
  score_delta: number;
  trigger_reason: string;
  timestamp: string;
  requires_ai_intervention: boolean;
}

export interface ProposedIntervention {
  intervention_id: string;
  customer_id: number;
  risk_event_id: string;
  transition_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  recommended_action: string;
  channel: InterventionChannel;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  offer_type: 'NONE' | 'DISCOUNT_10' | 'DISCOUNT_20' | 'EXECUTIVE_CALL' | 'PRIORITY_SUPPORT' | 'TRAINING_SESSION' | 'FEATURE_PREVIEW';
  discount_percent: number;
  message: string;
  reasoning: string;
  requires_human_approval: boolean;
  policy_name: string;
  status: InterventionStatus;
  confidence: number;
  risk_model_version: string;
  policy_version: string;
  ai_model: string;
  prompt_version: string;
  schema_version: number;
  idempotency_key: string;
  created_at: string;
  approved_by?: string;
  executed_at?: string;
}

export interface CustomerAuditEvent {
  audit_id: string;
  timestamp: string;
  customer_id: number;
  actor_type: ActorType;
  actor_id: string;
  action: string;
  previous_state: string;
  new_state: string;
  risk_event_id?: string;
  policy_version: string;
  model_version?: string;
  approval_required: boolean;
  approval_status: InterventionStatus;
  reason: string;
}

export interface StreamMetrics {
  events_per_sec: number;
  consumer_lag_records: number;
  flink_job_status: 'RUNNING' | 'FAILED' | 'RESTARTING';
  ai_requests: number;
  ai_success: number;
  ai_failures: number;
  ai_latency_ms: number;
  ai_tokens_used: number;
  ai_429s: number;
  ai_calls_avoided_by_dedup: number;
  mrr_total_exposed: number;
  active_interventions_count: number;
  uptime_seconds: number;
}
