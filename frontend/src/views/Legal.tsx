import { Link } from "@/lib/router"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"

const sections = [
  {
    id: "terms",
    title: "Terms of Service",
    content: [
      "By using Tehilla, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
      "Tehilla connects brands and creators for sponsorship collaborations. Users must provide accurate information including profile details, bank accounts, and tax identifiers.",
      "Brands fund offers upfront. Funds are held in escrow until the creator submits completed work and the brand approves it. Once approved, payments are processed through Paystack to the creator's verified bank account.",
      "Disputed offers are reviewed by Tehilla support. During a dispute, payouts may be paused until both parties provide sufficient evidence and a resolution is reached.",
      "Users are responsible for maintaining the confidentiality of their account credentials. Any activity under your account is your responsibility.",
      "Tehilla reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: [
      "Tehilla collects and processes personal data to operate the marketplace. This includes account information, profile details, transaction records, and communication history.",
      "We use Paystack to process payments. Your payment details are handled securely by Paystack and are never stored in full on our servers.",
      "We collect usage data and analytics to improve our platform. This includes page views, feature usage, and error reports.",
      "We do not sell your personal data to third parties. Data is shared only with trusted service providers necessary for platform operation.",
      "You have the right to request access to, correction of, or deletion of your personal data. Contact support@tehilla.work for such requests.",
      "We retain your data for as long as your account is active and for a reasonable period thereafter to comply with legal obligations.",
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    content: [
      "Tehilla uses cookies and similar technologies to enhance your experience, analyze platform usage, and provide essential functionality.",
      "Essential cookies are required for the platform to function properly, including authentication sessions and security features.",
      "Analytics cookies help us understand how users interact with Tehilla so we can improve the platform.",
      "You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.",
      "Third-party services integrated with Tehilla (such as Paystack) may set their own cookies subject to their respective privacy policies.",
    ],
  },
]

export default function Legal() {
  return (
    <MarketingLayout>
      <Section className="pt-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">Legal</h1>
          <p className="mt-2 text-body-sm text-[#8d8d8d]">Last updated: June 2026</p>
          <p className="mt-6 text-[13.7px] text-[#666] leading-relaxed">
            Welcome to Tehilla. This page outlines the terms, privacy practices, and cookie usage that govern your use of our platform.
          </p>

          <hr className="my-12 border-[#d8d8d8]" />

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-16">
              <h2 className="font-runde text-[21.8px] sm:text-[29.1px] font-semibold text-[#0f0f0f] leading-tight tracking-tight">
                {section.title}
              </h2>
              <div className="mt-6 space-y-4">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-[13.7px] text-[#666] leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <hr className="my-12 border-[#d8d8d8]" />

          <p className="text-body-sm text-[#666]">
            Questions about these policies? Contact us at{" "}
            <Link to="mailto:support@tehilla.work" className="text-[#0098f2] underline underline-offset-2 hover:text-[#0098f2]/80 transition-colors">
              support@tehilla.work
            </Link>
          </p>
        </div>
      </Section>
    </MarketingLayout>
  )
}
