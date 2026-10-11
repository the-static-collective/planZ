# The Road Is the Room — executable Jubilee rehearsal

An additive software descendant of [TOPPER-001](../layers/2026-10-11-revival-traveling-jubilee-topper-001.md) and [planZ #14](https://github.com/the-static-collective/planZ/pull/14).

Open **[dist/index.html](dist/index.html)** in a browser. One portable file contains its own styles, data and engine; the experience needs no account, server, installation or internet connection. All towns, owners, cards, choices and receipts are synthetic. The session stays in memory; refreshing or starting again clears it. Clicking the source-proposal link explicitly opens GitHub.

The separate **[field kit](field/README.md)** starts empty for local operator declarations, supports encrypted backups and a blank host pack, and includes an actual byte-verified Revival-generated Genesis world. The synthetic rehearsal now offers that same world through an explicit, separate inspection button.

## Walk the route

- Inspect the Giving Tree in Orchard, River and Harbor. Each public card opens a readable paper door; private, expired, opted-out and withdrawn cards are excluded.
- Walk through 13 separate choices: three host acceptances, a scoped song handoff, a proposed table introduction, two consent decisions, two journeys, an independent receiver acceptance, a helper report, a recipient confirmation and a final return.
- Decline an introduction or withdraw a card. Affected future actions stop; preserved history does not establish permission to reuse the card.
- Inspect independent music, aid, Scripture and return histories in the caravan view.
- Print public paper doors from all towns, or save a public JSON snapshot. Print cards clearly identify rehearsal material and contain no invented QR codes or Scripture addresses.

Opening a card records a separate **simulated paper inspection**. Two openings produce two occurrences and no consequence. These user interface interactions are never physical scan evidence.

## The executable boundary

`src/engine.mjs` is a pure deterministic evaluator and replay reducer. It has no network, sensor, storage, identity, payment or source-import access. Browser, CLI and tests use the same reducer.

| T0 card | Result |
|---|---|
| Public `Gen.1.1` | `ELIGIBLE_FOR_LOOKUP`; address and source digest stay null |
| Public `Luke.4` theme | `CITATION_ONLY_SOURCE_UNRESOLVED` |
| Private / withdrawn need | Excluded; aggregate `PRIVATE_OR_WITHDRAWN` count only |

Eligibility is the original synthetic candidate lookup. Its engine fields stay null. A separate owner-produced source artifact is now included and verified against the selected immutable byte pin; explicit source inspection never promotes a synthetic card or event. Outputs retain `appliedEffects: []` and `createdConnections: []`.

The rehearsal schema is internal to this demo. It is not the Revival Door Packet, a registered Portal Envelope, a reLATTE crossing, a native STATIC-OS admission or a universal festival protocol. Other owner repositories are unchanged.

Actor aliases and host decisions are caller-supplied simulated declarations, **not authenticated consent**. Fixed fixture time permits deterministic cold replay. This is not a live invitation service or persistent multiuser application. Do not supply private real data: the synthetic fixture is compiled into the inspectable HTML. Public projections exclude hidden cards; originating local fixture files remain test input.

## Reproduce the proof

Node 24 is the tested development environment. Browser runtime has no package dependencies; Playwright is a development-only test tool.

```sh
node --test jubilee/tests/*.test.mjs fixtures/roomtone-001/evaluate.test.mjs
node jubilee/bin/build.mjs
node jubilee/bin/build.mjs --check
node jubilee/bin/build-field.mjs
node jubilee/bin/build-field.mjs --check
node jubilee/bin/rehearse.mjs build jubilee/fixtures/three-towns.json jubilee/fixtures/journey.json /tmp/jubilee-witness.json
node jubilee/bin/rehearse.mjs verify jubilee/fixtures/three-towns.json jubilee/fixtures/journey.json /tmp/jubilee-witness.json
```

The CLI refuses output overwrite. `verify` reconstructs the entire projection from the fixture and events and compares it with the entire saved witness. SHA-256 binds canonical fixture, event and witness content; it proves deterministic replay and content equality, not signature, truth, admission or physical delivery. The checked-in [return witness](fixtures/return-witness.json) is tested against the full three-town replay.

Browser verification:

```sh
npm ci --prefix jubilee --ignore-scripts
cd jubilee
npx playwright install chromium
node tests/browser.mjs
```

If a browser policy blocks file URLs, run from the repository root with a temporary loopback server:

```sh
JUBILEE_HTTP=1 JUBILEE_CHROMIUM=/usr/bin/chromium node jubilee/tests/browser.mjs
```

Seven browser checks cover door inspection and Escape, complete return, public download, deliberate refusal, withdrawal and printing, mobile overflow, and absence of page errors or external requests. CI repeats engine tests, cold replay, deterministic build and browser checks. Inherited DUAL-BODY checks remain intact.

## Next earned crossings

The T0 software gate is executable. T1–T3 physical gates remain unearned. A rehearsed host acceptance is not a booking, a song receipt is not a physical transfer, and a confirmation is not aid evidence.

The Genesis source artifact is now supplied by [Revival's owner-local exporter](https://github.com/the-static-collective/revival/pull/15), with verified bytes, an actual passage address, receipts and attribution. The next human pilot needs a real separately accepted host run sheet, a steward-owned Giving Tree, participant-controlled withdrawal and recipient confirmation. The [field kit](field/README.md) prepares each recording surface; actual decisions stay in their owning surfaces.
