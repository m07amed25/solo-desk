# Quickstart Validation: Workspace Platform and Authorization

This is the implementation validation guide, not a record that future commands passed. Proposed workspace scripts/migrations below must first be implemented through [tasks.md](tasks.md). See [contracts](contracts/workspaces.md), [data model](data-model.md) and [auth gates](contracts/auth-and-release.md) for exact behavior.

## Prerequisites and safe target

1. Read AGENTS.md, constitution and this package. Record source/diff identity, lock hash, actual Node/PostgreSQL versions, installed SDK and approved policy versions; load relevant installed Next.js guides before code changes.
2. Obtain an independently authorized synthetic-only isolated database/Auth branch with matching app URL, signed challenge sink and sender mailbox; record redacted actual branch IDs/endpoints and fixture namespace in a local ignored test manifest. A copied production branch is not automatically synthetic. Never change a production account's verification or use branch-name labels as proof.
3. Use separate restricted runtime, sender and direct migration credentials. Keep values in secret storage/environment, never in the test manifest/evidence. Provision invitation encryption/HMAC keys separately; unavailable key/step-up/mail capability keeps the affected operation disabled.
4. Confirm applied migration history and local filenames before selecting the next unused migration; `002-workspace-platform.sql` is only a proposed name. Review schema diff, privileges and compatible recovery before applying. Applying a remote migration is a separately authorized action; there is no production command in this guide.
5. Build/start the matching artifact with the isolated configuration. Existing auth Action harnesses depend on the generated build manifest, so do not mix production builds with a different dev server. Keep default-off capability values until isolated scenarios explicitly exercise them.

## Local checks available now

```bash
npm test
node scripts/check-translations.mjs
node scripts/test-auth-flows.mjs --self-check
```

Expected: real-code local tests and offline guards pass, with no hosted-pass claims. Planning baseline results are in evidence.md. These commands do not verify real tenant constraints or inbox placement.

## Implementation checks (Named npm scripts & prerequisites)

```bash
# Unit suite covering C01/C02/C03/C04/C05/C06 contracts (all offline, no network required):
npm run test:workspaces

# Complete release validation suite (lint + typecheck + translations + unit + email + build):
npm run test:full

# Isolated PostgreSQL integration suite (requires synthetic target manifest):
SOLODESK_TEST_ENV=isolated npm run test:workspaces:postgres -- --manifest /absolute/path/to/isolated-test-manifest.json

# Operational outbox invitation dispatch worker:
SOLODESK_TEST_ENV=isolated npm run dispatch:invitations -- --manifest /absolute/path/to/isolated-test-manifest.json

# Multi-locale & accessibility browser journeys:
SOLODESK_TEST_ENV=isolated npm run test:workspaces:browser -- --manifest /absolute/path/to/isolated-test-manifest.json

# Advisory security review:
npm audit --json
```

### Exact Prerequisites & Environmental Bounds
- **Target Manifest**: An isolated synthetic manifest file containing `env: "isolated"`, `branchId`, `databaseUrl`, and `syntheticAccountPrefix`. Omitting or pointing to production immediately halts with exit code 2 (`BLOCKED`).
- **Database Roles**: Three distinct roles per `migrations/002-workspace-platform.md`:
  - `solodesk_migration`: DDL, schema alteration, RLS management.
  - `solodesk_runtime`: DML only on application tables (`SELECT`, `INSERT`, `UPDATE`), zero DDL or auth bypass.
  - `solodesk_sender`: Restricted read-only projection on committed outbox records and rate buckets.
- **Key Custody & Encryption**:
  - `SOLODESK_INVITATION_ENCRYPTION_KEY`: 256-bit (32-byte hex) key for AES-256-GCM outbox payload encryption.
  - `SOLODESK_RATE_LIMIT_HMAC_KEY`: 256-bit HMAC key for blind rate bucket indexing.
  - Omitting these keys keeps the invitation subsystem safely disabled.
- **Managed Auth Step-Up**:
  - Fresh reauthentication required for Owner transfers. If managed auth does not support step-up session tags, transitions remain gracefully disabled with `CAPABILITY_DISABLED`.

## Fixture and proof matrix

Use Owner A, Member B, Admin D in workspace Alpha, and Owner C in workspace Beta. Add second Alpha Owner E for races. Use real verified synthetic accounts only; keep an unverified, banned, revoked and expired control. Every denial needs a same-tenant positive control and a database no-effect assertion. Cleanup deletes only run-owned synthetic fixtures on the verified isolated branch; never blanket-delete managed users.

| Scenario              | Procedure                                                                                                                                                                       | Required observation                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1 identity          | Run disabled direct aliases + approved provider/session controls; actual verify/resend/reset; both old sessions; true social-only fixture                                       | Canonical G1–G6 evidence separated by type; no code/no sink is BLOCKED, no unverified/banned/revoked profile/action/live renewal                                                |
| US2 create/atomicity  | Create Alpha, capture row/history counts, race identical operation 100 times; change payload under same ID; fault after each write; lose response                               | One effect/receipt/audit/outbox, stable result; changed intent conflicts; failures leave no partial accepted state; profile untouched                                           |
| US3 isolation/context | Alternate Alpha/Beta on reused pool connections, including rollback; forge IDs/cursors/receipts; switch in two tabs then submit stale Alpha action; revoke membership           | No foreign fields/counts/effects, context mismatch instead of retarget, stale view/subscription cleared, no state retained on pooled connection                                 |
| US4 invites           | Accept exact intended recipient, wrong verified account, at/after real expiry, tampered/consumed/revoked/superseded tokens; concurrent accept/revoke/resend and existing member | At most one membership effect; no role elevation or foreign metadata; no GET effect; signed-out redirect clears proof before sign-in; historical token remains invalid                                                           |
| US4 delivery          | Delay worker until revoked/expired, wrong key/tag, two workers, lease expiry and SMTP accept-then-timeout                                                                       | No unauthorized send before commit; deterministic duplicate handling; unknown outcome retained for reconciliation, no false inbox claim; token absent from logs/ordinary tables |
| US5 owners            | Barrier-start two-client removals/demotions/transfer and promotion at least 100 times; bypass UI as Member/Admin; test stale step-up                                            | At least one active Owner and coherent owner_id after every commit; no unauthorized promotion; unsupported step-up leaves transfer off                                          |
| Operations            | Exercise restricted roles, invalid direct SQL cross-tenant FKs, old profile client, disabled writers, restore to separate target                                                | Runtime cannot DDL/read credentials; accepted rows/history retained; no restored revoked authority or historical outbox mail                                                    |
| UX/performance        | Both locales/themes, 320px, 200% zoom, keyboard/focus/screen reader/fluent Arabic; 100-workspace warm fixture with 20 concurrent clients                                        | Complete action parity and honest states; no prior-team projection after switch; measured p95≤2s budget or explicit failed finding                                              |

Real expiry tests use dedicated short-lived synthetic fixture setup in the isolated database or wait for actual boundary while preserving production 72-hour policy; monkey-patching the JS clock alone cannot prove PostgreSQL expiry. Concurrent tests use separate checked-out clients with synchronization barriers and inspect final committed state, not just expected HTTP errors. Observe actual network/HTML/RSC responses for leakage and CSP/cache behavior.

## Evidence and stop conditions

For every command save redacted raw output/artifacts plus source/lock/build/environment identity, fixture/policy versions, named owner, actual result, exclusions and next action in evidence.md. Mark unit/mock, real DB, hosted auth, mailbox, browser/human and production separately. Stop activation for tenant/auth bypass, leaked secrets, duplicate effects, last-Owner loss, unsupported recovery/step-up, missing restricted-role proof, unknown managed policy or failed migration recovery. An audit warning or unavailable feed remains an owned finding; never replace it with historical clean counts.

The planning quality checklist may pass while all deployment gates remain open. After required gates pass, activation/merge/deployment still follow their separate authorization. Do not send invitations to real people as a test.
