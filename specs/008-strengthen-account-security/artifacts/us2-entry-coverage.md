# US2 enabled-entry source trace — T017

Date: 2026-11-03. Investigation/preparation only; no actual provider campaign.

| Entry/boundary | Current exact source | Evidence and gap |
| --- | --- | --- |
| Email/password | components/auth-email-form.tsx:340, lib/auth/capabilities.ts credentialPaths | Flag-gated existing signIn.email; no accepted TOTP continuation; do not activate factor |
| Registration/verification | components/auth-email-form.tsx:376 and :392 | Verification OTP may navigate after verification; not second-factor assurance |
| Google/GitHub | components/sign-in.tsx:41, app/(utility)/auth/callback/page.tsx:51–52 | Existing approved social initiation and finite callback returns; factor-enforcement/original-session freshness unproven |
| Password reset | components/auth-email-form.tsx:454/:523/:594, app/api/auth/[...path]/route.ts | Existing reset aliases and combined request; actual managed reset/invalidation and every-entry policy unaccepted |
| Passwordless | lib/auth/capabilities.ts credentialPaths omits sign-in/email-otp, sign-in/magic-link, phone primary/passkeys | Unselected direct app operations denied; public plugin presence does not enable them |
| Cached session | lib/auth/server.ts:currentSession requests disableCookieCache, sessionDataTtl 1 | Verified/unbanned/expiry trusted guard exists; actual hosted cache-before-challenge and revocation acceptance absent |
| Upstream two-factor hook | node_modules/better-auth/dist/plugins/two-factor/index.mjs:248–277 | Hooks only email/username/phone sign-in; trust-device bypass branch exists. Does not demonstrate selected social/all-entry enforcement |
| Upstream restricted challenge | node_modules/better-auth/dist/plugins/two-factor/verify-two-factor.mjs:25–36 | valid() consumes verification and creates session/cookie; upstream only, not accepted managed flow |
| Original-session fresh action proof | lib/auth/account-security.ts:794 onward; app/api/account/reauthentication/route.ts | Password requires injected verifier absent in production route; Google/GitHub unavailable. Session-age or fresh OAuth session is not original-session action proof |
| Direct origin | app/api/auth/[...path]/route.ts and Neon authentication-flow docs | App denial does not configure provider enforcement; no target mapping or live evidence |

No production auth flow changed. Upstream 1.7.14 code, installed Neon 0.7.0-beta and current public @neon/auth docs are distinct versions/boundaries. Hosted version unknown. Accepted entry set/config must be observed on an authorized isolated target before activating enrolled protection. Callback/social behavior preserved.
