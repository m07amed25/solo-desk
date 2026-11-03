# Validation Guide: Phase One Completion

This is a run guide for implementation/acceptance, not proof that the new feature exists. **Only planning inventory/audit/document checks were run in this invocation.** Do not run live commands against a default environment. [Contracts](contracts/account-services.md), [presentation](contracts/presentation-and-public.md), [security](contracts/security-and-release.md) and [data model](data-model.md) define expected behavior without duplicating implementation.

## 1. Prerequisites and safe local baseline

Work from the repository root using the existing lockfile/runtime. Planning observed Node v24.21.0 and the pinned versions in [source identity](artifacts/planning-source-identity.json). No install or dependency change is needed. Preserve the user's existing dirty spec/checklist state and unrelated work.

The following existing commands are local source/mock/guard checks, identified by source; they are **not recorded as executed by this plan**:

```bash
node --test scripts/test-site.test.mjs scripts/test-auth-contract.test.mjs scripts/test-header-auth.test.mjs scripts/test-profile.test.mjs scripts/test-application.test.mjs scripts/test-migrations.test.mjs
node scripts/check-translations.mjs
npm run test:email
node scripts/test-auth-flows.mjs --self-check
python3 docs/design/validate.py
```

Expected after implementation: meaningful imported behavior assertions pass; translations cover actual new strings/ICU; guard self-check requires no live targets; email checks use mocks. Design validation may continue reporting inherited contrast gaps; record exact failures and applicable rendered fixes rather than declaring them passed. A metadata check or mock email run does not prove accessibility/delivery.

Once affected focused checks pass, run the existing complete gate once for the reviewed source:

```bash
npm run test:full
```

It runs lint, Next type generation, TypeScript, translations, Node/email tests and webpack production build. Repair underlying failures and rerun affected checks; do not repeatedly run an unchanged full suite for documentation edits. If Node child-process launch hits sandbox EPERM, distinguish execution-boundary failure from test assertions and use the approved normal execution path. Do not claim tests ran from a source inspection.

## 2. New focused checks to add during implementation

The following files/commands are **proposed and do not exist yet**; `$speckit-tasks` must create meaningful cases before treating them as runnable:

```bash
node --test scripts/test-account.test.mjs scripts/test-rate-limit.test.mjs
```

Extend existing auth/header/profile/application/site/migration tests as needed. Verify actual imported services, not regexes mirroring new source. Cover two-account ownership and revision races, proof target/session/method binding, 299999/300000 ms expiry, single successful use under concurrency, original-operation retries/unknown effects, limiter counters/window boundaries/outage and default-vs-saved locale. Mock adapter output proves only app behavior; G1 still needs real managed evidence. Existing workspace tests are required if shared limiter/validator callers move; keep their separate gates/policies.

## 3. Isolated target and migration prerequisites

Before any database/provider/browser integration:

1. G5 owner verifies independent nonproduction app URL, managed-auth origin/build, PostgreSQL/database/schema, direct migration and restricted runtime roles, test-only provider configuration and synthetic email sink. A manifest value alone is insufficient; independently verify the process/target mapping. Production-derived Neon branches are sensitive and are not test fixtures.
2. Use a reviewed synthetic-only target manifest with credentials in secret storage, never the spec/receipt/log. Ensure inherited `.env.local`/`.env` cannot redirect the app or runner. Existing scripts load these files, so inspect loading semantics before execution without printing values.
3. Record Q-08 and lifecycle policy versions plus G1/G2 support evidence; absent credentials/challenges/role/provider support are BLOCKED outcomes. Test knobs never activate production behavior.
4. Review the new migration's exact number/content and prior 001/002 history. Use a direct isolated migration-role connection; runtime role must not create schema or write managed auth tables.

After the new migration actually exists and the isolated target is verified, the existing migration command can apply pending files:

```bash
npm run db:migrate
```

**This mutates the selected database and was not run by planning.** Do not use the placeholder proposed filename as proof it exists. Validate application objects, grants, checksums, CAS/rollback/unknown-commit behavior, one-client transactions and pooled cross-account denial using real PostgreSQL. Never apply migrations merely to make a planning document look complete.

## 4. Actual app and existing HTTP checks

After isolated runtime configuration is verified, run the built server on loopback with the existing command:

```bash
npm run start -- --hostname 127.0.0.1 --port 3000
```

Existing supplementary HTTP checks against that reviewed process:

```bash
TEST_BASE_URL=http://127.0.0.1:3000 node scripts/test-site-http.mjs
TEST_BASE_URL=http://127.0.0.1:3000 node scripts/test-not-found-http.mjs
```

Extend assertions for `kind=locale|theme`, stale-form 409, account preference errors/private headers and public copy corrections. These are HTTP checks, not browser/Zoom/assistive proof. Despite its filename, the existing workspace-browser script is also not sufficient mounted browser acceptance.

## 5. Repair and execute real identity acceptance

Existing guarded invocation, **only after repair and independent isolated-target verification**:

```bash
node scripts/test-auth-flows.mjs --integration --manifest /tmp/solodesk-007-isolated-target.json
```

The manifest path is illustrative and must be created/reviewed outside versioned artifacts; it does not exist by this plan. The current runner lacks a functioning captured-challenge bridge and can conditionally skip proof cases while reporting PASS. Repair ephemeral synthetic challenge capture, target binding, scenario accounting and missing-proof exit status first. Reconcile the request-password-reset path omitted by the current allowlist. Use this harness for its applicable password flows; Google/GitHub and action-bound freshness require explicit real provider/browser cases, not an inferred harness result.

Run the following acceptance scenarios and record each unavailable case separately:

| Scenario                                  | Required observed outcome                                                                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approved password + Google + GitHub entry | Correct verified account, allowed return, language precedence/theme, usable cancellation/error recovery; no phantom workspace                                  |
| Verification/resend/reset                 | Real synthetic delivery, expiry/supersession/one use/wrong account/purpose, unknown/social-only non-disclosure, old password/all prior sessions invalidated    |
| Three sessions A + account B              | Own safe list/current marker, no token projection; one-target revoke, complete frozen-target revoke-others, current-session end without step-up                |
| Each enabled reauthentication method      | Original account/session preserved; actual fresh password/provider proof, action/target binding; cached session/consent/account picker/callback alone rejected |
| Proof expiry/concurrency/retry            | 299999 ms may authorize once; 300000 ms denies new dispatch; competing use causes at most one action; partial/unknown replies retain original targets/status   |
| Direct managed-origin calls               | Disabled methods, protected revocation and abuse policy cannot be bypassed outside app forwarding; no hidden-UI/CORS substitute                                |
| First new protected request               | Revoked open tab fails own profile/settings/context/service calls; old cookie/JWT and private browser caches cannot preserve authority                         |

G1/G2 errors stop their dependent acceptance. Do not select email-code fallback, silently enroll password access, guess managed routes or migrate to a second auth backend to obtain a PASS.

## 6. Shared admission, settings and lifecycle

- Use at least two independently running app instances against one isolated limiter store. Exercise approved account/network caps and explicit fixed-window boundaries, failure counter persistence, concurrency, key normalization and malicious forwarded headers; record actual Retry-After. Use owner-approved synthetic policy values, not unapproved production defaults.
- Inject DB/lock/timeout/unknown-admission failures before downstream effects. Expect 503/no new account/public submission or send; ordinary valid-session reads/sign-out retain current identity checks. Recover the store and verify quotas resume with no process-local fallback. Admission rollback cannot refund repeated failed identity attempts.
- For two accounts/two sessions each, create/update preferences using expected revisions, compete two equal-base saves and lose a reply. Expect one winner, own-only 409/reconciliation, preserved safe input and no false name+preferences aggregate success. Exercise separate name concurrency under G2.
- Test browser override, saved-account fallback, no saved choice, invalid browser locale, different next account and theme-only changes. Through actual production Next Proxy with no browser-language cookie, verify same-request account fallback and all SDK renewal/deletion Set-Cookie updates on the final rewrite; repeat after A→B switching, expiry and SDK/store outages. Existing ambiguous preference forms get 409 without writing cookies. Optional email defaults off and excludes required security messages.
- Review every collected class/owner/subprocessor/schedule. Exercise approved held/unheld cleanup, simultaneous hold placement/release and reference protection with restricted roles. Verify provider/mailbox/backup controls separately. Unknown retention policy blocks cleanup/acceptance, not a synthetic “retained forever” pass.
- Verify event/artifact redaction and auth-email dedupe after retry; inject contact inbox-success/receipt-failure and unknown SMTP outcomes. No blind duplicate resend or fake subscription success.

## 7. Browser and human acceptance

Use actual production Next rendering, not just controlled component mocks. Record exact browser/engine versions; cover Chromium/Firefox/WebKit where supported and record unavailable engines as gaps. Test English/Arabic × Light/Dark/System at 390×844, 768×1024, 1280×800, 1440×900, 1280×480 and 320 CSS-pixel reflow, plus actual 200% browser zoom and reduced motion. Include long mixed-script names and live System-theme change.

Exercise keyboard/focus/announcements, screen reader, confirmation cancellation/return, current-session unavailable metadata, touch and actual normal/error/disabled/destructive contrast. Required fluent-Arabic and assistive reviewers are named; key parity/screenshots cannot substitute. Test dirty name/preferences against shell links, browser back/forward, native locale/theme forms, social departure, expiry/sign-out/account switch. Late requests, overlays, BFCache and subscriptions must not expose prior identity data.

Test both public headers and account sign-out with returned error, thrown error, lost reply and confirmed success. Review every footer link and rendered claim, no active newsletter form, no fabricated subscribed/operational/legal-entity state. Validate saved-vs-default controls without unnecessary redesign.

Run SC-012 with at least five recorded participants: four must complete the specified account tasks without assistance within three minutes excluding provider wait. A scripted operator run is not that usability result.

## 8. Final evidence and release decision

Use the [evidence contract](contracts/security-and-release.md#evidence-ledger) to record exact source/build/lock/schema/policy/browser/locale and expected/observed outcomes, redacted artifacts and current owners. Re-run a fresh audit/advisory review for the actual candidate; the planning audit has 27 unresolved entries and does not inventory deployed/managed code.

Actual ingress/cookie/origin/cache/role isolation, migration/stale-tab compatibility, restricted secrets/rotation, isolated restore with invalidated auth/proofs and external-effect reconciliation require their own authorized campaigns. No production action, live send, secret access, deployment or destructive recovery follows automatically from this guide.

A partial safe slice can be recorded with exact included IDs, but Phase 01 and full supporting parents stay open until complete contracts pass. Next workflow step after reviewing this design is `$speckit-tasks`; dependent tasks must retain G1–G6 blockers.
