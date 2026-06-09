import { BarChart3, HandCoins, Users, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import { useAppData } from "../context/AppDataContext";
import { formatNaira } from "../utils/format";

export default function Analytics() {
  const { creators, offers, totals } = useAppData();
  const nonRejectedOffers = offers.filter((offer) => offer.status !== "REJECTED").length;
  const acceptedRate = offers.length ? Math.round((nonRejectedOffers / offers.length) * 100) : 0;

  const nicheCounts = creators.reduce((map, creator) => {
    const niche = creator.niche || "General";
    map.set(niche, (map.get(niche) || 0) + 1);
    return map;
  }, new Map());
  const topNicheCount = Math.max(...nicheCounts.values(), 1);
  const nichePerformance = [...nicheCounts.entries()].map(([label, count]) => ({
    label,
    value: Math.round((count / topNicheCount) * 100),
  }));

  const statusSpend = offers.reduce((map, offer) => {
    const status = offer.status || "PENDING";
    map.set(status, (map.get(status) || 0) + Number(offer.amount || 0));
    return map;
  }, new Map());

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Analytics</h1>
          <p>Monitor creator supply, offer conversion, transaction fees, and category performance across the marketplace.</p>
        </div>
      </div>

      <section className="stat-grid" aria-label="Marketplace analytics">
        <StatCard label="Marketplace GMV" value={formatNaira(totals.gross)} sub="Completed sponsorship value" icon={Wallet} color="var(--accent)" />
        <StatCard label="Platform Revenue" value={formatNaira(totals.platformFees)} sub="10% transaction cut" icon={HandCoins} color="var(--gold)" />
        <StatCard label="Creator Supply" value={creators.length} sub="Live profiles in discovery" icon={Users} color="var(--purple)" />
        <StatCard label="Offer Conversion" value={`${acceptedRate}%`} sub="Not rejected by creators" icon={BarChart3} color="var(--coral)" />
      </section>

      <section className="insight-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Niche Supply</h2>
              <p>Creator supply indexed against the most represented niche.</p>
            </div>
          </div>
          {nichePerformance.length ? (
            <div className="bar-list">
              {nichePerformance.map((item) => (
                <div className="bar-row" key={item.label}>
                  <span>{item.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.value}%` }} />
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No creator analytics yet</strong>
              <span>Creator supply will appear after real profiles are created.</span>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Offer Spend by Status</h2>
              <p>Live sponsorship value grouped by workflow stage.</p>
            </div>
          </div>
          {statusSpend.size ? (
            <div className="campaign-list">
              {[...statusSpend.entries()].map(([status, spend]) => (
                <div className="mini-row" key={status}>
                  <span>{status}</span>
                  <strong>{formatNaira(spend)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No offer spend yet</strong>
              <span>Accepted and funded offers will populate this view.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
