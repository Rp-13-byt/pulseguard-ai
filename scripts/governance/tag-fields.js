"use strict";
/**
 * Confluent Stream Catalog Field-Level Tagging Script
 * Tags sensitive fields with PII, FINANCIAL, and SENSITIVE classifications with retry backoff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIELD_TAGS = void 0;
exports.tagFieldsWithRetry = tagFieldsWithRetry;
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
exports.FIELD_TAGS = FIELD_TAGS;
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
async function tagFieldsWithRetry(maxRetries = 3) {
    const srUrl = process.env.CONFLUENT_SCHEMA_REGISTRY_URL;
    const apiKey = process.env.CONFLUENT_SCHEMA_REGISTRY_API_KEY;
    const apiSecret = process.env.CONFLUENT_SCHEMA_REGISTRY_API_SECRET;
    if (!srUrl || !apiKey || !apiSecret) {
        console.log('[Stream Catalog] Missing credentials. Catalog field tags defined:');
        FIELD_TAGS.forEach((item) => console.log(`  - ${item.entityName}.${item.field} -> [${item.tag}]`));
        return;
    }
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    for (const item of FIELD_TAGS) {
        let attempts = 0;
        let success = false;
        while (attempts < maxRetries && !success) {
            attempts++;
            try {
                console.log(`[Stream Catalog] Tagging ${item.entityName}.${item.field} with ${item.tag} (Attempt ${attempts})...`);
                const res = await fetch(`${srUrl}/catalog/v1/entity/tags`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authHeader,
                    },
                    body: JSON.stringify([
                        {
                            entityName: `${item.entityName}.${item.field}`,
                            typeName: item.tag,
                        },
                    ]),
                });
                if (res.ok || res.status === 409) {
                    console.log(`[Stream Catalog] Successfully tagged ${item.field} -> ${item.tag}`);
                    success = true;
                }
                else {
                    console.warn(`[Stream Catalog] Attempt ${attempts} returned ${res.status}. Retrying in 2s...`);
                    await sleep(2000);
                }
            }
            catch (err) {
                console.error(`[Stream Catalog] Error tagging ${item.field}:`, err);
                await sleep(2000);
            }
        }
    }
}
if (require.main === module) {
    tagFieldsWithRetry().catch(console.error);
}
