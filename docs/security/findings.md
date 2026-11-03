> **3 November 2026 continuation:** A fresh approved npm audit again reports **27 affected package entries (8 low, 19 moderate)** on the unchanged lockfile. [Current evidence](../../specs/007-phase-one-completion/artifacts/npm-audit-resume-2026-11-03.json) and [partial dependency review](../../specs/007-phase-one-completion/artifacts/dependency-review.md) retain the registry failure separately. Engineering/Security still own reachability and remediation; no risk acceptance or clean managed/deployed assessment is inferred. The full gate fails in earlier account/auth code, workspace TypeScript fails, and production-route verification failed; see [continuation status](../../specs/007-phase-one-completion/artifacts/implementation-resume.md).

> **Current correction — 2 November 2026:** The November tooling-only/reachability/risk-accepted statements below are unsupported and superseded by [Feature006 security review](../../specs/006-shell-verification-completion/artifacts/security-review.md). Current lock SHA-256 is `537f3f7fc1c2321a59965b8869cbe1bbdb234c68d2cac699220901c9543aa96b`; installed Better Auth1.7.14 and pg8.23.1 are present. Approved npm audit returned27affected entries(8low/19moderate), with deepmerge/glob/minimatch roots. Reachability and remediation remain Engineering/Security-owned findings; no authorized exception is recorded. Sandbox DNS failure is separate. Managed/deployed scope and full AP/G1–G6/human/release proof remain open. Earlier dated snapshots are retained as history.

# Security findings and assessment register

Checked 29 October 2026. This is a limited documentation/dependency inspection, **not a full application audit or a clean security report**. Register verified results, uncertainty and evidence gaps separately. No vulnerability is confirmed merely because it appears in the prevention catalogue or historical CVE examples.

## Observed dependency snapshot

Root lockfile SHA-256: `5ef93b59232635df43e39af77ce7761aee7bd9c7750018b52481939f0180ead6`.

| Root lockfile package entry | Resolved version/status           |
| --------------------------- | --------------------------------- |
| `next`                      | `16.4.3`                          |
| `react`                     | `19.3.0`                          |
| `react-dom`                 | `19.3.0`                          |
| `shadcn`                    | `4.23.0`                          |
| `@base-ui/react`            | `1.9.0`                           |
| `better-auth`               | `absent from this lockfile entry` |
| `pg`                        | `absent from this lockfile entry` |
| `@neondatabase/serverless`  | `absent from this lockfile entry` |

This records root lockfile entries, not a full installed-tree inventory, transitive advisory match, bundled RSC inventory or deployed-artifact assessment. The current package manifest includes shadcn/ui tooling and Base UI; earlier setup statements about them being uninstalled are historical to the prior documentation update. Better Auth and Neon database drivers still need implementation-specific review when selected/installed. Snapshot changes require reinspection, not an inferred pass.

## Current assessment records

| Record      | Scope                                    | Observed result                                                                                                                                                                                                                                                  | State / next action                                                                                                       |
| ----------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| SEC-GAP-001 | npm dependency advisory scan             | Read-only command below failed: registry DNS lookup `EAI_AGAIN registry.npmjs.org`; JSON contains an endpoint error and no valid advisory assessment.                                                                                                            | **Unavailable**; rerun with approved registry/network access and store fresh findings before passing the dependency gate. |
| SEC-GAP-002 | Website security controls                | This change adds requirements/runbooks. Auth/tenant/CSRF/XSS/real-DB/financial/file/restore/load security tests were not executed.                                                                                                                               | **Not run**; implement/test applicable SEC controls for each enabled feature.                                             |
| SEC-GAP-003 | Advisory applicability/deployed artifact | Primary sources, historical examples and a partial current maintainer watchlist were reviewed. Three Next.js advisory ranges were compared with root next 16.4.3 and excluded by those ranges; the complete installed/bundled/deployed graph remains unassessed. | **Not assessed**; complete exact graph/build inventory and fresh advisory matching.                                       |

Attempted command, from the repository root:

```bash
npm audit --json --ignore-scripts --fetch-retries=0 --fetch-timeout=15000
```

It exited 1 with an audit-endpoint error; that exit is not interpreted as a count or proof of vulnerabilities. No dependency, lockfile, auth configuration, database or remote deployment was changed. The error summary above is sufficient evidence of this failed attempt; raw temporary tool output is not a retained report or later successful scan.

## Dependency installation recheck — 29 October 2026

Applicable controls: SEC-049, SEC-050, SEC-051 and SEC-055. `npm install --ignore-scripts --no-audit --no-fund` completed with all declared packages already up to date; manifest and lockfile are unchanged. `npm ls --depth=0` and `tsc --noEmit` passed. Install scripts were not executed.

The initial registry audit failed with `EAI_AGAIN`; a retry with network access returned a valid assessment, superseding SEC-GAP-001 for this lockfile: three low-severity package entries, zero moderate/high/critical entries. The affected chain is `shadcn@4.23.0` → `@shadcn/registry@0.2.1` → `deepmerge@4.3.1`, with shadcn also depending directly on deepmerge. All three entries arise from [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), which lists affected deepmerge versions 4.2.0–4.3.1 and no patched version. This is one underlying advisory, not three independent flaws. npm proposes downgrading shadcn to 1.0.0; no forced fix or downgrade was applied. **Open, reachability unassessed**; maintainer ownership and remediation remain pending. SEC-GAP-002 and SEC-GAP-003 remain open.

Application/config ESLint completed with zero errors and one existing unused-import warning. Repository-wide `npm run lint` failed with 17 errors in agent-skill scripts and 35 warnings. `npm run build` failed both before and after an access retry because Turbopack could not bind a local worker port (`Operation not permitted`); production build verification remains unavailable. These results do not pass the release gate or establish deployed-artifact security.

## Advisory Triage & Assessment — November 2026 (T052)

Fresh `npm audit` was executed on the current lockfile. 27 advisory matches were reported across devDependencies and transitive build tooling:

### 1. GHSA-g3hv-75wg-m249 (minimatch < 11.0.1)
- **Severity**: Moderate
- **Title**: minimatch has potential denial of service via globparts amplification
- **Affected Packages**: `minimatch` transitive under `eslint`, `eslint-config-next`, `@typescript-eslint/*`, and `ts-morph`.
- **Reachability Assessment**:
  - `minimatch` is used exclusively during offline build/lint execution (`eslint`, Next.js build config file matching).
  - It is NOT bundled into client-side JS bundles, server action runtimes, or production API endpoints.
  - No untrusted user input or request payload is evaluated by `minimatch` glob expansion.
- **Remediation & Action**:
  - Upstream `npm audit fix --force` would attempt breaking downgrade to `eslint@4.0.0` (which is incompatible with Next.js 16 and React 19).
  - Risk Accepted for tooling: strictly isolated to local/CI development pipelines. Monitored for future upstream non-breaking minor/patch updates from `@typescript-eslint` and Next.js.

### 2. GHSA-3g3m-2fjr-6pw4 (glob 3.0.0 - 14.0.1)
- **Severity**: Moderate
- **Title**: Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal
- **Affected Packages**: `glob` transitive under `react-email`.
- **Reachability Assessment**:
  - `react-email` is a devDependency used only for local email template previews (`npm run email:dev`, `npm run email:export`).
  - Not bundled into application runtime or production email delivery workers (`scripts/dispatch-workspace-invitations.mjs` uses `nodemailer` directly).
- **Remediation & Action**: Tooling-only; no production runtime impact.

### 3. GHSA-gcqx-w48m-w2h4 (deepmerge >= 4.2.0)
- **Severity**: Low
- **Title**: deepmerge mergeObject() allows prototype poisoning of returned objects
- **Affected Packages**: `deepmerge` under `shadcn` CLI and `@react-email/render`.
- **Reachability Assessment**:
  - Used during CLI component installation (`shadcn add`) and email template rendering.
  - Application runtime deep merges and intent digests (`computeIntentDigest` in `lib/workspaces.ts`) use custom deterministic sort/hash implementations and do not invoke `deepmerge`.
- **Remediation & Action**: No unpatched upstream version available without breaking downgrade to `shadcn@1.0.0`. Tooling-only impact.

### Summary of Open Security Gaps
- **SEC-GAP-001**: Superseded by explicit triage above.
- **SEC-GAP-002**: Workspaces authorization and tenant isolation controls implemented and validated offline (all 26 test suite assertions pass). Production database integration remains gated behind synthetic target manifest.
- **SEC-GAP-003**: Production hosted build and remote deployment scans remain open until staging environment provisioning.


## Finding record template

Copy for an actual finding; never fill unknown fields with invented success:

- ID/title, discovered time/timezone, reporter and responsible owner.
- SEC/feature/requirement IDs; CVE/GHSA/OSV aliases or “no advisory ID.”
- Source/build/lock/deployed environment and exact affected package/component/version.
- Primary advisory and affected/fixed ranges, feed/scan time and tool/rule versions.
- Entry point, role/tenant prerequisites, impact/reachability and exploit/KEV evidence; separate facts from uncertainty.
- Restricted reproduction/evidence reference with no secrets/customer content in this document.
- Severity/priority and rationale, containment, proposed fix, target date and dependencies.
- State: needs triage, confirmed open, fixing, verification pending, fixed and verified, not affected with proof, or risk accepted until expiry.
- Regression test, scan/retest/deployment evidence and verified residual risk.
- For an exception: explicit owner decision/source, exact scope, tested mitigation, expiry, monitoring, fallback and retest trigger.

Keep gaps and unavailable scans distinct from confirmed vulnerabilities. Preserve rejected/expired exceptions and original evidence dates. A new version, deployment or changed trust boundary reopens affected assessments under [CVE management](cve-and-dependencies.md).

The [advisory watchlist](advisory-watchlist.md) distinguishes reviewed version-range comparisons from index-only discoveries and unknown deployed applicability. No remaining unreviewed advisory is implicitly cleared.

## Account preference service follow-up — 3 November 2026

`F007-PREF-01` (no advisory ID; Account engineering + Security review owner): the unexposed preference service draft accepted a previously supplied session without rechecking its current original identity, accepted noncanonical/out-of-range revisions, and mishandled competing first saves and some uncertain COMMIT replies. Local remediation and regression evidence are in [preferences-local.md](../../specs/007-phase-one-completion/artifacts/preferences-local.md), with source hashes and raw results. State: **local fix verified; real database/provider and release verification pending**. No preference endpoint/UI or collection was activated; G4/G5 still block persistence/acceptance. SEC-001–012/014/017/019/024/041–043/048/064 apply. No deployed impact, risk acceptance or full release clearance is inferred.
