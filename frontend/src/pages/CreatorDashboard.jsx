import {
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Link2,
  Linkedin,
  Music2,
  SlidersHorizontal,
  Twitter,
  Users,
  Wallet,
  Youtube,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import OfferModal from "../components/OfferModal";
import { useAppData } from "../context/AppDataContext";
import { formatCompactNumber, formatNaira, initials } from "../utils/format";

const socialIcons = [Instagram, Music2, Youtube, Twitter, Linkedin, Link2];

function postedLabel(index) {
  return `Posted ${index + 1} day${index === 0 ? "" : "s"} ago`;
}

function compactDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { balance, creator, offers, transactions, creators, notify, sendOffer, totals } = useAppData();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [savedCreators, setSavedCreators] = useState([]);
  const featuredOffers = offers.filter((offer) => offer.creatorId === creator.id).slice(0, 3);
  const discoverCreators = creators.slice(1, 4);
  const creatorPlatforms = Array.isArray(creator.platforms) ? creator.platforms : [];
  const activeDeals = offers.filter((offer) => ["PENDING", "ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED"].includes(offer.status)).length;
  const statCards = [
    {
      label: "Available Balance",
      value: formatNaira(balance),
      sub: creator.bank || "Verify bank for payouts",
      icon: Wallet,
      tone: "green",
    },
    {
      label: "Total Earned",
      value: formatNaira(totals.totalEarned),
      sub: "Confirmed payouts",
      icon: TrendingUp,
      tone: "green",
    },
    {
      label: "Active Deals",
      value: activeDeals,
      sub: `${totals.pendingCreatorOffers} pending offers`,
      icon: BriefcaseBusiness,
      tone: "green",
    },
    {
      label: "Engagement Rate",
      value: `${creator.engagement || 0}%`,
      sub: "Profile metric",
      icon: Users,
      tone: "green",
    },
  ];

  const toggleSavedCreator = (creatorId, creatorName) => {
    setSavedCreators((current) => {
      const isSaved = current.includes(creatorId);
      notify(isSaved ? `${creatorName} removed from saved creators.` : `${creatorName} saved for follow-up.`);
      return isSaved ? current.filter((id) => id !== creatorId) : [...current, creatorId];
    });
  };

  return (
    <div className="page dashboard-reference-page">
      <section className="dashboard-reference-grid">
        <div className="dashboard-left-stack">
          <article className="profile-overview-card">
            <div className="profile-main">
              {creator.avatar ? (
                <img className="profile-photo" src={creator.avatar} alt="" />
              ) : (
                <div className="profile-photo fallback">{initials(creator.name)}</div>
              )}
              <div className="profile-identity">
                <div className="profile-name-row">
                  <h1>{creator.name}</h1>
                  <CheckCircle2 />
                </div>
                <div className="profile-handle">@{creator.handle}</div>
                <span className="profile-role">Creator</span>
                <div className="social-row" aria-label="Creator social links">
                  {socialIcons.map((Icon, index) => (
                    <button className="social-button" key={index} type="button" aria-label={`Social profile ${index + 1}`} onClick={() => notify("Social profile links can be connected from profile settings.")}>
                      <Icon />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <dl className="profile-meta">
              <div>
                <dt>Niche:</dt>
                <dd>{creatorPlatforms.join(" · ") || creator.niche || "Creator"}</dd>
              </div>
              <div>
                <dt>Location:</dt>
                <dd>
                  <span className="flag">NG</span> {creator.location}
                </dd>
              </div>
              <div>
                <dt>Member since:</dt>
                <dd>{creator.memberSince}</dd>
              </div>
            </dl>
          </article>

          <section className="screenshot-stat-grid" aria-label="Creator metrics">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className="screenshot-stat-card" key={stat.label}>
                  <div className="screenshot-stat-icon" aria-hidden="true">
                    <Icon />
                  </div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small className={stat.label === "Engagement Rate" ? "positive" : ""}>{stat.sub}</small>
                </article>
              );
            })}
          </section>
        </div>

        <aside className="panel screenshot-offers-panel">
          <div className="panel-header">
            <h2>Brand Offers</h2>
            <button className="inline-link" type="button" onClick={() => navigate("/offers")}>View all offers</button>
          </div>
          <div className="screenshot-offer-list">
            {featuredOffers.map((offer, index) => (
              <article className="screenshot-offer-row" key={offer.id}>
                {offer.logo ? <img src={offer.logo} alt="" /> : <div className="offer-logo-fallback">{initials(offer.brandName)}</div>}
                <div className="screenshot-offer-copy">
                  <div>
                    <strong>{offer.brandName}</strong>
                    <Badge color={index === 1 ? "var(--purple)" : "var(--purple)"}>{offer.badge || "New"}</Badge>
                  </div>
                  <span>{offer.title}</span>
                </div>
                <div className="screenshot-offer-side">
                  <strong>{formatNaira(offer.amount)}</strong>
                  <span>{postedLabel(index)}</span>
                </div>
              </article>
            ))}
          </div>
          <button className="view-all-offers" type="button" onClick={() => navigate("/offers")}>View all offers</button>
        </aside>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="panel transaction-table-panel">
          <div className="panel-header">
            <h2>Transaction History</h2>
            <button className="inline-link" type="button" onClick={() => navigate("/payments")}>View all</button>
          </div>
          <div className="transaction-table" role="table" aria-label="Transaction history">
            <div className="transaction-table-head" role="row">
              <span>Date</span>
              <span>Description</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {transactions.slice(0, 5).map((transaction) => (
              <div className="transaction-table-row" role="row" key={transaction.id}>
                <span>{compactDate(transaction.date)}</span>
                <span className="transaction-description">
                  {transaction.logo ? <img src={transaction.logo} alt="" /> : null}
                  <span>
                    <strong>{transaction.label}</strong>
                    <small>{transaction.counterparty}</small>
                  </span>
                </span>
                <span>
                  <span className={`type-pill ${transaction.type}`}>{transaction.type === "credit" ? "Credit" : "Debit"}</span>
                </span>
                <span className={`table-amount ${transaction.type}`}>
                  {transaction.type === "credit" ? "" : "-"}
                  {formatNaira(transaction.amount)}
                </span>
                <span>
                  <span className="status-pill">
                    <CheckCircle2 /> {transaction.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="table-footer">
            <span>Showing {Math.min(transactions.length, 5)} of {transactions.length} transactions</span>
            <div className="pager">
              <button type="button" aria-label="Previous page" onClick={() => notify("You are already on the first transaction page.")}><ChevronLeft /></button>
              <button className="active" type="button">1</button>
              <button type="button" onClick={() => navigate("/payments")}>2</button>
              <button type="button" onClick={() => navigate("/payments")}>3</button>
              <button type="button" aria-label="Next page" onClick={() => navigate("/payments")}><ChevronRight /></button>
            </div>
          </div>
        </article>

        <article className="panel discover-list-panel">
          <div className="panel-header">
            <h2>Discover Nigerian Creators</h2>
            <button className="inline-link" type="button" onClick={() => navigate("/discover")}>View all</button>
          </div>
          <div className="creator-filter-row">
            {[
              ["Category", "All"],
              ["Location", "All Nigeria"],
              ["Followers", "10K+"],
            ].map(([label, value]) => (
              <button className="filter-control" key={label} type="button" onClick={() => navigate("/discover")}>
                <span>{label}</span>
                <strong>{value}</strong>
                <ChevronRight />
              </button>
            ))}
            <button className="filter-control more" type="button" onClick={() => navigate("/discover")}>
              <SlidersHorizontal />
              <strong>More Filters</strong>
            </button>
          </div>
          <div className="creator-list">
            {discoverCreators.map((item) => (
              <article className="creator-list-row" key={item.id}>
                {item.avatar ? <img src={item.avatar} alt="" /> : <div className="avatar-sm">{initials(item.name)}</div>}
                <div className="creator-list-copy">
                  <div>
                    <strong>{item.name}</strong>
                    <CheckCircle2 />
                  </div>
                  <span>@{item.handle}</span>
                  <small>{item.platforms.join(" · ")}</small>
                </div>
                <div className="creator-list-metric">
                  <strong>{formatCompactNumber(item.followers)}</strong>
                  <span>Followers</span>
                </div>
                <div className="creator-list-metric">
                  <strong>{item.engagement}%</strong>
                  <span>Eng. Rate</span>
                </div>
                <button className="send-offer-small" type="button" onClick={() => setSelectedCreator(item)}>Send Offer</button>
                <button
                  className={`bookmark-button ${savedCreators.includes(item.id) ? "is-saved" : ""}`}
                  type="button"
                  aria-label={`${savedCreators.includes(item.id) ? "Remove" : "Save"} ${item.name}`}
                  aria-pressed={savedCreators.includes(item.id)}
                  onClick={() => toggleSavedCreator(item.id, item.name)}
                >
                  <Bookmark fill={savedCreators.includes(item.id) ? "currentColor" : "none"} />
                </button>
              </article>
            ))}
          </div>
          <div className="table-footer">
            <span>Showing {Math.min(discoverCreators.length, 3)} of {creators.length} creators</span>
            <div className="pager">
              <button type="button" aria-label="Previous page" onClick={() => notify("You are already on the first creator page.")}><ChevronLeft /></button>
              <button className="active" type="button">1</button>
              <button type="button" onClick={() => navigate("/discover")}>2</button>
              <button type="button" onClick={() => navigate("/discover")}>3</button>
              <button type="button" onClick={() => navigate("/discover")}>4</button>
              <button type="button" onClick={() => navigate("/discover")}>5</button>
              <button type="button" aria-label="Next page" onClick={() => navigate("/discover")}><ChevronRight /></button>
            </div>
          </div>
        </article>
      </section>

      {selectedCreator ? (
        <OfferModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} onSubmit={sendOffer} />
      ) : null}
    </div>
  );
}
