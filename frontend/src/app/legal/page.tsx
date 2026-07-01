import type { Metadata } from "next"
import LegalView from "@/pages/Legal"

export const metadata: Metadata = {
  title: "Legal — Terms & Privacy | Tehilla",
  description: "Tehilla's terms of service and privacy policy. Read how we handle your data and what you agree to when using our platform.",
  alternates: {
    canonical: "https://tehilla.work/legal",
  },
  // Legal pages should be indexed for trust, but not priority-ranked
  robots: {
    index: true,
    follow: true,
    noarchive: true,
  },
}

// Server Component — no "use client" — Next.js will SSR this page
export default function LegalPage() {
  return <LegalView />
}
