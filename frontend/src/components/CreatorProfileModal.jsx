import { MapPin, Send, Star, X } from "lucide-react";
import { formatCompactNumber, formatNaira, initials } from "../utils/format";

export default function CreatorProfileModal({ creator, onClose, onSendOffer }) {
  if (!creator) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal creator-profile-modal" role="dialog" aria-modal="true" aria-labelledby="creator-profile-title">
        <div className="modal-header">
          <div>
            <h2 id="creator-profile-title">{creator.name}</h2>
            <p>@{creator.handle} · {creator.niche}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close creator profile">
            <X />
          </button>
        </div>

        <div className="profile-modal-head">
          {creator.avatar ? <img src={creator.avatar} alt="" /> : <div className="avatar-lg">{initials(creator.name)}</div>}
          <div>
            <p>{creator.bio}</p>
            <span>
              <MapPin /> {creator.location}
            </span>
          </div>
        </div>

        <div className="profile-modal-metrics" aria-label={`${creator.name} campaign metrics`}>
          <div>
            <strong>{formatCompactNumber(creator.followers)}</strong>
            <span>Followers</span>
          </div>
          <div>
            <strong>{creator.engagement}%</strong>
            <span>Engagement</span>
          </div>
          <div>
            <strong>{formatNaira(creator.baseRate)}</strong>
            <span>Base rate</span>
          </div>
          <div>
            <strong>{creator.rating || "4.8"}</strong>
            <span>
              <Star /> Rating
            </span>
          </div>
        </div>

        <div className="profile-modal-tags">
          {creator.platforms.map((platform) => (
            <span key={platform}>{platform}</span>
          ))}
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            onSendOffer(creator);
            onClose();
          }}
        >
          <Send /> Send offer
        </button>
      </section>
    </div>
  );
}
