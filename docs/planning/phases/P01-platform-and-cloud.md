# P01 — Secure website, Neon, Better Auth and team foundation

Status: planned, not implemented or verified. [Roadmap](../roadmap.md) owns sequence; [decisions](../decisions.md) owns unresolved gates.

## Entry prerequisites

P00 scope, browser support/security/storage plan, selected Neon and Better Auth, and shared shadcn/ui design-system contract. Hosting/region/email/files and browser key/recovery choices require proof before dependent activation.

## Delivery checklist

- [ ] Establish Next.js routes/layouts and shared shadcn/ui primitives, semantic tokens and reusable composites; verify phone/tablet/wide-screen, themes and English/Arabic RTL.
- [ ] Implement server-only scoped Neon data access, reviewed business/auth migrations, pooling, constraints and real transaction/rollback tests.
- [ ] Implement Better Auth sign-in/verification, approved factors/recovery, session listing/revocation, trusted origins, secure cookies and CSRF protections.
- [ ] Deliver workspaces, recipient-bound invitations, role/resource grants, current authorization and last-owner safeguards.
- [ ] Prove eligible encrypted browser draft storage, key custody, expiry, quota/eviction failure and account isolation before enabling protected persistence.
- [ ] Deliver revision-checked submissions, stable receipts, conflict review, permission invalidation and multi-tab/stale-client handling.
- [ ] Provide scoped settings/notifications, private file boundaries, safe import/export manifests, DB-plus-files recovery and redacted diagnostics.
- [ ] Measure bounded queries/jobs, connection use and representative load; review module/service/data/adapter patterns and dependency direction.

## Deliverables and exit evidence

A two-member authenticated website workspace with current tenant/resource isolation and proven browser behavior. Evidence must show denied cross-tenant reads/writes/counts/search/files/exports, revoked sessions/grants, CSRF/origin rejection, transaction failure/retry and pool-reuse isolation. Browser draft claims additionally require quota/eviction/key/expiry proof; native historical tests do not satisfy them.

- [ ] Current server permission checks protect every entry point and serialized projection.
- [ ] Lost response/retry has one effect; conflicting revisions preserve permitted candidates.
- [ ] Restore cannot revive sessions, numbers or old financial commands.
- [ ] Shared components pass keyboard, theme, Arabic RTL, responsive and accessibility checks.
- [ ] Query/job bounds and recovery limitations are documented with measured evidence.

Every gate needs exact build/browser/server/fixture identity and observed results. Documentation alone does not pass it. Q-02/06/07/08/11/13/16 remain explicit deployment and dependent-feature blockers.

See [platform](../../specs/platform-and-workspaces.md), [backend](../../architecture/backend-stack.md), [security](../../architecture/security-and-privacy.md), [browser collaboration](../../architecture/sync-and-collaboration.md) and [patterns](../../architecture/design-patterns.md).
