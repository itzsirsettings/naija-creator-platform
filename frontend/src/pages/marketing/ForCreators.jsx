import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Check,
  CircleDollarSign,
  Clock4,
  Handshake,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";
import MarketingLayout from "../../components/MarketingLayout";

const promises = [
  {
    icon: CircleDollarSign,
    title: "90% of every offer, every time",
    body: "Flat 10% platform fee. No percentage of your tips, no cut on referrals, no surprise deductions on payout day.",
  },
  {
    icon: Banknote,
    title: "Direct deposits, not app wallets",
    body: "Money moves from Paystack straight to your verified Nigerian bank account. You keep the ledger; we just move the money.",
  },
  {
    icon: Clock4,
    title: "Paid within 24 hours of approval",
    body: "The moment a brand approves your delivery, your payout is queued. Most creators see funds in their bank the next business day.",
  },
  {
    icon: ShieldCheck,
    title: "Escrow that protects your work",
    body: "When a brand funds an offer, the money is held by Tehilla. We don't release it to the brand until the deliverables are approved.",
  },
  {
    icon: Handshake,
    title: "Briefs that don't waste your time",
    body: "Every offer includes platform, deliverables, deadline, and fee breakdown before you commit. No 'we'll figure it out later' DMs.",
  },
  {
    icon: TrendingUp,
    title: "A dashboard that respects you",
    body: "See every offer, every payout, and every transaction in one place. Export your history any time. Your data stays yours.",
  },
];

const earningRows = [
  { offer: 50000, fee: 5000, net: 45000 },
  { offer: 100000, fee: 10000, net: 90000 },
  { offer: 250000, fee: 25000, net: 225000 },
  { offer: 500000, fee: 50000, net: 450000 },
];

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function Hero() {
  return (
    <section className="hero hero-layout">
      <div className="hero-head">
        <h1 className="display">
          Stop chasing invoices.{" "}
          <span className="accent">Start getting paid like the brand you are.</span>
        </h1>
        <p className="lede">
          Tehilla is built around the moment money moves — clean offers in, escrowed funds, direct payouts out.
          You focus on the work. We focus on the rest.
        </p>
        <div className="hero-actions">
          <Link to="/register?role=creator" className="btn btn-primary btn-lg">
            Create creator account <ArrowUpRight />
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            See pricing
          </Link>
        </div>
        <div className="hero-trust">
          <span className="hero-trust-item"><span className="check"><Check /></span> 10% flat fee</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> Direct bank deposits</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> Free to sign up</span>
        </div>
      </div>

      <div className="hero-panel" aria-hidden="true">
        <div className="hero-panel-header">
          <strong style={{ fontSize: 13, fontWeight: 650, color: "var(--text)" }}>This month</strong>
          <span className="badge-pill"><span className="pulse" /> Live</span>
        </div>
        <div className="hero-panel-stats">
          <div className="hero-stat">
            <span className="label">Balance</span>
            <span className="value">₦412,500</span>
          </div>
          <div className="hero-stat money">
            <span className="label">This month</span>
            <span className="value">+₦186,000</span>
          </div>
          <div className="hero-stat">
            <span className="label">Open offers</span>
            <span className="value">3</span>
          </div>
        </div>
        <div className="hero-panel-row">
          <div className="meta">
            <div className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>PB</div>
            <div className="text">
              <strong>Paystack × Reel</strong>
              <span>1 Instagram Reel · 7 days</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status funded">Funded</span>
            <span className="amount">₦120,000</span>
          </div>
        </div>
        <div className="hero-panel-row">
          <div className="meta">
            <div className="avatar" style={{ background: "var(--indigo-soft)", color: "var(--indigo)" }}>FW</div>
            <div className="text">
              <strong>Flutterwave × TikTok</strong>
              <span>1 TikTok video · 5 days</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status indigo">Submitted</span>
            <span className="amount">₦85,000</span>
          </div>
        </div>
        <div className="hero-panel-row">
          <div className="meta">
            <div className="avatar" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>KG</div>
            <div className="text">
              <strong>Konga × Story</strong>
              <span>1 story mention · delivered</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status paid">Paid</span>
            <span className="amount">₦50,000</span>
          </div>
        </div>
        <div className="hero-panel-footnote">
          <span>Next payout to <strong>GTBank •••• 4521</strong></span>
          <span>in 1 day</span>
        </div>
      </div>
    </section>
  );
}

function PromiseGrid() {
  return (
    <section className="section" aria-labelledby="promise-heading">
      <div className="section-head left">
        <h2 id="promise-heading" className="h1">
          The platform <span className="accent">creators actually want to be on.</span>
        </h2>
        <p className="lede">
          Six quiet promises. No fine print, no asterisks, no "subject to change without notice."
        </p>
      </div>
      <div className="section-grid-3">
        {promises.map((promise) => {
          const Icon = promise.icon;
          return (
            <article className="feature-card" key={promise.title}>
              <div className="feature-icon" aria-hidden="true">
                <Icon />
              </div>
              <h3>{promise.title}</h3>
              <p>{promise.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EarningsCalculator() {
  return (
    <section className="section" aria-labelledby="earnings-heading">
      <div className="section-head left">
        <h2 id="earnings-heading" className="h1">
          The fee is <span className="accent">always the same.</span>
        </h2>
        <p className="lede">
          No percentage tiers, no monthly subscription, no "premium creator" upsell. 10% of the offer amount, full stop.
        </p>
      </div>
      <div className="calc-card">
        <table className="fee-table" aria-label="What you earn on sample offer amounts">
          <thead>
            <tr>
              <th scope="col">Brand offer</th>
              <th scope="col">Platform fee (10%)</th>
              <th scope="col">You receive</th>
            </tr>
          </thead>
          <tbody>
            {earningRows.map((row) => (
              <tr key={row.offer}>
                <td>{formatNaira(row.offer)}</td>
                <td className="muted">{formatNaira(row.fee)}</td>
                <td className="strong money">{formatNaira(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="calc-foot">
          Calculator: example only. Actual payouts include the 10% Tehilla platform fee and any bank charges from the
          receiving account.
        </p>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="section" aria-labelledby="creator-workflow-heading">
      <div className="section-head left">
        <h2 id="creator-workflow-heading" className="h1">
          From offer to payout, <span className="accent">in five moves.</span>
        </h2>
        <p className="lede">
          We've removed every DM, every "let me check with my manager," and every "I'll pay you next week" from the
          process.
        </p>
      </div>
      <div className="section-grid-3">
        {[
          { title: "Set up your profile", body: "Add your handle, niche, audience, and bank account. Five minutes, then forget it." },
          { title: "Receive offers", body: "Brands find you and send paid offers with clear scope, deadline, and fee breakdown." },
          { title: "Accept & deliver", body: "Accept the offer that fits. When you deliver, mark it done in the dashboard." },
          { title: "Brand approves", body: "Once the brand marks the work as complete, your payout is queued." },
          { title: "Money in your bank", body: "Most creators see funds in their Nigerian account within 24 hours." },
          { title: "Keep your history", body: "Every offer and payout is logged. Export any time for your records." },
        ].map((step) => (
          <article className="feature-card" key={step.title}>
            <div className="feature-icon" aria-hidden="true">
              <Sparkles />
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
    <section className="section" aria-labelledby="creator-cta">
      <div className="cta-band">
        <h2 id="creator-cta">
          Set up your creator account in five minutes. Get paid in the next five days.
        </h2>
        <p>
          No card required. No subscription. We only make money when you do.
        </p>
        <div className="cta-band-actions">
          <Link to="/register?role=creator" className="btn btn-primary btn-lg">
            Create creator account <ArrowUpRight />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ForCreators() {
  return (
    <MarketingLayout>
      <Hero />
      <PromiseGrid />
      <EarningsCalculator />
      <Workflow />
      <CtaBand />
    </MarketingLayout>
  );
}
