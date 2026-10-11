# FIELD-SCORE-001 — Material Counterpoint / The Encounter Layer

**Date:** 2026-10-11
**Status:** NEW PROPOSED LAYER — specification and falsifiable fixture; not existing deployed system.
**Parent:** [MASTER-SERVANT-PLAN 001](../plans/2026-10-11-master-servant-physical-internet-001.md)
**Sources:** [cross-project archaeology](../research/2026-10-11-physical-portals-thread-dig-001.md)

> **THE CARRIER SPEAKS. THE RECEIVER OBSERVES. THE HUMAN CHOOSES WHETHER IT BECOMES AN ENCOUNTER.**

## 1. The missing layer

MASTER-SERVANT-PLAN connects media carrying addressable content, but the source projects revealed a distinct problem: physical signals, media composition, interpretation, historical environment, and local consequences can be mistakenly fused.

FIELD-SCORE is a **bounded composition of observations into an offered encounter**, not a machine that infers truth or runs commands. Its central separation:

~~~text
SOURCE PARTICULAR
  -> MATERIAL ENCODING
  -> PHYSICAL PROPAGATION (with loss, transformation and uncertainty)
  -> INSTRUMENT OBSERVATION (raw evidence, medium, position, timing)
  -> DECODER CANDIDATE (possibly multiple, possibly none)
  -> SCORE MATCH (declared, bounded, replayable)
  -> HUMAN-FACING PROPOSAL / HOLD / REFUSAL
  -> OWNER-LOCAL ACTION (if separately authorized)
  -> RECONSTRUCTIBLE RECEIPT
~~~

The layer has three axes:
- **Lineage axis:** source work, derivative edition, artifact manifest, carrier generation; positive ancestry, never similarity-based parentage.
- **Physical axis:** actual emitter, carrier, observed raw evidence, conditions, sensor, capture uncertainty and whether real hardware was used.
- **Experiential axis:** declared sequence, observed order/time, viewer context, consent, proposals, accepted/refused doors and new world state.

**Do not collapse axes into one timeline or identity.** One song can be emitted twice; one QR can be photographed twice; two carriers can carry one exact reference while still producing two physically different events; two sensors connected to the same emitter are not automatically independent corroboration.

## 2. Why this belongs between FERRY and the receiver

reLATTE POLYGLOT-CROSSING-001 already tests portable crossing grammar across different substrate identity systems. GHoT RADIO-EAR-002 gives raw IQ samples with explicit physical-observation limits. LemonPRESS AUDIO COMPOSER resolves source-bound audio scores before rendering; MATERIAL MEMORY separates physical history from camera/render choices. Project0 L-Branch provides bounded declared propagation without authority expansion. TranchNode's luminous computational terrain asks when the environment itself changes available transitions.

FIELD-SCORE composes those *questions*, not their unmerged codebases, around a new candidate:
**An encounter is an attributable relation between observed physical evidence, a declared score, an observer, and a locally admitted consequence.**
Only the receiving system may elect to turn an offered encounter into action. The carrier never commands.

## 3. Minimal typed research objects (not adopted schemas)

### A. CarrierEdition
~~~json
{
  "schema": "field-score/carrier-edition/v0",
  "edition_id": "song-door-b-derivative-wav-v1",
  "source_ref": "work:three-doors/song-b",
  "source_digest": "sha256:<exact-source-bytes>",
  "carrier_medium": "audio",
  "encoded_ref": "artifact:singing-postcard-001",
  "encoder_id": "acoustic-demo-v0",
  "carrier_digest": "sha256:<exact-derived-wav-bytes>",
  "admission": "owner-local-edition-decision-or-none"
}
~~~

### B. PhysicalObservation
~~~json
{
  "schema": "field-score/observation/v0",
  "observation_id": "obs:mic-002",
  "medium": "audio",
  "instrument": {"type":"microphone","model":"declared","calibration":"unknown"},
  "raw_evidence_digest": "sha256:<exact-captured-bytes>",
  "capture_kind": "physical|synthetic|replayed|unverified",
  "site_ref": "operator-declared-test-site",
  "clock": {"timestamp":"2026-10-11T18:00:00Z","confidence":"device-local-unverified"},
  "conditions": {"distance_m": 1, "noise_dba": null},
  "decoder_version": "acoustic-demo-v0",
  "decoded_candidates": [{"artifact_ref":"artifact:singing-postcard-001","validation":"checksum-pass"}],
  "claims": ["EXACT_CUE_DECODED"],
  "nonclaims": ["EMITTER_IDENTITY_UNKNOWN", "NO_AUTHORITY_CONVEYED"]
}
~~~

### C. EncounterCandidate
~~~json
{
  "schema": "field-score/encounter-candidate/v0",
  "score_ref": "score:three-doors-001",
  "matched_observation_ids": ["obs:qr-001", "obs:mic-002"],
  "referent": "artifact:singing-postcard-001",
  "match_kind": "same-referent-two-observations",
  "independence_claim": "NONE",
  "requested_effect": "OFFER_VIEW",
  "status": "HOLD"
}
~~~

### D. LocalDecision
~~~json
{
  "schema": "field-score/local-decision/v0",
  "candidate_ref": "candidate:<digest>",
  "decision": "INSPECT|DECLINE|HOLD|ADMIT",
  "authority_ref": "<receiver-owned capability or explicit human choice>",
  "effect_allowlist": ["OPEN_LOCAL_ARTIFACT_VIEW"],
  "effect_receipt_ref": "<only after authorized execution>"
}
~~~

Schemas are illustrative. A decoder with multiple interpretations must preserve all candidates and ambiguity. A score must never manufacture missing physical observations. Device timestamps without synchronization must not be promoted into precise global ordering. A replay-safe occurrence ledger distinguishes repeated sensing from repeated effect.

## 4. Material counterpoint as an optional score

A score can describe how separately observed carriers may become a richer interaction. It is not a script to execute on contact.

~~~json
{
  "schema": "field-score/score/v0",
  "id": "score:three-doors-001",
  "authorized_carriers": ["sigil-qr","audio-cue","optical-frame"],
  "relations": [
    {"kind":"SAME_REFERENT","members":["qr-a","song-a"]},
    {"kind":"ORDERED_AFTER","members":["song-a","song-b"],"clock_basis":"same-observer-monotonic"},
    {"kind":"OPTIONAL_REVEAL","when":["qr-a","song-b"],"offer":"OPEN_LOCAL_ARTIFACT_VIEW"}
  ],
  "limits": {"max_observations":16,"max_candidates":8,"max_steps":3,"max_duration_s":900},
  "default_disposition": "HOLD"
}
~~~

**Do not treat proximity, similarity, shared musical themes, equal digests, or time overlap as consent, causality, or social identity.** A declared SAME_REFERENT relation needs exact checked IDs. ORDERED_AFTER needs a comparable clock domain or explicit uncertainty. OPTIONAL_REVEAL proposes a local bounded affordance, never external navigation without separate approval.

**Green Grammar may express the score visually:** a branch drawn by the sigil can be a relationship claimed by a signed declaration, whereas organic resemblance alone proves nothing. An absent score edge must remain absent, and an unresolved edge may be visibly incomplete.

## 5. A particularly strange use: polyphonic portals

An artifact can carry several independent physical expressions at once:
- A printed Green sigil encodes a permanent reference.
- A deliberate sound cue in a song points at that reference.
- A lantern repeats a different short *encounter invitation* at scheduled moments.
- GHoT radio RX captures raw RF observation that MAY later yield decoded data, but uncalibrated amplitude must never be counted as a match.
- A soil sensor can report an independently measured environment change, but is not presumed to communicate messages through the earth.
- A spare copper pair can convey encoded bytes without producing any signal in public RF space.

The local user can be offered one **room** whose content depends on what was actually observed, what is uncertain, and which doors the user elects to cross.

**New thought — Material Counterpoint:** the experience does not need one omniscient conductor. The score is a declarative invitation; local players can encounter different subsets in different orders, remain distinct, and still preserve reconstructible partial stories. There is no universal canonical sensory path.

## 6. First executable hostile fixture, with no device requirement

Make a small fixture evaluator in an owning implementation (candidate: Abundent/Static Workbench; planZ only holds the plan).

Input:
- An admitted source manifest A with digest X.
- One simulated QR observation decoding artifact A; one simulated acoustic observation decoding A; one simulated repeat of the same QR; an unrelated optical frame decoding B.
- An explicit three-cue score, fixed candidate enumeration and limited CPU/event budgets.
- Local human decisions supplied as fixture data, not inferred from content.

Expected:
1. QR and audio observations both pass byte-level reference checks but retain **different occurrence identities**.
2. Their equality as references does not count as independent proof of authorship, existence, RF propagation, or consent.
3. A QR repeat is preserved as another observation but must not produce duplicate consequence.
4. Wrong referent B cannot join A's same-referent relation.
5. A missing song cue does not get supplied by the sidecar declaration.
6. Out-of-order cue results are observed rather than silently repaired.
7. Bad checksum, digest, key, nonce, decoder ambiguity or clock precision cause REFUSE/HOLD, never acceptance by likelihood.
8. Encounter candidate may offer one local view; no effect occurs until separate explicit local decision.
9. Explicit refusal leaves a trace, not a silently absent event.
10. Replay on the exact fixtures reproduces candidate IDs and decisions byte-for-byte; media capture itself need not be fabricated or regenerated.
11. A rendered illustration of the sigil/card may change presentation without rewriting where or when the physical object was observed.
12. A Project0 L-Branch-like finite score propagation can alter *candidate eligibility* while the set of actions/authorities remains fixed.
13. An unsigned signal may still be observed and held, but cannot impersonate a signed issuer.
14. Offline unresolved artifact refs remain references, not imagined content.

**Initial fixture claim is purely synthetic:** no field measurements. Separate physical test variants then replace synthetic observations with actually recorded captures plus calibration/uncertainty.

## 7. Road from simulation to physical witness

**Gate F0:** independently pinned schema fixture, negative cases, deterministic evaluator and replay receipt.

**Gate F1:** actual QR paper and actual WAV emit/capture. Record 20 attempts each across controlled conditions; record every failure, raw data hashes, device info, distance/lighting/acoustics, independent decoder output. QR standard scanning must work without custom decoder. No automatic interaction.

**Gate F2:** three-track observed playback with score declarations; check track skipped, repeated, re-encoded, out of order, interrupted. The computer should propose visible changes, never directly execute external actions from audio.

**Gate F3:** add light; separately add GHoT radio **physical RX** with correctly bounded evidence (raw IQ != payload). A later independently permitted transmitter/receiver specimen is needed before claiming real radio packet networking.

**Gate F4:** data over a privately verified disconnected telephone pair, then certified power-line adapters, each treated as another carrier with native history.

**Gate F5:** isolated benchtop earth/copper coupling study with controls and negative results. Do not promote ecological poetry into electrical evidence.

**Gate F6:** human-facing portal hosted in Abundent/Workbench and owner-authorized reLATTE/Freeport crossings with original source preservation.

## 8. Proposed duties by project (without claiming owner approval)

| Project | Keep its authority | Optional FIELD-SCORE interface |
|---|---|---|
| LemonPRESS | source/edition admission and composer score | produce signed/hashed cue sidecars and separately identified sonic derivatives |
| GHoT | hardware capability declaration and explicitly selected instrument runs | emit raw capture receipts with instrument uncertainty and bounded decoder proposals |
| reLATTE | portable crossing grammar and signed receipts | accept only separately defined typed encounter/custody crossing, no implicit source admission |
| Freeport | quarantine/foreign material holding | store unfamiliar carrier/decoder payloads in HOLD |
| TranchNode | attributed continuity and unresolved contradiction | preserve separate observation, decoder, interpretation, and encounter lineages |
| Project0 | reference law for bounded propagation | optional bounded score candidate evaluator; no core ontology expansion by assumption |
| Abundent / Static Workbench | local human interaction, consent, accessible view | score UI with inspect, hold, decline, admit and replay |
| Green Grammar / FreeGraph | explicitly evidenced relations, higher-order structure | express relations visually without treating design as evidence |
| CANNON | selected exact evidence, not default branch | decide separately whether particular test receipts merit selection |
| planZ | historical census, status and remaining edges | preserve this proposal and track its actual descendants, including refusal/negative results |

## 9. Laws earned as hypotheses, not canon

> A SIGNAL MAY INVITE AN ENCOUNTER; IT DOES NOT OWN THE CONSEQUENCE.

> THE SCORE KNOWS WHAT WAS DECLARED. THE INSTRUMENT KNOWS ONLY WHAT IT OBSERVED.

> ONE MESSAGE CAN HAVE MANY PHYSICAL OCCURRENCES. ONE OCCURRENCE MAY SUPPORT MANY INTERPRETATIONS.

> A ROUTE MAY BE SHARED WITHOUT A SHARED AUTHORITY. A PERFORMANCE MAY BE PARTIAL WITHOUT BEING FALSE.

These are proposed FIELD-SCORE laws, not owner-selected CANNON primitives.

## 10. PlanZ completion contract

**Plan disposition:** HELD / proposal.
**What would count as implementation:** owner-local fixture runtime, negative tests, actual separately sourced observation receipts and a reviewed user-selection seam.
**What would NOT count:** this markdown landing; a branch existing; CI built with synthetic radio or synthetic audio; a beautiful generated drawing; a signed but unverified origin claim; an imagined orchard communication; a score declaration with no witnessed playback.
**Next exact edge:** F0 deterministic fixture → F1 physical SIGIL + SONG measurements. Any owner can accept/refuse the proposal without planZ overwriting the original historical record.

## 11. ROOMTONE-001 neighboring layer — relational addressing

The approved planning extension [ROOMTONE — Ambient Addressing & Relational Rendezvous](2026-10-11-roomtone-ambient-addressing-001.md) asks a different question from FIELD-SCORE:

- FIELD-SCORE: *What physical evidence and scored observations can constitute a bounded local encounter candidate?*
- ROOMTONE: *What minimal, volunteered, short-lived features can help two independently sovereign rooms discover a potential relationship without revealing their physical addresses or inferring consent?*

ROOMTONE may use declared track IDs, opt-in acoustic/atmospheric features, and eventually cautiously verified ground-vibration event comparisons. It **must not** equate similar roomprints, shared music, synchronized playback, traffic sounds, or recurring event descriptors with physical co-location, shared participants, or permission to connect. No source recordings need to leave their original host merely because an ephemeral rendezvous was offered.

A correspondence between two temporal condition-addresses is not yet a mutual encounter. See [the synthetic THREE-ROOMS fixture](../fixtures/roomtone-001/three-rooms.json) for a test where same-song candidate status survives but one party refuses; no connection is authorized.

**No change is proposed to any reLATTE, TranchNode or Project0 normative core.**
