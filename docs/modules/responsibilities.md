# Module ownership and dependencies

Updated 29 October 2026. Target modular website; the checkout currently contains a Next.js starter. All modules inherit [architecture](../architecture/overview.md), [design patterns](../architecture/design-patterns.md) and [security](../architecture/security-and-privacy.md).

| Module | Owns | Dependency / boundary |
| --- | --- | --- |
| Identity/workspaces/policy | Better Auth sessions, membership, grants, reauth and invitations | Current server policy; identity alone never grants tenant/resource access |
| Client/commercial | Clients, contacts, opportunities, catalog, proposal/agreement versions | Shared financial rules; no implicit client account membership |
| Work management | Projects, tasks, dependencies, baselines, delivery and collaboration | Scoped clients/members; published projections exclude private work |
| Time/productivity | Server timer evidence, recovery review, entries, rates and approvals | Project identity; no uncertain time or duplicated seconds in billing |
| Finance | Exact policies, invoices/credits, allocations, payments, expenses and retainers | Neon transactions/constraints/receipts; immutable history and linked corrections |
| Insights/knowledge | Defined reports, notes, search and projections | Current source facts and grants; no competing money authority |
| Integrations/automation | Provider adapters, verified inbox, durable jobs/outbox and notifications | Reuse authorized services; current grants before external effects |
| Website UI/design system | shadcn/ui primitives, shared tokens/composites, responsive localized screens | Minimum permitted projections; no Neon credentials or secret-bearing auth config |
| Browser drafts | Eligible protected draft capture, pending operations and conflict UX | Q-06/Q-07 proof; never membership, billing or global reservation authority |
| Client portal | Explicit exact-version publication and scoped responses | Same website services/design system; no generic internal-record serialization |
| Operations/data lifecycle | Migrations, private files, backups, recovery, quotas and diagnostics | Restricted secrets/roles; no stale command/session resurrection |

Routes are composition/transport entry points. Application services own use cases and transactions; pure domain functions own calculation/transitions. Server-only data access owns scoped Neon queries. Introduce adapters where provider boundaries need them; do not create a generic framework around every function. Shared UI changes reach every caller; module changes update contracts, tests, docs and recovery together.
