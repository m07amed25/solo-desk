<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SoloDesk website priorities

SoloDesk is a Next.js website. Use shadcn/ui as the primary component foundation, with a scalable shared design system and semantic Tailwind tokens. Neon PostgreSQL is the selected database; Better Auth is the selected authentication/session system. Security, scalability and appropriate design patterns are primary requirements.

Read [current documentation](docs/README.md), [architecture](docs/architecture/overview.md), [patterns](docs/architecture/design-patterns.md), [security](docs/architecture/security-and-privacy.md) and [design system](DESIGN.md). Keep database/auth secrets server-only and enforce current tenant/resource/action grants at every protected service entry point. Earlier feature/QA records are explicitly historical; do not follow their native app or Supabase setup as current instructions.

Before implementing a feature, read the [security checks](docs/security/README.md), select applicable [SEC controls](docs/security/vulnerability-catalogue.md), and verify the [security release gate](docs/security/release-checklist.md). Match current dependency/deployed versions to fresh advisories; no document can enumerate all present or future CVEs. Record failed/unavailable scans as gaps, never as clean results.

## Use relevant agent skills

Before starting work, follow [agent skill routing](docs/development/agent-skills.md). Select skills by the task triggers and the [full catalogue](docs/development/agent-skills-catalogue.md), read the selected `SKILL.md` files and necessary references, and apply them during the task. Briefly state which skills are in use. Use shadcn for component work, the active design skill for UI/UX, React/composition guidance for frontend changes, Neon/Better Auth specialists for data/auth, and security/testing specialists for the affected controls. Use debugging and verification workflows when their triggers apply.

Load the relevant subset, respect the current user-requested workflow and check required tools/version support. Skills do not change SoloDesk's selected stack or grant permission for deployments, production access, external messages or delegation. The [installation receipt](docs/development/agent-skills-installation.json) records the 115 local installations; another machine must install its own copies.
