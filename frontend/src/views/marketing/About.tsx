import { Link } from "@/lib/router"
import { ArrowUpRight, Target, Heart, Lightbulb, Shield } from "lucide-react"
import MarketingLayout from "@/components/MarketingLayout"
import Section from "@/components/marketing/Section"
import AccentCard from "@/components/marketing/AccentCard"

const values = [
  {
    icon: Heart,
    title: "Creator-First",
    description: "Every decision we make starts with the question: does this benefit the creator?",
    color: "#0098f2",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "Clear terms, honest pricing, and escrow protection for every transaction on our platform.",
    color: "#5d9c06",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We build tools that make brand collaborations smarter, faster, and more rewarding.",
    color: "#2f6bff",
  },
  {
    icon: Target,
    title: "African Excellence",
    description: "Proudly built for the African market, solving real problems for local creators and brands.",
    color: "#2f6bff",
  },
]

const team = [
  { name: "Mathias Anthony", role: "Founder & CEO", initials: "MA" },
  { name: "Samuel Otu", role: "Head of Engineering", initials: "SO" },
  { name: "Peace Eku", role: "Head of Compliance", initials: "PE" },
]

export default function About() {
  return (
    <MarketingLayout>
      {/* HERO */}
      <Section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-runde text-hero-sm sm:text-hero font-semibold text-[#0f0f0f] leading-none tracking-tight">
            Building the Future of <span className="text-[#0098f2]">Creator Commerce</span> in Africa
          </h1>
          <p className="mt-6 text-[16.4px] sm:text-body-lg text-[#666] leading-relaxed max-w-2xl mx-auto">
            We believe African creators deserve a platform that pays them fairly, connects them with top brands, and respects their craft.
          </p>
        </div>
      </Section>

      {/* MISSION */}
      <Section bg="bg-[#fafafa]" className="text-center">
        <div className="mx-auto max-w-3xl">
          <span className="font-runde text-[11.8px] font-medium text-[#0098f2] uppercase tracking-wider">
            Our Mission
          </span>
          <h2 className="mt-4 font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Bridging the gap between creators and brands
          </h2>
          <p className="mt-6 text-[13.7px] text-[#666] leading-relaxed max-w-2xl mx-auto">
            Tehilla was founded to bridge the gap between Africa's most talented creators and the brands that want to work with them.
            We saw creators spending more time chasing payments than creating content, and brands struggling to find the right partners.
          </p>
          <p className="mt-4 text-[13.7px] text-[#666] leading-relaxed max-w-2xl mx-auto">
            Our platform makes brand sponsorship as simple as it should be: discover, offer, deliver, and get paid.
            We handle the paperwork, payments, and trust so you can focus on what you do best.
          </p>
        </div>
      </Section>

      {/* VALUES */}
      <Section>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-runde text-[11.8px] font-medium text-[#2f6bff] uppercase tracking-wider">
            Our Values
          </span>
          <h2 className="mt-4 font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            The principles that guide everything we build
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <AccentCard key={value.title} color={value.color}>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5f5f5] border border-[#d8d8d8]/60 text-[#0f0f0f]">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 font-runde text-[16.4px] font-semibold text-[#0f0f0f] leading-tight">{value.title}</h3>
                <p className="mt-3 text-body-sm text-[#666] leading-relaxed">{value.description}</p>
              </AccentCard>
            )
          })}
        </div>
      </Section>

      {/* TEAM */}
      <Section bg="bg-[#fafafa]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            The Team
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="rounded-2xl border border-[#d8d8d8]/60 bg-white p-8 text-center shadow-xs hover:border-[#0f0f0f] transition-all duration-300">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#f0f0f0] border border-[#d8d8d8]/60 text-2xl font-bold text-[#0f0f0f]">
                {member.initials}
              </div>
              <h3 className="mt-6 font-runde text-[16.4px] font-semibold text-[#0f0f0f] leading-tight">{member.name}</h3>
              <p className="mt-1 text-body-sm text-[#8d8d8d]">{member.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-runde text-hero-sm font-semibold text-[#0f0f0f] leading-tight">Let's Build Together</h2>
          <p className="mt-4 text-[14.6px] text-[#666] leading-relaxed">
            Have questions, ideas, or want to partner with us? We'd love to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@tehilla.work"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-8 py-4 text-[14.6px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Contact Us <ArrowUpRight className="ml-2 size-4" />
            </a>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-white border border-[#d8d8d8] px-8 py-4 text-[14.6px] font-medium text-[#0f0f0f] shadow-xs hover:border-[#0f0f0f] transition-all hover:scale-[1.02] active:scale-[0.98] font-runde"
            >
              Join Tehilla
            </Link>
          </div>
        </div>
      </Section>
    </MarketingLayout>
  )
}
