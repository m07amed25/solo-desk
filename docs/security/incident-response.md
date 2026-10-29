# Website security incident response

Updated 29 October 2026. Operational plan for suspected auth/data/financial compromise. Assign an incident owner and approved contact paths before deployment. This document does not send messages, change remote services or authorize destructive investigation.

## Triage and containment

1. Record detection time/timezone, affected build/environment, observed indicators and suspected data/identity/financial scope. Preserve restricted logs/artifact identities and timestamps; exclude secrets from ordinary tickets/chat.
2. Assign accountable incident and technical owners. Evaluate ongoing access, exposed privileged identities, affected tenants/provider accounts and unauthorized financial effects.
3. Contain the affected entry point using narrow reviewed controls: pause unsafe publication/finance/provider jobs, disable a vulnerable feature, restrict access or roll out a verified mitigation. Preserve data and audit; do not mass-delete records or blindly replay effects.
4. Revoke/rotate affected database, auth, provider, CI and deployment credentials using their supported procedures. Invalidate sessions/recovery material where needed; changing a signing/encryption secret is not proof all sessions were revoked. Maintain a controlled recovery identity.

## Investigate and remediate

Establish which artifact actually ran, exact vulnerable packages/configuration, exposure interval, granted roles and external effects. Check source/lock/build provenance, auth/session access, DB/audit/receipts, object access and provider reconciliation. A patched package without observed compromise does not prove no data was accessed; label confidence and unknowns.

Prefer clean reviewed builds and trusted sources after build/runtime compromise. Apply supported vendor fixes and regression checks for the root cause, not only one request signature. Verify secrets are no longer valid and repaired authority cannot be bypassed through another route/job/cache. Keep forensic copies restricted and do not execute suspicious payloads in a trusted environment.

## Recover safely

Restore only into isolation first. Validate tenant constraints, financial snapshots/numbers/allocations, private files and operation receipts. Reconcile provider payments/messages/jobs since the restore point. Invalidate restored auth material, apply current membership and migrate compatibly before reopening writes. Monitor canary behavior and rejected access; do not label old financial commands safe merely because a backup contains them.

If browser/portal copies or downloads escaped, do not promise remote deletion. Assess affected information and retention/exposure limits honestly. Service availability, data integrity and confidentiality each need their own recovery evidence.

## Communication and closure

Use approved private reporting/status channels and authorized recipients. Incident owner obtains qualified privacy/legal guidance for applicable notification duties and deadlines; this runbook invents no universal legal deadline. Do not publish live exploit details, secrets, customer names or a speculative breach claim in public issues.

Close only when containment, root-cause repair, fresh tests, deployed artifact verification, credential/session response and financial reconciliation have evidence. Record residual uncertainty, impacted data, owner decisions, timeline and prevention work in the restricted incident record. Update affected SEC tests, threat model, dependency process and runbooks. Link a safe summary from [findings](findings.md); preserve historical evidence without relabeling it as a fresh pass.
