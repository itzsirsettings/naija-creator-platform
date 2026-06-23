import { Link } from "@/lib/router"
import { Wallet, Shield, Handshake, UserPlus, Search, FileText, ArrowUpRight, Check, Star } from "lucide-react"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"
import AccentCard from "@/components/marketing/AccentCard"

const benefits = [
  {
    icon: Wallet,
    title: "Monetize Your Influence",
    description: "Earn from brand sponsorships with transparent pricing and fair offers. No more guessing what your content is worth.",
    color: "#5E5AA8",
  },
  {
    icon: Shield,
    title: "Own Your Data",
    description: "You keep full ownership of your content and audience. We never lock you in or claim rights to your work.",
    color: "#5d9c06",
  },
  {
    icon: Handshake,
    title: "Direct Brand Deals",
    description: "Work directly with Africa's biggest brands. Clear briefs, fair deadlines, and escrowed payments every time.",
    color: "#0A0A9F",
  },
]

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Showcase your work, audience metrics, and niche. Brands discover you based on what makes you unique.",
  },
  {
    icon: Search,
    title: "Get Discovered",
    description: "Brands search for creators by niche, audience size, and engagement. Your profile works for you 24/7.",
  },
  {
    icon: FileText,
    title: "Accept Offers",
    description: "Receive clear briefs with deliverables, deadlines, and payment terms. Accept with one tap when it feels right.",
  },
  {
    icon: Wallet,
    title: "Get Paid Directly",
    description: "Money hits your verified Nigerian bank account after approval. No wallets, no holds, no delays.",
  },
]

export default function ForCreators() {
  return (
    <MarketingLayout>
      {/* HERO */}
      <Section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">
            Turn Your Content Into <span className="text-[#5E5AA8]">a Career</span>
          </h1>
          <p className="mt-6 text-[16.4px] sm:text-body-lg text-[#666] leading-relaxed max-w-2xl mx-auto">
            Stop chasing invoices and start doing your best work. Tehilla connects you with brands that respect your craft and pay on time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register?role=creator"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-8 py-4 text-[14.6px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Join as a Creator <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* BENEFITS */}
      <Section>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-runde text-[11.8px] font-medium text-[#5E5AA8] uppercase tracking-wider">
            Why Tehilla
          </span>
          <h2 className="mt-4 font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Built for Creators, by Creators
          </h2>
          <p className="mt-4 text-[13.7px] text-[#666]">Everything you need to turn your influence into income</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <AccentCard key={benefit.title} color={benefit.color}>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5f5f5] border border-[#d8d8d8]/60 text-[#0f0f0f]">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 font-runde text-[16.4px] font-semibold text-[#0f0f0f] leading-tight">{benefit.title}</h3>
                <p className="mt-3 text-body-sm text-[#666] leading-relaxed">{benefit.description}</p>
              </AccentCard>
            )
          })}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section bg="bg-[#fafafa]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-runde text-[11.8px] font-medium text-[#0A0A9F] uppercase tracking-wider">
            How it works
          </span>
          <h2 className="mt-4 font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Four steps to your first brand deal
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="rounded-2xl border border-[#d8d8d8]/60 bg-white p-8 shadow-xs hover:border-[#0f0f0f] transition-all duration-300">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#f0f0f0] text-[#0f0f0f]">
                  <Icon className="size-5" />
                </div>
                <div className="mt-6 text-[10.9px] font-semibold text-[#5E5AA8] uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="mt-1 font-runde text-[16.4px] font-semibold text-[#0f0f0f] leading-tight">{step.title}</h3>
                <p className="mt-3 text-body-sm text-[#666] leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center" bg="bg-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Start Earning From Your Content
          </h2>
          <p className="mt-4 text-[14.6px] text-[#666] leading-relaxed">Join 500+ creators already on the platform.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register?role=creator"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-8 py-4 text-[14.6px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Create Your Profile <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  )
}
