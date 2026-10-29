# Agent skill routing

Updated 29 October 2026. All 115 skills in the [catalogue](agent-skills-catalogue.md) are present in the local Codex user directory: 114 were installed and the existing Impeccable copy was retained. The [installation receipt](agent-skills-installation.json) records source commits, paths and manifest hashes. This installation belongs to this machine; cloning the project does not install the user-directory skills.

## Required agent workflow

Before starting a task, select the relevant skills from the table below and the catalogue's purpose column. Read each selected `SKILL.md` and only the supporting references needed for the task. State briefly which skills you are using. Use their applicable instructions during the work, then report actual verification and remaining gaps.

Start with the most specific skill and add specialists when their scope applies. Choose one primary design or implementation workflow for the task. Installation does not require loading every skill for every change. Follow explicitly requested skills and the current session's active workflow, including Ponytail when enabled.

Find skills in the active session's skill catalogue first. Project copies live at `.agents/skills/<name>/SKILL.md`; these installations live at `${CODEX_HOME:-$HOME/.codex}/skills/<name>/SKILL.md`. Plugin-provided copies have their own displayed paths. Use the closest applicable project copy when available and compatible; if a name has multiple copies, select one and identify its source rather than combining conflicting versions. Read a file directly if its installed metadata is omitted from the session listing.

User instructions, runtime restrictions, [AGENTS.md](../../AGENTS.md), selected stack and version-matched Next.js documentation govern the work. Skills supply workflows; they do not authorize stack changes, scaffolding over this project, production access, deployments, external messages, paid resources or delegation. Use available tools and their actual schemas instead of copying tool names or model settings from another agent platform.

## Task selection

| Task or trigger | Select and apply | Project requirement |
| --- | --- | --- |
| Build or change website UI | `shadcn`, plus the active UI design skill such as `impeccable` | Reuse `components/ui`, semantic tokens, responsive layouts and English/Arabic RTL contracts. |
| Research UX, journeys or visual options | `ux-researcher-designer`, `ui-ux-pro-max`; `frontend-design` is an alternative primary design workflow | Base decisions on the product requirements and existing design system. |
| Design tokens, component specifications or handoff | `ui-design-system`; compatible project `design-system` when available | Follow [DESIGN.md](../../DESIGN.md); shadcn/ui remains the foundation. |
| Review accessibility or interface conventions | `web-design-guidelines`, with the selected UI skill | Verify keyboard/focus behavior, contrast, responsive states and RTL. |
| React/Next.js implementation and component APIs | `vercel-react-best-practices`, `vercel-composition-patterns`; `senior-frontend` for broader work | Read relevant installed Next.js guides before code changes; preserve server/client boundaries. |
| Verify an application change in the running Next.js app | `next-dev-loop` | Check tool/runtime prerequisites and observe the changed behavior. |
| Measured slow loading, bundles or routes | `next-bundle-optimizer`, `performance-profiler` | Measure the relevant path before optimizing. |
| Adopt or optimize Next.js caching/prefetching | Matching `next-cache-components-*` or `next-partial-prefetching-*` skill | Adoption and optimization are separate tasks; check installed version support first. |
| Supported route transitions or animation | `vercel-react-view-transitions` | Verify framework support, focus and reduced-motion behavior. |
| Architecture, boundaries, patterns or full-stack features | `senior-architect`, `senior-fullstack`, and the relevant frontend/backend specialists | Apply [design patterns](../architecture/design-patterns.md) to the existing website. |
| Server behavior or API contracts | `senior-backend`, `api-design-reviewer` | Enforce server-side validation and tenant/resource/action authorization. |
| Neon access, schema, queries or migrations | `neon-postgres`, `database-designer` or `database-schema-designer`; `migration-architect` for staged migrations | Use bounded server-only access, reviewed migrations and explicit recovery. |
| Isolated database branches or excessive database transfer | `neon-postgres-branches` or `neon-postgres-egress-optimizer` | Use synthetic data and measure isolation/cost impacts. |
| Better Auth implementation or review | `better-auth-best-practices`, `better-auth-security-best-practices`; `create-auth` when adding flows | Preserve the selected Better Auth architecture and verify origins, sessions and authorization. |
| Password/email, organizations, or second factors | Matching `email-and-password-best-practices`, `organization-best-practices`, or `two-factor-authentication-best-practices` | Apply only the capabilities required by the feature; test recovery and negative cases. |
| Security design or broad review | `security-threat-model`, `security-best-practices`; `senior-security` or `senior-secops` for broader triage | Start from [security controls](../security/README.md); record evidence and gaps. |
| Understand a security-sensitive area or review a diff | `audit-context-building`, `differential-review`, `sharp-edges` | Trace callers and trust boundaries before judging exposure. |
| Dependency, advisory or skill-source review | `supply-chain-risk-auditor`, `dependency-auditor`, `skill-security-auditor` as applicable | Match exact versions to fresh advisories; installation is not a security certification. |
| AI-agent GitHub Actions or static-analysis results | `agentic-actions-auditor`; `codeql`, `semgrep`, `sarif-parsing` for the relevant scanner/report | Inspect workflow trust boundaries and scanner prerequisites; an installed skill is not an executed scan. |
| A vulnerability was found or patched | `variant-analysis`, `post-patch-validation` | Check root-cause variants and reproduce baseline versus patched behavior safely. |
| Unit, API, integration or browser verification | `senior-qa`, `api-test-suite-builder`, `playwright` or `webapp-testing` | Choose meaningful tests for changed behavior; use isolated identities and fixtures. |
| Numeric/parser/state invariants or test-strength review | `property-based-testing`, `mutation-testing`; `tdd-guide` or `test-driven-development` when using that workflow | Test financial precision, state transitions and adversarial inputs where applicable. |
| Browser debugging or requested system capture | `playwright-interactive`, `screenshot` where supported | Use the available browser tools; protect secrets and personal data in artifacts. |
| Failure, bug or unexpected behavior | `systematic-debugging` | Establish the root cause before editing and check affected callers. |
| Plans, implementation, review or completion | Matching `writing-plans`, `executing-plans`, `code-reviewer`, `receiving-code-review`, `requesting-code-review`, `verification-before-completion` | Scale the process to the task and active user instructions; substantiate completion claims. |
| CI, infrastructure, observability or production errors | `ci-cd-pipeline-builder`, `senior-devops`, `observability-designer`, `sentry` as applicable | Use the selected provider, available credentials and redacted diagnostics. |
| Documentation, onboarding or maintenance | `doc-coauthoring`, `codebase-onboarding`, `writing-guidelines`, `tech-debt-tracker` | Keep current authority and historical records distinct. |
| Connected Figma, GitHub, Notion or Linear work | Matching `figma*`, `gh-address-comments`, `gh-fix-ci`, `notion-spec-to-implementation`, or `linear` | Verify the required connector/CLI and access. Read `figma-use` before the tools it governs. |
| Deploy or optimize the selected hosting provider | Matching `vercel-deploy` or `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-optimize`, `cloudflare-deploy`, `netlify-deploy`, or `render-deploy` | Use one matching deployment workflow only when deployment is in the authorized task. |

The catalogue routes every installed skill by its purpose, including narrower options not needed in the default website workflow. `brainstorming`, `using-superpowers`, `diagnosing-superpowers`, `using-git-worktrees`, `finishing-a-development-branch` and `writing-skills` apply to their named process tasks. `dispatching-parallel-agents` and `subagent-driven-development` require delegation to be allowed by the current session. `security-ownership-map` requires usable Git history. `find-skills` is for a capability gap; `cli-creator` and `mcp-builder` are for explicitly scoped tool development.

`canvas-design` and `theme-factory` support requested visual artifacts. `web-artifacts-builder` targets a separate artifact workflow. `vercel-react-native-skills` is outside this website's implementation scope. `migrate-radix-to-base` applies only to a requested primitive migration. The `neon` router and optional `neon-auth`, `neon-functions`, `neon-object-storage` and `neon-realtime` guides do not select those extra services for SoloDesk; managed Neon Auth requires an explicit architecture decision alongside the current Better Auth choice.

## Trail of Bits plugins

The `trailofbits/skills` marketplace is configured locally. The user-selected set of 10 plugins is installed and enabled, verified with `codex plugin list --marketplace trailofbits --json`. Versions and installed manifest hashes are included in the [installation receipt](agent-skills-installation.json).

| Plugin | Use when |
| --- | --- |
| `agentic-actions-auditor@trailofbits` | Reviewing AI-agent GitHub Actions and their trust boundaries. |
| `audit-context-building@trailofbits` | Establishing assumptions and dependencies before a security review. |
| `differential-review@trailofbits` | Reviewing a change for security impact and affected callers. |
| `mutation-testing@trailofbits` | Evaluating test strength and surviving mutations. |
| `post-patch-validation@trailofbits` | Validating a security patch against the original issue and variants. |
| `property-based-testing@trailofbits` | Testing invariants across generated inputs. |
| `sharp-edges@trailofbits` | Reviewing error-prone APIs and dangerous defaults. |
| `static-analysis@trailofbits` | Using its bundled `codeql`, `semgrep` or `sarif-parsing` skill. |
| `supply-chain-risk-auditor@trailofbits` | Reviewing dependency advisories, provenance and install scripts. |
| `variant-analysis@trailofbits` | Finding related instances of an identified defect. |

These provide the same 12 security skill names already installed globally. Select one compatible copy per skill using its displayed path; the plugin set does not increase the 115 unique catalogued names. Existing global copies were preserved. Scanner binaries, licenses, runtime dependencies and external access remain task-specific prerequisites. Other Trail of Bits marketplace plugins were not selected.

The pre-install static pattern check and manual triage covered the selected packages. Flags included security examples/test fixtures, Markdown/emoji formatting, temporary-directory cleanup and advisory API requests; these were reviewed in context. The receipt records these limitations. This check is not a complete code audit or proof of safety. In particular, supply-chain tooling can send dependency names/versions to advisory services; review data sensitivity before running it.

## Compatibility and verification

Installed skill content can assume another agent's tools, subagents, hooks, scripts or paths. Check those assumptions before use. Project-local skills and pre-existing plugin skills were preserved. Other locally available skills, such as project `design`, `ui-styling` or `brand`, may supplement a matching task without changing this stack.

The installed global UI/UX Pro Max manifest uses `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py` in examples. For standalone Codex, resolve `scripts/search.py` relative to the selected skill directory. The existing project copy already uses `.agents/skills/ui-ux-pro-max/scripts/search.py`. Do not assume `CLAUDE_PLUGIN_ROOT` is set or copy another version's script arguments without reading its help/source.

The installation check confirmed all 115 manifests exist, unique canonical names and recorded hashes. Skill scripts, scanners, connected services, deployments and all possible runtime combinations were not exercised. Tool dependencies and credentials must be checked when their task is undertaken. Record an unavailable check as a gap; never claim application security from skill availability.

After installing or updating skills/plugins, verify their visibility in a fresh Codex turn/session before relying on automatic discovery. Review source changes and refresh the receipt when updating these installations. See [setup](setup.md) and [delivery governance](delivery-governance.md).
