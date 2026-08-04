/**
 * Injects a JSON-LD structured data script. Server rendered, so crawlers see it
 * in the initial HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, server-built content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
