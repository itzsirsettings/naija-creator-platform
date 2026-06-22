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
  /** When set, wraps the section in a full-width sticky div that stacks at top-[72px]. */
  stickyZ?: number
  /** When set on a non-sticky section, adds position:relative + z-index so it renders above preceding sticky sections. */
  zIndex?: number
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
  stickyZ,
  zIndex,
}: SectionProps) {
  const borderX = noBorder || noBorderX ? "" : "border-x border-[#d8d8d8]/40"
  const borderB = noBorder || noBorderB || noBorderY ? "" : "border-b border-[#d8d8d8]/60"
  const borderY = noBorderY ? "" : ""

  const inner = (
    <section
      id={stickyZ !== undefined ? undefined : id}
      className={`mx-auto max-w-[1200px] px-6 py-16 sm:py-24 ${borderX} ${borderB} ${borderY} ${bg} ${className}`}
    >
      {children}
    </section>
  )

  if (stickyZ !== undefined) {
    return (
      <div
        id={id}
        className={`sticky top-[72px] min-h-[calc(100vh-72px)] w-full ${bg}`}
        style={{ zIndex: stickyZ }}
      >
        {inner}
      </div>
    )
  }

  if (zIndex !== undefined) {
    return (
      <div id={id} className={`relative w-full ${bg}`} style={{ zIndex }}>
        {inner}
      </div>
    )
  }

  return inner
}
