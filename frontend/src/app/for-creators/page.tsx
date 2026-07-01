import type { Metadata } from "next"
import ForCreatorsView from "@/pages/marketing/ForCreators"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = {
  title: "For Creators — Monetize Your Influence | Tehilla",
  description:
    "Nigerian content creators: get discovered by top brands, receive clear sponsorship offers, and get paid directly to your bank account through Tehilla's creator marketplace.",
  alternates: {
    canonical: "https://tehilla.work/for-creators",
  },
  openGraph: {
    title: "For Creators — Monetize Your Influence | Tehilla",
    description:
      "Get discovered by top brands, receive clear sponsorship offers, and get paid directly to your Nigerian bank account.",
    url: "https://tehilla.work/for-creators",
    images: [{ url: "https://tehilla.work/tehilla-logo.png", width: 1200, height: 630, alt: "Tehilla for Creators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "For Creators — Monetize Your Influence | Tehilla",
    description:
      "Get discovered by top brands, receive clear sponsorship offers, and get paid directly to your Nigerian bank account.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
}

const creatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Tehilla for Creators",
  description:
    "Nigerian content creators get discovered by top brands and earn through secure sponsorships with escrowed payments.",
  url: "https://tehilla.work/for-creators",
  isPartOf: {
    "@type": "WebSite",
    name: "Tehilla",
    url: "https://tehilla.work",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tehilla.work" },
      { "@type": "ListItem", position: 2, name: "For Creators", item: "https://tehilla.work/for-creators" },
    ],
  },
}

// Server Component — no "use client" — Next.js will SSR this page
export default function ForCreatorsPage() {
  return (
    <>
      <JsonLd schema={creatorJsonLd} />
      <ForCreatorsView />
    </>
  )
}
