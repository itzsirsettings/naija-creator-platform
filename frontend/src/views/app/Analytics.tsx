import { useMemo } from "react"
import { Eye, TrendingUp, BarChart3, Users, DollarSign, Handshake } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import StatCard from "@/components/StatCard"
import { useAppData } from "@/context/AppDataContext"
import { formatNaira, formatCompactNumber } from "@/utils/format"

export default function Analytics() {
  const { brandDashboard, creatorDashboard, transactions } = useAppData()

  const totalViews = 142000
  const engagementRate = 4.8
  const topCampaigns = [
    { name: "Summer Collection Launch", views: 45000, engagement: 6.2, color: "bg-teal-500" },
    { name: "Tech Review Series", views: 32000, engagement: 4.8, color: "bg-blue-500" },
    { name: "Food Festival Coverage", views: 28000, engagement: 7.1, color: "bg-amber-500" },
    { name: "Fitness Challenge", views: 22000, engagement: 5.4, color: "bg-rose-500" },
  ]
  const maxViews = Math.max(...topCampaigns.map((c) => c.views), 1)

  const totalRevenue = transactions
    .filter((tx) => tx.type === "credit")
    .reduce((s, t) => s + t.amount, 0)

  const overviewStats = [
    { label: "Total Views", value: formatCompactNumber(totalViews), icon: Eye },
    { label: "Engagement Rate", value: `${engagementRate}%`, icon: TrendingUp },
    { label: "Total Revenue", value: formatNaira(totalRevenue), icon: DollarSign },
    { label: "Active Partners", value: brandDashboard.shortlistedCreators, icon: Handshake },
  ]

  const nicheData = [
    { label: "Fashion & Lifestyle", value: 35 },
    { label: "Tech & Gaming", value: 25 },
    { label: "Food & Culture", value: 20 },
    { label: "Fitness & Wellness", value: 12 },
    { label: "Music & Entertainment", value: 8 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Performance metrics, campaign insights, and audience data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Top Campaigns</CardTitle>
            <CardDescription>Best performing campaigns by views</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {topCampaigns.map((campaign) => (
              <div key={campaign.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{campaign.name}</span>
                  <span className="text-muted-foreground">
                    {formatCompactNumber(campaign.views)} views
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={(campaign.views / maxViews) * 100}
                    className="h-2 [&>div]:bg-teal-500"
                  />
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {campaign.engagement}% eng.
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Niche Distribution</CardTitle>
            <CardDescription>Creator supply by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nicheData.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-sm">Weekly Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading">
              {formatCompactNumber(brandDashboard.weeklyViews)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-sm">Weekly Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading">
              {brandDashboard.weeklyEngagement}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-sm">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading">
              {formatNaira(brandDashboard.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Campaign investment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
