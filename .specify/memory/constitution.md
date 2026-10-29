<!--
Sync Impact Report — temporary review material; remove before committing.
Version change: unratified scaffold → 1.0.0 (initial adoption).
Modified principles:
- PRINCIPLE_1_NAME → I. Selected Stack and Simple, Scalable Boundaries
- PRINCIPLE_2_NAME → II. Server Authority, Tenant Isolation and Privacy
- PRINCIPLE_3_NAME → III. Exact Financial History and Recoverable Effects
- PRINCIPLE_4_NAME → IV. Shared, Accessible English and Arabic Experiences
- PRINCIPLE_5_NAME → V. Evidence Before Completion and Release
Added sections: Product and Operational Constraints; Development Workflow and Quality Gates;
completed Governance.
Removed sections: none; scaffold examples replaced.
Deferred TODOs: none. Existing Q-01–Q-16 decisions remain owned gates in the decision register.
Sync scope: constitution only; dependent templates and commands remain unchanged and read it
at runtime.
-->

# SoloDesk Constitution

## Core Principles

### I. Selected Stack and Simple, Scalable Boundaries

SoloDesk MUST remain a responsive Next.js App Router website using React, shadcn/ui as the
primary component foundation, shared semantic Tailwind tokens, Neon PostgreSQL and Better Auth.
The existing account slice uses Neon Managed Better Auth; its presence MUST NOT be treated as
completed workspace authorization or business functionality. Stack changes require an explicit
owner decision and a constitution amendment where these commitments change.

Implementation MUST start with the smallest complete change in the modular monolith.
Routes and Server Actions MUST delegate protected operations to authorized application services;
Server Components MUST use the same authorized read boundaries. Domain rules MUST remain
independent of UI, framework and database drivers. Server-only data access and provider adapters
MUST own their respective trust boundaries.

Reuse existing components, helpers and platform capabilities before adding dependencies or
abstractions. Every feature MUST identify module ownership, affected callers/contracts,
transaction boundaries, query and batch limits, index needs, and job/recovery behavior.
Use pooled Neon runtime access without leaking tenant state across requests; bound slow work
through durable jobs. Performance and capacity claims MUST use measured fixtures and budgets.
Additional services, generic repositories or other layers require a concrete need that simpler
modules cannot satisfy.

### II. Server Authority, Tenant Isolation and Privacy

Every protected service entry point MUST validate untrusted input, derive identity from a
trusted Better Auth session and enforce current workspace, resource, field and action grants.
Deny by default, scope reads/counts/search/files/exports/notifications as well as writes, and
recheck authority at commit or external-effect boundaries. Layouts, proxy redirects, hidden
controls and client-supplied actor/role/workspace claims MUST NOT substitute for authorization.
Portal access MUST expose only explicitly published versions and permitted actions.

Database/auth/provider secrets MUST remain server-only and absent from public configuration,
client props, browser stores, logs and exported artifacts. Queries MUST be parameterized;
returned fields MUST be allowlisted. Session expiry/revocation, trusted origins, redirects,
cookies, CSRF protection for auth and custom mutations, private-cache isolation, content/file
validation and shared rate limits MUST be verified on affected paths. Database constraints and
reviewed row policies supplement application authorization; pooled connections MUST NOT carry
another tenant's authority.

Transport, server storage and backups MUST use reviewed encryption and key custody. Collect
minimal redacted operational data; product analytics and crash uploads MUST be opt-in. Support
access MUST be temporary, scoped, purpose-bound and audited. Security implementation and release
review MUST follow the applicable controls in the
[security catalogue](../../docs/security/vulnerability-catalogue.md) and the
[security release gate](../../docs/security/release-checklist.md).

### III. Exact Financial History and Recoverable Effects

Authoritative time MUST preserve integer source seconds. Monetary records MUST carry currency;
posted amounts MUST use exact minor units with versioned currency precision, and quantities,
rates and intermediate calculations MUST use exact decimal or rational representations.
Binary floating-point, assumed two-decimal currencies and rounded display hours MUST NOT
determine authoritative amounts. Server code MUST recompute totals and validate source
ownership, revisions, precision and bounds under approved calculation policies.

Final financial issuance/posting MUST require online server authority. Issuance MUST atomically
commit its number, immutable document snapshot, source allocations, operation receipt, audit
and applicable outbox entries in PostgreSQL. Stable operation IDs, payload digests and database
uniqueness MUST make duplicate/retried commands return one effect; changed intent under an
existing ID MUST be rejected. Numbers MUST NOT be recycled, sources/credit MUST NOT be consumed
twice, and unlike currencies MUST NOT be silently summed.

Issued documents and posted settlements MUST retain history through linked corrections or
compensating events; silent edits, deletion and last-write-wins financial merging are forbidden.
External work MUST execute after commit through bounded, leased, deduplicated jobs with current
authority and verified callbacks. Unknown commit/provider outcomes MUST be reconciled before
retry. Restore and migration procedures MUST preserve accepted data, reconcile later external
effects and invalidate restored auth material before reopening access.

### IV. Shared, Accessible English and Arabic Experiences

Website and portal UI MUST reuse the shared shadcn/ui primitives, semantic tokens, variants and
business composites governed by [DESIGN.md](../../DESIGN.md) and the
[design documentation](../../docs/design/README.md). Screen-specific styling MUST NOT introduce
a competing component or token system. Changes MUST preserve accessible component semantics.

The first usable release MUST provide equivalent English and Arabic workflows with full RTL,
responsive phone/tablet/wide-screen layouts and light/dark/System behavior. Use logical layout
properties, bidirectional isolation and locale-aware display/input without altering canonical
identifiers, dates or amounts. Customer document locale and issued content MUST remain frozen.
Shipped strings, errors, emails and generated documents MUST be covered; Arabic shaping and
mixed-direction content require fixtures and fluent review.

Accessibility MUST target WCAG 2.2 AA through keyboard/focus, screen-reader, contrast, reduced
motion, touch, zoom and 320 CSS-pixel reflow verification. Drag, hover and shortcuts MUST have
accessible alternatives. Editors MUST distinguish unsaved input, eligible browser saves,
pending submission, server acceptance, conflict, rejection and unknown outcomes. Failures MUST
preserve valid input and name a recovery action; no UI may invent durable-save success.

### V. Evidence Before Completion and Release

A plan, installed skill, checklist, screenshot or historical QA record MUST NOT count as current
implementation or release proof. Claims MUST identify the actual source/build, environment,
fixture/policy versions, commands, observed results, artifacts and limitations. Failed,
unavailable, skipped and stale checks MUST remain explicit gaps rather than clean results.

Verification MUST match the changed behavior: exact domain/state fixtures; real PostgreSQL
transaction, constraint, concurrency and pool-isolation tests; direct auth/API/action denial
cases; and actual browser journeys for UI, RTL, accessibility and enabled drafts.
An in-memory database MUST NOT substitute for required PostgreSQL evidence, and automated
accessibility checks MUST NOT substitute for required manual review.

Dependency changes and releases MUST match actual lockfile and deployed versions against fresh
vendor/advisory evidence, including transitive, bundled and build tooling exposure. Relevant
SEC controls MUST have owners and concrete tests. Releases MUST stop for the blocking defects
defined in the security gate, including auth/tenant bypass, exposed secrets, unauthorized or
duplicate financial effects, unsafe sensitive persistence and irrecoverable data loss.
Any permitted exception MUST follow that gate's mitigation, owner, expiry and retest rules.

## Product and Operational Constraints

- SoloDesk serves freelancers and small teams from the first usable release, with required
  cloud accounts and workspace/team foundations. Clients, work, time, finance, insights and
  deterministic integrations follow the current domain specifications and phased roadmap.
- AI product features, native desktop/mobile applications, employee surveillance, raw-card
  collection, unrestricted scripts/plugins, complete general-ledger/payroll functionality,
  automatic legal/tax compliance and unrestricted offline financial finalization are excluded.
- Neon holds accepted authority. Protected persistent browser drafts MUST remain disabled until
  Q-06/Q-07 approve data classes, key custody, retention, quotas/eviction and recovery with
  evidence. Approved drafts and pending operations MUST commit atomically. Until then, preserve
  in-memory input and disclose reload/closure loss. Browser storage is not a backup; background
  execution, remote wiping and eviction-proof persistence MUST NOT be promised.
- Development, preview/staging and production MUST isolate databases, secrets, auth origins,
  private files and provider endpoints. Preview data MUST be synthetic; production-derived
  Neon branches retain production sensitivity. Imports/exports MUST preserve permitted scope,
  exact provenance and immutable history while excluding auth/provider secrets.
- Migrations MUST expand compatibility before new writes, use bounded backfills and retain a
  declared stale-client compatibility window. Recovery MUST validate encrypted backups of
  database plus external files in isolation, reconcile numbers/jobs/provider effects and measure
  RPO/RTO. Rollback MUST occur only when data compatibility is proven.
- Q-01–Q-16 in the [decision register](../../docs/planning/decisions.md) remain owned decisions,
  not defaults. Dependent legal/finance profiles, browser persistence, auth recovery, providers,
  retention, hosting, budget and support promises MUST remain gated until resolved and verified.
  No free-tier, compliance, capacity or availability guarantee may be inferred from documentation.

## Development Workflow and Quality Gates

1. Read [AGENTS.md](../../AGENTS.md), the [current docs index](../../docs/README.md), affected
   product/domain specifications, architecture, security and design contracts. Select and read
   applicable skills through [skill routing](../../docs/development/agent-skills.md), state their
   use and verify prerequisites. Before writing Next.js code, read the relevant guides shipped
   in the installed `node_modules/next/dist/docs/`; do not rely on outdated framework conventions.
2. Define one complete scope across callers, components, contracts, tests, fixtures, config,
   migrations, docs and operations. Trace stable requirement/acceptance IDs and applicable SEC
   controls to owners, current grants, lifecycle/error states and recovery. Preserve IDs; retire
   them explicitly rather than reusing them. Record substantial or breaking decisions.
3. Implement with existing module boundaries and shared components. Keep validation, security,
   accessibility and data-loss prevention intact. Add meaningful positive, denied, failure and
   concurrency checks where the behavior requires them; avoid tests that merely mirror code.
4. Run appropriate available checks and record actual results against the
   [test strategy](../../docs/quality/test-strategy.md) and
   [acceptance criteria](../../docs/quality/acceptance.md). Keep affected specifications,
   data/API/state contracts, phase plans and recovery guidance consistent with the final change.
5. Before release, satisfy the security and
   [operations gates](../../docs/operations/release-and-support.md), including environment,
   migration, restore, financial and bilingual accessibility evidence for enabled capabilities.
   Declare disabled capabilities and unresolved findings. Approval, merge and deployment remain
   distinct actions governed by current user authorization.

## Governance

This constitution defines project-wide invariants. Current user instructions and applicable
repository/runtime restrictions govern authorized work. [PRODUCT.md](../../PRODUCT.md) and
confirmed decisions own product/stack choices; domain specifications own detailed behavior;
design and architecture/security documents own their respective contracts. Conflicts MUST be
resolved explicitly and the affected governance amended before proceeding with conflicting
implementation. Recommended designs and open decisions MUST NOT become confirmed policy by
inference. Historical native/Supabase feature and QA records MUST NOT override current website
authority or supply fresh acceptance evidence.

Amendments MUST describe the problem, rationale, changed principles, affected requirements and
contracts, compatibility/migration effects and required verification. The project owner MUST
approve governance changes through the current review process. Use semantic versioning:
MAJOR for incompatible principle removals/redefinitions, MINOR for new principles or materially
expanded obligations, and PATCH for non-semantic clarification. Preserve the original ratification
date and update the amendment date whenever content changes.

Every plan, implementation review and release review MUST check applicable principles, record
evidence/gaps and resolve violations before approval. Open policy questions stay in the decision
register with owners and blocked capabilities. This initial adoption records existing current
documentation as governance; it neither certifies implemented controls nor authorizes production
access, provisioning, deployment, external messages, automation or delegation.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
