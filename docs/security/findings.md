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
