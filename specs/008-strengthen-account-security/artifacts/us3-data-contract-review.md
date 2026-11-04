# US3 recovery state/field review — T022

Date: 2026-11-03. Investigation/preparation only; no actual provider campaign.

| Entity / owner | Fields | Constraint |
| --- | --- | --- |
| Recovery-code set / provider                                                 | Current generation reference, one-use consumption/replacement status, safe remaining-status if supported; one-time presentation and custody acknowledgement as required                                                          | No app code/verifier mirror, no secret read-back, no logs/browser persistence. Code count, format/entropy, lifetime, attempt rules and supported secure storage require provider/security review. Custody acknowledgement does not prove an external backup exists |

> Usable enrolled configuration means an accepted supported primary method + confirmed TOTP + at least one unused acknowledged current recovery code. A pending/removed/unsupported credential or existing session does not count.

Generation reference/current set, use/remaining status and replacement are provider-owned and unproven as selected protocol; one-time presentation/custody acknowledgement needs supported safe coordination. Generation → confidential one-time presentation → custody acknowledgement → current usable set; use consumes at most once under races. Replacement invalidates old generation atomically. Exhaustion cannot complete recovery without new acknowledged material; explicit voluntary disable is separate and keeps accepted primary access. Unknown commitment/lost reply must reconcile original transition without reusing another code or inventing receipt authority. All these transitions remain BLOCKED as managed acceptance, not implemented app states. No code/verifier/seed mirror, app recovery table or guessed code count/entropy/lifetime/attempt default.

Restore must reconcile provider generation/consumption/replacement and invalidate prior sessions/proofs before reopening access; backup cannot resurrect codes/old sessions or replay pending effects. No restore drill available; operations/security own that gap. T023 actual support/approval absent, leave unchecked. Product/security have approved no row in the policy matrix; do not change spec/register/checklist markers.
