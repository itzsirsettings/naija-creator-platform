import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import "@fontsource-variable/geist"
import "../index.css"
import Providers from "./providers"

export const metadata: Metadata = {
  metadataBase: new URL("https://tehilla.work"),
  // Default title/description — individual pages override these via their own `export const metadata`
  title: {
    default: "Tehilla — Creator Commerce for Nigerian Creators & Brands",
    template: "%s | Tehilla",
  },
  description:
    "Tehilla connects Nigerian content creators with brands for sponsorship deals. Clean offers, escrowed funds, direct bank payouts via Paystack.",
  keywords: [
    "Nigerian creators",
    "creator economy",
    "brand sponsorships",
    "influencer marketing",
    "Nigeria",
    "Tehilla",
    "escrow payments",
    "Paystack",
    "creator marketplace",
    "influencer platform Nigeria",
  ],
  authors: [{ name: "Tehilla", url: "https://tehilla.work" }],
  creator: "Tehilla",
  publisher: "Tehilla",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Root canonical — individual pages override this
  alternates: { canonical: "https://tehilla.work" },
  icons: {
    icon: [
      { url: "/Tehilla_logo_new.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/Tehilla_logo_new.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Tehilla",
    title: "Tehilla — Creator Commerce for Nigerian Creators & Brands",
    description:
      "Clean offers, escrowed funds, direct bank payouts. The sponsorship desk for Nigerian creators and the brands that pay them.",
    url: "https://tehilla.work",
    images: [
      {
        url: "https://tehilla.work/tehilla-logo.png",
        width: 1200,
        height: 630,
        alt: "Tehilla Creator Commerce",
      },
    ],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tehilla — Creator Commerce for Nigerian Creators & Brands",
    description:
      "Clean offers, escrowed funds, direct bank payouts. The sponsorship desk for Nigerian creators and the brands that pay them.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
  // Verification tokens — add when submitting to Google/Bing Search Console
  // verification: { google: "YOUR_GOOGLE_VERIFICATION_TOKEN" },
}

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        {/* ==========================================================
            PERFORMANCE: LCP preload for the mobile hero image.
            fetchpriority="high" tells the browser to start fetching
            this before layout/CSS parse completes (eliminates LCP delay).
            ========================================================== */}
        <link
          rel="preload"
          href="/mobile_hero.png"
          as="image"
          type="image/png"
          // @ts-expect-error — fetchpriority is valid HTML but missing from React types
          fetchpriority="high"
        />

        {/* Google Fonts — preconnect for latency, swap for CLS prevention */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />

        {/* CDN preconnects — reduces DNS lookup time for assets */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />

        {/* Payment infrastructure preconnects */}
        <link rel="preconnect" href="https://api.paystack.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.paystack.com" />
      </head>
      <body>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  )
}
