import { type ReactNode } from "react"
import { Link } from "@/lib/router"

type PillButtonProps = {
  variant?: "dark" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  to?: string
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}

const variants = {
  dark: "bg-[#0f0f0f] text-white hover:bg-[#1e1e1e] shadow-xs hover:scale-[1.02] active:scale-[0.98]",
  outline: "bg-white text-[#0f0f0f] border border-[#d8d8d8] hover:border-[#0f0f0f] hover:scale-[1.02] active:scale-[0.98]",
  ghost: "bg-transparent text-[#666] hover:text-[#0f0f0f]",
}

const sizes = {
  sm: "px-5 py-3.5 text-[11.8px]",
  md: "px-6 py-3 text-[12.7px]",
  lg: "px-8 py-4 text-[14.6px]",
}

export default function PillButton({
  variant = "dark",
  size = "md",
  to,
  href,
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
}: PillButtonProps) {
  const base = `inline-flex items-center justify-center rounded-full font-medium ${variants[variant]} ${sizes[size]} transition-all ${className}`

  if (to) {
    return (
      <Link to={to} className={base}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={base} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={base} disabled={disabled}>
      {children}
    </button>
  )
}
