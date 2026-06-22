import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import "@fontsource-variable/geist"
import "../index.css"
import Providers from "./providers"

export const metadata: Metadata = {
  metadataBase: new URL("https://tehilla.work"),
  title: "Tehilla : Creator Commerce",
  description:
    "Tehilla : creator commerce for Nigerian creators and the brands that pay them. Clean offers, escrowed funds, direct bank payouts.",
  keywords: [
    "Nigerian creators",
    "creator economy",
    "brand sponsorships",
    "influencer marketing",
    "Nigeria",
    "Tehilla",
    "escrow payments",
    "Paystack",
  ],
  authors: [{ name: "Tehilla" }],
  robots: { index: true, follow: true },
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
    title: "Tehilla : Creator Commerce",
    description:
      "The sponsorship desk for Nigerian creators and the brands that pay them. Clean offers, escrowed funds, direct bank payouts.",
    url: "https://tehilla.work",
    images: ["https://tehilla.work/tehilla-logo.png"],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tehilla : Creator Commerce",
    description:
      "The sponsorship desk for Nigerian creators and the brands that pay them. Clean offers, escrowed funds, direct bank payouts.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Async font loading mirrors the prior Vite index.html (Inter fallback family). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
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
