# Neon account integration

Verified 29 October 2026. This is an account/profile foundation, not a release of the specified business platform.

## Services and architecture

Neon CLI 8.13.2 links this checkout to organization `org-winter-mountain-48518934`, project `old-darkness-38592897`, branch `production` (`br-jolly-frost-b4srbemq`), region `aws-us-east-2`. `neon deploy` confirmed Postgres, Managed Better Auth and Realtime and pulled seven service variables into ignored `.env.local`. `.neon` is ignored; `neon.ts` is committed configuration. The init command also installed Neon agent tooling in the user's global agent configurations.

The user explicitly selected Managed Neon Auth, which is managed Better Auth, and requested Google/GitHub login. Google currently uses Neon's shared development keys; GitHub has a custom provider. Provider secrets stay in Neon. The UI calls `signIn.social` through `/api/auth/[...path]`; `/auth/callback` and the SDK proxy exchange Neon's verifier and redirect to `/`. Sign-out reloads the document to discard protected client state.

`lib/db.ts` uses `pg` over the pooled TLS connection with bounded pool/query timeouts. It attaches the pool lifecycle on Vercel and reuses the pool during development. This suits the existing Next.js Node server and a possible Vercel Fluid deployment; no hosting deployment was performed. No ORM or application table is needed for this slice.

`lib/profile.ts` verifies the upstream session with `disableCookieCache=true`. Its parameterized, bounded SELECT returns only profile ID/name, joins the current session, and excludes banned users. The same query is sealed for Realtime. Session deletion or banning removes the subscribed row. The public WebSocket URL is passed to the client; database credentials, cookie secret and sealing secret remain server-only. Sealed queries expire in 60 seconds and renew through `/api/profile`; normal session expiry therefore stops renewal, with an existing capability valid only until its expiry. `saveProfile` verifies the expected page identity, validates the name and calls managed Auth through a Server Action with Next.js origin/body protections.

## Local setup

```bash
npm ci
neon init -y --org-id org-winter-mountain-48518934 --project-id old-darkness-38592897 --branch production --services postgres,auth,realtime
neon deploy
npm run build
npm start
npm run test:neon
```

If an existing branch's Realtime origin settings differ from `neon.ts`, review the plan and use `neon deploy --update-existing`. Its current browser allowlist is `http://localhost:3000` and `http://127.0.0.1:3000`. Managed Auth allows localhost; its `127.0.0.1` origin was rejected during testing, so use `http://localhost:3000` in the browser. Register actual deployment origins with both services before deployment.

Required server variables: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, `NEON_REALTIME_URL`, `NEON_REALTIME_SECRET`. The CLI also writes `NEON_BRANCH`. Generate the application-owned `NEON_AUTH_COOKIE_SECRET` once with at least 32 random characters; deploy does not provide it. Existing `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` belong to the earlier self-managed proposal and are not read by this integration. Never paste real values into documentation or commit env files.

The SDK currently pins vulnerable transitive versions, so `package.json` overrides Better Auth packages to patched 1.7.7+ and Zod 4.x to 4.6.6+. `.npmrc` uses legacy peer resolution because the SDK's bundled UI declares Auth 0.6 while the SDK is 0.7. Revisit these workarounds when Neon publishes compatible updated dependencies. The bundled Auth UI is not used by the app.

## Verification evidence

Final `npm run build` exited 0 using `next build --webpack`:

```text
✓ Compiled successfully in 2.7s
Finished TypeScript in 2.1s
✓ Generating static pages using 8 workers (6/6)
Route (app): /, /api/auth/[...path], /api/profile, /auth/callback
ƒ Proxy (Middleware)
```

`npm start -- --hostname 127.0.0.1 --port 3002` reported `Ready in 74ms`. `TEST_BASE_URL=http://localhost:3002 npm run test:neon` exited 0:

```text
PASS Postgres: pooled TLS query
PASS OAuth: google managed sign-in initiated through app proxy
PASS OAuth: github managed sign-in initiated through app proxy
PASS Auth: sign-up through app proxy (two isolated accounts)
PASS App: session restoration, protected Postgres read, cross-account denial
PASS Realtime: initial subscription from app-issued sealed query
PASS Realtime: committed profile update delivered live; Postgres confirms persistence
PASS Security: hostile origin, cross-account action, oversized name denied
PASS Security: renewal, sign-out, live access removal, revoked-cookie replay denied
PASS Auth: wrong password rejected; sign-in restores protected access
CLEANUP removed this run's synthetic accounts
```

The test invokes the built app's actual `saveProfile` Server Action using its generated manifest. Run it against that matching production build, not a development server from a different build. Only its randomly named synthetic accounts are marked verified as fixtures and deleted in cleanup; the branch verification policy and existing accounts are preserved. Mailbox delivery is not tested. All database mutations in the test are confined to those test identities.

Browser verification at `http://localhost:3000` completed Google login and returned to the authenticated profile with a clean callback URL. GitHub OAuth initiation is tested; interactive GitHub consent/return is not yet verified. App/component/config ESLint, clean-install dry run and documentation validation passed. A value-based scan found no database, auth-cookie or Realtime sealing secrets in the 34 production static assets. The Impeccable detector reported no deterministic issues for the changed UI; this is not a complete accessibility assessment.

## Security controls and gaps

This slice covers SEC-002/005/006 (session/origin/revocation), SEC-009/011/012/014 (identity-scoped reads/actions and live authorization), SEC-017/023 (parameters and bounded name validation), SEC-025/026 (React text rendering/private no-store API), and SEC-049/050/051/055 (dependency/environment review). The implementation and test evidence above are owned by this change; operational owners and production release sign-off remain required.

A fresh final npm audit assessed the lockfile: **9 low, 0 moderate, 0 high, 0 critical** package entries. The low dependency paths originate from deepmerge and html-to-text via shadcn and the SDK's bundled email/UI dependencies. They remain open; no forced major downgrade was applied. Local overrides do not attest to the version of Neon's remotely managed auth service.

The first CLI install failed DNS resolution; the network-enabled retry succeeded. A standard npm SDK install was interrupted while resolving unrelated optional peers; legacy peer resolution completed. Turbopack production builds failed with `binding to a port: Operation not permitted`; the supported Webpack/PostCSS build passes. Early test attempts exposed a stale dev compile, a rejected loopback IP origin, the branch's required email verification, and an incorrect OAuth URL expectation; final tests above supersede those failed attempts. The test CLI explicitly exits after awaited cleanup because the Realtime SDK can retain timers.

The full security release checklist has not passed: no public hosting deployment, production SMTP/recovery test, full GitHub OAuth round trip, load/rate-limit test, restore drill, comprehensive accessibility/RTL audit, or managed-service advisory attestation was performed. Google's shared keys need replacement before real production users. The CLI-provided database role is still privileged; provision a restricted runtime role before public exposure (SEC-041). Workspace/business authorization is not implemented or implied by this personal profile flow.
