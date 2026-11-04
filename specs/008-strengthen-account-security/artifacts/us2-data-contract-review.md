# US2 access-method and bound-intent fields — T018

Date: 2026-11-03. Investigation/preparation only; no actual provider campaign.

Verbatim logical constraints, with every field mapped to its owner:

| Entity / owner | Fields | Constraint |
| --- | --- | --- |
| Access method / provider                                                     | Owned opaque reference, kind and authentication role, safe label, pending/active/removed state, optional safe timestamps                                                                                                         | Factor seeds, private keys, credential tokens/challenges and verifier records remain managed. Own-only bounded safe projection; provider payload/IDs that carry bearer authority never reach general client state                                                  |
| Bound intent / existing security boundary, only after support                | Original account/session, supported action/purpose, immutable authoritative targets and digest, method, trusted issue/verification/expiry, pending/cancelled/verified/reserved/consumed state and original operation correlation | Reference alone grants no authority. Existing revocation tables encode revocation-only actions/five-minute proof and cannot be silently broadened. POL-03 supplies each new action's exact proof/challenge rules                                                   |

Access method: owned reference, kind/authentication role, safe label, pending/active/removed state and optional timestamps are managed-only; actual new-method projection/protocol unproven. No SDK/user-supplied flag is accepted state. Bound intent: original account/session derives from trusted current authority; action/purpose and immutable targets/digest must be authoritative; method/trusted issue-verification-expiry/state/correlation require accepted provider protocol and POL-03. Existing revocation-only implementation cannot supply new enums or five-minute rules. Every new wire field/schema remains unproven; no new table, enum, route or factor state selected. Public restricted challenge is not ordinary session authority.
