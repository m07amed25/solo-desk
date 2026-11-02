# Runtime, Service Authority and Evidence Contract

Covers FR-015–031 and US2/US3/US4. The state fields and transitions are defined in [data-model.md](../data-model.md). All behavior below is planned; existing implementation gaps remain open until corrected and tested.

## One Authority Boundary

`lib/application.ts` is server-only. Its uncached loader establishes current account authority, reads existing global capabilities, then calls existing authorized workspace services for one initial list page and optional selected context. A React render-pass wrapper deduplicates template/page reads. HTTP rechecks/actions call the uncached boundary and never reuse a prior request's identity/grants. Database/provider errors produce unavailable state; a failed authoritative query never becomes an empty list.

Keep account/session identifiers, membership and action checks within trusted services. Client `actor`, `role`, `capabilities`, route identifiers, selection cookies and generation counters are never accepted as authority. Exact current session/user SQL predicates from `loadProfile` must protect the shared session boundary where managed revocation is not independently proven; retain verified, non-banned and expiry checks and distinguish no session from store failure. Profile SQL/sealed-query checks remain intact.

Do not pass server-only actor/session or database-client overrides through action parameters. Existing domain services must check current membership, resource/action grants and expected revision inside the transaction before effects, and reauthorize private receipt replay projections. A generic own-operation acknowledgement for self-leave may remain minimal, following existing receipt policy; it must not leak team metadata after access loss.

## HTTP and Action Interfaces

| Interface | Input | Success / failure contract |
| --- | --- | --- |
| New `GET /api/app/context` | Session cookies; no user/role/workspace authority parameters and no query fields | 200 ready-account context, including explicit disabled/unavailable team state if only teams fail; 401 missing/invalid account; 503 account authority unavailable; 400 unexpected query. Error bodies contain stable generic code only, no private payload. |
| Existing `GET /api/workspaces` | List: optional unique `limit` and `cursor`; context: unique `workspaceId` only | Retain current list/context formats. Reject unknown/duplicate/conflicting fields, partial integers and malformed UUID cursors/IDs. Complete finite positive integer limits use default 20, cap 50; never fetch all pages automatically. No workspace metadata without current grants. |
| Existing `selectWorkspaceAction(workspaceId)` | One bounded UUID selector | Verify fresh account, active membership and current `workspace.select` plus readable context; set existing HttpOnly/SameSite/Lax host-only selection cookie only on success. Preserve HTTPS/production Secure handling. Client must re-read context before showing success. |
| Existing clear-selection action, tightened | Required expected stale selector used for request-cookie comparison | Require current account; clear only if the request cookie matches the expected stale selection. An already-cleared cookie is an idempotent acknowledgement. Concurrent cross-tab response cookies can still race: re-read context, remain concealed/unselected on mismatch and require explicit selection, never retarget a command. No cross-tab compare-and-swap guarantee. |
| Existing workspace actions | Existing typed command envelopes with explicit target/revision/operation ID | Preserve action return shapes and domain transactions. Enforce effective flags/grants before execution and replay; no new command handler in shell. |
| Existing `saveProfile(userId, name)` / profile GET/live renewal | Existing own-user contract | Preserve `invalidName`, `unauthorized`, `saveFailed`, success and sealed-query behavior. Workspaces may be disabled/unavailable. |
| Existing auth sign-out | Supported managed sign-out contract | Conceal/dispose private state before request; confirm absence/error correctly. Successful result leaves app; failed result shows retry and revalidates before private reveal. No `finally` redirect that invents success. |

Every JSON/protected/denial/redirect path is private/no-store. Preserve/merge `Vary: Cookie` rather than replacing framework variation. Expose no credentialed cross-origin access; keep exact-origin/framework mutation protection. GET context performs no application selection, membership, invitation or cookie-clearing effect; existing managed session renewal stays within its supported auth contract. Do not trust proxy/layout admission as service authorization.

## Required Prerequisites and Capability Gates

These are bounded integration prerequisites, not completion of Feature 004 or new authentication support. If an enabled journey cannot meet them, block its activation while retaining shell and personal-account development.

| ID | Required correction / activation condition | Affected source and concrete verification | Accountable role |
| --- | --- | --- | --- |
| AP-01 | Fresh exact account/session validation shared by shell and affected services; no implicit workspace/profile-Realtime dependency | `lib/auth/server.ts`, `lib/profile.ts`; exact-session deletion/expiry/banning and outage fixtures; real isolated managed-session checks | Identity engineering |
| AP-02 | Current read/select grants and action projection | `listWorkspaces`, `getWorkspaceContext`, `selectWorkspaceAction`: require active same-team membership and persisted allowlisted grants with matching workspace/scope. Shell choices require read+select. Project only effective grants, intersect role ceilings, never union role defaults back in. Remove a grant without changing role and prove both direct denial and missing UI capability. | Workspace engineering |
| AP-03 | Global and narrower capability enforcement at all consumed entry points, before SQL/private replay | All workspace reads require workspace gate; invite issue/resend/revoke/accept/list require workspace+invitation gate; transfer/sensitive owner changes require supported reauth and relevant existing gates. Ordinary permitted member operations remain available. Disabled direct requests produce no effects or forbidden fields. | Workspace engineering + Identity |
| AP-04 | Replay, scope and current-grant invariants retained | Consumed membership/settings/invitation commands and receipts: recheck current authority before returning private accepted-result fields; enforce exact workspace/resource/action predicates and last-owner/role ceilings at effects. Test revoked-grant replay and captured original target after switching. | Workspace engineering + QA |
| AP-05 | Supported reauthentication proof before sensitive ownership activation | `verifyFreshReauth` must not infer a challenge from `createdAt`/`updatedAt` or accept future timestamps. Until a provider-supported factor/step-up contract and Q-08 evidence exist, sensitive owner promotion/removal/transfer remain service-disabled. This plan adds no factor, provider, auth schema or worker. | Identity + Security |

Use the source flag names: `SOLODESK_WORKSPACES_ENABLED`, `SOLODESK_WORKSPACE_INVITES_ENABLED`, `SOLODESK_OWNERSHIP_TRANSFER_ENABLED`, and existing `SOLODESK_AUTH_CREDENTIALS_ENABLED`. They are default-off in the capability module; do not invent `SOLODESK_INVITATIONS_ENABLED` as a replacement. The existing opt-out `SOLODESK_REAUTH_DISABLED` is not proof of positive step-up capability. False configuration and unavailable support must fail closed. Review narrower behavior using these existing switches; no new feature-flag service.

Canonical Feature 004 G1–G6 remain owned hosted compatibility, approved identity policy, challenge/session invariants, protected authority, delivery/operations and release evidence. Source corrections do not close real integration, Q-08, migration/delivery, restore, named sign-off or deployed-advisory gaps.

## Client Lifetime and Switching

One ApplicationRuntime reuses/refactors the existing `LiveProfile` conceal, abort, generation, expiry and pagehide/pageshow/focus/visibility safeguards. Coalesce overlapping lifecycle reads; maintain at most one current context recheck. Keep the existing 55-second visible-tab recheck interval as UI concealment behavior, plus the authoritative expiry timer and immediate checks on foreground, route entry and protected interaction. Server operations always check current authority; this interval is not a grant-revocation allowance.

- First document hydration may adopt its fresh server bootstrap; a presentation-only document marker may distinguish it from later cached template mounts. Do not treat every mount's serialized props as a new trusted request. On cached entry/history restoration, conceal before paint and require a current context result.
- A denied template must render non-private recovery even if it withholds children: validate the current browser pathname against the three app paths and redirect to sign-in with that finite return and an empty fragment. Keep page-level server redirects where pages execute, but do not depend on a withheld child to perform the only redirect. No private DTO bridge is needed.
- Shell links invalidate/conceal before transition; a pre-paint pathname check covers back/forward/programmatic navigation. Disable speculative private-link prefetch in this first slice. Template reset does not replace lifecycle authority checks, and deeper/search-only routes must participate if later added.
- On `pagehide`, synchronously conceal the private DOM before browser snapshot. `pageshow`, focus/visibility restoration and expiry recheck/deny before reveal. Do not promise remote erasure of already displayed/downloaded content.
- On identity change, discard old profile/team/proof state and refresh the actor-bound route before revealing. Same-actor grant/selection changes discard and remount the team subtree; old server-rendered private children cannot be shown merely because a new context GET passed.
- Serialize cookie-setting selection actions. Abort pending reads and increment generations before switching; do not assume abort cancels a committed server action. Clear old arrays/dialogs/drafts, and ignore old-generation mutation/list completions for presentation while retaining their original scoped receipt reconciliation.
- Profile form data/live renewal remains personal. Preserve the existing exact-actor subscription guard and cleanup; share account lifecycle instead of running a second general session polling loop. No new workspace subscription or global event bus.
- On failed selection or sign-out, keep the affected private content concealed until a successful explicit recheck. Recoverable form errors preserve allowed in-memory input. Unknown command outcomes must not be “retried” with a new operation ID.
- A successful empty authorized-choice list uses “no available workspaces”; it does not prove absent memberships after grant removal. Keep that result distinct from failed reads and restricted selected context without adding an unneeded membership count.

## Security Verification Matrix

All statuses are **planned / evidence pending** unless the planning evidence table in [plan.md](../plan.md) explicitly records a local command. Role ownership below needs named release sign-off before activation. Selected versioned ASVS targets were checked against the official stable 5.0.0 chapters; this is a scoped mapping, not L2 certification.

| SEC controls | Selected ASVS 5.0.0 references | Owner | Required negative proof |
| --- | --- | --- | --- |
| SEC-002/006 | 7.2.1, 7.4.1, 7.4.2, 7.4.4 | Identity + QA | Expired/revoked/banned identity denied; successful/failed sign-out, cached route and old-tab behavior. |
| SEC-005/027/029 | 3.5.1, 3.5.3, 3.7.2 | Web + Security | Cross-origin preference/selection/action denied; external/duplicate/fragment return rejected; explicit fragment-clearing redirects. |
| SEC-008/015 | 7.5.3 (additional L3 target), 8.2.1 | Identity + Workspace | Unsupported ownership step-up remains disabled; wrong-recipient/reused/revoked invitation and last-owner operations grant no authority/effect. |
| SEC-009–014 | 8.1.1, 8.1.2, 8.2.1–8.2.3, 8.3.1, 8.4.1 | Workspace + QA | Foreign IDs, forged cookie, removed action grant, role ceilings, stale revision and private receipt replay; zero forbidden fields/effects. |
| SEC-023/025/028/031 | 3.2.2, 8.2.3 | Web + Security | Malformed/oversized fragments and selectors; inert hostile names; user/team cache reuse and stale-response denial; no protected persistence. |
| SEC-041–044/047/048/062 | 8.3.1, 8.4.1 (authority subset) | Workspace + Operations + Security | Restricted DB role, pooled alternating tenants, exact projections, no secrets/proofs in logs/props/analytics/evidence and synthetic isolated fixtures. |
| SEC-049–052/055 | Supply-chain/build review under repository controls | Engineering + Security | Fresh exact graph/deployed advisories, official copied-component provenance and matching source/build; no unreviewed dependency additions. |
| SEC-063/064 | Bounded failure behavior under repository controls | Engineering + QA | One bounded page/context; slow/error/reordered reads; outage never creates empty data, new authority, selected/signed-out success or duplicate mutations. |

Primary stable references: [ASVS authorization](https://raw.githubusercontent.com/OWASP/ASVS/v5.0.0/5.0/en/0x17-V8-Authorization.md), [session management](https://raw.githubusercontent.com/OWASP/ASVS/v5.0.0/5.0/en/0x16-V7-Session-Management.md), [web frontend](https://raw.githubusercontent.com/OWASP/ASVS/v5.0.0/5.0/en/0x12-V3-Web-Frontend-Security.md). Additional transport/header and unchanged provider policy checks remain under [the release checklist](../../../docs/security/release-checklist.md); do not infer exclusions from this scoped table. No file, finance, provider integration, draft encryption or new job is introduced, so their implementation work is outside this shell; preserved existing flows keep their existing release obligations.

## Evidence Classes and Stop Conditions

Local mocked contracts prove only their stated cases. Actual authenticated browser tests must exercise the UI; isolated PostgreSQL/session tests must call real authorized services with restricted runtime credentials. Source text/self-checks/anonymous HTTP do not substitute. Manual keyboard/screen-reader/zoom/contrast and fluent-Arabic review need separate recorded results.

Block affected enabled journeys on AP-01–05 failures, identity/tenant bypass, proof/secret exposure, unsafe persistence or missing required integration evidence. Do not repair an unproven provider by weakening the gate. Record build/source/lock/environment, capabilities, fixture/target identities, command/result/artifact, reviewer and remaining gap per [security release requirements](../../../docs/security/release-checklist.md). Update root `plan.md` only for implemented and verified behavior; Phase 1 design checks do not check off F04.01 or NEXT-04.
