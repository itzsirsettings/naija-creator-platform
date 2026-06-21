import { Eye, MapPin, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Badge from "@/components/Badge"
import { formatCompactNumber, formatNaira, initials } from "@/utils/format"

export default function CreatorCard({
  creator, onSendOffer, onViewProfile, canSendOffer = true,
}: {
  creator: any
  onSendOffer: (c: any) => void
  onViewProfile?: (c: any) => void
  canSendOffer?: boolean
}) {
  // Real (freshly-registered) creators may have empty fields — guard every one
  // so a sparse profile renders cleanly instead of breaking the grid.
  const platforms: string[] = Array.isArray(creator.platforms) ? creator.platforms : []
  const niche = creator.niche || "New creator"
  const location = creator.location || "Nigeria"
  const handle = creator.handle || creator.name?.toLowerCase().replace(/\s+/g, "") || "creator"
  const bio = creator.bio || "This creator hasn't added a bio yet."

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-12 border border-border">
            {creator.avatar && /^https?:\/\//i.test(creator.avatar) ? <AvatarImage src={creator.avatar} alt="" /> : null}
            <AvatarFallback className="bg-[#1A24B8]/10 text-[#1A24B8] font-semibold">{initials(creator.name || "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-heading text-sm font-semibold text-foreground">{creator.name || "Unnamed creator"}</h3>
                <p className="truncate text-[11px] font-medium text-muted-foreground">@{handle}</p>
              </div>
              <Badge tone={creator.match ? "ACCEPTED" : "PENDING"}>
                {creator.match ? `${creator.match}% match` : niche}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{bio}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-medium text-muted-foreground">
              <span className="text-foreground">{niche}</span>
              <span className="flex items-center gap-0.5"><MapPin className="size-3" /> {location}</span>
              {platforms.length ? <span>{platforms.join(" + ")}</span> : null}
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-center text-xs py-2 border-y border-border">
          <div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{formatCompactNumber(creator.followers || 0)}</div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Followers</span>
          </div>
          <div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{creator.engagement || 0}%</div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Engagement</span>
          </div>
          <div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{formatNaira(creator.baseRate || 0)}</div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Base Rate</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        {canSendOffer ? (
          <button
            onClick={() => onSendOffer(creator)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1A24B8] py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A]"
          >
            <Send className="size-3.5 stroke-2" /> Send Offer
          </button>
        ) : null}
        <button
          onClick={() => onViewProfile?.(creator)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted ${canSendOffer ? "" : "flex-1"}`}
        >
          <Eye className="size-3.5 stroke-2" /> View Profile
        </button>
      </div>
    </div>
  )
}
