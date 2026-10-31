# Data Model: Enhanced Sign In and Sign Up

This feature reuses managed identity records and the existing email-delivery ledger. The names below describe contracts, not permission to modify provider-owned tables. No new application schema or auth-schema migration is proposed.

## Ownership and relationships

| Entity                      | Owner                                                   | Relevant fields/relationship                                                                                                      | Feature behavior                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account                     | Managed Better Auth                                     | Existing `id`, `name`, `email`, `emailVerified`, ban state; one account has supported credentials/provider accounts and sessions. | Signup contributes a display name; verified ownership is required for protected account access. Existing identities must not be overwritten/merged on collision. |
| Credential/provider account | Managed Better Auth                                     | Credential references account; password representation and social identifiers remain provider-owned.                              | App submits opaque passwords over the SDK protocol. It never reads hashes, creates a credential table or changes existing provider linkage.                      |
| Verification challenge      | Managed Better Auth                                     | Recipient/purpose, protected code evidence, expiry, attempt state and consumption/supersession.                                   | Six-digit string delivered through signed `send.otp`; verification and reset are separate purposes. Application stores no code or expiry record.                 |
| Session                     | Managed Better Auth + current application authorization | Account/session IDs, expiry and revocation; trusted user verification state.                                                      | Fresh `currentSession` plus live-profile session-row/banned/verified/expiry conditions; client state cannot mint authority.                                      |
| Email-delivery receipt      | Application `public.solodesk_email_deliveries`          | `event_id` UUID primary key, SHA-256 `payload_hash`, `created_at`, nullable `sent_at`.                                            | Exactly one claim per event; same completed payload is a no-op; changed payload or uncertain claim is refused/reconciled. Existing migration only.               |
| Form interaction            | Browser memory only                                     | Entry, step, operation state, first/last name, email, transient password/code, password visibility and safe error key.            | Clear secrets on step completion/navigation/reset. Never serialize into URLs, browser draft stores, logging or analytics.                                        |

Managed uniqueness, credential/challenge consumption and reset transactions remain owned by the provider. Evidence must show one account/effect under races; the application does not create an operation ledger around managed signup.

## Validation contracts

| Input                    | Rule                                                                                                                             | Trust boundary and fixtures                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First name               | Required after surrounding whitespace trim; permit single names, Arabic and internal punctuation/spacing.                        | Combined name below must meet the same rule in browser and trusted identity submission. Whitespace-only, mixed script and long input fixtures.                          |
| Last name                | Optional; same character treatment as first name.                                                                                | Empty last name produces no trailing separator. No schema field is added.                                                                                               |
| Display name             | Trim the two parts, join nonempty parts with one separating space, preserve internal text; final length 1–100 UTF-16 code units. | Align with existing `saveProfile`; test exact 100/101 boundaries and Arabic. Do not split/migrate old stored names.                                                     |
| Email                    | Required, at most 254 characters, surrounding whitespace removed, valid address per managed policy.                              | Preserve provider canonicalization; never invent Gmail dot/plus rules or rewrite local parts. Mixed case, whitespace, duplicate/social identity and malformed fixtures. |
| Password                 | Required opaque string; no trim/normalization/truncation; approved managed min/max displayed.                                    | G2 records exact bounds and G1 proves managed enforcement. Test whitespace-containing passwords, paste, exact boundaries and oversized requests.                        |
| Code                     | Exactly six ASCII digits as a string, with leading zeros preserved.                                                              | `inputMode=numeric`, `autoComplete=one-time-code`; validate same format at managed boundary and signed webhook parser. Never use numeric conversion.                    |
| Recovery credential      | Code and compliant new password submitted together for the same recipient.                                                       | No independent `checkVerificationOtp` authorization step, no recovery URL token and no reuse as signup verification.                                                    |
| Names/feedback rendering | Plain escaped text only.                                                                                                         | Hostile markup in names and raw provider errors cannot enter active HTML; map error codes to allowlisted localized copy.                                                |

Request body size and malformed/duplicate field behavior must be measured through the existing handler. Use existing bounded request parsing if targeted prevalidation is demonstrated necessary; do not assume the client validation is a trust boundary. No provider schema alteration is planned.

## Form state transitions

Entry is `sign-up` or `sign-in`. Each operation has `idle`, `pending` or `failed`; completion transitions to another step or navigates rather than leaving a stale successful form. One synchronous in-flight guard coordinates email and social submissions from the same entry surface. No context store or state-machine dependency is required.

| Current step           | Event                                              | Next step/effect                                                                                                                                                        |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-up details        | Valid signup accepted                              | Verification step with in-memory destination; clear password; announce check-email guidance. Response is not authenticated success.                                     |
| Sign-up details        | Duplicate/unknown delivery outcome                 | Safe non-enumerating continuation/retry guidance according to proven provider contract; never claim a new account exists.                                               |
| Verification           | Valid code accepted                                | Fetch fresh verified session; full document navigation to `/app` only on authority. If session is absent, return to password sign-in without inventing access.          |
| Verification           | Invalid/expired/exhausted challenge                | Remain with safe feedback and permitted resend/restart. No protected data.                                                                                              |
| Verification           | Resend succeeds                                    | Clear previous code; show server-authoritative cooldown where available. Provider supersedes old challenge; do not invent expiry metadata.                              |
| Verification           | Correct destination/restart                        | Return to details or sign-in as appropriate; no edit to an already registered account's email.                                                                          |
| Sign-in details        | Verified password login accepted                   | Fresh session confirmation followed by full document `/app` navigation.                                                                                                 |
| Sign-in details        | Valid password but unverified email                | Verification step for this destination; clear password.                                                                                                                 |
| Sign-in details        | Forgot password                                    | Recovery request step, preserving only non-secret email.                                                                                                                |
| Recovery request       | Request acknowledged                               | Recovery code + new-password step for both known and unknown email. Generic text; no disclosure that mail was sent to an existing account.                              |
| Recovery code/password | Valid reset accepted                               | Clear code/password, mask visibility, return to Sign in with safe completion text; all previous sessions must be invalidated by managed policy.                         |
| Any form step          | Recoverable failure                                | Keep valid non-secret input; clear rejected code where appropriate; unlock controls and allow an explicit bounded retry. Never automatically retry uncertain mutations. |
| Any step               | Reload, navigation or locale/theme document reload | Lose transient secrets; show supported fresh/resume journey. Do not restore private draft state.                                                                        |

A verification response without a fresh verified session does not satisfy the spec's seamless registration success. G1 must prove supported auto-sign-in after verification; the sign-in fallback is safe recovery, not a waiver of that acceptance criterion.

## Challenge lifecycle invariants

1. Challenge purpose and recipient binding cannot be changed by the client.
2. A valid code moves from active to consumed once; expired/exhausted/superseded challenges cannot regain authority.
3. A resend invalidates the previous code, including when resend and verify race. Cross-tab/concurrent account creation still produces one account.
4. Password reset replaces only the intended existing password credential, invalidates old passwords/sessions and never adds a credential to a social-only identity or creates an unknown identity. Installed upstream can add a missing credential during reset; proving managed prevention is an explicit G3 gate, not an assumed guarantee.
5. Verification grants no workspace membership or elevated resource access.
6. Provider atomicity and race behavior require real managed tests; application mocks cannot establish them.

## Delivery lifecycle and persistence

| Receipt state               | Meaning                                                                                   | Permitted handling                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Absent                      | No committed event claim.                                                                 | Validated signed event may atomically claim then send.                                             |
| Claimed, `sent_at` null     | Sending is pending or outcome uncertain, including a process crash after SMTP acceptance. | No automatic resend. Reconcile deterministic Message-ID before marking sent or releasing a claim.  |
| Sent                        | SMTP acceptance was recorded.                                                             | Same event ID/body hash succeeds without sending again. Inbox placement remains separate evidence. |
| Existing ID, different hash | Event payload changed or tampered.                                                        | Refuse; do not overwrite receipt or send another message.                                          |

Keep event IDs/hashes/timestamps only; no passwords, codes, email bodies, destinations or auth tokens are added to the ledger. Retain/prune receipts under the existing approved retention policy, never automatically discard unresolved claims. Test insert uniqueness, real transaction concurrency and least-privilege grants using the existing migration. No new queue or scheduled job is introduced.

## Compatibility and recovery

Existing `user.name`, profile reads/updates and Google/GitHub records retain their shape. Verified-email service predicates must be tested against both current providers and existing verified password users. Unverified legacy identities must complete supported verification rather than be silently marked verified.

Rollback must preserve accepted credentials, verification state and receipts. Returning to a social-only interface after accepting password-only accounts is unsafe unless a working password sign-in/recovery path remains available. No data deletion, backfill, managed-table migration or new index is required by this design.
