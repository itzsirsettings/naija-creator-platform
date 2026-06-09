import { AlertTriangle, CalendarDays, Check, CreditCard, Send, ShieldCheck, X } from "lucide-react";
import Badge from "./Badge";
import { calculateFees, formatNaira } from "../utils/format";

const readableStatus = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  FUNDED: "Funded",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  DISPUTED: "Disputed",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export default function OfferCard({ offer, role = "creator", onAccept, onApprove, onDispute, onPay, onReject, onSubmit, isBusy = false }) {
  const fees = calculateFees(offer.amount);
  const canCreatorAct = role === "creator" && offer.status === "PENDING";
  const canBrandPay = role === "brand" && offer.status === "ACCEPTED";
  const canCreatorSubmit = role === "creator" && offer.status === "FUNDED";
  const canBrandApprove = role === "brand" && offer.status === "SUBMITTED";
  const canDispute = ["FUNDED", "SUBMITTED", "APPROVED"].includes(offer.status);

  return (
    <article className="offer-card">
      <div className="offer-main">
        <div className="offer-title-row">
          <h3>{offer.title}</h3>
          <Badge tone={offer.status}>{readableStatus[offer.status] || offer.status}</Badge>
        </div>
        <div className="offer-meta">
          <span>{role === "brand" ? offer.creatorName : offer.brandName}</span>
          <span>{offer.platform}</span>
          <span>
            <CalendarDays size={13} aria-hidden="true" /> Due {new Date(offer.deadline).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
          </span>
        </div>
        <p className="offer-description">{offer.description}</p>
      </div>

      <div className="offer-side">
        <span className="offer-amount">{formatNaira(offer.amount)}</span>
        <span className="offer-net">{formatNaira(fees.netAmount)} creator net</span>
        <div className="offer-actions">
          {canCreatorAct ? (
            <>
              <button className="compact-button accept" type="button" onClick={() => onAccept(offer.id)} disabled={isBusy}>
                <Check size={14} /> {isBusy ? "Saving" : "Accept"}
              </button>
              <button className="compact-button reject" type="button" onClick={() => onReject(offer.id)} disabled={isBusy}>
                <X size={14} /> Reject
              </button>
            </>
          ) : null}
          {canBrandPay ? (
            <button className="compact-button pay" type="button" onClick={() => onPay(offer.id)} disabled={isBusy}>
              <CreditCard size={14} /> {isBusy ? "Paying" : "Pay"}
            </button>
          ) : null}
          {canCreatorSubmit ? (
            <button className="compact-button accept" type="button" onClick={() => onSubmit(offer.id)} disabled={isBusy}>
              <Send size={14} /> {isBusy ? "Saving" : "Submit"}
            </button>
          ) : null}
          {canBrandApprove ? (
            <button className="compact-button pay" type="button" onClick={() => onApprove(offer.id)} disabled={isBusy}>
              <ShieldCheck size={14} /> {isBusy ? "Queuing" : "Approve"}
            </button>
          ) : null}
          {canDispute ? (
            <button className="compact-button reject" type="button" onClick={() => onDispute(offer.id)} disabled={isBusy}>
              <AlertTriangle size={14} /> Dispute
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
