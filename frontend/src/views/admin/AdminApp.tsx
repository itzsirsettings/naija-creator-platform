import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "@/lib/router"
import { Shield, Users, FileText, BarChart3, MoreHorizontal, RotateCcw, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/context/AuthContext"
import {
  adminListOffers,
  disputeOffer,
  refundOffer,
  type AdminOffer,
} from "@/services/api"
import { formatNaira } from "@/utils/format"

const stats = [
  { label: "Total Users", value: "12,482", change: "+12%", icon: Users },
  { label: "Active Offers", value: "1,893", change: "+8%", icon: FileText },
  { label: "Platform Revenue", value: "₦48.2M", change: "+23%", icon: BarChart3 },
  { label: "Pending Reviews", value: "147", change: "-5%", icon: Shield },
]

const users = [
  { id: "1", name: "Amara Okafor", email: "amara@example.com", role: "Creator", status: "Active", kyc: "Verified", joined: "Jan 2026" },
  { id: "2", name: "Tunde Balogun", email: "tunde@example.com", role: "Brand", status: "Active", kyc: "Verified", joined: "Feb 2026" },
  { id: "3", name: "Chioma Eze", email: "chioma@example.com", role: "Creator", status: "Suspended", kyc: "Pending", joined: "Mar 2026" },
  { id: "4", name: "Dayo Adewale", email: "dayo@example.com", role: "Brand", status: "Active", kyc: "Verified", joined: "Jan 2026" },
  { id: "5", name: "Folake Adeniji", email: "folake@example.com", role: "Creator", status: "Active", kyc: "Rejected", joined: "Apr 2026" },
]

const sections = [
  { title: "System Overview", description: "View platform health metrics and system status.", icon: BarChart3 },
  { title: "User Management", description: "Manage users, roles, and account statuses.", icon: Users },
  { title: "Content Moderation", description: "Review reported content and enforce guidelines.", icon: FileText },
  { title: "Platform Analytics", description: "Track growth, revenue, and engagement trends.", icon: BarChart3 },
]

export default function AdminApp() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard", { replace: true })
    }
  }, [user, navigate])

  if (!user || user.role !== "admin") return null

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-6">
        <Shield className="size-5 text-primary" />
        <span className="font-heading text-base font-semibold">Admin Dashboard</span>
      </header>
      <main className="flex-1 space-y-8 p-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Monitor and manage your platform from one place.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.change.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Recent users and their verification status.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "destructive"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.kyc === "Verified" ? "default" :
                          user.kyc === "Pending" ? "secondary" :
                          "destructive"
                        }
                      >
                        {user.kyc}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AdminOffersPanel />

        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

const OFFER_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  APPROVED: "default",
  FUNDED: "secondary",
  SUBMITTED: "secondary",
  ACCEPTED: "secondary",
  PENDING: "outline",
  DISPUTED: "destructive",
  REFUNDED: "outline",
  REJECTED: "outline",
  CANCELLED: "outline",
}

function errorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as { response?: { data?: { error?: string } }; message?: string }
    return e.response?.data?.error ?? e.message ?? "Something went wrong"
  }
  return "Something went wrong"
}

function AdminOffersPanel() {
  const [offers, setOffers] = useState<AdminOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOffers(await adminListOffers())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = useCallback(
    async (offerId: string, action: (id: string) => Promise<unknown>, confirmMsg?: string) => {
      if (confirmMsg && !window.confirm(confirmMsg)) return
      setActingId(offerId)
      setError(null)
      try {
        await action(offerId)
        await load()
      } catch (err) {
        setError(errorMessage(err))
      } finally {
        setActingId(null)
      }
    },
    [load],
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Offers &amp; Disputes</CardTitle>
          <CardDescription>Resolve disputes by refunding the brand’s escrow hold.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading offers…</p>
        ) : offers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No offers yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => {
                const busy = actingId === offer.id
                const amountNaira = offer.amountKobo / 100
                return (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell className="text-muted-foreground">{offer.brand?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{offer.creator?.name ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNaira(amountNaira)}</TableCell>
                    <TableCell>
                      <Badge variant={OFFER_BADGE[offer.status] ?? "outline"}>{offer.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {offer.status === "DISPUTED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void runAction(
                                offer.id,
                                refundOffer,
                                `Refund ${formatNaira(amountNaira)} to ${offer.brand?.name ?? "the brand"}? This reverses the escrow hold and cannot be undone.`,
                              )
                            }
                          >
                            <RotateCcw className="size-4" />
                            Refund
                          </Button>
                        )}
                        {(offer.status === "FUNDED" || offer.status === "SUBMITTED") && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => void runAction(offer.id, disputeOffer)}
                          >
                            Open dispute
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
