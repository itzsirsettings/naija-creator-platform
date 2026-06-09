import { useState } from "react";
import { Link2, Send, X } from "lucide-react";

export default function SubmitWorkModal({ offer, onClose, onSubmit }) {
  const [deliverableUrl, setDeliverableUrl] = useState(offer?.deliverableUrl || "");
  const [deliverableNote, setDeliverableNote] = useState(offer?.deliverableNote || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!deliverableUrl.trim()) {
      setError("Add a link to your deliverable before submitting for approval.");
      return;
    }
    if (!/^https?:\/\//i.test(deliverableUrl.trim())) {
      setError("Deliverable link must start with http:// or https://");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        deliverableUrl: deliverableUrl.trim(),
        deliverableNote: deliverableNote.trim() || undefined,
      });
      if (result !== null) {
        onClose();
      }
    } catch (submitError) {
      setError(submitError.message || "Could not submit this work. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!offer) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} aria-label={`Submit work for ${offer.title}`}>
        <div className="modal-header">
          <div>
            <h2>Submit Work for Approval</h2>
            <p>{offer.brandName} · {offer.title}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close submit form">
            <X />
          </button>
        </div>

        <div className="auth-form">
          <label className="input-field">
            <span>
              <Link2 size={14} aria-hidden="true" /> Deliverable link
            </span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://drive.google.com/... or your hosted video URL"
              value={deliverableUrl}
              onChange={(event) => setDeliverableUrl(event.target.value)}
              required
            />
            <small>Share a Google Drive, Dropbox, YouTube (unlisted), or hosted link. The brand can review before approval.</small>
          </label>

          <label className="input-field">
            <span>Note to brand (optional)</span>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="Add any context, captions, or usage notes the brand should know."
              value={deliverableNote}
              onChange={(event) => setDeliverableNote(event.target.value)}
            />
          </label>

          {error ? <div className="form-error" role="alert">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <Send size={14} /> {isSubmitting ? "Submitting..." : "Submit for approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
