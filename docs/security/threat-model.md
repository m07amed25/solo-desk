# Website threat model

Updated 29 October 2026. Target design; review alongside [architecture](../architecture/overview.md), [policy](../architecture/security-and-privacy.md) and the [control catalogue](vulnerability-catalogue.md). Reassess before exposing a new trust boundary.

## Assets and actors

Protect client/contact information, internal notes, private rates, contract evidence, attachments, time sources, invoices/payments/credits, numbering and allocations. Protect Better Auth credentials/sessions/recovery material, Neon access, provider keys, build/deployment credentials, audit history and backups. Availability and accurate financial state are security assets too.

Model unauthenticated visitors, malicious or compromised members, scoped client guests, removed members with stale tabs/downloads, compromised provider callbacks, malicious packages/registries and privileged support/operator accounts. A legitimate user can submit hostile inputs; a valid session does not imply broad permission. TLS does not make a sender trusted.

## Trust boundaries and required decisions

| Boundary                                         | Required control and review question                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Browser → Next.js route/action                   | Server-derived identity, bounded schema and current grants; can the operation be invoked directly without the visible page?           |
| Server Component → Client Component/RSC response | Minimum allowed projection; can HTML, props, prefetch, errors or serialization leak private fields?                                   |
| Cache/CDN → another request                      | Identity/workspace/effective-scope isolation; can a public cache serve another user's protected response?                             |
| Better Auth → business services                  | Session validation plus independent resource policy; how quickly do revocation and factor changes take effect?                        |
| Service → Neon pool                              | Least privilege, parameterized scoped queries, same-tenant relationships and transaction boundaries; can prior request context bleed? |
| Browser → IndexedDB/service worker               | Eligible draft classes, key custody, expiry, eviction and account isolation; is a durable/protected claim actually supported?         |
| Upload/import → storage/parser/PDF               | Bounded inert input, scanning/quarantine, safe rendering and private object authorization; can a parser fetch or execute anything?    |
| Provider/webhook → domain command                | Authenticated provider identity, stable event IDs, exact tenant/amount mapping and replay protection                                  |
| Transaction → worker/external effect             | Durable outbox, current grants, deduplication and unknown-outcome reconciliation; can a retry send or charge twice?                   |
| CI/developer → registry/deployment               | Reviewed source/lock changes, limited tokens and untrusted-code isolation; can PR code obtain production secrets?                     |
| Backup/support → operator                        | Explicit scoped access, restricted artifacts and restored-session invalidation; can recovery resurrect revoked authority?             |

## Abuse cases to prove false

- A guest changes a resource ID and reads another client's invoice, file, counts or private notes.
- A Contributor supplies a role/owner/cost field, invokes an action directly or replays a stale privileged request.
- A member's role is revoked while their editor, cached session or queued job remains active; stale authority still commits a financial effect.
- A crafted note, translation value, filename, CSV cell, URL or document executes script, queries, commands or internal network requests.
- A compromised dependency/build step exfiltrates secrets or changes distributed component behavior.
- Two concurrent tabs reserve the same time, issue two numbers or consume the same credit after a lost response.
- An expired invitation/reset token, mismatched OAuth account or unverified email links to another identity.
- An attacker consumes unbounded authentication/email/export/image/query/worker resources across multiple application instances.
- A database restore replays a send/payment or restores a revoked session; a missing blob quietly produces an incomplete backup.

## Change and review record

Each material change records feature/owner/date, assets and data classification, entry points, trust assumptions, applicable SEC IDs, abuse cases, mitigation, negative tests and residual risk. Review authorization, data flows and recovery before code for a new auth factor/plugin, public API, file type, external URL consumer, provider, offline data class or deployment boundary.

Document actions the product cannot guarantee: recalling downloaded data, remotely erasing offline copies, preventing all same-origin XSS access to unlocked drafts, or keeping code running in a closed browser tab. Restrict capture and make recovery limits explicit instead of claiming these guarantees.
