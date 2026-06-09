import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import OfferCard from "../components/OfferCard";
import SubmitWorkModal from "../components/SubmitWorkModal";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const filters = ["ALL", "PENDING", "ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED", "DISPUTED", "COMPLETED", "REJECTED"];

export default function Offers() {
  const { activeRole } = useAuth();
  const { approveOffer, disputeOffer, offers, creator, brand, updateOfferStatus, payOffer, submitOffer } = useAppData();
  const [filter, setFilter] = useState("ALL");
  const [busyOfferId, setBusyOfferId] = useState("");
  const [submitTarget, setSubmitTarget] = useState(null);

  const scopedOffers = useMemo(() => {
    const byRole = activeRole === "brand" ? offers.filter((offer) => offer.brandId === brand.id) : offers.filter((offer) => offer.creatorId === creator.id);
    return filter === "ALL" ? byRole : byRole.filter((offer) => offer.status === filter);
  }, [activeRole, brand.id, creator.id, filter, offers]);

  const runOfferAction = async (offerId, action) => {
    setBusyOfferId(offerId);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      await action(offerId);
    } finally {
      setBusyOfferId("");
    }
  };

  const handleSubmit = async ({ deliverableUrl, deliverableNote }) => {
    if (!submitTarget) return null;
    setBusyOfferId(submitTarget.id);
    try {
      const result = await submitOffer(submitTarget.id, { deliverableUrl, deliverableNote });
      return result;
    } finally {
      setBusyOfferId("");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>{activeRole === "brand" ? "Brand Offers" : "Creator Offers"}</h1>
          <p>{activeRole === "brand" ? "Track offers sent to creators and pay approved briefs." : "Accept or reject sponsorship offers before brands release payment."}</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="segmented" aria-label="Filter offers">
          {filters.map((item) => (
            <button className={`segment-button ${filter === item ? "is-active" : ""}`} key={item} type="button" onClick={() => setFilter(item)}>
              {item === "ALL" ? "All Offers" : item}
            </button>
          ))}
        </div>
      </div>

      {scopedOffers.length ? (
        <div className="offer-list">
          {scopedOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              role={activeRole}
              isBusy={busyOfferId === offer.id}
              onAccept={(id) => runOfferAction(id, () => updateOfferStatus(id, "ACCEPTED"))}
              onApprove={(id) => runOfferAction(id, approveOffer)}
              onDispute={(id) => runOfferAction(id, disputeOffer)}
              onReject={(id) => runOfferAction(id, () => updateOfferStatus(id, "REJECTED"))}
              onPay={(id) => runOfferAction(id, payOffer)}
              onSubmit={(id) => setSubmitTarget(offers.find((item) => item.id === id) || null)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Inbox />
          <strong>No offers in this view</strong>
          <span>Change the filter or switch account role from the sidebar.</span>
        </div>
      )}

      {submitTarget ? (
        <SubmitWorkModal
          offer={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
