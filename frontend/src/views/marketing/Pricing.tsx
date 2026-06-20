import { useState } from "react"
import { Link } from "@/lib/router"
import { ArrowUpRight, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for creators just getting started with brand deals.",
    features: ["Create your profile", "Receive brand offers", "Direct bank payouts", "Basic analytics", "Email support"],
    cta: "Get Started",
    href: "/register",
    featured: false,
  },
  {
    name: "Growth",
    price: "₦50,000",
    period: "/month",
    description: "For serious creators and growing brand teams.",
    features: ["Everything in Starter", "Advanced analytics", "Priority support", "Custom branding", "Campaign management", "Team access"],
    cta: "Start Free Trial",
    href: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For agencies and large brand partnerships.",
    features: ["Everything in Growth", "Dedicated account manager", "API access", "Custom integrations", "Bulk creator discounts", "SLA guarantee"],
    cta: "Contact Us",
    href: "/contact",
    featured: false,
  },
]

const comparisonFeatures = [
  { name: "Creator profile", free: true, growth: true, enterprise: true },
  { name: "Brand offers", free: true, growth: true, enterprise: true },
  { name: "Direct payouts", free: true, growth: true, enterprise: true },
  { name: "Basic analytics", free: true, growth: true, enterprise: true },
  { name: "Advanced analytics", free: false, growth: true, enterprise: true },
  { name: "Campaign management", free: false, growth: true, enterprise: true },
  { name: "Priority support", free: false, growth: true, enterprise: true },
  { name: "API access", free: false, growth: false, enterprise: true },
  { name: "Dedicated manager", free: false, growth: false, enterprise: true },
]

const faqs = [
  { q: "Is there a setup fee?", a: "No. There are no setup fees, hidden costs, or minimum commitments. You only pay when a deal is successfully completed." },
  { q: "How does the 10% platform fee work?", a: "We charge a flat 10% fee on every successful offer. For example, if a brand sends a ₦100,000 offer, ₦90,000 goes to the creator and ₦10,000 covers the platform fee." },
  { q: "Can I upgrade or downgrade my plan?", a: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle." },
  { q: "What payment methods do you support?", a: "We use Paystack for all transactions, supporting cards, bank transfers, USSD, and mobile money. Creators receive payouts directly to their verified Nigerian bank accounts." },
  { q: "Is there a contract or lock-in period?", a: "No contracts. You can use the platform on a month-to-month basis and cancel anytime. No questions asked." },
]

export default function Pricing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <MarketingLayout>
      {/* HEADER */}
      <Section className="pt-24 pb-8 text-center">
        <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">
          Simple, Transparent <span className="text-[#0098f2]">Pricing</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14.6px] text-[#666] leading-relaxed">
          No hidden fees, no surprises. Choose the plan that fits your needs.
        </p>
      </Section>

      {/* PRICING CARDS */}
      <Section noBorderB={true} noBorderY={false} className="pt-4 pb-12">
        <div className="grid gap-6 sm:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-2xl p-8 border transition-all ${
                plan.featured
                  ? "border-[#0098f2]/40 bg-white shadow-md relative"
                  : "border-[#d8d8d8]/80 bg-white shadow-xs hover:border-[#0f0f0f]"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0098f2] px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div>
                <div className="text-center pb-6 border-b border-[#d8d8d8]/60">
                  <h3 className="font-runde text-[18.2px] font-semibold text-[#0f0f0f]">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="font-runde text-[40px] font-semibold text-[#0f0f0f]">{plan.price}</span>
                    {plan.period && <span className="text-body-sm text-[#666] font-medium ml-1">{plan.period}</span>}
                  </div>
                  <p className="mt-4 text-body-sm text-[#666] min-h-[40px] leading-relaxed">{plan.description}</p>
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-body-sm text-[#0f0f0f]">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#0098f2]" />
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#d8d8d8]/60">
                <Link
                  to={plan.href}
                  className={`flex items-center justify-center w-full rounded-full font-medium py-3 text-[12.7px] transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    plan.featured
                      ? "bg-[#0f0f0f] text-white hover:bg-[#1e1e1e] shadow-xs"
                      : "bg-white text-[#0f0f0f] border border-[#d8d8d8] hover:border-[#0f0f0f]"
                  }`}
                >
                  {plan.cta} <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* COMPARISON TABLE */}
      <Section bg="bg-[#fafafa]">
        <h2 className="text-center font-runde text-hero-sm font-semibold text-[#0f0f0f]">Compare Plans</h2>
        <div className="mt-10 overflow-x-auto border border-[#d8d8d8]/80 rounded-2xl bg-white">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-[#d8d8d8]/60 bg-[#fafafa]">
                <th className="py-4 px-6 text-left font-semibold text-[#0f0f0f]">Feature</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0f0f0f]">Starter</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0098f2]">Growth</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0f0f0f]">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature) => (
                <tr key={feature.name} className="border-b border-[#d8d8d8]/60 last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="py-4 px-6 font-medium">{feature.name}</td>
                  <td className="py-4 px-6 text-center">
                    {feature.free ? <Check className="mx-auto size-5 text-[#0098f2]" /> : <X className="mx-auto size-5 text-[#d8d8d8]" />}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {feature.growth ? <Check className="mx-auto size-5 text-[#0098f2]" /> : <X className="mx-auto size-5 text-[#d8d8d8]" />}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {feature.enterprise ? <Check className="mx-auto size-5 text-[#0098f2]" /> : <X className="mx-auto size-5 text-[#d8d8d8]" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <h2 className="text-center font-runde text-hero-sm font-semibold text-[#0f0f0f]">Frequently Asked Questions</h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {faqs.map((faq, i) => {
            const isExpanded = expandedFaq === i
            return (
              <div key={i} className="border border-[#d8d8d8]/80 rounded-2xl px-6 py-1 bg-white hover:border-[#0f0f0f] transition-all">
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left font-runde text-[14.6px] font-medium text-[#0f0f0f] hover:text-[#0098f2] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? <ChevronUp className="size-5 shrink-0 text-[#8d8d8d]" /> : <ChevronDown className="size-5 shrink-0 text-[#8d8d8d]" />}
                </button>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-body-sm text-[#666] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center" bg="bg-[#fafafa]">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight">Still Have Questions?</h2>
          <p className="mt-4 text-[14.6px] text-[#666] leading-relaxed">Our team is here to help you find the right plan.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-8 py-4 text-[14.6px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Get Started <ArrowUpRight className="ml-2 size-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full bg-white border border-[#d8d8d8] px-8 py-4 text-[14.6px] font-medium text-[#0f0f0f] shadow-xs hover:border-[#0f0f0f] transition-all hover:scale-[1.02] active:scale-[0.98] font-runde"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  )
}
