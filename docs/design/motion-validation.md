# Landing motion verification

Checked 30 October 2026 by Codex on the local development site. This is focused UI evidence, not release approval.

The public landing page owns one client animation boundary; its content remains server rendered.
GSAP 3.15.0 supplies ScrollTrigger and SplitText without another React wrapper dependency.
The English heading enters by character; Arabic enters by whole words to preserve shaping.
SplitText keeps the complete accessible name, preserves authored newlines, and restores the
original heading after the entrance. GSAP matchMedia reverts animations when breakpoints or
motion preferences change and when the boundary unmounts. A ResizeObserver refreshes section
positions after layout changes, including tour tabs and FAQ disclosures.

## Evidence

- Production `npm run build`, `npx tsc --noEmit`, `npm run lint`, and the existing site/profile Node tests passed.
- Local Chromium assertions covered individual English characters, accessible headline text,
  original-markup restoration, scroll-driven hero perspective, section visibility, workflow
  cards clearing their action, FAQ disclosure, keyboard tour navigation, live reduced-motion
  changes, 390px/320px layouts, Arabic RTL/light theme, and readable content without JavaScript.
- Desktop, mobile, workflow and Arabic/light captures were inspected. The workflow overlap
  found during review was corrected by moving its action with its content and keeping the
  step entrance within its allocated space. No browser runtime errors were observed.
- The temporary browser self-check is `/tmp/solodesk-inspect.cjs`; captures are
  `/tmp/solodesk-motion-*.png`. These are local evidence, not portable project test tooling.
- Impeccable's active design hook reported no deterministic issues in the animation boundary
  and landing page. This does not establish subjective quality or accessibility conformance.

## Security and dependency scope

Applicable controls: SEC-044 (server-only secrets), SEC-049/050 (runtime/tooling advisories),
SEC-051 (package provenance), SEC-054 (private development server). Owner for this inspection:
Codex; remaining advisory/release decisions belong to the repository maintainer.

The motion boundary receives server-rendered children, imports only browser animation code,
and adds no API, persistence, credential, database or authorization behavior. GSAP is pinned
to 3.15.0 with npm registry resolution and integrity recorded in the lockfile; installation
used `--ignore-scripts`. Only that dependency was added.

Fresh `npm audit --json` completed with exit 1: nine low-severity package findings, zero
moderate/high/critical findings, and no GSAP finding. The reported chain originates in
deepmerge's [prototype-poisoning advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)
and reaches existing shadcn and auth/email dependencies. These remain open; automatic major
dependency changes were outside this motion task. Lockfile SHA-256:
`e423f38c76a01a97ab14c4265e0952967fd584c9b577dbe7ef363864d9d7be9b`.

Initial sandboxed package download and build attempts failed; the authorized network install,
advisory scan and production build then completed outside the sandbox. The project-required
next-dev-loop workflow could not run because agent-browser is absent; local Chromium checks
above are separate evidence, not a claim that its framework-introspection gate passed.
The inline browser could not reach localhost. No production deployment, deployed-artifact
scan, database/auth/provider integration tests, physical-device frame-rate measurements,
Firefox/Safari testing or fluent Arabic review was performed. The security release checklist
remains a separate gate.
