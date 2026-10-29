# SoloDesk product scope

Updated 29 October 2026. SoloDesk is a responsive **website** for freelance software engineers and small teams. Next.js App Router is the current application foundation. The current checkout is a starter, not an implemented business platform.

## Binding priorities

shadcn/ui is the primary component foundation. A coherent, accessible design system, scalability, security and appropriate design patterns are primary engineering requirements. Neon PostgreSQL is the selected database; Better Auth is the selected authentication/session system. These choices replace the earlier desktop runtime and backend recommendations. [Decisions](docs/planning/decisions.md) records the change and remaining gates.

## Product capabilities

Plan clients and sales, projects and tasks, recoverable time tracking, configurable invoices/payments/corrections, reports and knowledge. Later slices add approved provider integrations, deterministic automation and a client portal within the website. Preserve exact financial arithmetic, immutable issued records, permission-scoped sharing and recoverable operations.

Freelancers and small teams use required cloud accounts and isolated workspaces. English and Arabic, full RTL, light/dark/System themes, keyboard access and responsive phone/tablet/wide-screen layouts apply to each release. The existing visual proposal remains a proposal until applied and verified through shared shadcn/ui components.

## Connectivity and trust

Server authority governs identity, memberships, accepted revisions, billing and external effects. Invoice finalization is online only. Retain the offline-drafting goal for eligible work, but adapt it to reviewed browser storage, quotas, eviction and explicit key/recovery limits; no native secret store or installed-app background process is assumed. Protected persistent drafts stay disabled until their security proof passes. A release claiming offline drafting must satisfy that gate; ordinary in-memory input is not durable storage.

## Scope boundaries

No AI product features, native installers, native mobile app, employee surveillance, unrestricted scripts, raw-card collection, automatic legal/tax certification or first-release self-hosted edition. Website hosting, private object storage, email delivery, regions, costs, recovery objectives and financial jurisdiction profiles still require selection. Neon is the database choice; Better Auth is the identity choice, not automatic workspace authorization.

The [roadmap](docs/planning/roadmap.md) separates a core pilot from advanced and connected slices. Documentation is a specification, not evidence that a capability is implemented. Historical desktop records remain labeled as superseded.
