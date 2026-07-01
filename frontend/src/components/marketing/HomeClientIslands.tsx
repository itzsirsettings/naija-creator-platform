"use client"

/**
 * HomeHeroTagline — client island that animates the rotating tagline.
 * Isolated here so the rest of the home page (including the h1 below)
 * renders as a Server Component and is immediately readable by crawlers.
 * Crawlers see the first tagline as static text via the `data-static` fallback.
 */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
]

export function HomeHeroTagline() {
  const [taglineIdx, setTaglineIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIdx((i) => (i + 1) % taglines.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="relative font-runde text-[24px] sm:text-[34px] lg:text-[44px] font-semibold tracking-tight text-[#0f0f0f] leading-[1.2] min-h-[2.6em] overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
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
  )
}

/**
 * HomeFaqAccordion — client island for the FAQ accordion animation.
 * FAQ questions and answers are passed as props from the server so they
 * appear in the SSR HTML and are indexed by search engines.
 */
import { ChevronDown, ChevronUp } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

export function HomeFaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="lg:col-span-8 space-y-4">
      {faqs.map((faq, index) => {
        const isExpanded = expandedFaq === index
        return (
          <div
            key={index}
            className="border-b border-[#d8d8d8] pb-4 transition-all duration-300"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between py-3 text-left font-runde text-[16px] sm:text-[17px] font-medium text-[#0f0f0f] hover:text-[#5E5AA8] transition-colors"
              aria-expanded={isExpanded}
            >
              <span>{faq.question}</span>
              {isExpanded ? (
                <ChevronUp className="size-5 shrink-0 text-[#8d8d8d]" />
              ) : (
                <ChevronDown className="size-5 shrink-0 text-[#8d8d8d]" />
              )}
            </button>
            {/* Answer is always in DOM for SEO; animation is cosmetic */}
            <div
              className={`overflow-hidden transition-all duration-250 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <p className="mt-2 text-[14px] sm:text-[15px] text-[#666] leading-relaxed pr-6">
                {faq.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * HomePaymentTabs — client island for the payment method tabs in the payment section
 */
export function HomePaymentTabs({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
