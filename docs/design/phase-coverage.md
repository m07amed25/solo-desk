# Feature-phase to UI coverage

Status: design coverage, not implemented or tested functionality. All 151 inherited F references remain once for traceability; the old root plan is absent in this checkout. Current sequencing is the [website roadmap](../planning/roadmap.md). Native-specific entries below are superseded/retired, never reused as proof of a new website feature. UI IDs are defined in [screens.md](screens.md). Nonvisual foundations and release gates are identified explicitly. Domain requirements remain authoritative; feature PRs must add their concrete field/state evidence.

| Phase | Planned feature | UI surfaces | Design/QA obligation |
| --- | --- | --- | --- |
| [F001](../planning/roadmap.md) | Delivery governance and PR standards | Shared contracts only | Nonvisual governance/test/domain foundation. Verify shared UI contracts; no standalone end-user screen. |
| [F002](../planning/roadmap.md) | Automated CI and verification harness | Shared contracts only | Nonvisual governance/test/domain foundation. Verify shared UI contracts; no standalone end-user screen. |
| [F003](../planning/roadmap.md) | Shared typed commands and domain primitives | Shared contracts only | Nonvisual governance/test/domain foundation. Verify shared UI contracts; no standalone end-user screen. |
| [F004](../planning/roadmap.md) | Superseded: Electron lifecycle/preload | UI-001 | Native scope retired; website routing/authorization belongs to P01 and needs fresh browser evidence. |
| [F005](../planning/roadmap.md) | Accessible English/Arabic application shell | UI-001 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F006](../planning/roadmap.md) | Superseded: native key-protection proof | UI-006 | Browser draft key/threat/eviction proof is separately gated in P01/Q-07; no native evidence transfers. |
| [F007](../planning/roadmap.md) | Superseded: encrypted SQLite persistence | UI-006 | Website uses Neon authority and eligible gated IndexedDB drafts; no local native database. |
| [F008](../planning/roadmap.md) | Neon backend and tenant isolation | UI-004, UI-007 | Server-only queries, least-privilege roles, transaction/pool-reuse isolation; historical implementation does not transfer. |
| [F009](../planning/roadmap.md) | Authoritative command receipts and audit | UI-015 | Nonvisual receipts/audit foundation; inspect through authorized history and operation receipts. |
| [F010](../planning/roadmap.md) | Better Auth website sign-in | UI-002 | Fresh session/origin/CSRF/recovery evidence; native callbacks are superseded. |
| [F011](../planning/roadmap.md) | MFA and account recovery | UI-003 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F012](../planning/roadmap.md) | Workspace creation and safe switching | UI-004, UI-001 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F013](../planning/roadmap.md) | Member invitations | UI-005 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F014](../planning/roadmap.md) | Roles and project-scoped grants | UI-005 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F015](../planning/roadmap.md) | Browser/device session listing and revocation | UI-006 | Better Auth server sessions and current resource grants; no native enrollment requirement. |
| [F016](../planning/roadmap.md) | Bounded browser offline-draft access | UI-006 | Q-06/Q-07 gate with explicit expiry and copy-retention limits. |
| [F017](../planning/roadmap.md) | Eligible browser draft pending operations | UI-007 | Atomic IndexedDB draft/operation only after key/quota/eviction proof; current auth on server submission. |
| [F018](../planning/roadmap.md) | Incremental pull and permission invalidation | UI-007 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F019](../planning/roadmap.md) | Conflict review center | UI-007, UI-008 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F020](../planning/roadmap.md) | Deletion tombstones and stale-device rejoin | UI-007, UI-008 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F021](../planning/roadmap.md) | Personal, device and workspace settings | UI-009 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F022](../planning/roadmap.md) | In-site and optional browser notifications | UI-010 | Consent/capability checks and in-site fallback; no tray dependency. |
| [F023](../planning/roadmap.md) | Private versioned attachments | UI-011 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F024](../planning/roadmap.md) | Safe staged import framework | UI-012 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F025](../planning/roadmap.md) | Superseded: encrypted native device backup | UI-013 | Browser draft recovery and server DB-plus-files backup follow P01/P09 data-lifecycle policy. |
| [F026](../planning/roadmap.md) | Isolated restore and reviewed cloud rejoin | UI-013 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F027](../planning/roadmap.md) | Scoped portable data export | UI-013 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F028](../planning/roadmap.md) | Feature and policy configuration | UI-014 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F029](../planning/roadmap.md) | Retired: native callbacks, packaging and signing feasibility | UI-072 | Website uses HTTPS auth routes and controlled deployment; no native artifact gate. |
| [F030](../planning/roadmap.md) | Durable scheduled job execution | UI-066 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F031](../planning/roadmap.md) | Clients and contact profiles | UI-018 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F032](../planning/roadmap.md) | Project creation and lifecycle | UI-029 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F033](../planning/roadmap.md) | Task creation, ownership and states | UI-017, UI-030 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F034](../planning/roadmap.md) | Task lists, filters and bulk editing | UI-017 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F035](../planning/roadmap.md) | Manual reviewed time entries | UI-042 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F036](../planning/roadmap.md) | Persistent timer start, pause, switch and stop | UI-041 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F037](../planning/roadmap.md) | Timer crash, sleep and exit recovery | UI-041, UI-043 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F038](../planning/roadmap.md) | Timezone and overlap reconciliation | UI-042, UI-043 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F039](../planning/roadmap.md) | Dated selling and internal cost rates | UI-044 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F040](../planning/roadmap.md) | Exact money and calculation profiles | UI-061, UI-049 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F041](../planning/roadmap.md) | Offline invoice draft editor | UI-049 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F042](../planning/roadmap.md) | Authoritative time/expense draft reservations | UI-046, UI-049 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F043](../planning/roadmap.md) | Invoice numbering and atomic online issuance | UI-048, UI-050 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F044](../planning/roadmap.md) | English/Arabic invoice PDF export | UI-051 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F045](../planning/roadmap.md) | Manual delivery and invoice status | UI-048, UI-052 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F046](../planning/roadmap.md) | Partial payments and unapplied client credit | UI-053 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F047](../planning/roadmap.md) | Expense recording and receipt evidence | UI-054 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F048](../planning/roadmap.md) | Core work and receivables overview | UI-016 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F049](../planning/roadmap.md) | Core pilot release and cross-domain evidence | UI-016, UI-018, UI-029, UI-041, UI-048 | Cross-domain pilot release gate; verify complete journeys across existing screens, not a new page. |
| [F050](../planning/roadmap.md) | Client archive, merge and relationship integrity | UI-018, UI-019 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F051](../planning/roadmap.md) | Opportunity pipeline and weighted forecast | UI-020 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F052](../planning/roadmap.md) | Relationship activities and follow-ups | UI-021 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F053](../planning/roadmap.md) | Versioned service catalog | UI-022 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F054](../planning/roadmap.md) | Estimate scenarios and comparison | UI-023 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F055](../planning/roadmap.md) | Proposal revisions and document sharing | UI-024 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F056](../planning/roadmap.md) | Acceptance evidence and disputes | UI-024 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F057](../planning/roadmap.md) | Agreements, amendments and obligations | UI-025 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F058](../planning/roadmap.md) | Client onboarding checklists | UI-026 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F059](../planning/roadmap.md) | Accepted engagement project handoff | UI-027 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F060](../planning/roadmap.md) | Renewals and deterministic client health | UI-028 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F061](../planning/roadmap.md) | Task hierarchy and checklists | UI-030 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F062](../planning/roadmap.md) | Accessible Kanban workflow | UI-031 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F063](../planning/roadmap.md) | Task dependency graph | UI-032 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F064](../planning/roadmap.md) | Milestone completion and acceptance | UI-032 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F065](../planning/roadmap.md) | Task calendar view | UI-033 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F066](../planning/roadmap.md) | Project timeline planning | UI-033 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F067](../planning/roadmap.md) | Team capacity and leave calendars | UI-034 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F068](../planning/roadmap.md) | Sprints and delivery cycles | UI-034 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F069](../planning/roadmap.md) | Recurring task generation | UI-035, UI-030 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F070](../planning/roadmap.md) | Project and task templates | UI-035, UI-030 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F071](../planning/roadmap.md) | Typed custom fields | UI-035, UI-030 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F072](../planning/roadmap.md) | Scope baseline and change requests | UI-036 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F073](../planning/roadmap.md) | Versioned deliverables and internal review | UI-037 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F074](../planning/roadmap.md) | Scoped comments, mentions and threads | UI-038 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F075](../planning/roadmap.md) | Project notes and attachment revisions | UI-038 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F076](../planning/roadmap.md) | Budget baselines and threshold alerts | UI-039 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F077](../planning/roadmap.md) | Portfolio health, risks and decisions | UI-039 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F078](../planning/roadmap.md) | Archive, task transfer and handover | UI-040 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F079](../planning/roadmap.md) | Unallocated time editing and conservation | UI-042 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F080](../planning/roadmap.md) | Time list and calendar views | UI-042 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F081](../planning/roadmap.md) | Versioned billing time-rounding policies | UI-044 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F082](../planning/roadmap.md) | Optional idle detection and review | UI-043 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F083](../planning/roadmap.md) | Focus sessions and breaks | UI-047 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F084](../planning/roadmap.md) | Timesheet submission and approvals | UI-045 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F085](../planning/roadmap.md) | Partial time-source allocation | UI-046 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F086](../planning/roadmap.md) | Time imports and detailed exports | UI-012, UI-042 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F087](../planning/roadmap.md) | Utilization and effective-rate metrics | UI-047, UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F088](../planning/roadmap.md) | Credit notes and invoice correction | UI-055 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F089](../planning/roadmap.md) | Refund recording and settlement reversals | UI-055 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F090](../planning/roadmap.md) | Expense approval, splits and reimbursement | UI-054 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F091](../planning/roadmap.md) | Deposits and final-invoice application | UI-056 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F092](../planning/roadmap.md) | Milestone billing schedules | UI-056 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F093](../planning/roadmap.md) | Monetary prepaid retainers | UI-057 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F094](../planning/roadmap.md) | Included-service retainers and overages | UI-057 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F095](../planning/roadmap.md) | Client subscriptions and proration | UI-058 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F096](../planning/roadmap.md) | Recurring invoice draft generation | UI-058 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F097](../planning/roadmap.md) | Collection reminder schedules | UI-059 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F098](../planning/roadmap.md) | Bank-file reconciliation | UI-060 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F099](../planning/roadmap.md) | Portable accounting transaction exports | UI-060 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F100](../planning/roadmap.md) | Cross-currency settlement records | UI-060 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F101](../planning/roadmap.md) | Disputes, write-offs and collection notes | UI-059 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F102](../planning/roadmap.md) | Branded bilingual document templates | UI-051 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F103](../planning/roadmap.md) | Validated market invoice profiles | UI-061, UI-014 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F104](../planning/roadmap.md) | Customizable home dashboards | UI-016 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F105](../planning/roadmap.md) | Revenue and collection reports | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F106](../planning/roadmap.md) | Receivables aging and cash scenarios | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F107](../planning/roadmap.md) | Project operational profitability | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F108](../planning/roadmap.md) | Delivery and capacity analytics | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F109](../planning/roadmap.md) | Consolidated FX reporting | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F110](../planning/roadmap.md) | Knowledge library and safe reusable notes | UI-063 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F111](../planning/roadmap.md) | Permission-aware global text search | UI-063 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F112](../planning/roadmap.md) | Reproducible report snapshots and exports | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F113](../planning/roadmap.md) | Business goals and explained threshold alerts | UI-062 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F114](../planning/roadmap.md) | Connector registry and OAuth secret lifecycle | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F115](../planning/roadmap.md) | Typed deterministic automation rules | UI-065 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F116](../planning/roadmap.md) | GitHub project context and issue import | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F117](../planning/roadmap.md) | GitLab project context and issue import | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F118](../planning/roadmap.md) | Explicit engineering-status synchronization | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F119](../planning/roadmap.md) | Calendar availability and event import | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F120](../planning/roadmap.md) | Calendar export and invitations | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F121](../planning/roadmap.md) | Verified outbound business email | UI-052, UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F122](../planning/roadmap.md) | Hosted payment links and checkout | UI-053, UI-064, UI-069 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F123](../planning/roadmap.md) | Verified payment webhooks and payout matching | UI-053, UI-064, UI-069 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F124](../planning/roadmap.md) | Provider refunds, disputes and chargebacks | UI-055, UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F125](../planning/roadmap.md) | Read-only bank-feed connection | UI-060, UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F126](../planning/roadmap.md) | Accounting-tool connector | UI-060, UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F127](../planning/roadmap.md) | Scoped developer API | UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F128](../planning/roadmap.md) | Signed outgoing webhooks | UI-065, UI-064 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F129](../planning/roadmap.md) | Job and connector health/repair console | UI-066 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F130](../planning/roadmap.md) | Scheduled report delivery | UI-062, UI-065, UI-066 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F131](../planning/roadmap.md) | Scoped client portal authentication | UI-067 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F132](../planning/roadmap.md) | Exact-version external publication | UI-068 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F133](../planning/roadmap.md) | Client deliverable feedback and approval | UI-068 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F134](../planning/roadmap.md) | Client proposal acceptance and signing adapter | UI-068 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F135](../planning/roadmap.md) | Client invoice balance and payment portal | UI-069 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F136](../planning/roadmap.md) | Client questionnaires and onboarding responses | UI-026, UI-070 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F137](../planning/roadmap.md) | Portal brand and notification preferences | UI-067 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F138](../planning/roadmap.md) | Account and workspace closure workflow | UI-071 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F139](../planning/roadmap.md) | SoloDesk plan and seat entitlements | UI-071 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F140](../planning/roadmap.md) | Privacy-safe diagnostics and support access | UI-072 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F141](../planning/roadmap.md) | Cloud database/blob recovery drills | UI-013, UI-073 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F142](../planning/roadmap.md) | API/schema rolling compatibility | UI-007, UI-073 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F143](../planning/roadmap.md) | Performance and resource-budget verification | UI-073 | Performance/resource gate across all applicable screens; diagnostic surfaces are secondary. |
| [F144](../planning/roadmap.md) | Bilingual accessibility regression gate | UI-001 | Bilingual accessibility regression gate across all relevant UI-IDs; no standalone end-user screen. |
| [F145](../planning/roadmap.md) | Retired: signed Windows installer | Shared release gate | No website installer; P09 verifies supported browser deployment. |
| [F146](../planning/roadmap.md) | Retired: signed/notarized macOS distribution | Shared release gate | No native package; P09 verifies browser/device support. |
| [F147](../planning/roadmap.md) | Retired: Linux package distribution | Shared release gate | No native package; P09 verifies browser/device support. |
| [F148](../planning/roadmap.md) | Compatible website rollout and recovery | UI-072 | Fresh code/schema compatibility, stale-tab and controlled rollback/forward-repair evidence. |
| [F149](../planning/roadmap.md) | Operational alerts, quotas and incident controls | UI-066, UI-073 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F150](../planning/roadmap.md) | Vendor exit and full workspace portability | UI-013 | Feature screen; apply shared state, permission, locale and online contracts. |
| [F151](../planning/roadmap.md) | Stable release promotion and acceptance | UI-073 | Stable release acceptance across all relevant journeys; no standalone product feature screen. |

Every active feature inherits NFR-015–019: primary shadcn/ui/design-system reuse, scalability, server-only Neon/Better Auth, security and appropriate patterns. Cross-cutting gates are defined in [requirements](../product/requirements.md), [patterns](../architecture/design-patterns.md) and [test strategy](../quality/test-strategy.md).
