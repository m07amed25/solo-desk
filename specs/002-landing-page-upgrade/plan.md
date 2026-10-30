# Implementation Plan: Detailed Public Landing Page Upgrade

**Branch**: `002-landing-page-upgrade` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-landing-page-upgrade/spec.md`.

Setup resolved this feature through `.specify/feature.json`. Current Git branch is `feat/001-landing-auth-pages`;
no git branch hook was executed.

---

## Summary

Upgrade the SoloDesk public home page from a basic preview into a comprehensive, high-converting, and
deeply informative single-page presentation. The upgraded page introduces an interactive 5-domain product
tour, an 8-item detailed technical feature grid, a 4-step workflow journey, a 4-principle "Why SoloDesk"
section, a plain-language privacy and security commitment section, 3 audience profiles, an honest roadmap,
an accessible native FAQ accordion, and an isolated, abuse-protected visitor contact form.

The technical implementation adheres strictly to Server-First architecture: the majority of marketing content
is rendered as pure HTML/CSS via Server Components, preserving instant FCP/LCP and ensuring all text and FAQ
answers remain 100% accessible with JavaScript disabled (FR-021). Small, focused client islands provide
progressive enhancement for the interactive capability tour tabs, active sticky header indicator, and the
contact form. All capability statuses are bound to a single source of truth in `lib/site-content.ts`. The
contact endpoint (`POST /api/contact`) enforces strict validation, honeypot and timestamp bot defense, IP
rate limiting, zero operational log leaks, and stays gated under owner decision policies.

---

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict), React 19.3.0, Node 24.21.0.

**Primary Dependencies**: Next.js 16.4.3 App Router with Cache Components and partial prefetching;
Tailwind CSS 4.3.3, Base UI 1.9.0 / shadcn primitives, Lucide React icons, and `next-intl` (installed
and configured). Zero new runtime packages required.

**Storage**: Public marketing and status data originates statically from `lib/site-content.ts` and
`messages/{en,ar}.json`. The contact form dispatches to owner mailbox or internal sink; no multi-tenant
database changes or auth schema migrations.

**Testing**: Strict TypeScript compilation (`tsc --noEmit`), ESLint, Node built-in assertions for translation
key parity and pure validator logic, local `curl` assertions for `/api/contact` rate limiting and abuse defense,
and manual browser validation matrix across desktop, tablet, and mobile (320px reflow, 200% zoom, RTL).

**Target Platform**: Responsive web browsers (desktop, tablet, mobile). Primary targets: Chromium, Firefox,
WebKit; full support for 320 CSS-pixel reflow, 200% zoom, screen readers, and `prefers-reduced-motion`.

**Project Type**: Next.js modular web application (App Router).

**Performance Goals**: Public first render performs zero database calls. Target p75 LCP ≤ 2.5s, INP ≤ 200ms,
CLS ≤ 0.1 on mobile connections. Zero layout shift when expanding native `<details>` accordions.

**Constraints**: Single-page architecture (`/` with `#hash` anchors). No pricing tiers or trial promises.
No third-party trackers, external fonts, or intrusive captcha scripts. Contact form strictly gated by
`SOLODESK_CONTACT_ENABLED`.

**Scale/Scope**: 1 user-facing public route (`/`) with 12 distinct content sections; 2 locales (`en`, `ar`) ×
3 theme options (`dark`, `light`, `system`); 1 public API endpoint (`POST /api/contact`).

---

## Constitution Check

*GATE: Checked against SoloDesk Constitution v1.0.0.*

| Principle                           | Before Research | After Phase 1 Design | Design Evidence & Implementation Boundary                                                                    |
| ----------------------------------- | --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **I. Selected Stack & Boundaries**  | PASS            | PASS                 | Uses Next.js App Router, shadcn/Base UI, semantic tokens, `next-intl`. Zero new runtime packages.           |
| **II. Server Authority & Privacy**  | PASS            | PASS                 | Contact endpoint validates untrusted input, sanitizes operational logs, and stays gated under owner policy. |
| **III. Exact History & Recovery**   | PASS            | PASS                 | No financial mutations or schema migrations; synthetic preview numbers strictly isolated with `<bdi>`.     |
| **IV. Bilingual Accessible UI**     | PASS            | PASS                 | Complete English/Arabic parity, logical CSS (`ms-`/`me-`), native `<details>` for zero-JS FAQ access.        |
| **V. Evidence Before Completion**   | PASS            | PASS                 | Quickstart scenarios define concrete runnable assertions for lint, types, parity, curl, and viewports.       |

All gates pass without violation or exception.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-landing-page-upgrade/
├── spec.md                             # Approved specification with resolved clarifications
├── plan.md                             # This implementation plan
├── research.md                         # Phase 0 research decisions and rationale
├── data-model.md                       # Phase 1 presentation and contact entity models
├── quickstart.md                       # Phase 1 runnable test scenarios and manual matrix
├── checklists/
│   └── requirements.md                 # Validation checklist (100% complete)
└── contracts/
    └── landing-and-contact.md          # Interface, section anchors, and /api/contact API contract
```

### Source Code (repository root)

```text
app/
├── (site)/[locale]/[theme]/
│   └── page.tsx                        # Public landing page entrypoint
├── api/
│   └── contact/
│       └── route.ts                    # Contact submission Route Handler (POST)
components/
├── landing-page.tsx                    # Main Server Component composing all 12 sections
├── site-header.tsx                     # Enhanced with sticky scroll observer and active section links
├── product-tour.tsx                    # Client component for keyboard-accessible capability tabs
├── contact-form.tsx                    # Progressively enhanced contact form component
├── ui/                                 # Shared Base UI / shadcn components (Card, Button, Input, etc.)
lib/
├── site-content.ts                     # Single source of truth for capabilities, statuses, and previews
├── contact.ts                          # Strict contact input schema validation and rate-limiting logic
messages/
├── en.json                             # English copy catalog under "Landing" namespace
└── ar.json                             # Arabic copy catalog with matching key structure
```

**Structure Decision**:
Keep the monolithic page structure within `components/landing-page.tsx` for optimal server rendering and
code readability. Break out only interactive islands (`product-tour.tsx`, `contact-form.tsx`) into dedicated
client components. Keep `lib/site-content.ts` as the sole typed data dictionary for capability metadata.

---

## Phase 0 — Research Decisions

[research.md](research.md) resolves all architectural choices:
1. **Zero-JS Resilience**: Native `<details>` and `<summary>` for the FAQ ensure complete readability even
   if client scripts fail.
2. **Single Status Source**: All capability availability badges are derived strictly from `lib/site-content.ts`.
3. **Anti-Abuse Architecture**: Contact form combines honeypot detection, signed render timestamp tokens, and
   IP-keyed sliding-window rate limiting (3 requests / 10 minutes) without using tracking captchas.
4. **Log Privacy**: Operational logging explicitly excludes message text and plain email addresses.

---

## Phase 1 — Design and Contracts

- [data-model.md](data-model.md) defines presentation models (`CapabilityArea`, `FeatureItem`, `JourneyStep`,
  `ProductPrinciple`, `FaqItem`) and the lifecycle of the `ContactMessage` entity.
- [contracts/landing-and-contact.md](contracts/landing-and-contact.md) formalizes section anchor registries,
  the `POST /api/contact` JSON/form-encoded schemas, error payloads, and the i18n key structure.
- [quickstart.md](quickstart.md) provides automated CLI checks (typecheck, translation parity script, curl
  payloads) and step-by-step browser accessibility testing procedures.

---

## Security and Evidence Ownership

| Control ID | Planned Implementation & Reviewer            | Concrete Verification Method                                                    |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| **SEC-023**| Input validation (`lib/contact.ts`)          | Unit test schema with boundary strings (>100 char name, invalid emails, empty)  |
| **SEC-025**| Output encoding (React JSX)                  | Verify no raw HTML rendering or unescaped user string injection                 |
| **SEC-027**| Origin validation (`/api/contact`)           | Assert `Sec-Fetch-Site: same-origin` rejection on cross-origin POST             |
| **SEC-029**| Rate limiting (`lib/contact.ts`)             | Curl loop testing 4 requests from same IP; 4th must return HTTP 429             |
| **SEC-030**| Log sanitation (operational logger)          | Audit stdout/logs during submission; confirm email and message body are absent  |
| **SEC-063**| Honeypot & bot defense (`/api/contact`)      | Curl test submitting populated `website_url` field; confirm silent rejection    |
| **NFR-006**| Bilingual layout & RTL (Arabic reviewers)    | Manual review of `dir="rtl"`, Sahabah heading font, and `<bdi>` isolation      |
| **NFR-015**| Accessibility & contrast (A11y reviewers)    | Keyboard tab-order test, screen reader label audit, and WCAG AA contrast check  |

---

## Complexity Tracking

| Issue / Potential Complexity | Why Needed                                                   | Simpler Alternative Rejected Because                                     |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Dedicated `/api/contact` API | Provides secure server boundary for visitor message dispatch | Direct client submission to third-party form leaks visitor data.         |
| Honeypot + Timestamp Token   | Defends against automated bots without user friction         | Google/Cloudflare CAPTCHA adds external trackers and a11y hurdles.       |
| Shared Status Dictionary     | Ensures roadmap, tour, and feature grids never contradict    | Inline hardcoded badges lead to synchronization errors across sections.  |
