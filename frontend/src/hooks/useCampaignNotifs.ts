import { useCallback, useEffect, useState } from "react"
import { fetchCampaigns } from "@/services/campaigns"
import { useAuth } from "@/context/AuthContext"

const LS_KEY = "tehilla:campaigns:lastSeen"
const EARLY_ACCESS_MS = 24 * 60 * 60 * 1000

function getLastSeen(): number {
  try {
    return parseInt(localStorage.getItem(LS_KEY) ?? "0", 10)
  } catch {
    return 0
  }
}

export function markCampaignsSeen() {
  try {
    localStorage.setItem(LS_KEY, String(Date.now()))
  } catch {
    // localStorage unavailable - ignore
  }
}

export function useCampaignNotifs() {
  const { user } = useAuth()
  const [newCount, setNewCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!user || user.role !== "creator") return
    // skip when tab is hidden — saves network on inactive tabs
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return
    try {
      const campaigns = await fetchCampaigns({ limit: 20 })
      const lastSeen = getLastSeen()
      const fresh = campaigns.filter(
        (c) => new Date(c.createdAt).getTime() > lastSeen,
      )
      setNewCount(fresh.length)
    } catch {
      // non-blocking - badge stays at 0
    }
  }, [user])

  useEffect(() => {
    refresh()
    // re-check every 10 minutes; skip when tab is hidden (see guard in refresh)
    const id = setInterval(refresh, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [refresh])

  // Popular/Premium creators also know whether any of those campaigns are < 24h old
  const earlyAccessCount = (() => {
    if (!user?.premiumActive) return 0
    const rank: Record<string, number> = { NONE: 0, STANDARD: 1, POPULAR: 2, PREMIUM: 3 }
    return rank[user.premiumTier ?? "NONE"] >= 2 ? newCount : 0
  })()

  return { newCount, earlyAccessCount, refresh }
}
