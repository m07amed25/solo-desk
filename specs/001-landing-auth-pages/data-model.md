# Data Model: Landing and Account Entry

**Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

No business schema or auth-schema migration is required. These are presentation values,
existing authority and transient UI states, not new database entities.

## PresentationPreference

| Field     | Allowed values            | Default / lifetime                               |
| --------- | ------------------------- | ------------------------------------------------ |
| locale    | `en`, `ar`                | `en`; one-year non-sensitive preference cookie   |
| theme     | `dark`, `light`, `system` | `dark`; same lifetime                            |
| direction | derived `ltr` or `rtl`    | `ar` alone maps to `rtl`; never client authority |

Persist only locale/theme as `solodesk-locale` and `solodesk-theme` cookies. Use Path=/,
SameSite=Lax, HttpOnly and Secure on HTTPS production; no Domain attribute.
Invalid/missing cookie values fall back independently. Six internal presentation variants
derive from the two enums. Preferences confer no session, workspace or resource grants.

The preference form also carries a non-persisted return path selected exactly from
`/`, `/sign-in`, `/sign-up`, `/app`. Reject duplicates, unexpected fields, invalid enum
values, external paths and submissions over 2 KiB before setting either cookie.

## LocalizedContent

Stable keys cover landing copy, navigation, account headings, provider actions, menu/preferences,
pending/error/retry text and existing profile messages touched by this journey.
Use next-intl ICU catalogs at messages/en.json and messages/ar.json, selected by validated
locale through i18n/request.ts. English and Arabic catalogs have the same key shape.
Typed AppConfig constrains locale and message keys; interpolation/plural parameters must match.
Use plain text/approved rich-text components, never translation HTML injection.
Provider names remain identifiable and mixed-direction identifiers are isolated.
No catalog is executable HTML; product previews contain only fixed synthetic facts and a
translated illustrative/planned label. No account record is read to generate a preview.

## AccountIdentity and ProfileEnvelope — existing authority

| Value            | Source and relationship                          | Handling                                                              |
| ---------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| userId           | fresh Better Auth identity                       | Must match the currently authorized profile                           |
| profile id/name  | existing `neon_auth.user` row                    | Parameterized scoped read; no broad user projection                   |
| session id       | fresh server session                             | Remains server-side query scope; not a new client input               |
| sessionExpiresAt | current session expiry, added to narrow envelope | ISO instant; used to conceal/revalidate UI at expiry                  |
| sealedQuery      | existing session-scoped Realtime capability      | Private transport only; never cookie/local storage/log/public preview |
| initialData      | existing scoped profile rows                     | Retained only within the authorized private view                      |

Keep `loadProfile(expectedUserId?)` as the shared service boundary. Its fresh upstream session
lookup precedes the query; the query requires matching user/session, non-banned user and
unexpired session. The no-store profile API retains its current 400/401/503 distinction and
returns the envelope only after current identity validation.

Session identity may create an account through existing provider policy. These pages do not
create a workspace, projects or invoices and do not define account linking.

## AuthenticationAttempt — memory and bounded callback marker

| Field     | Values                      | Lifetime                                                     |
| --------- | --------------------------- | ------------------------------------------------------------ |
| entry     | `sign-in`, `sign-up`        | One provider journey; optional bounded callback query marker |
| provider  | `google`, `github`          | Current attempt only                                         |
| state     | `idle`, `pending`, `failed` | Component memory; clear when page is discarded               |
| authError | absent or generic `1`       | Safe retry marker; provider technical fields are discarded   |

Transitions: idle → pending; pending → external provider; failure/cancellation → failed;
failed → pending on explicit retry; validated success → /app.
An immediate in-flight guard prevents overlapping starts, not just a later disabled-button render.
The SDK continues to own OAuth challenge/state/verifier values and session cookies.

## PrivateView — transient protection lifecycle

States: checking → authorized; checking/authorized → unavailable on transport failure;
any state → denied on 401, identity mismatch, empty authorized live rows or known expiry.
Only authorized renders protected fields. Unavailable shows a generic recovery view and retries;
denied clears account/draft/subscription state and opens Sign in.

On mount, pageshow/history restoration and return to foreground, check the existing no-store
profile API before revealing data. Conceal synchronously on pagehide so a restored page starts
concealed. Revalidate at known expiry and no more than 60 seconds apart while active; hide
pending an overdue authority check. Fresh requests always validate authority regardless of this
UI interval. A suspended browser cannot execute timers, so its next visibility event must check.

A failed save retains valid input for the same revalidated identity in memory; sign-out,
invalid identity or account switch clears it. Cancel timers/listeners/subscriptions on teardown.
Previously authorized downloads/browser copies cannot be recalled by this mechanism.
