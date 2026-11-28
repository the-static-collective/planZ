# HEARTH 002 — The Empty Chair
Status: synthetic review only. Admission: none. Parent HEARTH 001: 2aae4395d3299b25a2574c8914d9da5f9cf6029a.

## Result and reproduction

The new empty-chair.mjs adapter was executed in a JavaScript sandbox against the original Jubilee engine and fixtures fetched at 9f6f1c339109f73c351eff1dcf1ed77187044693. Connector-reported blob IDs matched the three recorded pins: engine 6e171bf12835d6fc5476249959721d05587b9d2b; journey f8a74d693e238896734f104e722073bd0ee08831; three-towns 29fc35d71916712a25958d62935c9e5f9efdfead. ESM export declarations were removed for the sandbox execution, and JSON cloning substituted for structuredClone for these JSON-only fixtures. No independent blob hash, native Node subprocess, browser, network, hardware or human test was performed.

Cut after event 9 (helper report); four events remain. The JSON handoff is 990 characters, containing synthetic events and source/audience metadata, not the private note or fixture body. Receiver has independently held reviewed prefix and fixture (not delivered by the handoff). Fresh receiver API instance reconstructs the reported state. Default HOLD and explicit REFUSE expose no state. Separate fictional actor decisions are required for continuation. These are caller-provided labels, not authenticated identities, grants, or cryptographic proofs. The reconstructed state includes the receiver's independently held fixture; it is not a public-safe export.

17/17 authored checks passed: private narrative/card absent; default hold; refusal; checkpoint remains reported; no authority; changed event; unknown field; wrong source; wrong receiver; missing event; held advancement; coordinator substitution; wrong native recipient; fictional withdrawal; unconfirmed return; equality to uninterrupted execution; synthetic-only return.

The comparison uses a known fixture and an independently retained full prefix, not a minimal self-sufficient packet, live revocation system, or independently blinded experiment. The original engine remains the sole event reducer. No physical action, real person, or private memory is involved.

Reproduce natively with Node 20+ in a separate checkout of the original pinned Jubilee commit (JUBILEE), and the HEARTH branch (HEARTH). From any directory, set absolute paths in this command:

```js
// node --input-type=module (paste the following as input)
import * as engine from 'file:///ABSOLUTE/JUBILEE/jubilee/src/engine.mjs';
import {rehearse} from 'file:///ABSOLUTE/HEARTH/experiments/caravan/empty-chair.mjs';
import {readFileSync} from 'node:fs';
const f = p => JSON.parse(readFileSync('/ABSOLUTE/JUBILEE/jubilee/fixtures/'+p,'utf8'));
const r = rehearse(engine,f('three-towns.json'),f('journey.json'));
console.log(JSON.stringify(r,null,2));
if (r.checks.some(x=>!x.pass)) process.exitCode=1;
```

Before running, independently verify the pinned files using git hash-object. This native reproduction is proposed, not claimed as executed.

## Physical successor: independent operator, paper first

1. Host chooses a small permitted outcome, appoints two willing operators, and independently confirms their roles. Use only invented content initially.
2. Operator A records the observed checkpoint and a short handoff: outcome, completed steps, unresolved task, evidence location, local permission status, fallback and responsible role. Keep personal reflections separate.
3. Operator A exits the activity. Operator B gets only the handoff and separately available local reference materials. B verifies current host and contributor decisions independently, not from A's claims alone. If unavailable, HOLD.
4. B demonstrates the permitted next step (e.g. reopen a local synthetic recording, confirm a second phone plays it, or coordinate an ordinary paper handoff). The actual recipient alone confirms receipt. Do not require recording or public sharing.
5. Record time, outside help, missing context, mistaken assumptions, refusals, and whether A had to return. No completion claim without appropriate evidence.

Success: a different willing operator can resume the intended useful activity without A's assistance or private narrative, and can safely stop when authorization or evidence is absent. Recovery of software alone is insufficient. No actual gathering, production activation, merge, or external contact is authorized by this packet.
