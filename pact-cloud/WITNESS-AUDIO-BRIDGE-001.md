# WITNESS Audio Bible × THE PACT × Full Measure — Bridge 001

Status: PACT v0.4 deployed 2026-11-21; candidate evidence only, no Full Measure canonical admission.

## Correct WITNESS source

The referenced project is the community audio Bible at https://github.com/the-static-collective/WITNESS , **not** the separate Human-Witness encounter tool.
The original Genesis branch is genesis/community-audio-bible-001. Its prototype records Matthew 5 (World English Bible Protestant Edition), stores audio in local IndexedDB, and can export witness-package v1 packages. Its optional shared audio service is in a separate Supabase project, observed inactive when this bridge was made.

The WITNESS source's CANON-001 rule is binding: people choose what to read; WITNESS remembers; the listener composes. No mandatory verse claiming, quotas, assigned passage, spiritual score, exclusive reader, or forced completion. The prototype's odd/even chapter division is only a demonstration.

## Live v0.4 behavior

THE PACT WITNESS tab imports witness-package v1 and verifies SHA-256 for each audio blob in the browser. It permits local playback and explicitly selected metadata-only linking to the private PACT room. Only recording ID, audio digest, passage, declared edition/license/time and source format are sent; *no audio or Bible text* is copied to THE PACT cloud.

Event types: witness.link, witness.review, witness.withdraw. The linker is the person sharing the reference, not necessarily the voice owner. Independent partner metadata acknowledgment is distinct from their self-attested listening. The UI offers an 'I listened' option only after the partner imports the exact matching local audio. The server validates separate seats, duplication, and origin-only withdrawal. Withdrawal retains history and cannot erase WITNESS's original recording.

A review packet in the schema static-collective.witness-pact-full-measure-candidate.v1 includes recording and PACT event references with zero Deeds, zero Harvests, zero Capacity. Source digest agreement does not authenticate the contributor, the claims of having listened, text fidelity or licensing. No Full Measure canonical state is changed by this bridge.

## Status and limitations

Deployed to existing Supabase pantry-gate Edge Function pact-room, version 4. Canonical source planZ/pact-cloud/edge.ts, snapshot edge-witness-v04.ts. The PACT database was extended with metadata-only link/review/withdraw events. WITNESS's own archive and separate Supabase project were not changed.

Live synthetic disposable-room tests: metadata link HTTP 200, self-review HTTP 409, other-seat metadata review HTTP 200, temporary room removed, live PACT room clean. Backend checks passed. Direct phone/browser import and audio playback were not independently field-tested.

Source and provenance: https://github.com/the-static-collective/WITNESS/blob/genesis/community-audio-bible-001/docs/CANON-001-FREE-WITNESS.md
Full Measure: https://github.com/the-static-collective/full-measure-world-layer

Next owner gate: Human review of a separately consented recording reference in WITNESS, then a bounded Full Measure read-only proposal. Never auto-award Scripture participation based on a recording or peer claim.