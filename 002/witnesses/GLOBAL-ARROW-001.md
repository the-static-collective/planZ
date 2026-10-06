# GLOBAL-ARROW-001 — first receipted PLANZ-002 field

Date: 2026-10-06

## Exact execution

GitHub Actions run:

https://github.com/the-static-collective/planZ/actions/runs/37470402478

Exact branch head:

`28768f8d6c2bca37ea973e0ea8120b7b61c7fb94`

Workflow:

`.github/workflows/arrow-001.yml`

Result: **SUCCESS**

The same exact head also passed:
- SENSE-001 exact witness;
- INSTRUMENT-001 exact witness.

## Inputs

GLOBAL-ARROW-001 intentionally reuses the existing GLOBAL-SENSE-001 field cut:

- seed PlanRecords: **19**
- provisional PlanRecords: **81**
- exact-source-deduped records: **94**

The source-ref dedupe is preserved only to make this witness directly comparable to GLOBAL-SENSE-001.

```text
SOURCE DEDUPE != GENERAL PLAN IDENTITY LAW
```

## Exact arrow result

```json
{
  "dedupedRecordCount": 94,
  "planToSenseTransitions": 94,
  "senseToMutationTransitions": 90,
  "transitionReceiptCount": 184,
  "chainCount": 94,
  "receiptAuthority": "none",
  "selection": "NONE",
  "semanticSha256": "7900482b77c394b2f077c010fd167a0a11354044f0d9ba58d562f0b9a5678893"
}
```

Exact Actions artifact:

`arrow-001-witnesses`

Artifact ID:

`11416381954`

The artifact contains:
- `global-sense-arrows.json`;
- `lul-arrow-chain.json`.

## Meaning

Every record in the current SENSE field now has an explicit deterministic transition:

```text
PlanRecord
  --DERIVE-->
SenseFrame
```

Every record that emits a unary MutationCandidate additionally has:

```text
SenseFrame
  --PROPOSE-->
MutationCandidate
```

The PROPOSE receipt binds the exact:
- PlanRecord digest;
- SenseFrame digest;
- MutationCandidate digest;
- predecessor DERIVE receipt.

A downstream receipt cannot claim continuity merely by naming a predecessor. It must consume at least one exact output ref from that predecessor.

## SenseFrame seam repaired

Before ARROW-001, `unaryMutation(record, senseFrame)` accepted a SenseFrame argument but did not use it.

It now refuses:
- a SenseFrame belonging to another PlanRecord;
- a frame that contradicts the PlanRecord's declared recoverability posture;
- PROBE from a non-ambiguous frame.

The existing valid candidate semantics and candidate IDs remain unchanged.

## Constitutional posture

```text
RECORD != SENSE
SENSE != CANDIDATE
CANDIDATE != SELECTION
TRANSITION != AUTHORITY
RECEIPT != PERMISSION

receiptAuthority: none
selection: NONE
```

## Remaining Heart gate

GLOBAL-ARROW-001 proves the first two arrows.

It does **not** close PLANZ-002.

The remaining proof is still:

```text
MutationCandidate
→ explicit human ACCEPT / REFUSE
→ owning-project admission
→ actual project consequence
→ returned Heart receipt
```

> **The arrow is now attributable. The Heart is still external.**
