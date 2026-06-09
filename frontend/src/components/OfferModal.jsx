import { useState } from "react";
import { X } from "lucide-react";
import { calculateFees, formatNaira } from "../utils/format";

export default function OfferModal({ creator, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "Sponsored creator post",
    description: `Create a short campaign story for ${creator?.handle ? `@${creator.handle}` : "this creator"} with tracked links and usage rights for brand reposting.`,
    amount: creator?.baseRate || 75000,
    platform: creator?.platforms?.[0] || "Instagram Reels",
    deadline: "2026-06-14",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fees = calculateFees(form.amount);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Number(form.amount) < 10000) {
      setError("Offers must be at least ₦10,000.");
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      setError("Add a clear title and campaign description before sending.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      const result = await onSubmit({
        creatorId: creator.id,
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        amount: Number(form.amount),
      });
      if (result !== null) {
        onClose();
      }
    } catch (submitError) {
      setError(submitError.message || "Could not send this offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!creator) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} aria-label={`Send offer to ${creator.name}`}>
        <div className="modal-header">
          <div>
            <h2>Send Offer</h2>
            <p>{creator.name} · @{creator.handle}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close offer form">
            <X />
          </button>
        </div>

        <div className="auth-form">
          <label className="input-field">
            <span>Campaign title</span>
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
          </label>
          <label className="input-field">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
          </label>
          <label className="input-field">
            <span>Amount in NGN</span>
            <input min="10000" step="5000" type="number" value={form.amount} onChange={(event) => updateField("amount", event.target.value)} required />
            <small>Tehilla records a 10% platform fee before creator payout.</small>
          </label>
          <label className="input-field">
            <span>Platform</span>
            <select value={form.platform} onChange={(event) => updateField("platform", event.target.value)}>
              {["Instagram Reels", "Instagram Stories", "TikTok Video", "YouTube Short", "X Thread"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="input-field">
            <span>Deadline</span>
            <input type="date" value={form.deadline} onChange={(event) => updateField("deadline", event.target.value)} required />
          </label>

          <div className="panel" aria-label="Fee breakdown">
            <div className="mini-row">
              <span>Brand pays</span>
              <strong>{formatNaira(fees.grossAmount)}</strong>
            </div>
            <div className="mini-row">
              <span>Platform fee 10%</span>
              <strong>{formatNaira(fees.platformFee)}</strong>
            </div>
            <div className="mini-row">
              <span>Creator receives</span>
              <strong>{formatNaira(fees.netAmount)}</strong>
            </div>
          </div>

          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending offer..." : "Send offer"}
          </button>
        </div>
      </form>
    </div>
  );
}
