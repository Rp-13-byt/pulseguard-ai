import { RiskLevel, RiskTransitionEvent } from './event-types';

export function detectRiskTransition(
  customerId: number,
  prevScore: number,
  newScore: number,
  prevLevel: RiskLevel,
  newLevel: RiskLevel,
  hasUrgentTicket: boolean
): RiskTransitionEvent | null {
  const delta = newScore - prevScore;
  const levelChanged = prevLevel !== newLevel;
  const scoreJump = Math.abs(delta) >= 10;

  // If no material change, don't generate a transition event
  if (!levelChanged && !scoreJump && !hasUrgentTicket) {
    return null;
  }

  let triggerReason = 'SCORE_UPDATE';
  if (levelChanged) {
    triggerReason = `LEVEL_CHANGED_${prevLevel}_TO_${newLevel}`;
  } else if (hasUrgentTicket) {
    triggerReason = 'URGENT_SUPPORT_ESCALATION';
  } else if (scoreJump) {
    triggerReason = `SIGNIFICANT_SCORE_DELTA_${delta > 0 ? 'INCREASE' : 'DECREASE'}_${Math.abs(delta)}`;
  }

  // AI intervention only triggered when entering HIGH or CRITICAL, or worsening while in HIGH/CRITICAL
  const requiresAi =
    (newLevel === 'CRITICAL' || newLevel === 'HIGH') &&
    (levelChanged || delta >= 10 || hasUrgentTicket);

  return {
    transition_id: `trans-${customerId}-${Date.now()}`,
    customer_id: customerId,
    previous_score: prevScore,
    new_score: newScore,
    previous_level: prevLevel,
    new_level: newLevel,
    score_delta: delta,
    trigger_reason: triggerReason,
    timestamp: new Date().toISOString(),
    requires_ai_intervention: requiresAi,
  };
}
