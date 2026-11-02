# US2 destinations and account scope

2026-11-02; operator Codex. Final source/build/lock/runtime and synthetic fixture hashes: [identity](final-identity.json). Baseline and earlier red logs use the recorded baseline plus stated regression-test edits; they are historical failures, not final-build failures. Local Node checks have no locale/theme/viewport. Mounted checks use Chrome 155.0.8059.84, real product components/CSS with explicitly mocked navigation/auth/actions/transport/Realtime at loopback4316; they cannot establish Next Cache Components/history or live authority. Assertion code and declared fixture inputs are retained in [controlled fixture](controlled-fixture/README.md).

PASS local: actual imported context loader/handler handles absent/expired/nonfinite/outage identity, disabled/empty/restricted/unavailable team context, narrowed projections, scoped selectors and private response codes. [Red](loader-red-approved.log), [green](loader-green.log), [final suite](final-full.log).

PASS controlled mounted: real shell overview/workspace/account controls are rendered, navigation uses real Link handlers with a declared router substitute, long names wrap, own profile remains usable during team-only failure and failed save input remains. See [profile/mutation assertions](mounted-lateMutationAndProfile.log). Rail/mobile controls use shared44px variants/tooltips and active destination labels.

BLOCKED full V2/SC-002–003: actual public/auth route composition, hosted own-profile read/update/Realtime, all desktop/short-height keyboard reachability and real Next navigation performance were not fully exercised. T011/T016 remain unchecked. Source inspection/build is distinct from these journeys.
