import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Check,
  UserRound,
} from "lucide-react";
import MarketingLayout from "../../components/MarketingLayout";
import creator90IllustrationDark from "../../assets/creator-90-dark.png";
import creator90IllustrationLight from "../../assets/creator-90-light.png";
import createAccountIllustrationDark from "../../assets/create-account-dark.png";
import createAccountIllustrationLight from "../../assets/create-account-light.png";
import builtForTrustIllustrationDark from "../../assets/built-for-trust-dark.png";
import builtForTrustIllustrationLight from "../../assets/built-for-trust-light.png";
import directBankPayoutsIllustrationDark from "../../assets/direct-bank-payouts-dark.png";
import directBankPayoutsIllustrationLight from "../../assets/direct-bank-payouts-light.png";
import escrowMeansItIllustrationDark from "../../assets/escrow-means-it-dark.png";
import escrowMeansItIllustrationLight from "../../assets/escrow-means-it-light.png";
import fundDeliverPaidIllustrationDark from "../../assets/fund-deliver-paid-dark.png";
import fundDeliverPaidIllustrationLight from "../../assets/fund-deliver-paid-light.png";
import honestOffersIllustrationDark from "../../assets/honest-offers-dark.png";
import honestOffersIllustrationLight from "../../assets/honest-offers-light.png";
import matchOfferIllustrationDark from "../../assets/match-offer-dark.png";
import matchOfferIllustrationLight from "../../assets/match-offer-light.png";
import oneDashboardTwoViewsIllustrationDark from "../../assets/one-dashboard-two-views-dark.png";
import oneDashboardTwoViewsIllustrationLight from "../../assets/one-dashboard-two-views-light.png";

const audiences = {
  creator: {
    label: "I'm a creator",
    icon: UserRound,
    headline: "Get paid like the brand you are.",
    headlineAccent: "Get paid like the brand you are.",
    lede:
      "Tehilla turns brand sponsorship interest into clean offers, escrowed payments, and direct deposits to your Nigerian bank. Spend your time on the work — not on chasing invoices.",
    primaryCta: { to: "/register?role=creator", label: "Create creator account" },
    secondaryCta: { to: "/for-creators", label: "See how it works for creators" },
    points: [
      { strong: "Direct deposits", text: "to your verified Nigerian bank account, not third-party wallets." },
      { strong: "Escrowed offers", text: "money is held when the brand pays and released when the work is approved." },
      { strong: "Clean dashboard", text: "track offers, balances, payouts, and transaction history in one place." },
      { strong: "90% earnings", text: "flat 10% platform fee, no hidden cuts, no surprise deductions." },
    ],
  },
  brand: {
    label: "I'm a brand",
    icon: Building2,
    headline: "Find creators. Pay with confidence.",
    headlineAccent: "Pay with confidence.",
    lede:
      "Tehilla is the sponsorship desk for serious marketers. Discover Nigerian creators with real audience data, send paid offers in minutes, and only release money when the work lands.",
    primaryCta: { to: "/register?role=brand", label: "Create brand account" },
    secondaryCta: { to: "/for-brands", label: "See how it works for brands" },
    points: [
      { strong: "Curated discovery", text: "filter creators by niche, audience size, and engagement rate." },
      { strong: "Paystack checkout", text: "cards, transfer, USSD — your finance team already knows how it works." },
      { strong: "Escrow protection", text: "funds are held until you approve the delivered work." },
      { strong: "One platform fee", text: "10% on the offer amount. No subscription, no setup cost." },
    ],
  },
};

const trustItems = [
  "Paystack",
  "NDPR-aligned",
  "Bank-grade encryption",
  "NIN & BVN ready",
];

const steps = [
  {
    title: "Create your account",
    body: "Tell us whether you're a creator or a brand. Set up your profile or your brand desk in under two minutes.",
    illustration: {
      dark: createAccountIllustrationDark,
      light: createAccountIllustrationLight,
    },
  },
  {
    title: "Match and send an offer",
    body: "Brands discover creators, send paid offers with clear scope, platform, and deadline. Creators review and accept.",
    illustration: {
      dark: matchOfferIllustrationDark,
      light: matchOfferIllustrationLight,
    },
  },
  {
    title: "Fund, deliver, get paid",
    body: "Brand funds the offer via Paystack. Creator delivers. Brand approves. Money moves directly to the creator's bank.",
    illustration: {
      dark: fundDeliverPaidIllustrationDark,
      light: fundDeliverPaidIllustrationLight,
    },
  },
];

function AudiencePanel() {
  const [active, setActive] = useState("creator");
  const data = audiences[active];
  const PrimaryIcon = data.primaryCta.icon;

  return (
    <section className="section" aria-labelledby="audiences-heading">
      <div className="section-head">
        <h2 id="audiences-heading" className="h1">
          One platform, <span className="accent">two clear experiences.</span>
        </h2>
        <p className="lede">
          Whether you make content or buy attention, Tehilla is shaped around the moment money actually changes hands.
        </p>
      </div>

      <div className="audience-toggle" role="tablist" aria-label="Choose your role">
        {Object.entries(audiences).map(([key, value]) => {
          const Icon = value.icon;
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? "is-active" : ""}
              onClick={() => setActive(key)}
            >
              <Icon />
              {value.label}
            </button>
          );
        })}
      </div>

      <div className="audience-panel" style={{ marginTop: 36 }}>
        <div className="audience-copy">
          <h3 className="h2">
            {data.headlineAccent.split(" ").slice(-3).join(" ")}{" "}
            <span className="accent">{data.headlineAccent.split(" ").slice(0, -3).join(" ")}</span>
          </h3>
          <p className="lede">{data.lede}</p>
          <ul className="audience-points">
            {data.points.map((point) => (
              <li key={point.strong}>
                <span className="check"><Check /></span>
                <span><strong>{point.strong}</strong> {point.text}</span>
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <Link to={data.primaryCta.to} className="btn btn-primary btn-lg">
              {data.primaryCta.label} <ArrowUpRight />
            </Link>
            <Link to={data.secondaryCta.to} className="btn btn-secondary btn-lg">
              {data.secondaryCta.label}
            </Link>
          </div>
        </div>
        <HeroPanel mode={active} />
      </div>
    </section>
  );
}

function HeroPanel({ mode }) {
  const isCreator = mode === "creator";
  return (
    <div className="hero-panel" aria-hidden="true">
      <div className="hero-panel-header">
        <strong style={{ fontSize: 13, fontWeight: 650, color: "var(--text)" }}>
          {isCreator ? "Creator dashboard" : "Brand desk"}
        </strong>
        <span className="badge-pill"><span className="pulse" /> Live</span>
      </div>
      {isCreator ? (
        <>
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
        </>
      ) : (
        <>
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
          <div className="hero-panel-row">
            <div className="meta">
              <div className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>TA</div>
              <div className="text">
                <strong>Temi Adeyemi · @temivibes</strong>
                <span>Fashion · 420K followers</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="status indigo">Reviewing</span>
              <span className="amount">₦85,000</span>
            </div>
          </div>
          <div className="hero-panel-row">
            <div className="meta">
              <div className="avatar" style={{ background: "var(--indigo-soft)", color: "var(--indigo)" }}>CO</div>
              <div className="text">
                <strong>Chidi Okafor · @chiditech</strong>
                <span>Tech · 280K followers</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="status funded">Funded</span>
              <span className="amount">₦60,000</span>
            </div>
          </div>
          <div className="hero-panel-row">
            <div className="meta">
              <div className="avatar" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>AN</div>
              <div className="text">
                <strong>Amaka Nwosu · @amakacooks</strong>
                <span>Food · 195K followers</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="status paid">Completed</span>
              <span className="amount">₦45,000</span>
            </div>
          </div>
          <div className="hero-panel-footnote">
            <span>3 creators matching <strong>"fintech, Lagos"</strong></span>
            <span>refreshed 2 min ago</span>
          </div>
        </>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero hero-layout">
      <div className="hero-head">
        <h1 className="display">
          The sponsorship desk for{" "}
          <span className="accent">Nigerian creators</span> and the brands that pay them.
        </h1>
        <p className="lede">
          Tehilla turns brand interest into clean, escrowed offers — and turns delivered work into real
          money in your bank. No chasing invoices, no surprise fees, no platform lock-in.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Start free <ArrowUpRight />
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            See pricing
          </Link>
        </div>
        <div className="hero-trust">
          <span className="hero-trust-item"><span className="check"><Check /></span> 10% flat platform fee</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> Direct payouts to Nigerian banks</span>
          <span className="hero-trust-item"><span className="check"><Check /></span> Paystack-powered checkout</span>
        </div>
      </div>
      <HeroPanel mode="creator" />
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="section" aria-label="Tehilla at a glance">
      <div className="stat-strip">
        <div>
          <strong className="money">10%</strong>
          <span>Flat platform fee. No hidden cuts.</span>
        </div>
        <div>
          <strong>90%</strong>
          <span>Of every offer amount goes to the creator, every time.</span>
        </div>
        <div>
          <strong>≤ 24h</strong>
          <span>Payouts to verified Nigerian bank accounts after approval.</span>
        </div>
        <div>
          <strong>1 platform</strong>
          <span>Discover, brief, fund, deliver, and reconcile in one place.</span>
      </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section" id="how-it-works" aria-labelledby="how-heading">
      <div className="section-head left">
        <h2 id="how-heading" className="h1">
          From "let's collab" to <span className="accent">money in the bank.</span>
        </h2>
        <p className="lede">
          Tehilla keeps the deal honest at every step. Both sides always know what's expected, what's funded,
          and what's already paid.
        </p>
      </div>
      <div className="steps">
        {steps.map((step) => (
          <article className={step.illustration ? "step step-with-illustration" : "step"} key={step.title}>
            <div className="num" aria-hidden="true" />
            <div className="step-copy">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            {step.illustration ? (
              <div className="step-illustration" aria-hidden="true">
                <img
                  src={step.illustration.dark}
                  alt=""
                  className="step-illustration-img step-illustration-img--dark"
                  decoding="async"
                  loading="eager"
                />
                <img
                  src={step.illustration.light}
                  alt=""
                  className="step-illustration-img step-illustration-img--light"
                  decoding="async"
                  loading="eager"
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustRow() {
  return (
    <section className="section" aria-label="Trust and infrastructure">
      <div className="trust-row">
        <span className="label">Powered by trusted infrastructure</span>
        <div className="trust-marquee" role="list" aria-label="Trust signals">
          <div className="trust-marquee-track">
            <div className="trust-marquee-group">
              {trustItems.map((item) => (
                <span key={item} className="item" role="listitem">
                  <span className="dot" /> {item}
                </span>
              ))}
            </div>
            <div className="trust-marquee-group" aria-hidden="true">
              {trustItems.map((item) => (
                <span key={`${item}-repeat`} className="item">
                  <span className="dot" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      title: "Honest offers",
      body: "Brands send clear briefs with platform, deliverables, and deadline. Creators accept with one tap — no back-and-forth DMs.",
      illustration: {
        dark: honestOffersIllustrationDark,
        light: honestOffersIllustrationLight,
      },
    },
    {
      title: "Escrow that means it",
      body: "When a brand funds an offer, the money is held by Tehilla until the creator delivers and the brand approves. No early release, no chargebacks on delivered work.",
      illustration: {
        dark: escrowMeansItIllustrationDark,
        light: escrowMeansItIllustrationLight,
      },
    },
    {
      title: "90% to the creator",
      body: "We charge a flat 10% platform fee on every successful offer. No subscription, no setup cost, no surprise deductions.",
      illustration: {
        dark: creator90IllustrationDark,
        light: creator90IllustrationLight,
      },
    },
    {
      title: "Direct bank payouts",
      body: "Verified Nigerian bank accounts get paid through Paystack Transfers. The money lands in your account, not in some app's wallet.",
      illustration: {
        dark: directBankPayoutsIllustrationDark,
        light: directBankPayoutsIllustrationLight,
      },
    },
    {
      title: "Built for trust",
      body: "Email verification, audit logs, NDPR-aligned data handling, and a support team that responds like humans.",
      illustration: {
        dark: builtForTrustIllustrationDark,
        light: builtForTrustIllustrationLight,
      },
    },
    {
      title: "One dashboard, two views",
      body: "Creators see earnings and offers. Brands see creators and spend. Switch roles instantly in demo, or run two accounts side by side.",
      illustration: {
        dark: oneDashboardTwoViewsIllustrationDark,
        light: oneDashboardTwoViewsIllustrationLight,
      },
    },
  ];
  return (
    <section className="section" aria-labelledby="features-heading">
      <div className="section-head left">
        <h2 id="features-heading" className="h1">
          The platform built around the <span className="accent">moment money moves.</span>
        </h2>
        <p className="lede">
          We didn't set out to build a social network. We set out to make brand deals feel as professional as the
          rest of your work.
        </p>
      </div>
      <div className="section-grid-3">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-illustration" aria-hidden="true">
              <img
                src={feature.illustration.dark}
                alt=""
                className="feature-illustration-img feature-illustration-img--dark"
                decoding="async"
                loading="eager"
              />
              <img
                src={feature.illustration.light}
                alt=""
                className="feature-illustration-img feature-illustration-img--light"
                decoding="async"
                loading="eager"
              />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section" aria-labelledby="cta-heading">
      <div className="cta-band">
        <h2 id="cta-heading">
          The next brand deal you accept should be the cleanest one you've ever done.
        </h2>
        <p>
          Set up your account in two minutes. No card required, no commitment. Only pay when an offer is
          successfully completed.
        </p>
        <div className="cta-band-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Create your account <ArrowUpRight />
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <MarketingLayout>
      <Hero />
      <StatsStrip />
      <AudiencePanel />
      <HowItWorks />
      <FeatureGrid />
      <TrustRow />
      <CtaBand />
    </MarketingLayout>
  );
}
