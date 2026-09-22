import {
  detectRiskTransition,
  classifyRiskLevel,
  SentimentType,
} from '@pulseguard/domain';
import { readStore } from '../readmodel/store';
import { sseBus } from '../sse/event-bus';
import { formulateRetentionIntervention } from './ai-agent';
import { processInterventionActionGate } from './action-gate';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class StreamSimulator {
  /**
   * Interactive Telemetry Button 1: Decrease Product Usage (-60%)
   */
  public static async simulateUsageDrop(customerId = 1017, dropPercent = -62) {
    const customer = readStore.getCustomer(customerId);
    if (!customer) return;

    const prevScore = customer.current_risk_score;
    const prevLevel = customer.current_risk_level;

    customer.aggregates.usage_change_percent = dropPercent;
    customer.aggregates.usage_last_7d_mins = 65;
    customer.aggregates.usage_last_24h_mins = 2;
    readStore.upsertCustomer(customer);

    const riskEvent = readStore.getRiskEvent(customerId)!;

    sseBus.broadcast('EVENT', {
      source: 'FAST_PATH (Product Telemetry)',
      event_type: 'USAGE_DECLINE_DETECTED',
      customer_id: customerId,
      detail: `Session telemetry dropped ${Math.abs(dropPercent)}% over last 7 days`,
      timestamp: new Date().toISOString(),
    });

    sseBus.broadcast('RISK_UPDATE', riskEvent);

    const transition = detectRiskTransition(
      customerId,
      prevScore,
      riskEvent.risk_score,
      prevLevel,
      riskEvent.risk_level,
      false
    );

    if (transition) {
      readStore.addTransition(transition);
      sseBus.broadcast('TRANSITION', transition);

      if (transition.requires_ai_intervention) {
        const intervention = await formulateRetentionIntervention(customer, riskEvent, transition.transition_id);
        await processInterventionActionGate(intervention);
      }
    }
  }

  /**
   * Interactive Telemetry Button 2: Open Support Ticket with Frustrated Sentiment
   */
  public static async simulateSupportTicket(
    customerId = 1017,
    sentiment: SentimentType = 'URGENT_NEGATIVE',
    subject = 'Critical integration failure in production',
    message = 'Our core billing export has failed 3 times. We are unable to invoice customers and renewal is next week!'
  ) {
    const customer = readStore.getCustomer(customerId);
    if (!customer) return;

    const prevScore = customer.current_risk_score;
    const prevLevel = customer.current_risk_level;

    customer.aggregates.tickets_last_7d += 1;
    customer.aggregates.unresolved_tickets += 1;
    customer.aggregates.negative_tickets_last_7d += 1;
    customer.aggregates.latest_sentiment = sentiment;
    readStore.upsertCustomer(customer);

    const riskEvent = readStore.getRiskEvent(customerId)!;

    sseBus.broadcast('EVENT', {
      source: 'SUPPORT_PATH (Zendesk Source Connector)',
      event_type: 'SUPPORT_TICKET_RECEIVED',
      customer_id: customerId,
      subject,
      sentiment,
      detail: message,
      timestamp: new Date().toISOString(),
    });

    sseBus.broadcast('RISK_UPDATE', riskEvent);

    const transition = detectRiskTransition(
      customerId,
      prevScore,
      riskEvent.risk_score,
      prevLevel,
      riskEvent.risk_level,
      sentiment === 'URGENT_NEGATIVE'
    );

    if (transition) {
      readStore.addTransition(transition);
      sseBus.broadcast('TRANSITION', transition);

      if (transition.requires_ai_intervention) {
        const intervention = await formulateRetentionIntervention(customer, riskEvent, transition.transition_id);
        await processInterventionActionGate(intervention);
      }
    }
  }

  /**
   * Interactive Telemetry Button 3: Cancel Order / Purchase Inactivity
   */
  public static async simulateOrderInactivity(customerId = 1017, daysSinceOrder = 36) {
    const customer = readStore.getCustomer(customerId);
    if (!customer) return;

    const prevScore = customer.current_risk_score;
    const prevLevel = customer.current_risk_level;

    customer.aggregates.days_since_last_order = daysSinceOrder;
    customer.aggregates.orders_last_30d = 0;
    readStore.upsertCustomer(customer);

    const riskEvent = readStore.getRiskEvent(customerId)!;

    sseBus.broadcast('EVENT', {
      source: 'OPERATIONAL_PATH (PostgreSQL CDC V2)',
      event_type: 'ORDER_INACTIVITY_ALERT',
      customer_id: customerId,
      detail: `No completed purchases for ${daysSinceOrder} days`,
      timestamp: new Date().toISOString(),
    });

    sseBus.broadcast('RISK_UPDATE', riskEvent);

    const transition = detectRiskTransition(
      customerId,
      prevScore,
      riskEvent.risk_score,
      prevLevel,
      riskEvent.risk_level,
      false
    );

    if (transition) {
      readStore.addTransition(transition);
      sseBus.broadcast('TRANSITION', transition);

      if (transition.requires_ai_intervention) {
        const intervention = await formulateRetentionIntervention(customer, riskEvent, transition.transition_id);
        await processInterventionActionGate(intervention);
      }
    }
  }

  /**
   * Interactive Telemetry Button 4: Payment Failure Simulation
   */
  public static async simulatePaymentFailure(customerId = 1017) {
    const customer = readStore.getCustomer(customerId);
    if (!customer) return;

    customer.lifecycle_status = 'AT_RISK';
    readStore.upsertCustomer(customer);

    sseBus.broadcast('EVENT', {
      source: 'OPERATIONAL_PATH (PostgreSQL CDC V2)',
      event_type: 'PAYMENT_FAILED_TRANSACTION',
      customer_id: customerId,
      detail: `Monthly invoice recurring charge declined ($${customer.monthly_value})`,
      timestamp: new Date().toISOString(),
    });

    await this.simulateSupportTicket(
      customerId,
      'NEGATIVE',
      'Billing declined notification',
      'Please check credit card on file.'
    );
  }

  /**
   * Interactive Telemetry Button 5: Renewal Proximity Alert (< 8 Days)
   */
  public static async simulateRenewalAlert(customerId = 1017, daysLeft = 7) {
    const customer = readStore.getCustomer(customerId);
    if (!customer) return;

    customer.aggregates.days_until_renewal = daysLeft;
    readStore.upsertCustomer(customer);

    const riskEvent = readStore.getRiskEvent(customerId)!;

    sseBus.broadcast('EVENT', {
      source: 'OPERATIONAL_PATH (PostgreSQL CDC V2)',
      event_type: 'RENEWAL_WINDOW_ENTERED',
      customer_id: customerId,
      detail: `Annual subscription renewal approaching in ${daysLeft} days`,
      timestamp: new Date().toISOString(),
    });

    sseBus.broadcast('RISK_UPDATE', riskEvent);
  }

  /**
   * Interactive Telemetry Button 6: Customer Rebound & Recovery (Healthy return)
   */
  public static async simulateCustomerRecovery(customerId = 1017) {
    const customer = readStore.getCustomer(customerId);
    if (!customer) return;

    const prevScore = customer.current_risk_score;
    const prevLevel = customer.current_risk_level;

    customer.aggregates.usage_change_percent = 12.5;
    customer.aggregates.usage_last_7d_mins = 420;
    customer.aggregates.orders_last_30d = 2;
    customer.aggregates.days_since_last_order = 1;
    customer.aggregates.unresolved_tickets = 0;
    customer.aggregates.negative_tickets_last_7d = 0;
    customer.aggregates.latest_sentiment = 'POSITIVE';
    customer.lifecycle_status = 'ACTIVE';
    readStore.upsertCustomer(customer);

    const riskEvent = readStore.getRiskEvent(customerId)!;

    sseBus.broadcast('EVENT', {
      source: 'FAST_PATH (Product Telemetry)',
      event_type: 'CUSTOMER_HEALTH_RECOVERED',
      customer_id: customerId,
      detail: 'Session activity rebounded +12%, support ticket resolved, orders resumed',
      timestamp: new Date().toISOString(),
    });

    sseBus.broadcast('RISK_UPDATE', riskEvent);

    const transition = detectRiskTransition(
      customerId,
      prevScore,
      riskEvent.risk_score,
      prevLevel,
      riskEvent.risk_level,
      false
    );

    if (transition) {
      readStore.addTransition(transition);
      sseBus.broadcast('TRANSITION', transition);
    }
  }

  /**
   * MASTER CENTERPIECE DEMO: Full Golden Path State-Machine Walkthrough (Customer 1017)
   */
  public static async runFullChurnWalkthrough(customerId = 1017) {
    // Step 1: Baseline Healthy State
    sseBus.broadcast('SCENARIO_STEP', {
      step: 1,
      title: 'Baseline Healthy State',
      detail: 'Customer 1017 is Acme Global ($3,450/mo Enterprise). Churn Risk is currently 14 (LOW).',
    });
    await sleep(1500);

    // Step 2: Telemetry Fast Path - Usage Collapse
    sseBus.broadcast('SCENARIO_STEP', {
      step: 2,
      title: 'Usage Collapse (-62%)',
      detail: 'Product telemetry streams show sudden decline in daily export volume.',
    });
    await this.simulateUsageDrop(customerId, -62);
    await sleep(2000);

    // Step 3: Operational Path - Inactivity Detected
    sseBus.broadcast('SCENARIO_STEP', {
      step: 3,
      title: 'Order Inactivity',
      detail: 'PostgreSQL CDC captures 35 days without a single order or add-on seat purchase.',
    });
    await this.simulateOrderInactivity(customerId, 35);
    await sleep(2000);

    // Step 4: Support Path - Urgent Zendesk Ticket
    sseBus.broadcast('SCENARIO_STEP', {
      step: 4,
      title: 'Urgent Support Crisis',
      detail: 'Zendesk connector ingests urgent negative ticket regarding recurring API timeouts.',
    });
    await this.simulateSupportTicket(
      customerId,
      'URGENT_NEGATIVE',
      'Production pipeline failed 4 times this week',
      'Our team is blocked and considering alternatives before our renewal contract next week.'
    );
    await sleep(2000);

    // Step 5: Flink Multi-Stream Windowed Calculation
    const updatedRisk = readStore.getRiskEvent(customerId)!;
    sseBus.broadcast('SCENARIO_STEP', {
      step: 5,
      title: 'Flink Deterministic Scoring',
      detail: `Flink recalculates score: ${updatedRisk.risk_score}/100 -> CRITICAL. All 6 points categories explained.`,
    });
    await sleep(1500);

    // Step 6: Claude AI Inference & Policy Validation
    sseBus.broadcast('SCENARIO_STEP', {
      step: 6,
      title: 'Claude AI Reasoning & Policy Guardrails',
      detail: 'Claude analyzes context and proposes executive outreach. Policy holds for Human Approval.',
    });
  }
}
