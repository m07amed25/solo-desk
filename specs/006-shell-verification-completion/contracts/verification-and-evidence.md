# Verification and Evidence Contract

Applies to Feature 006 FR-001–004/028–033 and all linked acceptance criteria. This is a plan for evidence, not a result ledger. Current local baseline results are in [research](../research.md).

## Maintenance CLI Contract

Preserve `db:migrate` and exported runner functions. `--help` alone exits 0 with usage including “Apply all pending”; invalid/ambiguous selectors exit nonzero with useful safe diagnostics before database construction/env loading. Test both with synthetic malformed connection configuration and no database. No real migration is used to validate help.

In `scripts/test-migrations.test.mjs`, each of three existing subprocesses gets a 10,000 ms timeout; assert no `error`/unexpected signal before status/output. Keep help and invalid/connection exit assertions and all existing semantic assertions. Extend synthetic-secret disclosure checks to every stdout/stderr stream. Failure diagnostics contain command label, error code, signal and exit, never environment/credentials. EPERM/timeout is a failed/unavailable execution result, never an implicit skip/pass.

Retain existing tests for numeric ordering/deduplication/selector rejection/checksums; direct endpoint/certificate verification; lock-before-effects; atomic SQL/history commit; changed/missing history rejection; skip semantics; SQL/history/deferred-commit rollback without success report. Preserve connection close in finally. These adapter tests do not establish real PostgreSQL transaction/pool/role safety; obtain real evidence when that boundary is affected.

## Evidence Classes and Fixture Safety

| Class | Proves | Cannot substitute for |
| --- | --- | --- |
| Source/structure/translation | Inspected declarations, finite values, key/ICU parity and document consistency | Mounted behavior, fluent language, permissions or conformance |
| Local adapter/contracts | Actual imported boundary behavior with declared mocks/synthetic transports | Hosted identity, real transactions/pool isolation or end-to-end delivery |
| Anonymous HTTP | Public/status/header/parser behavior from a running target | Authentication, drawer/focus/zoom or user interactions |
| Mounted browser with controlled transport | Actual rendered actions, cancellation, races and failure/lifecycle handling under injected outcomes | Real membership/session/grant enforcement or delivery |
| Real isolated service/session | Fresh current authority, direct denials, transactions/pool/roles and enabled journeys against verified isolated targets | Required human accessibility/Arabic or production ingress |
| Human review | Named reviewer/tool/device and actual keyboard/screen-reader/zoom/contrast/fluent-Arabic observations | Untested engines, live isolation, release sign-off outside reviewer scope |
| Release/advisory | Exact build/lock/runtime/deployed scope, current findings/owners and applicable gate evidence | Blanket approval of missing classes |

Before any authenticated/live fixture run, independently verify the app/auth/database/branch identities, runtime role, allowed provider/synthetic sink and fixture ownership. A string containing “isolated” or absence of “prod” does not prove safety. Reuse existing manifest validators as additional checks, not sole authorization. Never load credentials from an unverified default `.env.local` and assume it is a test target.

Fixture requirements: separate synthetic accounts/teams A/B, non-member, Owner/Admin/Member, grant removal without role change, revoked membership/session, no/one/many authorized choices including >20, distinct record markers, long Arabic/English/mixed-direction strings, controlled slow/failing/reordered outcomes, and safe sign-out/expiry recovery. Keep gated journeys disabled unless already authorized/verified in the isolated target; this plan authorizes no activation or external send.

Credential-bearing target manifests, cookie jars/session exports, proof URLs and raw traces with auth headers remain outside the repository. Store only sanitized coverage/assertion records and captures. Stop on unexpected target identity, production connection, secret/proof exposure, unauthorized fields/effects, destructive behavior or unsafe persistence.

## Acceptance Suites

| Suite | Required assertions / observable result | Spec coverage |
| --- | --- | --- |
| V1 — Verification | Help/invalid no-DB outcomes and all migration invariants; exact sandbox/approved process result; focused tests followed by full lint/typegen/types/parity/Node/email/build once corrections settle | US1; FR-001–004; SC-001 |
| V2 — Destinations/layout | Three real app pages, matching active links/heading/breadcrumbs; public/auth separate; no marketing/dead controls/fictional metrics; all destinations ≤3 activations in every mode; short-screen controls reachable | US2; FR-005–007/014; SC-002/003 |
| V3 — Drawer | Keyboard/pointer opening, focus containment, background interaction/scroll blocked, Escape/visible close, dismissal restoration vs committed-route focus, cancel retains state, resize 767/768/769 with zero invisible locks | US3; FR-008–009/027; SC-004 |
| V4 — Context/authority | ≥20 A/B switches including reversals, stale initial/manual/page/mutation completions, cross-tab cookie race, original command targets, grant/membership revocation and direct foreign/lower-role denials; zero forbidden fields/effects; personal read/update/live independent of workspace outage | US4; FR-014–020/023/029; SC-005/006/008 |
| V5 — Navigation/input | Direct entry/refresh/Back/Forward/auth/presentation returns; hostile/duplicate/query/fragment returns; two-form cancellation without partial discard; explicit resume once; cancelled preference sends zero POST; normal modified-click; sensible focus and memory-only recovery | US5; FR-010–013; SC-007 |
| V6 — Proof/lifecycle | Early capture vs streamed redirect, malformed/oversized/lost proof, explicit acceptance only, returned/thrown sign-out failures, actor change/expiry/Activity/pagehide/pageshow, fresh validation before reveal, pending hashchange cannot retarget proof; zero proof leakage | US4; FR-017–023; SC-008/009 |
| V7 — Presentation/human | Complete state/accessibility strings, RTL side/portals/icons/long/mixed-direction names, both languages × all themes, live System changes/reduced motion; full viewport/reflow/zoom matrix, focus/contrast/landmarks/skip link; separate human/fluent reviews | US6; FR-024–027/031; SC-010 |
| V8 — Navigation timing | ≥20 real warm authenticated navigation trials timed through visible usable content or accurate actionable unavailable state; ≥95% ≤2 seconds; record device/network/build and raw sample/summary | US2.7; FR-028/030; SC-011 |
| V9 — Completion audit | Every claim tied to source/evidence/class; correct unsupported original claims, full contracts/dependencies, partial parents and exact IDs; inventory/ledger/totals/next work agree; explicit NEXT-05 decision | US7; FR-028–033; SC-012 |

Run mounted core journeys on Chromium, Firefox and WebKit where available; record exact exceptions under Q-11. In both languages, cover Light/Dark/System at 390×844, 768×1024, 1280×800, 1440×900, 1280×480 and 320 CSS-pixel reflow. Actual browser 200% zoom is separate from deviceScaleFactor or viewport resizing. Matrix reduction must remain a named gap rather than an inferred pass. Use actual System media changes and reduced-motion behavior. Screen-reader and fluent-Arabic acceptance require actual reviewers.

Use controlled browser faults to isolate deterministic client cases, then real isolated integration for current session/grants and transaction/pool requirements. Existing `test-workspaces-browser.mjs` is anonymous HTTP/source inspection and must be labeled accordingly; repair its misleading report/procedure instead of counting it as V2–V7. The standalone generation-counter test cannot pass V4/V6. Extend existing Node tests to load actual changed services/actions/handlers; do not add imitation state machines as implementation proof.

## Security Controls, Owners and Negative Proof

Accountable roles below need named execution/release owners. Retain inherited versioned ASVS 5.0.0 references from [Feature 005 authority](../../005-application-shell-sidebar/contracts/runtime-and-authority.md); no conformance/certification claim.

| Controls | Role | Concrete negative proof / suite |
| --- | --- | --- |
| SEC-002/005/006/008 | Identity + Security | Expired/revoked/banned authority, cross-origin mutations, returned/thrown sign-out failure, Activity/history, unsupported step-up denial; V4/V6. |
| SEC-009–015 | Workspace + QA | Foreign IDs, removed grants/revoked membership, lower-role direct calls/private replay, immutable original targets, invitations/final-owner safeguards; V4. |
| SEC-023/025/027–029 | Web + Security | Malformed/oversized fragments/selectors, inert hostile names, finite returns, cross-origin preference/action rejection, private cache isolation; V4–V7. |
| SEC-031/044/047/048/062 | Web + Operations + Security | No protected persistence or secrets/proof in stores/logs/analytics/URLs/captures; independently bound synthetic targets; V1/V4–V7/V9. |
| SEC-032/041–043/056 | Database + Operations | Direct verified transport, restricted roles, lock/transaction/history/rollback/cleanup and alternating-tenant pool isolation; V1/V4 plus real isolated evidence. No DB needed for help. |
| SEC-049–052/055 | Engineering + Security | Fresh exact lock/runtime/build-tool/managed/deployed advisory review, copied-component provenance if changed, matching tested artifact; current scan failures/unknown versions remain owned findings. |
| SEC-063/064 | Engineering + QA | Bounded reads/pages/timeouts and controlled delays/outages; no fail-open authority, false empty, selection/sign-out success or duplicate mutation; V1/V4/V6. |

No new files/finance/provider/delivery engine is added; consumed existing capabilities retain their prior release duties. Apply the [security gate](../../../docs/security/release-checklist.md). Planning approval cannot close Feature 004 G1–G6/AP-01–05 or grant production activation.

## Required Result Record

For each attempted case record: date/operator, feature FR/SC/SEC/root IDs, exact source commit plus dirty diff fingerprint, lock/build/runtime identity, environment/target alias and verified fixture prerequisites, capabilities, command and exit or browser action/assertion, browser/version/language/theme/viewport/motion, actual result and evidence class, sanitized capture/trace/journal reference and precise limitations. Record the last executed stage after an early failure; later stages are unexecuted.

Statuses are `PASS`, `FAIL`, `BLOCKED`, `SKIPPED`, `STALE`; each non-pass names missing coverage, dependency and owner. Do not convert an unexecuted check into not-applicable because its prerequisite was unavailable. Disabled capabilities may be excluded only with proof their privileged entry points/effects are inaccessible, and their activation remains gated.

## Completion Reconciliation

After implementation/verification, update Feature 005 plan/tasks/evidence with a dated correction linked to current raw results. Preserve original stable task IDs and historical provenance; reopen unsupported marks and keep manual/Arabic/real-integration gaps visible. Feature 006 tracks the corrective increment, not a duplicate shell completion.

Refresh root `plan.md` inventory, completion ledger, subtasks, totals and immediate next-work section together. Check full feature only against its unchanged contract/dependencies; keep partial parents unchecked. F04.01 includes broader discoverable controls, and NEXT-04 includes command/recovery proof beyond this shell. Do not shrink those requirements. Report exact IDs/subtasks changed, check results and remaining gaps, and whether NEXT-05 prerequisites are met. No client implementation, deployment, production activation or external message belongs to this increment.
