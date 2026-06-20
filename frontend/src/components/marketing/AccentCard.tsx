import { type ReactNode } from "react"

type AccentCardProps = {
  color: string
  children: ReactNode
  className?: string
  bg?: string
}

export default function AccentCard({ color, children, className = "", bg = "bg-white" }: AccentCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border border-[#d8d8d8]/80 p-6 sm:p-8 transition-all duration-300 sm:hover:border-[#0f0f0f] sm:hover:shadow-lg active:border-[#0f0f0f] ${bg} ${className}`}
    >
      <div
        className="w-2 h-10 rounded-full absolute left-0 top-8"
        style={{ backgroundColor: color }}
      />
      {children}
    </div>
  )
}
