/**
 * Confluent Stream Catalog Field-Level Tagging Script
 * Tags sensitive fields with PII, FINANCIAL, and SENSITIVE classifications with retry backoff.
 */
interface FieldTagMapping {
    entityName: string;
    field: string;
    tag: 'PII' | 'FINANCIAL' | 'SENSITIVE';
}
declare const FIELD_TAGS: FieldTagMapping[];
declare function tagFieldsWithRetry(maxRetries?: number): Promise<void>;
export { tagFieldsWithRetry, FIELD_TAGS };
