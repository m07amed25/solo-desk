# Website development setup

Updated 29 October 2026. This checkout contains a minimal Next.js App Router website. `package.json` and the lockfile define the actual installed versions. Prior Electron/Forge/Vite/native setup records are superseded; their historical evidence is indexed under [feature history](../features/README.md).

## Current stack and commands

Current dependencies include Next.js, React, shadcn/Base UI components, pooled node-postgres, Neon's Managed Better Auth SDK and Realtime SDKs. TypeScript, ESLint and Tailwind/PostCSS provide development tooling. The account/profile flow is implemented; workspace and business workflows remain planned. Follow [Neon setup](neon-setup.md) for service linking, environment names, testing and known release gaps.

Use a Node version supported by the installed Next.js package and the repository lockfile. On a clean checkout:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Edit the current entry points `app/page.tsx`, `app/layout.tsx` and `app/globals.css`. Stop the development process with Ctrl+C.

Tailwind source detection in `app/globals.css` explicitly scans `app/`, `components/` and `lib/`. Keep agent skill directories and documentation outside that scan; their examples and scripts can resemble arbitrary CSS utilities. Register any new directory containing application utility classes with an additional stylesheet-relative `@source` entry.

| Command | Current responsibility |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply all pending SQL migrations using `DATABASE_URL_UNPOOLED`; select files with `npm run db:migrate -- 001 002` ([migration guide](../../migrations/README.md)) |
| `npm run build` | Production build |
| `npm test` | Local site/profile tests and isolated email tests; no live database or SMTP connection |
| `npm run test:full` | ESLint, generated Next.js types, TypeScript checks, translation parity, all local tests and a production build; stops on the first failure |
| `npm run test:email` | Isolated contact, email template and auth webhook tests |
| `npm run test:neon` | Production service integration test with temporary synthetic identities |
| `npm start` | Serve an existing production build |
| `python3 docs/design/validate.py` | Documentation links/coverage and design token/reference checks |

No `setup:electron`, `test:desktop`, `db:reset:hosted`, `ui:info` or historical feature test script exists in the current manifest. Do not use archived commands as current setup instructions.

Run `npm run test:full` for the complete local check sequence. The build uses the same environment and prerequisites as `npm run build`. Server-dependent checks are separate: `TEST_BASE_URL=http://localhost:3000 node scripts/test-site-http.mjs` requires a running local app, and `npm run test:neon` requires an independently verified isolated service target and `SOLODESK_TEST_ENV=isolated` (see [Neon setup](neon-setup.md)). These integration checks and dependency/advisory scans are not included in `test:full`.

## Read version-specific guides

For agent-assisted work, use [skill routing](agent-skills.md) and the [installed skill catalogue](agent-skills-catalogue.md). These are local Codex instruction packages, separate from application dependencies and service configuration. The installation receipt is machine-specific; a fresh project checkout does not include the global skill directories.

Follow [AGENTS.md](../../AGENTS.md). Before writing Next.js code, read the relevant guides inside `node_modules/next/dist/docs/`, especially App Router structure, Server/Client Components, data security, mutations, route handlers and deployment. Installed documentation takes precedence over remembered older APIs.

## Account integration

Google and GitHub sign-in use Managed Better Auth through same-origin SDK routes. The app reads its own profile from PostgreSQL and subscribes to a session-scoped Realtime query. No business schema migration or ORM was needed. `npm run build` uses Webpack because Turbopack's build worker could not bind a local port in this execution environment; Tailwind uses the standard PostCSS plugin for both bundlers. Development still uses Turbopack.

The following paragraphs describe future business/platform integration work; the [Neon integration guide](neon-setup.md) supersedes their self-managed-auth environment proposal for the implemented account slice.

Configure shadcn/ui in the existing Next.js application with shared `components/ui`, consistent aliases, semantic tokens and Tailwind. Add individual components as needed. Select one compatible primitive family, review generated source/dependencies and preserve its accessibility contracts. See [design system](../../DESIGN.md).

Implement server-only Neon access and Better Auth using one supported PostgreSQL adapter. Review migrations before applying them. Planned server configuration includes `DATABASE_URL` for runtime access, `DATABASE_URL_UNPOOLED` for administrative tooling if needed, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`. The second URL is a project convention to wire into tooling, not an automatically recognized framework variable. Additional provider/email settings depend on selected capabilities. Keep all secret values out of source, logs and `NEXT_PUBLIC_*`; document only names/placeholders.

Use isolated synthetic development/preview databases and narrow auth origins. No production database connection is needed to inspect the starter. Before installing integrations, follow [backend](../architecture/backend-stack.md), [security](../architecture/security-and-privacy.md) and [patterns](../architecture/design-patterns.md). Authentication, tenant isolation, offline draft protection, finance and browser test suites must be implemented and executed before claiming those capabilities.
