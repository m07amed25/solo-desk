# Agent skills research catalogue

Researched 29 October 2026 for SoloDesk’s Next.js website, shadcn/ui design system, Neon PostgreSQL, Better Auth and security-first engineering. All **115 skills are now present locally**: 114 installed and the existing Impeccable copy retained. Use [skill routing](agent-skills.md); the [installation receipt](agent-skills-installation.json) records source commits and manifest hashes. Application dependencies, hooks and connected services were not configured by this skill installation.

Verified **115 SKILL.md manifests across 13 source repositories**, selected from broader inventories. Verification here means source paths, manifest names and stated purposes were read; it is not a security audit, execution test or endorsement of every instruction. The ecosystem is open-ended, so this is a broad relevant catalogue rather than every possible skill.

## Default task routing set

This is a project-specific recommendation based on the existing stack and available skills. Keep Impeccable for design and Ponytail for focused implementation/review. Select the following when their task scope applies, and load other installed specialists as needed. Check source/tool compatibility before running scripts.

| Skill / source | Why it fits |
| --- | --- |
| [shadcn](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md) | Find, compose, customize and maintain project-aware shadcn/ui components. |
| [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices/SKILL.md) | Review React/Next.js rendering, data loading and performance. |
| [vercel-composition-patterns](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/composition-patterns/SKILL.md) | Design reusable React APIs and component composition boundaries. |
| [web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines/SKILL.md) | Review interface usability, accessibility and web conventions. |
| [neon-postgres](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-postgres/SKILL.md) | Neon PostgreSQL connections, migrations, scaling and database operation. |
| [better-auth-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/better-auth/best-practices/SKILL.md) | Configure Better Auth, adapters, sessions and supported plugins. |
| [better-auth-security-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/security/SKILL.md) | Harden auth origins, cookies, rate limits and secret handling. |
| [playwright](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/playwright/SKILL.md) | Exercise website journeys in an actual automated browser. |

Additional specialists: `security-best-practices`, `security-threat-model`, `property-based-testing`, `systematic-debugging`, `verification-before-completion`, and the appropriate current Next.js optimizer when its prerequisites apply. For a broad full-stack role, `senior-fullstack` is an installed community workflow; its scaffolder is not permission to rebuild this existing project or change databases/auth.

## Already available here

The active session already exposes Impeccable, Ponytail and its review/audit helpers, OpenAI Docs, skill-creator, skill-installer, image generation, visualization, document/PDF/spreadsheet/presentation skills and Sites. These bundled/plugin capabilities coexist with the user-directory installations below. The receipt covers the 115 catalogued skills, not every skill provided by installed plugins or project copies.

Impeccable already covers interface design, critique, accessibility, responsive behavior and refinement. UI/UX Pro Max and Anthropic frontend-design are installed alternatives for a specific need; choose one primary design workflow per task.

## Current Next.js skill location

The [old next-skills repository](https://github.com/vercel-labs/next-skills) states that workflow skills moved to [vercel/next.js/skills](https://github.com/vercel/next.js/tree/canary/skills). The previous `next-best-practices` skill is retired; guidance ships in version-matched bundled docs and generated agent rules. `next-upgrade` is also retired as a standalone skill. Cache workflows were split into adoption and optimization skills.

Follow the existing [AGENTS.md](../../AGENTS.md): installed `node_modules/next/dist/docs/` is the implementation reference. Inspected upstream canary skills can require APIs absent from the local package, so compare versions before adopting. A generic skill never overrides current local framework documentation.

## Full catalogue

Each linked manifest is the primary source for the name and stated workflow. Git-tree-pinned links preserve the inspected source snapshot where available; Next.js/shadcn/discovery links use the inspected branch and can change. Descriptions below are brief research summaries. Select a skill when the task matches its purpose, subject to the limits in its row and the routing guide. Local availability was verified; availability on another machine is not asserted.

### UI/UX, accessibility and design systems (17)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [canvas-design](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/canvas-design/SKILL.md) | Create static visual/design assets; not live application behavior. | Installed; use when the task matches this purpose. |
| [figma](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma/SKILL.md) | Retrieve design context, assets and variables through Figma tools. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [figma-code-connect-components](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-code-connect-components/SKILL.md) | Map Figma components to their implementation counterparts. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [figma-create-design-system-rules](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-create-design-system-rules/SKILL.md) | Document project-specific design-system implementation rules. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [figma-generate-design](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-generate-design/SKILL.md) | Represent application pages or layouts in Figma. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [figma-generate-library](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-generate-library/SKILL.md) | Build Figma tokens, themes and component libraries from code. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [figma-implement-design](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-implement-design/SKILL.md) | Implement a supplied Figma design in application code. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [figma-use](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-use/SKILL.md) | Operate the Figma tool workflow required by related skills. | Installed; requires appropriate Figma tools/access; not connected by this research. |
| [frontend-design](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/frontend-design/SKILL.md) | Alternative workflow for deliberate visual direction and frontend design. | Installed; use when the task matches this purpose. |
| [impeccable](https://github.com/pbakaus/impeccable/blob/5e745ace7e151feb2a93d360d0281fe39448b857/.agents/skills/impeccable/SKILL.md) | Design, critique, refine and verify frontend interfaces; available here. | Existing copy retained; its current hash is recorded in the receipt. |
| [migrate-radix-to-base](https://github.com/shadcn-ui/ui/blob/main/skills/migrate-radix-to-base/SKILL.md) | Migrate a primitive family only when that migration is requested. | Installed; use when the task matches this purpose. |
| [shadcn](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md) | Find, compose, customize and maintain project-aware shadcn/ui components. | Installed; use when the task matches this purpose. |
| [theme-factory](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/theme-factory/SKILL.md) | Explore artifact themes; preserve the established application tokens. | Installed; use when the task matches this purpose. |
| [ui-design-system](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/product-team/skills/ui-design-system/SKILL.md) | Plan reusable tokens, components, documentation and handoff. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/.claude/skills/ui-ux-pro-max/SKILL.md) | Searchable UI/UX, typography, palette and interaction guidance. | Installed; use when the task matches this purpose. |
| [ux-researcher-designer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/product-team/skills/ux-researcher-designer/SKILL.md) | Plan user research, journeys, usability work and synthesis. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines/SKILL.md) | Review interface usability, accessibility and web conventions. | Installed; use when the task matches this purpose. |

### Frontend, React and Next.js (11)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [next-bundle-optimizer](https://github.com/vercel/next.js/blob/canary/skills/next-bundle-optimizer/SKILL.md) | Reduce measured initial browser bundle and loading work. | Installed; inspected on canary; match the installed Next.js version/docs before adoption. |
| [next-cache-components-adoption](https://github.com/vercel/next.js/blob/canary/skills/next-cache-components-adoption/SKILL.md) | Adopt Cache Components and resolve related route issues. | Installed; inspected on canary; match the installed Next.js version/docs before adoption. |
| [next-cache-components-optimizer](https://github.com/vercel/next.js/blob/canary/skills/next-cache-components-optimizer/SKILL.md) | Optimize immediate route UI after Cache Components adoption. | Installed; inspected on canary; match the installed Next.js version/docs before adoption. |
| [next-dev-loop](https://github.com/vercel/next.js/blob/canary/skills/next-dev-loop/SKILL.md) | Verify runtime behavior using Next.js and browser tooling. | Installed; additional tools/runtime/access prerequisites; inspect before use. |
| [next-partial-prefetching-adoption](https://github.com/vercel/next.js/blob/canary/skills/next-partial-prefetching-adoption/SKILL.md) | Adopt Partial Prefetching with compatible route behavior. | Installed; inspected on canary; match the installed Next.js version/docs before adoption. |
| [next-partial-prefetching-optimizer](https://github.com/vercel/next.js/blob/canary/skills/next-partial-prefetching-optimizer/SKILL.md) | Tune selected pre-navigation content after feature adoption. | Installed; inspected on canary; match the installed Next.js version/docs before adoption. |
| [senior-frontend](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-frontend/SKILL.md) | General React/Next.js/TypeScript frontend engineering workflow. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [vercel-composition-patterns](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/composition-patterns/SKILL.md) | Design reusable React APIs and component composition boundaries. | Installed; use when the task matches this purpose. |
| [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices/SKILL.md) | Review React/Next.js rendering, data loading and performance. | Installed; use when the task matches this purpose. |
| [vercel-react-native-skills](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-native-skills/SKILL.md) | React Native/Expo engineering; outside this website project. | Installed; outside the current website delivery workflow. |
| [vercel-react-view-transitions](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-view-transitions/SKILL.md) | Implement React view transitions where supported and appropriate. | Installed; use when the task matches this purpose. |

### Full-stack, backend, database and authentication (22)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [api-design-reviewer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/api-design-reviewer/SKILL.md) | Review API conventions, compatibility and contract design. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [better-auth-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/better-auth/best-practices/SKILL.md) | Configure Better Auth, adapters, sessions and supported plugins. | Installed; use when the task matches this purpose. |
| [better-auth-security-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/security/SKILL.md) | Harden auth origins, cookies, rate limits and secret handling. | Installed; use when the task matches this purpose. |
| [create-auth](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/better-auth/create-auth/SKILL.md) | Implement Better Auth sign-in and registration entry points. | Installed; use when the task matches this purpose. |
| [database-designer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/database-designer/SKILL.md) | Design relational models, query paths and migration approaches. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [database-schema-designer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/database-schema-designer/SKILL.md) | Review normalization, relationships and schema diagrams. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [email-and-password-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/better-auth/emailAndPassword/SKILL.md) | Implement email verification, credential policies and recovery. | Installed; use when the task matches this purpose. |
| [migration-architect](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/migration-architect/SKILL.md) | Plan compatibility, staged migration and recovery. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [neon](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon/SKILL.md) | Route Neon backend work across its available platform capabilities. | Installed; use when the task matches this purpose. |
| [neon-auth](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-auth/SKILL.md) | Provider-managed authentication option; not automatically selected here. | Installed; optional service decision; do not silently expand the selected stack. |
| [neon-functions](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-functions/SKILL.md) | Neon-hosted function workflows if explicitly adopted. | Installed; optional service decision; do not silently expand the selected stack. |
| [neon-object-storage](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-object-storage/SKILL.md) | Neon file-storage workflows if that provider is selected. | Installed; optional service decision; do not silently expand the selected stack. |
| [neon-postgres](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-postgres/SKILL.md) | Neon PostgreSQL connections, migrations, scaling and database operation. | Installed; use when the task matches this purpose. |
| [neon-postgres-branches](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-postgres-branches/SKILL.md) | Manage database branching with explicit data-isolation safeguards. | Installed; use when the task matches this purpose. |
| [neon-postgres-egress-optimizer](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-postgres-egress-optimizer/SKILL.md) | Investigate database transfer costs and query/data movement. | Installed; use when the task matches this purpose. |
| [neon-realtime](https://github.com/neondatabase/agent-skills/blob/9df568a3f88a361ea33db00453ff754d07b3b3e1/skills/neon-realtime/SKILL.md) | Live-query and reactive data workflows if adopted. | Installed; optional service decision; do not silently expand the selected stack. |
| [organization-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/better-auth/organization/SKILL.md) | Use Better Auth organizations, membership and role features. | Installed; use when the task matches this purpose. |
| [performance-profiler](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/performance-profiler/SKILL.md) | Measure CPU, memory, I/O, queries and performance bottlenecks. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [senior-architect](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-architect/SKILL.md) | Evaluate system boundaries, dependencies and architectural tradeoffs. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [senior-backend](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-backend/SKILL.md) | Design server APIs, persistence and backend behavior. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [senior-fullstack](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-fullstack/SKILL.md) | Broad full-stack engineering and scaffolding; retain this project’s stack. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [two-factor-authentication-best-practices](https://github.com/better-auth/skills/blob/20c9e88a5c007461a703f1c213572b073196113e/better-auth/twoFactor/SKILL.md) | Implement factor enrollment, verification and recovery policies. | Installed; use when the task matches this purpose. |

### Software-engineering workflow and code review (17)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [brainstorming](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/brainstorming/SKILL.md) | Clarify feature intent and design before implementation. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [code-reviewer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/code-reviewer/SKILL.md) | General implementation-quality and maintainability review. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [diagnosing-superpowers](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/diagnosing-superpowers/SKILL.md) | Investigate behavior of the Superpowers workflow itself. | Installed; use when the task matches this purpose. |
| [dispatching-parallel-agents](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/dispatching-parallel-agents/SKILL.md) | Coordinate parallel agent work when explicitly authorized. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [executing-plans](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/executing-plans/SKILL.md) | Execute an agreed implementation plan in the current session. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [finishing-a-development-branch](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/finishing-a-development-branch/SKILL.md) | Review completion and branch/PR handoff choices. | Installed; use when the task matches this purpose. |
| [gh-address-comments](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/gh-address-comments/SKILL.md) | Resolve review feedback on the current GitHub pull request. | Installed; use when the task matches this purpose. |
| [gh-fix-ci](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/gh-fix-ci/SKILL.md) | Investigate failing GitHub Actions checks and prepare repairs. | Installed; use when the task matches this purpose. |
| [receiving-code-review](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/receiving-code-review/SKILL.md) | Assess and implement received review feedback. | Installed; use when the task matches this purpose. |
| [requesting-code-review](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/requesting-code-review/SKILL.md) | Prepare a code-review checkpoint against intended behavior. | Installed; use when the task matches this purpose. |
| [subagent-driven-development](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/subagent-driven-development/SKILL.md) | Delegate implementation and review when explicitly authorized. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [systematic-debugging](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/systematic-debugging/SKILL.md) | Trace failures to their root cause before changing code. | Installed; use when the task matches this purpose. |
| [tech-debt-tracker](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/tech-debt-tracker/SKILL.md) | Find and prioritize maintenance work based on repository evidence. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [using-git-worktrees](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/using-git-worktrees/SKILL.md) | Isolate concurrent branch work where useful and authorized. | Installed; use when the task matches this purpose. |
| [using-superpowers](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/using-superpowers/SKILL.md) | Bootstrap the collection’s opinionated development workflow. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [writing-plans](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/writing-plans/SKILL.md) | Create detailed implementation and verification plans. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [writing-skills](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/writing-skills/SKILL.md) | Author and evaluate reusable skills within that collection. | Installed; use when the task matches this purpose. |

### Testing, debugging and verification (11)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [api-test-suite-builder](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/api-test-suite-builder/SKILL.md) | Build API integration and contract checks. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [mutation-testing](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/mutation-testing/skills/mutation-testing/SKILL.md) | Evaluate test strength by investigating surviving code mutations. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [playwright](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/playwright/SKILL.md) | Exercise website journeys in an actual automated browser. | Installed; use when the task matches this purpose. |
| [playwright-interactive](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/playwright-interactive/SKILL.md) | Maintain an interactive browser session for UI debugging. | Installed; use when the task matches this purpose. |
| [property-based-testing](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/property-based-testing/skills/property-based-testing/SKILL.md) | Test numeric, parser and state invariants across generated inputs. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [screenshot](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/screenshot/SKILL.md) | Capture system screenshots when supported and explicitly needed. | Installed; use when the task matches this purpose. |
| [senior-qa](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-qa/SKILL.md) | Plan and generate unit, integration and browser verification. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [tdd-guide](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/tdd-guide/SKILL.md) | Guide test-first development across supported test frameworks. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [test-driven-development](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/test-driven-development/SKILL.md) | Use a deliberate failing-test-first implementation workflow. | Installed; opinionated workflow; review overlap, approvals and delegation rules first. |
| [verification-before-completion](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/verification-before-completion/SKILL.md) | Collect actual checks before claiming a fix is complete. | Installed; use when the task matches this purpose. |
| [webapp-testing](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/webapp-testing/SKILL.md) | Alternative Playwright-based local web testing workflow. | Installed; use when the task matches this purpose. |

### Security, audits and supply chain (17)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [agentic-actions-auditor](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/agentic-actions-auditor/skills/agentic-actions-auditor/SKILL.md) | Review AI-agent GitHub Actions trust and credential boundaries. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [audit-context-building](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/audit-context-building/skills/audit-context-building/SKILL.md) | Understand assumptions and dependencies before security review. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [codeql](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/static-analysis/skills/codeql/SKILL.md) | Run supported CodeQL dataflow/security analysis with prerequisites. | Installed; additional tools/runtime/access prerequisites; inspect before use. |
| [dependency-auditor](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/dependency-auditor/SKILL.md) | Review dependency risks, licensing and upgrade options. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [differential-review](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/differential-review/skills/differential-review/SKILL.md) | Review changes for security impact and affected callers. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [post-patch-validation](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/post-patch-validation/skills/post-patch-validation/SKILL.md) | Validate security fixes and root-cause variants after patching. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [sarif-parsing](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/static-analysis/skills/sarif-parsing/SKILL.md) | Interpret and combine existing static-analysis reports. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [security-best-practices](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-best-practices/SKILL.md) | Review supported languages/frameworks for secure implementation practices. | Installed; use when the task matches this purpose. |
| [security-ownership-map](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-ownership-map/SKILL.md) | Identify sensitive-code ownership and repository ownership risks. | Installed; requires usable Git history; Git metadata was unavailable during earlier project checks. |
| [security-threat-model](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model/SKILL.md) | Model repository assets, trust boundaries and abuse paths. | Installed; use when the task matches this purpose. |
| [semgrep](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/static-analysis/skills/semgrep/SKILL.md) | Run supported Semgrep rules and triage findings. | Installed; additional tools/runtime/access prerequisites; inspect before use. |
| [senior-secops](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-secops/SKILL.md) | Security operations, vulnerability triage and remediation workflows. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [senior-security](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-security/SKILL.md) | Threat analysis and routing to security specialist workflows. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [sharp-edges](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/sharp-edges/skills/sharp-edges/SKILL.md) | Find APIs and defaults that encourage security mistakes. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [skill-security-auditor](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/skill-security-auditor/SKILL.md) | Review external skill instructions/scripts before adoption. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [supply-chain-risk-auditor](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md) | Review advisory matches, dependency provenance and install scripts. | Installed; security-specialist source; scanner/workflow prerequisites require review. |
| [variant-analysis](https://github.com/trailofbits/skills/blob/2be6433b39e009cd2b6fd3be1895f6b1faa5af9a/plugins/variant-analysis/skills/variant-analysis/SKILL.md) | Find other instances of an already identified defect pattern. | Installed; security-specialist source; scanner/workflow prerequisites require review. |

### CI/CD, deployment and observability (11)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [ci-cd-pipeline-builder](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/ci-cd-pipeline-builder/SKILL.md) | Generate stack-aware build and delivery pipelines. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [cloudflare-deploy](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/cloudflare-deploy/SKILL.md) | Cloudflare deployment workflows when that hosting platform is selected. | Installed; use when the task matches this purpose. |
| [deploy-to-vercel](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/deploy-to-vercel/SKILL.md) | Alternative Vercel deployment workflow; overlaps the OpenAI option. | Installed; use when the task matches this purpose. |
| [netlify-deploy](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/netlify-deploy/SKILL.md) | Netlify deployment workflows when that host is selected. | Installed; use when the task matches this purpose. |
| [observability-designer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/observability-designer/SKILL.md) | Design service metrics, traces, logs and useful alerts. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [render-deploy](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/render-deploy/SKILL.md) | Render deployment workflows and infrastructure configuration. | Installed; use when the task matches this purpose. |
| [senior-devops](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-devops/SKILL.md) | Plan build, infrastructure, deployment and operations workflows. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [sentry](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/sentry/SKILL.md) | Inspect production issues using a connected Sentry environment. | Installed; additional tools/runtime/access prerequisites; inspect before use. |
| [vercel-cli-with-tokens](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/vercel-cli-with-tokens/SKILL.md) | Operate Vercel CLI workflows with scoped credential handling. | Installed; additional tools/runtime/access prerequisites; inspect before use. |
| [vercel-deploy](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/vercel-deploy/SKILL.md) | Deploy to Vercel when authorized and selected as host. | Installed; use when the task matches this purpose. |
| [vercel-optimize](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/vercel-optimize/SKILL.md) | Investigate measured Vercel cost, reliability and performance. | Installed; use when the task matches this purpose. |

### Documentation, integrations and skill discovery (9)

| Skill / primary source | Purpose | Installation / use limits |
| --- | --- | --- |
| [cli-creator](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/cli-creator/SKILL.md) | Create task-focused command-line tools and their usage contracts. | Installed; use when the task matches this purpose. |
| [codebase-onboarding](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/codebase-onboarding/SKILL.md) | Document an existing repository for engineers. | Installed community workflow; check scripts, scaffolding assumptions and tool compatibility. |
| [doc-coauthoring](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/doc-coauthoring/SKILL.md) | Develop structured specifications and documentation collaboratively. | Installed; use when the task matches this purpose. |
| [find-skills](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | Discover further skill packages for a specific workflow. | Installed; use when the task matches this purpose. |
| [linear](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/linear/SKILL.md) | Manage tracked issues and project work in Linear. | Installed; use when the task matches this purpose. |
| [mcp-builder](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/mcp-builder/SKILL.md) | Build MCP integrations with explicit tool boundaries. | Installed; use when the task matches this purpose. |
| [notion-spec-to-implementation](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/notion-spec-to-implementation/SKILL.md) | Translate connected Notion specifications into implementation tasks. | Installed; use when the task matches this purpose. |
| [web-artifacts-builder](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/web-artifacts-builder/SKILL.md) | Build Claude-style interactive artifacts; not the repository application. | Installed; outside the current website delivery workflow. |
| [writing-guidelines](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/writing-guidelines/SKILL.md) | Improve clear and consistent written interface/documentation content. | Installed; use when the task matches this purpose. |

## Publisher and source distinctions

- **Framework/service maintainers:** Vercel/Next.js, shadcn/ui, Better Auth and Neon publish stack-specific guidance. Match its version and product scope; a provider’s skill can propose services this project has not chosen.
- **Agent-vendor catalogues:** OpenAI and Anthropic publish skills for their workflows. OpenAI’s curated installer returned 39 installable entries during this search; this catalogue selects the development-relevant ones. Some skills depend on vendor-specific tools and need adaptation.
- **Security specialists:** Trail of Bits publishes audit/testing skills. Tool names, scanner licenses, reports, delegation and workflow prerequisites still need review.
- **Community workflows:** Impeccable, UI/UX Pro Max, Superpowers and the senior-engineering collection have different authors and process assumptions. They are not official Next.js/Neon/Better Auth implementation authority.

## Optional project-specific gaps

These are **proposed custom skills, not discovered downloadable packages**: Arabic/RTL accessibility and document verification; current workspace/resource authorization and Neon transaction isolation; financial invariants/idempotency/corrections; and release evidence tied to [SEC controls](../security/README.md). Existing project docs already supply the rules. Use skill-creator later only if recurring work justifies packaging them.

## Installation and evaluation

1. Review the exact SKILL.md, referenced files, license, scripts, network use and requested tools at a pinned revision. Metadata or marketplace scores alone do not prove safety.
2. Select the closest compatible project copy and avoid combining duplicate broad workflows. Preserve this project’s shadcn/ui, Neon, Better Auth, English/Arabic, modular architecture and security gates.
3. Check current Codex discovery/tool compatibility. Some packages assume Claude-only tools, broad scaffolding, mandatory interviews, every-change TDD, automatic commits or delegated agents. Those assumptions need task-specific review; installation does not grant additional authority.
4. Use the available skill-installer for selected reviewed GitHub directories; keep exact repo/path/ref explicit. A downloaded skill is not authorization to run its installers, deploy, send messages or access production.
5. Test the selected workflow with synthetic data and expected outputs before relying on its results. Recheck behavior after updates; do not treat an installed scanner skill as an executed security scan.

The authorized installation used the skill-installer helper and commit-pinned GitHub source directories. Existing Impeccable was preserved. All manifests and hashes were checked; skill scripts were not executed. Discovery uses the [Agent Skills standard](https://agentskills.io/) and [official Codex skill guidance](https://learn.chatgpt.com/docs/build-skills); service connectors/MCP tools are separate capabilities, and skills do not provide accounts or credentials by themselves.

## Search sources and reproducibility

Inventory SHA values below identify Git trees, not necessarily installable commit refs. The installation resolved actual commit refs; see the receipt for those revisions. Do not use the research tree IDs as installer checkout refs.

Primary discovery: [OpenAI catalogue](https://github.com/openai/skills), [Vercel directory](https://vercel.com/docs/agent-resources/skills), [official shadcn skill docs](https://ui.shadcn.com/docs/skills), repository inventories and the manifests linked above. No third-party ranking or install count was used as a quality guarantee.

| Repository | Inspected reference | Selected manifests |
| --- | --- | --- |
| [openai/skills](https://github.com/openai/skills) | `49f948faa9258a0c61caceaf225e179651397431` | 23 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | 9 |
| [better-auth/skills](https://github.com/better-auth/skills) | `20c9e88a5c007461a703f1c213572b073196113e` | 6 |
| [neondatabase/agent-skills](https://github.com/neondatabase/agent-skills) | `9df568a3f88a361ea33db00453ff754d07b3b3e1` | 8 |
| [anthropics/skills](https://github.com/anthropics/skills) | `ca45fc496a3436251f191354091d557da31c15b5` | 7 |
| [obra/superpowers](https://github.com/obra/superpowers) | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` | 15 |
| [trailofbits/skills](https://github.com/trailofbits/skills) | `2be6433b39e009cd2b6fd3be1895f6b1faa5af9a` | 12 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `28b3b8dee8c976df4fa3e94aed4e092ad43fcb03` | 1 |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `5e745ace7e151feb2a93d360d0281fe39448b857` | 1 |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | `0496583603e56cdd5022dd61c823bd784a80a752` | 24 |
| [vercel/next.js](https://github.com/vercel/next.js) | `canary` | 6 |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | `main` | 2 |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | `main` | 1 |

Installation does not certify all scripts or licenses, connect services or benchmark skill quality. Repositories and compatibility can change; review source changes before updating.
