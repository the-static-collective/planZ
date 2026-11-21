# THE PACT — live two-player cloud room (v0.4)

THE PACT is a cooperative and competitive **game planner**, not an authority or a universal human-worth scoring system. This folder stores the deployed Supabase Edge source, schema, and an explicit boundary to **Human-Witness** and **Full Measure — World Layer**.

## Live status

- HTTPS application: `https://kbhqacsdvjsstzyplqij.supabase.co/functions/v1/pact-room`
- Backend: Supabase `pantry-gate`, Edge Function `pact-room`, deployed version 4 (2026-11-21).
- Complete source: [edge.ts](edge.ts). The correct community Bible-audio integration is documented in [WITNESS-AUDIO-BRIDGE-001.md](WITNESS-AUDIO-BRIDGE-001.md). Older snapshots are `edge-v03.ts`, `edge-v031.ts`, and `edge-v033.ts`.
- Tables: `public.pact_v1_rooms`, `public.pact_v1_seats`, `public.pact_v1_events`. Additive v0.3 migration extends the accepted event types: `quest.refuse`, `impact.report`, `impact.review`.
- The hosted app uses two independent 256-bit bearer access links in URL fragments (one per player). **Never publish real room tokens, token digests or link fragments**. The server stores hashes only. The HTTP endpoint uses its own bearer check; `verify_jwt=false` is appropriate only because the function does that.
- Server-side admin key remains in server-only environment. Direct Data API access is revoked for `anon` and `authenticated`; RLS is enabled with no public policies.

## v0.3 peer-evidence crossing: Human-Witness semantics (not the WITNESS Bible project)

Reference contracts:

- [Human-Witness](https://github.com/the-static-collective/Human-Witness) owns **bounded human encounter evidence**: exact subject, what was presented, declared capacity/actor, acknowledgement or refusal. It is not a signing authority or legal-validity service.
- [Full Measure](https://github.com/the-static-collective/full-measure-world-layer) owns the **inhabited participation RPG world**, with six measures (Gifts, Quests, Deeds, Seeds, Witness, Harvests). Only its own authorized local participation process can award a Deed/Harvest/Capacity. A PACT review packet does **not** constitute a Jubilee receipt or an independent recipient witness.
- [WITNESS](https://github.com/the-static-collective/WITNESS) is separately the **community audio Bible** project; this integration does not edit it or claim its reading/recording rights or receipt mechanics.

PACT adds an **evidence-bearing human encounter** to each quest:

1. A participant submits a proof note. The server binds the current quest title, owner, criteria, due date, creator, reporter and proof into a SHA-256 `subjectDigest` saved in the append-only submission event.
2. The second player must cite that exact subject digest to choose **observed**, **reviewed**, or **trusted**, and can attach a note. These terms are intentionally distinct; peer-confirmed game XP does not claim independent factual proof.
3. The second player may **refuse**, with an attributed reason retained in the event history. The participant may edit and resubmit. Reopening a completed quest invalidates any active PACT-local impact projection but never deletes historical events.
4. After peer confirmation, the reporter may propose a before/after/beneficiary **consequence claim**; the other player may mark it **reviewed** or **questioned**. These are reports and peer reviews, not confirmed independent benefits.
5. The World tab produces a bounded, copyable **Full Measure review candidate packet** with the source events, subject digest, who reported and reviewed, and explicit `Deeds: 0`, `Harvests: 0`, `Capacity: 0`.

### Digest contract

The server computes `SHA-256(UTF8(JSON.stringify([ ... ])))`, with the exact elements:

```js
[
  "static-collective.pact.subject.v1",
  roomId,
  questId,
  titleAtSubmission,
  ownerAtSubmission,
  notesAtSubmission || "",
  dueAtSubmission || "",
  questCreatorSeat,
  submittingSeat,
  proofNote
]
```

This checks a subject snapshot's **self-consistency**, not source authenticity. A copied JSON packet or recomputed hash is not independently authenticated. Durable provenance would need authenticated signatures, ledger-head proofs or an independently checked server origin. Do not treat the fragment token, digest, or peer click as a universal human identity, a legal attestation or a Full Measure admission.

### Full Measure local admission

An external importer can **review** a PACT packet but must not directly write canonical Full Measure state. A receiver needs independent source/subject verification, authenticated steward, local project and pledge linkage, separate beneficiary confirmation, measurable before/after value, and local human authorization. The importer must preserve refusal, unresolved uncertainty, and the distinction between a reviewed report and an observed outcome.

## v0.4 community WITNESS audio bridge

The [WITNESS community audio Bible](https://github.com/the-static-collective/WITNESS), distinct from Human-Witness, is now connected by **local WITNESS package import, locally verified audio digests, and explicitly shared metadata-only recording references**. The PACT tab does not upload the actual audio. A second seat may self-attest a listen or acknowledge metadata; a link may be withdrawn without altering the canonical WITNESS recording. This contributes review candidates to Full Measure with zero automatic Deeds, Harvests, or Capacity. See [the exact integration boundary](WITNESS-AUDIO-BRIDGE-001.md). Full Measure's separate WITNESS draft lens is [PR #59](https://github.com/the-static-collective/full-measure-world-layer/pull/59).

## Tested, with limits

**Passed live in disposable rooms (deleted after testing):**
- Cloud GET renders the app and private `state` POST recognizes the correct seat.
- Quest creation, submission, server-generated digest, partner confirmation, consequence report and partner consequence review return HTTP 200.
- Self-confirming a pending quest returns HTTP 409.
- Local unit-style checks rejected subject-hash mismatch, premature impact report, and self-review of impact.
- Real room remained at 2 player seats and 0 events after test cleanup.
- UI write handling now waits for the cloud response before clearing quest, stake, or cheer inputs; failed writes are not presented as successes.

**Not fully browser-tested:** The end-to-end phone UI, copied candidate packet, refusal/resubmission UI, and World tab interaction. An automation browser had insufficient credit. Mobile clients should verify the path together before using real stakes. Polling is 15 seconds while the tab is visible; no push notification, offline write queue, photo evidence upload or real-time socket.

There is no money transfer, cannabis transaction, escrow, debt creation, legal witness signature, or automated delivery.

## Recovery

Deploy `edge.ts` under the slug `pact-room` to the same Supabase project using `verify_jwt=false` and keep the server secret in environment only. The Edge source embeds the app HTML to allow recovery without a separate static host. Existing v0.1 locally stored progress is **not migrated automatically**.

