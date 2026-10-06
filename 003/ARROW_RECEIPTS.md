# ARROW-001 — TRANSITION RECEIPTS

Status: **experimental executable boundary**

The close reading of PLANZ-001 → 002 → 003 exposed a structural fact:

> planZ had increasingly strong state objects, but the arrows between those states were not yet first-class.

ARROW-001 makes the transition itself attributable.

## Law

```text
STATE != TRANSITION
TRANSITION != AUTHORITY
RECEIPT != PERMISSION
INPUT != OUTPUT
DERIVATION != SELECTION
ADMISSION != EXECUTION
EXECUTION != RETURN
RETURN != OWNERSHIP
NORMALIZED WITNESS != ORIGINAL BYTES
```

A TransitionReceipt records:

- exact input identities;
- exact output identities;
- operation identity;
- predecessor transition receipts;
- explicit claims;
- explicit non-claims;
- a separately sourced admission decision when consequence is admitted;
- `receiptAuthority: none`.

The receipt may **witness** external authority.

It cannot manufacture that authority.

## Primitive

```text
INPUT(S)
  ↓
declared operation
  ↓
OUTPUT(S)
  +
claims
  +
non-claims
  +
optional external admission
  +
predecessor receipt IDs
```

Stable receipt identity is derived from canonical semantic content.

A changed input, output, operation, admission, claim, non-claim, or predecessor produces a different receipt ID.

## Why this exists

PLANZ-001 has `PlanRecord`.

PLANZ-002 has `SenseFrame` and `MutationCandidate`.

PLANZ-003 has `InstrumentProposal`, human-play evidence, and completion evidence.

Those objects are useful, but without attributable edges a reader can still be forced to infer how one became another.

ARROW-001 refuses that inference.

## First golden chain

The existing L → U → L witness is now routed through five explicit arrows:

```text
source artifact
  --OBSERVE-->
explicit organ
  --PROPOSE-->
InstrumentProposal
  --ADMIT-->
external human admission
  --PERFORM-->
human-derived artifact
  --RETURN-->
PLANZ completion receipt
```

This does **not** add new human authority after the fact.

The ADMIT arrow points back to the already checked-in source-witness statement recording the human request to run the instrument.

The PERFORM arrow also preserves two different identities for the human-play evidence:

1. the SHA-256 of the original uploaded receipt;
2. the SHA-256 of the normalized JSON witness checked into planZ.

They are deliberately **not** asserted to be byte-identical.

## Remaining limitation

The golden chain still cannot regenerate the MP3 from repository-owned bytes because the result artifact and original source audio are identified by hashes but are not stored in this repository.

Therefore:

```text
CHAIN REPLAY != MEDIA REGENERATION
```

ARROW-001 proves semantic/provenance continuity across the existing witness.

A later renderer/retrieval hardening slice can prove binary regeneration.

## Larger consequence

The target PLANZ organism can now be stated as receiptable transitions:

```text
RECORD
  → SENSE
  → PROPOSE
  → ADMIT
  → PLAY / ACT
  → CONSEQUENCE
  → RECORD
```

The next major proof should use the same primitive to close PLANZ-002's still-open Lung → Heart edge.
