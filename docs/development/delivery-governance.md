# Website delivery governance

Updated 29 October 2026. Current policy for the Next.js website. Earlier feature/tooling records are [historical](../features/README.md); no missing desktop tool, constitution, template or external approval record is assumed to exist in this checkout.

## Scope and authority

Read [AGENTS.md](../../AGENTS.md), [product scope](../../PRODUCT.md), [decisions](../planning/decisions.md) and affected specifications before changing behavior. The user's request governs scope. Documented plans do not themselves install dependencies, provision services or authorize deployment. Confirmed choices remain distinct from recommendations and open gates; do not invent financial/legal, cost or recovery policies.

Preserve the website baseline: shadcn/ui first, a scalable shared design system, Neon, Better Auth, security and appropriate design patterns. Keep tenant isolation, exact immutable financial history, recoverability, English/Arabic RTL and accessibility throughout implementation.

Agents must select and apply matching skills through [skill routing](agent-skills.md). Use one primary workflow with relevant specialists, honor the active user instructions, and verify tool prerequisites. Installed skills provide guidance; their presence does not establish executed tests, connected services or production readiness.

## One complete change

Use focused `codex/` branches when creating branches, unless the user requests another name. Describe the concrete problem and resulting behavior in a reviewable change. Identify every affected caller, component, test, contract, migration, configuration, document and operational path. Reuse existing modules and platform features before adding abstractions or dependencies.

For each feature, record requirements and states, current grants, online/offline behavior, component reuse, module/pattern choice, query/batch bounds, errors, security impact and recovery. Significant tradeoffs and breaking changes update the decision register. Do not reuse historical feature IDs to imply new implementation or transfer old test outcomes.

## Verification and evidence

Run checks that exist and are appropriate to the change. Current application scripts are in [setup](setup.md); future meaningful domain, real-Neon PostgreSQL integration and browser/security suites must be added with the behavior they verify. Browser rendering is website evidence; a historical native result cannot establish it.

Record exact source/build, environment, browser/version, locale/theme, fixtures, commands, passed/failed/not-run results, artifacts and limitations. Use synthetic data and redacted diagnostics. A skipped check, static reference, document count, screenshot or generated evidence file cannot prove auth, financial correctness, current approval or production readiness. Preserve original historical claims without relabeling them as new test runs.

## Review and release

A complete change has current applicable checks, observed QA, updated docs and migration/recovery guidance. Report unresolved defects and disabled capabilities. Owner approval, merge and deployment are distinct actions; follow current user authorization and repository constraints without inventing approval requirements or bypassing existing ones. Prepare concrete reviewable work before any required final approval request.

Deploy through [release operations](../operations/release-and-support.md), with isolated secrets, staged migrations, tenant/security/finance gates, DB-plus-files recovery and measured limits. Failed checks or uncertainty about a money/provider outcome require repair/reconciliation, not a silent waiver or blind replay.

For every security-relevant feature, select owned controls from the [security catalogue](../security/vulnerability-catalogue.md), record actual results under [security testing](../security/testing.md), and satisfy the [release checklist](../security/release-checklist.md). Use [current findings](../security/findings.md) for evidence gaps; a failed advisory lookup is not a clean scan.
