# Website source structure and dependencies

Updated 29 October 2026. Existing source is `app/layout.tsx`, `app/page.tsx` and `app/globals.css`, with Next.js/TypeScript/ESLint configuration. Other folders below are proposed and should appear only as their features need them.

```text
solor-desk/
├── app/                         # Next.js App Router entry points and layouts
│   ├── (auth)/                  # Proposed sign-in/recovery pages
│   ├── (workspace)/             # Proposed authenticated workspace screens
│   ├── (portal)/                # Proposed scoped client review routes
│   └── api/auth/[...all]/       # Proposed Better Auth route handler
├── components/
│   ├── ui/                      # Shared reviewed shadcn/ui component source
│   └── shared/                  # Reused business composites
├── features/                    # Feature UI and pure domain rules, grouped by business module
├── server/                      # Server-only services, scoped data access and provider adapters
├── lib/                         # Small shared utilities and proposed auth configuration
├── db/                          # Proposed reviewed schema and migrations, including Better Auth
├── tests/                       # Proposed domain, PostgreSQL integration and browser journeys
├── public/                      # Public licensed assets only
└── docs/                        # Product, design, architecture, quality and operations
```

Route groups organize URLs/layouts; they do not authorize access. Keep route files thin. Shared UI cannot import server database/auth internals. Client Components receive minimum permitted projections. Mark sensitive server modules `server-only`; a `use server` directive is not a replacement for input validation and authorization.

Reuse the root `@/*` alias as configured in `tsconfig.json`. Define shadcn/ui aliases and `components.json` when implementing the selected component setup; do not assume the removed renderer aliases exist. Keep database and auth setup consistent with the selected adapter and installed Next.js documentation. Avoid a monorepo/package split until sharing or build constraints justify it.

See [architecture](overview.md), [patterns](design-patterns.md), [setup](../development/setup.md) and [module ownership](../modules/responsibilities.md). Historical feature paths in the archive describe another baseline and are not present implementation.
