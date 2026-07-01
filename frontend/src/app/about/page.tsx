import type { Metadata } from "next"
import AboutView from "@/pages/marketing/About"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = {
  title: "About Tehilla — Building Creator Commerce in Africa",
  description:
    "Tehilla was built to bridge the gap between Africa's best content creators and the brands that want to work with them. Learn our mission, values, and team.",
  alternates: {
    canonical: "https://tehilla.work/about",
  },
  openGraph: {
    title: "About Tehilla — Building Creator Commerce in Africa",
    description:
      "We believe African creators deserve a platform that pays them fairly, connects them with top brands, and respects their craft.",
    url: "https://tehilla.work/about",
    images: [{ url: "https://tehilla.work/tehilla-logo.png", width: 1200, height: 630, alt: "About Tehilla" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Tehilla — Building Creator Commerce in Africa",
    description:
      "We believe African creators deserve a platform that pays them fairly, connects them with top brands, and respects their craft.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
}

const aboutJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tehilla",
    url: "https://tehilla.work",
    logo: "https://tehilla.work/Tehilla_logo_new.svg",
    description:
      "Tehilla is Nigeria's creator commerce platform connecting content creators with brands for sponsorship deals, with secure escrow payments through Paystack.",
    foundingDate: "2024",
    areaServed: "NG",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@tehilla.work",
      contactType: "customer support",
    },
    sameAs: [],
    employee: [
      {
        "@type": "Person",
        name: "Mathias Anthony",
        jobTitle: "Founder & CEO",
      },
      {
        "@type": "Person",
        name: "Samuel Otu",
        jobTitle: "Head of Engineering",
      },
      {
        "@type": "Person",
        name: "Peace Eku",
        jobTitle: "Head of Compliance",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Tehilla",
    url: "https://tehilla.work/about",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://tehilla.work" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://tehilla.work/about" },
      ],
    },
  },
]

// Server Component — no "use client" — Next.js will SSR this page
export default function AboutPage() {
  return (
    <>
      <JsonLd schema={aboutJsonLd as unknown as Record<string, unknown>} />
      <AboutView />
    </>
  )
}
