import { useState } from "react"
import { Link } from "@/lib/router"
import { Check, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"
import { formatNaira } from "@/utils/format"

type FeatureValue = boolean | string

interface Plan {
  name: string
  badge?: string
  monthlyPrice: number
  description: string
  features: string[]
  buttonText: string
  href: string
  featured: boolean
}

const plans: Plan[] = [
  {
    name: "STANDARD",
    monthlyPrice: 10000,
    description: "Perfect for new creators and brands getting started.",
    features: [
      "Verified Profile",
      "Basic Creator Portfolio",
      "10 Active Listings",
      "Direct Messaging",
      "Escrow Protection",
      "Standard Support",
      "Offer Management",
      "Analytics Dashboard",
    ],
    buttonText: "Get Started",
    href: "/register",
    featured: false,
  },
  {
    name: "POPULAR",
    badge: "🔥 MOST POPULAR",
    monthlyPrice: 22500,
    description: "Best value for serious creators and growing brands.",
    features: [
      "Everything in Standard",
      "Unlimited Listings",
      "Priority Search Ranking",
      "Advanced Analytics",
      "Proposal Templates",
      "Team Collaboration",
      "Priority Escrow Processing",
      "Creator Performance Reports",
      "Featured Profile Placement",
      "Faster Payout Requests",
      "Priority Support",
    ],
    buttonText: "Start Growing",
    href: "/register",
    featured: true,
  },
  {
    name: "PREMIUM",
    monthlyPrice: 50000,
    description: "Built for agencies, top creators, and enterprise brands.",
    features: [
      "Everything in Popular",
      "Unlimited Team Members",
      "Dedicated Account Manager",
      "AI Campaign Insights",
      "Advanced Escrow Controls",
      "Early Access Features",
      "API Access",
      "Custom Brand Pages",
      "Premium Creator Verification",
      "Enterprise Analytics",
      "White Label Reports",
      "Priority Payouts",
      "VIP Support",
      "Strategic Growth Consultation",
    ],
    buttonText: "Get Premium",
    href: "/register",
    featured: false,
  },
]

const comparisonFeatures: Array<{
  name: string
  standard: FeatureValue
  popular: FeatureValue
  premium: FeatureValue
}> = [
  { name: "Verified Profile",      standard: true,          popular: true,          premium: true },
  { name: "Active Listings",       standard: "10",          popular: "Unlimited",   premium: "Unlimited" },
  { name: "Direct Messaging",      standard: true,          popular: true,          premium: true },
  { name: "Escrow Protection",     standard: true,          popular: true,          premium: true },
  { name: "Analytics Dashboard",   standard: true,          popular: true,          premium: true },
  { name: "Advanced Analytics",    standard: false,         popular: true,          premium: true },
  { name: "Priority Support",      standard: false,         popular: true,          premium: true },
  { name: "Team Collaboration",    standard: false,         popular: true,          premium: true },
  { name: "Featured Placement",    standard: false,         popular: true,          premium: true },
  { name: "API Access",            standard: false,         popular: false,         premium: true },
  { name: "Dedicated Manager",     standard: false,         popular: false,         premium: true },
  { name: "AI Campaign Insights",  standard: false,         popular: false,         premium: true },
  { name: "White Label Reports",   standard: false,         popular: false,         premium: true },
]

const faqs = [
  { q: "Is there a setup fee?", a: "No. There are no setup fees, hidden costs, or minimum commitments. You only pay when a deal is successfully completed." },
  { q: "How does the 10% platform fee work?", a: "We charge a flat 10% fee on every successful offer. For example, if a brand sends a ₦100,000 offer, ₦90,000 goes to the creator and ₦10,000 covers the platform fee." },
  { q: "Can I upgrade or downgrade my plan?", a: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle." },
  { q: "What payment methods do you support?", a: "We use Paystack for all transactions, supporting cards, bank transfers, USSD, and mobile money. Creators receive payouts directly to their verified Nigerian bank accounts." },
  { q: "Is there a contract or lock-in period?", a: "No contracts. You can use the platform on a month-to-month basis and cancel anytime. No questions asked." },
]

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === "string") {
    return <span className="text-body-sm font-semibold text-[#0f0f0f]">{value}</span>
  }
  if (value) return <Check className="mx-auto size-5 text-[#8B5CF6]" />
  return <span className="block text-center text-[#d8d8d8] text-lg leading-none">—</span>
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const displayPrice = (base: number) => (isAnnual ? Math.round(base * 0.85) : base)
  const annualTotal  = (base: number) => Math.round(base * 12 * 0.85)

  return (
    <MarketingLayout>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <Section className="pt-24 pb-8 text-center">
        <div className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white border border-[#d8d8d8]/80 shadow-sm mb-8">
          <span className="text-[12.7px] font-semibold text-[#0f0f0f] tracking-wide">
            ✨ Trusted by Creators &amp; Brands
          </span>
        </div>

        <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">
          Choose Your{" "}
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            Growth Plan
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14.6px] text-[#666] leading-relaxed">
          Scale your creator business with the tools, visibility, and trust features you need to win more deals and earn more revenue.
        </p>

        {/* Billing toggle */}
        <div className="mt-10 inline-flex items-center gap-3 bg-white px-2 py-2 rounded-full border border-[#d8d8d8]/80 shadow-sm select-none">
          <span className={`text-[13px] font-semibold pl-3 transition-colors ${!isAnnual ? "text-[#0f0f0f]" : "text-[#aaa]"}`}>
            Monthly
          </span>

          <button
            onClick={() => setIsAnnual((v) => !v)}
            aria-label="Toggle annual billing"
            className="relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2"
            style={{ background: isAnnual ? "linear-gradient(135deg, #8B5CF6, #EC4899)" : "#E5E7EB" }}
          >
            <span
              className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                isAnnual ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>

          <span className={`text-[13px] font-semibold pr-3 flex items-center gap-2 transition-colors ${isAnnual ? "text-[#0f0f0f]" : "text-[#aaa]"}`}>
            Annually
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-gradient-to-r from-pink-100 to-purple-100 text-[#8B5CF6]">
              Save 15%
            </span>
          </span>
        </div>
      </Section>

      {/* ── PRICING CARDS ──────────────────────────────────────── */}
      <Section noBorderB={true} noBorderY={false} className="pt-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3 items-start pt-8">
          {plans.map((plan) => {
            const price  = displayPrice(plan.monthlyPrice)
            const annual = annualTotal(plan.monthlyPrice)

            const cardInner = (
              <div
                className={`relative flex flex-col h-full rounded-3xl transition-all duration-300 ${
                  plan.featured
                    ? "z-10"
                    : "bg-white border border-[#E5E7EB] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                }`}
                style={
                  plan.featured
                    ? {
                        background: "linear-gradient(135deg, #0F172A, #1E293B)",
                        border: "2px solid #8B5CF6",
                        boxShadow:
                          "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.3)",
                      }
                    : {}
                }
              >
                {/* Most Popular ribbon */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-5 py-1.5 rounded-full text-[10.5px] font-black tracking-widest uppercase text-white"
                      style={{
                        background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
                        boxShadow: "0 4px 14px rgba(236,72,153,0.45)",
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`flex flex-col h-full p-8 md:p-10 ${plan.featured ? "text-white" : "text-[#0f0f0f]"}`}>
                  {/* Plan name */}
                  <h3 className="text-[11px] font-black tracking-[0.18em] uppercase mb-5 opacity-70">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="font-runde text-[44px] font-semibold tracking-tight leading-none">
                      {formatNaira(price)}
                    </span>
                  </div>

                  {/* Billing line */}
                  <div className="min-h-[28px] flex items-center mb-5">
                    <span className={`text-[12.7px] font-medium ${plan.featured ? "text-purple-300" : "text-[#999]"}`}>
                      / month
                      {isAnnual && (
                        <span className="ml-1 opacity-80">
                          · {formatNaira(annual)} billed annually
                        </span>
                      )}
                    </span>
                  </div>

                  <p className={`text-[13px] leading-relaxed mb-7 min-h-[40px] ${plan.featured ? "text-slate-300" : "text-[#666]"}`}>
                    {plan.description}
                  </p>

                  {/* Divider */}
                  <div className={`h-px w-full mb-7 ${plan.featured ? "bg-white/10" : "bg-[#E5E7EB]"}`} />

                  {/* Feature list */}
                  <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <Check
                          className={`mt-0.5 size-4 shrink-0 ${plan.featured ? "text-[#8B5CF6]" : "text-[#0f0f0f]"}`}
                          strokeWidth={2.5}
                        />
                        <span className={`text-[13px] font-medium leading-tight ${plan.featured ? "text-slate-200" : "text-[#444]"}`}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.featured ? (
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to={plan.href}
                        className="flex items-center justify-center w-full rounded-xl py-4 px-6 font-bold text-[14px] text-white"
                        style={{
                          background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                          boxShadow: "0 0 15px rgba(236,72,153,0.5), 0 0 35px rgba(139,92,246,0.45)",
                        }}
                      >
                        {plan.buttonText}
                      </Link>
                    </motion.div>
                  ) : (
                    <Link
                      to={plan.href}
                      className="flex items-center justify-center w-full rounded-xl bg-[#111827] text-white py-4 px-6 font-bold text-[14px] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#1f2937] active:scale-[0.98]"
                    >
                      {plan.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            )

            return plan.featured ? (
              <motion.div
                key={plan.name}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
              >
                {cardInner}
              </motion.div>
            ) : (
              <div key={plan.name} className="lg:mt-8">
                {cardInner}
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── COMPARISON TABLE ───────────────────────────────────── */}
      <Section bg="bg-[#fafafa]">
        <h2 className="text-center font-runde text-hero-sm font-semibold text-[#0f0f0f]">Compare Plans</h2>
        <div className="mt-10 overflow-x-auto border border-[#d8d8d8]/80 rounded-2xl bg-white">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-[#d8d8d8]/60 bg-[#fafafa]">
                <th className="py-4 px-6 text-left font-semibold text-[#0f0f0f]">Feature</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0f0f0f]">Standard</th>
                <th className="py-4 px-6 text-center font-semibold text-[#8B5CF6]">Popular</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0f0f0f]">Premium</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feat) => (
                <tr
                  key={feat.name}
                  className="border-b border-[#d8d8d8]/60 last:border-0 hover:bg-[#fafafa] transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-[#0f0f0f]">{feat.name}</td>
                  <td className="py-4 px-6 text-center"><FeatureCell value={feat.standard} /></td>
                  <td className="py-4 px-6 text-center"><FeatureCell value={feat.popular} /></td>
                  <td className="py-4 px-6 text-center"><FeatureCell value={feat.premium} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <Section>
        <h2 className="text-center font-runde text-hero-sm font-semibold text-[#0f0f0f]">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {faqs.map((faq, i) => {
            const isExpanded = expandedFaq === i
            return (
              <div
                key={i}
                className="border border-[#d8d8d8]/80 rounded-2xl px-6 py-1 bg-white hover:border-[#0f0f0f] transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left font-runde text-[14.6px] font-medium text-[#0f0f0f] hover:text-[#8B5CF6] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded
                    ? <ChevronUp className="size-5 shrink-0 text-[#8d8d8d]" />
                    : <ChevronDown className="size-5 shrink-0 text-[#8d8d8d]" />}
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

      {/* ── CTA ────────────────────────────────────────────────── */}
      <Section className="text-center" bg="bg-[#fafafa]">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-[14.6px] text-[#666] leading-relaxed">
            Our team is here to help you find the right plan.
          </p>
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
