export const mockUser = {
  id: "user-1",
  name: "Tunde Bakare",
  email: "tunde@tehilla.ng",
  role: "brand" as const,
  brandName: "Bakare Luxury",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=tunde",
  kycStatus: "VERIFIED" as const,
  walletBalance: 2_450_000,
}

export const mockBrandDashboard = {
  activeCampaigns: 6,
  completedCampaigns: 9,
  totalSpent: 3850000,
  pendingApprovals: 3,
  shortlistedCreators: 12,
  weeklyViews: 142000,
  weeklyEngagement: 4.8,
  recentOffers: [
    { id: "off-1", creatorName: "Chioma Okafor", status: "ACCEPTED", amount: 250000, date: "2026-06-10" },
    { id: "off-2", creatorName: "Segun Adewale", status: "PENDING", amount: 180000, date: "2026-06-09" },
    { id: "off-3", creatorName: "Zainab Yusuf", status: "COMPLETED", amount: 120000, date: "2026-06-07" },
    { id: "off-4", creatorName: "Kemi Balogun", status: "PENDING", amount: 200000, date: "2026-06-06" },
  ],
}

export const mockCreatorDashboard = {
  activeOffers: 4,
  earnings: 1480000,
  pendingApprovals: 2,
  completedCampaigns: 13,
  totalFollowers: 284000,
  avgEngagement: 3.2,
  recentPayments: [
    { id: "pay-1", brandName: "Bakare Luxury", amount: 250000, status: "COMPLETED", date: "2026-06-11" },
    { id: "pay-2", brandName: "Lagos Fresh", amount: 120000, status: "COMPLETED", date: "2026-06-08" },
    { id: "pay-3", brandName: "NaijaTech", amount: 180000, status: "PENDING", date: "2026-06-05" },
    { id: "pay-4", brandName: "AfriBeat", amount: 95000, status: "COMPLETED", date: "2026-06-03" },
  ],
}

export const mockCreators = [
  { id: "cr-1", name: "Chioma Okafor", handle: "chiomaokafor", niche: "Fashion & Lifestyle", location: "Lagos", platforms: ["Instagram Reels", "TikTok Video"], followers: 245000, engagement: 5.2, baseRate: 250000, bio: "Lagos-based fashion and lifestyle creator with a focus on sustainable African fashion. Collaborated with 25+ premium brands.", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=chioma", match: 92 },
  { id: "cr-2", name: "Segun Adewale", handle: "segunadewale", niche: "Tech & Gaming", location: "Abuja", platforms: ["YouTube Short", "X Thread"], followers: 128000, engagement: 4.1, baseRate: 180000, bio: "Tech reviewer and gaming content creator. Known for honest, in-depth gadget reviews and weekly Twitch streams.", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=segun", match: 78 },
  { id: "cr-3", name: "Zainab Yusuf", handle: "zainabyusuf", niche: "Food & Culture", location: "Kano", platforms: ["Instagram Reels", "YouTube Short"], followers: 89000, engagement: 6.8, baseRate: 120000, bio: "Celebrating Northern Nigerian cuisine. Recipes, street food tours, and cultural storytelling through food.", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zainab", match: 85 },
  { id: "cr-4", name: "Kemi Balogun", handle: "kemibalogun", niche: "Fitness & Wellness", location: "Port Harcourt", platforms: ["TikTok Video", "Instagram Stories"], followers: 312000, engagement: 7.3, baseRate: 300000, bio: "Fitness coach and wellness advocate. Helping Nigerians stay healthy through home workouts and nutrition tips.", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=kemi", match: 65 },
  { id: "cr-5", name: "Tunde Bakare", handle: "tundebakare", niche: "Music & Entertainment", location: "Lagos", platforms: ["YouTube Short", "TikTok Video", "X Thread"], followers: 450000, engagement: 4.5, baseRate: 350000, bio: "Afrobeat artist and entertainment content creator. Music reviews, studio vlogs, and behind-the-scenes content.", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=tunde2", match: 88 },
].map((c) => ({ ...c, rating: (4.5 + Math.random() * 0.5).toFixed(1) }))

export const mockTransactions = [
  { id: "tx-1", type: "credit", amount: 250000, label: "Campaign payment", counterparty: "Chioma Okafor", date: "2026-06-11T10:30:00Z", status: "Completed" },
  { id: "tx-2", type: "debit", amount: 50000, label: "Platform fee", counterparty: "Tehilla Platform", date: "2026-06-11T10:30:00Z", status: "Completed" },
  { id: "tx-3", type: "credit", amount: 120000, label: "Campaign payment", counterparty: "Lagos Fresh", date: "2026-06-08T14:00:00Z", status: "Completed" },
  { id: "tx-4", type: "debit", amount: 180000, label: "Withdrawal to bank", counterparty: "GTBank - 0123456789", date: "2026-06-06T09:00:00Z", status: "Completed" },
  { id: "tx-5", type: "credit", amount: 95000, label: "Campaign payment", counterparty: "AfriBeat", date: "2026-06-03T16:45:00Z", status: "Completed" },
  { id: "tx-6", type: "debit", amount: 24000, label: "Platform fee", counterparty: "Tehilla Platform", date: "2026-06-03T16:45:00Z", status: "Completed" },
]
