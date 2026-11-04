# Research: Stronger Account Sign-in Controls

**Date**: 2026-11-03. **Scope**: local source/package inspection and fresh public primary documentation. No hosted target, secrets, provider mutation, migration or account test was accessed.

**Conclusion**: available research is complete for the bounded investigation plan; positive managed acceptance and POL-03 remain **ERROR/BLOCKED**, not research-derived defaults. Conditional Phase 1 artifacts document ownership/invariants only. They cannot finalize supported mutation payloads or authorize protected-effect implementation.

## R1 — Preserve managed ownership; do not infer MFA from installed plugins

**Decision**: keep F02.05 blocked under the currently documented managed contract. No backend change, plugin installation or SQL workaround.

**Evidence**: [Neon roadmap](https://neon.com/docs/auth/roadmap) still lists MFA as coming soon; [supported plugins](https://neon.com/docs/auth/guides/plugins), updated 30 October, describes a managed subset without two-factor or passkey. Installed `@neondatabase/auth` 0.7.0-beta fixes its client plugin array in `node_modules/@neondatabase/auth/dist/adapter-core-N_pQf5vS.mjs`; two-factor/passkey are absent. Upstream `better-auth`/`@better-auth/passkey` 1.7.14 contain plugin code, which is a different capability boundary.

**Rationale**: a wrapper type, dependency or custom UI cannot enable a hosted plugin. No accepted target mapping/version/configuration exists. Unsupported MFA remains an open specified feature, even if an explanation-only account section is built independently.

**Alternatives considered**: self-managed Better Auth, a second auth backend, direct managed-table writes, custom TOTP/recovery and marking hidden controls complete. All conflict with selected ownership/scope or required evidence and are rejected.

## R2 — Every-entry coverage is stronger than upstream defaults

**Decision**: acceptance must test all enabled password/social/reset/recovery and any future passwordless paths at both app and managed origin. No partial default challenge coverage can activate selected MFA.

**Evidence**: installed `better-auth/dist/plugins/two-factor/index.mjs` hook matcher checks only `/sign-in/email`, `/sign-in/username` and `/sign-in/phone-number`; it does not hook social, magic-link or passkey sign-in. A trusted-device cookie branch also exists. [Upstream two-factor documentation](https://better-auth.com/docs/plugins/2fa) describes an upstream plugin, not SoloDesk's managed contract.

**Rationale**: the selected policy requires protection on every enabled entry for enrolled owners. Upstream possession/creation-age/device-trust defaults cannot silently weaken this rule. No trusted-device challenge bypass is selected. Provider-enforced alternative behavior requires explicit compatible policy review and a spec change if its assurance changes.

**Alternatives considered**: an app-only post-login screen, merely enabling the plugin, inferring social freshness from a callback, disabling all social sign-in globally without approval. None supplies accepted direct-provider protection under current scope. A proposed path restriction requires explicit review and regressions, not a hidden workaround.

## R3 — Recovery needs a supported recovery-only authority contract

**Decision**: require proof that code recovery consumes once, invalidates all pre-existing sessions including an initiating authenticated session, restores a confirmed replacement factor, refreshes exhausted recovery material and then requires fresh protected sign-in. No unrestricted factor-free session is accepted between these steps.

**Evidence**: upstream backup verification can return a normal session through its success helper, so it does not establish the selected lifecycle. `better-auth/dist/plugins/two-factor/backup-codes/index.mjs` includes conditional consumption with `adapter.incrementOne`, replacement generation and a `createAuthEndpoint.serverOnly` read-back helper. The read-back helper is **not** a public HTTP endpoint; nevertheless the product must expose no read-back route. Source-level conditional consumption is not hosted concurrency proof.

**Rationale**: app status cannot use a deliberately revoked original session as continuing authority. Any restricted recovery transaction must be provider-established, purpose/account bound, time/attempt bounded under POL-03 and unusable for profile/business access. A locally minted bearer/provisional session would be a homemade protocol and is rejected.

**Alternatives considered**: ordinary sign-in after a backup code, email-only recovery, support override, app-side factor disable/re-enrollment or an assumed provider session rollback. These bypass selected constraints or lack managed support.

## R4 — Identity/passkey scope stays conditional and unselected

**Decision**: preserve optional requirements without activating or designing an assumed runnable mutation interface.

**Evidence**: [managed user management](https://neon.com/docs/auth/guides/user-management) explicitly says email changes are unsupported despite introductory text. [Managed OAuth setup](https://neon.com/docs/auth/guides/setup-oauth) partially documents linking through a Microsoft unverified-email failure; that does not prove approved Google/GitHub link/unlink, collision, session/fresh-proof or cross-family last-route behavior. Upstream link/unlink/email-change/passkey routes exist, while local capability allowlisting denies these operations. Passkeys remain absent from the managed wrapper/plugin subset.

**Rationale**: neither blanket absence nor full support follows from partial documentation. Explicit linking remains distinct from ordinary social entry; matching email never proves another account's authority. Primary passwordless is not a selected second factor.

**Alternatives considered**: enabling every upstream method with the credential flag, assuming a generated email-change type works, silently implementing optional expansion or replacing the provider. Rejected.

## R5 — Reuse current proof/session boundaries after owning prerequisites pass

**Decision**: current app services/runtime remain owners. Correct inherited defects in Feature 007; only then consider supported extensions.

**Evidence**: current production routes pass no real password/revocation adapters; Google/GitHub fresh proof is unavailable. Existing actions are revocation-only with exactly five-minute proof. The installed Neon `revokeOtherSessions` runtime maps to `revoke-all-sessions`; upstream uses `/revoke-other-sessions`. Installed upstream individual revoke expects `token`, while the [current managed server reference](https://neon.com/docs/auth/reference/nextjs-server) describes `sessionId` under the newer `@neon/auth` package. These differences must be reconciled, not guessed. Upstream freshness checks session creation age, not action-bound reauthentication.

**Rationale**: do not duplicate proof/session systems, silently replace original cookies or expose raw tokens. Authoritative target resolution, per-dispatch authority and same-operation conflict/concurrency proof remain Feature 007-owned. Existing table/actions cannot be broadened by just editing an enum.

**Alternatives considered**: sign-in-as-reauthentication, `getSession` as fresh proof, provider token readback to clients and a new generic adapter framework. Rejected.

## R6 — Application locks and trusted domains cannot enforce the entire provider policy

**Decision**: direct managed-origin enforcement and provider transaction semantics are explicit activation prerequisites. Last-route integrity must span social/factor/passkey changes, recovery and concurrent tabs; app-only locks do not establish it.

**Evidence**: [authentication flow](https://neon.com/docs/auth/authentication-flow) describes the managed REST service. [Trusted domains](https://neon.com/docs/auth/guides/configure-domains) governs redirects, not application action policy. Upstream unlink counts accounts; that does not prove the selected cross-family route/recovery invariant or atomic races.

**Rationale**: denial at the local catch-all, hidden controls and CORS do not establish denial of authenticated direct requests. Provider-supported current authority, proof consumption, recovery consumption/replacement and safe concurrent state transitions need actual evidence.

**Alternatives considered**: global app mutexes, UI-only disablement, a local post-change rollback or blind retry on timeout. Rejected.

## R7 — No new persistence is justified before supported protocol design

**Decision**: use the logical [data model](data-model.md); do not introduce a migration or duplicate credential records. A minimal durable app intent/outcome record is conditional only if the demonstrated provider protocol cannot supply required cross-request correlation/reconciliation.

**Rationale**: factor seeds, code verifiers, passkey keys/challenges and account linkage remain managed. Existing account events/admission can be extended after inventory/purpose/retention approval. If app metadata becomes necessary, reuse existing boundaries and plan additive immutable migrations after applied-history review, one-client claim/event transactions and bounded indexes. Never keep provider I/O in a long DB transaction or claim atomic app/provider commitment.

**Alternatives considered**: app-owned recovery-code tables, shadow MFA flags, generic workflow/outbox tables and modifying applied migration files. Rejected absent a demonstrated need.

## R8 — Exact policy values remain owned, not researched into approval

**Decision**: POL-01/POL-02 product directions and unselected optional scope are fixed as recorded. POL-03 remains an explicit **ERROR/BLOCKED** dependency. Research resolves its disposition, not its missing numerical values.

**Required approval matrix**: for enrollment, confirmation/challenge, disablement/replacement, code generation/replacement/recovery and later selected email/link/unlink/passkey actions: existing confirmation methods, original-session preservation, proof issue/expiry/consumption, challenge expiry/clock/replay/attempts, shared admission purpose/caps/window/signals, session survival/refresh/revocation, cancellation/unknown-outcome/reconciliation, last-route eligibility and evidence source. Recovery's revoke-all-pre-existing-session requirement cannot be relaxed by this matrix.

**Rationale**: public defaults and synthetic fixtures cannot approve security policy. The spec explicitly permits investigation first and leaves two quality items open; this plan must not erase those items or generate dependent effect tasks prematurely.

**Alternatives considered**: copying Phase 01's five-minute proof, upstream ten-minute temporary cookies, default TOTP windows/code counts or fixture rate limits into every new operation. Rejected.

## R9 — Version/advisory findings need exact applicability review

**Decision**: retain P2-RELEASE as blocked; no automatic upgrade or clean-security conclusion.

- [GHSA-965c-763c-88jm](https://github.com/better-auth/better-auth/security/advisories/GHSA-965c-763c-88jm) fixes OAuth-state/Magic-Link confusion in 1.7.7. The inspected local 1.7.14 is outside that published affected range; the hosted version/configuration is unknown.
- [GHSA-xg6x-h9c9-2m83](https://github.com/better-auth/better-auth/security/advisories/GHSA-xg6x-h9c9-2m83) fixes premature cached-session MFA bypass in 1.4.6. The local version is later; pre-challenge cached access still needs regression acceptance and hosted applicability remains unknown.
- The [maintainer changelog](https://better-auth.com/changelog) lists 1.7.15 on 1 November 2026, after installed 1.7.14, including secret-bearing diagnostic, user-primary-key and banned-session handling corrections. Assess actual reachability and supported upgrade paths; a later security-relevant fix is not by itself a confirmed exploitable defect in this app or its hosted provider.
- Existing Feature 007 audit records 27 affected package entries (8 low, 19 moderate). This plan did not rerun npm audit, inventory deployed/bundled/native components or obtain reviewer acceptance. No vulnerability count is inferred from the public-source sampling.

**Alternatives considered**: trusting a previous audit as current conformance, assuming local overrides patch the hosted service or running forced dependency updates during planning. Rejected.

## Investigation exit and next design decision

1. Operations/identity verify a currently authorized isolated app/auth/database/role/synthetic-sink target; no production-derived fixtures or environment-file inference.
2. Identity/security obtain documented actual managed support for the selected complete operation set, with version/configuration and direct-origin enforcement; do not run positive MFA tests where support is still absent.
3. Establish same-account/session proof, all-entry challenge, protected recovery, all-prior-session invalidation, no-read-back, cross-family concurrency and authoritative reconciliation.
4. Product/security approve POL-03 from supported observations; revise the spec/register and revalidate its two open checklist items.
5. Finalize only the supported wire/data design and applicable threat/ASVS/control review, then checklist → tasks → analyze. If no conforming managed capability exists, keep F02.05 pending and record the vendor/architecture blocker; there is no approved substitute here.

Research agents completed two read-only workstreams under the explicitly invoked plan workflow: managed-capability research and repository boundary/validation research. Their findings were consolidated and key installed-source/public findings inspected by the primary agent. No agent edited product files or performed a live campaign.
