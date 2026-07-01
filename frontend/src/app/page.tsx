import type { Metadata } from "next"
import HomeView from "@/pages/marketing/Home"
import { JsonLd } from "@/components/seo/JsonLd"

export const metadata: Metadata = {
  title: "Tehilla — Creator Commerce for Nigerian Creators & Brands",
  description:
    "Tehilla connects Nigerian content creators with brands for sponsorship deals. Clean offers, escrowed funds, direct bank payouts via Paystack. Join Nigeria's fastest-growing creator marketplace.",
  alternates: {
    canonical: "https://tehilla.work",
  },
  openGraph: {
    title: "Tehilla — Creator Commerce for Nigerian Creators & Brands",
    description:
      "Clean offers, escrowed funds, direct bank payouts. The sponsorship desk for Nigerian creators and the brands that pay them.",
    url: "https://tehilla.work",
    images: [{ url: "https://tehilla.work/tehilla-logo.png", width: 1200, height: 630, alt: "Tehilla Creator Commerce" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tehilla — Creator Commerce for Nigerian Creators & Brands",
    description:
      "Clean offers, escrowed funds, direct bank payouts. The sponsorship desk for Nigerian creators and the brands that pay them.",
    images: ["https://tehilla.work/tehilla-logo.png"],
  },
}

// FAQ data duplicated here so JSON-LD is built server-side
// (Home.tsx view owns the rendered FAQ; this is only for structured data)
const homeFaqs = [
  {
    question: "What is Tehilla?",
    answer:
      "Tehilla is a Nigerian creator marketplace that connects content creators with brands for sponsorship deals. Creators get discovered, receive offers, and get paid directly to their bank accounts.",
  },
  {
    question: "How much does it cost for creators?",
    answer:
      "Tehilla operates on a subscription model. Choose a plan that fits your growth stage; each tier unlocks more brand visibility, campaign slots, and features. A 10% platform fee also applies on every completed sponsorship. Visit our Pricing page to compare plans.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Once you complete a sponsorship and the brand approves your work, the funds are released from escrow directly to your verified Nigerian bank account through Paystack. Payouts typically arrive within 24 hours.",
  },
  {
    question: "How does the escrow system work?",
    answer:
      "When a brand sends you an offer and you accept, the brand funds the deal upfront. The money sits in secure escrow. Once you deliver the agreed work and the brand approves it, the funds are released to you. Both parties are protected.",
  },
  {
    question: "What kind of creators can join?",
    answer:
      "Any Nigerian content creator with an engaged audience can join. Whether you're a YouTuber, Instagram influencer, TikTok creator, podcaster, blogger, or Twitter/X personality; if you have influence, you can monetize it on Tehilla.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. We use industry-standard encryption, comply with NDPR (Nigeria Data Protection Regulation), and process all payments through Paystack, a PCI-compliant payment processor.",
  },
]

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tehilla",
    url: "https://tehilla.work",
    description: "Nigeria's creator commerce platform for sponsorship deals between content creators and brands.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://tehilla.work/for-creators?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tehilla",
    url: "https://tehilla.work",
    logo: {
      "@type": "ImageObject",
      url: "https://tehilla.work/Tehilla_logo_new.svg",
      width: 200,
      height: 60,
    },
    description:
      "Tehilla is Nigeria's creator commerce platform connecting content creators with brands through secure, escrowed sponsorship deals.",
    areaServed: { "@type": "Country", name: "Nigeria" },
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@tehilla.work",
      contactType: "customer support",
      availableLanguage: "English",
    },
    foundingDate: "2024",
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
]

// Server Component — no "use client" — renders with SSR so Googlebot sees full HTML
export default function HomePage() {
  return (
    <>
      <JsonLd schema={homeJsonLd as unknown as Record<string, unknown>} />
      <HomeView />
    </>
  )
}
