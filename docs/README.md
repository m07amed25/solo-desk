# SoloDesk website documentation

Updated 29 October 2026. SoloDesk is a responsive Next.js website for freelancers and small teams. This checkout implements a Neon-connected account/profile slice with Google/GitHub sign-in and live profile updates; the business platform remains specified, not implemented. See [Neon setup and verification](development/neon-setup.md).

## Binding priorities

**shadcn/ui is the primary UI foundation. Design-system quality, scalability, security and appropriate design patterns are primary requirements. Neon PostgreSQL is the selected database. Better Auth is the selected authentication/session system.** These choices replace the earlier Electron and Supabase direction. English/Arabic RTL, exact financial history, scoped team access and eligible offline-drafting goals remain, adapted to browser limits.

Read [product scope](../PRODUCT.md), [decisions](planning/decisions.md), [roadmap](planning/roadmap.md) and [architecture](architecture/overview.md). [Setup](development/setup.md) distinguishes actual dependencies/commands from planned integrations. This update does not install the selected integrations or provision services.

## Documentation map

| Area               | Current authority                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product            | [Requirements](product/requirements.md), [workflows](product/workflows.md), [screens](product/screens.md), [UX/localization](product/ux-and-localization.md), [glossary](product/glossary.md)                                                                                                   |
| Design system      | [DESIGN.md](../DESIGN.md), [design index](design/README.md), [components](design/components-and-interactions.md), [visual recipes](design/component-visual-specs.md), [screen contracts](design/screens.md), [handoff](design/quality-and-handoff.md)                                           |
| Platform           | [Accounts/workspaces](specs/platform-and-workspaces.md), [backend selection](architecture/backend-stack.md), [browser drafts/collaboration](architecture/sync-and-collaboration.md)                                                                                                             |
| Business           | [Clients/sales](specs/client-lifecycle.md), [work](specs/work-management.md), [time](specs/time-and-productivity.md), [finance](specs/finance.md), [insights/knowledge](specs/insights-and-knowledge.md), [integrations/automation](specs/integrations-and-automation.md)                       |
| Architecture       | [Overview](architecture/overview.md), [patterns/scalability](architecture/design-patterns.md), [source structure](architecture/project-structure.md), [module ownership](modules/responsibilities.md), [data model](architecture/data-model.md), [API contracts](architecture/api-contracts.md) |
| Security/data      | [Security/privacy](architecture/security-and-privacy.md), [data lifecycle](architecture/data-lifecycle.md), [release/support](operations/release-and-support.md)                                                                                                                                |
| Quality            | [Acceptance](quality/acceptance.md), [test strategy](quality/test-strategy.md), [current documentation validation](design/current-validation.md)                                                                                                                                                |
| Planning           | [Roadmap](planning/roadmap.md), [coverage](planning/coverage.md), [decisions](planning/decisions.md), [risks](planning/risks.md)                                                                                                                                                                |
| Development        | [Setup](development/setup.md), [delivery governance](development/delivery-governance.md), [repository instructions](../AGENTS.md)                                                                                                                                                               |
| Historical records | [Feature history](features/README.md), [QA history](qa/README.md), [old visual review](design/review.md), [old validation](design/validation.md), [captures](design/previews/README.md)                                                                                                         |

## Security checks

The dedicated [security directory](security/README.md) contains the threat model, 64-control vulnerability catalogue, stack-specific checks, CVE/dependency process, testing/release gates, findings and incident response. It covers known weakness classes and ongoing advisory review; it does not claim to enumerate every CVE or certify the website. [Current scan status](security/findings.md) distinguishes an unavailable audit from a clean result.

## Agent skills

Use [agent skill routing](development/agent-skills.md) to select and apply skills when their task triggers match. The [catalogue](development/agent-skills-catalogue.md) covers 115 skills across design, frontend, full-stack, engineering, testing, security and operations. All 115 are present locally (114 installed, one existing copy retained); the [receipt](development/agent-skills-installation.json) records sources and hashes. Skill scripts, external services and scanner dependencies require task-specific verification.

## Phase plans

- [P00 — Product rules, scope and UX](planning/phases/P00-product-decisions.md)
- [P01 — Secure website, Neon, Better Auth and team foundation](planning/phases/P01-platform-and-cloud.md)
- [P02 — Clients, sales and agreements](planning/phases/P02-client-lifecycle.md)
- [P03 — Projects, tasks and controlled delivery](planning/phases/P03-work-management.md)
- [P04 — Time evidence, rates and review](planning/phases/P04-time-and-productivity.md)
- [P05 — Billing, collections and commercial finances](planning/phases/P05-finance.md)
- [P06 — Business visibility, knowledge and search](planning/phases/P06-insights-and-knowledge.md)
- [P07 — Provider connections and deterministic rules](planning/phases/P07-integrations-and-automation.md)
- [P08 — Client portal within the website](planning/phases/P08-client-portal.md)
- [P09 — Website deployment, support and reliable service](planning/phases/P09-release-and-operations.md)

## Source-of-truth and maintenance

User-confirmed decisions govern stack/platform and priorities. Product/domain specs own behavior; the design system owns visual/interaction reuse; architecture/security own trust and storage. Keep requirements, affected data/API/states, phase, acceptance, risks and decisions consistent. Stable IDs are never reused for unrelated work; native-specific feature entries are explicitly superseded/retired in the design coverage map.

Older feature/QA prose, commands, test counts, external references and JSON evidence remain historical records of a different baseline; they do not establish that those files, tools or integrations exist here. Current docs take precedence. A visual reference is illustrative; only fresh build-specific evidence can satisfy implementation/release gates. Open legal, region/cost, auth policy, browser draft and recovery decisions stay visible rather than silently becoming defaults.
