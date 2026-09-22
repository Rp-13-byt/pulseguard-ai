/**
 * Confluent Cloud Stream Catalog - Tag Creation Utility
 * Uses the Confluent Cloud Stream Catalog REST API to create classification tags.
 */

interface TagDefinition {
  name: string;
  description: string;
}

const TAGS: TagDefinition[] = [
  { name: 'PII', description: 'Personally Identifiable Information requiring strict access controls and redaction' },
  { name: 'FINANCIAL', description: 'Monetary, revenue, pricing or transaction-related sensitive fields' },
  { name: 'SENSITIVE', description: 'Support transcripts, customer sentiment, or private communication' },
  { name: 'PUBLIC', description: 'Non-sensitive public reference data' },
];

async function createStreamCatalogTags() {
  const srUrl = process.env.CONFLUENT_SCHEMA_REGISTRY_URL;
  const apiKey = process.env.CONFLUENT_SCHEMA_REGISTRY_API_KEY;
  const apiSecret = process.env.CONFLUENT_SCHEMA_REGISTRY_API_SECRET;

  if (!srUrl || !apiKey || !apiSecret) {
    console.log('[Stream Catalog] Missing Schema Registry credentials. Tag definitions documented for live deployment:');
    TAGS.forEach((tag) => console.log(`  - [${tag.name}] ${tag.description}`));
    return;
  }

  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  for (const tag of TAGS) {
    try {
      console.log(`[Stream Catalog] Creating tag: ${tag.name}...`);
      const res = await fetch(`${srUrl}/catalog/v1/types/tagdefs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify([
          {
            name: tag.name,
            description: tag.description,
          },
        ]),
      });

      if (res.ok || res.status === 409) {
        console.log(`[Stream Catalog] Tag ${tag.name} ready (Status: ${res.status}).`);
      } else {
        const text = await res.text();
        console.warn(`[Stream Catalog] Tag ${tag.name} returned status ${res.status}: ${text}`);
      }
    } catch (err) {
      console.error(`[Stream Catalog] Error creating tag ${tag.name}:`, err);
    }
  }
}

if (require.main === module) {
  createStreamCatalogTags().catch(console.error);
}

export { createStreamCatalogTags, TAGS };
