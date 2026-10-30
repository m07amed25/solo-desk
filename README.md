# SoloDesk

SoloDesk is a responsive website for freelancers and small teams to manage clients, projects, tasks, time and invoicing. This repository currently contains a minimal Next.js App Router starter; the business platform is planned.

## Project priorities

- **shadcn/ui first:** use shared shadcn/ui components as the primary UI foundation, styled through Tailwind and semantic design tokens.
- **Design system and scalability first:** reusable components, accessible English/Arabic RTL experiences, responsive layouts and clear module boundaries.
- **Neon:** authoritative PostgreSQL database accessed only by trusted server code.
- **Better Auth:** authentication and session management, with server-enforced workspace and resource permissions.
- **Security first:** validate every trust boundary, protect secrets and sessions, enforce tenant isolation and verify recovery.
- **Design patterns:** apply composition, application services, data access, adapters, explicit state transitions and transactional outbox where they solve concrete problems.

Read the [documentation index](docs/README.md), [product scope](PRODUCT.md), [architecture](docs/architecture/overview.md), [design system](DESIGN.md) and [decisions](docs/planning/decisions.md).

## Development

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Run `npm run test:full` for lint, type checks, translation validation, all local tests and a production build, or `npm test` for local tests only. `npm start` serves a production build. See [setup](docs/development/setup.md) for server-dependent integration checks.

shadcn/ui, Neon and Better Auth are selected requirements, not installed integrations. This documentation update does not provision services or implement them. Older feature/QA records are [historical](docs/features/README.md) and cannot establish website readiness.

The [security checks directory](docs/security/README.md) defines vulnerabilities to avoid, stack controls, live CVE review, test/release gates and incident handling. [Current findings](docs/security/findings.md) records scan limitations and implementation gaps.
