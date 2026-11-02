# T003 security prerequisite assessment

2026-11-02; execution owner: Codex for local source/tests and evidence; release owners remain the accountable Identity, Workspace, Database, Operations, Web, QA and Security roles in the [verification contract](../contracts/verification-and-evidence.md). No named human release sign-off is claimed.

Source/lock/runtime: [initial identities](initial-identity.json). No source changes yet. Local CLI evidence has no browser/locale/theme/viewport/motion. Managed/deployed versions, target role and fixture policy remain UNKNOWN; no production query.

| SEC controls | Execution owner and negative cases | Assessment |
| --- | --- | --- |
| 002/005/006/008 | Codex/local identity tests; Identity + Security/live expiry, revoke, origin, sign-out and step-up | Live BLOCKED: no verified synthetic target; keep gates off |
| 009–015 | Codex/imported services; Workspace + QA/foreign IDs, removed grants, replay, original targets, final owner | Adapter evidence only until real target verified |
| 023/025/027–029 | Codex/Web/malformed bounds, finite returns, private projections/cache/origin | Local tests available; mounted coverage pending |
| 031/044/047/048/062 | Codex/local evidence inspection; Operations/target isolation | No new persistence; credentials/proof remain excluded; live fixtures BLOCKED |
| 032/041–043/056 | Codex/migration adapters; Database + Operations/direct verified TLS, rollback, history and pool isolation | CLI no DB; restricted role/live isolation BLOCKED |
| 049–052/055 | Codex/exact installed and lock advisory review; Security/managed/deployed review | Fresh audit FINDINGS; unknown remote versions remain gaps |
| 063/064 | Codex/bounded subprocess/context/pages and explicit errors | Local correction/verification pending |

Fresh npm audit: initial invocation returned exit 1 with 27 findings; retained-output sandbox repeat failed DNS EAI_AGAIN, stored separately as an unavailable scan. Approved repeat exited 1 with 27 affected entries: 8 low, 19 moderate, 0 high/critical. See [raw approved audit](npm-audit-2026-11-02-approved.json). Direct advisory roots are deepmerge <=4.3.1 prototype poisoning, glob 9–14.0.1 cancellation bypass and minimatch <11 amplification. These include shadcn, lint and email/auth-UI transitive paths; no blanket runtime-unreachability or risk acceptance is asserted. No forced downgrade/lock edit.

Official [Next October update](https://nextjs.org/blog/nextjs-security-update-october-14-2026) identifies patched 16.4.1; installed 16.4.3 is above that fix. This is a scoped comparison, not a clean graph/deployment assertion. Official [Better Auth notice](https://better-auth.com/blog/security-release-2026-11-03) announces fixes for 3 November; installed 1.7.14 is on the covered 1.7 line, but unpublished advisory applicability remains UNKNOWN and must be rechecked before release. Node/npm/build-tool, bundled and remote applicability beyond this review remains owned by Engineering + Security; npm audit does not cover all of it.

Release checklist reviewed: current authority, browser/lifetime, real DB isolation, human reviews, deployed ingress/restore and G1–G6/AP-01–05 remain OPEN. No release, gate activation or exception approval.
