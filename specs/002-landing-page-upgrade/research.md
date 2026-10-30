# Research: Detailed Public Landing Page Upgrade

**Date**: 2026-10-30 | **Feature**: [spec.md](spec.md)

Research evaluated the Next.js 16.4.3 App Router runtime, installed Base UI 1.9.0 / shadcn components,
`next-intl` integration, accessible HTML5 patterns, server security controls for public contact input,
and bilingual RTL layout requirements.

---

## 1. Landing Page Architecture and Progressive Interactivity

**Decision**:
Keep the landing page as an `async` React Server Component (`components/landing-page.tsx`) that renders
pure HTML/CSS for all content sections, combined with small, isolated Client Component islands only where
real-time browser state is required:

1. `SiteHeader`: enhanced with a scroll observer for sticky positioning and active section indication.
2. `ProductTour`: interactive tabbed capability selector with accessible keyboard navigation (arrow keys,
   roving tabindex, `role="tablist"` / `role="tab"` / `role="tabpanel"`).
3. `ContactForm`: progressively enhanced form that uses native POST to `/api/contact` or a Server Action,
   enabling inline validation and status updates when JavaScript is enabled while maintaining standard form
   submission if JavaScript is disabled.
4. `FaqAccordion`: implemented using standard HTML5 `<details>` and `<summary>` elements styled with semantic
   Tailwind tokens.

**Rationale**:

- **Zero JS Fallback (FR-021)**: `<details>` and `<summary>` are natively interactive and accessible without
  any JavaScript runtime. Every FAQ question and answer is readable in all browsers, search engines, and
  assistive technologies even if scripts are blocked or fail to load.
- **Performance (SC-007)**: Keeping marketing text, capability cards, roadmap, principles, and synthetic
  previews server-rendered avoids client hydration overhead and ensures instant First Contentful Paint (FCP)
  and Largest Contentful Paint (LCP).
- **Reduced Motion**: Native elements and CSS-driven reveals respect `prefers-reduced-motion: reduce` directly
  without requiring heavy JavaScript animation libraries.

**Alternatives Considered**:

- _Client-side accordion library (Radix/Base UI Accordion)_: Requires client JavaScript hydration for all FAQ
  items; if JavaScript fails or is disabled, content could be hidden or inaccessible. Rejected in favor of
  native semantic `<details>` with progressive enhancement.
- _Single massive client component_: Converting `landing-page.tsx` into a client component would bloat the
  client bundle, degrade Core Web Vitals, and expose translation catalogs unnecessarily. Rejected.

---

## 2. Shared Single Source of Truth for Capability Statuses

**Decision**:
Centralize all capability areas, feature items, roadmap columns, and journey steps in `lib/site-content.ts`.
Each capability is assigned a strict status enum: `"available" | "inDevelopment" | "planned"`.
The Product Tour, Detailed Features Grid, How it Works steps, and Roadmap section all read from this single
typed module.

**Rationale**:

- **Consistency (FR-010, SC-003)**: Prevents discrepancies where a feature is marked "In development" in the
  tour but "Available" on the roadmap.
- **Decoupled from Translations**: `lib/site-content.ts` defines structural data (identifiers, icons, statuses,
  metric fixtures) while localized text (titles, descriptions, details) is loaded from `messages/{en,ar}.json`
  using namespaced keys.

**Alternatives Considered**:

- _Hardcoding status in each component template_: High risk of synchronization drift between the tour, feature
  grid, and roadmap. Rejected.
- _Database-backed public capability catalog_: Violates Principle I (smallest complete change; adds unnecessary
  database queries to public marketing views). Rejected.

---

## 3. Contact Form Architecture, Abuse Protection and Privacy

**Decision**:
Implement the contact form as a secure public boundary:

1. **Endpoint**: Route Handler `POST /api/contact` with support for both JSON and native `application/x-www-form-urlencoded`
   form submissions.
2. **Input Validation**: Strict schema validation in `lib/contact.ts`:
   - `name`: String, 1–100 characters, trimmed, control characters stripped.
   - `email`: String, valid RFC 5322 format, 5–254 characters, lowercase.
   - `topic`: Enum allowlist: `"general" | "team" | "billing" | "security" | "feedback"`.
   - `message`: String, 10–2000 characters, trimmed, plain text only.
   - `consent`: Boolean, strictly `true` (unticked by default on the client).
3. **Anti-Abuse Protections (FR-013b)**:
   - _Honeypot field_: An invisible field (`website_url` / `company_fax`) that human users do not see; if
     populated, the submission is rejected without revealing the honeypot mechanism.
   - _Timestamp validation_: A signed or time-encoded token generated at render time. Submissions completed in
     under 3.0 seconds (bot speed) or over 1 hour (expired) are rejected.
   - _Service-level Rate Limiting_: In-memory sliding-window limiter (or IP-keyed token bucket) capping
     submissions to 3 per 10 minutes per client IP. Returns HTTP 429 (`Too Many Requests`) with a localized,
     calm retry message.
   - _CSRF / Origin Check_: Verifies `Sec-Fetch-Site: same-origin` or matching `Origin`/`Referer` headers.
4. **Data Handling & Gating (FR-013c, FR-013d, FR-013e, Decision Register Gating)**:
   - _Feature Gate_: Controlled by `SOLODESK_CONTACT_ENABLED=true` and `SOLODESK_CONTACT_RECIPIENT_EMAIL`. If
     unconfigured or disabled, the endpoint returns an honest "temporarily unavailable" error (`serviceUnavailable`)
     and accepts no messages.
   - _Operational Privacy_: Operational logs record only `{ event: "contact_submission", status: "accepted"|"rejected", topic, ip_hash }`.
     Message text and plain email addresses are **never** written to operational logs, server stdout, or client responses.
   - _No Automated User Email_: No confirmation or autoreply email is sent to the submitter's address (prevents
     email reflection/spam relay attacks).
   - _Storage / Dispatch_: When enabled, dispatches to the owner's configured recipient via server adapter or
     isolated internal table, treating input as plain text.

**Rationale**:
Satisfies Constitution Principle II (Server Authority, Tenant Isolation, Privacy) and Security Controls
SEC-023 (input validation), SEC-027 (origin validation), SEC-029 (rate limiting), SEC-030 (privacy in logs),
and SEC-063 (abuse prevention).

**Alternatives Considered**:

- _Third-party forms service (Formspree/Typeform)_: Introduces third-party data tracking, cookies, and privacy
  leaks, violating SoloDesk privacy commitments. Rejected.
- _Google reCAPTCHA / Cloudflare Turnstile_: Adds external tracking scripts, third-party network dependencies,
  and potential accessibility barriers. Rejected in favor of cryptographic time tokens, honeypots, and IP rate
  limiting.

---

## 4. Sticky Header and Active Section Navigation

**Decision**:
Upgrade `components/site-header.tsx` with a lightweight client enhancement:

- Observes semantic page sections (`#hero`, `#tour`, `#features`, `#how-it-works`, `#why-solodesk`, `#security`,
  `#audience`, `#roadmap`, `#faq`, `#contact`) via `IntersectionObserver`.
- Applies a subtle backdrop blur and border when the page is scrolled past the hero (`scrollY > 32px`).
- Highlights the active section link with `aria-current="true"` and accessible visual styling.
- Retains instant keyboard accessibility: skip-to-content link remains first in DOM order.

**Rationale**:
Improves user orientation on a substantially longer single-page layout without layout shift or jank.

**Alternatives Considered**:

- _Scroll event listener with `getBoundingClientRect`_: Causes frequent layout reflows and poor mobile frame
  rates. `IntersectionObserver` is native, decoupled from the main thread, and highly performant.

---

## 5. Bilingual Layout (English/Arabic RTL) & Typographic Rigor

**Decision**:

- Follow SoloDesk typography standards: `Rugis` for English headings, `Sahabah` for Arabic headings, `Geist`
  for body text, and `Geist Mono` for technical labels and numbers.
- Use logical CSS properties throughout all new sections:
  - `ms-*` / `me-*` for inline margins.
  - `ps-*` / `pe-*` for inline padding.
  - `border-s-*` / `border-e-*` for lateral borders.
  - `start-0` / `end-0` for absolute positions.
  - `text-start` / `text-end` for alignment.
- Wrap all amounts, metrics, currency codes, and model names in `<bdi>` (bidirectional isolation) to prevent
  punctuation flip in Arabic contexts.

**Rationale**:
Constitution Principle IV mandates equivalent, accessible English and Arabic experiences with full RTL support
from the first usable release.
