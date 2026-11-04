# App-operated authentication checkpoint — 4 November 2026

Status: work in progress, saved for the owner's requested GitHub push. T037 is implemented; T038–T042 retain their unfinished acceptance work. Earlier managed-only/unselected scope records are historical and do not describe the new opt-in engine. Full feature completion, provider/device acceptance and release are not claimed.

## Implemented

- Better Auth 1.7.15 with PostgreSQL transactions in the additive `solodesk_auth` schema, optional configured Google/GitHub providers, email/password verification/reset, TOTP and passkey plugins.
- Exact HTTP endpoint/field/origin controls, bounded UTF-8 bodies and duplicate-field denial; browser JSON responses strip session bearer tokens. Oversized cloned request bodies now reject without waiting on their unread sibling stream.
- Password and enabled-authenticator confirmation bound to the current account/session/action/body, one-use verification records, TOTP replay denial and database-backed account cooldowns. Recovery invalidates previous sessions and limits replacement access until a new authenticator and acknowledged recovery-code generation are complete, followed by fresh sign-in.
- A PostgreSQL trigger serializes sign-in-method removals across accounts and passkeys and rejects removal of the final route.
- Opt-in server/session/profile/workspace/callback integration, English/Arabic security settings and challenge/recovery screens at `/app/account/security`, passkey controls and session-list/revocation controls. These UI paths require further browser/lifetime acceptance. The profile in app-auth mode uses fresh authorized snapshots without a mandatory Realtime connection.
- Geist fonts are bundled locally with their OFL licence, avoiding build/development Google Fonts downloads. A separate ignored preview build directory allows testing alongside the existing development server.
- Migration failures now report safe network error codes without exposing driver messages or credentials.

## Actual verification

- `npm test`: 111 Node tests and 6 email tests passed.
- Affected auth/profile/presentation/migration suites: 44 tests passed.
- Actual Better Auth plus a separately verified schema-only Neon branch: 43 checks passed for registration, verification, password sign-in, TOTP setup/acknowledgement, factor challenge, replay denial, recovery-only access, previous-session revocation, replacement enrollment, recovery completion and last-route deletion rejection. This run does not demonstrate real Google/GitHub callbacks, WebAuthn hardware, all proof/concurrency/outage cases or two-instance acceptance.
- TypeScript passed; `npm run build` passed with Webpack outside the subprocess-restricted sandbox. English/Arabic parity: 586 keys.
- Full lint remains blocked by 49 errors and 17 warnings; the error count matches the earlier inherited baseline. Generated preview output is excluded. The passing tests/build do not make the full release gate pass.
- The isolated Next preview serves the sign-in page. Browser enrollment/recovery acceptance is unfinished. Its log also reproduced a development-time AggregateError inspection failure; the underlying connection/error-reporting problem remains unresolved.
- Known configured `.env.local` secret values were checked against tracked/candidate files without printing values: zero matches. Environment files, private fixtures and preview output remain ignored. This is a bounded scan, not a comprehensive secret audit.
- The lockfile install audit still reports 27 findings (8 low, 19 moderate); prior security review and remaining advisory/release gaps remain open.

## Configured database migration

After the owner explicitly ran `npm run db:migrate` and reported a connection failure, read-only verification confirmed that 001–004 matched their committed checksums, and that 005–006 had not partially applied. The authorized retry skipped 001–004 and successfully committed 005–006 to the configured database. Existing managed identities, sessions and business rows were not imported or switched. Authentication remains on the existing managed path unless `SOLODESK_AUTH_MODE=app` is explicitly configured.

## Remaining before cutover

- Complete existing-identity migration and rollback/cutover rehearsals, preserving user IDs and business ownership without copying old sessions. Only aggregate/schema compatibility reads have run against existing managed identities.
- Supply app-owned Google/GitHub OAuth credentials and configure their callback URIs. The existing Google provider uses shared development keys; the managed GitHub secret is masked. No provider round trip has passed for the new engine.
- Finish actual passkey ceremonies, all-entry factor enforcement, exact/stale/foreign proof tests, cross-family concurrency, temporary outages, two-instance rate limits and browser lifecycle/keyboard/mobile/RTL checks. No real user email or provider enrollment was initiated by the isolated fixture.
- Review the remaining security findings, ingress/runtime-role/restore requirements, full lint gate, final requirement trace and convergence. New UI availability in opt-in mode is not release acceptance.

The user requested committing/pushing this checkpoint. Deployment and authentication-mode cutover are not part of that push.
