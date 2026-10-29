# Implementation Plan: Public Landing Page and Separate Authentication Pages

**Branch**: `main` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-landing-auth-pages/spec.md`.

Setup resolved this feature through `.specify/feature.json`. Its BRANCH output was
`001-landing-auth-pages`, a resolved feature identifier; Git remains on `main`. No branch hook
is configured and no branch was created.

## Summary

Replace the current account-only home with the reference-inspired public landing and separate
Sign in/Sign up pages, preserving today's private profile at /app. Keep Neon Managed Better Auth,
Google/GitHub and the callback verifier exchange. Reuse shared components and semantic tokens,
implement the specified English/Arabic and Light/Dark/System presentation, and clear stale
private UI when current authority is lost.

Use finite internal locale/theme roots with canonical URL rewrites, a bounded non-sensitive
preference form, server-rendered marketing content and small client boundaries for navigation,
provider attempts and the existing profile. Use next-intl for English/Arabic as requested by the
user; it is the sole planned new direct runtime dependency. Add no business schema or service.
This command ends at Phase 1 design; application implementation and tasks generation are separate.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict), React 19.3.0, Node 24.21.0 observed locally.

**Primary Dependencies**: Next.js 16.4.3 App Router with Cache Components and partial prefetching
already enabled; Tailwind 4.3.3, shadcn base-nova/Base UI 1.9.0, Lucide, Neon Auth 0.7.0-beta,
local Better Auth/core 1.7.14, existing pg and Realtime packages. Add next-intl with a compatible
exact version selected from current registry peer metadata and advisory review at implementation.

**Storage**: Existing server-only Neon auth/profile tables and session-scoped live queries;
two non-sensitive, allowlisted preference cookies. No new table, migration, protected browser
persistence, object storage or background job.

**Testing**: Installed ESLint, Next type generation, TypeScript and Webpack production build;
Node built-in tests for new pure boundary logic; local-only HTTP assertions; existing real-Neon
integration test adapted to /app and isolated execution; supported browser/manual bilingual,
accessibility and provider checks. No browser runner is installed or assumed.

**Target Platform**: Responsive browser website. Validation targets the spec's phone/tablet/wide
sizes, 320 CSS-pixel reflow, 200% zoom and Chromium/Firefox/WebKit where supported. Q-11 still
owns final production browser/device support.

**Project Type**: Existing single Next.js modular web application.

**Performance Goals**: Public first render performs zero auth/profile/DB calls; six bounded
presentation shells, no chart/widget library or autoplay media. Measure existing proposed
p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on declared fixtures; these are targets, not achieved claims.
SC-006 remains four of five reviewers identifying purpose/account action within 15 seconds.

**Constraints**: Canonical /, /sign-in, /sign-up, /app; preserve /auth/callback, API and showcase
URLs. Keep runtime auth/search-param reads inside Suspense. Current grants remain inside services.
No pricing, endorsements, payments, new auth policy, provisioning or deployment.

**Scale/Scope**: Four user-facing routes; two locales × three theme choices; one preference
endpoint and one existing personal-profile slice. No load/seat/availability commitment.

## Constitution Check

Gate review is against constitution v1.0.0. PASS below means the design complies; it does not
mark implementation or production controls passed.

| Principle                           | Before research | After Phase 1 design | Design evidence                                                                                                    |
| ----------------------------------- | --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| I. Selected stack/simple boundaries | PASS            | PASS                 | Reuse stack and profile service; finite presentation roots; user-selected next-intl; no new schema/service         |
| II. Server authority/privacy        | PASS            | PASS                 | Fresh service checks, callback isolation, fixed destinations, bounded preference input, private no-store responses |
| III. Exact history/recovery         | PASS            | PASS                 | No financial writes or schema migration; only synthetic previews; no old command replay                            |
| IV. Shared bilingual accessible UI  | PASS            | PASS                 | Shared tokens/primitives; SSR locale/theme, native disclosure, specified accessibility/RTL matrix                  |
| V. Evidence before completion       | PASS            | PASS                 | Planned tests and explicit live-service/advisory/accessibility gaps; no production-readiness claim                 |

No unjustified governance violation or unresolved design choice remains. Existing release gaps
are tracked below and in current security findings, rather than silently waived.

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-auth-pages/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── assets/landing-reference.png
├── checklists/requirements.md
└── contracts/ui-and-navigation.md
```

tasks.md is intentionally not generated by this command.

### Source Code (repository root)

Planned layout, not files created during planning:

```text
app/
├── globals.css                         # Paired tokens, System media rules, finite radii
├── actions.ts                          # Preserve profile authorization; localizable error codes
├── icon.png                            # Preserve existing metadata asset
├── (site)/[locale]/[theme]/
│   ├── layout.tsx                      # Site root: six static parameter pairs, html lang/dir/theme
│   ├── page.tsx                        # Public landing; no account dependency
│   ├── sign-in/page.tsx                # Request-time account entry behind Suspense
│   ├── sign-up/page.tsx
│   └── app/page.tsx                    # Existing profile moved from home
├── (utility)/
│   ├── layout.tsx                      # Static root for existing utility URLs
│   ├── auth/callback/page.tsx          # Existing verifier destination, then fresh-session /app
│   └── design-system/page.tsx          # Existing showcase moved without URL change
└── api/
    ├── preferences/route.ts            # Small same-origin native POST/303 handler
    ├── auth/[...path]/route.ts          # Preserve SDK
    └── profile/route.ts                # Preserve policy; narrow expiry projection
components/
├── landing-page.tsx                    # Server composition and synthetic HTML/CSS previews
├── site-header.tsx                     # Small native disclosure enhancement; preferences form
├── sign-in.tsx                         # Existing provider control with explicit entry enum/copy
├── live-profile.tsx                    # Existing view plus current-authority conceal/clear lifecycle
└── ui/button.tsx                       # Shared large action sizing; keep compact sizes
lib/
├── site.ts                             # Pure preference/path/error allowlists, no auth imports
├── site-content.ts                     # Fixed synthetic preview facts, not a translation engine
├── profile.ts                          # Existing server boundary and session-bound expiry
└── auth/                               # Existing adapters; no auth implementation replacement
i18n/request.ts                         # next-intl getRequestConfig using validated root locale
messages/{en,ar}.json                    # next-intl ICU catalogs with matching key shape
types/next-intl.d.ts                     # AppConfig Locale/Messages augmentation
next.config.ts                          # createNextIntlPlugin; preserve existing rendering flags
package.json / package-lock.json        # Reviewed exact next-intl dependency
proxy.ts                                # Callback SDK branch; separate canonical presentation rewrites
scripts/
├── test-site.test.mjs                   # Node tests importing pure lib/site.ts
├── test-site-http.mjs                   # Local-only HTTP assertions
└── test-neon.mjs                        # Existing integration caller updated; isolated opt-in
```

**Structure Decision**: Keep one app and its existing service boundaries. Move current root
layout/page into the appropriate roots rather than leaving a higher root that cannot observe
locale/theme parameters. Six variants are necessary to render initial language/theme with the
existing Cache Components configuration; they are not public route choices or tenant authority.
The utility root keeps callback/showcase addresses intact. Actions/API modules stay in place.

Use next-intl's getRequestConfig in i18n/request.ts, resolving an explicit supported locale or
validated next/root-params locale without reading request cookies/headers. Select messages through
fixed en/ar loaders. Server Components use getTranslations/useTranslations; client islands receive
only their required namespaces through NextIntlClientProvider. Utility code outside the locale
root uses an explicit supported locale when it needs translations. Actions return stable codes;
Route Handlers must not call root-parameter getters. Keep the existing custom canonical rewrites
and preference cookie contract; do not add a second locale middleware or NEXT_LOCALE store.

## Phase 0 — Research Decisions

[research.md](research.md) resolves the installed framework, preference rendering, callback/error,
stale-view, shared UI and testing choices. Research agents read existing auth and UI boundaries;
no remote mutation or production test was executed.

Use ordinary canonical links for full document navigation at account boundaries. Preferences
submit a native form so updated cookies select a fresh presentation shell without client bootstrap
or stale prefetch state. Proxy must not initialize auth for marketing requests. Deny direct internal
aliases; do not rely on hidden paths as a security control.

## Phase 1 — Design and Contracts

- [data-model.md](data-model.md) defines preference enums/cookies, transient account attempt and
  private-view states, and the existing profile envelope with session expiry.
- [ui-and-navigation.md](contracts/ui-and-navigation.md) defines routes, rewrite boundaries,
  preference validation/statuses, callback/error behavior, surface brief and FR traceability.
- [quickstart.md](quickstart.md) defines runnable checks after implementation, isolated account
  tests and the complete browser/accessibility/comprehension evidence matrix.

Implementation sequence for the later task breakdown:

1. Configure next-intl, en/ar ICU catalogs, pure allowlists and focused Node tests. Move roots
   and establish the six
   presentation shells/canonical rewrites while preserving callback/API/showcase URLs.
2. Implement paired semantic tokens, shared large action sizing, native preferences and the
   landing composition. Use the supplied monochrome Light/Dark theme, Geist/Geist Mono and
   system fallbacks; preserve the existing Next.js font variables across both root layouts.
3. Adapt the existing provider control to a bounded entry enum and localized copy. Preserve
   verifier exchange, normalize error returns and route successful/current accounts to /app.
4. Move/reuse the profile, add expiry/current-authority concealment and update every affected
   test caller. Use localizable profile error codes in the existing action result shape;
   update LiveProfile and integration assertions together without weakening negative cases.
5. Execute the quickstart, update affected current docs and record actual evidence/gaps.

The user-supplied monochrome theme is already applied to shared CSS and the showcase.
Landing routes, System preference and next-intl integration remain planned. Shared token/Button
changes reach all users of those primitives. Review /design-system and
the existing profile forms for regressions; do not rewrite the showcase. During implementation
update docs/README.md, docs/development/setup.md, docs/development/neon-setup.md and affected
design/security findings to reflect final routes, presentation behavior and observed results.

## Security and Evidence Ownership

| Controls                    | Planned owner/reviewer                                 | Concrete verification                                                                                                         |
| --------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| SEC-002/004/005/006/007     | Auth implementer + security reviewer                   | Cookie/session/provider return; cancellation; same-origin preference POST; expiry/revoke/history; generic errors              |
| SEC-009/011/012/014/017     | Auth implementer + QA                                  | Current-identity direct reads/actions/live scope; cross-account denial; query parameters; no private public projection        |
| SEC-023/025/027/029/030/063 | Web implementer + security reviewer                    | Bounded/duplicate preference fields; no unsafe content sinks; trusted ingress/origin; fixed return paths and bounded requests |
| SEC-028/031/044             | Web/auth implementer + QA                              | No-store final responses/prefetch; no tokens/private records in previews/preferences/logs; protected DOM clears               |
| SEC-032/041/047/049–051/055 | Release owner + security reviewer                      | Actual ingress headers/TLS; restricted role; isolated test credentials; fresh lock/runtime advisory/build identity            |
| NFR-006/007/015/016         | UI implementer + fluent Arabic/accessibility reviewers | Six presentation variants; semantic reuse; keyboard/screen-reader/contrast/zoom/reflow evidence                               |

Role assignments identify responsibilities, not completed sign-offs; record accountable people
with implementation/release evidence. Select applicable versioned ASVS checks when producing
the security test record. Financial postings, browser drafts and file uploads are not introduced;
their disabled state must remain explicit.

Release gaps remain: current production-targeting fixture setup, privileged DB role, Google's
shared development keys, GitHub complete provider-return evidence, managed-auth version/advisory
attestation, fresh dependency triage and full bilingual/accessibility evidence. The shadcn CLI
registry lookup failed during research; do not report it as verified upstream context.
No dependency/advisory, browser, OAuth or DB execution result is claimed by this plan.

## Complexity Tracking

No constitution exception is required. No generic repository, auth wrapper framework,
theme library or i18n framework beyond user-selected next-intl, custom chart engine, migration
or new worker is planned.
The one preference handler and finite route roots address required initial presentation under
the current rendering rules; smaller client-only/root-cookie alternatives fail those constraints.
