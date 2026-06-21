import { useCallback, useEffect, useMemo, useState } from "react"
import { Inbox, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreatorCard from "@/components/CreatorCard"
import CreatorProfileModal from "@/components/CreatorProfileModal"
import OfferModal from "@/components/OfferModal"
import { useAuth } from "@/context/AuthContext"
import { isDemoApp } from "@/services/api"
import { fetchCreators, type Creator } from "@/services/creators"
import { createOffer, initiatePayment } from "@/services/offers"
import { mockCreators } from "@/data/mockData"

const niches = ["All Niches", "Fashion & Lifestyle", "Tech & Gaming", "Food & Culture", "Fitness & Wellness", "Music & Entertainment", "Beauty", "Travel"]
const platforms = ["All Platforms", "Instagram Reels", "TikTok Video", "YouTube Short", "X Thread", "Instagram Stories"]
const locations = ["All Locations", "Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan", "Enugu"]

const followerBands = [
  { label: "Any Audience", value: 0 },
  { label: "10K+", value: 10000 },
  { label: "50K+", value: 50000 },
  { label: "100K+", value: 100000 },
  { label: "500K+", value: 500000 },
]

export default function Discover() {
  const { user } = useAuth()
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(!isDemoApp)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [niche, setNiche] = useState("All Niches")
  const [platform, setPlatform] = useState("All Platforms")
  const [location, setLocation] = useState("All Locations")
  const [minFollowers, setMinFollowers] = useState(0)
  const [selectedCreator, setSelectedCreator] = useState<any>(null)
  const [profileCreator, setProfileCreator] = useState<any>(null)

  const loadCreators = useCallback(async () => {
    if (isDemoApp) {
      setCreators(mockCreators as unknown as Creator[])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchCreators({
        search: query || undefined,
        niche: niche !== "All Niches" ? niche : undefined,
        location: location !== "All Locations" ? location : undefined,
        minFollowers: minFollowers || undefined,
        limit: 50,
      })
      setCreators(result.creators)
    } catch {
      setError("Failed to load creators. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [query, niche, location, minFollowers])

  useEffect(() => {
    const timeout = setTimeout(loadCreators, 300)
    return () => clearTimeout(timeout)
  }, [loadCreators])

  // Only brands send offers (offers go brand -> creator).
  const isBrand = user?.role === "brand"

  const filteredCreators = useMemo(() => {
    // Never show the signed-in creator their own profile in Discover.
    let list = creators.filter((c) => c.id !== user?.creatorId)
    if (platform !== "All Platforms") {
      list = list.filter((c) => c.platforms?.includes(platform))
    }
    return list
  }, [creators, platform, user?.creatorId])

  async function handleSendOffer(data: any) {
    try {
      const offer = await createOffer({
        creatorId: data.creatorId,
        title: data.title,
        description: data.description,
        amount: Number(data.amount),
        platform: data.platform,
        deadline: data.deadline,
      })
      toast.success("Offer sent successfully")
      return offer
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || "Could not send offer"
      toast.error(message)
      throw new Error(message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Discover Creators</h1>
        <p className="text-muted-foreground">
          {isBrand
            ? "Find the perfect Nigerian creators for your next campaign."
            : "Browse Nigerian creators on the platform."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, handle, niche..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            {niches.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(minFollowers)}
          onValueChange={(v) => setMinFollowers(Number(v))}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Followers" />
          </SelectTrigger>
          <SelectContent>
            {followerBands.map((b) => (
              <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading creators...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadCreators} className="text-sm font-medium text-primary hover:underline">
            Try again
          </button>
        </div>
      ) : filteredCreators.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              canSendOffer={isBrand}
              onSendOffer={setSelectedCreator}
              onViewProfile={setProfileCreator}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Inbox className="size-12 text-muted-foreground" />
          <strong className="font-heading text-lg">No creators found</strong>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {selectedCreator ? (
        <OfferModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onSubmit={handleSendOffer}
        />
      ) : null}

      {profileCreator ? (
        <CreatorProfileModal
          creator={profileCreator}
          canSendOffer={isBrand}
          onClose={() => setProfileCreator(null)}
          onSendOffer={setSelectedCreator}
        />
      ) : null}
    </div>
  )
}
