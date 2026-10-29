# Selected backend: Neon and Better Auth

Updated 29 October 2026. **Confirmed choices:** Neon PostgreSQL and Better Auth replace the previous Supabase recommendation. The user requested Managed Neon Auth (managed Better Auth) and Realtime on the production branch. The account/profile integration is installed and provisioned; [setup and evidence](../development/neon-setup.md) records its scope and remaining release gates.

## Responsibilities

| Concern | Selected direction | Implementation gate |
| --- | --- | --- |
| Website/server | Next.js App Router, TypeScript application services | Read installed Next.js guides before implementing |
| Database | Neon PostgreSQL, server-only access | Region, least-privilege roles, driver and transaction proof |
| Authentication | Neon Managed Better Auth through the Next.js SDK | Sessions, origins, email/recovery and chosen factors/providers; Neon owns managed auth migrations |
| Components | shadcn/ui first, shared tokens and Tailwind | Component setup and accessible responsive English/Arabic evidence |
| Files | Private object storage with scoped upload/download | Provider, scanning, retention, quotas and independent backup remain open |
| Email | Transactional auth and business-delivery adapter | Provider, verified sender, limits and delivery/retry proof remain open |
| Jobs | Transactional outbox and bounded leased execution | Hosting/scheduler runtime, retries, deduplication and monitoring proof |

Better Auth is the identity layer. Workspace roles, resource grants and financial authorization belong to server application policy. No browser connects directly to Neon with a database credential. No assumption of Supabase-specific JWT claims, `auth.uid()`, storage buckets or Edge Functions carries into this architecture.

## Neon connections and data integrity

Use pooled runtime connections suitable for concurrent website requests. Use a direct administrative connection for migrations and backup/restore tools that require persistent session behavior. Driver/adapter choice must support the full multi-statement transaction, locking and rollback needs of financial commands and Better Auth; select one supported setup rather than installing competing ORMs.

Neon pooling uses transaction mode, so do not rely on session variables, session advisory locks or LISTEN/NOTIFY across pooled requests. If row-level policies need tenant context, derive it from verified server authority and set it transaction-locally inside the same transaction as every protected query; test pool reuse and missing context. Application tenant filters and relationship constraints remain mandatory. Runtime roles cannot be table owners or bypass RLS where policies are relied upon. See [Neon pooling](https://neon.com/docs/connect/connection-pooling).

## Better Auth integration

Managed Better Auth is mounted at `/api/auth/[...path]` through Neon's Next.js SDK; Neon owns its schema and credential handling. The `/auth/callback` proxy completes the OAuth verifier exchange before returning to `/`. The server verifies the upstream session for protected operations and returns only the user's profile ID/name. Business operations must additionally enforce current workspace/resource grants. See [Neon's Next.js integration](https://neon.com/docs/auth/quick-start/nextjs-api-only). A future move to self-managed Better Auth requires a separate migration decision.

Keep production session cookies HttpOnly and Secure with deliberate SameSite/domain/path settings. Set explicit trusted origins and validated redirect destinations. Retain built-in origin/CSRF protections and separately protect application mutation endpoints. Review session expiry, revocation and any cache delay against permission-change requirements. See [Better Auth security](https://better-auth.com/docs/reference/security).

## Cost, isolation and recovery

Plan choice, region, application hosting, storage/email costs, connection/compute/egress limits and recovery objectives remain Q-02/Q-16. Verify live provider terms at provisioning and release; no free quota, indefinite availability, backup retention or SLA is promised here. Monitor resource use, errors and restore evidence before supporting real financial reliance.

Keep environments isolated. Preview branches use synthetic data by default; branching production does not anonymize it. Practice logical export and DB-plus-files recovery. Credentials and Better Auth secrets stay in environment/secret storage, never `NEXT_PUBLIC_*`, browser drafts or support bundles. No external resource has been created by this documentation update.
