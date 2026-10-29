# Stack-specific website controls

Updated 29 October 2026. Apply [catalogue](vulnerability-catalogue.md) controls at each actual boundary. Names in this document are planned architecture unless inspected in [findings](findings.md); a selected service is not an implemented protection.

## Next.js and React

Read installed `node_modules/next/dist/docs/` before implementation, particularly data security, Server Actions/route handlers, caching, proxy, CSP and deployment. Recheck security advisories for Next.js and its bundled React/RSC code, not only top-level React versions.

Keep database/auth-secret modules server-only and serialize minimum permitted projections. Every protected read, Server Action and route handler calls current authentication/authorization inside its trusted service. Action identifiers, layout redirects, proxy checks and disabled controls do not grant authority. Treat action arguments/closures/return values as boundary data; no secret-bearing objects or unfiltered DB rows reach browser props/HTML/prefetch.

With cache components or other caching enabled, prove effective identity/workspace/grant isolation and invalidation for each private cache path. Test CDN/prefetch/error responses too; do not assume the framework chooses a safe cache mode for every integration. Ordinary GET and render paths do not mutate business state. Custom mutations keep appropriate CSRF/origin controls and safe host/proxy configuration.

Patch unsupported/vulnerable framework versions using current advisory ranges. Set bounded requests and expensive render/image/query work, tested CSP/security headers and safe redirects. Never deploy the development server, inspector or test admin endpoints publicly. Primary controls: SEC-005/009–014/019/025–032/049/054–056/063–064.

## shadcn/ui and the design system

Use shared reviewed shadcn/ui source and one compatible primitive family. Review registry/component generation as code and dependency changes: new imports, install scripts, URLs, event handlers, HTML sinks and transitive packages. Copying source means upstream fixes may need to be applied manually; an npm scan cannot find every flaw in vendored components.

Preserve labels/focus/keyboard behavior and accessible error/confirmation flows. Never rely on hidden components to protect costs, tokens, grants or financial actions; enforce policy before creating props. Shared renderers sanitize supported rich content and validate link schemes. Third-party image/file preview components cannot receive unrestricted server fetching authority. Primary controls: SEC-011/020/025/029/033/038/049–052.

## Better Auth

Use the supported Next.js integration and selected PostgreSQL adapter; review auth/plugin migrations and protect credential/session tables. Production cookies require HttpOnly/Secure and deliberate SameSite/domain/path settings. Use explicit trusted origins and validated redirects; do not set `disableCSRFCheck` or `disableOriginCheck` to fix integration failures. Auth endpoint controls do not automatically protect custom business routes.

Define verification, factor/recovery, account linking, session expiry/revocation and reauthentication policies. Audit enabled plugins individually, including SSO/OAuth/SAML/passkeys if selected. Never trust a client role/workspace ID or treat email/contact strings as membership. Factor recovery, reset, link/invite acceptance and session caching need negative/replay/race tests. Secret rotation and session invalidation are distinct controls; use supported procedures and verify their actual effects. Primary controls: SEC-001–016/027/041/044–046/049.

See [Better Auth security](https://better-auth.com/docs/reference/security) and its [maintainer advisories](https://github.com/better-auth/better-auth/security/advisories). Recheck installed plugin/version documentation before enabling any factor or flow.

## Neon PostgreSQL

Only trusted server services connect. Separate runtime/auth/migration privileges to the extent required by the chosen adapter, with reviewed least-privilege access. Do not let browser code send arbitrary SQL or expose connection strings via public configuration. Validate TLS with the chosen driver; connection failure must not trigger an insecure fallback.

Parameterize values, allowlist identifiers and enforce tenant relationship/financial constraints transactionally. If relying on RLS, test the actual role cannot bypass it; owner/admin credentials are not a safe runtime substitute. No Supabase-specific auth function is assumed.

Use pooled runtime connections with bounded concurrency/timeouts. Neon pooling is transaction mode; session settings/locks/listeners cannot be assumed to persist across transactions. If using tenant context, set it transaction-locally and perform every related protected query in that transaction. Test missing context, rollback and reuse between tenants. Administrative migrations/backup tooling may require a direct connection. See [Neon pooling](https://neon.com/docs/connect/connection-pooling).

Preview branches copied from production remain sensitive. Protect DB-plus-external-file backups and auth material; test isolated restore and credential/session response. Managed service patching does not replace application SQL/role/driver/advisory review. Primary controls: SEC-009–014/017/041–048/056–058/063–064.

## Browser drafts, files, workers and providers

[Browser-draft proof](../architecture/sync-and-collaboration.md) is mandatory before protected persistence: data classes, encryption/key custody, account isolation, expiry, quota/eviction and honest recovery limits. IndexedDB is not automatically encrypted or permanent; same-origin script compromise can expose unlocked drafts. Never cache auth/private APIs generically in a service worker.

Private uploads/downloads need scoped object/version authority, validation, verification and retention. PDF/import adapters run with restricted filesystem/network/CPU/memory. Workers use domain services and current grants, not a broad privileged bypass. Webhooks verify provider identity before durable receipt/processing; sends/payments reconcile uncertainty before retry. Primary controls: SEC-020–024/031/033–040/045–048/057–064.
