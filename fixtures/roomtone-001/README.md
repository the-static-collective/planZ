# ROOMTONE-001 — THREE-ROOMS Synthetic Crucible

**Status:** experimental planZ fixture and pure evaluator; not an Abundent feature, sensor driver, matching service, or human contact system.

**Four synthetic fixture offers:** A, B, and C form the three consenting test rooms; D is an excluded nonparticipant control. Their names, songs, weather and conditions are invented test data.

## What runs

~~~sh
node --test fixtures/roomtone-001/evaluate.test.mjs
~~~

Run from repository root with Node.js 22 or newer. Requires no packages, internet connection, sensor, private credentials, external APIs, real-world audio, or writable files.

The evaluator in [evaluate.mjs](evaluate.mjs):
1. Fails closed for non-synthetic fixtures and duplicate offer IDs.
2. Filters unpublished, revoked and expired room offers.
3. Produces SONG-SEAT candidates only for two opt-ins explicitly sharing an exact recording reference.
4. Produces ROOM-RHYME candidates only for two opt-ins sharing coarse texture and weather with the same declared weather basis.
5. Never infers people, place, proximity or ground traffic identity.
6. Marks a declined suggestion as REFUSED; two ACCEPT decisions produce **MUTUAL_APPROVAL_PENDING_EFFECT**, still no connection.
7. Always returns empty arrays for created connections and applied effects.
8. Uses no source media, raw microphone audio, GPS, network or ambient vibration.

Expected baseline:
~~~json
{
  "candidates": [
    {"id": "ROOM-RHYME:A:C", "status": "HOLD"},
    {"id": "SONG-SEAT:A:B", "status": "REFUSED"}
  ],
  "excludedOffers": ["D"],
  "createdConnections": [],
  "appliedEffects": []
}
~~~

There are 16 Node test cases in [evaluate.test.mjs](evaluate.test.mjs) covering basic agreement, no effects, declines, revocation, expiry, mode scope, withheld features, unknown weather, evidence basis, title/recording mismatch, determinism and invalid input. A separate connected-tool isolated-JavaScript check of the submitted evaluator against the checked-in fixture passed 17 explicit conditions on 2026-10-11; **this is not a claim that the Node test runner or physical hardware was exercised**.

The real R2 future proof belongs in an actual user-facing owning project: two people opt in, share local playback state, explicitly approve a temporary meeting, and can leave/revoke. That needs UI, permissions, storage safety, abuse limits, lifecycle and independent review, none of which this fixture provides.

**Plan owner:** planZ indexes the idea and this simulation. Abundent/Workbench or another adopting project would separately own a live implementation. No automatic promotion to CANNON.
