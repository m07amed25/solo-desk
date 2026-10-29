# Quickstart Validation: Landing and Authentication Pages

**Status**: Guide for the future implementation; these journeys have not been run.
**Plan**: [plan.md](plan.md) | **Contracts**: [ui-and-navigation.md](contracts/ui-and-navigation.md)

## Prerequisites

- Use the repository checkout and locked dependencies. Observed runtime: Node 24.21.0.
  Install with `npm ci` only if dependencies are missing; do not add a browser-test framework
  for this feature. next-intl is the user-selected runtime addition; implementation must install
  an exact compatible version, update the lockfile and configure the plugin before these checks.
- Obtain an isolated, synthetic-data-only development/test database, managed auth service and
  Realtime endpoint before authenticated tests. Review the existing environment variable names
  in [Neon setup](../../docs/development/neon-setup.md); never print or commit their values.
- The existing local setup targets a branch named production. Do not run `test:neon` against
  that configuration. The implementation must add its isolated-environment opt-in before use;
  the flag is an acknowledgement, not proof that credentials are isolated.
- Have isolated existing/new Google and GitHub test identities for the interactive provider
  matrix. No account/provider provisioning, messages or deployment is authorized by this guide.
- Use supported browser tooling already available, plus manual assistive-technology and fluent
  Arabic review. No `test:e2e` package script or installed Playwright runner is assumed.

All commands below run from the repository root. Test scripts named below are planned outputs,
not files delivered by this planning command.

## 1. Static and pure-logic checks

```sh
npm run lint
./node_modules/.bin/next typegen
./node_modules/.bin/tsc --noEmit
node --test scripts/test-site.test.mjs
npm run build
```

Expected: successful checks and six generated presentation parameter pairs. The built-in Node
tests cover cookie enum defaults, next-intl catalog key/ICU parameter parity, canonical path/return allowlists,
duplicate/invalid preference fields, bounded callback entry and safe error normalization.
Tests must exercise behavior, not assert a particular source-file layout.

Confirm next-intl renders actual English and Arabic messages with no missing-message, malformed
ICU or provider-context errors. Initial server HTML must already have the chosen locale/direction;
client status/error messages must match after hydration. No ad hoc translation engine or second
locale middleware/cookie is introduced.

A build must preserve Cache Components and partial prefetching, with no request cookie/session
read outside its permitted Suspense boundary. Confirm callback, API and design-system URLs
still resolve after root-layout moves. No private profile enters a static shell.

## 2. Local HTTP contract checks

Start the development app:

```sh
npm run dev -- --hostname 127.0.0.1
```

In a second terminal, run the planned local-only assertion script:

```sh
node scripts/test-site-http.mjs
```

It defaults to `http://localhost:3000`, rejects non-loopback test targets, uses anonymous requests
and creates no account. It may submit non-sensitive preference forms to the local app.

Expected coverage:

- Home returns public content; both auth actions, section anchors and synthetic-preview labels exist.
- Sign-in/sign-up are separate direct-entry pages. Signed-out /app leads to Sign in, with no
  private name or sealed query in the response.
- The six valid preference pairs produce correct initial html lang/dir/theme and canonical
  post-submit addresses; invalid/duplicate/oversized/cross-origin submissions set no cookies.
- Direct internal aliases fail, malformed values cannot select arbitrary files/URLs, and RSC
  requests preserve correct routing. Externally returned HTML/profile/auth results are
  private/no-store where required by the contract.
- Technical provider errors normalize to generic safe addresses without rendering their content.
- Blocking auth-service network access does not stop a new anonymous visit to the public home.
  Observe the network/import boundary rather than accepting a cached screenshot as proof.

Optionally inspect anonymous headers without saving response bodies:

```sh
curl -sS -D - -o /dev/null http://localhost:3000/
curl -sS -D - -o /dev/null http://localhost:3000/sign-in
curl -sS -D - -o /dev/null http://localhost:3000/app
```

Do not require a specific HTTP 3xx for a redirect streamed after headers were sent. Verify the
final browser destination and absence of private data as well as ordinary HTTP responses.

## 3. Browser, language and visual matrix

Open home, Sign in and Sign up, then check all spec journeys using:

- English and Arabic × Light and Dark; also System with each OS color scheme and an in-tab
  system-theme change.
- 390×844, 768×1024 and 1440×900; add 320 CSS-pixel reflow and 200% zoom.
- Keyboard-only navigation, visible focus, mobile disclosure/Escape/focus return, skip link,
  working anchors, both auth buttons, provider status announcements and reduced motion.
- Screen-reader page language, headings, names/roles/status, Arabic reading order and mixed text.
- Blocked fonts/images, long translations and delayed responses; core text/actions stay usable.
- Native preference submission/document reload, JavaScript-disabled public navigation and no
  hydration errors. Account provider access itself still requires its existing client SDK.
- Shared Button sizing/token changes against /design-system, avoiding a showcase redesign.

Compare the rendered landing with the saved reference for the six SC-005 traits.
Verify only synthetic planned previews and approved claims appear. Run a timed, uncoached review
with five representative people; at least four must identify product purpose and account action
within 15 seconds (SC-006). Do not mark this passed from agent inspection.

During implementation, run Impeccable context once for the feature and its detector once after
the UI is stable, using the installed skill's documented commands. Record scanner/network gaps.

## 4. Account and direct-service regression checks

Using the verified isolated environment, build and serve the production artifact:

```sh
npm run build
npm start -- --hostname 127.0.0.1
```

After confirming the new test opt-in exists and the credentials are isolated:

```sh
SOLODESK_TEST_ENV=isolated npm run test:neon
```

Expected: existing real-PostgreSQL/profile/auth checks still pass, including hostile-origin,
cross-account action/read, name bounds, sign-out, revoked-cookie replay and live-row removal.
The action caller posts to canonical /app after the move. Fixture cleanup removes only accounts
created by that run; a production label or missing opt-in must fail before any remote write.

Separately exercise Google and GitHub × Sign in and Sign up with existing/new identities.
Confirm clean verifier exchange, correct final /app, existing account reuse and no local
account-linking behavior. Cancel/deny a provider, fail its response, submit rapidly and inject
untrusted return/error parameters; verify safe retry on the originating page and no open redirect.

## 5. Private-view restoration and expiry

With two isolated identities and two tabs:

1. Edit the display name and verify same-account live updates without affecting the other account.
2. Sign out and navigate Back/Forward. The old heading and name input remain concealed; direct
   requests and actions fail with revoked cookies.
3. Revoke/expire a session while open. Live invalidation or an active fresh check clears content
   within 60 seconds; known expiry conceals at expiry. Every protected request rejects immediately
   under current server authority, independently of the UI detection interval.
4. Suspend/restore the tab or return from background. The view starts concealed and revalidates
   before showing private content. Switch account in another tab and repeat.
5. Interrupt the auth/profile service. Show a generic recovery state, no invented signed-out
   success or empty replacement profile; restore only after validating the same identity.

A previously authorized download/browser memory cannot be remotely erased; this test concerns
the application's visible protected view and current service access.

## Evidence and release limits

For each case record source/build, browser/device/version, locale/theme, fixture, steps,
expected/observed result, artifacts, date and owner. Trace SC-001–007 and selected SEC controls.
Mark unrun/failed tests and missing people/provider/assistive-tool evidence explicitly.

Fresh lockfile/deployed-runtime advisory review and actual ingress cookie/origin/cache/security
headers remain security release gates. This guide neither clears existing Google-key,
privileged-role, GitHub round-trip or managed-service advisory gaps nor provisions a service.
