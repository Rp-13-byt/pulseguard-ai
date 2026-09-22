import { z } from 'zod';
import { ProposedIntervention } from './event-types';

export const AIOutputSchema = z.object({
  recommended_action: z.string().min(3),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  channel: z.enum(['EMAIL', 'SLACK', 'IN_APP', 'CRM', 'PHONE']),
  offer_type: z.enum([
    'NONE',
    'DISCOUNT_10',
    'DISCOUNT_20',
    'EXECUTIVE_CALL',
    'PRIORITY_SUPPORT',
    'TRAINING_SESSION',
    'FEATURE_PREVIEW',
  ]),
  discount_percent: z.number().min(0).max(50).default(0),
  message: z.string().min(10),
  reasoning: z.string().min(10),
  requires_human_approval: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;

export function createIdempotencyKey(
  customerId: number,
  transitionId: string,
  policyVersion: string
): string {
  return `idemp-${customerId}-${transitionId}-${policyVersion}`;
}
