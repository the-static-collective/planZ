# HEARTH 001 — community circulation field card

Status: REVIEW / HOLD. Admission: none. This is a proposed, bounded rehearsal, not a deployed gathering system, approved event, funding request, or real-world outcome. Parent CARAVAN Genesis: 537f71e2f850409035e2b453205998df5bd30a4c.

## One small loop

Choose one host-approved gathering and one modest, human-defined result (for example, one willing adult contributor authorizes local playback of a recording and a second participant receives it). The host may instead choose an ordinary non-recorded gathering. No one is required to contribute or disclose anything. Paper is sufficient. Do not make help conditional on participation, recording or publicity.

1. **Before:** Ask the host for the desired outcome, what counts as enough, the responsible steward, permitted equipment and fallback. Keep identifying details on the operator's private paper or local device. Do not enroll anyone automatically.
2. **Prepare:** Use the existing CARAVAN README and FIELD-CARD.txt. First test with invented content, two independently held phones, isolated LAN, WAN disconnected. Confirm load/play, restore, and revocation behavior; record only what is actually observed. If no suitable hardware or permission, use the paper fallback.
3. **Gather:** Keep hospitality separate from media permission. Ask an adult contributor separately about recording, attribution, local listening and any subsequent transmission. Default to no recording and no public share. If local music playback is chosen, use material with the necessary rights; do not infer broadcast rights. No minors or sensitive case data in the pilot.
4. **Offer/receive:** Make a bounded offer; the intended receiver can hold or decline. A helper's report is not the recipient's confirmation. Do not call an unconfirmed result delivered.
5. **Return:** At closing, offer the operator three optional private reflections: what bore fruit, what surprised us, what should survive into tomorrow. Record observation versus self-report versus proposal; keep raw text local. Do not infer consent from reflection. Leave an explicit next action, owner and hold reason. No automatic upload, canon, or publication.
6. **Re-enter:** A second operator should be able to reconstruct the permitted next step from the field card after interruption, without access to the first operator's private narrative. Stop if identity, scope or consent is unclear.

## Field witness (blank until observed)

- Date / operator-held reference:
- Human-defined outcome and evidence criterion:
- Host decision: HOLD / approved locally / refused
- Recording decision: not requested / declined / separately authorized
- Local playback decision and rights basis:
- Offline phone test: NOT RUN / PASS / FAIL
- Handoff: not attempted / offered / refused / received
- Help, if any: proposed / mutually accepted / reported / recipient-confirmed
- Observed failure and fallback:
- Tomorrow's permitted action / owner:
- Private reflection return: not requested / held / locally recorded
- Second-operator restart: NOT RUN / PASS / FAIL

A withdrawal ends the affected permission; already received copies cannot be recalled by software. A refused path is a valid outcome. A blank or ambiguous field stays unknown. No live radio, partner contact, donations, or cloud writes implied.

## Source-owned pieces, no duplicate runtime

- [CARAVAN Genesis #49](https://github.com/the-static-collective/planZ/pull/49), field card at parent commit, blob 463b9833bca34e934c392b3d51ef537f5105a717.
- [Jubilee rehearsal #15](https://github.com/the-static-collective/planZ/pull/15), commit 9f6f1c339109f73c351eff1dcf1ed77187044693. Engine blob 6e171bf12835d6fc5476249959721d05587b9d2b, journey f8a74d693e238896734f104e722073bd0ee08831, three-towns 29fc35d71916712a25958d62935c9e5f9efdfead. These are connector-reported Git blob IDs, not independently hashed bytes in this rehearsal.
- Other local capabilities (outcome definition and optional reviewed reflection) remain independently owned. No new adapter or GRAFT work justified yet.

## Rehearsal receipt

On 2026-11-28 the exact-commit Jubilee engine and fixtures above were read through GitHub and the pure source logic was executed in a JavaScript sandbox, removing ESM export declarations and supplying JSON clone for structuredClone (valid for these JSON fixtures). No Node runtime or hardware was used. The original journey replayed 13 events; one SYNTHETIC_RETURN contained one received music carry and one recipient-confirmed aid. Authority NONE. Nine authored checks passed:

1. Complete circulation and return.
2. Recipient confirmation.
3. Scoped music receipt.
4. Omitted confirmation blocks return.
5. Decline blocks delivery.
6. Wrong recipient cannot confirm.
7. Owner withdrawal before receipt blocks receipt.
8. Identical replay reproduces state.
9. Projection grants no authority.

This is a bounded synthetic check, not independent validation or a new field result. The three-town fixture is not a proposed requirement for a single gathering. Local reproduction: check out the pinned Jubilee commit in a separate worktree, run its existing documented test/rehearsal commands, then compare the nine checks above. No claim that CARAVAN, MOTIF or an optional private reflection writer executed in this run.

## Next actual gate

Use a host-approved, no-recording-by-default bench rehearsal, starting with synthetic audio. One operator tests, a second operator independently restarts or resumes from the card. Preserve negative results. Only after a human chooses the actual outcome and local permissions should any real gathering test proceed. No new capability until a particular missing seam is observed. No merge or deployment requested.
