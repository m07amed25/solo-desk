# Research: Landing and Separate Authentication Pages

**Date**: 2026-10-29 | **Feature**: [spec.md](spec.md)

Research used the checked-out source, installed package code and version-matched Next.js guides.
Read-only planning agents investigated auth and UI. The current shared styles now apply the
user-selected monochrome theme; landing/auth feature implementation and service changes remain pending.

## 1. Keep the selected stack and limit new code

**Decision**: Use existing Next.js 16.4.3, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3,
Base UI 1.9.0 and shadcn source. Installed Neon Auth is 0.7.0-beta; local Better Auth/core
is 1.7.14. Retain Neon PostgreSQL and the existing profile service. Add user-selected next-intl
for English/Arabic; no other direct runtime dependency, business table, migration, job, provider
or account-linking policy is planned.

**Rationale**: This is a public presentation and account-navigation change, not a new auth system.
The current profile is the complete protected destination required by the spec.

**Alternatives considered**: New auth forms/backend, a dashboard, next-themes and a marketing
component registry add capabilities this feature does not need. A custom translation layer is
superseded by the user's next-intl selection.

**Evidence**: `package.json`, installed package manifests, `components.json`,
`lib/profile.ts` and `docs/development/neon-setup.md`.

## 2. Initial locale/theme without request reads in the root layout

**Decision**: Keep four canonical addresses. Proxy rewrites them to finite internal
`/[locale]/[theme]` routes. Put the site root layout below both parameters and enumerate all
six English/Arabic × Dark/Light/System pairs with `generateStaticParams`. Root HTML gets its
language, direction and theme from validated route parameters, not cookies or sessions.
Keep the callback and design-system pages under a separate utility root layout, preserving URLs.
Remove the higher `app/layout.tsx` when moving these routes.

Read only non-sensitive preference cookies in the presentation branch of Proxy. A small native
POST form/handler sets allowlisted preferences and redirects to one of the four canonical paths.
Use ordinary document links across account boundaries. System theme follows CSS media queries.

**Rationale**: `cacheComponents` and `partialPrefetching` are already enabled. Request-time
cookie/session access outside Suspense is incompatible with the prerendered shell; a root layout
above dynamic segments also cannot derive initial document language from those child params.
Finite variants preserve correct initial HTML without client language flashing. next-intl reads
the validated root locale for translations; theme resolution remains independent of that library.

**Alternatives considered**: Root cookie reads conflict with current rendering rules; disabling
Cache Components changes unrelated configuration; client-only translation gives the wrong initial
language; public locale-prefixed URLs change the specified navigation.

**Evidence**: Installed guides:

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md`
- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`
- `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`

## 3. Separate presentation rewrites from the verifier exchange

**Decision**: Only the callback branch invokes existing Neon `auth.middleware()`; load its
server module inside that branch. The marketing rewrite branch must not evaluate auth/DB
configuration. Keep `/api/auth/[...path]` unchanged. Preserve the SDK callback verifier exchange
at `/auth/callback`, then redirect to `/app` after fresh session validation.
Session/search-param reads on account/callback pages remain inside Suspense.

Use fixed callback/error URLs with only an allowlisted `entry=sign-in|sign-up` marker to retain
the originating page. Normalize provider errors to that page's fixed `?authError=1` URL before
rendering; never display or echo provider error descriptions or arbitrary return URLs.

**Rationale**: Broadening Neon middleware would protect public routes. Its verifier exchange
must happen before application redirects. The installed Better Auth callback appends technical
error fields even when an error callback already contains a generic marker.

**Alternatives considered**: Sending the provider directly to `/app` skips verifier exchange;
matching all public paths with auth middleware blocks the landing; passing arbitrary returnTo
destinations creates an unnecessary redirect boundary.

**Evidence**: `proxy.ts`, `lib/auth/server.ts`, `components/sign-in.tsx`,
`app/auth/callback/page.tsx`; installed
`@neondatabase/auth/dist/server-i57Km2d6.mjs` (exchange/middleware/fresh-session paths) and
`better-auth/dist/api/routes/callback.mjs`. Managed-service round trips remain required evidence.

## 4. Preserve service authorization and clear stale private UI

**Decision**: Reuse `loadProfile()` and its fresh server session lookup. Keep action/API grants
inside their existing entry points. Extend the narrow profile envelope with session expiry,
retain the session-bound query, and exclude expired sessions from that query. Do not introduce
shared or browser-private caching of profile authority.

The existing LiveProfile boundary must hide protected content until a fresh no-store profile
check succeeds on mount/history restoration/focus, conceal it before page suspension, and clear
it on invalid identity, empty authorized live rows or sign-out. Revalidate active sessions at
most 60 seconds apart and at known expiry; conceal while authority is uncertain. Stop timers
and subscriptions on teardown. Remote revocation cleanup is bounded, not promised instantaneous.

**Rationale**: The existing input retains `defaultValue` after live rows vanish. Time passing
does not itself generate a database change. Client SDK session reads can return in-memory
cached data even when a cookie-cache bypass was requested; the existing no-store profile API
checks current identity on the server.

**Alternatives considered**: Redirect-only protection leaves direct services and restored DOM
exposed; trusting live row deletion alone misses expiry; polling the cached client session
does not establish fresh authority.

**Evidence**: `lib/profile.ts`, `components/live-profile.tsx`, `app/actions.ts`,
`app/api/profile/route.ts`, installed `@neondatabase/auth/dist/adapter-core-N_pQf5vS.mjs`.
The existing integration test posts actions to `/`; that caller must move to `/app`.

## 5. Reuse the supplied monochrome system and honest content

**Decision**: Apply the user's Light/Dark OKLCH palette, Geist/Geist Mono, 8px base radius
and compact shadows from app/globals.css and DESIGN.md. This supersedes earlier mint/emerald,
General Sans and universal-pill requirements while keeping the supplied landing image as a
composition reference. Landing is Persuade; account pages are Operate.

Reuse semantic shared components, ≥44px large actions and form inputs, and synthetic HTML/CSS
previews with visible planned/illustrative labels. System theme integration and next-intl page
composition remain feature work; the current showcase previews Light/Dark without persistence.

**Rationale**: The user provided concrete design tokens. They replace the previous visual world
without changing product rules, shared component semantics or trust boundaries. Exact OKLCH
values remain authoritative; normalized sRGB mirrors support legacy documentation validation.

**Alternatives considered**: Keeping old green overrides would split the design system.
Silently altering the supplied palette to make all declared contrast checks pass would misstate
the user's source. Record the failed destructive/chart/input-border contrast combinations and choose
readable text/outlines in actual components; do not certify the entire palette as accessible.

**Evidence**: app/globals.css, DESIGN.md, docs/design/tokens.json and the Light/Dark showcase.
The existing old HTML specimen/captures retain historical colors and are not the current theme.

## 6. Validate locally before external account tests

**Decision**: Use installed ESLint/TypeScript/build tools, Node's built-in test runner for new
allowlist/normalization logic, local HTTP assertions and supported browser tooling/manual checks.
Adapt the existing Neon integration test with an explicit isolated-environment opt-in before
running it; never execute its current production-configured default during planning.

**Rationale**: `test:neon` creates, verifies and deletes identities. Previous setup names the
production branch. Its route assumptions must change, but its authorization tests must survive.
No dedicated browser runner is installed, so browser validation is a documented session rather
than an invented package script.

**Alternatives considered**: Treating historic test output as fresh evidence, using an in-memory
DB or running production fixtures would fail the constitution.

**Evidence/gaps**: Current Node is 24.21.0. No live OAuth, DB test, fresh advisory scan or rendered
accessibility test was run here. Existing Google shared keys, privileged DB role, GitHub full
round-trip evidence and managed-auth advisory attestation remain production gates. Previously
reported low findings require fresh review, not an assumption that they remain unchanged.

## 7. Use next-intl for English and Arabic

**Decision**: Use next-intl, interpreting the user's “next-intel” spelling as the Next.js
internationalization library. Configure createNextIntlPlugin and getRequestConfig; select the
validated next/root-params locale (or an explicit locale outside that root), with fixed loaders
for messages/en.json and messages/ar.json. Preserve matching catalog keys and typed AppConfig.

Use server translation APIs for landing copy. Scope NextIntlClientProvider to the Auth/Profile
or navigation messages actually needed by interactive components. Stable action error codes are
translated by the client. ICU messages handle interpolation/plurals; no custom dictionary engine,
second locale cookie, second Proxy middleware or extra navigation wrapper is required.

**Rationale**: This implements the user's chosen tool while preserving the approved canonical
URLs, six static presentation variants and fresh auth boundaries. Locale configuration must not
fall back to headers/cookies inside a prerendered root. Utility routes use an explicit supported
locale when needed; Route Handlers do not use next/root-params.

**Alternatives considered**: Ad hoc string lookup conflicts with the user's request; using the
library's locale routing middleware as a second rewrite layer would duplicate existing routing.

**Sources reviewed 2026-10-29**: [App Router setup](https://next-intl.dev/docs/getting-started/app-router),
[root-param setup](https://next-intl.dev/docs/routing/setup),
[request configuration](https://next-intl.dev/docs/usage/configuration) and
[server/client boundaries](https://next-intl.dev/docs/environments/server-client-components).
Installed Next.js documentation confirms root-param support and its Server Component restrictions.
The package registry metadata endpoint was unavailable through the browsing tool, so an exact
package version/peer-range check and fresh dependency scan are implementation prerequisites.
next-intl is not installed by this documentation change.

The task-time next-intl selection is reflected in the plan, model, contract and validation guide.
Execution and release evidence remain pending; they are not completed by task generation.

## Implementation dependency selection — 29 October 2026 (T001)

Selected exact `next-intl@4.14.9` from https://registry.npmjs.org/next-intl.
Registry peers accept Next ^16 and React ^19; installed 16.4.3/19.3.0 satisfy them.
Tarball: https://registry.npmjs.org/next-intl/-/next-intl-4.14.9.tgz
Integrity: `sha512-uauRtUC+TrYNA1OL/QcwL9irndLrI9jK3Wdaa9W0B5AeKh9cqVdNeT0IWgLnhBqBRrVwppVdI0M+C1+JdGPQ3w==`.
Install used `npm install --save-exact next-intl@4.14.9 --ignore-scripts`; 26 packages added, audit reported 9 low, 0 moderate/high/critical (782 assessed). Exact audit path triage is recorded in final evidence. No forced upgrades applied.
Upstream https://github.com/amannn/next-intl/security/advisories reviewed: GHSA-8f24-v5vv-gm5j affects <4.9.1; GHSA-4c35-wcg5-mm9h affects <=4.9.1 and fixed in 4.9.2; GHSA-r27j-894h-3w3p concerns experimental precompile select lookups. This feature uses neither next-intl middleware nor experimental message precompilation; fixed 4.14.9 is selected. Full deployed/managed versions remain unverified.
