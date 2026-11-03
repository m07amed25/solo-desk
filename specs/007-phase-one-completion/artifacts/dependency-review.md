# Dependency review — 3 November 2026 continuation

Status: fresh npm audit completed; T064 and G6 remain incomplete.

The first audit attempt failed with registry EAI_AGAIN and a sandbox log-directory restriction. The approved retry returned valid audit JSON, exit 1: 27 affected package entries, comprising 8 low and 19 moderate. The lockfile and dependency manifest were unchanged. This is three root advisory chains, not 27 independent root vulnerabilities.

| Root | Locked versions | Published affected range | Evidence |
| --- | --- | --- | --- |
| deepmerge | 4.3.1 | >=4.2.0 <=4.3.1 | [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) |
| glob | 13.0.6 | >=9.0.0 <=14.0.1 | [Maintainer advisory](https://github.com/isaacs/node-glob/security/advisories/GHSA-3g3m-2fjr-6pw4) |
| minimatch | 10.2.6, 3.1.5 | <11.0.1 | [Maintainer advisory](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249) |

The fresh advisory pages were reviewed on 3 November. The published glob/minimatch fixes are 14.0.2/11.0.1; no patched deepmerge version is listed. No automatic major upgrade, downgrade or forced audit fix was selected.

Local locked versions also include Next 16.4.3, React/React DOM 19.3.0, Better Auth 1.7.14, @neondatabase/auth 0.7.0-beta and pg 8.23.1. This is a local lock inventory, not the managed server or deployed/native/bundled component inventory. Source/lock hashes are in resume-source-identity.json; raw audit output is npm-audit-resume-2026-11-03.json.

All 27 package entries remain Engineering/Security-owned for exact reachability, remediation and supported-version review. The earlier tooling-only/risk-accepted claims are not restored. Complete graph, native/build/managed/deployed advisory review, named reviewer sign-off and any exception remain gaps. No unavailable scan is reported clean.

