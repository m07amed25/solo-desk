# Website security checks

Updated 29 October 2026. Security is a primary SoloDesk requirement. This directory turns the [security/privacy policy](../architecture/security-and-privacy.md) into implementation checks for the Next.js website, shadcn/ui design system, Neon PostgreSQL, Better Auth and business workflows.

**No finite document can list every vulnerability or future CVE.** Use this catalogue for vulnerability classes, current advisory feeds for identified product flaws, and fresh tests for project-specific exposure. A CVE identifies a disclosed vulnerability; a CWE describes a weakness class. Business-logic defects, private disclosures and unknown vulnerabilities may have no CVE. “No scanner findings” never means “secure.”

## Directory map

| Document                                              | Purpose                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Threat model](threat-model.md)                       | Assets, actors, trust boundaries, abuse cases and review triggers                                 |
| [Vulnerability catalogue](vulnerability-catalogue.md) | 64 stable control IDs: failures to avoid, required prevention and verification                    |
| [Stack controls](stack-controls.md)                   | Next.js/React, shadcn/ui, Better Auth, Neon and browser-draft requirements                        |
| [CVE and dependency process](cve-and-dependencies.md) | Advisory sources, version matching, triage, remediation, cadence and verified historical examples |
| [Advisory watchlist](advisory-watchlist.md)           | Dated partial Next.js/Better Auth upstream discovery, with explicit applicability limits          |
| [Security testing](testing.md)                        | Test identities, negative cases, safe execution, scan limits and evidence                         |
| [Release checklist](release-checklist.md)             | Blocking gates, ownership, exceptions and sign-off record                                         |
| [Findings register](findings.md)                      | Current inspection/scan status and a reusable finding record                                      |
| [Incident response](incident-response.md)             | Containment, credential/session response, recovery and disclosure handling                        |

## How to use it

Select the relevant security, dependency, auth and verification skills from [agent skill routing](../development/agent-skills.md). Their installation does not execute scans or satisfy any SEC control; findings and release evidence still require actual checks.

1. Before implementing a feature, update its threat boundary and select applicable SEC controls. Assign an owner and concrete test to each. Pending/not implemented is not “not applicable.”
2. During implementation, reuse authorized application services, server-only scoped data access, explicit state transitions and shared accessible shadcn/ui components. Authentication or UI visibility alone never grants access.
3. For each dependency change/release, match the actual lockfile and deployed runtime against current advisories; review generated/copied components and build tooling too.
4. Run meaningful negative/concurrency/recovery checks and record source/build/environment, results and limitations. Keep findings open until a fix and relevant regression evidence exist.
5. Apply the release gates. Revisit this catalogue whenever architecture, integrations, browser storage, auth plugins or financial rules change.

The verification target is applicable OWASP ASVS 5.0.0 Level 2 requirements, with stronger controls for privileged and financial operations where the threat model requires them. This is a project target, not a conformance claim; record exact versioned ASVS requirements in feature evidence. The OWASP web/API Top 10 provide awareness coverage, not a complete test plan. See [standards and feeds](cve-and-dependencies.md).

## Current status

These are planned controls, not completed security work. The [findings register](findings.md) records the current dependency snapshot and unavailable npm audit. Documentation/link/token checks do not verify application security. No CI monitor, scanner service, penetration test or recurring automation is enabled by these documents. Keep operational ownership and monitoring cadence explicit before deployment.
