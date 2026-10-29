# P00 — Product rules, scope and UX

Status: planned, documentation only; not implemented or verified. [Roadmap](../roadmap.md) owns sequence/release slices. [Decisions](../decisions.md) own unresolved gates.

## Entry prerequisites

Confirmed choices D-01–D-25 and the current Next.js starter baseline.

## Delivery checklist

- [ ] Record source-of-truth product scope, release slices, feature switches, exclusions and decision owners.
- [ ] Resolve foundation gates: browser draft expiry/protection, roles, key recovery, hosting profile and browser support. Jurisdiction/provider choices can remain gated for disabled capabilities.
- [ ] Approve navigation, bilingual glossary, RTL interaction rules, accessibility fixtures and critical task flows.
- [ ] Review threats, entities, money/time fixtures, online command authority, sync conflicts and backup/rejoin behavior.
- [ ] Define benchmark dataset, release evidence format, defect severity, operations ownership and market validation process.

## Deliverables

Requirements/specs, decision/risk/coverage registers, screen map, architecture and phase plan; no runtime edits.

## Acceptance and exit evidence

- [ ] Every confirmed answer appears consistently in product, roadmap, architecture and specs.
- [ ] Each capability has phase/owner, behavior, states/validation, access/offline policy and acceptance reference.
- [ ] Open decisions state what is blocked; no paid signup, legal claim or schedule is inferred.

Every feature uses shared shadcn/ui components/tokens, clear module/pattern ownership, bounded scalable queries/jobs, server-only Neon access, Better Auth sessions and current security checks. See [architecture](../../architecture/overview.md) and [patterns](../../architecture/design-patterns.md).

Every checkbox requires an implementation artifact/test result tied to exact build, browser/server environment, dataset and policy version. Documents alone do not check it. English/Arabic, access control, offline/online state and recovery apply to all included behavior.

## Complex decisions and risks

Team-specific permission policy and financial fixtures must be agreed before dependent implementation. Region/scale/budget stay unresolved until deployment.

## Specification links

- [requirements](../../product/requirements.md)
- [decisions](../decisions.md)
- [ux-and-localization](../../product/ux-and-localization.md)
