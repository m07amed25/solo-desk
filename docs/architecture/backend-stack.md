# Selected backend: Neon and Better Auth

Updated 29 October 2026. **Confirmed choices:** Neon PostgreSQL for the database and Better Auth for authentication/session management. These replace the previous Supabase recommendation. They are not yet installed, configured or provisioned in this checkout.

## Responsibilities

| Concern | Selected direction | Implementation gate |
| --- | --- | --- |
| Website/server | Next.js App Router, TypeScript application services | Read installed Next.js guides before implementing |
| Database | Neon PostgreSQL, server-only access | Region, least-privilege roles, driver and transaction proof |
| Authentication | Better Auth using a supported PostgreSQL adapter against Neon | Reviewed schema/migrations, sessions, origins, email/recovery and chosen factors/providers |
| Components | shadcn/ui first, shared tokens and Tailwind | Component setup and accessible responsive English/Arabic evidence |
| Files | Private object storage with scoped upload/download | Provider, scanning, retention, quotas and independent backup remain open |
| Email | Transactional auth and business-delivery adapter | Provider, verified sender, limits and delivery/retry proof remain open |
| Jobs | Transactional outbox and bounded leased execution | Hosting/scheduler runtime, retries, deduplication and monitoring proof |

Better Auth is the identity layer. Workspace roles, resource grants and financial authorization belong to server application policy. No browser connects directly to Neon with a database credential. No assumption of Supabase-specific JWT claims, `auth.uid()`, storage buckets or Edge Functions carries into this architecture.

## Neon connections and data integrity

Use pooled runtime connections suitable for concurrent website requests. Use a direct administrative connection for migrations and backup/restore tools that require persistent session behavior. Driver/adapter choice must support the full multi-statement transaction, locking and rollback needs of financial commands and Better Auth; select one supported setup rather than installing competing ORMs.

Neon pooling uses transaction mode, so do not rely on session variables, session advisory locks or LISTEN/NOTIFY across pooled requests. If row-level policies need tenant context, derive it from verified server authority and set it transaction-locally inside the same transaction as every protected query; test pool reuse and missing context. Application tenant filters and relationship constraints remain mandatory. Runtime roles cannot be table owners or bypass RLS where policies are relied upon. See [Neon pooling](https://neon.com/docs/connect/connection-pooling).

## Better Auth integration

Mount Better Auth's supported Next.js handler at `/api/auth/[...all]`. Read the session from trusted request context on the server, then enforce current membership/resource grants for business operations. Use a supported PostgreSQL adapter and review generated auth/plugin migrations. Keep auth tables outside ordinary business serialization and restrict their access. See [Next.js integration](https://better-auth.com/docs/integrations/next) and [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql).

Keep production session cookies HttpOnly and Secure with deliberate SameSite/domain/path settings. Set explicit trusted origins and validated redirect destinations. Retain built-in origin/CSRF protections and separately protect application mutation endpoints. Review session expiry, revocation and any cache delay against permission-change requirements. See [Better Auth security](https://better-auth.com/docs/reference/security).

## Cost, isolation and recovery

Plan choice, region, application hosting, storage/email costs, connection/compute/egress limits and recovery objectives remain Q-02/Q-16. Verify live provider terms at provisioning and release; no free quota, indefinite availability, backup retention or SLA is promised here. Monitor resource use, errors and restore evidence before supporting real financial reliance.

Keep environments isolated. Preview branches use synthetic data by default; branching production does not anonymize it. Practice logical export and DB-plus-files recovery. Credentials and Better Auth secrets stay in environment/secret storage, never `NEXT_PUBLIC_*`, browser drafts or support bundles. No external resource has been created by this documentation update.
