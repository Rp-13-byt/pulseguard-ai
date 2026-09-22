import { Router, Request, Response } from 'express';

const TAGS = [
  { name: 'PII', description: 'Personally Identifiable Information requiring strict access controls and redaction' },
  { name: 'FINANCIAL', description: 'Monetary, revenue, pricing or transaction-related sensitive fields' },
  { name: 'SENSITIVE', description: 'Support transcripts, customer sentiment, or private communication' },
  { name: 'PUBLIC', description: 'Non-sensitive public reference data' },
];

const FIELD_TAGS = [
  { entityName: 'pulseguard.cdc.public.customers-value', field: 'email', tag: 'PII' },
  { entityName: 'pulseguard.cdc.public.customers-value', field: 'first_name', tag: 'PII' },
  { entityName: 'pulseguard.cdc.public.customers-value', field: 'last_name', tag: 'PII' },
  { entityName: 'pulseguard.cdc.public.customers-value', field: 'monthly_value', tag: 'FINANCIAL' },
  { entityName: 'pulseguard.cdc.public.orders-value', field: 'amount', tag: 'FINANCIAL' },
  { entityName: 'pulseguard.zendesk.tickets-value', field: 'message', tag: 'SENSITIVE' },
  { entityName: 'pulseguard.zendesk.tickets-value', field: 'sentiment', tag: 'SENSITIVE' },
  { entityName: 'pulseguard.customer.risk-value', field: 'mrr_exposed', tag: 'FINANCIAL' },
];

export const governanceRouter = Router();

const SCHEMAS_METADATA = [
  {
    name: 'Customer',
    subject: 'pulseguard.cdc.public.customers-value',
    version: 4,
    compatibility: 'BACKWARD',
    owner: 'Customer Operations Team',
    tags: ['PII', 'FINANCIAL'],
  },
  {
    name: 'Order',
    subject: 'pulseguard.cdc.public.orders-value',
    version: 2,
    compatibility: 'BACKWARD',
    owner: 'Billing & Commerce Team',
    tags: ['FINANCIAL'],
  },
  {
    name: 'ProductEvent',
    subject: 'pulseguard.product.events-value',
    version: 3,
    compatibility: 'FULL',
    owner: 'Telemetry Engineering',
    tags: ['PUBLIC'],
  },
  {
    name: 'SupportTicket',
    subject: 'pulseguard.zendesk.tickets-value',
    version: 2,
    compatibility: 'BACKWARD',
    owner: 'Support Platform Team',
    tags: ['SENSITIVE'],
  },
  {
    name: 'CustomerRisk',
    subject: 'pulseguard.customer.risk-value',
    version: 3,
    compatibility: 'BACKWARD',
    owner: 'Flink Analytics & Intelligence',
    tags: ['FINANCIAL', 'INTERNAL'],
  },
  {
    name: 'ProposedIntervention',
    subject: 'pulseguard.customer.interventions.proposed-value',
    version: 3,
    compatibility: 'FULL',
    owner: 'AI Governance Board',
    tags: ['CONFIDENTIAL'],
  },
];

const STREAM_LINEAGE = {
  tier: 'Stream Governance Essentials (Live 10-Minute Lineage)',
  nodes: [
    { id: 'src-pg', label: 'PostgreSQL DB', type: 'source', status: 'ACTIVE' },
    { id: 'conn-cdc', label: 'PostgreSQL CDC V2', type: 'connector', status: 'RUNNING' },
    { id: 'src-tel', label: 'Product Telemetry', type: 'source', status: 'ACTIVE' },
    { id: 'conn-zen', label: 'Zendesk Source', type: 'connector', status: 'RUNNING' },
    { id: 'top-cdc-cust', label: 'pulseguard.cdc.customers', type: 'topic', status: 'ACTIVE' },
    { id: 'top-cdc-ord', label: 'pulseguard.cdc.orders', type: 'topic', status: 'ACTIVE' },
    { id: 'top-tel', label: 'pulseguard.product.events', type: 'topic', status: 'ACTIVE' },
    { id: 'top-zen', label: 'pulseguard.zendesk.tickets', type: 'topic', status: 'ACTIVE' },
    { id: 'flink-norm', label: 'Flink Normalization', type: 'flink', status: 'RUNNING' },
    { id: 'flink-agg', label: 'Flink Decomposed Aggs', type: 'flink', status: 'RUNNING' },
    { id: 'flink-score', label: 'Flink Risk Engine (0-100)', type: 'flink', status: 'RUNNING' },
    { id: 'flink-ai', label: 'Claude AI Inference', type: 'ai', status: 'RUNNING' },
    { id: 'top-risk', label: 'pulseguard.customer.risk', type: 'topic', status: 'ACTIVE' },
    { id: 'top-intv', label: 'pulseguard.customer.interventions', type: 'topic', status: 'ACTIVE' },
    { id: 'act-gate', label: 'Node Action Gate', type: 'gateway', status: 'RUNNING' },
    { id: 'out-hook', label: 'CRM / Slack Webhook', type: 'sink', status: 'ACTIVE' },
  ],
  edges: [
    { from: 'src-pg', to: 'conn-cdc' },
    { from: 'conn-cdc', to: 'top-cdc-cust' },
    { from: 'conn-cdc', to: 'top-cdc-ord' },
    { from: 'src-tel', to: 'top-tel' },
    { from: 'conn-zen', to: 'top-zen' },
    { from: 'top-cdc-cust', to: 'flink-norm' },
    { from: 'top-cdc-ord', to: 'flink-agg' },
    { from: 'top-tel', to: 'flink-agg' },
    { from: 'top-zen', to: 'flink-agg' },
    { from: 'flink-norm', to: 'flink-agg' },
    { from: 'flink-agg', to: 'flink-score' },
    { from: 'flink-score', to: 'top-risk' },
    { from: 'flink-score', to: 'flink-ai' },
    { from: 'flink-ai', to: 'top-intv' },
    { from: 'top-intv', to: 'act-gate' },
    { from: 'act-gate', to: 'out-hook' },
  ],
};

governanceRouter.get('/schemas', (_req: Request, res: Response) => {
  res.json({
    total: SCHEMAS_METADATA.length,
    schemas: SCHEMAS_METADATA,
  });
});

governanceRouter.get('/tags', (_req: Request, res: Response) => {
  res.json({
    tags: TAGS,
    field_tags: FIELD_TAGS,
  });
});

governanceRouter.get('/lineage', (_req: Request, res: Response) => {
  res.json(STREAM_LINEAGE);
});
