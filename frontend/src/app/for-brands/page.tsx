import type { Metadata } from "next"
import ForBrandsView from "@/pages/marketing/ForBrands"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = {
  title: "For Brands — Launch Influencer Campaigns That Convert | Tehilla",
  description:
    "Discover vetted Nigerian content creators, send campaign briefs, and pay with confidence through Paystack escrow. Tehilla is the creator commerce platform for brands.",
  alternates: {
    canonical: "https://tehilla.work/for-brands",
  },
  openGraph: {
    title: "For Brands — Launch Influencer Campaigns That Convert | Tehilla",
    description:
      "Discover vetted Nigerian content creators, manage campaigns, and pay with confidence through Paystack escrow.",
    url: "https://tehilla.work/for-brands",
    images: [{ url: "https://tehilla.work/tehilla-logo.png", width: 1200, height: 630, alt: "Tehilla for Brands" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "For Brands — Launch Influencer Campaigns That Convert | Tehilla",
    description:
      "Discover vetted Nigerian content creators, manage campaigns, and pay with confidence through Paystack escrow.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
}

const brandsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Tehilla for Brands",
  description:
    "Brands discover vetted Nigerian content creators, launch influencer campaigns, and pay securely through Paystack escrow.",
  url: "https://tehilla.work/for-brands",
  isPartOf: {
    "@type": "WebSite",
    name: "Tehilla",
    url: "https://tehilla.work",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tehilla.work" },
      { "@type": "ListItem", position: 2, name: "For Brands", item: "https://tehilla.work/for-brands" },
    ],
  },
}

// Server Component — no "use client" — Next.js will SSR this page
export default function ForBrandsPage() {
  return (
    <>
      <JsonLd schema={brandsJsonLd} />
      <ForBrandsView />
    </>
  )
}
