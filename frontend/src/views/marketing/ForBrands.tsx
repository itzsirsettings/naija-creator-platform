import { Link } from "@/lib/router"
import { ArrowUpRight, Search, BarChart3, Shield, Users, Quote } from "lucide-react"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"
import AccentCard from "@/components/marketing/AccentCard"

const features = [
  {
    icon: Search,
    title: "Creator Discovery",
    description: "Find the perfect match for your campaign. Filter by niche, audience size, engagement rate, and location.",
    color: "#0098f2",
  },
  {
    icon: BarChart3,
    title: "Campaign Management",
    description: "Send briefs, track deliverables, and manage multiple creator partnerships from a single dashboard.",
    color: "#1A24B8",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Pay with confidence through Paystack. Funds sit in escrow until you approve the delivered work.",
    color: "#5d9c06",
  },
  {
    icon: Users,
    title: "Analytics & Reporting",
    description: "Measure campaign performance, track ROI, and get actionable insights for your next partnership.",
    color: "#1A24B8",
  },
]

const testimonials = [
  {
    quote: "Tehilla made our influencer campaign effortless. Found the perfect creators and managed everything in one place.",
    author: "Simi Duru",
    role: "Marketing Lead, Paystack",
  },
  {
    quote: "The escrow system gave us complete confidence. We paid knowing the work would be delivered, and it was.",
    author: "Tunde Bakare",
    role: "Brand Manager, Flutterwave",
  },
]

export default function ForBrands() {
  return (
    <MarketingLayout>
      {/* HERO */}
      <Section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">
            Find Your <span className="text-[#0098f2]">Perfect Creator</span> Match
          </h1>
          <p className="mt-6 text-[16.4px] sm:text-body-lg text-[#666] leading-relaxed max-w-2xl mx-auto">
            Discover vetted Nigerian creators, manage campaigns effortlessly, and pay with confidence, all from one platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register?role=brand"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-8 py-4 text-[14.6px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Start Finding Creators <ArrowUpRight className="ml-2 size-4" />
            </Link>
            <Link
              to="/for-creators"
              className="inline-flex items-center justify-center rounded-full bg-white border border-[#d8d8d8] px-8 py-4 text-[14.6px] font-medium text-[#0f0f0f] shadow-xs hover:border-[#0f0f0f] transition-all hover:scale-[1.02] active:scale-[0.98] font-runde"
            >
              Learn About Creators
            </Link>
          </div>
        </div>
      </Section>

      {/* FEATURES */}
      <Section>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-runde text-[11.8px] font-medium text-[#0098f2] uppercase tracking-wider">
            Brand tools
          </span>
          <h2 className="mt-4 font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Everything You Need for Creator Campaigns
          </h2>
          <p className="mt-4 text-[13.7px] text-[#666]">Powerful tools to make every partnership a success</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <AccentCard key={feature.title} color={feature.color}>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5f5f5] border border-[#d8d8d8]/60 text-[#0f0f0f]">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 font-runde text-[16.4px] font-semibold text-[#0f0f0f] leading-tight">{feature.title}</h3>
                <p className="mt-3 text-body-sm text-[#666] leading-relaxed">{feature.description}</p>
              </AccentCard>
            )
          })}
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section bg="bg-[#fafafa]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-runde text-[11.8px] font-medium text-[#1A24B8] uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-4 font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Trusted by Leading Brands
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.author} className="rounded-2xl border border-[#d8d8d8]/60 bg-white p-8 shadow-xs">
              <Quote className="size-6 text-[#0f0f0f]/20" />
              <p className="mt-4 text-body-sm leading-relaxed text-[#666] italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-[#d8d8d8]/60 pt-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-bold text-[#0f0f0f]">
                  {t.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-[#0f0f0f]">{t.author}</div>
                  <div className="text-[10.9px] font-medium text-[#8d8d8d]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Ready to Work With Africa's Best Creators?
          </h2>
          <p className="mt-4 text-[14.6px] text-[#666] leading-relaxed">Join 200+ brands already finding their perfect match.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register?role=brand"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-8 py-4 text-[14.6px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Create Your Brand Account <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  )
}
