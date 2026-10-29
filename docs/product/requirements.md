# Requirements catalogue and source-of-truth rules

Updated 29 October 2026. Confirmed website scope is in [PRODUCT.md](../../PRODUCT.md) and [decisions](../planning/decisions.md). Functional details below are proposed specifications for implementation, not passed tests. The [coverage register](../planning/coverage.md) enumerates every stable requirement and primary phase/source.

## Functional families

| Family | IDs | Authority | Phase |
| --- | --- | --- | --- |
| Website/accounts/teams/browser drafts | PLT-001–PLT-018 | [Platform/workspaces](../specs/platform-and-workspaces.md) | P01 |
| Clients/sales/agreements | CRM-001–CRM-011 | [Client lifecycle](../specs/client-lifecycle.md) | P02; portal P08 |
| Delivery/planning | WRK-001–WRK-014 | [Work management](../specs/work-management.md) | P03 |
| Time/rates/productivity | TIM-001–TIM-024 | [Time](../specs/time-and-productivity.md) | P04; source locks P05 |
| Money/commercial finance | FIN-001–FIN-035 | [Finance](../specs/finance.md) | P05; reports/connectors later |
| Reporting/knowledge/search | INS-001–INS-010 | [Insights](../specs/insights-and-knowledge.md) | P06 |
| Connections/rules/jobs | INT-001–INT-012 | [Integrations](../specs/integrations-and-automation.md) | P07 |

Every enabled capability needs fields, actors, permissions, online/offline behavior, lifecycle/transitions, validation, failure/retry/recovery, audit and acceptance evidence. Shared contracts cover repeated concerns rather than copying inconsistent rules into every screen. A short catalogue row does not replace its detailed specification.

## Cross-cutting nonfunctional requirements

| ID | Requirement | Verification authority |
| --- | --- | --- |
| NFR-001 | Financial commands conserve exact value/source ownership, freeze history and commit atomically/idempotently | Finance fixtures + property/integration tests |
| NFR-002 | Eligible browser drafts and pending operations commit atomically after storage/key proof; disclose quota/eviction limits and distinguish browser save from server acceptance; issuance stays online | Browser draft failure/reconnect journeys |
| NFR-003 | Recover DB/files/keys/jobs from validated backups without stale money replay or number reuse | Restore/migration drills |
| NFR-004 | Enforce tenant/project/action/guest scopes across reads/writes/counts/search/files/exports | Negative authorization matrix |
| NFR-005 | Encrypt transport/server/backup data; protected browser persistence requires reviewed encryption/key custody and never silently falls back | Server/backup controls + browser draft threat/recovery tests |
| NFR-006 | Equivalent English/Arabic workflows, RTL and correct localized artifacts/errors/numeric input | Fluent review + bidi/PDF fixtures |
| NFR-007 | Keyboard, focus, screen reader, contrast, zoom, reduced motion and drag alternatives | Accessibility manual/automated checks |
| NFR-008 | Meet agreed website/query/job budgets on declared browser/network/data fixtures with bounded workloads | Browser/server/load measurements |
| NFR-009 | Surface provider/cost/quota limits; preserve work on outages; no unlimited free-service claim | Quota/degraded-mode tests |
| NFR-010 | Compatible protocols/schema migrations preserve unknown/stale client data safely | Upgrade/version matrix |
| NFR-011 | Deploy the website over HTTPS with controlled rollout, compatible migrations and safe handling of stale open tabs | Deployment/rollback/browser evidence |
| NFR-012 | Redact diagnostics and constrain support/provider data access; opt-in product analytics | Privacy/security fixtures |
| NFR-013 | Portable imports/exports with exact provenance, duplicate prevention and inert files | Import/export round trips |
| NFR-014 | Maintain traceable rules, audit, requirements, acceptance and operational runbooks | Documentation/release review |
| NFR-015 | Use shadcn/ui as the primary component foundation with Tailwind semantic tokens and preserved accessibility contracts | Shared component source/reuse and UI behavior checks |
| NFR-016 | Treat the design system as primary: shared tokens/primitives/composites, responsive English/Arabic RTL and versioned component contracts | Design-system reuse, contrast, keyboard and responsive reviews |
| NFR-017 | Treat scalability as primary: modular services, bounded pagination/batches, Neon pooling, measured indexes and durable jobs | Architecture/query-plan/load checks |
| NFR-018 | Use server-only Neon PostgreSQL and Better Auth sessions with current application authorization | Real PostgreSQL transactions + auth/tenant negative tests |
| NFR-019 | Use appropriate composition/service/data-access/adapter/state/transaction patterns without speculative layers; security is a release gate at every boundary | Pattern rationale, dependency/security review and meaningful failure cases |

Targets/definitions live in [test strategy](../quality/test-strategy.md), [UX/localization](ux-and-localization.md), [security](../architecture/security-and-privacy.md), and [data lifecycle](../architecture/data-lifecycle.md). Provisional metrics are not current performance claims.

## Configurability rules

Workspace feature/profile switches cover taxes/discounts, timesheet/expense approvals, retainers/recurrence/subscriptions, reminders, integration/portal actions and report policies. Enabling validates required roles/policies/market/provider setup. Disabling preserves history, balances, pending obligations and exports. No switch bypasses authorization, encryption, immutable finance or online issuance. Client/seller configuration is versioned where it affects customer-facing facts.

## Explicit boundaries

No AI for now. No desktop application/installer, native mobile app, complete general ledger/payroll, automatic legal/tax compliance, unrestricted plugin/script execution, raw-card collection, employee surveillance, first-release self-hosted edition or unrestricted offline final issuance. These are not hidden future commitments. Deterministic rules and configurable finance remain in scope. Team basics and sync are required from the first usable release, not optional future extras.

## Earlier ID migration

The initial small requirements are preserved as aliases so earlier references remain understandable; their old full-payment/local-only limits are superseded.

| Earlier ID | Current authority |
| --- | --- |
| CL-01 | CRM-001 |
| PR-01 / PR-02 / PR-03 | WRK-001 / WRK-012 + FIN-004 / WRK-014 |
| TK-01 / TK-02 | WRK-002 / WRK-004 |
| TM-01 / TM-02 / TM-03 / TM-04 | TIM-001–004 / TIM-005–008 / TIM-004 + TIM-015 / TIM-012–013 |
| IN-01 / IN-02 / IN-03 | FIN-004–007 / FIN-006–007 + FIN-016–018 / FIN-008 + FIN-031 |
| IN-04 / IN-05 | FIN-009–015 / FIN-013–015 + finance void policy |
| OV-01 / ST-01 | INS-001–006 / PLT-011 + FIN-001 + FIN-007 |
| BK-01 / BK-02 | PLT-016 + data-lifecycle specification |
| QL-01–QL-09 | NFR-002 / NFR-001 / NFR-007 / NFR-002 / NFR-004 + NFR-015 / NFR-003 / NFR-011 / NFR-008 / NFR-015 |

When changing a requirement update its specification, phase, affected entity/API/state machine, acceptance examples and decision/risk references. Retire IDs explicitly; never reuse one for unrelated behavior.

The website/Neon/Better Auth decisions supersede native storage, bridge and distribution assumptions. Offline drafting remains gated by the browser-storage contract; no first-release offline claim is allowed without its security and durability proof.
