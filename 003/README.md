# PLANZ-003 — REMAINS → INSTRUMENTS

Status: **experimental executable boundary; first real witness complete**

PLANZ-003 asks whether a finished artifact can expose a reusable organ without turning ancestry into authority.

```text
CENSUS
  → SENSES
  → MUTATION CANDIDATES
  → COMPOST
  → ADDRESSABLE ORGANS
  → INSTRUMENT PROPOSALS
  → HUMAN PLAY / SELECTION
  → LOCAL CONSEQUENCE
  → NEW ARTIFACT
  → NEW PROVENANCE
  ↺ planZ
```

## Constitutional posture

```text
FINISHED != DEAD
ARTIFACT != ENDPOINT
EXTRACTION != AUTHORITY
INSTRUMENT != SELECTION
REUSE != REPLACEMENT
ANCESTRY != OWNERSHIP
HISTORY CAN BECOME PLAYABLE
```

planZ does not become the renderer, editor, player, or authority.

It records bounded proposals for organs that other systems may choose to make playable.

## Run

From the repository root:

```bash
node --test 003/tests/instrument-engine.test.mjs
node --test 003/tests/transition-engine.test.mjs
node 003/bin/lul-arrow-chain.mjs
```

## Machine proof

The v0 instrument engine accepts only **explicitly declared organs** from an artifact witness. It does not infer organs merely because a source appears reusable.

Every emitted InstrumentProposal carries:

```text
authority: none
selection: NONE
```

and preserves its source artifact and basis references.

## First real witness

The L → U → L chain now records:

```text
finished source artifact
  → explicit organ
  → deterministic InstrumentProposal
  → separately sourced human ACCEPT
  → captured human play
  → distinct result artifact
  → returned completion receipt
```

Witnesses:

- `003/witnesses/l-to-u-to-l-real-001.json`
- `003/witnesses/l-to-u-to-l-human-play-001.json`
- `003/witnesses/l-to-u-to-l-completion-001.json`

This completes the **first real PLANZ-003 witness**, not every possible destination integration.

## ARROW-001 hardening

[ARROW_RECEIPTS.md](ARROW_RECEIPTS.md) makes each transition in that witness first-class.

Each TransitionReceipt binds exact inputs and outputs to:
- a declared operation;
- predecessor receipt IDs;
- explicit claims and non-claims;
- a separately sourced admission decision where required;
- `receiptAuthority: none`.

The arrow receipt may witness authority. It cannot create it.

Current remaining limitation:

```text
CHAIN REPLAY != MEDIA REGENERATION
```

The source/result media are hash-identified but not stored in this repository.

> **The archive may offer an instrument. Only a living hand can play it.**
