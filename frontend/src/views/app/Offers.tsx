import { useCallback, useEffect, useState } from "react"
import { Inbox, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OfferCard from "@/components/OfferCard"
import SubmitWorkModal from "@/components/SubmitWorkModal"
import { useAuth } from "@/context/AuthContext"
import { isDemoApp } from "@/services/api"
import {
  fetchCreatorOffers,
  fetchBrandOffers,
  acceptOffer,
  rejectOffer,
  submitWork,
  approveOffer,
  disputeOffer,
  initiatePayment,
  type Offer,
} from "@/services/offers"
import { Link } from "@/lib/router"

export default function Offers() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitTarget, setSubmitTarget] = useState<any>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const isBrand = user?.role === "brand"

  const loadOffers = useCallback(async () => {
    if (!user || isDemoApp) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = isBrand
        ? await fetchBrandOffers(user.brandId!)
        : await fetchCreatorOffers(user.creatorId!)
      setOffers(data)
    } catch {
      setError("Failed to load offers. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [user, isBrand])

  useEffect(() => { loadOffers() }, [loadOffers])

  const normalizeOffer = (o: Offer) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    amount: o.amountKobo / 100,
    platform: o.platform,
    status: o.status,
    deadline: o.deadline,
    brandName: o.brand?.name ?? "Brand",
    creatorName: o.creator?.name ?? "Creator",
    deliverableUrl: o.deliverableUrl,
    deliverableNote: o.deliverableNote,
  })

  const handleAction = async (action: () => Promise<Offer>, id: string, successMsg: string) => {
    setBusyId(id)
    try {
      const updated = await action()
      setOffers((prev) => prev.map((o) => (o.id === id ? updated : o)))
      toast.success(successMsg)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Action failed")
    } finally {
      setBusyId(null)
    }
  }

  const handleAccept = (id: string) => handleAction(() => acceptOffer(id), id, "Offer accepted")
  const handleReject = (id: string) => handleAction(() => rejectOffer(id), id, "Offer rejected")
  const handleApprove = (id: string) => handleAction(() => approveOffer(id), id, "Deliverable approved — funds released")
  const handleDispute = (id: string) => handleAction(() => disputeOffer(id), id, "Dispute filed")

  const handlePay = async (id: string) => {
    setBusyId(id)
    try {
      const result = await initiatePayment(id, `${window.location.origin}/offers`)
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Payment initiation failed")
      setBusyId(null)
    }
  }

  async function handleSubmitWork(data: { deliverableUrl: string; deliverableNote?: string }) {
    if (!submitTarget) return null
    try {
      const updated = await submitWork(submitTarget.id, data)
      setOffers((prev) => prev.map((o) => (o.id === submitTarget.id ? updated : o)))
      toast.success("Work submitted for review")
      setSubmitTarget(null)
      return updated
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Failed to submit work")
    }
  }

  if (!user) return null

  const normalizedOffers = offers.map(normalizeOffer)

  const renderOffers = (filtered: typeof normalizedOffers) =>
    filtered.length ? (
      filtered.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          role={isBrand ? "brand" : "creator"}
          isBusy={busyId === offer.id}
          onAccept={handleAccept}
          onReject={handleReject}
          onApprove={handleApprove}
          onDispute={handleDispute}
          onPay={handlePay}
          onSubmit={(o: any) => setSubmitTarget(o)}
        />
      ))
    ) : (
      <EmptyState />
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {isBrand ? "Sent Offers" : "Received Offers"}
          </h1>
          <p className="text-muted-foreground">
            {isBrand
              ? "Track offers sent to creators."
              : "Review and respond to sponsorship offers."}
          </p>
        </div>
        {isBrand ? (
          <Button asChild size="sm">
            <Link to="/discover">
              <Plus className="mr-1 size-3" /> New Offer
            </Link>
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading offers...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadOffers} className="text-sm font-medium text-primary hover:underline">
            Try again
          </button>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {renderOffers(normalizedOffers)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {renderOffers(normalizedOffers.filter((o) => o.status === "PENDING"))}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-4">
            {renderOffers(normalizedOffers.filter((o) => ["ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED"].includes(o.status)))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {renderOffers(normalizedOffers.filter((o) => ["COMPLETED", "REJECTED", "CANCELLED", "REFUNDED"].includes(o.status)))}
          </TabsContent>
        </Tabs>
      )}

      {submitTarget ? (
        <SubmitWorkModal
          offer={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmit={handleSubmitWork}
        />
      ) : null}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Inbox className="size-12 text-muted-foreground" />
      <strong className="font-heading text-lg">No offers in this view</strong>
      <p className="text-sm text-muted-foreground">Change the filter or tab to see more offers.</p>
    </div>
  )
}
