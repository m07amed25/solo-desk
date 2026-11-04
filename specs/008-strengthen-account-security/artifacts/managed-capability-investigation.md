# Managed capability investigation — T004

Date: 2026-11-03. Evidence: current local source/public documentation; no live target or approval.

Installed: @neondatabase/auth 0.7.0-beta; better-auth and @better-auth/passkey 1.7.14. Hosted build/configuration unknown. Sources: [Neon supported plugins](https://neon.com/docs/auth/guides/plugins), [roadmap](https://neon.com/docs/auth/roadmap), [user management](https://neon.com/docs/auth/guides/user-management), [server reference](https://neon.com/docs/auth/reference/nextjs-server), inspected 2026-11-03. No authenticated target probe.

| Operation | Installed source/public disposition | SoloDesk accepted disposition |
| --- | --- | --- |
| TOTP start/confirm | Upstream two-factor plugin exists; wrapper fixed client array omits it | Unavailable; no accepted managed enrollment contract |
| Enrolled challenge | Upstream hooks email/username/phone only; social not covered | Unproven every-entry enforcement; blocked |
| Disable/replace factor | Upstream endpoint presence is not managed support | Unproven; unavailable locally |
| Recovery code issue/replace | Upstream generateBackupCodes exists | Unproven one-time delivery/custody/atomic replacement |
| Code consumption/recovery | Upstream backup-code verification ordinarily calls normal-session success | Unproven limited recovery plus all-prior-session revocation |
| Code read-back | Upstream server-only viewBackupCodes decrypts remaining codes | Does not meet selected no-read-back contract without additional provider guarantees |
| Email/password primary | Managed supported publicly; app credential flag required | Existing scope only, no accepted factor enforcement |
| Google/GitHub primary/callback | Existing app paths allowed | Preserve; enrolled challenge/direct-origin policy unproven |
| Reset/verification | Credential allowlist and managed docs exist | Not MFA; challenge/reset invalidation acceptance absent |
| Magic-link/email OTP/phone primary | Public plugin support, distinct from verification OTP | Unselected additional entry; no automatic activation |
| Passkey register/authenticate/list/remove | Upstream passkey package present, wrapper lacks plugin | Unproven managed; unselected and denied locally |
| Email change | Public managed guide explicitly unsupported | Unavailable; unselected and denied locally |
| Social link/unlink | Upstream surfaces exist | Managed collision/last-route/session behavior unproven; unselected/denied |
| Original-session fresh proof | App verifier requires injected adapter; social proof unavailable | Unproven; do not reuse session age as action proof |
| Sensitive-change session outcomes | Installed revokeOtherSessions maps revoke-all-sessions; newer docs use @neon/auth and sessionId | Exact protocol and accepted invalidation unproven |
| Direct managed origin/cache | App allowlist is not hosted enforcement | Unproven; no managed target accepted |

Locations: `node_modules/@neondatabase/auth/dist/adapter-core-N_pQf5vS.mjs:662` fixed plugin array and `:682` client creation; `dist/server-i57Km2d6.mjs:41` revocation mapping; `better-auth/dist/plugins/two-factor/index.mjs:248` matcher; `two-factor/backup-codes/index.mjs:235` normal success and `:324` read-back helper; `lib/auth/capabilities.ts` local method/path denial. No SDK type establishes target acceptance. CAP remains blocked. Older roadmap MFA wording must be treated as dated research; the current fetched supported subset still supplies no accepted complete MFA contract.
