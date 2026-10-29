# Design patterns and scalable module boundaries

Updated 29 October 2026. Design patterns are a primary engineering requirement for the Next.js website. Select the smallest pattern that makes ownership, trust or lifecycle clear; require a concrete use rather than extra layers for their own sake.

| Pattern | Use in SoloDesk | Constraint / evidence |
| --- | --- | --- |
| Composition | Shared shadcn/ui primitives → business composites → screens | One token/variant system; preserve focus/keyboard/RTL semantics |
| Modular monolith | Identity/workspaces, clients, work, time, finance, insights and integrations | Explicit module ownership; split deployment only after a measured need |
| Application service / use case | Issue invoice, invite member, accept deliverable, stop timer | Thin web entry point; current auth/authorization, validation and transaction at the service boundary |
| Data access layer | Server-only scoped Neon queries and constrained return projections | No SQL/credentials in Client Components; no generic CRUD layer that bypasses domain rules |
| Adapter | Better Auth integration, database, private files, email/payment providers | Keep provider protocol out of domain rules; introduce an interface only for a real boundary |
| Explicit state transitions | Draft/issued/corrected invoices, timer recovery, jobs and publication | Reject invalid transitions; immutable history and negative transition tests |
| Strategy | Approved tax/rounding/rate policies when alternatives exist | Versioned policy fixtures; a single policy can be an ordinary function |
| Transaction / unit of work | Financial effect + number/allocation + receipt + audit + outbox | All-or-nothing PostgreSQL commit; concurrency/rollback tests |
| Idempotent command | Retries after a lost response or duplicate webhook | Stable operation ID, payload digest, database uniqueness and same-result replay |
| Transactional outbox / inbox | Provider delivery, scheduled work and verified incoming events | Leases, bounded retries, deduplication, current grants and unknown-outcome reconciliation |

## Dependency direction

Routes/components compose UI and call authorized services. Services use domain rules and server-only data access/adapters. Domain rules do not import React, Next.js, Better Auth or database drivers. One simple module can contain related functions; these boundaries do not mandate packages, classes, dependency-injection containers or a fleet of services.

The data-access layer enforces tenant/resource scopes for reads, counts, search, files and exports. Authentication yields identity; it does not imply permission. Route guards and cache keys follow this policy and cannot become a competing source of authority.

## Scalability review

Every feature states its component reuse, module owner, query bounds/index needs, transaction scope, external jobs and failure/recovery behavior. Use stable cursor pagination, bounded inputs/batches, server rendering and measured client bundle budgets. Revalidate private caches after permission changes and ensure keys include effective scope. Test pooled-connection tenant isolation and concurrent financial conflicts with real PostgreSQL.

Record substantial cross-module or breaking changes in [decisions](../planning/decisions.md), including alternatives, rationale, affected callers/contracts, migrations and evidence. Do not add CQRS infrastructure, event sourcing, generic repositories, factories or microservices without an actual requirement that simpler functions/modules cannot satisfy.
