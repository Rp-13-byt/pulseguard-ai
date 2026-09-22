/**
 * Confluent Cloud Stream Catalog - Tag Creation Utility
 * Uses the Confluent Cloud Stream Catalog REST API to create classification tags.
 */
interface TagDefinition {
    name: string;
    description: string;
}
declare const TAGS: TagDefinition[];
declare function createStreamCatalogTags(): Promise<void>;
export { createStreamCatalogTags, TAGS };
