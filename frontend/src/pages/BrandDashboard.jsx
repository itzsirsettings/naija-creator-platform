import { useState } from "react";
import { BarChart3, Handshake, Percent, Send, TrendingUp, Wallet } from "lucide-react";
import Badge from "../components/Badge";
import CreatorCard from "../components/CreatorCard";
import CreatorProfileModal from "../components/CreatorProfileModal";
import OfferCard from "../components/OfferCard";
import OfferModal from "../components/OfferModal";
import StatCard from "../components/StatCard";
import { useAppData } from "../context/AppDataContext";
import { formatNaira } from "../utils/format";

export default function BrandDashboard() {
  const { approveOffer, creators, disputeOffer, offers, brand, totals, notify, sendOffer, payOffer } = useAppData();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [profileCreator, setProfileCreator] = useState(null);
  const brandOffers = offers.filter((offer) => offer.brandId === brand.id);
  const activeCampaigns = brandOffers.filter((offer) => ["ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED"].includes(offer.status));
  const avgEngagement = creators.length
    ? `${(creators.reduce((sum, creator) => sum + Number(creator.engagement || 0), 0) / creators.length).toFixed(1)}%`
    : "0%";

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Brand Dashboard</h1>
          <p>Shortlist Nigerian creators, send sponsorship offers, and pay securely through Paystack.</p>
        </div>
        <div className="actions-row">
          <button className="ghost-button" type="button" onClick={() => notify("Campaign report queued for this brand workspace.")}>
            <BarChart3 /> Campaign Report
          </button>
          <button className="primary-button" type="button" onClick={() => setSelectedCreator(creators[1])}>
            <Send /> New Offer
          </button>
        </div>
      </div>

      <section className="stat-grid" aria-label="Brand metrics">
        <StatCard label="Total Spend" value={formatNaira(totals.brandSpend)} sub="This month plus open offers" icon={Wallet} color="var(--purple)" />
        <StatCard label="Active Campaigns" value={activeCampaigns.length} sub="Funded or in review" icon={Handshake} color="var(--gold)" />
        <StatCard label="Avg. Engagement" value={avgEngagement} sub="Across live creators" icon={TrendingUp} color="var(--accent)" />
        <StatCard label="Approval Queue" value={brandOffers.filter((offer) => offer.status === "SUBMITTED").length} sub="Awaiting payout release" icon={Percent} color="var(--coral)" />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Creator Shortlist</h2>
              <p>Recommended profiles for fintech and merchant stories.</p>
            </div>
            <Badge color="var(--purple)">{creators.length} creators found</Badge>
          </div>
          <div className="creator-grid">
            {creators.slice(1, 5).map((creator) => (
              <CreatorCard key={creator.id} creator={creator} onSendOffer={setSelectedCreator} onViewProfile={setProfileCreator} />
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Offer Pipeline</h2>
                <p>Pay accepted briefs and release creator earnings.</p>
              </div>
            </div>
            <div className="offer-list">
              {brandOffers.slice(0, 3).map((offer) => (
                <OfferCard key={offer.id} offer={offer} role="brand" onApprove={approveOffer} onDispute={disputeOffer} onPay={payOffer} />
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Campaigns</h2>
                <p>Brand-side spend grouped by brief.</p>
              </div>
            </div>
            {brandOffers.slice(0, 5).map((offer) => (
              <div className="mini-row" key={offer.id}>
                <span>{offer.title} · {offer.status}</span>
                <strong>{formatNaira(offer.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedCreator ? (
        <OfferModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} onSubmit={sendOffer} />
      ) : null}

      {profileCreator ? (
        <CreatorProfileModal creator={profileCreator} onClose={() => setProfileCreator(null)} onSendOffer={setSelectedCreator} />
      ) : null}
    </div>
  );
}
