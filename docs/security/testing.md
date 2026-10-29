# Security verification and evidence

Updated 29 October 2026. Planned website verification, not executed application tests. Reuse [test strategy](../quality/test-strategy.md) and link every result to applicable [SEC controls](vulnerability-catalogue.md).

## Safe test scope

Use isolated owned development/staging services and synthetic data. Define exact target/environment, allowed methods, request/volume/time limits, test identities and cleanup before dynamic testing. Review production, third-party/provider or destructive scans separately; these documents do not authorize testing external systems. No exploit payload repository or production attack run is needed for the checklist.

Prepare Owner, Finance, Contributor, Viewer, revoked member and client guest, plus unauthenticated/expired sessions. Use at least two workspaces and two clients with distinct documents/files/private costs. Test permitted access first, then denied variants. Reuse actual application services rather than mocks for permission, persistence and transaction proof.

## Required scenarios

| Area                  | Meaningful verification                                                                                                                                      | Controls                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Identity              | Wrong/expired/replayed challenge, account/provider mismatch, reset/recovery/step-up, brute force and session revocation; observe cookies/redirects           | SEC-001–008             |
| Authorization         | Direct route/action/worker attempts for foreign IDs, protected fields, bulk/count/search/file/export and stale grants                                        | SEC-009–016             |
| Input/output          | Malformed/deep/oversized/duplicate data, unsafe markup/schemes, query/sort manipulation and constrained server fetching                                      | SEC-017–032             |
| Files/documents       | Type/size/hash mismatch, incomplete upload, expired link, archive escape, restricted renderer and safe CSV; compare output field scope                       | SEC-033–040             |
| Real PostgreSQL       | Scoped actual runtime roles, same-tenant constraints, missing transaction context, alternating tenants on pooled connections, concurrent writes and rollback | SEC-041–043/057–059     |
| Secrets/privacy       | Source/history/artifact/log/telemetry review, preview isolation, temporary support grants, browser storage and isolated restore                              | SEC-031/044–048/062/064 |
| Supply chain          | Exact lock/build inventory, fresh advisory results, reviewed component/registry generation, install scripts and CI privilege separation                      | SEC-049–056             |
| Finance/providers     | Duplicate concurrent issue/allocation/payment, changed intent with same key, replayed/mismapped callback and lost provider reply                             | SEC-057–061             |
| Failure/load/recovery | Bounded floods/slow providers, pool/queue limits, auth/DB/store outage, restore after later money events and stale sessions                                  | SEC-024/046/056/061–064 |

An in-memory SQL emulator cannot prove PostgreSQL row policies, real transaction races or Neon pool isolation. A browser screenshot cannot prove authorization, sanitization, CSRF or financial conservation. A successful npm audit covers only reported package advisories and cannot prove safe application logic or copied source.

## Scanner and review layers

Use fresh dependency/CVE checks plus source/secret/config review on every relevant change. Add selected SAST and secret scanning with real rules, coverage and triage; inspect generated/vendored code and CI definitions. Use authenticated dynamic testing against owned staging with multiple roles and bounded traffic. Parser/file and financial state testing may need property/fuzz tests within declared resource limits. Before public release, threat-driven manual testing fills scanner gaps.

Do not install a broad scanner suite solely to create green badges. Missing tools/credentials/feeds, unsupported file types and unreachable auth-protected routes are named coverage gaps. Document exact rule/feed versions and exclusions; do not silence defects with broad ignore lists.

## Evidence format

Each SEC result records feature/requirement, test identity/role/workspace, source/build/lock hash, environment and actual DB/browser/runtime versions, command/steps, synthetic fixtures, expected versus observed behavior, exit/result, redacted artifact and limitation. Capture positive and denied/no-effect assertions, not only status codes. Concurrency tests prove one committed effect and no leaked/partial records.

Use `passed`, `failed`, `not run`, `unavailable` or `not applicable with rationale`. Every unimplemented control stays pending. Keep exploit details, identifiers, tokens and sensitive reports in restricted storage; public docs contain a redacted summary and safe evidence reference. Re-run affected checks after code/config/dependency changes and verify the deployment artifact. See [findings](findings.md) and [release gates](release-checklist.md).

Documentation validation is separate:

```bash
python3 docs/design/validate.py
```

This checks local Markdown links, planning coverage and design artifacts; it is not a security scanner or proof the controls are implemented.
