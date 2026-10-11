# ROOMTONE-001 — Ambient Addressing & Relational Rendezvous

**Date:** 2026-10-11  
**Status:** HELD / proposed, not field-tested or deployed.  
**Parent:** [MASTER-SERVANT-PLAN 001](../plans/2026-10-11-master-servant-physical-internet-001.md) → [FIELD-SCORE-001](2026-10-11-field-score-material-counterpoint-001.md).  
**First synthetic crucible:** [THREE-ROOMS](../fixtures/roomtone-001/three-rooms.json).

> A ROOM NEED NOT REVEAL WHERE IT IS TO OFFER A WAY TO MEET.
>
> A ROOM-TONE ADDRESS DESCRIBES AN OBSERVED CONDITION, NOT A VERIFIED GEOGRAPHIC POSITION OR A PERSON'S IDENTITY.

## 0. What changes in the stack

Physical portals originally carry artifact references through sound, light, radio, sigils, ground and wires. FIELD-SCORE separates *carrier*, *observation*, *encounter*, and *locally authorized consequence*.

**ROOMTONE adds a rendezvous index**: different consenting rooms can become temporarily discoverable by **shared, individually approved features of their present conditions**, even when they do not exchange stable addresses or locations. A song can become a meeting place; a repeated environmental condition can hold a letter for later visitors; a vibration event can be compared without asserting that it was the same vehicle or that two receivers are co-located.

This is not a global physical-address database, people-finder, location triangulator, passive ambient surveillance network, or proof that matching acoustics imply matching occupancy.

~~~text
Physical room / local inhabitant
    -> privately measured local environment
    -> local extraction of coarse chosen features, with confidence and missingness
    -> explicit local PUBLICATION OFFER / OPT-IN
    -> short-lived, narrowly scoped ROOMTONE rendezvous token
    -> bounded relation candidates (music / similarity / optional hypothesis)
    -> two-sided willingness to meet or leave a condition-addressed letter
    -> locally chosen exchange; independent receipts; expiry and departure

Original source media and measurements stay owner-local by default.
~~~

ROOMTONE does not replace FIELD-SCORE or reLATTE. The rendezvous token is a **projection over encounter conditions**, not the origin, source recording, permanent room name, physical location, or transport authority.

## 1. Five identities and four clocks

Keep all five separate:

1. **Root identity** (optional) — an owner-selected persistent local room/world ID. Never required for public discovery.
2. **Observation ID** — a single sensor/decoder occurrence with raw-evidence provenance retained locally if permitted.
3. **Ambient feature vector** — time-bounded, often coarse and fallible observations (song, acoustic texture, ground vibration, rain label).
4. **Rendezvous token** — short-lived opt-in pseudonym for one session/room; rotates and cannot automatically be inferred from stable hardware IDs.
5. **Encounter / participant relation** — separately consented human-world crossing, not deducible from any earlier ID.

Four clocks matter: source content timeline, local sensor monotonic event time, device wall-clock (uncertain unless synchronized), and rendezvous-server arrival/expiry time. **Same musical recording time offset does not prove simultaneous physical hearing.** Arrival order cannot backfill sensor event order. Precise synchronicity requires a declared time error budget.

## 2. Three fundamental address modes

| Mode | Example | What it actually establishes |
|---|---|---|
| **SONG-SEAT** | two sessions voluntarily publish the same verified recording ID, possibly same playback phase | A consensual common media reference; not necessarily same room, proximity, or actual physical microphone capture |
| **ROOM-RHYME** | two rooms publish similar coarse, preselected acoustic/weather features | A candidate resemblance under a declared feature model; not a stable biometric-quality room identity or shared source |
| **GROUND-ECHO** | two local sensors opt in to compare finite vibration event descriptors | A hypothesis of related environmental activity; not proof of same vehicle, shared road, or location |

Fourth optional **AFTERGLOW** mode: asynchronous condition-addressed mailbox, such as "to the next opted-in room listening to this song while self-reporting rain." It is a voluntary rendezvous predicate, not a reliable environmental fact nor a broadcast to everyone who happens to be listening.

## 3. Minimal proposed contracts (no adoption implied)

### RoomToneOffer (owner-local, before publishing)

~~~json
{
  "schema": "roomtone/offer/v0",
  "offer_id": "offer:room-a-001",
  "session_alias": "june-fern",
  "root_id": null,
  "publication": {
    "explicit_opt_in": true,
    "modes": ["SONG-SEAT", "ROOM-RHYME"],
    "attributes": ["song_ref", "weather_tag"],
    "max_ttl_seconds": 900,
    "precise_location": false,
    "raw_audio": false,
    "raw_vibration": false,
    "other_people_speech": false
  },
  "song_observation": {
    "ref": "song:rosemary-roses",
    "evidence_class": "PLAYER_STATE",
    "playback_offset_seconds": 47,
    "clock_uncertainty_ms": null
  },
  "features": {
    "acoustic_texture": "soft-low-hum",
    "weather_tag": "rain",
    "weather_basis": "SELF_REPORTED",
    "ground_event": null
  },
  "declared_at": "2026-10-11T18:00:00Z",
  "expires_at": "2026-10-11T18:15:00Z"
}
~~~

This sample is purely fictitious. Do not publish any local ID from an actual household without affirmative consent; session_alias here is intended ephemeral. The offered song's evidence class distinguishes **PLAYER_STATE** (the app says it is playing), **MIC_DECODED** (microphone heard a recording), and **UNVERIFIED** (user-selected metadata).

### RendezvousCandidate (derived suggestion, no automatic connection)

~~~json
{
  "schema": "roomtone/candidate/v0",
  "candidate_id": "candidate:two-offers-001",
  "offer_ids": ["offer:room-a-001", "offer:room-b-001"],
  "mode": "SONG-SEAT",
  "matching_claim": "SAME_DECLARED_RECORDING",
  "supporting_attributes": ["song_ref"],
  "explicit_nonclaims": ["COLOCATION", "PERSON_IDENTITY", "AUDIO_FINGERPRINT_PROOF", "CONSENT_TO_CONNECT"],
  "state": "HOLD",
  "effect_proposal": "INVITE_TO_OPT_IN_ROOM"
}
~~~

A real implementation must bind exact offer canonical digests; IDs here are readable documentation samples, not cryptographic identifiers. Match tokens, source digests and native observation IDs are separate. No match may be promoted simply because addresses look similar.

### MutualAdmission (the later, separate human action)

~~~json
{
  "schema": "roomtone/mutual-admission/v0",
  "candidate_ref": "candidate:two-offers-001",
  "sides": [
    {"offer_id": "offer:room-a-001", "decision": "ACCEPT", "local_authority_ref": "owner-local-choice-a"},
    {"offer_id": "offer:room-b-001", "decision": "ACCEPT", "local_authority_ref": "owner-local-choice-b"}
  ],
  "scope": ["TEMPORARY_MESSAGE_ROOM"],
  "expiry": "2026-10-11T18:15:00Z"
}
~~~

There must be two fresh locally attributable selections for a private two-party connection. For a public group room, publication and entry policies must be explicitly declared to visitors; passive hearing never makes an automatic participant.

## 4. Sound is an address, not a recording upload requirement

Sources may be:
- exact hash or catalog ID of a track **from the playback app**, with explicit player-state provenance;
- locally computed acoustic match to an admitted catalog, with detector version and fallible confidence;
- an explicitly entered song ID;
- a verified ROOMTONE sonic cue or QR sigil from FIELD-SCORE.

A first release should use **player-state metadata**, not continuously record a room. It can prove song rendezvous while avoiding ambient-microphone collection.

Matching different performances, covers, re-recordings, stems and remixes requires separate declared relations: SAME_RECORDING, SAME_COMPOSITION, DERIVED_FROM, RELATED_THEME. Same title is not enough, and an inferred musical relation is not an ancestor record. An AI-generated "sounds similar" recommendation does not become a verified song identity.

**ROOM-RHYME** should start with user-selected category tags and coarse features, not reproducible full-resolution roomprints. Detailed impulse-response fingerprints can reveal a physical space; treating them as "anonymous" because they are hashed would be unsafe.

## 5. Geophones and traffic underfoot

Three tiers of evidence:
- **T0: Synthetic waveform fixture.** Demonstrates parsing/replay logic only.
- **T1: Real sensor observation.** A geophone/accelerometer recorded a bounded event on authorized land. Measures magnitude/frequency/timing with installation, calibration and environmental uncertainty.
- **T2: Correlated-event hypothesis.** Two independently sourced sensors produce similar finite event descriptors with a declared clock, distance/context model and chance-match controls. Even then, the same-vehicle conclusion is unproven without independent corroboration.

Ground vibration should not be treated as reliable location, vehicle identification, speed measurement, or permission to monitor roads. The envisioned orchard/soil experiments remain low-voltage, isolated and scientifically controlled. This layer may consume ROOT measurements later without requiring them.

## 6. Eleven-dial rendezvous composition

The dials can be human-accessible selectors over *consented* features and proposed experiences, not forced data collection. Example dial families: media, texture, weather, time window, tempo/energy, environmental rhythm, proximity class (only user-selected; not GPS inference), synchronicity, interaction mode, historical/afterglow, and privacy/visibility.

The exact existing Abundent dial names and numerical values must be retrieved from the owning UI before mapping them. This list is **conceptual**, not an attempt to overwrite that eleven-dial interface.

A query could be:

> Blues-night + rain + NOW + OPEN TO LETTERS

A matching room may be thousands of kilometers away. A coarse relation score may rank *offered* candidates; it is not a person-ranking or physical location confidence. "No matches" can reflect no volunteers, no sensors, time skew, unavailable data, suppression, or actual absence; it is not proof nobody was there.

## 7. AFTERGLOW: a song addressed to a future condition

An opt-in participant may leave a bounded message with a declarative delivery predicate, for example:

~~~json
{
  "schema": "roomtone/afterglow/v0",
  "message_ref": "sealed-message:001",
  "predicate": {
    "song_ref": "song:rosemary-roses",
    "weather_tag": "rain",
    "weather_basis_accepted": ["SELF_REPORTED"],
    "mode": "SONG-SEAT"
  },
  "visibility": "OPT_IN_DISCOVERY_ONLY",
  "expires_at": "2026-10-18T18:00:00Z",
  "max_deliveries": 1,
  "content_scope": "ONE_CONSENTING_INBOX"
}
~~~

The message's exact contents need not be public until delivered, and may remain encrypted until an explicitly authorized recipient accepts it. A delivery candidate is not yet delivery, reading, friendship, permanence or human identity proof. Conditional messages must have expiry, deletion/refusal paths, abuse reporting and anti-spam limits. A "song mailbox" must not allow strangers to silently target nonparticipants or infer who is in a specific physical room.

## 8. Privacy, safety, and honest evidence

**Non-negotiable default:** local-only, off, or explicit opt-in; no invisible listening. No continuous raw microphone upload, raw geophone stream upload, voice/speech transcription, third-party tracking, physical coordinates, fixed hardware identifier, or stable acoustic roomprint as a public locator. Audio captured during shared living conditions may incidentally include other people's speech: detect/avoid or refrain from sensing without proper permission.

- Publish only specifically selected fields, coarse-grained, short-lived; discard unnecessary observation details; enforce short retention and revocation.
- Rotating tokens do **not** guarantee anonymity. Distinctive song choices, event timing, or coarse weather can re-identify people, especially in small populations.
- Rate-limit discovery; bound repeated probing; minimum anonymity pool and optional delayed/blurred visibility for uncommon combinations; permit generic instead of exact match; suppress quiet hours if requested.
- Never display a physically nearest-room ranking or exact local clock event time without additional informed permission.
- Mutual consent for messages; no passive microphone-based stalking or proximity tracking. A participant leaving a room invalidates their temporary offer.
- Children's rooms and vulnerable participants require stronger safeguards: no automatic public discovery or direct stranger matching.
- Revocation should prevent *new* access; it cannot guarantee erasure of previously received content. Receipts may preserve the fact of an encounter without preserving someone else's private sound.
- No audio cue, light signal, QR, song title or geophone event independently authorizes network fetch, messaging, actuator movement or public exposure.

## 9. Three-room hostile fixture — the first earnable test

See [fixtures/roomtone-001/three-rooms.json](../fixtures/roomtone-001/three-rooms.json). All names, environmental features, identities and events in it are **fictional and synthetic**.

A: opts into SONG-SEAT, declares Rosemary Roses playing, rain self-reported, soft room hum; accepts one suggested encounter.  
B: opts into SONG-SEAT, same recording, no known rain; declines all connections.  
C: opts into ROOM-RHYME, similar hum and rain, different song; never offers SONG-SEAT.  
D: advertises no consent while coincidentally using the same song; must never become discoverable.

Expected:
1. A↔B: same declared recording -> a SONG-SEAT **candidate** only.
2. A↔C: similarity candidate only if they both opted into ROOM-RHYME and its permitted attributes; otherwise refuse.
3. B's explicit decline prevents message-room creation even if A accepted.
4. D remains completely excluded, even if somebody else supplies D's audio metadata.
5. A repeated source event cannot generate a new participant or an automatic second invitation.
6. Missing rain != dry. Different sensor bases remain typed; unknown does not become a contradiction.
7. Identical exact song IDs and playback offsets do not prove simultaneity or co-location.
8. Two different recordings with the same title do not qualify as SAME_RECORDING.
9. A measured room-rhyme match must not pretend its features are anonymous forever.
10. Out-of-order wall clocks and unverified device clocks do not allow spurious ordered-after claims.
11. Expired/revoked offer cannot produce a fresh rendezvous candidate.
12. Repeated requests and narrow searches cannot reveal whether a non-consenting room exists.
13. One-sided ACCEPT alone may not connect two participants.
14. Similar ground events without calibrated timing remain GROUND-ECHO hypotheses, not same-car evidence.
15. A message addressed to a condition can only be offered to opted-in, eligible recipients and must respect expiry and delivery limits.
16. A source-song likeness generated by a model cannot silently promote to a verified exact media ID.

All fixture outcomes are **expectations**, not passing test results, until independently checked by an owner-local implementation.

## 10. Staged work and destinations

**R0 — Written grammar (this PR):** types, non-collapses, fixtures, proposed ranking without exact location, consent and privacy envelope. Historical plan progress only.

**R1 — Synthetic candidate evaluator:** a narrow, pure-JavaScript demonstrator now exists in [the three-room fixture](../fixtures/roomtone-001/README.md), including negative/consent tests. It runs offline and produces candidates, refusal and expiry outcomes with **no effects**; the full envisioned score and rendezvous runtime, sensor tests, real users, network controls and independent Node CI remain unimplemented. No model-selected thresholds.

**R2 — SONG-SEAT two voluntary browser sessions:** use explicitly shared player state from a local song, timed opt-in aliases, no microphone permission. Separate acceptance on both ends and visible leave/revoke.

**R3 — AFTERGLOW bounded mailbox:** one song-triggered letter, no raw audio; hold/inspect/decline with retention and abuse controls.

**R4 — ROOM-RHYME:** coarse self-reported texture features first; later separately approved local-only acoustic feature extraction with controlled privacy audit and adversarial matching.

**R5 — GROUND-ECHO:** a real instrumented low-voltage geophone experiment on owned/authorized site with negative controls; never infer same person/vehicle from uncorroborated matching traces.

**R6 — Cross-carrier room festival:** independently admitted SIGIL, SOUND, LANTERN, RADIO and optional COPPER instrument cards can offer ROOMTONE events; none overrides FIELD-SCORE or reLATTE's local admissions.

### Proposed owner boundaries

- **Abundent / Static Workbench**: opt-in UI, dial interpretation, leave/revoke, messaging and human consent.
- **FIELD-SCORE** (proposal layer): declared observation and score-candidate boundaries.
- **LemonPRESS / Autodisco**: admitted recording identity, exact editions and declared musical relations.
- **GHoT**: optional finite sensing instruments; raw evidence and uncertainty not automatically upgraded to a room address.
- **TranchNode / Free Graph**: scoped continuity, opt-in relations and partially witnessed histories; neither gets authority to publish occupants.
- **Project0**: potential bounded relational propagation, no authority expansion.
- **reLATTE / Freeport**: verified crossings and quarantine on paths that adopt those contracts.
- **planZ**: durable source trail, proposal status, next edge and descendant dispositions, not room-control runtime.
- **CANNON**: independent owner selection of exact tested histories, if later requested.

## 11. New hypotheses worth testing

> ADDRESS != LOCATION.  
> ATMOSPHERE != IDENTITY.  
> SONG RECOGNITION != LISTENING CONSENT.  
> RESEMBLANCE != CO-PRESENCE.  
> RENDEZVOUS != CONNECTION.  
> LETTER CONDITION != DELIVERY.  
> AN UNOBSERVED ROOM IS NOT AN EMPTY ROOM.  
> THE HOUSE MAY TAKE ATTENDANCE ONLY WHEN ITS OCCUPANTS INVITE IT.

**Present plan disposition:** HELD / PROPOSED, not implemented, not canon.
**Smallest next proof:** two consenting browser sessions intentionally share the exact same locally played track ID; the system offers—but does not create—a temporary shared listening room; declining, expiry and leaving are visible, immediate and receipted.

**How it differs from the prior layer:** FIELD-SCORE governs how heterogeneous physical observations become owner-local encounter *candidates*. ROOMTONE governs how consenting, ephemeral **room projections** discover one another by declared environmental or musical relations before they elect to interact. Neither substitutes for the other.


## GO.STATIC descendant: a host-native synthetic field processor

[GO.STATIC FIELD COMPUTER 001](2026-10-11-go-static-field-computer-001.md) records the code-wire archaeology; [STATIC-OS draft PR #87](https://github.com/the-static-collective/static-os/pull/87) implements a real read-only InstrumentAdapterV0 for synthetic, opt-in ROOMTONE observations. At head 7126d16091a156a2c075145d56dfd965bf57f7dd, inherited Static-OS native tests and cold-verification GitHub Actions completed successfully. This is **not** a real room sensor, operating matchmaking service, network, or environmental computing hardware. Actual consenting listeners and real instruments remain independent future gates.
