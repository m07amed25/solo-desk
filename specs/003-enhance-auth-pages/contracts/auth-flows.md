# Contracts: Account Entry, Verification and Recovery

Implements [FR-001–FR-017](../spec.md). [Data ownership](../data-model.md) and [visual rules](../design.md) are complementary. All interfaces below are planned; hosted semantics require G1–G6 evidence in [plan.md](../plan.md).

## Public page contract

| Address                                           | Signed out                                                                               | Verified authenticated user             | Unavailable authority                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `/sign-up`                                        | Registration and social choices; inline verification after submission.                   | Redirect to `/app`.                     | Existing safe unavailable/retry state, no false sign-in success.       |
| `/sign-in`                                        | Password/social entry; inline unverified continuation and recovery request/reset.        | Redirect to `/app`.                     | Safe unavailable/retry state.                                          |
| `/auth/callback?entry=sign-in` or `entry=sign-up` | Existing validated SDK callback; failure returns only `authError=1` on initiating entry. | Fresh verified session leads to `/app`. | Generic initiating-entry failure.                                      |
| `/app`                                            | Existing sign-in redirect.                                                               | Current user's existing profile only.   | Existing retry/unavailable handling, never a fabricated empty profile. |

Keep canonical public addresses. Internal `/en/...` and `/ar/...` aliases remain denied as today. `normalizedAuthPath` continues to allow no query or exactly `authError=1`; email, code, password, recovery token, raw provider error and arbitrary `next` remain forbidden. Callback's SDK verifier protocol is retained and scrubbed by current middleware; no application password/code is added to it.

No `/verify-email`, `/forgot-password` or `/reset-password` public page is introduced. Language/theme preference forms keep their existing return path allowlist. Switching preference may reload the document and discard transient input; never serialize secrets to preserve it. Home and alternate-entry links remain present, localized and keyboard accessible.

## Email form and social composition

The existing server shell passes only safe entry/configuration values and the bounded `Auth` message subset to client form interactions. Keep existing social component behavior and coordinate all auth submission controls so one pending email/social operation prevents a second in-flight action. Do not import server-only auth/email/data modules into the client graph.

- Sign up: first name, optional last name, email, password, visible rules, Show/Hide password and Create account. Names use `given-name`/`family-name`; password uses `new-password`.
- Sign in: email, password using `current-password`, Show/Hide, Sign in and Forgot password. No registration names.
- Verification: clearly identified email destination, single code field, Verify email, resend/cooldown, correction/restart and return to entry. Password is absent from this step's state.
- Recovery request: email and Send recovery code; generic known/unknown acknowledgement.
- Recovery completion: destination, code, new password/guidance/visibility, Reset password, resend using the recovery request operation, and back to Sign in. No standalone code-precheck stage.
- Google/GitHub remain above the separator. Labels match entry intent; Apple/new providers are not added.

Inputs use existing Field/Input/Button primitives and linked errors/descriptions. New steps focus their heading or first meaningful input; failed submit focuses the first invalid field. Announce async status without announcing every countdown tick. Permit password/code paste and browser autofill. Only valid non-secret input survives recoverable errors.

## SDK transport contract

Use existing `createAuthClient()` and `/api/auth/[...path]`. All listed mutations are JSON POSTs to the same origin; no raw database writes or client-side provider secrets. SDK response/cookie processing remains authoritative for protocol exchange.

| Operation            | Browser API / payload                                                                     | Same-origin endpoint                         | Required observation                                                        |
| -------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| Register             | `signUp.email({ name, email, password })`                                                 | `/api/auth/sign-up/email`                    | Safe verification continuation; no protected access before ownership proof. |
| Password login       | `signIn.email({ email, password })`                                                       | `/api/auth/sign-in/email`                    | Fresh verified session or safe credentials/unverified/retry state.          |
| Resend verification  | `emailOtp.sendVerificationOtp({ email, type: 'email-verification' })`                     | `/api/auth/email-otp/send-verification-otp`  | Bounded acknowledgement; previous code invalidated by provider.             |
| Verify email         | `emailOtp.verifyEmail({ email, otp })`                                                    | `/api/auth/email-otp/verify-email`           | Single successful proof; then refresh session, not assume response shape.   |
| Request/reset resend | `emailOtp.requestPasswordReset({ email })`                                                | `/api/auth/email-otp/request-password-reset` | Same generic acknowledgement for existing/unknown identity.                 |
| Complete reset       | `emailOtp.resetPassword({ email, otp, password })`                                        | `/api/auth/email-otp/reset-password`         | Old password and sessions invalid; clear secrets, return to Sign in.        |
| Social entry         | Existing `signIn.social` payload with provider and fixed same-origin callback/error URLs. | `/api/auth/sign-in/social`                   | Existing supported provider exchange and safe return.                       |

**Version compatibility**: Test preferred reset-request path on the isolated managed branch. If it supports only Neon-documented `forgetPassword.emailOtp({email})` at `/api/auth/forget-password/email-otp`, select that method in implementation and record the capability fixture. No automatic two-path fallback. The installed server `auth.emailOtp.resetPassword` map points to `email-otp/passcode` and must not be used; browser dynamic paths do not share that mapping. The generic catchall needs no speculative repair.

Do not call `signIn.emailOtp`, `checkVerificationOtp` as authority, read-back OTP endpoints or generic arbitrary-path fetch helpers. Do not return a raw `token` from verification into application state, logs or URLs. Successful mutation only causes protected navigation after fresh authoritative verified session proof.

Recovery is for existing password credentials. Installed upstream reset logic can create a password credential for a social-only identity; the managed branch must be tested explicitly for this behavior. Under the current no-linking scope, adding that credential is forbidden. If prevention is unsupported, block recovery activation pending provider remediation or an explicit Q-08/spec change. Do not probe account methods through an email lookup or hide the behavior behind UI-only restrictions.

## Error and timing contract

| Class                                       | User-visible behavior                                                                | Authority/no-effect requirement                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Invalid local fields                        | Specific localized field guidance; preserve non-secret corrections.                  | Trusted boundary rejects invalid/excessive input too.                                     |
| Wrong password/unknown identity             | Same generic credentials failure and retry action.                                   | Match hosted raw response/status/navigation and bounded timing; no account disclosure.    |
| Valid password, unverified email            | Resume verification with safe destination context.                                   | No protected profile/action/subscription before verification.                             |
| Existing signup identity                    | Same safe public registration continuation prescribed by verified provider behavior. | No password overwrite, social linking, duplicate account or existence leak.               |
| Invalid/expired/exhausted code              | Generic unusable-code guidance and permitted resend.                                 | No verification/reset effects; enforce purpose and recipient binding.                     |
| Rate limit                                  | Retry guidance matching actual server policy; `Retry-After` when supported.          | Client timers never replace shared enforcement; unknown identities cannot evade it.       |
| Auth/network/mail outage or unknown outcome | Honest temporary failure/pending guidance and explicit recovery.                     | No invented success, blind mutation retry, credential replacement or duplicate mail send. |
| Provider cancellation/failure               | Existing initiating-page generic retry state.                                        | No raw error/secret reflected into HTML or route.                                         |

Map only allowlisted provider error codes to localized public messages. Unexpected provider text is not rendered verbatim. Do not normalize every failure into HTTP success or suppress diagnostics necessary for safe server operation; record only redacted operational error classes. Client masking alone cannot fix hosted enumeration and does not pass G3.

## Protected service contract

`currentSession()` continues to refresh trusted session authority with disabled cookie-cache reuse, validate actual expiry and fail closed on provider error; add explicit verified-email authority. Its callers include AuthEntryPage, callback completion, account page and `loadProfile`. `loadProfile` protects `/api/profile` and `saveProfile` and binds the expected ID to the session.

Retain parameterized SQL, current-session row join, ban and expiry predicates, `LIMIT 1`, field allowlist and user ID validation. Add `u."emailVerified" IS TRUE` to the sealed profile query as well as session enforcement so open subscriptions lose unverified access. Preserve denial on foreign user IDs, injected fields, expired/revoked sessions and bans. Signup never creates workspace membership or resource grants.

Prove provider and legacy verified-user compatibility. A legacy unverified identity follows supported verification; no server/client-supplied provider claim can bypass the verification predicate. If the hosted provider cannot provide verified ownership for its accepted social account, record the compatibility gate and resolve it before rollout.

All protected page/API/action/subscription paths retain private/no-store isolation and existing error contracts. Do not shared-cache sessions or return sealed profile queries to unauthorized requesters.

## Managed policy contract

Before activation, record approved effective values for password bounds, six-digit challenge lifetime/attempts, account/network rate limits, resend cooldown/rotation, recovery/factor behavior and reset-wide revocation. UI rules and timers must agree with provider authority. Use signed email `expires_at` for email copy; do not infer live challenge expiry from the client clock or publish local upstream defaults as managed policy.

Required planned branch configuration is email/password enabled, OTP verification required, signup permitted, verification dispatch on signup/sign-in, and supported automatic session establishment after verification. A setting change is an operational action requiring its existing environment authorization; this planning document does not execute one.

## Email and webhook contract

Keep `POST /api/webhooks/neon-auth` implemented in `app/api/webhooks/neon-auth/route.tsx` and its existing disabled-by-default configuration. Retain bounded raw-body verification, configured branch JWKS, Ed25519 signature/timestamp checks, purpose/recipient/expiry validation, six-digit parser and link-origin restrictions for existing supported event types.

For this feature use signed `send.otp` with `otp_type: email-verification` or `forget-password`; do not accept the purpose from an unsigned browser field. Preserve existing `send.magic_link` handling for compatibility, without introducing a link-based user flow.

Auth messages become bilingual: an EN section, AR section and bilingual subject/footer/help, with explicit `lang`/direction blocks and a single LTR code. Add a bounded auth-only layout presentation option if needed; existing contact emails keep their default output. No remote photo, tracking pixel, recipient-locale lookup, inferred-name language or locale-specific secret draft is added to emails. Expiry is taken only from the validated signed event and displayed clearly in both languages.

Delivery uses the existing event-ID/hash receipt and deterministic Message-ID. A completed duplicate is a no-op; changed payloads and claimed-but-uncertain deliveries are refused for reconciliation. Return success only on the existing accepted/duplicate-completed contract. Test real database uniqueness/concurrency and SMTP uncertainty; a successful response never proves inbox delivery.

## Asset and nonfunctional contract

Use the selected source only under [design.md](../design.md)'s provenance/crop/local-delivery rules. No third-party image request is required at sign-in. A missing image leaves a complete static panel and usable form. Desktop image requests are bounded; mobile does not fetch the background. Existing reduced-motion, preference, theme and privacy behavior remain intact.
