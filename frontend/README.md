# Tehilla — Frontend

React + Vite single-page app for [tehilla.work](https://tehilla.work).

The same SPA serves the public marketing site (unauthenticated) and the authed creator/brand dashboard. Routes are split into two zones:

- **Public** (rendered outside `RequireAuth`): `/`, `/for-creators`, `/for-brands`, `/pricing`, `/about`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/terms`, `/privacy`
- **Authed** (wrapped in `RequireAuth` + `AppLayout`): `/app`, `/discover`, `/offers`, `/payments`, `/analytics`

Anything unknown falls through to `/app` for authed users or `/` for everyone else.

## Stack

- React 18, React Router 6
- Vite 8 (Rolldown)
- Sentry (browser + replay)
- lucide-react (icons)
- axios (HTTP)

## Local development

```bash
npm install
cp .env.example .env  # if you have one
npm run dev
```

The dev server reads `VITE_API_URL` (default `http://localhost:5000/api`) and `VITE_APP_MODE` (`demo` | `production`). In demo mode, the app falls back to a local in-memory data layer so you can click through without the backend running.

## Build & deploy

```bash
npm run build       # outputs to dist/
npm run preview     # serves the build locally
```

The app is built and deployed as a static SPA. All paths are rewritten to `/index.html` (see `vercel.json` and `vite.config.js` for the exact config). The backend is deployed separately and the frontend talks to it via `VITE_API_URL`.

For production, set Vercel env vars from `.env.production.example`, then run:

```bash
npm run readiness:env
npm run build
```

The production build refuses localhost/demo API URLs and requires `VITE_SENTRY_DSN`.

## Folder map

```
src/
  assets/                  # app assets, including tehilla-logo.png
  components/              # shared UI (Navbar, Sidebar, MarketingLayout, ...)
  context/                 # ThemeContext, AuthContext, AppDataContext
  pages/
    marketing/             # public marketing pages
      Home.jsx
      ForCreators.jsx
      ForBrands.jsx
      Pricing.jsx
      About.jsx
    Home.jsx               # role-switch dashboard (mounted at /app)
    Login.jsx
    Register.jsx
    ForgotPassword.jsx
    ResetPassword.jsx
    VerifyEmail.jsx
    Legal.jsx              # serves /terms and /privacy
    Discover.jsx
    Offers.jsx
    Payments.jsx
    Analytics.jsx
  services/
    api.js                 # axios + demo mode helpers
  index.css                # design tokens + every component style
  App.jsx                  # router
  main.jsx
public/
  tehilla-logo.png
  sitemap.xml
  robots.txt
```

## Brand

See `docs/brand.md` at the repo root for the logo, palette, and voice guidelines.
