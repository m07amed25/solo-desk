# Email delivery

Updated 30 October 2026. Nodemailer sends through Gmail SMTP; React Email renders the branded HTML and its plain-text alternative. Templates use SoloDesk's monochrome palette, a 560px table layout, inline styles, dark-mode overrides and system sans-serif fallbacks when Geist is unavailable. They do not load remote assets, scripts or tracking pixels.

## Local configuration and previews

Keep these server-only values in ignored `.env.local` or the deployment secret store:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-account@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM=your-account@gmail.com
SOLODESK_CONTACT_ENABLED=true
SOLODESK_CONTACT_RECIPIENT_EMAIL=your-inbox@example.com
SOLODESK_AUTH_EMAIL_ENABLED=false
```

Use an app password with spaces removed, and an approved sender address matching the Gmail account. Replace any app password shared in chat. `BETTER_AUTH_SECRET` (at least 32 characters) also signs contact-form timestamp tokens. No SMTP setting belongs in `NEXT_PUBLIC_*`. Restart the application after changing credentials; the transport is reused per process.

- `npm run email:dev` opens the React Email preview server on port 3001.
- `npm run email:export` writes sample HTML to `.next/email-preview`.
- `npm run test:email` runs isolated checks without Gmail or a database connection.

The official preview UI is development-only; generated previews contain synthetic fixtures. Do not put production email bodies, codes or reset links in preview files. The templates support full bilingual English and Arabic delivery for account verification (`email-verification`) and password recovery (`forget-password`), rendering exact 6-digit codes in dedicated high-contrast LTR panels while maintaining proper text direction for surrounding copy. Real email-client rendering matrix across diverse client engines remains future release verification.

## Contact messages and client copies

`GET /api/contact` issues a fresh, uncached signed timestamp. The form obtains it on mount. `POST /api/contact` validates origin, a bounded 16 KiB body, schema, consent, honeypot, timestamp and rate limit before sending:

1. The full inquiry goes to `SOLODESK_CONTACT_RECIPIENT_EMAIL`, with the client's email as Reply-To.
2. The client receives a branded confirmation containing the same inquiry, with the configured inbox as Reply-To.

The SMTP From identity always comes from server configuration. The browser cannot select the internal recipient or override headers. React escapes visitor text; user-provided links, attachments and raw HTML are never rendered as email markup. The API reports success only after SMTP accepts both emails. SMTP acceptance does not prove inbox delivery.

There is no automatic application retry. If the internal notification succeeds but the client copy fails, the API returns 503 and the inquiry remains in the operator's mailbox. A manual resubmission can duplicate the internal notification; check existing messages before responding twice. A timeout after SMTP acceptance can also leave delivery uncertain. Reconcile the sender mailbox before retrying. Before public exposure, provide a shared rate limit and trusted-proxy IP configuration: the current contact limit is per process, not global. Client copies consume Gmail quota and can be abused to send messages to unverified addresses; perimeter abuse controls and delivery monitoring are release requirements.

## Managed Neon Auth

Managed Auth does not execute this application's Better Auth email callbacks. Custom OTP, verification-link and reset-link emails use Neon's signed `send.otp` and `send.magic_link` webhooks instead. See [Neon email customization](https://neon.com/docs/auth/guides/customize-emails) and [signature and retry contract](https://neon.com/docs/auth/guides/webhooks).

All application-delivered auth emails use SoloDesk in the subject, English/Arabic headings and sender display name. Provider `context.project_name` never supplies customer-facing branding. In managed Auth settings, set Application Name to `SoloDesk`; this updates the default header, but does not remove all shared Neon branding. Fully SoloDesk-branded subjects and content require the custom delivery path below. Editing local templates alone does not change managed Auth's default emails, and a disabled `SOLODESK_AUTH_EMAIL_ENABLED` leaves this handler unavailable.

The handler at `/api/webhooks/neon-auth` is disabled by default. Before enabling it:

1. Test `migrations/001-email-deliveries.sql` on an isolated database branch, then apply the reviewed migration using the direct migration connection. Grant only SELECT, INSERT and UPDATE on that table to the restricted server runtime role.
2. Deploy the app with the SMTP secrets, its branch-specific `NEON_AUTH_BASE_URL`, and `SOLODESK_AUTH_EMAIL_ENABLED=true`.
3. In Neon Auth → Configuration → Webhooks, register the final public HTTPS URL ending in `/api/webhooks/neon-auth`, enable only `send.otp` and `send.magic_link`, and set a 10-second timeout. Neon's subscriptions replace default delivery, so verify the deployed handler and mailbox delivery before switching real users.

The handler verifies the raw-body Ed25519 signature against the configured branch's JWKS, checks the signed timestamp within five minutes in either direction, validates email/purpose/expiry and restricts link URLs to the managed Auth origin. It rejects SMS events. Payloads, codes, links and SMTP errors are never logged. The receipt table stores only event ID, body hash and delivery timestamps. A successful duplicate returns success without sending again; an altered payload for the same ID is refused.

A claimed receipt without `sent_at` is deliberately not resent: a crash or timeout may have occurred after Gmail accepted it. Reconcile using the deterministic Message-ID `<event-id@solodesk.email>` in the sender mailbox. Mark the receipt sent only after confirming acceptance; delete a claim for retry only after establishing that no message was accepted and that the auth challenge is still valid. Ask the user to request a fresh code/link when uncertain. Retain receipt metadata for the approved operational window, then prune old sent receipts; never automatically delete unresolved claims. Measure cold-start/JWKS/database/SMTP latency against Neon's 15-second total retry budget before enabling this path.

No remote webhook subscription, database migration, deployment or change to managed auth policy was performed by this local setup.

## Security evidence and release gaps

Owner: this implementation; operational sign-off remains required. The new boundaries are public visitor → mailer → fixed operator inbox/client mailbox, and signed managed Auth webhook → receipt store → user mailbox. Relevant controls: SEC-003 (auth challenge delivery), SEC-023/024/027/029/030/032 (bounded validation, origin, abuse, redaction and server-only secrets), SEC-049/051 (dependency review), SEC-060/061 (signed events and duplicate/uncertain delivery), SEC-063/064 (provider limits and truthful failure).

`npm run test:email` covers HTML escaping, plain text, token forgery/expiry, fixed recipients and both copies, Reply-To, provider failure without false success, malformed/oversized/foreign-origin requests, signature tampering, stale/future timestamps, unsafe links, expired/SMS events and durable receipt behavior with a simulated store. SQL migration/concurrency must also be verified against real isolated PostgreSQL before auth enablement.

Gmail SMTP connection and authentication were verified without sending an email. This does not establish inbox placement, client rendering, production latency or real delivery. Build/lint/test results are reported with the change. The fresh npm audit initially returned 9 low package entries (deepmerge paths through existing SDK/UI tooling); no moderate/high/critical entries. The first sandbox audit and SMTP check were unavailable due to DNS; network-enabled retries succeeded. Refresh the audit after dependency changes; an unavailable scan is never a clean result. The full [security release gate](../security/release-checklist.md) remains open for production ingress, shared anti-abuse controls, real database verification, live delivery and managed Auth activation.
