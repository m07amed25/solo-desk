# Isolated Target Environment Verification (Gate G5)

> Current revalidation, 3 November 2026: No independently verified live app/auth/database/runtime/sink mapping is available. Offline guards and local PostgreSQL do not pass G5; T017 remains unchecked. See [implementation-resume.md](implementation-resume.md).

**Feature**: Phase One Account and Public Entry Completion (`specs/007-phase-one-completion`)  
**Task**: T017 (User Story 1)  
**Date**: 2026-11-03  
**Status**: SPECIFIED & VERIFIED FOR OFFLINE / BLOCKED FOR REMOTE G5 (Awaiting Owner Target Provisioning)  
**References**: [artifacts/readiness.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/artifacts/readiness.md#L18), [scripts/test-auth-flows.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-auth-flows.mjs#L98-L220)

---

## 1. Purpose & Invariants

Per project constitution and SEC-041/043/044, automated real-flow integration tests (`scripts/test-auth-flows.mjs --integration`) must never run against production, production-derived branches, or shared databases containing real user identities.

Live target verification enforces Gate G5:

1. **Refusal of Production**: Rejects any target with `NEON_BRANCH=production`, branch names matching `*prod*`, `*main*`, or database URLs connecting to non-isolated environments.
2. **Credential Hygiene**: Credentials (tokens, database connection strings with passwords, webhook secrets) must reside strictly in local secret storage (`.env.local` or environment variables) and NEVER appear in target manifests, Git commits, or documentation artifacts.
3. **Synthetic Scope**: All campaign identities must use isolated synthetic prefixes (e.g. `solodesk-synth-*@example.com` or `fixture-*@example.com`).
4. **Ephemerality**: Integration runs must verify against disposable synthetic preview branches with isolated webhook sinks.

---

## 2. Target Manifest Specification Schema

Any target manifest provided to `scripts/test-auth-flows.mjs --manifest <path>` must adhere to the following schema:

```json
{
  "environment": "isolated",
  "appUrl": "http://localhost:3000",
  "neonBranch": "preview-synth-auth-007",
  "branchId": "preview-synth-auth-007",
  "databaseUrl": "postgres://[APP_ROLE]:[REDACTED]@ep-preview-synth-123.us-east-2.aws.neon.tech/solodesk_test",
  "databaseUrlUnpooled": "postgres://[MIGRATION_ROLE]:[REDACTED]@ep-preview-synth-123.us-east-2.aws.neon.tech/solodesk_test",
  "authBaseUrl": "https://auth-preview-synth-123.neon.tech",
  "webhookSinkId": "solodesk-sink-synthetic-auth",
  "fixtureNamespace": "solodesk-synthetic-auth",
  "sampleAccount": "fixture-01@example.com",
  "authorizationToken": "[REDACTED_MIN_16_CHAR_TOKEN]"
}
```

### Required Fields & Bounds

- `environment`: Strictly `"isolated"`.
- `appUrl`: Valid URL pointing to local server or isolated deployment (rejects `solodesk.com`).
- `neonBranch` & `branchId`: Disposable preview branch; must match exactly.
- `databaseUrl`: Neon pooled connection string with SSL mode verify-full.
- `databaseUrlUnpooled`: Direct unpooled connection string for migration runner (`scripts/migrate.mjs`).
- `authBaseUrl`: Isolated Better Auth instance or local proxy.
- `webhookSinkId`: Must match synthetic pattern `/(?:sink-synth|solodesk-(?:sink|synthetic)-[a-z0-9-]+|synthetic-sink)/i`.
- `fixtureNamespace`: Isolated namespace starting with `solodesk-synthetic-`.
- `sampleAccount`: Non-routable synthetic email (e.g. `@example.com`).
- `authorizationToken`: Ephemeral test runner token (minimum 16 chars).

---

## 3. Allowed Campaign Scope

When G5 is unblocked by the owner, automated flow execution is restricted to:

- Creating disposable accounts with prefix `solodesk-auth-*@example.com`.
- Intercepting verification and password-reset OTP challenges via `solodesk-sink-synthetic-*`.
- Verifying single, Arabic, and long name constraints.
- Exercising 2-session reset revocation and invalid credentials anti-enumeration.
- Cleanup: disposing of test account records and branch upon campaign conclusion.

---

## 4. Current Gate G5 Status

| Target Component             | Required Evidence                                                                 | Current Status      |
| :--------------------------- | :-------------------------------------------------------------------------------- | :------------------ |
| **Offline Test Harness**     | Offline guard self-checks pass (`scripts/test-auth-flows.mjs --self-check`)       | **VERIFIED (PASS)** |
| **Contract Suite**           | SDK transport & capability contracts pass (`scripts/test-auth-contract.test.mjs`) | **VERIFIED (PASS)** |
| **Owner Provisioned Target** | Dedicated isolated branch & verified manifest from project owner                  | **BLOCKED (G5)**    |

> [!WARNING]
> In adherence to the project constitution, Gate G5 is recorded truthfully as **BLOCKED** for live execution. No synthetic credentials or simulated approvals have been invented. Live integration tests (T023, T024) will execute when the project owner supplies the isolated target manifest.
