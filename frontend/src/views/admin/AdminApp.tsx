import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "@/lib/router"
import { ArrowLeft, BarChart3, FileText, Loader2, RefreshCw, RotateCcw, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/context/AuthContext"
import {
  adminListOffers,
  adminListUsers,
  adminOverview,
  disputeOffer,
  refundOffer,
  type AdminOffer,
  type AdminOverview,
  type AdminUser,
} from "@/services/api"
import { formatNaira } from "@/utils/format"

function errorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as { response?: { data?: { error?: string } }; message?: string }
    return e.response?.data?.error ?? e.message ?? "Something went wrong"
  }
  return "Something went wrong"
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })

const displayName = (u: AdminUser): string =>
  u.creator?.name || u.brand?.name || u.email.split("@")[0]

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
        <span className="font-heading text-base font-semibold">Admin · Operations</span>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/admin")}>
          <ArrowLeft className="size-4" /> Webhook monitor
        </Button>
      </header>
      <main className="flex-1 space-y-8 p-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Operations</h1>
          <p className="mt-1 text-muted-foreground">Live platform metrics, users, and dispute resolution.</p>
        </div>

        <OverviewStats />
        <UsersPanel />
        <AdminOffersPanel />
      </main>
    </div>
  )
}

// ─── Real platform overview ───────────────────────────────────────────────────
function OverviewStats() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    adminOverview()
      .then((d) => active && setData(d))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const cards = [
    { label: "Total Users", value: data?.totalUsers, icon: Users },
    { label: "Creators", value: data?.creators, icon: Users },
    { label: "Brands", value: data?.brands, icon: BarChart3 },
    { label: "Pending KYC", value: data?.pendingKyc, icon: Shield },
  ]

  if (error) {
    return <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">
                {loading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : (c.value ?? 0).toLocaleString("en-NG")}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Real users ───────────────────────────────────────────────────────────────
const ROLE_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  BRAND: "secondary",
  CREATOR: "outline",
}
const KYC_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  VERIFIED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
  NONE: "outline",
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await adminListUsers({ limit: 25 }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>The most recent accounts and their verification status.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        ) : loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{displayName(u)}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE[u.role] ?? "outline"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.suspendedAt ? "destructive" : "default"}>
                      {u.suspendedAt ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={KYC_BADGE[u.kycStatus] ?? "outline"}>{u.kycStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
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
                    <TableCell className="text-muted-foreground">{offer.brand?.name ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{offer.creator?.name ?? "-"}</TableCell>
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
