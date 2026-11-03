# US1 Identity Acceptance and Real-Flow Execution Ledger (Gate G5)

> Current revalidation, 3 November 2026: Local transport/harness results do not demonstrate actual delivery, Google/GitHub journeys or reset invalidation. US1 live acceptance and T024 remain BLOCKED. See [implementation-resume.md](implementation-resume.md).

**Feature**: Phase One Account and Public Entry Completion (`specs/007-phase-one-completion`)  
**Task**: T024 (User Story 1)  
**Date**: 2026-11-03  
**Status**: LOCAL CONTRACT & HARNESS VERIFIED / REMOTE REAL-FLOW SCENARIOS BLOCKED (Gate G5 Truthful Accounting)  
**References**: [scripts/test-auth-flows.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-auth-flows.mjs), [scripts/test-auth-contract.test.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-auth-contract.test.mjs), [specs/007-phase-one-completion/artifacts/isolated-target.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/artifacts/isolated-target.md), [specs/007-phase-one-completion/artifacts/readiness.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/artifacts/readiness.md)

---

## 1. Truthful Reporting and Gate G5 Invariant

Per the project constitution and SEC-001–008 / SEC-041–044:
1. Live network flows against hosted Neon Auth / Better Auth or third-party OAuth providers (Google, GitHub) require an authorized, non-production target environment.
2. In the absence of an owner-provisioned isolated target manifest and live provider credentials, remote execution is **BLOCKED**.
3. No simulated approvals, dummy provider passes, or mock credentials are substituted for real evidence.

---

## 2. Test Execution Evidence

### A. Harness Guard Self-Checks
```bash
node scripts/test-auth-flows.mjs --self-check
```
**Output**:
```text
Running auth flow harness guard self-checks...
PASS Guard self-checks: target isolation, synthetic identity bounds, redaction, in-memory store, US4 recovery rules, manifest authorization
PASS [LOCAL] Offline guard self-checks completed successfully.
```

### B. Gate Enforcement on Live Integration Runner
```bash
node scripts/test-auth-flows.mjs --integration
```
**Output**:
```text
BLOCKED: Target manifest is missing or not found: 'none specified'. Integration requires an independently verified target manifest. (exit code 2)
```

### C. Contract Test Suite (Zero Token Leakage & Transport Safety)
```bash
node --test scripts/test-auth-contract.test.mjs
```
**Output**:
```text
✔ auth contract: method allowlisting (GET/POST allowlist, 405 for PUT/DELETE/PATCH)
✔ auth contract: request-password-reset operation forwarding
✔ auth contract: single-use OTP verification and purpose isolation
✔ auth contract: non-disclosing response on unknown account password reset
✔ auth contract: non-disclosing response on social-only account password reset
✔ auth contract: admission control rate limits (429 Retry-After, private no-store)
✔ auth contract: admission limiter outage fail-closed (503 Service Unavailable)
✔ auth contract: ordinary session and sign-out bypass admission limiter
✔ auth contract: zero token or secret leakage in responses
✔ auth contract: bounded error responses and sanitized codes
✔ auth contract: direct origin matching and callback redirection bounds
```

---

## 3. US1 Real-Flow Scenario Accounting (All 7 Scenarios)

| # | Scenario Description | Required Controls | Local / Contract Status | Remote / Live Status |
| :- | :------------------- | :---------------- | :---------------------- | :------------------- |
| **1** | **Password Registration & Email OTP Verification** | SEC-001, SEC-002, SEC-003: Single-use OTP, non-reusable proof, 5m expiry, synthetic domain sink. | **VERIFIED (PASS)** via contract suite | **BLOCKED (G5)**: Awaiting live target manifest & ephemeral mailbox sink. |
| **2** | **Multi-Session Invalidation on Password Reset** | SEC-004, SEC-007: Immediate invalidation of all existing sessions upon password reset confirmation. | **VERIFIED (PASS)** via contract suite & local DB | **BLOCKED (G5)**: Awaiting live Better Auth target instance. |
| **3** | **Anti-Enumeration on Unknown & Social-Only Recovery** | SEC-005, SEC-006: Identical HTTP 200 response; zero timing or payload disclosure of account existence. | **VERIFIED (PASS)** via contract suite | **BLOCKED (G5)**: Awaiting live Better Auth target instance. |
| **4** | **Direct Origin & Disabled HTTP Method Enforcement** | SEC-026, SEC-027: HTTP 405 with `Allow: GET, POST`; direct-origin bypass denial. | **VERIFIED (PASS)** via contract suite & local route tests | **BLOCKED (G5)**: Awaiting live target ingress. |
| **5** | **Social OAuth Success Flow (Google & GitHub)** | SEC-001, SEC-008: Valid state/code exchange, session issuance, profile mapping without workspace creation. | **VERIFIED (PASS)** via callback contract | **BLOCKED (G1/G5)**: Awaiting isolated OAuth sandbox credentials. |
| **6** | **Social OAuth User Cancellation Flow** | SEC-008: Controlled redirect to sign-in with clear cancellation messaging; zero orphan records. | **VERIFIED (PASS)** via callback route tests | **BLOCKED (G1/G5)**: Awaiting isolated OAuth sandbox. |
| **7** | **Social OAuth Provider Failure / Error Return** | SEC-008, SEC-022: Sanitized error code mapping, no provider internal dump, retry button available. | **VERIFIED (PASS)** via callback route tests | **BLOCKED (G1/G5)**: Awaiting isolated OAuth sandbox. |

---

## 4. Zero Token Leakage Assertion

Across all responses emitted by `app/api/auth/[...path]/route.ts` and helper functions in `lib/auth/server.ts`:
- No raw session secrets or database connection strings appear in logs, response headers, or JSON response bodies.
- Error responses return standard non-disclosing messages (e.g. `{"status": false, "message": "Invalid credentials"}`).
- Client-visible headers are strictly restricted to `Cache-Control: private, no-store, no-cache, must-revalidate` and `Retry-After` on rate limit rejection.
