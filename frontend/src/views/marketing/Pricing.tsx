import { useState } from "react"
import { Link } from "@/lib/router"
import { ArrowUpRight, Check, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"
import { useAuth } from "@/context/AuthContext"
import { PLANS, COMPARISON_ROWS } from "@/lib/tiers"
import { formatNaira } from "@/utils/format"

const ANNUAL_DISCOUNT = 0.15

const faqs = [
  { q: "How does annual billing work?", a: "Choose Annually and you save 15% versus paying monthly. We bill the discounted yearly total upfront, and the per-month figure shown reflects that discount." },
  { q: "How does the 10% platform fee work?", a: "Separate from your subscription, we charge a flat 10% fee on every successful offer. For example, if a brand sends a ₦100,000 offer, ₦90,000 goes to the creator and ₦10,000 covers the platform fee." },
  { q: "Can I upgrade or downgrade my plan?", a: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle." },
  { q: "What payment methods do you support?", a: "We use Paystack for all transactions, supporting cards, bank transfers, USSD, and mobile money. Creators receive payouts directly to their verified Nigerian bank accounts." },
  { q: "Is there a contract or lock-in period?", a: "No contracts. You can use the platform on a month-to-month basis and cancel anytime. No questions asked." },
]

const monthlyEquivalent = (monthlyPrice: number, annual: boolean): number =>
  annual ? Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT)) : monthlyPrice

const annualTotal = (monthlyPrice: number): number =>
  Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT))

export default function Pricing() {
  const { isAuthenticated } = useAuth()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(true)

  const planHref = (tier: string) =>
    isAuthenticated ? `/app/premium?upgrade=${tier}` : `/register?plan=${tier}`

  return (
    <MarketingLayout>
      {/* Floating animation for the featured card */}
      <style>{`
        @keyframes tehilla-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .tehilla-float { animation: tehilla-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .tehilla-float { animation: none; } }
      `}</style>

      {/* HEADER */}
      <Section className="pt-24 pb-8 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8d8d8]/80 bg-white px-4 py-1.5 text-[12.7px] font-semibold text-[#0f0f0f] shadow-xs">
          <Sparkles className="size-3.5 text-[#0098f2]" /> Trusted by Creators &amp; Brands
        </div>
        <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">
          Choose Your <span className="text-[#0098f2]">Growth Plan</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[14.6px] text-[#666] leading-relaxed">
          Scale your creator business with the tools, visibility, and trust features you need to win more deals and earn more revenue.
        </p>

        {/* OUTCOME STATS */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: "📈", text: "Popular creators win 3× more campaigns" },
            { icon: "⚡", text: "48% faster payouts vs. free tier" },
            { icon: "💰", text: "₦12M+ in total creator payouts" },
          ].map((s) => (
            <span key={s.text} className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d8d8]/80 bg-white px-4 py-2 text-[11.8px] font-medium text-[#0f0f0f] shadow-xs">
              <span>{s.icon}</span> {s.text}
            </span>
          ))}
        </div>

        {/* BILLING TOGGLE */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#d8d8d8]/80 bg-white p-1.5 shadow-xs">
          <button
            onClick={() => setIsAnnual(false)}
            className={`rounded-full px-5 py-2 text-[12.7px] font-semibold transition-all ${!isAnnual ? "bg-[#0f0f0f] text-white" : "text-[#666] hover:text-[#0f0f0f]"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-[12.7px] font-semibold transition-all ${isAnnual ? "bg-[#0f0f0f] text-white" : "text-[#666] hover:text-[#0f0f0f]"}`}
          >
            Annually
            <span className="rounded-full bg-[#0098f2]/15 px-2 py-0.5 text-[10px] font-bold text-[#0098f2]">Save 15%</span>
          </button>
        </div>
      </Section>

      {/* PRICING CARDS */}
      <Section noBorderB={true} noBorderY={false} className="pt-4 pb-12">
        <div className="grid gap-6 sm:grid-cols-3 items-stretch">
          {PLANS.map((plan) => {
            const perMonth = monthlyEquivalent(plan.monthlyPriceNaira, isAnnual)
            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all ${
                  plan.featured
                    ? "tehilla-float z-10 text-white"
                    : "border border-[#d8d8d8]/80 bg-white shadow-xs hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                }`}
                style={
                  plan.featured
                    ? {
                        background: "linear-gradient(135deg, #0F172A, #1E293B)",
                        border: "2px solid #8B5CF6",
                        boxShadow:
                          "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.3)",
                      }
                    : undefined
                }
              >
                {plan.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
                  >
                    🔥 Most Popular
                  </div>
                )}
                <div>
                  <div className={`text-center pb-6 border-b ${plan.featured ? "border-white/10" : "border-[#d8d8d8]/60"}`}>
                    <h3 className={`font-runde text-[18.2px] font-semibold ${plan.featured ? "text-white" : "text-[#0f0f0f]"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline justify-center">
                      <span className={`font-runde text-[40px] font-semibold tabular-nums ${plan.featured ? "text-white" : "text-[#0f0f0f]"}`}>
                        {formatNaira(perMonth)}
                      </span>
                      <span className={`ml-1 text-body-sm font-medium ${plan.featured ? "text-purple-200" : "text-[#666]"}`}>/month</span>
                    </div>
                    <div className={`mt-1 h-4 text-[11px] ${plan.featured ? "text-purple-200/80" : "text-[#8d8d8d]"}`}>
                      {isAnnual ? `Billed ${formatNaira(annualTotal(plan.monthlyPriceNaira))} yearly` : ""}
                    </div>
                    <p className={`mt-3 text-body-sm min-h-[40px] leading-relaxed ${plan.featured ? "text-slate-300" : "text-[#666]"}`}>
                      {plan.description}
                    </p>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-3 text-body-sm ${plan.featured ? "text-slate-200" : "text-[#0f0f0f]"}`}>
                        <Check className={`mt-0.5 size-4 shrink-0 ${plan.featured ? "text-[#8B5CF6]" : "text-[#0098f2]"}`} />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`mt-8 pt-6 border-t ${plan.featured ? "border-white/10" : "border-[#d8d8d8]/60"}`}>
                  <Link
                    to={planHref(plan.tier)}
                    className={`flex items-center justify-center w-full rounded-full font-medium py-3 text-[12.7px] transition-all hover:scale-[1.04] active:scale-[0.98] ${
                      plan.featured ? "text-white" : "bg-white text-[#0f0f0f] border border-[#d8d8d8] hover:border-[#0f0f0f]"
                    }`}
                    style={
                      plan.featured
                        ? {
                            background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                            boxShadow: "0 0 15px rgba(236,72,153,0.5), 0 0 35px rgba(139,92,246,0.5)",
                          }
                        : undefined
                    }
                  >
                    {plan.cta} <ArrowUpRight className="ml-2 size-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-8 text-center text-[12px] text-[#8d8d8d]">
          Prices in Nigerian Naira (₦). {isAnnual ? "Annual plans are billed yearly at a 15% discount." : "Switch to annual billing to save 15%."}
        </p>
      </Section>

      {/* COMPARISON TABLE */}
      <Section bg="bg-[#fafafa]">
        <h2 className="text-center font-runde text-hero-sm font-semibold text-[#0f0f0f]">Compare Plans</h2>
        <div className="mt-10 overflow-x-auto border border-[#d8d8d8]/80 rounded-2xl bg-white">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-[#d8d8d8]/60 bg-[#fafafa]">
                <th className="py-4 px-6 text-left font-semibold text-[#0f0f0f]">Feature</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0f0f0f]">Standard</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0098f2]">Popular</th>
                <th className="py-4 px-6 text-center font-semibold text-[#0f0f0f]">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.name} className="border-b border-[#d8d8d8]/60 last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="py-4 px-6 font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-center">
                    {row.standard ? <Check className="mx-auto size-5 text-[#0098f2]" /> : <X className="mx-auto size-5 text-[#d8d8d8]" />}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.popular ? <Check className="mx-auto size-5 text-[#0098f2]" /> : <X className="mx-auto size-5 text-[#d8d8d8]" />}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.premium ? <Check className="mx-auto size-5 text-[#0098f2]" /> : <X className="mx-auto size-5 text-[#d8d8d8]" />}
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
              to={isAuthenticated ? "/app/premium" : "/register"}
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
