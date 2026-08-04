/**
 * Injects a JSON-LD structured data script. Server rendered, so crawlers see it
 * in the initial HTML.
 *
 * The payload includes database-sourced strings (operator names, review bodies,
 * page titles). JSON.stringify does not escape "<", so a value containing
 * "</script>" would close the script tag and allow HTML/script injection. We
 * escape the characters that can break out of a script context.
 */
function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}
