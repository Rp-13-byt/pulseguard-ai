import {
  Customer,
  Customer360,
  ChurnRiskEvent,
  RiskTransitionEvent,
  ProposedIntervention,
  CustomerAuditEvent,
  StreamMetrics,
  calculateRiskBreakdown,
  classifyRiskLevel,
  generateRiskReasons,
  calculateMRRExposed,
  calculateRiskWeightedMRR,
  RISK_MODEL_VERSION,
} from '@pulseguard/domain';

class ReadModelStore {
  private customers: Map<number, Customer360> = new Map();
  private riskEvents: Map<number, ChurnRiskEvent> = new Map();
  private riskHistory: Map<number, { timestamp: string; score: number }[]> = new Map();
  private transitions: RiskTransitionEvent[] = [];
  private interventions: Map<string, ProposedIntervention> = new Map();
  private auditEvents: CustomerAuditEvent[] = [];
  private metrics: StreamMetrics = {
    events_per_sec: 18.4,
    consumer_lag_records: 0,
    flink_job_status: 'RUNNING',
    ai_requests: 37,
    ai_success: 37,
    ai_failures: 0,
    ai_latency_ms: 320,
    ai_tokens_used: 14200,
    ai_429s: 0,
    ai_calls_avoided_by_dedup: 94,
    mrr_total_exposed: 0,
    active_interventions_count: 0,
    uptime_seconds: 1420,
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Customer 1017 (Acme Global Enterprise - Initially Healthy!)
    const heroCustomer: Customer360 = {
      customer_id: 1017,
      first_name: 'Sarah',
      last_name: 'Jenkins',
      email: 'sarah.jenkins@acmeglobal.com',
      plan: 'ENTERPRISE',
      country: 'US',
      signup_date: new Date(Date.now() - 320 * 86400000).toISOString(),
      monthly_value: 3450,
      last_login_at: new Date(Date.now() - 3600000).toISOString(),
      lifecycle_status: 'ACTIVE',
      aggregates: {
        orders_last_30d: 2,
        spend_last_30d: 1650,
        days_since_last_order: 3,
        usage_last_24h_mins: 45,
        usage_last_7d_mins: 380,
        usage_prev_7d_mins: 395,
        usage_change_percent: -3.8, // Normal variance
        days_since_last_login: 0,
        tickets_last_7d: 0,
        unresolved_tickets: 0,
        negative_tickets_last_7d: 0,
        latest_sentiment: 'POSITIVE',
        days_until_renewal: 8,
      },
      current_risk_score: 14,
      current_risk_level: 'LOW',
      last_updated: new Date().toISOString(),
    };
    this.upsertCustomer(heroCustomer);

    // 2. Seed other initial accounts
    const initialProfiles: Array<{
      id: number;
      first: string;
      last: string;
      email: string;
      plan: Customer360['plan'];
      mrr: number;
      status: Customer360['lifecycle_status'];
      score: number;
      usage_change: number;
      days_order: number;
      sentiment: Customer360['aggregates']['latest_sentiment'];
      tickets: number;
      unresolved: number;
      renewal: number;
    }> = [
      { id: 1001, first: 'Marcus', last: 'Vance', email: 'marcus.vance@techcorp.io', plan: 'ENTERPRISE', mrr: 4200, status: 'CRITICAL', score: 86, usage_change: -68, days_order: 42, sentiment: 'URGENT_NEGATIVE', tickets: 4, unresolved: 3, renewal: 5 },
      { id: 1002, first: 'Elena', last: 'Rostova', email: 'elena.rostova@cloudscale.de', plan: 'ENTERPRISE', mrr: 2800, status: 'CRITICAL', score: 82, usage_change: -55, days_order: 38, sentiment: 'NEGATIVE', tickets: 3, unresolved: 2, renewal: 7 },
      { id: 1003, first: 'David', last: 'Kim', email: 'david.kim@fintechflow.kr', plan: 'PRO', mrr: 850, status: 'CRITICAL', score: 79, usage_change: -62, days_order: 35, sentiment: 'NEGATIVE', tickets: 3, unresolved: 2, renewal: 12 },
      { id: 1006, first: 'Sophia', last: 'Chen', email: 'sophia.chen@apexanalytics.sg', plan: 'PRO', mrr: 650, status: 'AT_RISK', score: 64, usage_change: -35, days_order: 22, sentiment: 'NEGATIVE', tickets: 2, unresolved: 1, renewal: 24 },
      { id: 1007, first: 'Mateo', last: 'Garcia', email: 'mateo.garcia@soluciones.mx', plan: 'PRO', mrr: 500, status: 'AT_RISK', score: 58, usage_change: -28, days_order: 18, sentiment: 'NEUTRAL', tickets: 1, unresolved: 1, renewal: 15 },
      { id: 1008, first: 'Hanna', last: 'Lindqvist', email: 'hanna.l@nordicsoft.se', plan: 'ENTERPRISE', mrr: 3100, status: 'AT_RISK', score: 62, usage_change: -32, days_order: 19, sentiment: 'NEGATIVE', tickets: 2, unresolved: 1, renewal: 11 },
      { id: 1018, first: 'Noah', last: 'Taylor', email: 'noah.taylor@sydneylabs.au', plan: 'PRO', mrr: 620, status: 'WATCH', score: 41, usage_change: -18, days_order: 12, sentiment: 'NEUTRAL', tickets: 1, unresolved: 0, renewal: 45 },
      { id: 1019, first: 'Maya', last: 'Patel', email: 'maya.patel@mumbaicloud.in', plan: 'STARTER', mrr: 150, status: 'WATCH', score: 32, usage_change: -14, days_order: 10, sentiment: 'NEUTRAL', tickets: 0, unresolved: 0, renewal: 60 },
    ];

    for (const p of initialProfiles) {
      const cust: Customer360 = {
        customer_id: p.id,
        first_name: p.first,
        last_name: p.last,
        email: p.email,
        plan: p.plan,
        country: 'US',
        signup_date: new Date(Date.now() - 120 * 86400000).toISOString(),
        monthly_value: p.mrr,
        last_login_at: new Date(Date.now() - 86400000).toISOString(),
        lifecycle_status: p.status,
        aggregates: {
          orders_last_30d: p.days_order > 30 ? 0 : 1,
          spend_last_30d: p.days_order > 30 ? 0 : p.mrr,
          days_since_last_order: p.days_order,
          usage_last_24h_mins: 10,
          usage_last_7d_mins: 80,
          usage_prev_7d_mins: 200,
          usage_change_percent: p.usage_change,
          days_since_last_login: 1,
          tickets_last_7d: p.tickets,
          unresolved_tickets: p.unresolved,
          negative_tickets_last_7d: p.sentiment === 'NEGATIVE' || p.sentiment === 'URGENT_NEGATIVE' ? p.tickets : 0,
          latest_sentiment: p.sentiment,
          days_until_renewal: p.renewal,
        },
        current_risk_score: p.score,
        current_risk_level: classifyRiskLevel(p.score),
        last_updated: new Date().toISOString(),
      };
      this.upsertCustomer(cust);
    }

    // Generate 90 additional realistic active accounts (IDs 1021 - 1105)
    for (let i = 1021; i <= 1105; i++) {
      const plan = (['STARTER', 'PRO', 'PRO', 'ENTERPRISE'] as const)[i % 4];
      const mrr = plan === 'ENTERPRISE' ? 2400 : plan === 'PRO' ? 650 : 120;
      const cust: Customer360 = {
        customer_id: i,
        first_name: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley'][i % 5],
        last_name: ['Miller', 'Wilson', 'Jackson', 'Harris', 'Young'][i % 5],
        email: `user.${i}@client-${i % 20}.com`,
        plan,
        country: ['US', 'GB', 'DE', 'IN', 'CA'][i % 5],
        signup_date: new Date(Date.now() - (i % 200) * 86400000).toISOString(),
        monthly_value: mrr,
        last_login_at: new Date(Date.now() - (i % 12) * 3600000).toISOString(),
        lifecycle_status: 'ACTIVE',
        aggregates: {
          orders_last_30d: 2,
          spend_last_30d: mrr,
          days_since_last_order: i % 7,
          usage_last_24h_mins: 35,
          usage_last_7d_mins: 280,
          usage_prev_7d_mins: 270,
          usage_change_percent: 3.7,
          days_since_last_login: 0,
          tickets_last_7d: 0,
          unresolved_tickets: 0,
          negative_tickets_last_7d: 0,
          latest_sentiment: 'POSITIVE',
          days_until_renewal: 40 + (i % 60),
        },
        current_risk_score: 12 + (i % 10),
        current_risk_level: 'LOW',
        last_updated: new Date().toISOString(),
      };
      this.upsertCustomer(cust);
    }

    // Seed existing high-priority intervention for 1001
    const initialIntv: ProposedIntervention = {
      intervention_id: 'intv-1001-init',
      customer_id: 1001,
      risk_event_id: 'risk-1001-init',
      transition_id: 'trans-1001-init',
      risk_score: 86,
      risk_level: 'CRITICAL',
      recommended_action: 'EXECUTIVE_ACCOUNT_REVIEWS',
      channel: 'EMAIL',
      priority: 'URGENT',
      offer_type: 'EXECUTIVE_CALL',
      discount_percent: 15,
      message: 'Hello Marcus, our VP of Customer Engineering would like to schedule a direct briefing to resolve your pipeline integration latency.',
      reasoning: 'Critical enterprise customer ($4,200/mo) with urgent negative sentiment and severe usage decline ahead of 5-day renewal.',
      requires_human_approval: true,
      policy_name: 'ENTERPRISE_VIP_ESCALATION',
      status: 'PENDING',
      confidence: 0.96,
      risk_model_version: RISK_MODEL_VERSION,
      policy_version: 'v1.1-governed',
      ai_model: 'claude-3-5-sonnet',
      prompt_version: 'retention-v2.0',
      schema_version: 3,
      idempotency_key: 'idemp-1001-init-v1.1',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    };
    this.interventions.set(initialIntv.intervention_id, initialIntv);

    this.recalculateTotalMRRExposed();
  }

  public upsertCustomer(cust: Customer360): void {
    const breakdown = calculateRiskBreakdown(cust, cust.aggregates);
    const score = breakdown.total_score;
    const level = classifyRiskLevel(score);

    cust.current_risk_score = score;
    cust.current_risk_level = level;
    cust.last_updated = new Date().toISOString();
    this.customers.set(cust.customer_id, cust);

    const reasons = generateRiskReasons(cust, cust.aggregates, breakdown);
    const mrrExposed = calculateMRRExposed(cust.monthly_value, level);
    const riskWeightedMRR = calculateRiskWeightedMRR(cust.monthly_value, score);

    const riskEvent: ChurnRiskEvent = {
      risk_event_id: `risk-${cust.customer_id}-${Date.now()}`,
      customer_id: cust.customer_id,
      risk_score: score,
      risk_level: level,
      breakdown,
      reasons,
      mrr_exposed: mrrExposed,
      risk_weighted_mrr: riskWeightedMRR,
      timestamp: new Date().toISOString(),
      processing_version: RISK_MODEL_VERSION,
    };
    this.riskEvents.set(cust.customer_id, riskEvent);

    // Add to history
    const history = this.riskHistory.get(cust.customer_id) || [];
    history.push({ timestamp: new Date().toISOString(), score });
    if (history.length > 20) history.shift();
    this.riskHistory.set(cust.customer_id, history);

    this.recalculateTotalMRRExposed();
  }

  public getCustomer(id: number): Customer360 | undefined {
    return this.customers.get(id);
  }

  public getAllCustomers(): Customer360[] {
    return Array.from(this.customers.values()).sort((a, b) => b.current_risk_score - a.current_risk_score);
  }

  public getRiskEvent(customerId: number): ChurnRiskEvent | undefined {
    return this.riskEvents.get(customerId);
  }

  public getRiskHistory(customerId: number): { timestamp: string; score: number }[] {
    return this.riskHistory.get(customerId) || [];
  }

  public addTransition(transition: RiskTransitionEvent): void {
    this.transitions.unshift(transition);
    if (this.transitions.length > 50) this.transitions.pop();
  }

  public getTransitions(): RiskTransitionEvent[] {
    return this.transitions;
  }

  public upsertIntervention(intervention: ProposedIntervention): void {
    this.interventions.set(intervention.intervention_id, intervention);
    this.metrics.active_interventions_count = Array.from(this.interventions.values()).filter(
      (i) => i.status === 'PENDING'
    ).length;
  }

  public getIntervention(id: string): ProposedIntervention | undefined {
    return this.interventions.get(id);
  }

  public getAllInterventions(): ProposedIntervention[] {
    return Array.from(this.interventions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public addAuditEvent(event: CustomerAuditEvent): void {
    this.auditEvents.unshift(event);
    if (this.auditEvents.length > 100) this.auditEvents.pop();
  }

  public getAuditEvents(customerId?: number): CustomerAuditEvent[] {
    if (customerId) {
      return this.auditEvents.filter((a) => a.customer_id === customerId);
    }
    return this.auditEvents;
  }

  public getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  public incrementMetric(
    key: 'ai_requests' | 'ai_success' | 'ai_failures' | 'ai_429s' | 'ai_calls_avoided_by_dedup',
    by = 1
  ): void {
    this.metrics[key] += by;
  }

  private recalculateTotalMRRExposed(): void {
    let total = 0;
    for (const c of this.customers.values()) {
      if (c.current_risk_level === 'CRITICAL' || c.current_risk_level === 'HIGH') {
        total += c.monthly_value;
      }
    }
    this.metrics.mrr_total_exposed = total;
  }
}

export const readStore = new ReadModelStore();
