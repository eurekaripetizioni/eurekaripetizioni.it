# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for **Eureka! APS** (doposcuola / ripetizioni, Pomezia e Aprilia).
Two pages, no framework, no build step, no dependencies, no tests.

- `index.html` — home (hero, chi siamo, obiettivi, programmi, sedi, contatti, footer)
- `privacy.html` — privacy policy (GDPR)
- `css/`, `js/`, `icons/`, `logo.png`
- `CNAME` → deployed on **GitHub Pages** at `eurekaripetizioni.it`. Deploy = push to the Pages branch; the repo root is served as-is.

## Develop / preview

```sh
python3 -m http.server 8765      # then open http://localhost:8765/
```

A plain file open (`file://`) mostly works but breaks the Google Maps iframe and some
referrer behaviour — use the local server. There is nothing to lint, compile, or test.

## Architecture / conventions

**Design system ("linguaggio Apple").** All design tokens are CSS custom properties in
`:root` of `css/index.css` (colour, spacing scale `--space-*`, radii, `--ease`, `--max-width`).
`css/privacy.css` **duplicates** the token block so it can be used standalone, but
`privacy.html` links **both** stylesheets: `index.css` for tokens + shared components
(`header`, `.nav`, `.site-footer`, `.cookie-banner`, `.wa-fab`, `.pill`, `.section-*`),
`privacy.css` only for privacy-specific layout (sticky ToC, numbered blocks). When changing a
shared component, edit `index.css`.

**Forced light theme.** `<html data-theme="light">` on both pages. Full dark-mode CSS exists
but is gated behind `:root:not([data-theme="light"])` + `prefers-color-scheme: dark`, so it is
currently inert. Removing `data-theme="light"` re-enables it.

**Progressive enhancement.** JS adds `.js-enabled` to `<html>`; every animation / reveal /
FAB-hide rule is scoped under `.js-enabled`. The site must stay fully readable and navigable
with JS disabled — don't move content into JS-only code paths.

**Duplicated markup, no templating.** The header/nav, footer, cookie banner and `.wa-fab`
blocks are copy-pasted into both HTML files. Any change to one must be mirrored in the other.

**Duplicated cookie/analytics logic.** `js/index.js` and `js/privacy.js` each carry their own
copy of the GA4 + Consent Mode v2 code. `privacy.js` is the more complete version (explicit
`gtag('consent', 'default'/'update', …)`); `index.js` has drifted and lacks the `consent`
calls. `GA_MEASUREMENT_ID` (`G-E2C088Q8M9`) is hardcoded in both. Consent choice is stored in
`localStorage` under `cookie-consent` (`accepted` / `rejected`); analytics scripts load only
after `accepted`, and `_ga*` cookies are cleared on `rejected`. Keep the two copies in sync.

**`js/index.js` responsibilities** (single file, runs top-to-bottom, not a module):
- Mobile nav: on open it **moves `#navLinks` into `<body>`** and back on close, because
  `header` has `backdrop-filter` which makes it a containing block for `position: fixed`
  children — the full-screen menu can't escape it otherwise.
- Smooth scroll for `[data-scroll]` targets with a fixed 70px header offset (`#top` = scroll to 0).
- Sedi: segmented tab control + a single card that does a 3D `rotateY` flip while swapping the
  embedded `https://www.google.com/maps?q=…&output=embed` iframe.
- Reveal-on-scroll via `IntersectionObserver` (adds `.in-view`), staggered by sibling index.
- WhatsApp FAB shown only once the hero is scrolled out of view.

**Icons.** Subject chips in the hero use an inline `<symbol>` SVG sprite defined once at the
top of `index.html` (`#ic-*`), referenced with `<use href="#ic-…">`. Section-header icons are
files in `icons/`. Brand/social glyphs are inline `<path>` (Instagram/Facebook use canonical
Simple Icons paths).

**Email links** point to Gmail compose URLs
(`https://mail.google.com/mail/?view=cm&fs=1&to=info@eurekaripetizioni.it&su=…`,
`target="_blank"`), **not** `mailto:` — a deliberate choice so desktop clicks reliably open a
compose window. Phone/WhatsApp use `https://wa.me/393513712990`.

**Motion.** Every animation is opacity/transform only, 0.2–0.4s, and there is a
`prefers-reduced-motion` block that neutralises them — keep new animations within that budget
and covered by the reduced-motion guard.

**SEO.** Both pages carry `<link rel="canonical">`, Open Graph / Twitter meta, and JSON-LD
(`index.html`: `EducationalOrganization` + `WebSite` + `WebPage` in an `@graph`, with the two
sedi as `Place` nodes and `@id` `…/#organization` / `…/#website` referenced from `privacy.html`).
`robots.txt` + `sitemap.xml` at the root use absolute `https://eurekaripetizioni.it/` URLs — if
the domain changes, update the canonicals, the JSON-LD `@id`/`url` values, the OG `url`/`image`,
`robots.txt` and `sitemap.xml` together. Nav and footer section links are real `<a href="#…">`
(with `data-scroll` for the JS smooth-scroll) so crawlers see the in-page anchors — don't turn
them back into `<button>`.
