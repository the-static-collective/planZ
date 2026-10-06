# ARROW-001 — TRANSITION RECEIPTS

Status: **experimental repo-level executable boundary**

ARROW-001 makes the transition itself attributable.

It is not owned by PLANZ-003. PLANZ-003 supplies the first golden consumer.

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

A downstream receipt must consume at least one output ref from its declared predecessor(s).

```text
ADJACENCY != CONTINUITY
```

## Transition kinds

```text
OBSERVE
DERIVE
PROPOSE
ADMIT
REFUSE
HOLD
PERFORM
RETURN
```

Admission law:

```text
ADMIT  → ACCEPT + external authorityRef
REFUSE → REFUSE + external authorityRef
HOLD   → HOLD + external authorityRef
all other transitions → NONE
```

## First golden consumer — PLANZ-003 L → U → L

The existing real witness is routed through:

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

The exact checked-in chain is:

`003/witnesses/l-to-u-to-l-arrow-chain-001.json`

The PERFORM arrow preserves two distinct human-play identities:
1. the SHA-256 of the original uploaded receipt;
2. the SHA-256 of the normalized JSON witness checked into planZ.

They are deliberately not asserted byte-identical.

## Remaining limitation

```text
CHAIN REPLAY != MEDIA REGENERATION
```

The source/result media are hash-identified but not stored in this repository.

ARROW-001 proves semantic/provenance continuity across the existing witness.

## Larger target

```text
RECORD
  → SENSE
  → PROPOSE
  → ADMIT
  → PLAY / ACT
  → CONSEQUENCE
  → RECORD
```

PLANZ-002 is the next consumer: bind `PlanRecord → SenseFrame → MutationCandidate`, then use the same primitive for the still-open Lung → Heart return.
