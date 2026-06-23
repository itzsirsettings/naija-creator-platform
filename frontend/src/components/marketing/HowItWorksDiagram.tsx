"use client"

import { type ComponentType } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Banknote, HandCoins, Landmark } from "lucide-react"
import { Link } from "@/lib/router"
import Section from "@/components/marketing/Section"

const EASE = [0.22, 1, 0.36, 1] as const

type FlowCard = {
  icon: ComponentType<{ className?: string }>
  title: string
  sub: string
}

const FLOW_CARDS: FlowCard[] = [
  { icon: HandCoins, title: "Tehilla pays creator", sub: "Payment terms set by creator" },
  { icon: Banknote, title: "Creator gets paid", sub: "Receivable amount paid" },
  { icon: Landmark, title: "Funding partners", sub: "Funding partners provide liquidity" },
]

/** A single description card with an animated brand gradient outline. */
function DiagramCard({ icon: Icon, title, sub, className = "" }: FlowCard & { className?: string }) {
  return (
    <div
      className={`tehilla-gradient-border bg-white p-4 sm:p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2f6bff]/10 text-[#2f6bff]">
          <Icon className="size-5" />
        </span>
        <span className="font-runde text-[15px] font-semibold leading-tight text-[#0f0f0f]">
          {title}
        </span>
      </div>
      <div className="mt-3 border-t border-[#ededed] pt-3">
        <p className="font-runde text-body-sm text-[#666]">{sub}</p>
      </div>
    </div>
  )
}

/** A small Brand / Creator endpoint node with the same animated outline. */
function EndpointNode({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`tehilla-gradient-border bg-white px-7 py-3 ${className}`}>
      <span className="font-runde text-[15px] font-medium text-[#0f0f0f]">{label}</span>
    </div>
  )
}

/** The central Tehilla logo tile (gradient mirrors the brand mark). */
function CenterLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`tehilla-gradient-border bg-white p-1.5 shadow-[0_16px_50px_rgba(108,86,252,0.18)] ${className}`}>
      <img src="/Tehilla_logo_new.svg" alt="Tehilla" className="size-16 rounded-[6px] object-cover sm:size-20" />
    </div>
  )
}

export default function HowItWorksDiagram() {
  return (
    <Section className="overflow-hidden text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto max-w-3xl"
      >
        <h2 className="font-runde text-hero-sm font-semibold leading-[1.08] tracking-tight text-[#0f0f0f] sm:text-display-xl text-balance">
          Tehilla is the infrastructure making late payment irrelevant in B2B
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-runde text-[16.4px] leading-relaxed text-[#666] sm:text-body-lg">
          Creators get paid on time, every time. Brands retain their payment flexibility.
          Tehilla handles the gap.
        </p>
        <Link
          to="/for-creators"
          className="mt-7 inline-flex items-center gap-2.5 font-runde text-[14.6px] font-medium text-[#0f0f0f] transition-colors hover:text-[#2f6bff]"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22d3ee] via-[#5d9c06] to-[#2f6bff]">
            <ArrowRight className="size-3.5 -rotate-45 text-white" />
          </span>
          Learn more
        </Link>
      </motion.div>

      {/* DESKTOP DIAGRAM */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        className="relative mx-auto mt-16 hidden aspect-[1000/560] w-full max-w-[1000px] lg:block"
      >
        {/* Connectors + crosshair (behind nodes) */}
        <svg
          viewBox="0 0 1000 560"
          className="absolute inset-0 z-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M1,1 L6,4 L1,7" fill="none" stroke="#5d9c06" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* faint crosshair */}
          <line x1="500" y1="140" x2="500" y2="520" stroke="#ececec" strokeWidth="1.5" />
          <line x1="150" y1="330" x2="850" y2="330" stroke="#ececec" strokeWidth="1.5" />

          {/* Brand -> left card (purple) */}
          <path d="M160,122 C160,215 95,235 95,328" stroke="#2f6bff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 8" />
          {/* Creator -> right card (purple) */}
          <path d="M840,122 C840,215 905,235 905,328" stroke="#2f6bff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 8" />

          {/* left card -> logo (green, flowing) */}
          <path d="M396,322 C425,322 432,320 452,320" stroke="#5d9c06" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 8" markerEnd="url(#arrow-green)" />
          {/* logo -> right card (green, flowing) */}
          <path d="M548,320 C575,320 582,330 604,330" stroke="#5d9c06" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 8" markerEnd="url(#arrow-green)" />
          {/* logo -> bottom card (green, flowing) */}
          <path d="M500,382 C500,400 500,406 500,424" stroke="#5d9c06" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 8" markerEnd="url(#arrow-green)" />
        </svg>

        {/* Endpoint nodes */}
        <div className="absolute left-[16%] top-[17%] z-10 -translate-x-1/2 -translate-y-1/2">
          <EndpointNode label="Brand" />
        </div>
        <div className="absolute left-[84%] top-[17%] z-10 -translate-x-1/2 -translate-y-1/2">
          <EndpointNode label="Creator" />
        </div>

        <div className="absolute left-[50%] top-[59%] z-20 -translate-x-1/2 -translate-y-1/2">
          <CenterLogo />
        </div>

        <div className="absolute left-[24%] top-[59%] z-10 w-[300px] -translate-x-1/2 -translate-y-1/2">
          <DiagramCard {...FLOW_CARDS[0]} />
        </div>
        <div className="absolute left-[76%] top-[59%] z-10 w-[300px] -translate-x-1/2 -translate-y-1/2">
          <DiagramCard {...FLOW_CARDS[1]} />
        </div>
        <div className="absolute left-[50%] top-[86%] z-10 w-[340px] -translate-x-1/2 -translate-y-1/2">
          <DiagramCard {...FLOW_CARDS[2]} />
        </div>
      </motion.div>

      {/* MOBILE / TABLET STACK */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="mt-12 flex flex-col items-center lg:hidden"
      >
        <CenterLogo />
        <VConnector />
        <div className="flex items-center gap-4">
          <EndpointNode label="Brand" />
          <EndpointNode label="Creator" />
        </div>
        <VConnector />
        <div className="w-full max-w-sm space-y-0">
          {FLOW_CARDS.map((card, i) => (
            <div key={card.title}>
              <DiagramCard {...card} className="text-left" />
              {i < FLOW_CARDS.length - 1 && <VConnector />}
            </div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

/** Short vertical dashed connector used in the stacked mobile layout. */
function VConnector() {
  return (
    <div
      className="mx-auto my-4 h-7 w-px"
      style={{
        backgroundImage: "linear-gradient(to bottom, #2f6bff 0 40%, transparent 40%)",
        backgroundSize: "1px 7px",
        backgroundRepeat: "repeat-y",
      }}
    />
  )
}
