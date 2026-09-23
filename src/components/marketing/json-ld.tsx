/**
 * Renders one or more JSON-LD blocks. `<` is escaped so CMS content can never
 * break out of the script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown> | null> | null }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!items.length) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(items.length === 1 ? items[0] : items).replace(/</g, "\\u003c") }}
    />
  );
}
