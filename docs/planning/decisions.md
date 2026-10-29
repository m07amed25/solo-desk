# Decision register

Updated 29 October 2026. Website requirements below supersede the earlier native platform and backend choices. **Confirmed** records user choices. **Recommended** records design choices made for this documentation. **Open** is not permission to guess. Documentation can describe a blocked capability without implementing it.

## Confirmed decisions

| ID | Decision |
| --- | --- |
| D-01 | Initial domain: freelance software engineering work |
| D-02 | Responsive website for phone, tablet and wide-screen browsers; browser/version matrix remains Q-11 |
| D-03 | Next.js App Router website; earlier Electron application direction is superseded |
| D-04 | Priorities include projects, tasks, time tracking, invoices |
| D-05 | Business implementation deferred; this task is documentation only |
| D-06 | Earlier installation authorization is historical; current dependencies are defined by package.json |
| D-07 | shadcn/ui is the primary component foundation, with shared Tailwind semantic tokens and reusable composites |
| D-08 | Current checkout contains a minimal Next.js starter; historical native shell evidence does not apply |
| D-09 | Full advanced project documentation organized into phases; ask about complex decisions |
| D-10 | Freelancers and small teams from the first release |
| D-11 | Cloud account required; retain eligible offline-drafting goals under the browser protection/durability gates Q-06/Q-07 |
| D-12 | Document all financial features as configurable |
| D-13 | Eligible invoice drafts may be prepared offline only after browser-draft proof; finalization always requires online server authority |
| D-14 | Managed cloud service first |
| D-15 | Encrypt transport, server storage and backups; protect browser drafts under reviewed key/retention policy, with no native secret-store assumption |
| D-16 | No AI features for now |
| D-17 | English and Arabic in the first release, including full RTL |
| D-18 | Neon PostgreSQL and Better Auth are selected; prior backend recommendations are superseded |
| D-19 | Prefer the lowest practical cost; use efficient free options where available. Region, budget ceiling and scale remain undecided |
| D-20 | Neon is the authoritative PostgreSQL database, accessed only by trusted server code |
| D-21 | Better Auth is the authentication and session system; application services enforce current resource grants |
| D-22 | A coherent accessible reusable design system is a primary requirement |
| D-23 | Scalability is primary: clear module boundaries, bounded queries/jobs, pooling and measured performance |
| D-24 | Security is primary and a release gate across identity, tenant isolation, inputs, secrets, files and recovery |
| D-25 | Appropriate design patterns are primary; use concrete composition/service/data/adapter/state/transaction patterns without speculative layers |

## Recommended design decisions

| ID | Recommendation | Rationale / gate |
| --- | --- | --- |
| A-01 | Next.js server application with Neon PostgreSQL, Better Auth, private files and durable jobs | Confirmed database/auth choices; storage/email/hosting/driver selection remains gated |
| A-02 | Limited encrypted IndexedDB drafts and stable pending operations after browser security proof | No broad native cache; quota, eviction, key custody, XSS and recovery need evidence |
| A-03 | Server authority for memberships, document issuance, financial postings, number/allocation ownership | Prevents stale offline permissions and duplicate financial effects |
| A-04 | Owner/Admin/Manager/Contributor/Finance/Viewer role templates plus scoped capabilities | Solo and small-team support without giving every member financial access |
| A-05 | Server-coordinated online timer revisions and review of uncertain/offline intervals | Multiple tabs and suspended pages cannot rely on a native process owner |
| A-06 | Exact integer source seconds; versioned rational/decimal prices; final amounts in currency minor units | Prevents display rounding from changing billing. Detailed rounding profile remains open |
| A-07 | Immutable issued financial snapshots with linked corrections | Changes remain explainable and historical documents reproducible |
| A-08 | Deterministic automation creates drafts by default; sending/issuing require separately enabled rules | Clear authority, retries, recipients, and audit |
| A-09 | Restore server backups in isolation and import reviewed browser drafts against current authority | Never replay old financial commands or restore revoked sessions |
| A-10 | Protected browser persistence fails closed until key/recovery and eviction handling are proven | No OS key-store or ciphertext-with-adjacent-key protection claim |

## Complex decisions still open

| ID | Question / provisional position | Blocks | Owner |
| --- | --- | --- | --- |
| Q-01 | Launch countries, seller registrations, e-invoice mandates, invoice/contract retention; configurable fields alone are insufficient | Jurisdiction profile and legal claims | Product owner + local accountant/legal reviewer |
| Q-02 | Cloud region/data residency, monthly budget, expected active users/workspaces, storage and support hours | Provisioning, plan selection, operational promises | Product owner |
| Q-03 | Exact time rounding, grouping, minimums, tax/discount order, currency precision, numbering series | Approval of financial fixtures | Product owner + finance reviewer |
| Q-04 | Browser sleep/suspension/gap review, timer reminders and maximum manual duration | Final timer UX | Product owner |
| Q-05 | Role templates, time/expense approval rules, project grants, financial dual approval | Permission matrix sign-off | Product owner |
| Q-06 | Eligible offline draft classes, access duration, expiry and account-switch retention; no seven-day native lease default | Browser offline-drafting release | Product + security |
| Q-07 | Reviewed browser draft encryption/key custody, quotas/eviction and recovery; protected persistence disabled until proven | Browser offline-drafting release | Engineering + security |
| Q-08 | Mandatory MFA policies, SSO/social providers, account recovery, invite expiry | Identity release | Product + security |
| Q-09 | First connector/provider list: GitHub/GitLab, calendar, email, payments, accounting; operator credentials and countries | P07 connector commitments | Product owner |
| Q-10 | Portal login versus expiring verified links; legal signature provider, signatory evidence, branding | P02 signatures / P08 portal | Product + legal/security |
| Q-11 | Supported browser/version and phone/tablet/wide-screen matrix, assistive technology and deployment hosting | Website support and release evidence | Engineering + product |
| Q-12 | Product pricing/license, trials, seat billing, subscription grace and export on cancellation | Commercial launch, not core domain modeling | Product owner |
| Q-13 | Browser draft retention, tombstones, stale draft resubmission, account deletion and backup expiry | Deletion/recovery guarantees | Product + operations/legal |
| Q-14 | Capacity calendars, working days, cost-rate visibility, reporting basis and FX feed | P03/P06 forecasts | Product owner |
| Q-15 | Existing import sources, historic issued numbers, opening receivables/credits/retainers | Migration/import launch scope | Product owner |
| Q-16 | Hosting availability target, incident response, RPO/RTO and independently stored blob backups | Production service readiness | Product + operations |

Provisional values must be shown in the UI/specification and tested, not silently treated as confirmed. Unresolved legal rules disable affected issuance profiles; unresolved optional connectors stay disabled.

## Superseded earlier proposals

The 29 October website decision replaces native lifecycle, preload/IPC, SQLite/OS-key-store, installers and signed desktop updates. Neon and Better Auth replace Supabase Auth/PostgreSQL/Storage/Edge Function recommendations; file/email/hosting services are still open. Historical feature and QA records preserve their original platform/results and do not prove website readiness. Offline drafting remains gated by browser-specific proof rather than native assumptions.

Single-user/local-only/no-account operation is superseded by D-10/D-11. Full-payment-only billing is superseded by D-12. Optional basic team/sync architecture is superseded by mandatory P01 team/sync foundations. Unrestricted offline finalization is excluded by D-13. AI exploration is excluded by D-16. The old small first-version limits do not govern this expanded roadmap.

For each future change record date, decision maker, rationale, impacted requirement IDs, schema/API compatibility, migration and test consequences. A decision being documented never marks its implementation complete.

## Neon account foundation — 29 October 2026

The user explicitly requested Postgres, Auth and Realtime on Neon project `old-darkness-38592897`, branch `production`, followed by Google/GitHub sign-in. This selects Neon Managed Better Auth for the account slice while preserving Better Auth as the identity technology. Neon owns its auth schema and provider credentials; Next.js owns same-origin SDK routes, the OAuth callback, authorized profile reads/actions and live query sealing. No previous auth implementation or business schema existed to migrate. This does not decide workspace policy, hosting, production SMTP, recovery or other business features. See [implementation and test evidence](../development/neon-setup.md).
