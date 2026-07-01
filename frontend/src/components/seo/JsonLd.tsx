/**
 * JsonLd — server component that injects Schema.org structured data.
 * Never mark this "use client"; it must run server-side only.
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint: dangerouslySetInnerHTML is required here for ld+json
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
