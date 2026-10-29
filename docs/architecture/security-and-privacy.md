# Website security and privacy

Updated 29 October 2026. Security is a primary requirement and a release gate for every module. This is a target policy, not a certification or evidence of implemented controls. See [test strategy](../quality/test-strategy.md) for verification.

## Detailed verification authority

Use the [security directory](../security/README.md) for implementation checks: [threat model](../security/threat-model.md), [vulnerability catalogue](../security/vulnerability-catalogue.md), [stack controls](../security/stack-controls.md), [CVE/dependency review](../security/cve-and-dependencies.md), [testing](../security/testing.md), [release gates](../security/release-checklist.md), [findings](../security/findings.md) and [incident response](../security/incident-response.md). This policy owns principles; those documents define required evidence and operating procedures. Neither a checklist nor an empty scanner report proves complete protection.

## Threats and trust boundaries

Treat browser input, route/action parameters, cookies, files, imported content, provider callbacks and stored user content as untrusted. Cover account takeover, CSRF, XSS, injection, cross-tenant access, privilege escalation, malicious URLs/files, duplicated financial actions, leaked backups and compromised dependencies. HTTPS and database encryption do not replace application authorization.

Keep Neon credentials, Better Auth secrets and provider/admin keys in server environment/secret storage. Mark sensitive modules server-only and return allowlisted projections. Never expose secrets in `NEXT_PUBLIC_*`, Client Component props, logs, source maps, browser storage, error payloads or support bundles. Public assets contain no protected records.

## Better Auth and sessions

Use Better Auth's supported Next.js integration and PostgreSQL adapter. Validate sessions from trusted request context on every protected service entry point; do not accept actor IDs, role claims or workspace selection as authority from the client. Configure production HttpOnly/Secure session cookies, deliberate SameSite/domain/path settings, explicit trusted origins and validated redirects. Keep origin/CSRF checks enabled. Custom application mutations need their own framework-appropriate CSRF/origin protection; auth endpoint protection does not cover unrelated handlers.

Sign-in, verification, reset, MFA/recovery and invitation flows need bounded attempts, anti-enumeration responses, expiring single-use challenges, safe redirect handling and audited revocation. Use Better Auth's supported credential handling rather than custom password hashing. Enable only reviewed factors/providers/plugins. Reauthentication protects ownership transfer, credential changes, destructive closure and sensitive export as policy requires. Q-08 owns exact recovery/MFA/provider rules.

Session presence is not current authorization. Verify database-backed membership and grants for consequential actions; constrain or invalidate any session/cookie cache that could delay required revocation. Test expired/revoked sessions and open tabs. Sign-out/account switch clears protected client state and any eligible draft keys under the recovery policy. Revocation cannot recall an existing download or guarantee deletion from an offline browser.

## Tenant and resource authorization

Deny by default. Check workspace membership, project/client/resource scope and action for pages, Server Actions, route handlers, queries/counts/search, files, exports, notifications and jobs. Recheck immediately before a side effect. Layout/proxy redirects and hidden buttons are UX helpers, never the security boundary. Portal guests receive explicit published projections, with separate permitted actions and exact-version evidence.

Neon is accessed only through server-only scoped data access and least-privilege roles. Parameterize SQL and allowlist sorts/filters. Same-workspace constraints prevent cross-tenant relationships. Use RLS as reviewed defense in depth where adopted; no Supabase identity helpers are assumed. If using transaction-pooled connections, transaction-local tenant context and all associated queries must share one transaction. Test cross-request pool reuse and roles that could bypass policies.

## Browser and content protection

Adopt a tested Content Security Policy and appropriate security headers, HTTPS/HSTS in production, anti-framing policy, content-type and referrer protections. Configure CORS/origins narrowly. Sanitize supported rich content; never execute user SQL, JavaScript, templates or spreadsheet formulas. Validate callback URLs and outbound destinations, including redirects and private-network/metadata targets to prevent SSRF.

Sensitive authenticated responses are private/no-store unless an explicitly scoped cache is proven safe. Scope cache keys by identity/workspace/grants and invalidate on policy changes. Do not put auth responses, private APIs or exports in a generic service-worker cache. Rate limits must operate across instances and cover authentication, invites, uploads, expensive queries, jobs and callbacks.

Offline drafts use only the [approved browser-storage contract](sync-and-collaboration.md). No auth/provider credential is persisted there. IndexedDB is not automatically encrypted, eviction-proof or protected against same-origin script compromise; encryption keys cannot be stored beside ciphertext as a protection claim. Q-06/Q-07 must approve key custody, expiry, recovery and protected data classes before persistence is enabled. Preserve in-memory input with honest loss limits when that gate is unavailable.

## Files, finance and providers

Private files require scoped short-lived upload/download authority, content/size limits, safe filenames, scanning/quarantine policy and verified reference commit. Exports exclude hidden fields and defend CSV formula injection; Arabic PDF output must be verified. Provider callbacks verify signatures/timestamps, tenant mapping and unique event IDs before domain effects.

Financial commands recompute trusted totals, check current permission/source revisions and commit business effect, unique number/allocation, audit, receipt and outbox atomically. No last-write-wins financial merge. Unknown provider or commit outcomes reconcile before retry. Rotation, disconnect and revocation stop future jobs without promising recall of prior external effects.

## Privacy, recovery and operations

Use encrypted transport and provider-at-rest protection, restricted private files and reviewed encrypted backup formats. Separate environments and avoid real customer data in development. A production-derived database branch is still sensitive. Retention, legal holds, deletion, independent blob backups and restore drills follow [data lifecycle](data-lifecycle.md).

Collect minimal redacted operational metrics; product analytics/crash uploads are opt-in. Support access is temporary, scoped, purpose-bound and audited. Audit is protected against ordinary member changes; independently tamper-evident storage requires separate proof. No AI product features or employee surveillance is included.

Every release requires tenant/session/CSRF/XSS/injection/file/rate-limit tests, dependency review, financial retry tests where applicable and DB-plus-files recovery evidence. Block unresolved exploitable critical/high defects without an explicit reviewed mitigation/owner decision. [Release operations](../operations/release-and-support.md) owns rollout, incident response and measured recovery objectives.
