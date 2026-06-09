import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock4,
  CreditCard,
  Handshake,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import MarketingLayout from "../../components/MarketingLayout";

const benefits = [
  {
    icon: Search,
    title: "Discover creators that actually fit",
    body: "Filter by niche, audience size, engagement rate, and platform. Stop mass-DMing — start sending offers creators want to accept.",
  },
  {
    icon: CircleDollarSign,
    title: "One fee, not twelve",
    body: "Flat 10% platform fee on the offer amount. No subscription, no setup cost, no commission stacking.",
  },
  {
    icon: CreditCard,
    title: "Checkout your finance team already uses",
    body: "Cards, transfer, USSD — all through Paystack. Your accounting system gets one clean invoice per offer.",
  },
  {
    icon: ShieldCheck,
    title: "Funds in escrow, not in limbo",
    body: "When you fund an offer, money is held by Tehilla. It's only released to the creator when you approve the work.",
  },
  {
    icon: Clock4,
    title: "Approvals that move at the speed of marketing",
    body: "Mark a delivery as complete in two clicks. Your finance team isn't chasing creators on Twitter for invoices.",
  },
  {
    icon: BarChart3,
    title: "One report for the quarter",
    body: "See every offer, every spend, and every creator in one place. Export your data anytime. NDPR-aligned and secure.",
  },
];

const heroRows = [
  { name: "Temi Adeyemi", handle: "@temivibes", niche: "Fashion", followers: "420K", status: "Reviewing", statusClass: "indigo", amount: "₦85,000" },
  { name: "Chidi Okafor", handle: "@chiditech", niche: "Tech", followers: "280K", status: "Funded", statusClass: "funded", amount: "₦60,000" },
  { name: "Amaka Nwosu", handle: "@amakacooks", niche: "Food", followers: "195K", status: "Completed", statusClass: "paid", amount: "₦45,000" },
  { name: "Tunde Bakare", handle: "@tundegaming", niche: "Gaming", followers: "510K", status: "Funded", statusClass: "funded", amount: "₦120,000" },
];

function Hero() {
  return (
    <section className="hero hero-layout">
      <div className="hero-head">
        <h1 className="display">
          The sponsorship desk{" "}
          <span className="accent">your finance team will actually like.</span>
        </h1>
        <p className="lede">
          Tehilla gives marketers a calm, auditable way to find Nigerian creators, send paid offers, and only
          pay for work that lands. No agency markup, no surprise DMs, no reconciliation mess.
        </p>
        <div className="hero-actions">
          <Link to="/register?role=brand" className="btn btn-primary btn-lg">
            Create brand account <ArrowUpRight />
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            See pricing
          </Link>
        </div>
        <div className="hero-trust">
          <span className="hero-trust-item"><span className="check"><Check /></span> Paystack checkout</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> Escrow on every offer</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> NDPR-aligned data</span>
        </div>
      </div>

      <div className="hero-panel" aria-hidden="true">
        <div className="hero-panel-header">
          <strong style={{ fontSize: 13, fontWeight: 650, color: "var(--text)" }}>Brand desk · Q3</strong>
          <span className="badge-pill"><span className="pulse" /> Live</span>
        </div>
        <div className="hero-panel-stats">
          <div className="hero-stat">
            <span className="label">Active offers</span>
            <span className="value">12</span>
          </div>
          <div className="hero-stat money">
            <span className="label">In escrow</span>
            <span className="value">₦1.4M</span>
          </div>
          <div className="hero-stat">
            <span className="label">Creators</span>
            <span className="value">48</span>
          </div>
        </div>
        {heroRows.map((row) => (
          <div className="hero-panel-row" key={row.handle}>
            <div className="meta">
              <div className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                {row.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div className="text">
                <strong>{row.name}</strong>
                <span>{row.niche} · {row.followers} followers</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`status ${row.statusClass}`}>{row.status}</span>
              <span className="amount">{row.amount}</span>
            </div>
          </div>
        ))}
        <div className="hero-panel-footnote">
          <span>3 creators matching <strong>"fintech, Lagos"</strong></span>
          <span>refreshed 2 min ago</span>
        </div>
      </div>
    </section>
  );
}

function BenefitGrid() {
  return (
    <section className="section" aria-labelledby="brand-benefits">
      <div className="section-head left">
        <h2 id="brand-benefits" className="h1">
          Built for marketers who <span className="accent">care about ROI.</span>
        </h2>
        <p className="lede">
          The same six promises you make to your customers, applied to the people you hire to amplify your
          message.
        </p>
      </div>
      <div className="section-grid-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article className="feature-card" key={benefit.title}>
              <div className="feature-icon" aria-hidden="true">
                <Icon />
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EscrowFlow() {
  return (
    <section className="section" aria-labelledby="escrow-heading">
      <div className="section-head left">
        <h2 id="escrow-heading" className="h1">
          Funds move <span className="accent">when the work moves.</span>
        </h2>
        <p className="lede">
          Tehilla doesn't hold money for the sake of holding it. We hold it to make sure everyone gets what they
          agreed to.
        </p>
      </div>
      <div className="section-grid-3">
        {[
          { title: "Send offer", body: "Set platform, deliverables, deadline, and amount. The creator sees the brief before accepting." },
          { title: "Creator accepts", body: "When accepted, the offer is a binding agreement. The creator knows what's expected." },
          { title: "You fund via Paystack", body: "Pay with card, transfer, or USSD. The money is held by Tehilla — not by the creator." },
          { title: "Creator delivers", body: "The creator submits the deliverables. You get notified to review." },
          { title: "You approve", body: "Two clicks. The work is accepted. Tehilla releases the funds for payout." },
          { title: "Creator is paid", body: "The creator's 90% lands in their verified Nigerian account within 24 hours." },
        ].map((step) => (
          <article className="feature-card" key={step.title}>
            <div className="feature-icon" aria-hidden="true">
              <Handshake />
            </div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section" aria-labelledby="brand-cta">
      <div className="cta-band">
        <h2 id="brand-cta">
          The next creator you want to work with is on Tehilla. So is the one after that.
        </h2>
        <p>
          Set up your brand desk today. Send your first offer in the next hour. Only pay when the work is approved.
        </p>
        <div className="cta-band-actions">
          <Link to="/register?role=brand" className="btn btn-primary btn-lg">
            Create brand account <ArrowUpRight />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ForBrands() {
  return (
    <MarketingLayout>
      <Hero />
      <BenefitGrid />
      <EscrowFlow />
      <CtaBand />
    </MarketingLayout>
  );
}
