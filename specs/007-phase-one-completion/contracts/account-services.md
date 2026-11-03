# Account Service Contracts

These are proposed app interfaces for implementation. No new endpoint or managed-provider capability exists merely because it appears here. G1/G2 in [the plan](../plan.md#readiness-gates-and-error-handling) block dependent execution. Preserve existing `/api/profile` and profile action behavior while reconciling required concurrency.

## Common boundary

All protected calls derive a fresh verified, unbanned, unexpired account/session server-side, recheck relevant current authority and return strict allowlisted projections. No workspace membership is required. Mutations require exact trusted-origin/framework CSRF controls, bounded body/content-type validation and permitted keys; submitted actor IDs, roles, raw session tokens and provider freshness claims are rejected.

Use `Cache-Control: private, no-store` on successful and error responses. Return stable error codes with localized UI mapping and correlation ID, never provider stack/errors or credentials. 400 invalid input; 401 invalid session; 403 denied origin/operation without object disclosure; 409 stale/conflicting intent; 413 over-bound input; 415 unsupported content type; 429 enforced limit with Retry-After; 503 unavailable capability/authority/admission. Missing/foreign object responses must not disclose foreign existence. Request/body bounds apply before expensive work; proposed JSON maximum is 4 KiB.

Existing valid session checks, ordinary sign-out, own settings reads and permitted reconciliation do not depend on the new-attempt admission service being healthy. No endpoint may bypass current identity merely because the limiter is down. Unknown outcomes are first-class states.

## Preferences — proposed `/api/account/preferences`

| Method | Request                                                           | Accepted result                                                                                     |
| ------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| GET    | No user/workspace target                                          | `{preferences:{locale,timezone,optionalAccountEmail,revision}, isDefault}` for current account only |
| PUT    | Exactly `{expectedRevision,locale,timezone,optionalAccountEmail}` | Updated accepted own projection and incremented decimal-string revision                             |

GET with no persisted row returns explicit defaults/revision `"0"` without inserting. Supported locale is `en`/`ar`, timezone must be recognized, optional email is a boolean and default false. Personal locale absence/default must remain distinguishable to the browser/account fallback resolver. Reject extra/protected fields, malformed revisions and foreign actor targets. Creation/update is compare-and-set; two equal-base writes have one winner, loser 409 with only own accepted projection. Lost acknowledgement triggers own GET/revision/value reconciliation, preserving editable input and showing uncertainty until resolved. No duplicate effect is inferred from a blind retry.

This does not save browser presentation, team defaults, provider name or newsletter subscription. Security/recovery/verification mail remains required. Name continues through its separate current owner and cannot be advertised stale-safe until G2 proves conditional update; do not acknowledge a combined atomic name/preferences operation.

## Sessions — proposed `/api/account/sessions`

GET returns `{items:[{reference,current,createdAt,lastActiveAt,expiresAt,deviceLabel}], nextCursor, complete}`. Optional unavailable metadata is null/labelled unknown; user agents are untrusted display text. `reference` is an opaque account-scoped app handle, not a bearer token. Current indicator derives from the actual original session, not browser input. Proposed page size 20/max100; opaque cursors bind current account, stable ordering and snapshot as required by verified provider behavior.

Never return raw SDK results, IP addresses, tokens, provider grants or arbitrary metadata. Listing can be unavailable while ordinary account use/sign-out remains valid. Do not mint false fresh proof to satisfy upstream listing freshness. Incomplete/oversized/unbounded upstream enumeration cannot authorize revoke-others; report a supported unavailable state and keep G1 open.

Ending the current session invokes existing ordinary sign-out. Other-session revocation goes only through the app confirmation/command contract. Raw managed revoke endpoints must not be exposed as a way around it; provider-origin enforcement is an independent G1 requirement.

## Confirmation — proposed `/api/account/reauthentication`

POST begins an intent with exactly `{action,targetReference,method}` for a selected session, or `{action,method}` for other sessions. Action is `revoke_session`/`revoke_other_sessions`; target ownership/current exclusion is checked server-side, and a complete authoritative target snapshot is frozen before confirmation. Return only an opaque `confirmationId` and allowed next UI state; no provider credential/challenge or proof-bearing URL is reflected into logs/analytics. IDs alone grant no authority.

Password confirmation accepts the actual password only through the supported same-origin body, never persistent browser storage or operation records. Social confirmation uses an exact origin/allowed return, purpose-bound state and the original account/session. No email-code confirmation fallback, new password enrollment or linking. The adapter must verify fresh authentication for the same account without silently replacing the original session. A normal callback, consent/account picker, `getSession`, token issuance time or cached session is insufficient.

Provider completion feeds a server-only verification function; do not define a browser endpoint that accepts `verifiedAt` or `fresh=true`. The verified authentication event must be bound to this intent and cannot predate its issuance under the reviewed provider clock policy. Auth challenge responses remain confidential and expire under reviewed provider policy. The only minted app proof binds original account/session, action, exact target snapshot/digest, verified existing method and trusted authentication time, with expiry exactly five minutes later.

GET status for an owned confirmation may return `pending`, `verified` plus safe expiry/method, `cancelled`, `expired` or `unavailable`; it never returns provider material. A different identity/session cannot resume it. Cancelling or leaving the form cannot revoke anything. Existing dirty-form navigation protections govern social departure; do not persist protected drafts to survive it.

## Revocation — proposed `/api/account/session-revocations`

POST exactly `{operationId,confirmationId}`; action/targets come from the server-owned confirmation. Claim/reserve proof atomically under current session, original account/session/target match and `now < expiresAt`, with one operation ID/digest. Return a safe receipt `{operationId,state,results}`; each result contains only the opaque target reference and `revoked`, `alreadyAbsent`, `failed`, `unknown` or `pending`. No raw token. A 202 receipt can mean work/status is unresolved, never success. Known individual success means exactly that selected session loses subsequent access; known complete bulk success means every frozen target is resolved and current session remains valid.

One successful revocation action consumes proof; concurrent/replayed use for another command produces no new effect. Once reserved, equivalent retries/status reads reuse the original operation, not a newly evaluated list. Do not dynamically enlarge bulk scope to new sessions. Immediately before each new target dispatch, including resumed bulk work, recheck the original session's current authority and original proof expiry; a prior reservation cannot authorize work after that session is revoked or proof expires. Partial state remains visible, and no undispatched target is started after proof expiry. Already dispatched uncertain effects may be reconciled without extending proof or granting a second action; remaining new work needs explicit fresh confirmation.

Proposed GET `/api/account/session-revocations/{operationId}` returns only current-authorized own status. A changed intent under an existing ID is 409. Foreign/mismatched references reveal no foreign data. External call timeout, process crash or ambiguous reply yields `unknown`; local rollback cannot undo provider revocation. The adapter must demonstrate safe same-target status/idempotency/reconciliation before retries are enabled. Never release reserved proof solely on timeout or an inconclusive list.

## Adapter capability acceptance

Each real adapter method must have pinned SDK/managed build evidence for `listOwnSessions`, `resolveOwnTarget`, `verifyExistingMethodFreshness`, `revokeExactTarget` and `reconcileOutcome`. These are behavioral boundary names, not assumed Neon methods or a generic provider framework. Use small functions at the existing server-only auth boundary. Do not implement unsupported calls by reading password hashes, changing credentials or mutating auth tables.

Required evidence includes the installed revoke-all/revoke-other path discrepancy, sessionId/token shape discrepancy, creation-age list rejection, raw payload redaction, preserved original session, password challenge freshness, Google/GitHub verified freshness and direct-origin bypass denial. Method flags remain false if any required proof is unavailable. Separate supported ordinary social sign-in from unsupported social reauthentication.

## Existing auth, recovery and sign-out

Reconcile local auth method+path allowlisting and the missing request-reset operation against the actual managed protocol before enabling it. Preserve exact return destinations `/app`, `/app/account`, `/app/workspace` and existing callback/error normalization. Unverified/disabled identities never receive protected service access; unknown/social-only reset requests give non-disclosing outcomes without adding credentials. Successful approved reset invalidates old password and all prior sessions, then requires fresh sign-in.

Shared admission applies to new registration/sign-in/verification/resend/recovery/reset/reauthentication and existing public submissions; direct managed-origin equivalents need provider enforcement too. Limiter unavailable means 503/no new effect, not an in-memory fallback. Already admitted flows may reconcile only their original operation under valid authority; no new unlimited attempt is created. Ordinary sign-out remains exempt from step-up/admission outage, inspects returned and thrown errors, conceals private content and reports uncertainty honestly. Exact cookie/ingress/CSRF/private-cache behavior is verified on the deployed artifact before acceptance.
