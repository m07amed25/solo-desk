# US1 current CLI diagnosis — T006/T008

2026-11-02, Codex; unchanged source/Node/lock per [initial identities](initial-identity.json). Exact bounded diagnostic is the code block in [research R1](../research.md). Synthetic invalid HTTPS configuration only; no database access/effect, no locale/theme/viewport/motion.

| Boundary | Args | Parent exit | Child error | Signal | Status | stdout/stderr |
| --- | --- | --- | --- | --- | --- | --- |
| Sandbox | --help | 0 | EPERM | null | 0 | empty / empty |
| Sandbox | ../unknown.sql | 0 | EPERM | null | 1 | empty / empty |
| Approved | --help | 0 | absent | null | 0 | expected complete usage including Apply all pending / empty |
| Approved | ../unknown.sql | 0 | absent | null | 1 | empty / Unknown or ambiguous migration; use its full filename or exact numeric prefix. |

The diagnostic parent prints observations; its exit 0 is not a test pass. Same-source approved probes establish an execution/capture restriction rather than a runner defect. Runner handles help before env/client construction and invalid selectors before env/database loading. Preserve migrate.mjs and package callers. The existing harness ignores child errors and omits timeout/redaction of some streams; harden those three probes without weakening status/output or migration safety assertions. No migration is applied to test help.

Current unchanged full baseline: sandbox exit 1 after six passing Node files and one failing migration file; email/build unexecuted. Approved same-source full suite exit 0, 36 Node tests, 6 email tests, production build/54 pages. Logs: [sandbox](us1-baseline.log), [approved](us1-baseline-approved.log). These are local contracts/build evidence, not live/mounted acceptance.
