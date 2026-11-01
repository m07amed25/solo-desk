# Workspace service, action and query contracts (v1)

Planned interfaces; no workspace endpoint exists at planning time. [Spec](../spec.md), [data model](../data-model.md) and [auth release contract](auth-and-release.md) are binding. Implement functions in server-only `lib/workspaces.ts`; thin mutations in `app/workspace-actions.ts`; minimal GETs in `app/api/workspaces/route.ts` and `app/api/workspaces/receipts/route.ts`. Do not build an unused generic CRUD API.

## Trusted context and role matrix

Every service obtains its own fresh identity from request context. A browser input may name workspace/target/operation/revision; it may never choose actor, effective role, authority, timestamps, audit or arbitrary granted fields. Selection cookie is not a claim of membership. Reads validate current account/session and membership; existing-workspace writes lock workspace then recheck authority/revisions. SQL relationships always carry workspace_id. No shared private cache or client DB access.

| Supported action                                               | Owner                                     | Admin | Member |
| -------------------------------------------------------------- | ----------------------------------------- | ----- | ------ |
| workspace.read / workspace.select                              | Yes                                       | Yes   | Yes    |
| workspace.settings.update (name/timezone/locale/currency only) | Yes                                       | Yes   | No     |
| workspace.members.read                                         | Yes                                       | Yes   | No     |
| workspace.invites.manage for Member                            | Yes                                       | Yes   | No     |
| workspace.invites.manage for Admin                             | Yes                                       | No    | No     |
| workspace.members.remove Member                                | Yes                                       | Yes   | No     |
| workspace.members.remove Admin/Owner                           | Yes, owner invariant + step-up for Owner  | No    | No     |
| workspace.members.role.change                                  | Yes, step-up for Owner promotion/demotion | No    | No     |
| workspace.ownership.transfer                                   | Yes, step-up                              | No    | No     |
| workspace.members.leave                                        | Yes, owner invariant                      | Yes   | Yes    |
| workspace.audit.read                                           | Yes                                       | No    | No     |

The table's conditions are part of the authorization check, not extra client grants. Materialize role grant rows only for these actions. No finance, export, client or project action is implicitly supported. Member identity/name/email lists are not exposed to Members; their context projection includes only their own membership and allowed workspace metadata. No standalone audit browser or arbitrary grant editor is added; audit-read service exists for authorized review.

## Command envelope and result

Server Action arguments are one validated v1 object: `operationId: UUID`, `commandVersion: 1`, `workspaceId: UUID` when known, `expectedRevision: decimal string` for target changes, `kind` and exact payload below. Reject unknown keys, duplicates in raw HTTP data, malformed identifiers, oversized/deep payloads and authority fields. Max input 16 KiB. See C01–C07 in the data model for exact bounds. No caller timestamp or float is authoritative.

Canonical intent includes kind/version/explicit target/expected revisions and all permitted effect-bearing inputs. Receipt key is `(authenticated actor,operationId)` across workspaces; digest mismatch returns OPERATION_CONFLICT. Stable operation ID is created once per user intent and reused after unknown responses, never regenerated on retry. New corrected intent after a conflict gets a new ID.

Accepted result: `{status:'accepted',operationId,workspaceId,targetId,revision,code,correlationId}`. Safe replay adds `replayed:true`; no secret token/full row is returned. A denied current member receives no old team receipt content. For the same actor's self-leave acceptance only `{status:'accepted',operationId,code}` may be returned after membership ends. Unknown commit: `{status:'unknown',operationId,code:'OUTCOME_UNKNOWN',correlationId}`; reconcile before retry. Rejected commands carry stable error codes and safe field issues; they create no accepted receipt/audit/outbox.

| Service / action           | Payload and preconditions                                                                                                            | Accepted effect / output                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| createWorkspace            | name, slug, timezone, locale, currency; verified identity, no client Owner                                                           | Workspace UUID + initial active Owner/grants, revision 1; selected only after commit                                                                                             |
| updateWorkspaceSettings    | workspaceId, expected workspace revision, name/timezone/locale/currency                                                              | Update allowed fields, revision+1; slug/owner/legal-readiness not mass assignable                                                                                                |
| issueWorkspaceInvitation   | workspaceId, expected workspace revision, recipientEmail, role admin/member; grant ceiling                                           | Pending invitation/generation and encrypted delivery queued; invite/workspace revisions updated; never return bearer proof                                                       |
| resendWorkspaceInvitation  | workspaceId, invitationId, expected invitation revision                                                                              | Same recipient/role, new generation/token/72h expiry; previous proof/work canceled; revision+1                                                                                   |
| revokeWorkspaceInvitation  | workspaceId, invitationId, expected invitation revision                                                                              | Pending invitation revoked and delivery canceled; repeated same operation safely replays                                                                                         |
| acceptWorkspaceInvitation  | token only plus envelope operation/version; no pre-existing selection/membership required                                            | Intended verified address only; lock discovered workspace, recheck inviter/role/token/expiry, consume and add/reactivate membership/grants; existing active membership unchanged |
| changeWorkspaceMemberRole  | workspaceId, membershipId, expected membership revision, role; Owner only; step-up for Owner transitions                             | Replace supported grants/revision and update designated owner if necessary; never last-Owner demotion                                                                            |
| removeWorkspaceMember      | workspaceId, membershipId, expected membership revision; authorized target role                                                      | Revoke membership, revision+1; final/designated Owner rules; cancel dependent deliveries and deny subsequent authority                                                           |
| leaveWorkspace             | workspaceId, own expected membership revision                                                                                        | Revoke own membership if another Owner remains; designated ownership must first transfer                                                                                         |
| transferWorkspaceOwnership | workspaceId, targetMembershipId, expected workspace revision and both membership revisions; current designated Owner + fresh step-up | Promote target, replace owner_id, demote initiator to Admin and replace grants atomically                                                                                        |
| selectWorkspace            | workspaceId only; current membership                                                                                                 | Validate then set selection cookie; safe context; no receipt because no business-state change                                                                                    |

Every accepted team mutation includes receipt/digest, effect/revision, audit and outbox in the same checked-out-client transaction. Both membership removal and any command using its grants take the workspace lock. Reauthentication is provider-supported and server-bound to account/session/action with max age 5 minutes; caller booleans or client clocks cannot prove it. Unavailable support returns CAPABILITY_DISABLED and ownership transitions stay off.

## Read transport

- `GET /api/workspaces?limit=20&cursor=...`: actor's active memberships only, max 50; `{items:[{id,name,slug,role,revision}],nextCursor}`. Cursor binds current actor/filter/version; page size/cursor reject duplicates. Empty list is valid only after successful identity/database checks.
- `GET /api/workspaces?workspaceId=<uuid>`: current authorized selected-workspace context, not a global lookup. Returns `{workspace:{id,name,slug,timezone,locale,currency,revision},membership:{id,role,revision},capabilities:[supported allowed actions]}`. No member email list or grants for other users. Mixing list and context query fields is invalid.
- `GET /api/workspaces/receipts?operationId=<uuid>`: current actor's receipt status. Reauthorize workspace before returning safe result; foreign actor/unknown/inaccessible use indistinguishable RESOURCE_UNAVAILABLE. Own removal/leave may return only minimal actor acknowledgement. No token lookup via query string.
- Service-only `listWorkspaceMembers`, `listWorkspaceInvitations`, `readWorkspaceAudit`: require explicit workspace/grant; bounded pages and minimal allowlisted fields; administrative recipient projections never reach unprivileged UI. Pending invite status is derived against current server time.

All private responses, including errors, set `Cache-Control: private, no-store`; preserve framework RSC/Vary behavior. Use exact-origin mutation checks/framework Server Action protections and bounded bodies; no permissive CORS. The runtime/session selector never contains a role. Receipt reads are read-only; no acceptance on GET.

## Stable error semantics

| Code                                                     | UI behavior / HTTP when applicable                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| VALIDATION / SLUG_UNAVAILABLE                            | 400 / 409; localized field errors, retain safe input                                                      |
| AUTH_REQUIRED / SESSION_REVOKED                          | 401; clear protected views, sign in                                                                       |
| RESOURCE_UNAVAILABLE                                     | 404 for foreign/missing/inaccessible targets with the same shape; reveal no metadata/count/digest         |
| FORBIDDEN                                                | 403 only when current workspace visibility is already established; no protected fields                    |
| INVITATION_UNAVAILABLE                                   | Generic 400 for wrong account/missing/tampered/expired/revoked/consumed proof; no team or recipient hints |
| LAST_OWNER / REAUTH_REQUIRED                             | 409 / 403; explain authorized transfer/sign-in recovery                                                   |
| REVISION_CONFLICT / OPERATION_CONFLICT / CONTEXT_CHANGED | 409; return only currently permitted target revision, refresh/review; never retarget                      |
| RATE_LIMITED                                             | 429 + bounded Retry-After; preserve safe input                                                            |
| CAPABILITY_DISABLED / SERVICE_UNAVAILABLE                | 503; truthful unavailable/retry, no fake empty state                                                      |
| OUTCOME_UNKNOWN / UPGRADE_REQUIRED                       | 503 / 409; reconcile same operation / reload compatible client                                            |

## Required contract assertions

Invoke actions without UI, spoof actor/owner/grants, use foreign workspace/member/invite/cursor/operation IDs, revoke access before execution, and inspect HTML/RSC/JSON/errors for foreign fields. A valid zero-row negative control and a positive same-tenant control must accompany every isolation test. Test stale selector in a second tab, direct service calls, unknown capability paths, callback redirect Location with manual redirect handling, and no-store on denial. Receipt replay is authorized independently of the original effect. These assertions map to FR-003, FR-008–FR-016, FR-020–FR-022.
