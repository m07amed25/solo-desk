# Conditional Account Security Interface Contract

**Status**: required behavior and deny contract; **not a runnable API design or proof of managed support**. Research is negative for current managed MFA. Final wire paths/payloads, action-policy values and any additive app metadata require P2-CAP/P2-POL/Phase 01 prerequisites. No endpoint is created or allowlist widened by this document.

## Existing public surfaces and common boundary

Keep `/app/account`, `/sign-in`, `/sign-up`, the existing `/auth/callback` exchange and finite allowed returns. Extend the personal account section; no new dashboard or authentication backend. Distinguish the presentation `proxy.ts` from managed `/api/auth/[...path]` forwarding. Unknown/disabled operations remain denied by exact HTTP method/path; a credential flag cannot turn on MFA, passkeys or identity changes.

All protected reads and mutations use the existing server-only account/provider service boundary. Derive current verified/unbanned/unexpired account/session, preserve the intended original account/session and recheck before consequential provider effects. Personal account operations require no workspace membership; they do not transfer workspace/business authority.

For every eventual supported operation, finalize an exact allowlisted input/output schema from actual managed semantics. Reject actor/role/session/tenant claims, foreign refs, unexpected/duplicate/conflicting fields, malformed encodings and excessive body/page/query cost before expensive work. Use exact trusted origin and CSRF controls, secure cookie/transport/return behavior, safe error codes and `Cache-Control: private, no-store` on private success/error/status responses. Preserve read-only GET semantics outside validated provider protocol callbacks.

Adopt existing error categories where applicable: 400 invalid input, 401 invalid session, 403 denied capability/origin/operation without foreign disclosure, 409 stale/conflicting intent, 413 size bound, 415 media type, 429 enforced limit with truthful Retry-After, 503 unsupported/unavailable authority/admission. Final method-specific handling must be demonstrated, not inferred from HTTP 2xx alone. Missing/foreign refs must not reveal foreign existence.

## Operation obligations

These names describe required behavior, not assumed SDK functions or proposed generic command endpoints.

| Operation                        | Authority and required inputs                                                                                               | Accepted outcome / denial                                                                                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read own protection/capabilities | Current account authority; no submitted owner target                                                                        | Safe factual protection observation separate from action availability. Unknown/unavailable list is not empty/disabled. No new state written by reads                                                                                                |
| Start/confirm TOTP enrollment    | Explicit current owner, approved existing-method confirmation and supported setup/possession proof bound to original intent | Setup stays pending until provider confirmation. Complete setup additionally requires one-time recovery presentation/custody acknowledgement. Reject proof mismatch/expiry/replay; incomplete/unknown activation reconciles without rollback claims |
| Challenge enrolled sign-in       | Provider-issued restricted challenge context for the intended primary sign-in                                               | Create normal protected authority only after selected factor. No trusted-device, social, reset, passwordless, callback or cache bypass is approved                                                                                                  |
| Cancel/restart                   | Owned pending intent or supported public challenge context                                                                  | Stop unsent new effects, invalidate pending proof as supported and preserve accepted access. Already dispatched uncertain effects still reconcile; cancel is not external rollback                                                                  |
| Disable/replace TOTP             | Current owner + explicit consequence confirmation + supported fresh proof for exact action/target                           | Respect voluntary disablement and last-primary-route safety; replacement while enrolled preserves complete recovery configuration. No old-session downgrade                                                                                         |
| Generate/replace recovery codes  | Fresh owner authority under approved matrix and actual provider support                                                     | One-time confidential delivery, no later read-back, invalidation of older set and truthful uncertainty if delivery/commit cannot be confirmed                                                                                                       |
| Recover using a code             | Provider-supported limited recovery authority; bound primary/recovery proof according to approved matrix                    | Consume once, invalidate all pre-existing sessions, confirm replacement factor/current recovery material and require fresh protected sign-in. No ordinary access before completion; revoked original session is never restored for status/retry     |
| Reconcile outcome                | Current valid owner authority or an explicitly supported restricted recovery context; original operation correlation only   | Own safe accepted/rejected/pending/unknown status and current provider observation; status identifiers grant no authority or replay permission                                                                                                      |

No application service may accept `fresh=true`, client `verifiedAt`, factor-enabled flags, client-selected target snapshots or an opaque reference alone as proof. Existing revocation proof/action enums and lifetime remain unchanged until reviewed extension; do not duplicate the proof store.

## Confidential exchange and retry behavior

Passwords/codes/setup seeds or URIs/private keys/provider tokens/challenges never appear in logs, navigation URLs, analytics, ordinary method listings, persistent browser storage, support output or generic app-operation records. Necessary setup/challenge material may appear only in the dedicated supported confidential transient exchange. Do not send setup data to a remote QR/image/analytics service. A display URI is not permission to put it in browser navigation/history.

One-time secret response loss must not trigger read-back or blind regeneration. Use supported authoritative reconciliation and freshly authorized replacement when necessary. Local custody acknowledgement is not a remote backup guarantee. Provider APIs, SDK diagnostics, captures and errors must be reviewed for secret reflection.

Equivalent retries preserve original intent/target/digest. Different intent under a correlation ID fails. Reserve/consume according to real provider/app transaction guarantees; proof expiry or revoked authority stops every new dispatch, including resumed work. Unknown or partial provider commitment retains ownership/correlation and cannot release proof for another operation. Reconciliation of an already dispatched effect does not authorize a new one. A local rollback never undoes a remote commit.

## Conditional F02.12 and F02.13 extensions

Both expansions are **unselected**. Keep their direct application operations denied and retain the following obligations for a future explicit selection.

- **Email change**: fresh current owner; separate pending destination; required verification before accepted provider identity change; collision, cancellation/expiry/partial/unknown outcomes with accurate old/new access guidance and approved session handling. Stable account and business/workspace ownership stay unchanged.
- **Social link/unlink**: approved provider and verified identity control for the intended account; no matching-email-only implicit merge; foreign identity collision fails without disclosure/transfer. Unlink needs current action-bound proof and provider-enforced cross-family last-route safety, including direct-origin races.
- **Passkeys**: explicit owner registration, safe own labels/listings, verified challenge/origin/account, no secret projection; cancelled prompt/unsupported-device safe return; fresh owner removal, last-route concurrency and supported loss recovery. Primary passwordless is not an approved second factor.
- **Other passwordless/hardware-backed variant**: separate selection and method-specific issuance/registration/authentication/removal/recovery/session acceptance. Existence of a magic-link/email-OTP plugin cannot activate it.

No exact mutation routes or wire examples for these unselected operations are frozen now. Do not widen catch-all forwarding, update managed tables or add a backend merely to make the contract runnable.

## Unresolved policy values and protocol acceptance

P2-POL remains an explicit error: exact confirmation methods and their original-session preservation, proof lifetimes/success consumption, TOTP clock/replay windows, challenge expiry, retry/admission caps/windows/signals, listing/payload/time bounds and per-action session refresh/invalidation need product/security approval using demonstrated support. The chosen recovery revoke-all-prior-session outcome is fixed. No upstream default, five-minute revocation setting or local fixture approves the remaining values.

Before finalizing a supported interface, record exact installed package/API behavior versus hosted build/configuration, required account types, each operation's transaction/reconciliation/limits, complete enabled-entry challenge coverage and direct managed-origin enforcement. Require wrong-account/purpose/session, stale/revoked authority, replay/races, outage/unknown commitment, last-route removal and secret/cache denial. A hidden action, local mock or generated SDK type cannot pass this acceptance.

## Local execution checkpoint — 3 November 2026

[Scoped evidence](../evidence.md) records the implemented informational entry and current tests/gaps. This changes no protected-operation contract or policy value. Actual managed/human/Next-route acceptance and the full verification gate remain incomplete; F02.05/F02.12/F02.13 and delivery totals stay pending. Resolve support/policy and applicable inherited gates, then revise supported design/checklist/tasks/analyze before protected implementation; finish local acceptance before final convergence.
