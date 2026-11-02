# Workspace verification procedure

`test-workspaces-browser.mjs` retains its historical CLI name. It performs anonymous fetches and source assertions, without launching a browser. `--self-check` still needs a running loopback app. `--manifest` additionally validates manifest shape; its `env`/branch string does not independently establish target isolation. A passing report is an HTTP/source supplement only.

```bash
npm run test:workspaces:browser -- --self-check
npm run test:workspaces:browser -- --manifest /tmp/authorized-target.json
```

Before authenticated browser or real PostgreSQL work, independently bind app/auth/database/branch identities, restricted runtime role, fixture ownership and synthetic delivery sink. Keep credentials/manifests/cookies/proof outside the repository. Never infer a test target from default environment credentials. Preserve default-off credentials/invitation/ownership and unsupported step-up gates.

Use the [Feature 006 execution guide](../specs/006-shell-verification-completion/quickstart.md) and [evidence contract](../specs/006-shell-verification-completion/contracts/verification-and-evidence.md) for mounted V2–V7, separate real authority checks and all required results. No PASS is preassigned by this procedure.

Actual journeys use `/app` for Overview, `/app/workspace` for existing workspace/team management and `/app/account` for personal profile. Public/auth layouts remain separate. Personal profile works independently of workspace availability. Verify fresh authority on restoration; private/no-store headers alone do not prove BFCache/Activity concealment.

Create workspace, explicit selection, settings, invitation and member actions reuse existing services and original operation IDs/targets/revisions. Selection remains checking until current context matches requested UUID and actor; a cookie/action response is not authority. Test >20 choices, delayed initial/manual/mutation responses, 20 A/B switches, grant removal and cross-tab races with zero forbidden reveal/effect. Direct service/session/database denial is separate from mocked browser transport.

Invitation proof must be bounded, scrubbed into memory and accepted only explicitly by a current authorized recipient. Do not fetch or display private team/recipient metadata speculatively. Signed-out users sign in and reopen the original link; proof is never forwarded through returns. Acceptance does not silently select the joined team: require explicit authorized selection. Test malformed/oversized/wrong-recipient/reused/revoked proofs and hashchange during acceptance. Unsupported ownership/step-up remains disabled; do not activate it for the test.

Record each actual browser/version/source/fixture, locale/theme/viewport/motion, interaction/assertion and sanitized capture. Cover English/Arabic × Light/Dark/System; 390×844, 768×1024, 1280×800, 1440×900, 1280×480, 320px reflow and actual 200% browser zoom. Human screen-reader/keyboard/contrast and fluent-Arabic review require named results; parity, source, screenshots and HTTP do not approve them.
