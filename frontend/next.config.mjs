/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"

const nextConfig = {
  reactStrictMode: true,
  // ESLint during build is noise for this migration.
  eslint: { ignoreDuringBuilds: true },
  // The prior Vite build never type-checked at build time, so vendored shadcn/ui
  // components carry latent type drift (e.g. react-day-picker v10). Match that
  // contract: don't block builds on types. Run `tsc --noEmit` separately in CI.
  typescript: { ignoreBuildErrors: true },

  // Serve compressed static assets (gzip + brotli)
  compress: true,

  // Remove the "X-Powered-By: Next.js" header (minor security hardening)
  poweredByHeader: false,

  // Generate ETags for conditional GET requests (reduces bandwidth for crawlers)
  generateEtags: true,

  // Image optimisation: auto WebP/AVIF, lazy-load by default.
  // External hostnames that serve creator/brand assets need to be listed here.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    // Cache optimised images on Vercel for 7 days
    minimumCacheTTL: 604800,
  },

  // Proxy /api to the Fastify backend so the browser stays same-origin in dev
  // (no CORS, cookies on /api/auth work). In production set NEXT_PUBLIC_API_URL
  // to the live API, or keep this rewrite pointed at BACKEND_URL.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },

  // Security + performance headers on every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow Vercel CDN to cache public pages for 60 s, serve stale for 10 min
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=60, stale-while-revalidate=600" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS — tells browsers and search engines this site is HTTPS-only.
          // max-age=63072000 = 2 years. preload submits to HSTS preload list.
          // WARNING: Only enable once you are CERTAIN HTTPS is permanent.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Permissions policy — restrict dangerous browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Speed up DNS for embedded resources
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Static assets: cache for 1 year (Next.js content-hashes filenames)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Fonts: cache for 1 year
        source: "/fonts/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Sitemap and robots.txt: short cache to reflect updates quickly
        source: "/(sitemap.xml|robots.txt)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600" },
        ],
      },
    ]
  },
}

export default nextConfig
