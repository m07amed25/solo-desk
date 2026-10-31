---
version: 1
slug: "app-global-not-found-tsx"
primary_target: "app/global-not-found.tsx"
related_targets: ["proxy.ts"]
---

# Not-found recovery

Mode: Operate. Audience: visitors arriving at a missing URL. Task: recover through home, sign in or contact. User supplied the centered preview as the final direction on 1 November 2026, superseding the earlier destination-list choice. Established SoloDesk identity is fixed. Code-led build; `.impeccable/mocks/decision/404-center.png` is the chosen critique reference. Generated mockup navigation is illustrative; use the existing logo and the three confirmed recovery destinations without unrelated marketing navigation.

## Direction contract

THESIS: Make a missing page a short, clear choice of destination; one home action anchors the centered recovery message.

OWN-WORLD: Existing monochrome semantic roles, Rugis/Sahabah headings, Geist body, shared shadcn link variants and finite corners. Saved dark/light/system and English/Arabic presentation applies.

STORY: Understand the page is missing, check the address, then choose home, sign in or contact. No account or resource information is fetched or disclosed.

FIRST VIEWPORT: Centered SoloDesk wordmark, oversized Rugis 404, the heading “This page is off the desk.”, a two-line explanation, a primary home button and secondary sign-in/contact links separated by a short vertical rule. Footer quietly identifies the state. Narrow screens wrap text without clipping and preserve reading order; RTL mirrors navigation arrows.

FORM: Centered recovery, candidate six; pinned by user image. seed:232e2df50801b316. Signature: the brand’s rounded 404 numerals lead directly into one clear recovery action.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Scope and verification

Reach: global 404 entry, its Next.js feature flag, proxy alias denials, bilingual message catalogs, shared buttons/fonts/tokens (reuse only), HTTP regression checks. Preserve existing uncommitted account/auth work.
Security owner: implementation agent. Applicable SEC-025 output encoding, SEC-028 private-cache separation, SEC-029 safe navigation and SEC-030 routing interpretation: bounded presentation cookies only, fixed local links, no path/query reflection or protected services; verify missing and denied alias routes with adversarial cookies/query strings. No schema/auth/dependency changes. This is local evidence, not deployment acceptance.

## Implemented surface and finish evidence — 1 November 2026

The final centered reference is implemented in `app/global-not-found.tsx`. It reuses the existing transparent wordmark, shared semantic background/foreground/muted/primary/ring roles, Rugis numerals, language-selected Rugis/Sahabah headings, Geist body, site container and shared Button variants. The home link has finite 8px corners and a 44px minimum height; secondary destinations use the large link variant. The heading scales from 24px to 54px. Numerals and vertical spacing respond to viewport height, with 64px numerals below 500px height. This layout belongs to the recovery surface; it adds no global design rule.

The complete HTML document declares its own language, direction, theme, fonts and stylesheet because the global fallback bypasses normal layouts. Bounded presentation cookies retain English/Arabic and Dark/Light/System; `instant = false` permits request-dependent rendering rather than requiring cookie access during prerender. Recovery links are fixed at `/`, `/sign-in` and `/#contact`, with RTL icon mirroring, a skip link, visible focus, reduced-motion variants and non-indexing metadata.

Local finish review returned **ship** with no material fixes. Six 404 captures in `.impeccable/review/` (`desktop.png`, `mobile.png`, `narrow.png`, `zoom.png`, `arabic-desktop.png`, `arabic-mobile.png`) were compared with the chosen centered reference. The implementation agent reported seven browser viewport checks, spanning 320×568 through desktop and including 640×450, with no document overflow, page errors or unreachable recovery controls; Next diagnostics returned empty configuration/session errors. Final type, lint and catalog checks passed. The production build passed after the short-height numeral adjustment, and all four existing Node test files passed.

The final `scripts/test-not-found-http.mjs` run passed 32 missing-route variants across locale/theme combinations, nested and denied aliases, invalid-cookie defaults, private cache headers, no query reflection, no cookie writes and existing recovery/assets. Its loopback-only target guard prevents accidental remote runs. These checks do not establish full accessibility conformance, fluent Arabic review, deployment behavior or a security certification. The production dependency audit reported 8 low and 6 moderate findings (14 total), pre-existing to this change; no dependency update is part of this surface.

No new shipping raster was introduced. Decision mockups retain prompt sidecars; the existing wordmark remains the runtime asset. `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `app/globals.css`, `lib/fonts.ts` and `components/ui/button.tsx` are preserved by this task. The pre-existing sidecar's Geist display metadata and older system narrative remain stale; neither that drift nor unrelated palette/contrast gaps are canonized or repaired by this ordinary extension.
