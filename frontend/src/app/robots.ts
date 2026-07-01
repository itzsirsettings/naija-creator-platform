import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tehilla.work"

// Block indexing on any non-production deployment (Vercel preview URLs)
const isProduction = BASE_URL === "https://tehilla.work"

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      host: BASE_URL,
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/app/",        // authenticated dashboard — never index
          "/admin/",      // admin panel
          "/api/",        // API routes
          "/_next/",      // Next.js internals
          "/discover",    // authenticated discovery feed
          "/offers",      // authenticated offer management
          "/payments",    // authenticated payments
          "/analytics",   // authenticated analytics
        ],
      },
      {
        // Block common AI scrapers that ignore robots.txt respect (known UAs)
        userAgent: ["GPTBot", "Google-Extended", "CCBot", "anthropic-ai"],
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
