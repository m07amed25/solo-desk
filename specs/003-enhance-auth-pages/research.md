# Research: Enhanced Sign In and Sign Up

Researched 2026-10-30. Local source and installed SDK inspection plus current primary documentation; no hosted settings, database records or mailboxes were accessed. This resolves design choices and identifies implementation evidence gates; it does not certify the managed deployment.

## R1 — Keep managed identity and current transport

**Decision**: Reuse `authClient`, `auth.handler()`, the current callback and fresh-session service. Use browser SDK email/password and Email OTP APIs; no self-hosted Better Auth server, additional plugin installation, Supabase migration or custom credential storage.

**Rationale**: Installed `@neondatabase/auth` 0.7.0-beta already has the OTP browser client. The current SDK's Next handler joins catchall path segments and forwards method/body through `handleAuthProxyRequest`/`handleAuthRequest`, preserving its cookie protocol. Its server API mapping is not a proxy allowlist. [Neon documents managed OTP support](https://neon.com/docs/auth/guides/plugins/email-otp), including verification and password recovery.

**Alternatives considered**: Installing a generic prebuilt auth UI, self-hosting auth, adding a raw credential proxy or adding an OTP table all duplicate existing responsibilities and increase compatibility risk.

**Installed-code evidence**: `node_modules/@neondatabase/auth/dist/next/server/index.mjs`; `dist/server-i57Km2d6.mjs`; browser client/plugin declarations and local `better-auth` Email OTP implementation. Exact generated filenames may change on upgrade; re-resolve before implementation.

## R2 — Code verification and code recovery

**Decision**: Registration uses `signUp.email`, verification uses `emailOtp.verifyEmail`, resend uses `emailOtp.sendVerificationOtp` with `type: email-verification`. Recovery uses `emailOtp.requestPasswordReset` and `emailOtp.resetPassword` from the installed browser API. Keep verification and recovery purposes distinct and require fresh server session authority before `/app`.

**Rationale**: The requested reference selects code verification. Code-based recovery also satisfies the no-secret-URL requirement and needs no reset-token route. A successful verify response is not assumed to contain `data.session`; refresh authoritative session state. [Neon verification](https://neon.com/docs/auth/guides/email-verification) confirms numeric-code signup and required console settings.

**Compatibility finding**: The installed server map for `auth.emailOtp.resetPassword` points to `email-otp/passcode`; do not use that server method. Browser reset uses `/email-otp/reset-password` through the generic existing handler, so no handler repair is indicated. Neon currently documents the older `forgetPassword.emailOtp` request method at `/forget-password/email-otp`; installed local Better Auth 1.7.14 prefers `/email-otp/request-password-reset`. G1 must test the modern route first and record the supported branch contract. If only the documented legacy route works, select that typed browser method once and record it; never runtime-fallback after an unknown send outcome.

**Alternatives considered**: Verification links would diverge from the supplied reference. Link recovery adds secret URL handling. `signIn.emailOtp` introduces passwordless login and is expressly excluded; checking an OTP separately before reset is unnecessary and adds a state/race.

## R3 — Effective managed policy is separate from local SDK defaults

**Decision**: Use managed enforcement; G2/G3 must capture and approve effective policy and prove required invariants before credential rollout. Do not invent constants from examples or promise unsupported controls.

**Rationale**: The [managed email/password API](https://neon.com/docs/reference/api/auth/update-neon-auth-email-and-password-config) exposes activation, OTP/link method, required verification, auto-sign-in after verification, verification-dispatch flags and signup disabling. It does not establish configurable password bounds, OTP lifetime/attempts, resend rotation/limits or reset-wide revocation. The hosted version/configuration is not proven by installed overrides.

| Policy               | Current evidence                                                                                                                                                      | Required implementation record                                                                                                                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OTP format           | Current webhook parser and provider payload specify six ASCII digits.                                                                                                 | Prove real branch codes match, including leading zero; retain as strings.                                                                                                                                                                                                                                           |
| Password bounds      | Local upstream defaults are 8–128; not proof of managed policy.                                                                                                       | Provider-supported min/max with boundary fixtures and Q-08 approval; show exact approved guidance.                                                                                                                                                                                                                  |
| OTP expiry/attempts  | Local comparison defaults are 300 seconds and three attempts.                                                                                                         | Actual managed lifetime and exhausted-attempt behavior; signed delivery expiry must agree.                                                                                                                                                                                                                          |
| Resend               | Local comparison implementation rotates codes and limits sends to three per 60 seconds.                                                                               | Managed resend interval, old-code invalidation, race results and shared account/network bounds.                                                                                                                                                                                                                     |
| Reset revocation     | Local upstream revokes sessions only if its reset-revocation option is enabled.                                                                                       | Provider assurance/configuration plus denial from two previously active sessions after reset.                                                                                                                                                                                                                       |
| Social-only recovery | Installed `better-auth/dist/utils/password.mjs` creates a credential account when reset finds no existing password credential. The OTP reset route calls this helper. | Explicit raw reset/credential-relationship test on a social-only synthetic account. Under the current no-linking scope, recovery must not add password access. If managed policy cannot prevent it, block recovery activation or obtain an explicit Q-08/spec scope change; no account-existence lookup workaround. |
| Enumeration          | Local implementation uses generic wrong-email/password responses and synthetic duplicate signup when verification is required.                                        | Hosted raw status/body/redirect/response-size and bounded timing comparison for unknown, existing password and existing social addresses.                                                                                                                                                                           |

Local defaults are recorded only to explain why assumptions are unsafe; they are not proposed active UI policy. Client countdowns, disabling buttons and generic copy do not enforce these controls. Anonymous browser `revokeSessions` is not a replacement for reset-wide server revocation. If a mandatory invariant is unsupported, this design stops credential activation rather than weakening the spec.

**Alternatives considered**: A separate rate/challenge store cannot fix publicly reachable hosted endpoint behavior without a larger approved architecture change. Provider support/remediation or an explicit future spec change is preferable to a partial security wrapper.

## R4 — Reuse current server authorization boundary

**Decision**: Extend `currentSession` and the existing live-profile SQL predicate to require verified-email authority, retaining fresh session expiry, active session row, bans and actor/resource checks. Test every existing caller and current provider account compatibility.

**Rationale**: `currentSession` currently checks freshness/expiry but not `emailVerified`. `loadProfile` and `saveProfile` already share that boundary. Realtime query authorization must also enforce current verified status rather than relying on a one-time page redirect. Rejecting unverified authority must not become a client-only condition.

**Alternatives considered**: Hiding `/app`, changing only a layout, or assuming the managed setting always prevents direct unverified sessions leaves other entry points dependent on unproved behavior. Automatically marking provider/legacy users verified or trusting client provider fields is unacceptable.

## R5 — Inline steps, transient state and existing display name

**Decision**: Keep the existing canonical public routes and strict query allowlist. One client email-form module has explicit entry/step/status values; the social module keeps its own existing behavior with a coordinated in-flight guard at the form surface. Join required first name and optional last name into existing `user.name`, bounded to 100 code units. Never persist passwords/codes or expose them in route parameters.

**Rationale**: Existing `returnPaths`, proxy matchers and preferences support only the current routes. Inline recovery avoids changing five routing/preference contracts for a short flow. A single code input supports paste, autofill and leading zeros using current primitives. Existing profile update limits already establish the display-name bound.

**Alternatives considered**: New public verification/reset pages, session/local storage drafts, a reducer/context framework, split name columns and six separate code widgets have no demonstrated benefit for this scope. Reload may require entering the destination again; explain that honestly instead of storing private state.

## R6 — Bilingual auth email without a locale database

**Decision**: Render auth subjects/body/expiry/help in English and Arabic in the same message, using separate language/direction blocks and one clear LTR code. Retain current contact-email default behavior. Preserve signed webhook validation, purpose allowlist, recipient binding, receipts and uncertain-send reconciliation.

**Rationale**: Current templates and `EmailLayout` are English-only. [Neon's signed webhook contract](https://neon.com/docs/auth/guides/webhooks) uses a bounded user field set and does not promise a recipient locale/custom fields for email events. Browser cookies cannot identify a webhook recipient's language. Bilingual content guarantees equivalent Arabic instructions without new storage or name-based guessing. [Custom email delivery](https://neon.com/docs/auth/guides/customize-emails) replaces default delivery when subscribed; cutover must be staged and tested.

**Alternatives considered**: Inferring language from names/emails is unreliable. A persistent email-to-locale map adds privacy, expiry and account-enumeration concerns. An unverified free-form webhook locale field is not a supported contract. A later approved locale propagation feature can replace bilingual delivery.

## R7 — Existing design system with a sourced decorative image

**Decision**: Retain monochrome tokens, Rugis/Sahabah headings, Geist forms, 8px controls and 12px panels. Form first in DOM; visual second. Reuse `WorkPreview` and its labelled synthetic content. Use the selected architecture photograph only as a decorative desktop backing with a static CSS fallback; provenance/crop are specified in [design.md](design.md).

**Rationale**: The screenshot's layout is the requested input; copying its testimonial, customer, competitor screen or Apple login is not necessary. Existing preview content communicates SoloDesk without pretending business modules are implemented. A restrained photographic accent fits the reference while preserving complete form usability when the image fails.

**Alternatives considered**: Stock portraits and fabricated endorsements are rejected. A generated marketing artwork, new carousel, animated panel or new design palette adds work without meeting another requirement. A CSS-only backing remains the acquisition-failure fallback, not a reason to block account access.

## R8 — Existing checks need specific updates

**Decision**: Add targeted transport/form state checks and a real-code isolated integration harness, and update existing account-page HTTP expectations. Retain current general suites.

**Rationale**: `scripts/test-site-http.mjs` forbids password inputs on account pages; that assertion must become positive field checks there, while its landing-page exclusion remains. `scripts/test-neon.mjs` manually marks its synthetic users verified and therefore cannot prove delivery/verification. Current email tests simulate persistence; real receipt concurrency remains required before webhook activation.

**Alternatives considered**: Snapshot-only checks, manually setting verification true for the new journey, repeating the full suite after no further changes or installing a broad scanner/browser framework solely for this feature would not improve the required evidence.

## Current advisory and tooling evidence

- Lockfile inspection on 2026-10-30: Next 16.4.3; React/DOM 19.3.0; managed SDK 0.7.0-beta; local Better Auth/core 1.7.14; deepmerge 4.3.1. These are checkout versions, not hosted-service or deployed-artifact versions.
- `npm audit --json`: first sandbox invocation failed `EAI_AGAIN registry.npmjs.org` and could not write its normal npm log. Network-enabled retry completed with exit 1 because it reported **9 low, 0 moderate, 0 high, 0 critical** package entries. Nine package entries do not mean nine independently exploitable vulnerabilities.
- The reported root advisory is [GHSA-gcqx-w48m-w2h4 / CVE-2026-93753](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), prototype poisoning in deepmerge 4.2.0–4.3.1. This checkout has 4.3.1. Affected chains include shadcn registry tooling and an existing auth-UI/transitive email-renderer chain. Upstream advisory listed no patched version at review time. Reachability/mitigation requires implementation security triage; do not run `npm audit fix --force` or downgrade the stack from audit suggestions.
- Browsed primary Neon verification/OTP/configuration/webhook docs, the Better Auth advisory index and vendor Next security material. This is a partial advisory review. Bundled/transitive and exact deployed versions must be rechecked at release; no clean-deployment claim is made.
- Installed Next guides inspected: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `15-route-handlers.md` and `01-app/03-api-reference/04-functions/connection.md`. Preserve narrow client boundaries, awaited route inputs, `connection()` and Suspense behavior. Re-read affected installed guides before code changes if dependencies change.
- Skills applied: project `speckit-plan`, project senior-architect, project shadcn/Impeccable and React/composition guidance through UI research, global Better Auth/email-password guidance through identity research, security guidance and verification-before-completion. Research agents inspected current source without editing it.
- No app build, browser run, production scan, real email delivery, managed capability request, database migration or hosted policy mutation was executed in planning. G1–G6 remain implementation/release gates.
