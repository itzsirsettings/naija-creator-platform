import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Heart,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import MarketingLayout from "../../components/MarketingLayout";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust over growth",
    body: "We'd rather run a small, calm platform that creators and brands trust, than a noisy one that promises the moon. The escrow model exists because trust is the product.",
  },
  {
    icon: Heart,
    title: "Creators are partners, not inventory",
    body: "We charge 10% and refuse to extract more. We don't sell creator data, run a discovery algorithm, or take a cut of brand renewals.",
  },
  {
    icon: Target,
    title: "Clarity over cleverness",
    body: "Every screen, every number, every email is written in plain language. If a creator has to ask 'what does this mean?' we have failed.",
  },
  {
    icon: Users,
    title: "Built in Lagos, for everywhere",
    body: "Tehilla is headquartered in Lagos, Nigeria. We build for Nigerian creators and the brands that hire them — and we are open to the world.",
  },
];

const stats = [
  { value: "10%", label: "Flat platform fee" },
  { value: "≤ 24h", label: "Payouts to Nigerian banks" },
  { value: "2", label: "Roles, one dashboard" },
  { value: "1", label: "Mission: make brand deals feel professional" },
];

const milestones = [
  { date: "Q1 2025", title: "First offer funded", body: "Two creators and one brand desk. ₦120,000 escrowed and paid out cleanly." },
  { date: "Q2 2025", title: "Paystack Transfers live", body: "Direct deposits to verified Nigerian bank accounts. No app wallet in the middle." },
  { date: "Q4 2025", title: "Disputes and audit log", body: "A real review process when a deal goes sideways, plus immutable history for both sides." },
  { date: "Q2 2026", title: "Public launch on tehilla.work", body: "Marketing site goes live. Onboarding opens to the public. We are here." },
];

function Hero() {
  return (
    <section className="hero hero-layout">
      <div className="hero-head">
        <h1 className="display">
          We're building the creator commerce platform{" "}
          <span className="accent">we wished existed.</span>
        </h1>
        <p className="lede">
          Tehilla is the sponsorship desk for Nigerian creators and the brands that pay them. We started
          because we were tired of DMs, invoices, and "I'll pay you next week."
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Join Tehilla <ArrowUpRight />
          </Link>
          <Link to="/contact" className="btn btn-secondary btn-lg">
            Talk to a human
          </Link>
        </div>
        <div className="hero-trust">
          <span className="hero-trust-item"><span className="check"><Check /></span> Lagos, Nigeria</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> NDPR-aligned</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> Paystack-powered</span>
        </div>
      </div>

      <div className="hero-panel" aria-hidden="true">
        <div className="hero-panel-header">
          <strong style={{ fontSize: 13, fontWeight: 650, color: "var(--text)" }}>Our promise</strong>
          <span className="badge-pill"><span className="pulse" /> Tehilla</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text)" }}>
          "The next brand deal you accept should be the cleanest one you've ever done."
        </p>
        <div className="hero-panel-stats">
          <div className="hero-stat">
            <span className="label">Founded</span>
            <span className="value">2025</span>
          </div>
          <div className="hero-stat money">
            <span className="label">HQ</span>
            <span className="value" style={{ fontSize: 18 }}>Lagos</span>
          </div>
          <div className="hero-stat">
            <span className="label">Team</span>
            <span className="value">5</span>
          </div>
        </div>
        <div className="hero-panel-footnote">
          <span>Built for creators, by creators.</span>
          <span>tehilla.work</span>
        </div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="section" aria-labelledby="mission-heading">
      <div className="section-head left">
        <h2 id="mission-heading" className="h1">
          We make brand deals <span className="accent">feel like professional services.</span>
        </h2>
        <p className="lede">
          A creator should be able to accept a brand offer with the same confidence an agency closes a
          client engagement: clear scope, clear fee, clear timeline, clear payment.
        </p>
        <p className="lede">
          That's it. That's the whole product.
        </p>
      </div>
    </section>
  );
}

function Values() {
  return (
    <section className="section" aria-labelledby="values-heading">
      <div className="section-head left">
        <h2 id="values-heading" className="h1">
          What we <span className="accent">will and won't do.</span>
        </h2>
      </div>
      <div className="section-grid-2">
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <article className="feature-card" key={value.title}>
              <div className="feature-icon" aria-hidden="true">
                <Icon />
              </div>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="section" aria-label="Tehilla by the numbers">
      <div className="stat-strip">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong className="money">{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="section" aria-labelledby="timeline-heading">
      <div className="section-head left">
        <h2 id="timeline-heading" className="h1">
          A short, <span className="accent">honest history.</span>
        </h2>
      </div>
      <div className="value-grid">
        {milestones.map((m) => (
          <article className="quote-card" key={m.date}>
            <h3 style={{ marginTop: 12 }}>{m.title}</h3>
            <p style={{ marginTop: 8 }}>{m.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section" aria-labelledby="contact-heading">
      <div className="section-head left">
        <h2 id="contact-heading" className="h1">
          We'd love to <span className="accent">hear from you.</span>
        </h2>
        <p className="lede">
          Questions, partnerships, press, complaints — all of it lands in the same inbox. We read every
          message.
        </p>
      </div>
      <div className="section-grid-3">
        <article className="feature-card">
          <div className="feature-icon"><Mail /></div>
          <h3>General</h3>
          <p>hello@tehilla.work</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon"><Mail /></div>
          <h3>Support</h3>
          <p>support@tehilla.work</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon"><MapPin /></div>
          <h3>Office</h3>
          <p>Lagos, Nigeria</p>
        </article>
      </div>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create your account <ArrowUpRight />
        </Link>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <MarketingLayout>
      <Hero />
      <Mission />
      <Values />
      <Stats />
      <Timeline />
      <Contact />
    </MarketingLayout>
  );
}
