import type { Metadata } from "next"
import MarketingLayout from "@/components/MarketingLayout"
import PricingInteractive from "@/components/marketing/PricingInteractive"
import { JsonLd } from "@/components/seo/JsonLd"
import { PLANS } from "@/lib/tiers"
import { formatNaira } from "@/utils/format"

export const metadata: Metadata = {
  title: "Pricing — Creator & Brand Plans | Tehilla",
  description:
    "Choose a Tehilla plan. Creators from ₦0/month, brands from ₦15,000/month. Secure escrow payments, direct bank payouts, and 10% platform fee on completed deals.",
  alternates: {
    canonical: "https://tehilla.work/pricing",
  },
  openGraph: {
    title: "Pricing — Creator & Brand Plans | Tehilla",
    description:
      "Choose a Tehilla plan. Secure escrow payments, direct bank payouts, and 10% platform fee on completed deals.",
    url: "https://tehilla.work/pricing",
    images: [{ url: "https://tehilla.work/tehilla-logo.png", width: 1200, height: 630, alt: "Tehilla Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Creator & Brand Plans | Tehilla",
    description:
      "Choose a Tehilla plan. Secure escrow payments, direct bank payouts, and 10% platform fee on completed deals.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
}

// Build JSON-LD from the PLANS data at request time (server-side)
function buildPricingJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Tehilla",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://tehilla.work",
      description: "Nigeria's creator commerce platform for sponsorship deals between content creators and brands.",
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.monthlyPriceNaira,
        priceCurrency: "NGN",
        description: plan.description,
        url: `https://tehilla.work/pricing`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://tehilla.work" },
        { "@type": "ListItem", position: 2, name: "Pricing", item: "https://tehilla.work/pricing" },
      ],
    },
  ]
}

// Server Component — no "use client" — metadata + JSON-LD are SSR, interactivity is a client island
export default function PricingPage() {
  const jsonLd = buildPricingJsonLd()
  return (
    <MarketingLayout>
      <JsonLd schema={jsonLd as unknown as Record<string, unknown>} />
      <PricingInteractive />
    </MarketingLayout>
  )
}
