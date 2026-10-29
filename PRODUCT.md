# SoloDesk product scope

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Freelance software engineers, independent technical consultants, and small boutique software teams managing multiple client contracts, billable hours, and project deliveries.

## Product Purpose

Eliminate administrative overhead and billing drag for independent technical operators. SoloDesk combines client relationship tracking, recoverable timer workflows, project milestone management, and compliant multi-currency invoicing into a single, cohesive web operating system.

## Positioning

The craft-focused, privacy-first operating system for solo devs and boutique engineering agencies: fast, recoverable time & invoice tracking with zero bloat, deterministic reliability, and mathematical precision.

## Operating Context

- Used alongside code editors, terminals, and communication tools during billable work sessions.
- Browser-based across desktop (wide displays), laptops, and mobile/tablet devices for on-the-go review.
- Rapid keyboard-driven workflows (command palette, shortcuts) for tracking time without disrupting engineering focus.
- Multilingual environments requiring simultaneous support for English and Arabic (RTL).

## Capabilities and Constraints

- **Capabilities**: Client & lead pipeline, project & task boards, recoverable time tracking with honest network sync, customizable invoice generation with tax/discount calculations, client payment tracking, and financial analytics.
- **Constraints**:
  - Web platform built on Next.js App Router, shadcn/ui, Neon PostgreSQL, and Better Auth.
  - Server-authoritative for identity, tenant boundaries, finalized billing, and immutable invoices.
  - No native desktop wrappers or invasive background tracking; drafts use audited browser storage within quota boundaries.
  - Strictly no speculative AI gimmicks, no employee surveillance tools, and no raw credit card storage.

## Brand Commitments

- **Visual Identity**: User-selected monochrome Light/Dark theme with black/white actions, neutral surfaces, Rugis for English headings, Sahabah for Arabic headings, Geist body text and Geist Mono for code/data, an 8px base radius and compact soft shadows. Amber/blue are chart colors; semantic tokens in `app/globals.css` and `DESIGN.md` replace the earlier mint/emerald direction.
- **Voice & Tone**: Precise, understated, technical, and confident. Built for developers who value performance and craftsmanship.

## Evidence on Hand

- Architectural specifications and security catalogue in `docs/architecture/` and `docs/security/`.
- Concrete roadmap separating core pilot from extended connected slices in `docs/planning/roadmap.md`.
- Token specification in `docs/design/tokens.json`.

## Product Principles

1. **Mathematical & Financial Exactness**: Invoices, tax rates, currency rounding, and billable time entries are strictly immutable once issued and mathematically validated.
2. **Speed & Low Cognitive Load**: Interactions feel instant, workflows are keyboard-accessible, and information hierarchy is calm and scannable.
3. **Resilient & Transparent State**: The user always knows whether changes are locally buffered or server-acknowledged. No silent data loss.
4. **Tenant Security & Data Sovereignty**: Strict multi-tenant isolation at every database and service boundary, server-only secret custody, and zero untrusted data leaks.

## Accessibility & Inclusion

- Compliance with WCAG 2.2 Level AA.
- Full native keyboard navigation across all interactive tables, sheets, and dialogs.
- First-class Arabic (RTL) localization with logical CSS geometry and isolated mixed-language identifiers.
- Complete support for user motion preferences (`prefers-reduced-motion`) and system contrast modes.
