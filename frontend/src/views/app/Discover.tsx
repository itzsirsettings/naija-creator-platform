"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Inbox, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreatorCard from "@/components/CreatorCard"
import CreatorProfileModal from "@/components/CreatorProfileModal"
import OfferModal from "@/components/OfferModal"
import BrandCard from "@/components/BrandCard"
import ApplyModal from "@/components/ApplyModal"
import { useAuth } from "@/context/AuthContext"
import { usePremium } from "@/hooks/usePremium"
import { useNavigate } from "@/lib/router"
import { fetchCreators, type Creator } from "@/services/creators"
import { fetchBrands, type Brand } from "@/services/brands"
import { createOffer } from "@/services/offers"
import { applyToBrand } from "@/services/applications"
import { fetchTemplates, type ProposalTemplate } from "@/services/proposalTemplates"

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

// ─── Route by role: brands discover creators, creators discover brands ───────
export default function Discover() {
  const { user } = useAuth()
  return user?.role === "brand" ? <CreatorDiscovery /> : <BrandDiscovery />
}

// ─── Brand view: find creators to send offers to ─────────────────────────────
function CreatorDiscovery() {
  const { user } = useAuth()
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [niche, setNiche] = useState("All Niches")
  const [platform, setPlatform] = useState("All Platforms")
  const [location, setLocation] = useState("All Locations")
  const [minFollowers, setMinFollowers] = useState(0)
  const [selectedCreator, setSelectedCreator] = useState<any>(null)
  const [profileCreator, setProfileCreator] = useState<any>(null)

  const loadCreators = useCallback(async () => {
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

  const filteredCreators = useMemo(() => {
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
        dealType: data.dealType,
        commissionRate: data.commissionRate,
        usageRights: data.usageRights,
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
        <p className="text-muted-foreground">Find the perfect Nigerian creators for your next campaign.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, handle, niche..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Niche" /></SelectTrigger>
          <SelectContent>{niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>{locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={String(minFollowers)} onValueChange={(v) => setMinFollowers(Number(v))}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Followers" /></SelectTrigger>
          <SelectContent>{followerBands.map((b) => <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loading label="Loading creators..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCreators} />
      ) : filteredCreators.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} canSendOffer onSendOffer={setSelectedCreator} onViewProfile={setProfileCreator} />
          ))}
        </div>
      ) : (
        <EmptyState title="No creators found" hint="Try adjusting your search or filter criteria." />
      )}

      {selectedCreator ? (
        <OfferModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} onSubmit={handleSendOffer} />
      ) : null}
      {profileCreator ? (
        <CreatorProfileModal creator={profileCreator} canSendOffer onClose={() => setProfileCreator(null)} onSendOffer={setSelectedCreator} />
      ) : null}
    </div>
  )
}

// ─── Creator view: browse brands ("see who's hiring") ────────────────────────
function BrandDiscovery() {
  const { user } = useAuth()
  const ent = usePremium()
  const navigate = useNavigate()
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [applyBrand, setApplyBrand] = useState<any>(null)
  const [templates, setTemplates] = useState<ProposalTemplate[]>([])

  useEffect(() => {
    if (!ent.proposalTemplateManager) return
    fetchTemplates().then(setTemplates).catch(() => { /* ignore */ })
  }, [ent.proposalTemplateManager])

  const handleApplyClick = (brand: any) => {
    if (!user?.premiumActive) {
      toast("Upgrade to Premium to apply to brands")
      navigate("/premium")
      return
    }
    setApplyBrand(brand)
  }

  const submitApplication = async (message: string) => {
    if (!applyBrand) return
    try {
      await applyToBrand(applyBrand.id, message)
      toast.success(`Application sent to ${applyBrand.name}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Could not send application"
      if (err?.response?.status === 402) {
        toast(msg)
        navigate("/premium")
      } else {
        toast.error(msg)
      }
      throw new Error(msg)
    }
  }

  const loadBrands = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchBrands({ search: query || undefined, limit: 50 })
      setBrands(result.brands)
    } catch {
      setError("Failed to load brands. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    const timeout = setTimeout(loadBrands, 300)
    return () => clearTimeout(timeout)
  }, [loadBrands])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Discover Brands</h1>
        <p className="text-muted-foreground">See which brands are on the platform and looking for creators.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search brands by name or industry..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {isLoading ? (
        <Loading label="Loading brands..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBrands} />
      ) : brands.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => <BrandCard key={brand.id} brand={brand} onApply={handleApplyClick} />)}
        </div>
      ) : (
        <EmptyState title="No brands yet" hint="Brands will appear here as they join the platform." />
      )}

      {applyBrand ? (
        <ApplyModal
          title={`Apply to ${applyBrand.name}`}
          description="Tell this brand why you'd be a great fit. They'll review your application and can respond with an offer."
          onClose={() => setApplyBrand(null)}
          onSubmit={submitApplication}
          templates={templates}
        />
      ) : null}
    </div>
  )
}

// ─── Shared state visuals ────────────────────────────────────────────────────
function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <button onClick={onRetry} className="text-sm font-medium text-primary hover:underline">Try again</button>
    </div>
  )
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Inbox className="size-12 text-muted-foreground" />
      <strong className="font-heading text-lg">{title}</strong>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}
