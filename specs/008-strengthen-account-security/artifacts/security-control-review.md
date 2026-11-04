# Security control disposition — T008

Date: 2026-11-03. Evidence: current local source/public documentation; no live target or approval.

Assets/trust boundaries: own session/profile envelope, server/client serialization, account-runtime generation/history and managed API forwarding. Informational slice handles no new secret, request, provider method, collection or persistent state. Threats: false disabled/success claims, prior-owner content, outage concealment, unexpected auth forwarding. Broader future mutation threats remain CAP/POL blocked.

| Control | Catalogue concern | Boundary/check and resolution owner | Current disposition |
| --- | --- | --- | --- |
| SEC-001 | Credential stuffing and brute force (CWE-307) | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-002 | Session theft or fixation (CWE-384) | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-003 | Weak reset, verification or MFA recovery | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-004 | OAuth/OIDC account confusion | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-005 | CSRF and login CSRF (CWE-352) | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-006 | Stale sessions after revoke/reset | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-007 | Authentication enumeration | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-008 | Privilege-sensitive actions without reauth | Auth/proof/provider; wrong/replayed/revoked proof, original-session and direct-entry denial; identity/security | Future managed checks blocked; existing auth unchanged |
| SEC-009 | BOLA/IDOR (CWE-639/862) | Own-only projection/generation; foreign fields, late reply, switch/sign-out concealment; web + identity/QA | Local imported/rendered checks planned; live ownership unaccepted |
| SEC-010 | Function-level privilege escalation | Own-only projection/generation; foreign fields, late reply, switch/sign-out concealment; web + identity/QA | Local imported/rendered checks planned; live ownership unaccepted |
| SEC-011 | Mass assignment and field leaks | Own-only projection/generation; foreign fields, late reply, switch/sign-out concealment; web + identity/QA | Local imported/rendered checks planned; live ownership unaccepted |
| SEC-012 | Scope leaks through queries | Own-only projection/generation; foreign fields, late reply, switch/sign-out concealment; web + identity/QA | Local imported/rendered checks planned; live ownership unaccepted |
| SEC-014 | Stale authorization/TOCTOU | Own-only projection/generation; foreign fields, late reply, switch/sign-out concealment; web + identity/QA | Local imported/rendered checks planned; live ownership unaccepted |
| SEC-017 | SQL/ORM query injection (CWE-89) | Bounded input and escaped output; hostile profile text and denied authority payloads; web/identity + QA | No new inputs; test existing denied paths |
| SEC-019 | Unsafe deserialization/RSC handling (CWE-502) | Bounded input and escaped output; hostile profile text and denied authority payloads; web/identity + QA | No new inputs; test existing denied paths |
| SEC-022 | Prototype pollution/unsafe merges | Bounded input and escaped output; hostile profile text and denied authority payloads; web/identity + QA | No new inputs; test existing denied paths |
| SEC-023 | Ambiguous input and normalization (CWE-20) | Bounded input and escaped output; hostile profile text and denied authority payloads; web/identity + QA | No new inputs; test existing denied paths |
| SEC-024 | Regex/decompression/algorithmic denial of service | Bounded input and escaped output; hostile profile text and denied authority payloads; web/identity + QA | No new inputs; test existing denied paths |
| SEC-025 | Stored/reflected/DOM XSS (CWE-79) | Bounded input and escaped output; hostile profile text and denied authority payloads; web/identity + QA | No new inputs; test existing denied paths |
| SEC-026 | Clickjacking and unsafe embedding | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-027 | CORS/origin trust mistakes | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-028 | Cache poisoning or private-data reuse | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-029 | Open redirects and unsafe navigation | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-030 | Proxy/header/request interpretation mismatch | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-031 | Sensitive browser persistence | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-032 | Insecure transport and security headers | Origin/cookie/cache/CSP; direct cross-origin calls and private no-store inspection; identity/security + operations | No forwarding change; real ingress gap |
| SEC-041 | Excessive database privileges | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-042 | Tenant context leaking through pools | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-043 | Missing integrity/transaction constraints | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-044 | Secrets exposure (CWE-798/200) | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-045 | Weak crypto or key management | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-046 | Backup leakage and authority resurrection | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-047 | Production data leaking to previews | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-048 | Privacy/retention/support overreach | Server-only data/crypto/privacy; no secret props/storage, pool/race/restore isolation; data/privacy + operations/security | No new data/schema; existing actual role/retention/recovery gaps remain |
| SEC-049 | Known vulnerable runtime packages | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-050 | Vulnerable build/dev tooling | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-051 | Malicious or substituted package | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-052 | Unsafe shadcn registry/component source | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-053 | Untrusted CI/PR code with secrets | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-054 | Public development/debug surface | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-055 | Artifact or deployment tampering | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-056 | Unsafe migration or rollback | Exact lock/bundle/runtime/source and upgrade provenance/rollback; engineering/security + operations | Fresh advisory/scan review T032; no dependency change |
| SEC-060 | Forged/replayed provider callbacks (CWE-347) | Provider/callback/operation/event/admission; wrong origin/replay, unknown effects, races/outage and two-instance bounds; identity/QA + operations | No new effects/events; positive actual campaign blocked |
| SEC-061 | Job privilege/retry or automation abuse | Provider/callback/operation/event/admission; wrong origin/replay, unknown effects, races/outage and two-instance bounds; identity/QA + operations | No new effects/events; positive actual campaign blocked |
| SEC-062 | Blind spots/log injection/sensitive logs | Provider/callback/operation/event/admission; wrong origin/replay, unknown effects, races/outage and two-instance bounds; identity/QA + operations | No new effects/events; positive actual campaign blocked |
| SEC-063 | Resource/quota exhaustion (CWE-400) | Provider/callback/operation/event/admission; wrong origin/replay, unknown effects, races/outage and two-instance bounds; identity/QA + operations | No new effects/events; positive actual campaign blocked |
| SEC-064 | Fail-open exception or unsafe recovery | Provider/callback/operation/event/admission; wrong origin/replay, unknown effects, races/outage and two-instance bounds; identity/QA + operations | No new effects/events; positive actual campaign blocked |

ASVS 5.0.0 L2 exact requirement mapping and named human security acceptance: PENDING, security owner. Do not inherit Feature 007 historical v4.0.3 identifiers. Primary authority to verify: https://owasp.org/www-project-application-security-verification-standard/ . No conformance claim.

Release checklist reviewed: merge/deployment gates unpassed; unavailable scans/reviewers remain gaps. Allowed execution is public documentation inspection plus offline synthetic imports/browser fixtures, no live auth/DB/OAuth/mail, SQL, deployment or provisioning. G5 mapping absent. Human Arabic/assistive/usability and managed/deployed identities unavailable. No exception approved. T032 will append fresh version/advisory observations.

## Fresh version/advisory review — T032

`npm audit --json` initially failed with EAI_AGAIN inside the sandbox (not clean). Approved retry completed, exit 1 for findings: **27 affected package entries: 8 low, 19 moderate, 0 high, 0 critical**. [Raw current report](execution-audit.json); same counts as historical planning report, now independently rerun. Lock/package unchanged. This does not cover every bundled/native/managed/deployed component.

Primary public sources inspected 2026-11-03:

- [Better Auth OAuth-state advisory](https://github.com/better-auth/better-auth/security/advisories/GHSA-965c-763c-88jm): affected >=1.4.0-beta.18,<1.7.7; installed 1.7.14 outside that range. Hosted configuration/version unknown.
- [Better Auth pre-challenge cookie-cache advisory](https://github.com/better-auth/better-auth/security/advisories/GHSA-xg6x-h9c9-2m83): affected >=1.4.0-beta.15,<1.4.6; installed 1.7.14 outside range. Actual provider/cache MFA acceptance still absent.
- [Maintainer changelog](https://better-auth.com/changelog): 1.7.15, 1 November 2026, follows installed 1.7.14 and includes secret-bearing diagnostics, primary-key update, banned-session and token-exchange redirect fixes. Assess reachability/upgrade with identity/security owners; no exploitable hosted defect or compatible upgrade is inferred here.
- [Glob maintainer advisory](https://github.com/isaacs/node-glob/security/advisories/GHSA-3g3m-2fjr-6pw4): abort may leave filesystem traversal running; affected >=9.0.0,<=14.0.1. Build/runtime cost depends on reachable glob input/tree; no tooling-only dismissal.
- [Minimatch maintainer advisory](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249): pattern expansion resource exhaustion; audit range <11.0.1. Upgrade compatibility and actual untrusted-pattern paths need review.
- [Deepmerge upstream report](https://github.com/TehShrike/deepmerge/issues/273): prototype poisoning in object merge; audit affected >=4.2.0,<=4.3.1, no fixed version reported. Review untrusted configuration/object paths, including auth UI.
- [Next.js RSC advisory](https://nextjs.org/blog/security-update-2025-12-11) sampled only; current Next 16.4.3/React 19.3.0 are recorded, not certified by a historical advisory or absence from npm results. Exhaustive framework-bundled RSC/native and deployed image inventory remains an engineering/security-owned gap.

All current npm entries (resolved lock paths/versions below; propagated entries share the three underlying reports). Owners: engineering/security for patch and reachability review; identity owner for managed SDK/UI, web tooling owner for CLI/ESLint/email dependencies. No package install/upgrade or forced fix occurred.

| Package | Severity | Lock resolutions | Dependency evidence |
| --- | --- | --- | --- |
| @daveyplate/better-auth-ui | low | 3.4.0 | @react-email/components |
| @eslint/config-array | moderate | 0.21.2 | minimatch |
| @eslint/eslintrc | moderate | 3.3.7 | minimatch |
| @neondatabase/auth | low | 0.7.0-beta | @neondatabase/auth-ui |
| @neondatabase/auth-ui | low | 0.4.0-beta | @daveyplate/better-auth-ui |
| @react-email/components | low | 1.0.12 | @react-email/render |
| @react-email/render | low | 2.0.6, 2.2.0 | html-to-text |
| @shadcn/registry | low | 0.2.1 | deepmerge |
| @ts-morph/common | moderate | 0.27.0 | minimatch |
| @typescript-eslint/eslint-plugin | moderate | 8.72.1 | @typescript-eslint/type-utils; @typescript-eslint/utils |
| @typescript-eslint/parser | moderate | 8.72.1 | @typescript-eslint/typescript-estree |
| @typescript-eslint/type-utils | moderate | 8.72.1 | @typescript-eslint/typescript-estree; @typescript-eslint/utils |
| @typescript-eslint/typescript-estree | moderate | 8.72.1 | minimatch |
| @typescript-eslint/utils | moderate | 8.72.1 | @typescript-eslint/typescript-estree |
| deepmerge | low | 4.3.1 | deepmerge mergeObject() allows prototype poisoning of returned objects |
| eslint | moderate | 9.39.5 | @eslint/config-array; @eslint/eslintrc; minimatch |
| eslint-config-next | moderate | 16.4.3 | eslint-plugin-import; eslint-plugin-jsx-a11y; eslint-plugin-react; typescript-eslint |
| eslint-plugin-import | moderate | 2.32.0 | minimatch |
| eslint-plugin-jsx-a11y | moderate | 6.10.2 | minimatch |
| eslint-plugin-react | moderate | 7.37.5 | minimatch |
| glob | moderate | 13.0.6 | Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal; minimatch |
| html-to-text | low | 10.0.1, 9.0.5 | deepmerge |
| minimatch | moderate | 10.2.6, 3.1.5 | minimatch has potential denial of service via globparts amplification |
| react-email | moderate | 6.11.6 | glob |
| shadcn | moderate | 4.23.0 | @shadcn/registry; deepmerge; ts-morph |
| ts-morph | moderate | 26.0.0 | @ts-morph/common |
| typescript-eslint | moderate | 8.72.1 | @typescript-eslint/eslint-plugin; @typescript-eslint/parser; @typescript-eslint/typescript-estree; @typescript-eslint/utils |

No new dependency exposure added by static page text. Runtime auth UI/bundling and build/email processing still require reachability review; affected package entries are not 27 independent CVEs. Managed/deployed versions, ingress/roles/data/restore/rotation, exact ASVS L2 mapping, named Arabic/assistive/security review remain UNKNOWN/PENDING. No release exception or security-clean result. T032 completes a truthful review record with owned gaps, not G6 or release approval.
