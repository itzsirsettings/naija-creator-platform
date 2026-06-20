import { MapPin, Send, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCompactNumber, formatNaira, initials } from "@/utils/format"

export default function CreatorProfileModal({
  creator, onClose, onSendOffer
}: {
  creator: any; onClose: () => void; onSendOffer: (c: any) => void
}) {
  if (!creator) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{creator.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">@{creator.handle} &middot; {creator.niche}</p>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <Avatar className="size-14">
            {creator.avatar && /^https?:\/\//i.test(creator.avatar) ? <AvatarImage src={creator.avatar} alt="" /> : null}
            <AvatarFallback className="text-lg">{initials(creator.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{creator.bio}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {creator.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: "Followers", value: formatCompactNumber(creator.followers) },
            { label: "Engagement", value: `${creator.engagement}%` },
            { label: "Base rate", value: formatNaira(creator.baseRate) },
            { label: "Rating", value: creator.rating || "4.8", icon: true },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted p-2">
              <div className="text-sm font-bold">{stat.value}</div>
              <div className="flex items-center justify-center gap-0.5 text-[9.1px] text-muted-foreground">
                {stat.icon ? <Star className="size-3 fill-current" /> : null} {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {creator.platforms.map((platform: string) => (
            <span key={platform} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{platform}</span>
          ))}
        </div>

        <Button onClick={() => { onSendOffer(creator); onClose() }}>
          <Send className="mr-1 size-3" /> Send offer
        </Button>
      </DialogContent>
    </Dialog>
  )
}
