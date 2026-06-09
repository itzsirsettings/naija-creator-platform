import { Eye, MapPin, Send } from "lucide-react";
import Badge from "./Badge";
import { formatCompactNumber, formatNaira, initials } from "../utils/format";

export default function CreatorCard({ creator, onSendOffer, onViewProfile }) {
  return (
    <article className="creator-card">
      <div className="creator-card-head">
        {creator.avatar ? (
          <img className="avatar-lg avatar-image" src={creator.avatar} alt="" />
        ) : (
          <div className="avatar-lg creator-avatar-fallback" style={{ "--avatar-color": creator.avatarColor || "var(--accent)" }}>
            {initials(creator.name)}
          </div>
        )}
        <div className="creator-card-body">
          <div className="creator-card-title">
            <div>
              <h3>{creator.name}</h3>
              <p>@{creator.handle}</p>
            </div>
            <Badge color={creator.match ? "var(--gold)" : "var(--accent)"}>{creator.match ? `${creator.match}% match` : creator.niche}</Badge>
          </div>
          <p className="creator-bio">{creator.bio}</p>
          <div className="offer-meta">
            <span>{creator.niche}</span>
            <span>
              <MapPin size={13} aria-hidden="true" /> {creator.location}
            </span>
            <span>{creator.platforms.join(" + ")}</span>
          </div>
        </div>
      </div>

      <div className="creator-metrics" aria-label={`${creator.name} metrics`}>
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
          <span>Base Rate</span>
        </div>
      </div>

      <div className="creator-card-actions">
        <button className="secondary-button" type="button" onClick={() => onSendOffer(creator)}>
          <Send /> Send Offer
        </button>
        <button className="ghost-button" type="button" onClick={() => onViewProfile?.(creator)}>
          <Eye /> Profile
        </button>
      </div>
    </article>
  );
}
