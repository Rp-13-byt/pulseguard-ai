export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InterventionStatus = 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
export type ComponentHealthState = 'CONNECTED' | 'CONFIGURED' | 'DEGRADED' | 'ERROR';

export interface CustomerAggregates {
  orders_last_30d: number;
  spend_last_30d: number;
  days_since_last_order: number;
  usage_last_24h_mins: number;
  usage_last_7d_mins: number;
  usage_prev_7d_mins: number;
  usage_change_percent: number;
  days_since_last_login: number;
  tickets_last_7d: number;
  unresolved_tickets: number;
  negative_tickets_last_7d: number;
  latest_sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT_NEGATIVE';
  days_until_renewal: number;
}

export interface Customer360 {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  country: string;
  signup_date: string;
  monthly_value: number;
  last_login_at: string;
  lifecycle_status: 'ACTIVE' | 'WATCH' | 'AT_RISK' | 'CRITICAL' | 'CHURNED';
  aggregates: CustomerAggregates;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  last_updated: string;
}

export interface RiskScoreBreakdown {
  usage_decline_pts: number;
  order_inactivity_pts: number;
  negative_sentiment_pts: number;
  unresolved_tickets_pts: number;
  renewal_proximity_pts: number;
  customer_value_pts: number;
  total_score: number;
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

export interface ProposedIntervention {
  intervention_id: string;
  customer_id: number;
  risk_event_id: string;
  transition_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  recommended_action: string;
  channel: 'EMAIL' | 'SLACK' | 'IN_APP' | 'CRM' | 'PHONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  offer_type: string;
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
  actor_type: 'SYSTEM' | 'AI' | 'HUMAN' | 'CONNECTOR' | 'FLINK';
  actor_id: string;
  action: string;
  previous_state: string;
  new_state: string;
  risk_event_id?: string;
  policy_version: string;
  approval_required: boolean;
  approval_status: InterventionStatus;
  reason: string;
}

export interface ComponentHealth {
  component: string;
  status: ComponentHealthState;
  latency_ms: number;
  message: string;
  last_probe_time: string;
}

export interface SystemHealthSummary {
  overall_status: ComponentHealthState;
  components: Record<string, ComponentHealth>;
  mode: 'LIVE_CONFLUENT' | 'HIGH_FIDELITY_SIMULATOR';
  timestamp: string;
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
