# Tehilla — Creator Commerce Platform
## Product Requirements Document (PRD)

| | |
|---|---|
| **Document Owner** | Product & Engineering |
| **Status** | Living document — reflects shipped system + forward roadmap |
| **Version** | 2.1 |
| **Last Updated** | 2026-06-23 |
| **Classification** | Confidential — Investor & Build Grade |
| **Product** | Tehilla : Creator Commerce |
| **Primary Market** | Nigeria (Pan-African expansion roadmap) |

> This PRD is grounded in the **as-built** system. Pricing, fees, data models, entitlements, routes, and infrastructure described here mirror the production codebase (Fastify backend, Next.js frontend, PostgreSQL/Prisma, Paystack, Upstash Redis). Forward-looking items are explicitly marked **(Roadmap)** or **(rolling-out)**.
>
> **v2.1 changes:** (1) Paystack **recurring subscriptions** (Plans + Subscriptions, webhook-driven renewals + cancellation) are now **live** — §7.9, §9 (FR-050–054), §12, §18 updated accordingly. (2) Market sizing (§3.3) re-grounded in **Nigerian** market data with a bottom-up TAM/SAM/SOM model and cited sources.

---

## Table of Contents

1. Executive Summary
2. Product Overview
3. Market Analysis
4. User Personas
5. User Journey Mapping
6. Product Architecture
7. Feature Inventory
8. Screen-by-Screen Breakdown
9. Functional Requirements
10. Non-Functional Requirements
11. Product Evolution & Auto-Update System
12. Data Model
13. Admin Portal Requirements
14. Analytics & KPIs
15. Security Framework
16. Testing Strategy
17. Release Strategy
18. Product Roadmap
19. Risk Assessment
20. Success Criteria

---

# 1. Executive Summary

## 1.1 Product Vision

To become the financial and commercial operating system for Africa's creator economy — the trusted layer where creators and brands discover each other, agree terms, and move money safely, starting with Nigeria's 100M+ digitally active population.

## 1.2 Product Mission

Turn creator **followers into funds** by removing the three structural failures of informal influencer marketing in emerging markets: **discovery friction**, **payment insecurity**, and **lack of accountability**. Tehilla guarantees that a creator who does the work gets paid, and a brand that pays gets the work — enforced by escrow, not by trust.

## 1.3 Problem Statement

Nigerian (and broader African) creator–brand commerce today runs over WhatsApp DMs, Instagram comments, and bank transfers with **no protection for either side**:

- **Creators** deliver content and chase payment for weeks; some are never paid. They have no verifiable track record to command higher rates.
- **Brands** pay upfront to creators they cannot vet, with no recourse if deliverables never arrive or underperform.
- **Both sides** lack structured discovery — matching is word-of-mouth, not data-driven.
- **Payment rails** (manual bank transfer) carry no escrow, no dispute resolution, no audit trail, and no platform-level fraud control.

The result is a high-trust-required, low-trust-available market that suppresses transaction volume far below its economic potential.

## 1.4 Opportunity

Nigeria has one of the world's fastest-growing creator populations and a maturing digital-payments stack (Paystack, Flutterwave, NIBSS). The infrastructure to **intermediate trust and money** now exists, but no vertical platform has combined **marketplace discovery + escrow + verified identity + subscription monetization** specifically for African creator commerce. Tehilla occupies that gap.

## 1.5 Business Objectives

| # | Objective | Measure |
|---|-----------|---------|
| O1 | Establish escrow as the default settlement method for creator deals | GMV processed through escrow |
| O2 | Build a defensible two-sided liquidity pool | Verified creators + active brands |
| O3 | Monetize via dual revenue (10% transaction fee + tiered subscriptions) | Take rate + MRR |
| O4 | Achieve trust differentiation through verified identity (KYC/BVN/NIN) | % verified accounts |
| O5 | Reach contribution-margin-positive unit economics | Gross margin per transaction |

## 1.6 Strategic Positioning

Tehilla is positioned as **"Stripe-grade trust for the African creator economy"** — not a talent agency, not a social network, but the **commercial settlement layer**. The wedge is escrow-protected transactions; the moat is the combination of **verified identity + financial track record + two-sided network effects**.

## 1.7 Value Proposition

| Audience | Core Promise |
|----------|--------------|
| **Creators** | "Get discovered, get hired, and **get paid — guaranteed**. Build a verified track record that grows your rate." |
| **Brands** | "Find vetted creators, run campaigns, and **only release funds when the work is delivered**." |
| **Agencies** | "Manage multiple brand identities, run bulk outreach, and measure ROAS — from one workspace." |

---

# 2. Product Overview

| Attribute | Value |
|-----------|-------|
| **Product Name** | Tehilla : Creator Commerce |
| **Product Type** | Two-sided B2B2C Marketplace + Fintech (Escrow) + SaaS (Subscriptions) |
| **Industry** | Creator Economy / Influencer Marketing / Digital Payments |
| **Market Category** | Vertical marketplace with embedded financial services |
| **Product Stage** | Built & deploying — MVP → Beta transition |
| **Core Purpose** | Trusted discovery, contracting, and escrow-protected settlement between creators and brands |
| **Geography** | Nigeria first; NGN/kobo native; Pan-African roadmap |

## 2.1 Platform Availability

- **Web Application (primary):** Responsive Next.js 15 App Router PWA-ready frontend, optimized for Nigerian mobile networks (3G/4G).
- **Backend API:** Fastify 5 REST API (`/api/*`), independently deployable.
- **Mobile (Roadmap):** React Native / Expo client consuming the same API; OTA update strategy defined in §11.

## 2.2 Product Pillars

1. **Marketplace** — discovery of creators (by brands) and brands/campaigns (by creators).
2. **Escrow Engine** — fund-hold → deliver → approve → release, with dispute & refund paths.
3. **Identity & Trust** — email verification, KYC (NIN/BVN/CAC), verified badges.
4. **Monetization** — 10% transaction fee + tiered creator and brand subscriptions.
5. **Growth Surface** — campaigns, applications, affiliate deals, analytics, agency tooling.

---

# 3. Market Analysis

## 3.1 Industry Overview

The global creator economy exceeds **$250B** and is projected to surpass **$500B** by the late 2020s. Africa is among the fastest-growing segments, driven by smartphone penetration, youthful demographics (median age ~18 in Nigeria), and the normalization of social commerce. Influencer marketing in Nigeria has shifted from a "nice-to-have" to a primary customer-acquisition channel for consumer brands, fintechs, and FMCG.

## 3.2 Market Opportunity

The structural gap is **trust infrastructure**. Payment rails (Paystack/Flutterwave) solved money movement; identity rails (NIN/BVN) solved verification; what is missing is the **commercial intermediation layer** that binds discovery, contracting, and conditional settlement into one accountable flow. Tehilla productizes that layer.

## 3.3 Market Size (Nigeria-grounded)

> Sized for the **Nigerian** market first (Tehilla is NGN/kobo-native). Figures are
> a defensible planning band built from published market data plus a bottom-up
> model; validate with primary research before fundraising. FX reference ≈ **₦1,550/US$**.

### Market context anchors (published data)

| Anchor | Value | Source |
|--------|-------|--------|
| Active Nigerian content creators / influencers | **250,000+** | Legit.ng (2025) |
| Nigeria total advertising market | **≈ US$1.04B (2025)** | Statista Advertising Outlook |
| Nigeria digital advertising & social-media economy | **≈ US$1.1–1.2B** | Ken Research / Research&Markets |
| Nigeria influencer-marketing **platform** market | **≈ US$29M (2024), 36.8% CAGR** | Cognitive Market Research |
| Nigeria formally-tracked **influencer-ad channel** spend | **≈ US$5.3M (2025), 7.65% CAGR** | Statista (narrow definition) |
| Africa influencer-marketing growth | **≈ 8.65% CAGR (2025–2029)** | Statista regional |

The gap between the **$5.3M formally-tracked influencer-ad channel** and the
**250k+ creators inside a $1B+ digital-ad economy** is the core insight: the vast
majority of Nigerian creator–brand commerce is **informal and untracked** (WhatsApp
DMs + manual bank transfer). Tehilla's TAM is that *whole* transaction flow — the
GMV a trust/escrow layer can intermediate — not the narrow measured ad channel.

### TAM / SAM / SOM

| Tier | Definition | Size (NGN) | Size (US$) |
|------|------------|-----------|-----------|
| **TAM** | All Nigerian creator–brand paid-collaboration **GMV** intermediable by a trust/escrow layer (formal + informal) | **≈ ₦230B–₦465B/yr** | **≈ $150M–$300M/yr** |
| **SAM** | Web-reachable, NGN-settling creators in Lagos / Abuja / Port Harcourt + SMB & consumer brands actively running paid creator deals | **≈ ₦60B–₦125B/yr** | **≈ $40M–$80M/yr** |
| **SOM** (36 mo) | Realistic capture given two-sided liquidity ramp & category creation | **≈ ₦12B–₦31B/yr GMV** | **≈ $8M–$20M/yr GMV** |

### Bottom-up build (how TAM is derived)

- **250,000+** active creators → monetizable subset doing real paid brand work ≈ **15–20% ≈ 40,000–50,000** creators.
- Conservative average annual paid creator–brand transaction value per active creator ≈ **₦1.5M–₦5M** (~$1,000–$3,200).
- 45,000 creators × ~₦3M ≈ **₦135B**; upper engagement band pushes toward **₦400B+** → consistent with the **$150M–$300M** TAM band.

### Revenue model on SOM (dual engine)

1. **Transaction take rate — 10%** of escrow GMV: SOM GMV of **$8M–$20M → $0.8M–$2.0M/yr** transaction revenue.
2. **Subscriptions (recurring, now live):** creator tiers **₦10k / ₦22.5k / ₦50k**, brand tiers **₦25k / ₦60k / ₦150k** per month (15% annual discount). Illustrative: **3,000** paying creators (avg ~₦18k/mo) + **400** paying brands (avg ~₦55k/mo) ≈ **₦76M/mo ≈ ₦910M/yr (~$590k/yr) MRR-driven revenue** — independent of, and additive to, the take rate.

**Sources:** [Legit.ng — Nigeria creator economy 250k+ creators](https://www.legit.ng/business-economy/economy/1715605-nigerias-creator-economy-explodes-250000-content-creators-emerge-top-influencers-earn-big/) · [Statista — Advertising, Nigeria](https://www.statista.com/outlook/amo/advertising/nigeria) · [Statista — Influencer Advertising, Nigeria](https://www.statista.com/outlook/amo/advertising/influencer-advertising/nigeria) · [Cognitive Market Research — MEA influencer-marketing platform](https://www.cognitivemarketresearch.com/regional-analysis/middle-east-and-africa-influencer-marketing-platform-market-report) · [Ken Research — Nigeria online advertising & digital media](https://www.kenresearch.com/nigeria-online-advertising-and-digital-media-market)

## 3.4 Trends

- **Verified-creator premium:** brands increasingly pay more for vetted, fraud-screened creators.
- **Performance/affiliate shift:** move from flat fees to commission/affiliate models (already supported via `OfferDealType.AFFILIATE`).
- **Agency consolidation:** multi-brand management demand (addressed via `ManagedBrand` workspace).
- **Embedded finance:** marketplaces capturing payment + escrow margin, not just listing fees.
- **Mobile-first, data-light:** Nigerian users on metered data — performance is a feature (see §10).

## 3.5 Risks

| Risk | Description |
|------|-------------|
| **Liquidity cold-start** | Two-sided marketplace needs both creators and brands to be useful. |
| **Disintermediation** | Parties may agree on-platform, settle off-platform to avoid fees. |
| **Regulatory (fintech)** | Holding funds (escrow) may attract CBN/payment-licensing scrutiny. |
| **Fraud** | Fake followers, fake deliverables, collusion, chargeback abuse. |
| **Payment concentration** | Single provider (Paystack) dependency. |

Mitigations in §19.

## 3.6 Competitive Landscape

### Direct Competitors
- Informal channels (**WhatsApp/Instagram DMs + manual transfer**) — the dominant incumbent "do nothing" alternative.
- Regional influencer-marketplace startups and creator-agency platforms.

### Indirect Competitors
- Global influencer platforms (not localized for NGN, KYC, or Nigerian payment rails).
- Talent agencies and PR firms (high-touch, low-scale).
- Generic freelancer marketplaces (not creator-specialized, weak social-metric fit).

### Competitive Advantages
1. **Escrow-native** settlement with idempotent, audited money flows.
2. **Local identity rails** — NIN/BVN/CAC KYC, encrypted at rest (AES-256-GCM).
3. **NGN/kobo-native** accounting (integer kobo, no float drift).
4. **Dual monetization** — transaction fee *and* subscriptions reduce single-lever risk.
5. **Performance-engineered** for African mobile networks (Brotli, Redis cache, lazy media).

### Product Differentiators
- Ledger-based wallet with `HOLD`/`RELEASE`/`REFUND` entry types and unique constraints preventing double-apply.
- Affiliate/commission deal type with click & conversion attribution (`AffiliateEvent`).
- Tiered entitlement engine as a single source of truth shared by marketing, app, and enforcement (`lib/premium.ts`).

---

# 4. User Personas

## 4.1 Primary Persona — "Chidinma the Creator"

| Field | Value |
|-------|-------|
| **Name** | Chidinma A. |
| **Age** | 24 |
| **Profession** | Lifestyle & beauty micro-influencer (Instagram + TikTok), 85K followers |
| **Goals** | Land consistent paid brand deals; get paid on time; raise her rate with proof |
| **Motivations** | Financial independence; turning content into a real income; credibility |
| **Pain Points** | Brands ghosting after delivery; chasing payments; no way to prove reliability |
| **Tech Proficiency** | High on mobile/social; moderate on formal tools |
| **Behavioral Patterns** | Mobile-only, data-conscious, checks notifications frequently, distrustful of upfront-free promises |

## 4.2 Primary Persona — "Tunde the Brand Marketer"

| Field | Value |
|-------|-------|
| **Name** | Tunde O. |
| **Age** | 33 |
| **Profession** | Growth/Marketing Lead at a consumer fintech |
| **Goals** | Run measurable creator campaigns; find vetted creators fast; control spend |
| **Motivations** | CAC efficiency; brand safety; provable ROAS to leadership |
| **Pain Points** | Vetting creators; fake followers; paying for undelivered work; no analytics |
| **Tech Proficiency** | High — lives in dashboards |
| **Behavioral Patterns** | Desktop + mobile; compares creators; wants data before committing budget |

## 4.3 Persona — "Ada the Agency Operator"

| Field | Value |
|-------|-------|
| **Name** | Ada N. |
| **Age** | 38 |
| **Profession** | Founder of a 6-person influencer agency managing several client brands |
| **Goals** | Manage many brand identities; run bulk outreach; report ROAS per client |
| **Motivations** | Operational leverage; margin; client retention |
| **Pain Points** | Juggling separate accounts; no consolidated reporting; manual outreach |
| **Tech Proficiency** | High |
| **Behavioral Patterns** | Power user; seat-based collaboration; values white-label reporting |

## 4.4 Persona — "Emeka the Platform Admin"

| Field | Value |
|-------|-------|
| **Name** | Emeka I. |
| **Age** | 30 |
| **Profession** | Trust & Safety / Operations at Tehilla |
| **Goals** | Verify identities; resolve disputes; prevent fraud; keep the ledger sound |
| **Motivations** | Platform integrity; low chargeback/dispute rate |
| **Pain Points** | Manual KYC review volume; ambiguous disputes; fraud rings |
| **Tech Proficiency** | Expert |
| **Behavioral Patterns** | Works the admin queue; relies on audit logs and financial controls |

## 4.5 Persona — "Premium/Business Account"

Spans **Premium creators** (track-record sellers wanting reach, affiliate deals, team seats) and **Scale brands/agencies** (ROAS analytics, agency workspace, API). Distinguished by entitlement tier rather than a different identity.

---

# 5. User Journey Mapping

## 5.1 New User (Creator) Journey

```
Landing (marketing/Home) → "Sign up free" → Register (role=CREATOR)
  → Email verification → Login → Onboarding (profile: handle, niche, platforms, rate)
  → Add bank account (Paystack recipient) → KYC submit (NIN/BVN)
  → Discover Brands / browse Campaigns → Receive offer → Accept → Deliver → Get paid
```

| Stage | User Action | Emotion | Friction Point | Opportunity |
|-------|-------------|---------|----------------|-------------|
| Discover | Reads landing, watches feature videos | Curious, skeptical | "Is this another scam?" | Lead with escrow guarantee + social proof |
| Sign up | Registers, verifies email | Hopeful | Email deliverability | Resend verification; clear status |
| Onboard | Builds profile, adds bank | Invested | Bank/KYC data entry | Progressive disclosure; save & resume |
| First value | Receives first offer | Excited | Empty pipeline at start | Surface open campaigns immediately |
| Paid | Funds released to balance | Trust earned | Payout timing | Faster payouts as premium hook |

## 5.2 Returning User (Creator) Journey

```
Login (session restore via token) → Creator Dashboard (balance, offers, campaign notifs)
  → Respond to offers → Submit deliverables → Withdraw balance → Review analytics
```

- **Emotions:** confidence, routine. **Friction:** remembering where things are. **Opportunity:** smart notifications (new campaigns badge), one-tap actions.

## 5.3 Premium User Journey

```
Premium page → Compare tiers → Pay (Paystack, monthly/annual) → Entitlements unlock instantly
  → Apply to campaigns (Popular+) → Affiliate deals → Proposal templates → Team seats → Sales attribution (Premium)
```

- **Emotions:** ambition, ROI scrutiny. **Friction:** justifying spend. **Opportunity:** show value delivered (deals won, reach gained) inside the Premium page.

## 5.4 Admin Journey

```
Admin login → AdminApp → KYC review queue → approve/reject → Dispute queue → release/refund escrow
  → User management (suspend) → Financial controls → Audit log review → Reporting
```

- **Emotions:** vigilance. **Friction:** manual volume. **Opportunity:** queue prioritization, bulk actions, fraud signals.

## 5.5 Business/Brand Account Journey

```
Register (role=BRAND) → Verify → Brand Dashboard → Post campaign / Send offer
  → Fund offer (escrow) → Review deliverable → Approve (release) or Dispute
  → Campaign analytics → (Scale) ROAS + Agency workspace + managed brands
```

| Stage | Action | Emotion | Friction | Opportunity |
|-------|--------|---------|----------|-------------|
| Find | Discover creators, filter | Evaluative | Trust in metrics | Verified badges, performance reports |
| Commit | Send offer, fund escrow | Cautious | Parting with cash | Escrow = money is safe until delivery |
| Settle | Approve deliverable | Relief | Quality judgment | Clear deliverable preview + dispute safety net |
| Scale | ROAS analytics, agency | Strategic | Reporting effort | White-label reports, bulk outreach |

---

# 6. Product Architecture

## 6.1 High-Level Architecture

```
                        ┌─────────────────────────────────────┐
                        │            Clients                   │
                        │  Web (Next.js 15 / Vercel)           │
                        │  Mobile (React Native — Roadmap)     │
                        └───────────────┬─────────────────────┘
                                        │ HTTPS (same-origin /api proxy → BACKEND_URL)
                                        ▼
                        ┌─────────────────────────────────────┐
                        │   Fastify 5 API (Railway)            │
                        │  compress→helmet→cors→jwt→cookie→     │
                        │  rate-limit→routes                   │
                        └───┬───────────┬───────────┬──────────┘
                            │           │           │
              ┌─────────────▼──┐ ┌──────▼──────┐ ┌──▼───────────────┐
              │ PostgreSQL     │ │ Upstash     │ │ External Services │
              │ (Prisma ORM)   │ │ Redis       │ │ Paystack (pay)    │
              │ + DIRECT_URL   │ │ (cache,     │ │ Resend/SMTP(email)│
              │ for migrations │ │ rate-limit, │ │ Sentry (errors)   │
              │                │ │ BullMQ)     │ │                   │
              └────────────────┘ └─────────────┘ └───────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │ BullMQ Workers     │
                              │ payment.worker     │
                              └────────────────────┘
```

## 6.2 Frontend Architecture

- **Framework:** Next.js 15 (App Router), React 18, TypeScript.
- **Structure:** feature/surface-based — `views/marketing/*`, `views/app/*`, `views/admin/*`, plus `Login/Register/Reset/Verify` auth views; `components/`, `hooks/`, `context/`, `services/`, `lib/router`.
- **State:** `AuthContext` (session, normalized user, premium status); server state fetched via `services/*` thin API clients; URL/route state via internal `@/lib/router`.
- **Auth model:** access token in `localStorage` (`tehilla_access_token`), attached to API client; session restore on mount via `/auth/me`; `tehilla:auth-expired` event triggers logout/redirect.
- **Performance:** `AppLoader` (zero forced delay), `LazyVideo` (IntersectionObserver, `preload="none"`), `font-display: swap`, Next image AVIF/WebP, immutable caching for static assets (see §10 and `next.config.mjs`).

## 6.3 Backend Architecture

- **Framework:** Fastify 5 + TypeScript, layered: **routes → services → repositories → Prisma**.
- **Plugin order (security/perf critical):** `@fastify/compress` (br/gzip/deflate) → `helmet` → `cors` (credentialed, allow-list origins) → `jwt` → `cookie` → `rate-limit` (Redis-backed when available).
- **Validation:** Zod schemas at boundaries (`schemas/`), env validated & fail-fast at boot (`config/config.ts`).
- **Error model:** `AppError` with code + status; consistent envelope `{ success, data, error }`.
- **Money safety:** integer **kobo** everywhere (`utils/money.ts`, `PLATFORM_FEE_RATE_BPS = 1000` → 10%), ledger entries with unique constraints for idempotency.
- **Idempotency:** `IdempotencyKey` table for safe retries on money-moving requests.
- **Webhooks:** `ProviderWebhookEvent` with `@@unique([provider, eventId])` for exactly-once processing.
- **Background jobs:** BullMQ (`queues/`, `workers/payment.worker.ts`) for async payment/payout processing.

## 6.4 Database Architecture

- **Engine:** PostgreSQL via Prisma ORM.
- **Connection strategy:** pooled `DATABASE_URL` for app runtime; `DIRECT_URL` for migrations (Neon/PgBouncer pattern).
- **Migrations:** `prisma migrate deploy` runs on backend startup (idempotent — applies only unapplied migrations; never resets data).
- **Indexing:** composite indexes on hot query paths (e.g., `Offer(status, createdAt)`, `Creator(niche)`, `Creator(premiumTier)`, `Campaign(createdAt)`); see §12.

## 6.5 Authentication Architecture

```
Register/Login → bcrypt verify → issue JWT access token (TTL 15m)
  + RefreshToken (hashed, 30-day) → access token used as Bearer
  → refresh rotates token → logout revokes refresh token
Email verification + password reset use single-use hashed tokens with expiry.
```

- **RBAC:** `Role` enum (CREATOR, BRAND, ADMIN) + per-user `permissions[]` for fine-grained admin scopes; `requireRole()` preHandlers on routes.

## 6.6 API Architecture

- **Style:** REST under `/api`, resource-grouped route modules (14 modules — see §6.10).
- **Envelope:** `{ success: boolean, data: T | null, error: string | null }` (+ list metadata where paginated).
- **Caching headers:** `Cache-Control` per resource (public for creator lists/profiles via Redis + CDN; private for per-user campaign feed); `X-Cache: HIT/MISS`.
- **Pagination:** cursor-based on list endpoints.

## 6.7 Third-Party Services

| Service | Purpose |
|---------|---------|
| **Paystack** | Payment initialization, verification, refunds, payout recipients |
| **Upstash Redis** | Cache, distributed rate-limit store, BullMQ backing (with in-memory fallback) |
| **Resend / SMTP** | Transactional email (verification, reset, notifications) |
| **Sentry** | Error tracking / observability |
| **Prometheus (`prom-client`)** | Metrics endpoint |

## 6.8 Infrastructure

- **Frontend:** Vercel (CDN, image optimization, edge caching).
- **Backend:** Railway (containerized Node service, env-driven config).
- **Database:** Managed PostgreSQL (Neon-style pooled + direct URLs).
- **Cache/Queue:** Upstash Redis.

## 6.9 Deployment Architecture

```
git push → (Vercel builds frontend) + (Railway builds backend: npm ci → tsc build
  → prisma migrate deploy → node dist/app.js)
Frontend rewrites /api/:path* → BACKEND_URL (same-origin browser calls).
```

- **Config validation at boot:** production refuses to start with placeholder secrets, missing `KYC_ENCRYPTION_KEY` (must decode to 32 bytes), mock payments enabled, or non-Paystack provider.

## 6.10 Route Inventory (API surface)

`auth`, `creator`, `brand`, `offer`, `payment`, `support`, `admin`, `application`, `campaign`, `premium`, `affiliate`, `proposalTemplate`, `team`, `managedBrand`.

## 6.11 Scalability Model

- **Stateless API** → horizontal scale behind load balancer.
- **Redis-backed rate limiting** → consistent across instances.
- **Cache-aside** on read-heavy endpoints (creator list/profile) with prefix invalidation on writes.
- **Queue-based** async work (payments/payouts) decoupled from request path.
- **Index-tuned** hot paths; cursor pagination avoids deep-offset cost.

---

# 7. Feature Inventory

> Each feature below maps to shipped code. Status reflects `lib/premium.ts` (`live` / `rolling-out`) where applicable.

## 7.1 Authentication & Account

- **Purpose:** Secure, verified entry for all roles.
- **Description:** Register/login, email verification, password reset, JWT + refresh token rotation, session restore, logout/revoke.
- **User Story:** *As a user, I want to securely create and access my account so my deals and money are protected.*
- **Acceptance Criteria:** Passwords hashed (bcrypt); access token 15m; refresh 30d hashed/single-revocable; email verification required before login; reset/verify tokens single-use + expiring.
- **Business Rules:** Production JWT secret ≥48 chars; unverified users blocked from login with explicit code `EMAIL_NOT_VERIFIED`.
- **Dependencies:** Email transport (Resend/SMTP), Redis (rate-limit).
- **Edge Cases:** Email not delivered (resend), token expired/reused, concurrent refresh.

## 7.2 Creator Profile & Discovery

- **Purpose:** Let brands find and evaluate creators.
- **Description:** Profile (handle, niche, bio, followers, engagement, base rate, platforms, location, avatar); search/filter by name, niche, location, min followers; cached public list/profile.
- **User Story:** *As a brand, I want to search creators by niche and audience so I can shortlist the right partners.*
- **Acceptance Criteria:** List filterable + cursor-paginated; results cached (Redis 5m) with `Cache-Control`; profile cached 2m; cache invalidated on profile update.
- **Business Rules:** Priority search ranking & featured placement for Popular+; verified badge for KYC-verified.
- **Dependencies:** Redis, creator service/repo.
- **Edge Cases:** Empty result set, self-exclusion from results, stale cache after edit (handled via prefix invalidation).

## 7.3 Brand Profile & Discovery

- **Purpose:** Let creators see hiring brands and apply.
- **Description:** Brand profile (industry, website, logo); creators browse brands; apply (Standard+ entitlement).
- **User Story:** *As a creator, I want to see which brands are active so I can pitch myself.*
- **Acceptance Criteria:** Brand list searchable; application gated by active premium; unique `(creatorId, brandId)` application.
- **Business Rules:** Only active paid creators can apply to brands (`canApplyToBrands`).
- **Edge Cases:** Duplicate application (unique constraint), applying without premium (402 upsell).

## 7.4 Offers & Contracting

- **Purpose:** Formalize a deal between brand and creator.
- **Description:** Brand sends offer (title, description, amount, platform, deadline, deal type, usage rights); lifecycle `PENDING → ACCEPTED → FUNDED → SUBMITTED → APPROVED → COMPLETED` with `DISPUTED/REJECTED/CANCELLED/REFUNDED` branches.
- **User Story:** *As a brand, I want to send a structured offer so terms are explicit and enforceable.*
- **Acceptance Criteria:** State transitions validated server-side; deliverable URL/note captured; affiliate offers carry unique `affiliateCode` + commission rate.
- **Business Rules:** Only the counter-party can act on each transition; funded offers gate on escrow.
- **Dependencies:** Escrow/payment, creator/brand.
- **Edge Cases:** Acting out of order, deadline passed, duplicate accept.

## 7.5 Escrow Settlement Engine

- **Purpose:** Guarantee conditional payment.
- **Description:** Brand funds offer → amount held; on approval funds **released** to creator's withdrawable balance; on dispute resolved for brand, funds **refunded** via provider. Ledger entries: `HOLD/RELEASE/REFUND/CREDIT/DEBIT/ADJUSTMENT`.
- **User Story:** *As both parties, I want money held safely until delivery is confirmed.*
- **Acceptance Criteria:** Release/refund are **idempotent** (unique `(transactionId, type)`); refund blocked if already released; provider refund must succeed before status set `refunded`; all actions audited.
- **Business Rules:** Platform fee **10%** (`PLATFORM_FEE_RATE_BPS = 1000`); creator receives `netKobo = gross − fee`.
- **Dependencies:** Paystack, ledger, audit.
- **Edge Cases:** Partial failure mid-refund (retryable), double-release attempt (no-op), missing payment ref.

## 7.6 Wallet, Ledger & Payouts

- **Purpose:** Track and pay out creator earnings.
- **Description:** Per-creator `balanceKobo` (withdrawable) + `heldKobo` (in escrow); immutable `LedgerEntry` history with `balanceAfterKobo`; `Payout` records to Paystack recipients.
- **Acceptance Criteria:** Balance changes always via ledger entries; payout has status lifecycle `PENDING→PROCESSING→COMPLETED/FAILED/REVERSED`.
- **Business Rules:** Faster/priority payouts as premium entitlement.
- **Edge Cases:** Failed payout reversal, insufficient withdrawable balance.

## 7.7 Campaigns & Applications

- **Purpose:** Brand-posted open opportunities.
- **Description:** Brand posts campaign (budget, platform, deadline); creators apply (Popular+); brand reviews applicants; AI-suggested creators (Scale brands).
- **Business Rules:** Free brands capped at 2 active campaigns (entitlement), Popular+ unlimited; early-access gate — non-Popular/Premium creators only see campaigns >24h old.
- **Edge Cases:** Duplicate application (unique `(campaignId, creatorId)`), applying without entitlement (402).

## 7.8 Affiliate / Commission Deals

- **Purpose:** Performance-based compensation.
- **Description:** `OfferDealType.AFFILIATE` with commission rate and unique `affiliateCode`; `AffiliateEvent` records `CLICK`/`CONVERSION` with sale value.
- **Business Rules:** Affiliate deals unlocked at Popular+; sales attribution analytics at Premium.
- **Edge Cases:** Duplicate code (unique), conversion without prior click.

## 7.9 Premium Subscriptions (Creators & Brands) — **recurring, live**

- **Purpose:** Recurring revenue + tiered value.
- **Description:** Creator tiers — Standard ₦10,000 / Popular ₦22,500 / Premium ₦50,000 monthly; Brand tiers — Starter ₦25,000 / Growth ₦60,000 / Scale ₦150,000 monthly; **15% annual discount**. Billing is **true Paystack recurring** (Plans + Subscriptions): the checkout enrolls the customer's card in the tier's plan, and Paystack **auto-charges every interval**. Webhooks drive renewals, dunning, and cancellation. Customers can **cancel auto-renewal** (access continues to period end).
- **Architecture:** Paystack **Plans** are lazily created and cached per role/tier/interval/price (`SubscriptionPlan`); each user's `Subscription` row persists `subscription_code` + `email_token` (required to cancel), `customer_code`, `status` (`PENDING→ACTIVE→PAST_DUE→CANCELLED/EXPIRED`), and `currentPeriodEnd`.
- **Webhooks handled:** `subscription.create` (store codes, activate), `charge.success` (extend one interval), `invoice.payment_failed` (→ PAST_DUE / grace), `subscription.disable` & `subscription.not_renew` (→ CANCELLED, lapse at period end).
- **Business Rules:** Entitlements computed from single source (`getEntitlements`/`getBrandEntitlements`), inherited downward (Popular includes Standard, etc.); inactive/expired = free experience. A billing period is **never granted twice** — extension is absolute-date and deduped via `lastChargeRef`, so the redirect-verify activation and the matching `charge.success` webhook can't double-apply.
- **Endpoints:** `POST /premium/upgrade/pay` (start), `/upgrade/verify` (instant activation), `GET /premium/subscription` (status), `POST /premium/subscription/cancel` — mirrored under `/premium/brand/*`.
- **Edge Cases:** Payment unconfirmed (no grant), webhook before/after redirect (idempotent), renewal charge failure (PAST_DUE grace), cancel before codes arrive (`SUBSCRIPTION_NOT_READY`), price change (new plan; existing subscribers keep theirs).

## 7.10 Agency Workspace (Scale Brands)

- **Purpose:** Multi-brand management.
- **Description:** `ManagedBrand` profiles under one Premium brand account; up to 25 managed seats; bulk outreach (rolling-out).
- **Business Rules:** Agency workspace gated to Premium ("Scale") brand tier.

## 7.11 Team Collaboration (Creators)

- **Purpose:** Let creator accounts add collaborators.
- **Description:** `TeamMember` (name, email, role); seats by tier — 1 (Standard) / 5 (Popular) / unlimited (Premium).
- **Edge Cases:** Duplicate email per owner (unique constraint), seat limit exceeded.

## 7.12 Proposal Templates (Creators)

- **Purpose:** Faster pitching.
- **Description:** Saved reusable proposal templates; manager view at Premium.

## 7.13 Analytics & Reports

- **Purpose:** Decision support.
- **Description:** Creator analytics (basic→enterprise by tier); brand campaign analytics; ROAS/performance (Scale); sales attribution (Premium creators); white-label reports (rolling-out).

## 7.14 KYC & Verification

- **Purpose:** Trust & compliance.
- **Description:** NIN/BVN (creators), CAC (brands) captured, **encrypted at rest (AES-256-GCM)**; admin review `NONE→PENDING→VERIFIED/REJECTED`; verified badges.
- **Business Rules:** `KYC_ENCRYPTION_KEY` must decode to 32 bytes; production refuses to start otherwise.
- **Edge Cases:** Rejected resubmission, partial KYC.

## 7.15 Support / Tickets

- **Purpose:** Help & dispute intake.
- **Description:** `SupportTicket` (subject, message, status `OPEN→IN_PROGRESS→RESOLVED→CLOSED`), available to guests and users.

## 7.16 Admin & Moderation

- **Purpose:** Platform operations.
- **Description:** KYC review, dispute resolution (release/refund escrow), user suspension, premium grants, financial controls, audit-log review (see §13).

---

# 8. Screen-by-Screen Breakdown

> Screens map to `frontend/src/views/*`. Common states defined once and referenced.

**Global state conventions:**
- **Loading:** spinner + label (e.g., "Loading creators…"); `AppLoader` gate on cold load (no forced delay).
- **Error:** inline destructive message + "Try again".
- **Empty:** icon + title + hint.
- **Success:** toast (Sonner) + optimistic UI where safe.

## 8.1 Marketing — Home (`marketing/Home.tsx`)
- **Purpose:** Convert visitors; explain escrow value.
- **Components:** Nav, hero ("Followers into funds"), feature sections with `LazyVideo`, CTAs.
- **Inputs:** none. **Outputs:** navigation to Register/Login.
- **User Actions:** Sign up, log in, explore feature pages.
- **Navigation:** → Register, Login, ForCreators, ForBrands, Pricing, About.

## 8.2 Marketing — ForCreators / ForBrands / Pricing / About / Legal
- **Purpose:** Audience-specific value + pricing transparency + legal.
- **Pricing components:** tier cards from the shared feature catalogue (parity with in-app Premium).
- **States:** static; CTA → Register.

## 8.3 Auth — Register (`Register.tsx`)
- **Purpose:** Create account with role.
- **Inputs:** name, email, password, role (brand/creator), terms.
- **Outputs:** account + access token; email verification required path.
- **Error States:** validation, email already used, weak password.
- **Navigation:** → VerifyEmail / Login.

## 8.4 Auth — Login / ForgotPassword / ResetPassword / VerifyEmail
- **Login inputs:** email, password → token + `/auth/me`.
- **Errors:** invalid credentials, `EMAIL_NOT_VERIFIED` (resend path).
- **Reset/Verify:** token from email; single-use; expiry messaging.

## 8.5 App — Creator Dashboard (`app/CreatorDashboard.tsx`)
- **Purpose:** Creator home — balance, offers, campaign notifs.
- **Components:** balance/held cards, recent offers, new-campaign badge.
- **Outputs:** quick actions to Offers, Discover, Payments.
- **Empty:** "No offers yet — browse open campaigns."

## 8.6 App — Brand Dashboard (`app/BrandDashboard.tsx`)
- **Purpose:** Brand home — campaigns, offers, spend.
- **Components:** active campaigns, sent offers, analytics snapshot.
- **Actions:** New offer, post campaign.

## 8.7 App — Discover (`app/Discover.tsx`)
- **Purpose:** Role-routed discovery — brands see creators, creators see brands.
- **Components:** search input (500ms debounce), filters (niche, platform, location, followers), result grid.
- **Inputs:** query + filters. **Outputs:** creator/brand cards, profile modal, offer/apply modals.
- **Business logic:** platform filter applied client-side (preserves public cache key); list limit 24.
- **States:** loading/error/empty all handled.

## 8.8 App — Offers (`app/Offers.tsx`)
- **Purpose:** Manage offer lifecycle.
- **Components:** tabs (All/Pending/Active/Completed), `OfferCard`, `SubmitWorkModal`.
- **Actions:** accept, reject, submit work, approve, dispute, pay (escrow funding).
- **Inputs:** deliverable URL/note. **Outputs:** state transitions + toasts.
- **Note:** bank details sourced from `AuthContext` (no extra fetch).

## 8.9 App — Campaigns (`app/Campaigns.tsx`)
- **Purpose:** Browse/apply (creator) or post/manage (brand).
- **States:** early-access gating for non-premium creators; empty/loading/error.

## 8.10 App — Applications (`app/Applications.tsx`)
- **Purpose:** Track sent/received applications and statuses.

## 8.11 App — Premium (`app/Premium.tsx`)
- **Purpose:** Compare tiers, upgrade, manage recurring subscription.
- **Components:** tier cards, monthly/annual toggle (15% off), entitlement comparison, checkout CTA; subscription status (renewal date / `cancelAtPeriodEnd`) and **cancel auto-renewal** action.
- **Outputs:** Paystack recurring checkout → entitlements unlocked; card auto-charges each interval until cancelled.

## 8.12 App — Affiliate (`app/Affiliate.tsx`)
- **Purpose:** Manage affiliate deals + view click/conversion attribution.

## 8.13 App — Analytics (`app/Analytics.tsx`)
- **Purpose:** Performance dashboards scaled by tier.

## 8.14 App — Payments (`app/Payments.tsx`)
- **Purpose:** Wallet, ledger history, payouts/withdrawals.
- **States:** balance vs held, payout status, empty ledger.

## 8.15 App — Team (`app/Team.tsx`) / Agency (`app/Agency.tsx`)
- **Team:** add/remove members within seat limit.
- **Agency:** manage `ManagedBrand` profiles (Scale).

## 8.16 App — ProposalTemplates (`app/ProposalTemplates.tsx`)
- **Purpose:** Create/manage reusable proposals.

## 8.17 App — Settings (`app/Settings.tsx`)
- **Purpose:** Profile, bank account, KYC submission, security.

## 8.18 Admin — AdminApp (`admin/AdminApp.tsx`)
- **Purpose:** Operations console (KYC, disputes, users, finance, audit) — see §13.

---

# 9. Functional Requirements

> Format: **FR-ID | Description | Trigger → Process → Result**

**Authentication**
- **FR-001** Register account. *Trigger:* user submits register form. *Process:* validate (Zod), hash password (bcrypt), create User + role profile, issue access + refresh token, send verification email. *Result:* account created; verification pending.
- **FR-002** Email verification. *Trigger:* user clicks emailed link. *Process:* validate single-use token + expiry, mark `emailVerifiedAt`. *Result:* login enabled.
- **FR-003** Login. *Trigger:* credentials submitted. *Process:* verify hash, check verified, issue tokens. *Result:* authenticated session; `/auth/me` hydrates user.
- **FR-004** Refresh token rotation. *Trigger:* access token near expiry. *Process:* validate hashed refresh token, rotate, revoke old. *Result:* new access token.
- **FR-005** Password reset. *Trigger:* forgot-password request. *Process:* issue single-use token, email it; on reset validate + update hash. *Result:* password changed.
- **FR-006** Logout. *Trigger:* user logs out. *Process:* revoke refresh token, clear client token. *Result:* session ended.

**Profiles & Discovery**
- **FR-010** Update creator profile. *Trigger:* profile save. *Process:* validate, persist, invalidate profile + list caches. *Result:* updated profile; fresh cache.
- **FR-011** List creators. *Trigger:* discover query. *Process:* parse filters, cache-aside (Redis 5m), query repo. *Result:* paginated creators + cache headers.
- **FR-012** Get creator profile. *Trigger:* open profile. *Process:* cache-aside (2m), include capped recent completed offers (take 10). *Result:* profile payload.
- **FR-013** List/search brands. *Trigger:* creator browse. *Result:* paginated brands.

**Offers & Escrow**
- **FR-020** Create offer. *Trigger:* brand sends offer. *Process:* validate, persist `PENDING` (+ affiliate fields if applicable). *Result:* offer created, creator notified.
- **FR-021** Accept/reject offer. *Trigger:* creator action. *Process:* validate state + ownership, transition. *Result:* `ACCEPTED`/`REJECTED`.
- **FR-022** Fund offer (escrow). *Trigger:* brand pays. *Process:* Paystack init/verify, compute split (10% fee), create Transaction, `HOLD` ledger entry, increment `heldKobo`. *Result:* `FUNDED`.
- **FR-023** Submit deliverable. *Trigger:* creator submits. *Process:* store URL/note, set `submittedAt`. *Result:* `SUBMITTED`.
- **FR-024** Approve deliverable → release. *Trigger:* brand approves. *Process:* `releaseFunds` (idempotent RELEASE entry, move held→balance), audit. *Result:* `APPROVED/COMPLETED`; creator paid net.
- **FR-025** Dispute. *Trigger:* either party disputes. *Process:* set `DISPUTED`, enter admin queue. *Result:* awaiting resolution.
- **FR-026** Refund (dispute for brand). *Trigger:* admin resolves. *Process:* reverse hold (idempotent REFUND), provider refund (gross), set `refunded` only after provider success, audit. *Result:* `REFUNDED`.

**Wallet & Payouts**
- **FR-030** View balance/ledger. *Result:* `balanceKobo`, `heldKobo`, ledger history.
- **FR-031** Request payout. *Trigger:* creator withdraws. *Process:* validate withdrawable funds, create Payout, dispatch to Paystack recipient via worker. *Result:* payout `PENDING→…`.

**Campaigns & Applications**
- **FR-040** Post campaign. *Trigger:* brand posts. *Process:* enforce campaign cap by entitlement. *Result:* `OPEN` campaign.
- **FR-041** Browse campaigns. *Process:* apply early-access gate (non-Popular/Premium see >24h old only), private cache header. *Result:* campaign list.
- **FR-042** Apply to campaign. *Trigger:* creator applies. *Process:* enforce Popular+ entitlement, unique `(campaignId, creatorId)`. *Result:* application `PENDING`.
- **FR-043** Suggested creators. *Trigger:* Scale brand opens campaign. *Result:* AI-matched creators.

**Premium (recurring subscriptions)**
- **FR-050** Start subscription. *Trigger:* upgrade. *Process:* resolve/lazily-create the Paystack **Plan** for the role/tier/interval/price (cached in `SubscriptionPlan`), initialize a transaction enrolled in that plan (`plan` param → recurring), persist a `PENDING` `Subscription`. *Result:* Paystack checkout URL.
- **FR-051** Verify & activate. *Trigger:* redirect after payment. *Process:* verify the transaction, grant `premiumUntil` for one interval, set `lastChargeRef` (deduping the matching webhook). *Result:* entitlements active immediately.
- **FR-052** Recurring webhook reconciliation. *Trigger:* Paystack webhook. *Process:* `subscription.create` stores `subscription_code`/`email_token`/`customer_code` + activates; `charge.success` extends one interval (absolute-date, `lastChargeRef`-deduped); `invoice.payment_failed` → `PAST_DUE`; `subscription.disable`/`not_renew` → `CANCELLED`. *Result:* subscription + premium stay in sync across renewals.
- **FR-053** Cancel auto-renewal. *Trigger:* user cancels. *Process:* call Paystack `subscription/disable` with stored code + token, set `cancelAtPeriodEnd`. *Result:* no future charge; access continues to `currentPeriodEnd`.
- **FR-054** Get subscription / entitlements status. *Result:* tier, active flag, status, `currentPeriodEnd`, `cancelAtPeriodEnd`, entitlement set, tier catalogue.

**Affiliate / Team / Templates / Agency**
- **FR-060** Create affiliate offer + track events (CLICK/CONVERSION).
- **FR-061** Manage team members within seat limit.
- **FR-062** CRUD proposal templates.
- **FR-063** Manage managed brands (Scale).

**KYC & Support**
- **FR-070** Submit KYC. *Process:* encrypt NIN/BVN/CAC (AES-256-GCM), set `PENDING`. *Result:* awaiting review.
- **FR-071** Create support ticket. *Result:* `OPEN` ticket.

**Admin**
- **FR-080** Review KYC (approve/reject). **FR-081** Resolve dispute (release/refund). **FR-082** Suspend user. **FR-083** Grant premium. **FR-084** View audit log. **FR-085** Financial/reporting views. (See §13.)

---

# 10. Non-Functional Requirements

## 10.1 Security
- TLS everywhere; HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy` (frontend headers + helmet on API).
- bcrypt password hashing; JWT (15m) + hashed rotating refresh tokens (30d).
- KYC PII encrypted at rest (AES-256-GCM, 32-byte key enforced at boot).
- Rate limiting (Redis-backed): API 300/15m, auth 20/15m in production.
- Secrets via env only; boot-time validation rejects placeholders/mocks in production.
- See §15 for full framework.

## 10.2 Scalability
- Stateless API for horizontal scale; Redis-backed shared state; queue-decoupled async; cache-aside reads; index-tuned hot paths; cursor pagination.

## 10.3 Performance (Core Web Vitals targets)
| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
- Response compression (Brotli/gzip/deflate); creator list/profile cached (Redis + CDN); lazy media (`LazyVideo`, `preload=none`); AVIF/WebP images; immutable static caching; `font-display: swap`; visibility-aware polling. Tuned specifically for metered Nigerian mobile networks.

## 10.4 Reliability
- Idempotent money operations (unique ledger constraints); exactly-once webhook processing; provider-refund-before-status ordering; retryable partial-failure paths.

## 10.5 Availability
- Target **99.9%** API availability. Managed Postgres + Upstash + Vercel/Railway redundancy. Redis has in-memory fallback for non-critical caching.

## 10.6 Accessibility
- Semantic HTML, keyboard navigation, focus/hover/active states, reduced-motion support, WCAG 2.2 AA target.

## 10.7 Compliance
- NDPR (Nigeria Data Protection) alignment; PII minimization + encryption; payment handling via licensed provider (Paystack) — Tehilla does not store raw card data; KYC retention policy.

## 10.8 Maintainability
- Layered architecture, single-source entitlement catalogue, Zod validation, small focused modules, TypeScript throughout.

## 10.9 Disaster Recovery
- Automated DB backups (point-in-time restore); migrations versioned + idempotent; documented restore runbook; RPO ≤ 1h, RTO ≤ 4h targets.

## 10.10 Monitoring / Logging / Observability
- Sentry (errors), Prometheus `prom-client` (metrics), structured request logging (pino + request IDs), audit log for sensitive actions, webhook event log.

---

# 11. Product Evolution & Auto-Update System

> A first-class capability so the product evolves **without forced redeploys or app-store cycles**.

## 11.1 Feature Flag System
- Central flag service (DB-backed `feature_flags` + Redis cache), evaluated per request with targeting by role, tier, %-rollout, user cohort.
- The existing `FeatureStatus` (`live`/`rolling-out`) becomes runtime-toggleable rather than code-constant.
- SDK: `isEnabled(flagKey, context)` in backend; mirrored client hook `useFlag(flagKey)`.

## 11.2 Remote Configuration Engine
- Admin-editable config (UI copy, pricing, fee rate, limits, feature toggles, campaign rules) stored in DB, pushed via Redis pub/sub, cached client-side with ETag revalidation.
- **Pricing & fee changes** become config, not deploys (with audit + effective-date scheduling).

## 11.3 Dynamic Content Management
- CMS-style tables for banners, in-app notifications, promotions, and marketing landing blocks — rendered from data, editable without deployment; schedule + audience targeting.

## 11.4 AI-Powered Feature Recommendations
- Behavioral analytics pipeline → recommends next features per user (e.g., "upgrade to Popular to apply to campaigns") and surfaces product-team signals on which `rolling-out` features to prioritize.

## 11.5 Version Control Strategy
- API versioning (`/api/v1`), backward-compatible additive changes, deprecation windows.
- Gradual rollouts, A/B testing (flag-driven), canary releases to a subset of instances/users.

## 11.6 Auto-Update Mechanism
- **Web:** silent updates via Vercel deploys + content-hashed immutable assets; service-worker update prompt (Roadmap).
- **Mobile (Roadmap):** OTA updates (Expo Updates / CodePush), progressive deployment, rollback on crash-rate threshold, version validation/min-supported-version gate.

## 11.7 Future Module Framework
- Plugin-style module registry: new domains (e.g., **chat/DM**, **content marketplace**, **ads**, **lending against receivables**) register routes + entitlements + flags without core rewrites. Each module: own service/repo/schema namespace, gated by flags + tiers.

## 11.8 Technical Debt Prevention Plan
- Enforced layering, ≤800-line files, Zod-at-boundaries, 80% coverage gate, code review (CRITICAL/HIGH block), dependency audits, periodic dead-code sweeps.

## 11.9 Long-Term Scalability Roadmap
- Read replicas, partitioning of high-volume tables (ledger, audit), event-sourced financial core, multi-currency ledger, multi-region deploy.

---

# 12. Data Model

## 12.1 Entity Relationships (summary)

```
User 1─1 Creator        User 1─1 Brand        User 1─* (tokens, tickets, idempotency, auditLogs)
Brand 1─* Offer         Creator 1─* Offer      Offer 1─1 Transaction
Transaction 1─* LedgerEntry   Transaction 1─1 Payout
Creator 1─* (Application, CampaignApplication, ProposalTemplate, TeamMember, LedgerEntry, Payout, Transaction)
Brand 1─* (Campaign, Application, ManagedBrand)
Campaign 1─* CampaignApplication
Offer 1─* AffiliateEvent
```

## 12.2 Core Tables

| Table | Key Fields | Notes |
|-------|-----------|-------|
| **User** | email (unique), password, role, kycStatus, ninCipher, bvnCipher, permissions[] | identity root; PII encrypted |
| **Creator** | handle (unique), niche, followers, baseRate, platforms[], balanceKobo, heldKobo, premiumTier, premiumUntil, bank* | wallet + premium live here |
| **Brand** | industry, website, cacNumberCipher, premiumTier, premiumUntil | brand subscription |
| **ManagedBrand** | agencyBrandId, name, industry | agency workspace |
| **Offer** | amountKobo, status, dealType, commissionRate, affiliateCode (unique), usageRights, deadline | contract |
| **Transaction** | offerId (unique), grossKobo, feeKobo, netKobo, paystackRef, status | escrow money record |
| **LedgerEntry** | type, amountKobo, balanceAfterKobo, **unique(transactionId,type)** | idempotent wallet history |
| **Payout** | transactionId (unique), amountKobo, provider, status | withdrawals |
| **Campaign** / **CampaignApplication** | budgetKobo, status / unique(campaignId,creatorId) | open opportunities |
| **Application** | unique(creatorId,brandId), status | creator→brand pitch |
| **AffiliateEvent** | type (CLICK/CONVERSION), amountKobo | attribution |
| **ProposalTemplate**, **TeamMember** | creator-scoped | premium tools |
| **SubscriptionPlan** | name (unique), planCode (unique), role, tier, interval, amountKobo | cached Paystack plan codes (lazy-created per price) |
| **Subscription** | userId, role, tier, planCode, subscriptionCode (unique), emailToken, customerCode, status, currentPeriodEnd, lastChargeRef, cancelAtPeriodEnd | recurring billing state; codes needed to cancel |
| **RefreshToken / PasswordResetToken / EmailVerificationToken** | tokenHash (unique), expiresAt, usedAt/revokedAt | auth tokens |
| **IdempotencyKey** | key (unique), scope, requestHash, responseJson, status | safe retries |
| **ProviderWebhookEvent** | unique(provider,eventId), status | exactly-once webhooks |
| **AuditLog** | actorId, action, entityType, entityId, ip, requestId | tamper-evident trail |
| **SupportTicket** | subject, message, status | support |

## 12.3 Enums
`Role, OfferStatus, OfferDealType, AffiliateEventType, TicketStatus, PaymentProvider, WebhookStatus, IdempotencyStatus, LedgerEntryType, PayoutStatus, KycStatus, PremiumTier, ApplicationStatus, CampaignStatus, SubscriptionStatus`.

## 12.4 Indexing Strategy
- Hot read paths: `Offer(status,createdAt)`, `Offer(brandId,createdAt)`, `Offer(creatorId,createdAt)`, `Creator(niche)`, `Creator(followers)`, `Creator(premiumTier)`, `Creator(isVerified)`, `Campaign(createdAt)`, `Transaction(creatorId,createdAt)`.
- Uniqueness as integrity guard: ledger idempotency, webhook dedupe, affiliate code, application pairs.

## 12.5 Audit Logs
- `AuditLog` records every sensitive/financial action (escrow release/refund, KYC decisions, suspensions) with actor, IP, request ID, metadata.

## 12.6 Analytics Schema
- Derived from `AffiliateEvent` (clicks/conversions), `Transaction`/`LedgerEntry` (GMV, fees, payouts), `Offer`/`Campaign` (funnel), `Creator`/`Brand` (cohorts). Roadmap: dedicated read-model / warehouse for reporting.

---

# 13. Admin Portal Requirements

## 13.1 Admin Roles & Permissions
- Base `Role.ADMIN` + granular `permissions[]` (e.g., `kyc.review`, `escrow.resolve`, `user.suspend`, `premium.grant`, `finance.view`). RBAC enforced via `requireRole('ADMIN')` + permission checks.

## 13.2 Capabilities
| Area | Functions |
|------|-----------|
| **KYC Moderation** | Review queue, view (decrypted) KYC, approve/reject with note, set badges |
| **Dispute Resolution** | View disputed offers, release or refund escrow (idempotent, audited) |
| **User Management** | Search users, suspend/reinstate (`suspendedAt`, reason), role view |
| **Financial Controls** | Transactions, ledger, payouts, manual adjustments (ledger `ADJUSTMENT`) |
| **Premium Operations** | Grant/set tier + duration (`grantPremium`) |
| **Analytics** | GMV, take rate, dispute rate, verification rate, MRR |
| **Reporting** | Exportable financial + operational reports (Roadmap: white-label) |
| **Support** | Ticket triage and status management |

## 13.3 Controls & Safeguards
- All financial actions audited; idempotent operations prevent double-apply; provider-refund-before-status ordering; least-privilege permissions.

---

# 14. Analytics & KPIs

## 14.1 North Star Metric
**Escrow-protected GMV per month** — total value successfully settled through the platform. It captures both sides' trust, transaction volume, and directly drives revenue.

## 14.2 Metric Framework (AARRR + Ops)

| Category | Metrics |
|----------|---------|
| **Acquisition** | Sign-ups by role, landing→register conversion, CAC, traffic sources |
| **Activation** | % creators completing profile + bank + KYC; % brands funding first offer; time-to-first-offer |
| **Retention** | Repeat deals per user, 30/60/90-day active, subscription renewal rate |
| **Revenue** | GMV, take-rate revenue (10%), MRR/ARR by tier, ARPU, annual-plan mix |
| **Referral** | Invites sent/accepted (Roadmap referral program), viral coefficient |
| **Operational** | Dispute rate, refund rate, payout success rate, KYC approval rate/time, fraud incidents, support resolution time |

## 14.3 Guardrail Metrics
- Dispute rate < target threshold; refund rate; chargeback rate; off-platform leakage signals; payout failure rate.

---

# 15. Security Framework

| Domain | Implementation |
|--------|----------------|
| **Authentication** | bcrypt; JWT access (15m); hashed rotating refresh (30d); email verification required |
| **Authorization / RBAC** | Role enum + granular `permissions[]`; `requireRole`/permission preHandlers |
| **MFA** | Roadmap (TOTP/SMS) — especially for admin + payout actions |
| **Encryption** | TLS in transit; AES-256-GCM for KYC PII at rest (32-byte key enforced) |
| **Data Protection** | PII minimization, encrypted ciphers, NDPR alignment, retention policy |
| **Fraud Prevention** | KYC/identity verification, escrow, audit trail, rate limits, webhook dedupe, idempotency, follower/engagement scrutiny (Roadmap scoring) |
| **API Security** | Helmet headers, credentialed CORS allow-list, Zod validation, rate limiting, request timeouts |
| **Session Management** | Token revocation on logout, refresh rotation, `auth-expired` global handling |
| **Device Verification** | Roadmap (device fingerprinting, new-device email alerts) |
| **Secret Management** | Env-only, boot-time validation, no placeholders/mocks in prod |

---

# 16. Testing Strategy

| Layer | Approach | Tooling |
|-------|----------|---------|
| **Unit** | Services, money math (`utils/money`), entitlements (`lib/premium`), validators | Vitest |
| **Integration** | API routes + DB (auth, offers, escrow, premium, campaigns) | Vitest + Supertest |
| **E2E** | Critical flows: register→verify→login; offer→fund→deliver→approve→release; dispute→refund; subscribe | Playwright |
| **Security** | Authz checks, rate-limit, injection, secret scanning, dependency audit | security-reviewer + CI |
| **Load** | Discovery + escrow endpoints under concurrency; cache hit ratios | k6/Artillery (Roadmap) |
| **Regression** | Suite gating on PRs; coverage ≥ 80% | CI |
| **UAT** | Beta cohort scripted journeys per persona | Manual + checklist |

**Money-path test priorities:** idempotent release/refund, double-fund prevention, fee correctness (10%), partial-failure recovery, webhook exactly-once.

---

# 17. Release Strategy

| Phase | Scope | Exit Criteria |
|-------|-------|---------------|
| **MVP (current)** | Auth, profiles, discovery, offers, escrow, wallet/payouts, premium, campaigns, KYC, admin | Core money flow stable + audited; deploys green |
| **Beta** | Invite cohort of creators + brands; real GMV; feedback loops; rolling-out features hardened | Dispute/refund rate within target; activation funnel validated |
| **Public Launch** | Open registration; marketing push; referral program; subscription growth | Liquidity threshold reached; renewal rate proven |
| **Scale** | Performance/analytics depth, agency tooling, AI matching, mobile app (OTA) | Multi-thousand active users; margin-positive |
| **Enterprise** | API access, white-label reports, SLAs, dedicated managers, multi-currency | Enterprise/agency contracts signed |

---

# 18. Product Roadmap

## 18.1 3-Month (Now → Sep 2026)
- ✅ **Done:** Paystack **recurring subscriptions** (Plans + Subscriptions) — auto-renewal, webhook reconciliation, cancellation. Replaces the old manual 30-day grant.
- Harden escrow edge cases + full money-path test coverage (P0, dep: none).
- Subscription dunning UX: in-app `PAST_DUE` banner + retry/update-card prompt; live verification of the Paystack webhook registration in production (P0, dep: recurring subs — now live).
- Ship `rolling-out` Popular/Premium features to "live" (P1, dep: analytics events).
- Feature-flag + remote-config foundation (§11.1–11.2) (P1).
- Beta cohort onboarding + instrumentation (P0).

## 18.2 6-Month (→ Dec 2026)
- Public launch; referral program; dynamic content/promotions (P1).
- Advanced + enterprise analytics, sales attribution depth (P1).
- Fraud scoring (follower/engagement authenticity) (P1, dep: data pipeline).
- MFA for admin + payouts (P1).

## 18.3 12-Month (→ Jun 2027)
- Mobile app (React Native + OTA updates) (P1).
- In-app messaging/DM module (plugin framework) (P2).
- Agency bulk outreach + white-label reports GA (P2).
- Read replicas + reporting warehouse (P2).

## 18.4 24-Month (→ 2028)
- Pan-African expansion + multi-currency ledger (P1).
- API/marketplace ecosystem + partner integrations (P2).
- Embedded finance: advances/lending against receivables (P3, dep: licensing).
- Event-sourced financial core (P3).

---

# 19. Risk Assessment

| Risk | Type | Likelihood | Impact | Mitigation |
|------|------|-----------|--------|------------|
| Liquidity cold-start | Business | High | High | Seed verified creators; brand-side concierge; surface campaigns to new creators immediately |
| Off-platform leakage | Business | High | High | Escrow + dispute protection as the value; track-record only on-platform; discourage via T&Cs + fee-justified guarantees |
| Fintech/escrow licensing | Legal | Med | High | Operate via licensed provider (Paystack); legal review of fund-holding; structure as conditional settlement; pursue required licenses |
| Fraud (fake metrics/deliverables/collusion) | Operational | Med | High | KYC, escrow, audit, fraud scoring, dispute process, manual review queue |
| Payment provider concentration | Technical | Med | Med | Provider abstraction already in code (`paymentProvider`); add Flutterwave; idempotent webhooks |
| Payment/refund partial failure | Technical | Low | High | Idempotent ledger, provider-refund-before-status, retryable paths, alerts |
| Data breach (PII) | Security/Legal | Low | High | AES-256-GCM encryption, least privilege, audit, NDPR compliance, secret hygiene |
| Performance on poor networks | Technical | Med | Med | Compression, caching, lazy media (already implemented); CWV monitoring |
| Churn / weak renewals | Financial | Med | Med | Demonstrate ROI in-product; annual discount; tier value laddering |
| Single-region outage | Operational | Low | Med | Backups, DR runbook, managed redundancy, multi-region roadmap |

---

# 20. Success Criteria

## 20.1 Product
- Core escrow flow (fund→deliver→approve→release) and dispute→refund are idempotent, audited, and pass full test coverage.
- ≥ 80% automated test coverage on money paths; zero double-apply incidents.
- CWV targets met (LCP < 2.5s, INP < 200ms, CLS < 0.1) on 4G.

## 20.2 Business (12-month targets — validate & adjust)
- **North Star:** sustained month-over-month growth in escrow-protected GMV.
- **Take-rate revenue:** 10% of GMV captured cleanly; reconciliation accurate to the kobo.
- **Subscriptions:** growing MRR across creator (₦10k/22.5k/50k) and brand (₦25k/60k/150k) tiers; healthy annual-plan mix (15% discount uptake).
- **Trust:** majority of active creators KYC-verified; dispute rate and refund rate within defined guardrails.
- **Liquidity:** two-sided activation — creators completing onboarding and brands funding first offers — above target thresholds.

## 20.3 Operational
- Payout success rate ≥ 99%; KYC review SLA met; support resolution within SLA; webhook processing exactly-once with zero duplicates.

---

*End of PRD — Tehilla : Creator Commerce v2.0.*
