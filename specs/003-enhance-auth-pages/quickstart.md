# Validation Guide: Enhanced Sign In and Sign Up

This guide describes implementation validation, not tests already executed. Read the [contracts](contracts/auth-flows.md), [data model](data-model.md), [design](design.md) and [activation gates](plan.md) first. Commands for new harnesses are explicitly marked planned and become runnable only when those harnesses are implemented.

## Prerequisites and safe environment

1. Use the reviewed source checkout, installed lockfile dependencies and supported Node runtime. Record source/build/lock hashes, Node/SDK versions and browser/OS versions. This planning checkout used Node 24.21.0.
2. Use an independently verified, authorized isolated Neon development/test branch with synthetic accounts, its own auth origin and test mailbox. Branch naming alone is not proof of isolation. Do not point these tests at production or copy production-sensitive identity data into a preview.
3. Keep `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, Realtime settings and SMTP credentials in the ignored environment/secret store. Do not paste values into shell output, screenshots, artifacts or commits. Use existing setup guidance rather than exporting secrets in command history.
4. Record Q-08 approved effective password/OTP/abuse/recovery policy and G1–G3 capability results. Enable required branch settings only under the environment's separate authorization. Do not change production policy to make a fixture pass.
5. Before custom email cutover, validate the existing `migrations/001-email-deliveries.sql` and restricted grants on the isolated database; do not reapply an already-applied migration. Verify the reachable signed handler before registering `send.otp`. Existing delivery is replaced by subscriptions, so preserve a documented rollback.
6. Use a restricted owned test inbox/manual code entry or a secure in-process test-mail sink receiving the real signed event. A code remains only in process memory during integration tests; never print it or save full email fixtures. Live inbox delivery is a separate test from a local sink.
7. New dynamic fixtures must refuse unverified/production targets and identify only their randomly named synthetic accounts and receipts for cleanup. Keep operations/traffic bounded; suggested baseline is two fresh accounts, two sessions for one account, and only the approved attempt-limit boundary. No broad provider brute-force testing.

## Local checks after implementation

From the repository root:

```bash
npm run test:full
```

This existing command runs lint, Next type generation, TypeScript, translation parity, unit/email suites and the Webpack build. Expected: all pass with current source; record errors rather than skipping a failing stage. Account-page HTTP expectations must allow/require email/password inputs while the landing-page password exclusion remains.

For focused diagnosis, use the existing commands independently only when a changed path or a failure justifies it:

```bash
node --test scripts/test-site.test.mjs scripts/test-profile.test.mjs
node scripts/check-translations.mjs
npm run test:email
```

Planned transport/state tests will be picked up by `npm test` through the existing `scripts/*.test.mjs` glob. Confirm their actual path and runner when implemented. They must test behavior: correct OTP/reset transport, single in-flight submission, safe transitions, field/secret lifecycle and invalid-state recovery. Do not assert source-text snippets as a substitute for behavior.

Read-only design/documentation checks:

```bash
python3 docs/design/validate.py
```

This existing validator checks current docs/tokens/contrast, not security or the entire new feature directory. It may report existing palette gaps described in DESIGN.md; record exact observed results and distinguish changed failures from existing ones. Validate feature-local Markdown links and template completeness separately. Do not use `--write` simply to make evidence look current.

## Matching build and HTTP checks

Start the successfully built application in one terminal:

```bash
npm run start
```

In another terminal with the same authorized isolated environment configuration:

```bash
TEST_BASE_URL=http://localhost:3000 node scripts/test-site-http.mjs
```

Expected: both locales/all preferences, canonical routes, account field variants, generic callback failures, private/no-store headers, query allowlists, anonymous profile denial and preference behavior pass. `/sign-up` has first/optional last name, email and new-password; `/sign-in` has email/current-password and recovery. No password form appears on `/`. Raw error queries and internal locale/theme aliases remain denied/normalized.

The existing `TEST_AUTH_UNAVAILABLE=1` scenario requires a separately configured unreachable/faulted auth service; setting that test flag alone does not create an outage. On that isolated configuration, run:

```bash
TEST_AUTH_UNAVAILABLE=1 TEST_BASE_URL=http://localhost:3000 node scripts/test-site-http.mjs
```

Expected: honest service-unavailable responses, no private profile or false authenticated destination. Restore the healthy configuration before happy-path checks.

## Real managed authentication and PostgreSQL checks

The existing harness invokes a built Server Action by manifest and therefore requires the matching production build/server, not a different dev build. Its environment must independently establish isolation and provide a non-production `NEON_BRANCH`:

```bash
SOLODESK_TEST_ENV=isolated TEST_BASE_URL=http://localhost:3000 npm run test:neon
```

Expected: existing profile ownership/update/session/Realtime cases remain correct. The current harness manually verifies its fixture accounts; that is suitable for its protected-profile tests and **does not** prove this feature's verification or email delivery.

A new real-challenge harness is planned:

```bash
SOLODESK_TEST_ENV=isolated TEST_BASE_URL=http://localhost:3000 node scripts/test-auth-flows.mjs
```

That file is not present at planning time. Implement it with the same isolation guard and matching-build requirements, secure ephemeral challenge handling, actual database assertions and cleanup restricted to its own synthetic IDs. Never mark `emailVerified=true` directly in the scenario intended to prove signup verification. Do not print session cookies, codes, passwords, signed links, raw webhook bodies or user email addresses in evidence.

### Required end-to-end scenarios

| Scenario                        | Steps                                                                                                                                                                                          | Required outcome                                                                                                                                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Email signup                    | Create fresh account with first name/optional surname; submit, receive real signup code and verify.                                                                                            | No social provider; pre-verification direct profile/action denial; one account; verified authoritative session and own profile after success.                                                                                                          |
| Validation boundaries           | Names 100/101 combined code units, single/Arabic names, email 254/255, approved password min−1/min/max/max+1, pasted/whitespace password.                                                      | Client and trusted boundary agree; no truncation, mutation or stored secret draft.                                                                                                                                                                     |
| Wrong/reused/purpose-bound code | Try wrong, expired, consumed, wrong-recipient and recovery-as-signup codes.                                                                                                                    | No access or credential mutation; clear permitted retry/resend.                                                                                                                                                                                        |
| Resend/race                     | Obtain A, resend B, test A then B; bounded concurrent resend/verify.                                                                                                                           | Old code is invalid, one successful consumption, no extra account/effect. Record provider's real policy/limits.                                                                                                                                        |
| Password sign-in                | Verified good credentials, unknown email, wrong password, unverified valid credentials.                                                                                                        | Good identity reaches own profile; generic unknown/wrong response; unverified continues verification with no protected access.                                                                                                                         |
| Enumeration/collision           | Compare known password, known social and unknown address signup/login/recovery through raw same-origin and hosted public endpoints where applicable.                                           | Status/body/size/navigation and bounded timing do not disclose prohibited existence; no linking/password overwrite. Do not mistake UI masking for proof.                                                                                               |
| Reset                           | Establish two active sessions; request real recovery code, reset once; replay code; try old/new password and old sessions.                                                                     | New password works only after fresh sign-in; old password and both old sessions fail direct page/API/action/Realtime access; replay makes no change.                                                                                                   |
| Social-only recovery            | Use a synthetic Google/GitHub identity with no password credential; invoke raw recovery request and reset after permitted ownership proof, then inspect only its own credential relationships. | No password credential/login method is added under this spec's no-linking scope. Upstream can add one by default; unsupported managed prevention blocks recovery activation or requires explicit Q-08/spec revision, never an email-lookup workaround. |
| Rate/expiry                     | Test only the approved account/network thresholds and expiry boundaries across two app instances.                                                                                              | Enforced shared bounds and displayed guidance agree; no bypass by tab/page/account formatting or easy forced account lockout.                                                                                                                          |
| Existing providers              | Complete Google and GitHub consent/return with owned synthetic identities, then cancellation/failure and existing-identity collision.                                                          | Correct verified identity/profile; no raw error disclosure, duplicate account or unintended merge. Initiation alone is not full provider proof.                                                                                                        |
| Current authority               | Foreign ID, injected role/grants, revoked/expired session, banned/unverified user, stale browser tab and open live query.                                                                      | All affected direct service/action/subscription paths deny without private data or mutation.                                                                                                                                                           |
| Delivery/idempotency            | Actual signed event, duplicate same body, altered body, simultaneous claims, DB/SMTP timeout/crash and expired event.                                                                          | One completed delivery; altered/uncertain claims refuse/reconcile; real DB uniqueness proven; inbox placement checked separately.                                                                                                                      |
| Secret/privacy                  | Inspect redacted source/build, network URLs, address bar, browser storage/cache, logs and analytics while using synthetic secrets.                                                             | No credentials/challenges/session secrets in forbidden locations; no cross-account cached profile.                                                                                                                                                     |

Do not use invented test dates, mutable provider-policy changes or test-only verification bypasses to simulate passing external semantics. Expiry tests may use an authorized provider test mode if documented; otherwise wait for real expiry with a bounded harness and keep users informed during interactive runs.

## Email rendering and delivery

Use synthetic previews only:

```bash
npm run email:export
```

Expected: English/Arabic subjects and body/help/expiry content, explicit language/direction blocks, unchanged LTR six-digit code, light/dark readability, escaped malicious names, plain-text equivalent and no tracking/remote images. Existing contact email defaults and client copies must remain correct after shared-layout changes.

Then request actual verification and recovery messages using the isolated test identities. Confirm inbox placement, code/purpose/expiry agreement, no duplicate send on a completed event, rendering in the agreed desktop/mobile mail clients and honest delayed/unavailable states. SMTP acceptance alone does not pass inbox delivery.

## Browser and visual matrix

- Both entry pages and verification/recovery steps at 320×800, 390×844, 768×1024 and 1440×900; English/Arabic; Light/Dark/System. System is additionally checked against both OS schemes. Repeat critical input/redirect interactions in Chromium, Firefox and WebKit.
- Desktop matches six composition traits; below 768px the decorative panel and its photo request are absent. Block the image request to verify the static fallback remains complete.
- Confirm 200% zoom/reflow, focus order and visibility, first-invalid/new-step focus, error descriptions, screen-reader announcements, 44px controls, password reveal without submit/focus loss, manager autofill, paste/leading zeros and mixed-direction text.
- Review actual contrast and Arabic shaping with human reviewers; do not claim WCAG conformance from automated tooling alone. Run the selected Impeccable detector once on the implemented surface and record its scope/limitations.
- Record account-route baseline and final JS/media budgets, pending-feedback responsiveness, image request/size and observed LCP/INP/CLS under the same test profile. No photo/preview should delay required form interaction.
- For SC-002, recruit five representative first-time reviewers: at least four identify email registration within 10 seconds and complete it without coaching within three minutes after mail arrives. Record anonymized results and failures.

## Advisory, evidence and release record

Run a fresh read-only dependency audit at implementation/release:

```bash
npm audit --json
```

Record exit status and actual severity/package counts. Planning's successful network retry found nine low package entries; the first sandbox attempt failed DNS. Refresh full lockfile, bundled tooling and actual deployed-version advisory evidence; local overrides do not prove managed-service fixes. Triage the recorded deepmerge advisory without forced upgrades/downgrades or broad suppressions.

For each FR/SC and applicable SEC control, record source/build/environment, policy/fixture versions, identity role, exact command/manual steps, expected/observed result, redacted artifact, owner and limitations. Use `passed`, `failed`, `not run`, `unavailable` or justified `not applicable`; never copy a planning checklist into a passed runtime result.

Stop credential activation when G1–G6 lack mandatory evidence, two-session reset revocation or resend invalidation fails, recovery adds a password credential to a social-only account without explicit scope approval, protected services accept unverified authority, enumeration leaks persist, delivery is uncertain or Q-08 policy is unapproved. Follow the existing security release gate. Do not disable verification or erase accepted accounts/receipt claims to work around a failed check.

At the end, clean only test-owned accounts/receipts after required delivery reconciliation; preserve other identities and ambiguous claims. Rollback must keep a working access/recovery path for any password-only account accepted during rollout. No public deployment, remote settings change or mailbox send is authorized merely by executing this planning command.
