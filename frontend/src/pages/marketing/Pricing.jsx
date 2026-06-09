import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Clock4,
  CreditCard,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import MarketingLayout from "../../components/MarketingLayout";

const feeRows = [
  { offer: 50000, fee: 5000, net: 45000 },
  { offer: 100000, fee: 10000, net: 90000 },
  { offer: 250000, fee: 25000, net: 225000 },
  { offer: 500000, fee: 50000, net: 450000 },
  { offer: 1000000, fee: 100000, net: 900000 },
];

const comparison = [
  { feature: "Platform fee", tehilla: "10% flat on funded offers", other: "12–25% + subscriptions" },
  { feature: "Payout speed", tehilla: "≤ 24h after brand approval", other: "3–14 days" },
  { feature: "Direct bank deposit", tehilla: "Verified Nigerian accounts", other: "Wallet balance only" },
  { feature: "Escrow protection", tehilla: "On every offer, by default", other: "Sometimes, on request" },
  { feature: "Subscription", tehilla: "None", other: "Monthly or annual" },
  { feature: "Hidden fees", tehilla: "None", other: "Varies" },
  { feature: "Support", tehilla: "Real humans, real fast", other: "Tickets, queues" },
  { feature: "NDPR alignment", tehilla: "Designed in", other: "Varies" },
];

const addOns = [
  { title: "Premium discovery", body: "Featured placement in brand search results. Coming soon." },
  { title: "Multi-creator briefs", body: "Run a single brief to a shortlist. Coming soon." },
  { title: "Custom contracts", body: "Add your own MSA terms. Coming soon." },
  { title: "Team seats", body: "Add your agency teammates with separate permissions. Coming soon." },
];

const faqs = [
  {
    q: "Why 10%?",
    a: "It covers Paystack fees, payouts, infrastructure, and our support team — and nothing else. We're not optimizing for the highest take rate, we're optimizing for the longest creator-brand relationship.",
  },
  {
    q: "Who pays the 10% — the creator or the brand?",
    a: "It comes out of the offer amount. The creator sees their 90% number clearly when the offer lands, and the brand pays the offer amount plus the 10% platform fee on top.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. Paystack charges standard transaction fees (1.5% capped at ₦2,000 for local cards) on the platform fee. Banks may charge small receiving fees. You'll see every number in the dashboard before you commit.",
  },
  {
    q: "What if a deal falls through?",
    a: "If the offer is cancelled before work begins, the brand's money is refunded minus Paystack's transaction fee. If work has started and a dispute is opened, our support team reviews the case within 5 business days.",
  },
  {
    q: "Do you have a free plan?",
    a: "Every account is free to create. You only pay when an offer is funded. There are no subscriptions, no setup costs, no minimum spend.",
  },
  {
    q: "When is the platform fee charged?",
    a: "When the brand funds the offer, the offer amount is held in escrow. The 10% platform fee is settled when the offer is completed and the creator's payout is queued.",
  },
];

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function Hero() {
  return (
    <section className="hero hero-layout" style={{ gridTemplateColumns: "1fr" }}>
      <div className="hero-head" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <h1 className="display">
          One fee. <span className="accent">No surprises.</span>
        </h1>
        <p className="lede">
          Tehilla charges a flat 10% on the offer amount — and that's it. No subscription, no setup cost, no
          percentage stacking. You see every number before you commit.
        </p>
      </div>
    </section>
  );
}

function FeeTable() {
  return (
    <section className="section" aria-labelledby="fee-table-heading">
      <div className="section-head left">
        <h2 id="fee-table-heading" className="h1">
          What 10% actually looks like.
        </h2>
        <p className="lede">
          For every offer a brand funds, the platform fee is 10% of the offer amount. The creator receives 90%.
        </p>
      </div>
      <div className="calc-card">
        <table className="fee-table" aria-label="Fee breakdown by offer amount">
          <thead>
            <tr>
              <th scope="col">Brand offer</th>
              <th scope="col">Platform fee (10%)</th>
              <th scope="col">Creator receives</th>
            </tr>
          </thead>
          <tbody>
            {feeRows.map((row) => (
              <tr key={row.offer}>
                <td>{formatNaira(row.offer)}</td>
                <td className="muted">{formatNaira(row.fee)}</td>
                <td className="strong money">{formatNaira(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="section" aria-labelledby="comparison-heading">
      <div className="section-head left">
        <h2 id="comparison-heading" className="h1">
          A side-by-side, <span className="accent">in plain language.</span>
        </h2>
        <p className="lede">
          We're not going to pretend we're cheaper than every other tool in every situation. We are going to
          show you what we are, and what we aren't.
        </p>
      </div>
      <div className="calc-card">
        <table className="fee-table" aria-label="Pricing comparison">
          <thead>
            <tr>
              <th scope="col">What you care about</th>
              <th scope="col" style={{ color: "var(--accent)" }}>Tehilla</th>
              <th scope="col" className="muted">Typical alternatives</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.feature}>
                <td>{row.feature}</td>
                <td className="strong">{row.tehilla}</td>
                <td className="muted">{row.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddOns() {
  return (
    <section className="section" aria-labelledby="addons-heading">
      <div className="section-head left">
        <h2 id="addons-heading" className="h1">
          What we're <span className="accent">working on next.</span>
        </h2>
        <p className="lede">
          The 10% platform fee covers the core platform. Anything you see here is opt-in, transparent, and
          never bundled.
        </p>
      </div>
      <div className="section-grid-2">
        {addOns.map((addon) => (
          <article className="feature-card" key={addon.title}>
            <div className="feature-icon" aria-hidden="true">
              <Sparkles />
            </div>
            <h3>{addon.title}</h3>
            <p>{addon.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" aria-labelledby="faq-heading">
      <div className="section-head left">
        <h2 id="faq-heading" className="h1">
          Honest answers to <span className="accent">the questions you'll ask.</span>
        </h2>
      </div>
      <div className="faq">
        {faqs.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.q} className={`faq-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                <span>{item.q}</span>
                <span className="faq-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen ? <div className="faq-a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section" aria-labelledby="pricing-cta">
      <div className="cta-band">
        <h2 id="pricing-cta">
          You read the page. Now start a deal.
        </h2>
        <p>
          Create your account, set up your profile or brand desk, and send or accept your first offer. We
          only make money when you do.
        </p>
        <div className="cta-band-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Create your account <ArrowUpRight />
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Pricing() {
  return (
    <MarketingLayout>
      <Hero />
      <FeeTable />
      <Comparison />
      <AddOns />
      <Faq />
      <CtaBand />
    </MarketingLayout>
  );
}
