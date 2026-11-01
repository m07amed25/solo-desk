# Identity activation and release contract

Original G1–G6 meanings and actual findings are in [evidence.md](../evidence.md). This contract specifies work to close them; no gate passes merely because this plan exists.

## Authority invariant

`currentSession` must obtain fresh managed session authority with the installed SDK's string `disableCookieCache: "true"`, reject missing/malformed/expired/unverified/banned identities and verify the current database session/user using reviewed restricted read access. Return only trusted server identity/session facts; never expose credentials to the browser. Missing/revoked authority denies; provider/database failure throws a redacted unavailable condition rather than returning an empty workspace/profile.

Every `lib/workspaces.ts` export repeats or invokes this boundary, validates its arguments, and checks current membership/resource/action inside its own read or command transaction. No client role, workspace selector, layout or proxy can bypass it. Final effect statement rechecks managed account/session; workspace/grant changes serialize on the workspace row. External managed session revocation is ordered by the final successful authority observation; a previously authorized in-flight command may finish. State this limit in evidence rather than claiming cross-service atomic revocation.

Existing profile `loadProfile`, `saveProfile`, `/api/profile`, callback and account/sign-in page callers must remain compatible. `saveProfile(userId,name)` retains current errors/shape and own-identity check. Personal profile edits are explicitly exempt from team membership: membership loss does not erase or make the profile team-owned. `profileSql` must retain session-ID, verified, unexpired and non-banned predicates in both direct reads and sealed queries. Renewal revalidates authority; document the measured active-capability interval (existing setup describes 60 seconds) and live row removal. This phase adds no workspace live SQL feed; if one is later added, tenant/grant predicates and expiry must be sealed server-side and tested first.

## Default-off capability activation

Plan `lib/auth/capabilities.ts` and server-only `SOLODESK_AUTH_CREDENTIALS_ENABLED`, `SOLODESK_WORKSPACES_ENABLED`, `SOLODESK_WORKSPACE_INVITES_ENABLED` booleans with exact-string `true` enabling; absent/invalid is off. Client UI receives safe booleans from server shells, never secrets or authoritative role claims. Ownership transitions additionally require proven managed step-up support and fresh proof. Do not add a self-hosted Better Auth config or guess managed plugin availability.

Wrap catchall methods with a reviewed operation allowlist before the SDK handler. Inventory all actually installed SDK routes/methods, including modern/legacy reset requests, register, password sign-in, verification send/submit, reset execution, change/set password and account/credential linking paths. Unknown credential operations fail closed; independently approved social/session/sign-out routes remain available. Keep origin/CSRF protections and protocol callback handling. Server-side SDK calls must apply the same capability policy where they can bypass the catchall.

A public managed upstream may remain directly reachable: local proxy gating alone is incomplete. Activation ledger must record upstream credential/signup/recovery settings and demonstrate denied direct upstream operations when disabled. If provider cannot enforce the required disabled policy, keep that capability unexposed for release and escalate the managed limitation; do not claim the application flag solves it.

## Required isolated identity proof

Bind app/build URL, actual database branch ID/endpoint, managed Auth branch/base URL, webhook/sink identity and synthetic fixture namespace in one redacted target manifest, independently checked by the runner. A nonproduction-looking env label alone is insufficient. Do not copy real account data into tests or weaken production settings. Assert cleanup ownership before deletion.

1. Signup a real synthetic account and capture its challenge through the authorized signed delivery sink in memory. Verify wrong/expired/consumed/wrong-purpose codes fail and real verification unlocks the correct profile; preserve leading zeros.
2. Prove resend's effective lifetime/rotation/attempt policy; UI copy and timers match the actual approved managed values. Missing code/inbox is BLOCKED, not a skipped success.
3. Establish two real verified sessions, successfully reset with real proof, then demonstrate old password denial, new password login, both prior session denials with correct `/api/profile?userId=...`, failed old-code replay and live renewal removal. Require positive controls; do not skip the revocation assertions when login/setup fails.
4. Provision a true supported social-only synthetic identity; demonstrate recovery never adds unintended credential linkage. A random nonexistent address is not this fixture.
5. Compare known/unknown public recovery/signup/sign-in behavior against approved anti-enumeration policy; record status/body/size/timing samples, not just a single unknown-account error.
6. Complete approved Google/GitHub return/cancel/error/state replay/hostile-destination cases; record installed client and hosted service assurance separately. Do not assume local Better Auth overrides patch hosted auth.

Integration mode must exit nonzero on assertions/unavailable prerequisites; report BLOCKED separately from assertion failure. Only explicit `--self-check` runs offline checks and reports LOCAL. Missing challenge capture cannot reach a PASS line. Browser redirects use manual HTTP inspection where Location is asserted. No test fixtures mark a real customer verified or log credentials/proof.

## Release/rollback evidence

For each gate: source commit + dirty-diff identity, lock/build hash, environment/branch, fixture/policy versions, command, observed result, raw redacted artifact path, limitations, named owner/date, decision and retest. Screenshots without raw trace cannot prove auth/session behavior. Assign versioned OWASP ASVS 5.0.0 L2 requirements during the implementation security task, and verify those exact requirement IDs against the official standard rather than inventing IDs.

- Credentials activate only after G1–G4 plus relevant G5/G6; Q-08 Product/Security must approve effective password/challenge/abuse/recovery/factor policy.
- Workspace writes activate only after real PostgreSQL isolation/atomicity/owner tests, restricted-role proof, migration/recovery and applicable G4/G6; invitation delivery additionally requires key custody, shared limits and real G5 proof.
- On failure disable affected writers, ingress/provider capability and sender first; preserve accounts, accepted rows, receipts and audit. Keep compatible authorized profile/read flows. Do not restore old passwords, erase accepted data or run destructive down migration after writes.
- Restore in isolation suppresses historical outbox deliveries and reconciles external unknowns; expired tokens/revoked memberships stay invalid and restored managed auth material is invalidated before reopening.

Full production release also requires the repository security release checklist, advisory/deployed-version triage, actual origins/cookies/ingress, named incident owners, restore evidence and bilingual accessibility review. Broader Q-02/Q-05/Q-08/Q-11/Q-13/Q-16 decisions stay scoped to their existing owners. Planning quality approval is distinct from feature activation, merge or deployment.

## Capability Policy Specification (v1.0.0)

| Capability Identifier           | Environment Variable Toggle           | Default State   | Activation Requirements                                                     | Fallback / Rollback Behavior                                                               |
| ------------------------------- | ------------------------------------- | --------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `auth.credentials`              | `SOLODESK_AUTH_CREDENTIALS_ENABLED`   | `false` (`off`) | Canonical G1–G4 + G5/G6 release gates; Q-08 approval                        | Deny direct password/registration/recovery endpoints; keep approved social/sign-out intact |
| `workspaces.core`               | `SOLODESK_WORKSPACES_ENABLED`         | `false` (`off`) | Real PostgreSQL atomicity/isolation test pass; restricted role provisioning | Disable workspace creation/settings mutations; keep personal profile access unaffected     |
| `workspaces.invitations`        | `SOLODESK_WORKSPACE_INVITES_ENABLED`  | `false` (`off`) | Isolated delivery proof, KMS/AES-GCM key custody verification               | Disable invite creation/resend/dispatch; revoke pending invitation delivery safely         |
| `workspaces.ownership_transfer` | `SOLODESK_OWNERSHIP_TRANSFER_ENABLED` | `false` (`off`) | Provider-supported fresh reauthentication (≤ 5 min proof)                   | Return `CAPABILITY_DISABLED`; require manual support or defer owner demotions              |

Every toggle requires exact string `"true"` to enable; absent, undefined, empty, or other strings evaluate strictly to disabled (`false`). All server endpoints and Server Actions must enforce this capability matrix server-side before execution.
