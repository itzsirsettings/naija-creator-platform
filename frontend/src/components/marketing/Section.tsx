import { type ReactNode } from "react"

type SectionProps = {
  children: ReactNode
  className?: string
  bg?: string
  noBorder?: boolean
  noBorderX?: boolean
  noBorderB?: boolean
  noBorderY?: boolean
  id?: string
}

export default function Section({
  children,
  className = "",
  bg = "bg-white",
  noBorder = false,
  noBorderX = false,
  noBorderB = false,
  noBorderY = false,
  id,
}: SectionProps) {
  const borderX = noBorder || noBorderX ? "" : "border-x border-[#d8d8d8]/40"
  const borderB = noBorder || noBorderB || noBorderY ? "" : "border-b border-[#d8d8d8]/60"
  const borderY = noBorderY ? "" : ""
  return (
    <section
      id={id}
      className={`mx-auto max-w-[1200px] px-6 py-16 sm:py-24 ${borderX} ${borderB} ${borderY} ${bg} ${className}`}
    >
      {children}
    </section>
  )
}
