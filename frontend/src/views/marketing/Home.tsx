"use client";

import { useState, useEffect } from "react";
import { Link } from "@/lib/router";
import LazyVideo from "@/components/LazyVideo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  Coins,
  ShieldCheck,
  Lock,
  Crosshair,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import MarketingLayout from "@/components/MarketingLayout";
import Section from "@/components/marketing/Section";
import AccentCard from "@/components/marketing/AccentCard";

const faqs = [
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
    question: "How does brand pricing work?",
    answer:
      "Brands access Tehilla through a subscription plan. Each plan unlocks different campaign limits, creator discovery tools, and support tiers. A 10% platform fee also applies on every completed deal. Visit our Pricing page to compare brand plans.",
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
    question: "How do brands find me?",
    answer:
      "Brands search for creators by niche, audience size, engagement rate, and location. Make sure your profile is complete with your best work samples and accurate audience metrics to get discovered.",
  },
  {
    question: "Can I negotiate the offer amount?",
    answer:
      "Yes. When a brand sends you an offer, you can counter with a different amount. Both parties can negotiate until an agreement is reached. Once accepted, the terms are locked in escrow.",
  },
  {
    question: "What happens if a brand doesn't approve my work?",
    answer:
      "If a brand rejects your deliverables, you can revise and resubmit. If you can't reach an agreement, Tehilla support steps in to mediate. The escrow protects both parties. Funds are never released until both sides are satisfied.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "Your earnings are sent directly to your verified Nigerian bank account via Paystack. Make sure your bank details are correct in your profile settings.",
  },
  {
    question: "Can brands run multiple campaigns?",
    answer:
      "Absolutely. Brands can create multiple campaigns, work with several creators simultaneously, and manage everything from a single dashboard. The Popular and Premium plans offer advanced campaign management tools.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. We use industry-standard encryption, comply with NDPR (Nigeria Data Protection Regulation), and process all payments through Paystack, a PCI-compliant payment processor.",
  },
];

const taglines: [string, string][] = [
  ["Your influence,", "monetized"],
  ["Your reach,", "your revenue"],
  ["Followers", "into funds"],
  ["Content today,", "cash tomorrow"],
  ["Influence engineered", "for income"],
  ["Post with purpose,", "get paid"],
  ["Turn attention", "into assets"],
  ["From scrolls", "to sales"],
  ["Build audience,", "bank authority"],
  ["Creativity,", "converted"],
  ["Your platform,", "your paycheck"],
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"bank" | "card" | "usdc">("bank");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [taglineIdx, setTaglineIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIdx((i) => (i + 1) % taglines.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <MarketingLayout>
      {/* HERO */}
      <div className="relative overflow-hidden w-full min-h-[100svh] -mt-[72px] pt-[72px] flex flex-col sm:justify-center bg-white">
        {/* Desktop background SVG */}
        <img
          src="/Canva_background.svg"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        />
        <Section
          className="relative z-10 pt-10 sm:pt-0 pb-4 sm:pb-0 text-center flex flex-col justify-center items-center w-full"
          bg="bg-transparent"
          noBorder
        >
          <div className="mx-auto max-w-4xl">
            <div className="relative font-runde text-[24px] sm:text-[34px] lg:text-[44px] font-semibold tracking-tight text-[#0f0f0f] leading-[1.2] min-h-[2.6em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={taglineIdx}
                  initial={{ opacity: 0, y: "0.8em" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "-0.8em" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  {taglines[taglineIdx][0]}
                  <br />
                  {taglines[taglineIdx][1]}
                </motion.span>
              </AnimatePresence>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-[16px] sm:text-[18px] lg:text-[19px] text-[#666] leading-relaxed max-w-xl mx-auto"
            >
              Connect with leading brands, secure meaningful partnerships, and
              get paid directly to your bank account.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-6 py-3 text-[14px] sm:text-[15px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
              >
                Start earning
              </Link>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-runde text-[12px] sm:text-[13px] text-[#666] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#5E5AA8]" /> Create Content
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#5d9c06]" /> Post
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#0A0A9F]" /> Instant Payout
                </span>
              </div>
            </motion.div>
          </div>
        </Section>
        {/* Mobile only: character image anchored to the bottom of the hero */}
        {/* LCP element on mobile — preloaded in layout.tsx <head>, explicit size prevents CLS */}
        <div className="sm:hidden relative z-10 mt-auto w-full flex justify-center">
          <img
            src="/mobile_hero.png"
            alt=""
            aria-hidden="true"
            width={320}
            height={256}
            className="w-[75%] max-w-[320px] h-auto object-contain pointer-events-none select-none"
            fetchPriority="high"
          />
        </div>
      </div>

      {/* SMARTER INFLUENCER MARKETING */}
      <section className="border-b border-[#d8d8d8]/60 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 sm:py-24 border-x border-[#d8d8d8]/40">
          {/* Header */}
          <div className="mb-14 max-w-2xl">
            <h2 className="font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-[1.15] tracking-tight">
              Smarter Influencer Marketing.
            </h2>
            <p className="mt-4 text-[16px] sm:text-[17px] text-[#666] leading-relaxed max-w-xl">
              After thousands of campaigns and brand partnerships, we rebuilt the
              workflow from the ground up. Tehilla helps you discover, launch, and
              scale creator campaigns - faster and with measurable impact.
            </p>
          </div>

          {/* Three columns */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Column 1 - AI Match */}
            <div className="flex flex-col gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c6c6] bg-[#fff0f0] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#c0392b]">
                  <Crosshair className="size-3" />
                  AI-Powered Match &amp; Recruit
                </span>
                <h3 className="mt-4 font-runde text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#0f0f0f] leading-[1.25]">
                  Find creators who actually fit your brand.
                </h3>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-[#f7f7f7] aspect-[4/3]">
                <LazyVideo
                  src="/videos/feature-match.mp4"
                  poster="/discover.png"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] sm:text-[15px] text-[#666] leading-relaxed">
                Share your ideal creator. Tehilla finds the match and handles the
                outreach.
              </p>
            </div>

            {/* Column 2 - Campaign */}
            <div className="flex flex-col gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bfd9f5] bg-[#eef5ff] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#1A56DB]">
                  <BarChart3 className="size-3" />
                  Campaign Management
                </span>
                <h3 className="mt-4 font-runde text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#0f0f0f] leading-[1.25]">
                  Scale campaigns without the chaos.
                </h3>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-[#f7f7f7] aspect-[4/3]">
                <LazyVideo
                  src="/videos/feature-campaign.mp4"
                  poster="/Analysis.webp"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] sm:text-[15px] text-[#666] leading-relaxed">
                Manage briefs, outreach, approvals, content, and payouts in one
                centralized dashboard.
              </p>
            </div>

            {/* Column 3 - Content */}
            <div className="flex flex-col gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c0d0] bg-[#fff0f5] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#c0355b]">
                  <TrendingUp className="size-3" />
                  Content &amp; Conversion Optimization
                </span>
                <h3 className="mt-4 font-runde text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#0f0f0f] leading-[1.25]">
                  Turn creator content into performance assets.
                </h3>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-[#f7f7f7] aspect-[4/3]">
                <LazyVideo
                  src="/videos/feature-content.mp4"
                  poster="/Escrow.webp"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] sm:text-[15px] text-[#666] leading-relaxed">
                Track what's working and reuse top-performing content across
                channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAT BAR */}
      <section className="border-b border-[#d8d8d8]/60 bg-white sticky top-[72px] z-[3] min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-[1200px] px-6 py-8 grid grid-cols-2 gap-6 sm:grid-cols-4 border-x border-[#d8d8d8]/40">
          {[
            { value: "₦12M+", label: "in creator payouts" },
            { value: "200+", label: "verified creators" },
            { value: "500+", label: "deals completed" },
            { value: "7 days", label: "avg. time to first deal" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-runde text-[24px] sm:text-[32px] lg:text-[40px] font-semibold text-[#0f0f0f] leading-none">
                {stat.value}
              </div>
              <div className="mt-1.5 text-[12px] text-[#8d8d8d]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF TICKER - infinite horizontal marquee */}
      <section className="border-b border-[#d8d8d8]/60 bg-[#fafafa] sticky top-[72px] z-[4] min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 border-x border-[#d8d8d8]/40">
          <span className="font-runde shrink-0 text-[16px] font-medium text-[#8d8d8d] uppercase tracking-wider">
            Join 1,000+ creators & brands
          </span>
          <div className="overflow-hidden w-full max-w-[700px] opacity-50 grayscale">
            <div className="flex gap-14 animate-scroll-marquee whitespace-nowrap">
              {[
                "Paystack",
                "Flutterwave",
                "MTN Nigeria",
                "Chipper Cash",
                "Konga",
              ].map((name) => (
                <span
                  key={name}
                  className="font-selecta text-[16px] font-medium tracking-tight text-[#0f0f0f]"
                >
                  {name}
                </span>
              ))}
              {[
                "Paystack",
                "Flutterwave",
                "MTN Nigeria",
                "Chipper Cash",
                "Konga",
              ].map((name) => (
                <span
                  key={`dup-${name}`}
                  className="font-selecta text-[16px] font-medium tracking-tight text-[#0f0f0f]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <Section className="text-center" stickyZ={5}>
        <div className="mx-auto max-w-3xl">
          <h4 className="font-runde text-[24px] sm:text-[28px] lg:text-[32px] font-medium leading-[1.3] text-[#0f0f0f]">
            "Tehilla changed how I earn. I went from chasing brands to brands
            coming to me, and I get paid on time, every time."
          </h4>
          <p className="mt-6 font-runde text-[14px] sm:text-[15px] text-[#8d8d8d]">
            Tunde Adebayo, Lifestyle Creator
          </p>
        </div>
      </Section>

      {/* WHO IS THIS FOR */}
      <Section id="features" zIndex={6}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-runde text-[10px] font-medium text-[#5E5AA8] uppercase tracking-wider">
            Who is this for?
          </span>
          <h2 className="mt-4 font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-[1.2] tracking-tight">
            Built for everyone in the creator economy
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              role: "Creator",
              color: "#5E5AA8",
              description:
                "Monetize your influence with transparent sponsorship offers from Nigeria's biggest brands. No more guessing what your content is worth.",
            },
            {
              role: "Brand",
              color: "#0A0A9F",
              description:
                "Discover vetted creators, manage campaigns, and pay with confidence. Find the perfect match for your next campaign.",
            },
            {
              role: "Agency",
              color: "#0A0A9F",
              description:
                "Manage multiple creator partnerships for your clients from a single dashboard. Track deliverables, approvals, and payments.",
            },
            {
              role: "Enterprise",
              color: "#5d9c06",
              description:
                "Scale your influencer marketing with bulk creator campaigns, API access, and dedicated account management.",
            },
            {
              role: "NGO",
              color: "#ff6363",
              description:
                "Amplify your cause with creator partnerships. Find advocates who believe in your mission and reach new audiences.",
            },
            {
              role: "Government",
              color: "#aa2d00",
              description:
                "Launch public awareness campaigns with verified creators. Reach citizens where they consume content every day.",
            },
          ].map((item, idx) => (
            <AccentCard key={idx} color={item.color}>
              <h6 className="font-runde text-[18px] sm:text-[20px] font-semibold text-[#0f0f0f] group-hover:text-[#0f0f0f] transition-colors">
                {item.role}
              </h6>
              <p className="mt-4 text-[14px] sm:text-[15px] text-[#666] leading-relaxed">
                {item.description}
              </p>
            </AccentCard>
          ))}
        </div>
      </Section>

      {/* PAIN POINTS */}
      <Section bg="bg-[#fafafa]" stickyZ={7}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-tight tracking-tight">
            Old sponsorship models are broken
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              label: "Slow",
              badgeColor: "bg-[#5E5AA8]/10 text-[#5E5AA8]",
              text: "Manual negotiations take weeks",
              detail:
                ": endless DMs, emails, and back-and-forth before you even agree on a price.",
            },
            {
              label: "Expensive",
              badgeColor: "bg-[#0A0A9F]/10 text-[#0A0A9F]",
              text: "Middlemen take 30% or more",
              detail:
                ": agencies, managers, and platforms eat into your earnings before you see a dime.",
            },
            {
              label: "Opaque",
              badgeColor: "bg-[#0A0A9F]/10 text-[#0A0A9F]",
              text: "No pricing standards",
              detail:
                ": every brand has a different rate. You never know if you're being paid fairly for your work.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#d8d8d8]/60 bg-white p-8 shadow-xs"
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[18px] font-semibold uppercase tracking-wider ${item.badgeColor}`}
              >
                {item.label}
              </span>
              <p className="mt-6 text-[14px] sm:text-[15px] text-[#0f0f0f] font-medium leading-normal">
                {item.text}
                <span className="text-[#8d8d8d] font-normal">
                  {item.detail}
                </span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* INTERACTIVE OFFER WIDGET */}
      <Section zIndex={8}>
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-[1.2] tracking-tight">
              Same day payments. <br />
              Direct to your bank.
            </h2>
            <p className="text-[18px] sm:text-[19px] text-[#666] leading-relaxed">
              Subscribe, get matched, and earn.{" "}
              <span className="text-[#8d8d8d]">
                Every deal is escrow-protected; brands fund upfront, you get
                paid the same day work is approved.
              </span>
            </p>
            <ul className="space-y-4 pt-4 font-runde text-[16px] sm:text-[17px] text-[#0f0f0f] font-medium">
              {[
                "Sponsorship offers from verified brands",
                "Escrow-protected payments on every deal",
                "Same day payouts to your Nigerian bank",
                "Accept or counter offers with one tap",
                "Flexible subscription plans for creators & brands",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#5d9c06]/15 text-[#5d9c06]">
                    <Check className="size-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[480px] rounded-3xl border border-[#d8d8d8] bg-white p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#d8d8d8]/60 pb-6 mb-6">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8d8d8d]">
                    Offer NO
                  </span>
                  <div className="font-digital text-[18.2px] text-[#0f0f0f]">
                    0042
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8d8d8d]">
                    Amount
                  </span>
                  <div className="font-runde text-[20px] font-semibold text-[#5E5AA8]">
                    ₦850,000
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10.9px] mb-6 border-b border-[#d8d8d8]/60 pb-6">
                <div>
                  <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px]">
                    Brand
                  </span>
                  <strong className="text-[#0f0f0f] block text-[11.8px] mt-0.5">
                    Paystack
                  </strong>
                  <span className="text-[#666]">marketing@paystack.com</span>
                </div>
                <div>
                  <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px]">
                    Creator
                  </span>
                  <strong className="text-[#0f0f0f] block text-[11.8px] mt-0.5">
                    Tunde Adebayo
                  </strong>
                  <span className="text-[#666]">tunde@example.com</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px] mb-2.5">
                  Status
                </span>
                <div className="flex items-center gap-2 rounded-xl bg-[#5d9c06]/10 px-4 py-3">
                  <div className="size-2 rounded-full bg-[#5d9c06] animate-pulse" />
                  <span className="text-[11.8px] font-medium text-[#5d9c06]">
                    Escrow funded, ready to start
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px] mb-2.5">
                  Payout Method
                </span>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#fafafa] p-1 border border-[#d8d8d8]/60">
                  <button
                    onClick={() => setActiveTab("bank")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-3 text-[11.8px] font-medium transition-all ${activeTab === "bank" ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]" : "text-[#666] hover:text-[#0f0f0f]"}`}
                  >
                    <Building className="size-3.5" />
                    <span>Bank</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("card")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-3 text-[11.8px] font-medium transition-all ${activeTab === "card" ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]" : "text-[#666] hover:text-[#0f0f0f]"}`}
                  >
                    <CreditCard className="size-3.5" />
                    <span>Card</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("usdc")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-3 text-[11.8px] font-medium transition-all ${activeTab === "usdc" ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]" : "text-[#666] hover:text-[#0f0f0f]"}`}
                  >
                    <Coins className="size-3.5" />
                    <span>USDC</span>
                  </button>
                </div>
              </div>

              <div className="min-h-[120px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeTab === "bank" && (
                    <motion.div
                      key="bank"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="rounded-xl border border-[#d8d8d8]/80 bg-[#fafafa] p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9.1px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">
                            Bank Transfer
                          </span>
                          <span className="text-[12.7px] font-medium text-[#0f0f0f]">
                            GTBank •••• 3049
                          </span>
                        </div>
                        <span className="text-[10.9px] font-semibold text-[#5d9c06] bg-[#5d9c06]/10 px-2.5 py-1 rounded-full">
                          Instant
                        </span>
                      </div>
                      <p className="text-[10.9px] text-[#666] leading-relaxed">
                        Funds land in your verified Nigerian bank account within
                        24 hours. Supported via Paystack.
                      </p>
                    </motion.div>
                  )}
                  {activeTab === "card" && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      <div className="rounded-xl border border-[#d8d8d8]/80 bg-[#fafafa] p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9.1px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">
                            Card Payout
                          </span>
                          <span className="text-[12.7px] font-medium text-[#0f0f0f]">
                            Visa •••• 4242
                          </span>
                        </div>
                        <span className="text-[10.9px] font-semibold text-[#5E5AA8] bg-[#5E5AA8]/10 px-2.5 py-1 rounded-full">
                          2.7% Fee
                        </span>
                      </div>
                      <p className="text-[10.9px] text-[#666] leading-relaxed">
                        Withdraw directly to your debit card. Funds available
                        instantly.
                      </p>
                    </motion.div>
                  )}
                  {activeTab === "usdc" && (
                    <motion.div
                      key="usdc"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="rounded-xl border border-[#d8d8d8]/80 bg-[#fafafa] p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9.1px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">
                            Stablecoin
                          </span>
                          <span className="text-[12.7px] font-medium text-[#0f0f0f]">
                            USDC via Polygon
                          </span>
                        </div>
                        <span className="text-[10.9px] font-semibold text-[#0A0A9F] bg-[#0A0A9F]/10 px-2.5 py-1 rounded-full">
                          1% Fee
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#0f0f0f] rounded-lg flex items-center justify-center text-white font-bold text-[12.7px]">
                          QR
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            disabled
                            value="0x...8x9yuw"
                            className="w-full text-[10.9px] text-[#8d8d8d] bg-transparent border-0 p-0 select-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                disabled
                className="mt-6 w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01]"
              >
                Accept offer: ₦850,000
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* FEATURE SHOWCASE */}
      <Section noBorderB={true} bg="bg-white" zIndex={9}>
        <div className="text-center px-6 py-16 border-b border-[#d8d8d8]/60 max-w-[1200px] mx-auto -mx-6">
          <span className="font-runde text-[12px] font-medium text-[#0A0A9F] uppercase tracking-wider">
            Smarter sponsorship
          </span>
          <h2 className="mt-4 font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-none tracking-tight">
            Everything you need to earn from your influence
          </h2>
        </div>

        <div className="divide-y divide-[#d8d8d8]/60 mx-auto max-w-[1200px]">
          {[
            {
              title: "Get discovered by brands that match your niche",
              description:
                "Brands search for creators by niche, audience size, engagement rate, and location. Your profile works for you 24/7. No more cold DMs or awkward pitch emails.",
              quote:
                '"I used to send 50 DMs to get one sponsorship. Now brands come to me."',
              author: "Chioma Okafor, Fashion Creator",
              gradient: "from-[#5E5AA8] to-[#0A0A9F]",
              animClass: "animate-feature-float",
            },
            {
              title: "Escrow-protected payments, every single deal",
              description:
                "When a brand sends an offer and you accept, they fund the deal upfront. The money sits in secure escrow until you deliver. No more chasing invoices or waiting 90 days to get paid.",
              quote:
                '"Getting paid used to be the hardest part. With Tehilla, the money is there before I even start working."',
              author: "Emeka Nwosu, Tech Creator",
              gradient: "from-[#5d9c06] to-[#5E5AA8]",
              animClass: "animate-feature-float-d1",
            },
            {
              title: "Real-time analytics on your content performance",
              description:
                "Track your earnings, engagement metrics, and campaign history. Know exactly what your content is worth and which brands value your influence the most.",
              quote:
                '"The analytics dashboard showed me I was underselling myself by 40%. Now I negotiate with confidence."',
              author: "Zainab Bello, Beauty Creator",
              gradient: "from-[#0A0A9F] to-[#5E5AA8]",
              animClass: "animate-feature-float-d2",
            },
            {
              title: "Direct bank payouts: no wallets, no delays",
              description:
                "Your earnings go straight to your verified Nigerian bank account via Paystack. No digital wallet to manage, no withdrawal limits, no unnecessary holds on your money.",
              quote:
                '"I had money stuck in platforms for weeks. Tehilla pays me the same day. It changed my business."',
              author: "Segun Adeyemi, Video Creator",
              gradient: "from-[#ff6363] to-[#0A0A9F]",
              animClass: "animate-feature-float-d3",
            },
          ].map((item, idx) => (
            <div key={idx} className="grid lg:grid-cols-2 items-center">
              <div
                className={`p-8 sm:p-16 space-y-6 ${idx % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <h3 className="font-runde text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#0f0f0f] leading-tight">
                  {item.title}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#666] leading-relaxed">
                  {item.description}
                </p>
                <div className="border-l-2 border-[#d8d8d8] pl-4 py-1 mt-6">
                  <p className="text-[14px] sm:text-[15px] italic text-[#666]">
                    {item.quote}
                  </p>
                  <p className="text-[12px] font-medium text-[#8d8d8d] mt-2">
                    {item.author}
                  </p>
                </div>
              </div>
              <div
                className={`bg-white h-full min-h-[400px] flex items-center justify-center p-8 border-t lg:border-t-0 lg:border-l border-[#d8d8d8]/60 ${idx % 2 === 1 ? "lg:order-1" : ""}`}
              >
                {idx === 0 ? (
                  <img
                    src="/discover.png"
                    alt="Get discovered by brands"
                    className={`w-full max-w-[280px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[600px] aspect-[5/4] object-contain ${item.animClass}`}
                  />
                ) : idx === 1 ? (
                  <img
                    src="/Escrow.webp"
                    alt="Escrow-protected payments"
                    className={`w-full max-w-[280px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[600px] aspect-[5/4] object-contain ${item.animClass}`}
                  />
                ) : idx === 2 ? (
                  <img
                    src="/Analysis.png"
                    alt="Real-time analytics"
                    className={`w-full max-w-[280px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[600px] aspect-[5/4] object-contain ${item.animClass}`}
                  />
                ) : (
                  <img
                    src="/Bank.webp"
                    alt="Direct bank payouts"
                    className={`w-full max-w-[280px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[600px] aspect-[5/4] object-contain ${item.animClass}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* BOTTOM CTA */}
      <Section className="text-center" stickyZ={10}>
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-none tracking-tight">
            Start your creator journey
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#666] leading-relaxed max-w-xl mx-auto">
            Join Nigeria's fastest growing creator marketplace. Pick a plan,
            get discovered, get sponsored, get paid.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-6 py-3 text-[14px] sm:text-[15px] font-medium text-white shadow-md hover:bg-[#1e1e1e] transition-all hover:scale-[1.03] active:scale-[0.98] font-runde"
            >
              Create your profile
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-[#d8d8d8] px-6 py-3 text-[14px] sm:text-[15px] font-medium text-[#0f0f0f] hover:bg-[#f5f5f5] transition-all font-runde"
            >
              View plans
            </Link>
          </div>
        </div>
      </Section>

      {/* FAQS */}
      <Section id="faq" stickyZ={11}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <span className="font-runde text-[12px] font-medium text-[#5E5AA8] uppercase tracking-wider block">
              Have questions?
            </span>
            <h2 className="font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-none tracking-tight">
              FAQs
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="border-b border-[#d8d8d8] pb-4 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between py-3 text-left font-runde text-[16px] sm:text-[17px] font-medium text-[#0f0f0f] hover:text-[#5E5AA8] transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="size-5 shrink-0 text-[#8d8d8d]" />
                    ) : (
                      <ChevronDown className="size-5 shrink-0 text-[#8d8d8d]" />
                    )}
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
                        <p className="mt-2 text-[14px] sm:text-[15px] text-[#666] leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </MarketingLayout>
  );
}

export function IntegrationsSection() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <span className="font-runde text-[10px] font-medium text-[#5d9c06] uppercase tracking-wider">
            Integration
          </span>
          <h2 className="font-runde text-[24px] sm:text-[30px] lg:text-[34px] font-semibold text-[#0f0f0f] leading-none tracking-tight">
            Process payments through Nigeria's trusted payment platforms
          </h2>
          <p className="text-[12px] text-[#666] leading-relaxed">
            Tehilla integrates with Paystack for secure payment processing.
            Brand funds are held in escrow and released instantly when both
            parties approve.
          </p>
        </div>
        <div className="lg:col-span-7 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#d8d8d8]/80 bg-[#fafafa] p-8 space-y-4">
            <div className="font-selecta text-[15px] font-semibold text-[#0f0f0f]">
              Paystack
            </div>
            <p className="text-[10.5px] text-[#666]">
              Secure payment processing via:
            </p>
            <ul className="space-y-2 text-[10.9px] font-medium text-[#0f0f0f]">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> Escrow protection
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> Direct bank
                payouts
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> Card payments
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> USSD & mobile
                money
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[#d8d8d8]/80 bg-[#fafafa] p-8 space-y-4">
            <div className="font-selecta text-[15px] font-semibold text-[#0f0f0f]">
              Flutterwave
            </div>
            <p className="text-[10.5px] text-[#666]">
              Alternative payments via:
            </p>
            <ul className="space-y-2 text-[10.9px] font-medium text-[#0f0f0f]">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> Bank transfers
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> International
                payments
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> Multi-currency
                support
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#5d9c06]" /> Instant settlement
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SecuritySection() {
  return (
    <Section bg="bg-[#fafafa]">
      <div className="grid gap-12 md:grid-cols-3 items-start">
        <div className="space-y-4">
          <span className="font-runde text-[10px] font-medium text-[#0A0A9F] uppercase tracking-wider block">
            Security first
          </span>
          <h4 className="font-runde text-[18px] font-semibold text-[#0f0f0f]">
            Your money and data are protected at every step
          </h4>
        </div>
        <div className="rounded-2xl border border-[#d8d8d8]/60 bg-white p-8 space-y-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#0A0A9F]/10 text-[#0A0A9F]">
            <ShieldCheck className="size-5" />
          </div>
          <h6 className="font-runde text-[13px] font-semibold text-[#0f0f0f]">
            Escrow protection
          </h6>
          <p className="text-[10.5px] text-[#666] leading-relaxed">
            Every sponsorship is escrow-protected. Brands fund deals upfront.
            Creators get paid when work is approved. No one gets shortchanged.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d8d8d8]/60 bg-white p-8 space-y-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#0A0A9F]/10 text-[#0A0A9F]">
            <Lock className="size-5" />
          </div>
          <h6 className="font-runde text-[13px] font-semibold text-[#0f0f0f]">
            NDPR compliant & encrypted
          </h6>
          <p className="text-[10.5px] text-[#666] leading-relaxed">
            We comply with Nigeria's Data Protection Regulation. All data is
            encrypted in transit and at rest. Your information stays yours.
          </p>
        </div>
      </div>
    </Section>
  );
}
