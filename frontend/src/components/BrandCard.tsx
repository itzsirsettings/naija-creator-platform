import { Building2, Globe, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/utils/format"

export default function BrandCard({
  brand, onApply,
}: {
  brand: any
  onApply?: (brand: any) => void
}) {
  const name = brand.name || "Unnamed brand"
  const industry = brand.industry || "Brand"
  const rawSite: string | null = brand.website || null
  const website = rawSite
    ? (/^https?:\/\//i.test(rawSite) ? rawSite : `https://${rawSite}`)
    : null

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar className="size-12 rounded-lg border border-border">
          {brand.logo && /^https?:\/\//i.test(brand.logo) ? <AvatarImage src={brand.logo} alt="" /> : null}
          <AvatarFallback className="rounded-lg bg-[#0A0A9F]/10 font-semibold text-[#0A0A9F]">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-sm font-semibold text-foreground">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Building2 className="size-3 shrink-0" /> <span className="truncate">{industry}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {onApply ? (
          <button
            onClick={() => onApply(brand)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0A0A9F] py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#5E5AA8]"
          >
            <Send className="size-3.5 stroke-2" /> Apply to work
          </button>
        ) : null}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Globe className="size-3.5 stroke-2" /> Visit Website
          </a>
        ) : !onApply ? (
          <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground">
            No website yet
          </span>
        ) : null}
      </div>
    </div>
  )
}
