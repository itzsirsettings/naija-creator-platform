# Tehilla — Brand

> Creator commerce for Nigerian creators and the brands that pay them.

## Logo

Tehilla uses the provided PNG logo as the single source of truth across the app, marketing site, favicon, and social previews. Do not revive older SVG wordmarks, boxed-letter marks, or generated placeholder logos.

| Asset | Path | Use |
| --- | --- | --- |
| Logo (PNG) | `tehilla-logo.png` | Source asset provided at repo root |
| App logo (PNG) | `frontend/src/assets/tehilla-logo.png` | React imports for app, auth, dashboard, and marketing UI |
| Public logo (PNG) | `frontend/public/tehilla-logo.png` | Browser tab, service worker cache, OG image, and Twitter card |

Keep all three copies in sync when the source logo changes.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Deep teal | `#006454` / `oklch(44.98% 0.0836 176.68)` | Light-theme primary actions, links, trust states |
| Charcoal | `#2F2F2F` / `oklch(30.52% 0 89.88)` | Text, dark surfaces, structural contrast |
| Vivid green | `#00EF53` / `oklch(82.88% 0.251 146.31)` | Dark-theme primary actions, success, positive money moments |
| White | `#FFFFFF` / `oklch(100% 0 89.88)` | Light surfaces and dark-theme text |

The app keeps legacy semantic aliases such as `--gold`, `--purple`, and `--coral` for component compatibility, but those aliases now resolve to Tehilla green, teal, charcoal, or derived tints from this four-color palette.

Light theme (auto via `prefers-color-scheme` or `[data-theme="light"]`):

| Token | Value |
| --- | --- |
| `--bg` | `#FFFFFF` |
| `--surface` | `#FFFFFF` |
| `--text` | `#2F2F2F` |
| `--muted` | teal-tinted charcoal |
| `--border` | teal-tinted light border |
| `--accent` | `#006454` for accessible text/action contrast |

Dark theme:

| Token | Value |
| --- | --- |
| `--bg` | charcoal-teal mix derived from `#2F2F2F` and `#006454` |
| `--surface` | charcoal-teal mix derived from `#2F2F2F` and `#006454` |
| `--text` | `#FFFFFF` |
| `--muted` | white with a teal tint |
| `--border` | teal-tinted charcoal border |
| `--accent` | `#00EF53` |

## Typography

- **Display**: Fraunces (Google Fonts) — headlines, hero copy, section titles
- **Body / UI**: Manrope (Google Fonts) — paragraphs, buttons, table data
- **Monospace**: SF Mono / JetBrains Mono fallback for transaction IDs

Type scale:

| Class | Size / line | Use |
| --- | --- | --- |
| `.display` | clamp(2.5rem, 5vw, 4.5rem) / 1.05 | Hero H1 |
| `.h1` | clamp(2rem, 3.5vw, 3rem) / 1.1 | Section H2 |
| `.h2` | clamp(1.5rem, 2.4vw, 2rem) / 1.2 | Card H3 / panel title |
| `.h3` | 1.125rem / 1.4 | Subhead, sidebar |
| `.lede` | 1.125rem / 1.6 | Paragraph under H1 / H2 |
| `.eyebrow` | 0.8125rem / 1 / +0.06em | Section label |

## Voice

- **Calm, not clever.** A reader should never need a second pass to understand what Tehilla does or what something costs.
- **Concrete, not aspirational.** Use numbers ("10% flat", "≤ 24h payout") not adjectives ("simple", "fast", "modern").
- **Two-sided awareness.** Every claim about the platform is phrased from either the creator's or the brand's perspective, never both at once.
- **No exclamation points. No emoji.** Tone is editorial, not promotional.

Banned phrases:
- "simple", "easy", "seamless", "powerful", "all-in-one"
- "level up", "unlock", "supercharge", "next-level"
- "trusted by thousands" (no social-proof until we have it)

## Logo do / don't

- **Do** use `tehilla-logo.png` anywhere Tehilla identity appears.
- **Do** keep clear space around the logo in compact lockups.
- **Don't** replace it with letter-only marks, SVG redraws, or demo logos.
- **Don't** recolor, rotate, stretch, or skew the asset.

## File map

```
frontend/
  public/
    tehilla-logo.png           # browser tab, OG image, and social card source
    sitemap.xml
    robots.txt
  src/
    assets/
      tehilla-logo.png         # React-imported app logo
    index.css                  # design tokens + marketing CSS
    components/
      MarketingLayout.jsx      # header + footer + mobile drawer
    pages/
      marketing/
        Home.jsx
        ForCreators.jsx
        ForBrands.jsx
        Pricing.jsx
        About.jsx
```

## Contacts

- General: hello@tehilla.work
- Support: support@tehilla.work
- HQ: Lagos, Nigeria
