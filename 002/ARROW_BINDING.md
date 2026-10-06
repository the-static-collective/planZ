# PLANZ-002 — ARROW BINDING

ARROW-001 now makes the first two PLANZ-002 transitions explicit:

```text
PlanRecord
  --DERIVE-->
SenseFrame
  --PROPOSE-->
MutationCandidate
```

The historical SENSE-001 candidate object remains unchanged.

The new TransitionReceipt layer binds:
- exact PlanRecord digest;
- exact SenseFrame digest;
- exact MutationCandidate digest;
- operation identity;
- predecessor continuity;
- claims and non-claims.

`unaryMutation(record, senseFrame)` now validates that:
- the SenseFrame belongs to the same PlanRecord;
- the frame exposes the declared recoverability posture;
- PROBE is only emitted from an ambiguous frame.

This closes the close-reading seam where SenseFrame was previously computed but operationally unused.

It does **not** close PLANZ-002's Heart gate.

```text
SENSE BINDING != HEART RETURN
```

The remaining proof is still:

```text
MutationCandidate
→ human ACCEPT / REFUSE
→ owning-project consequence
→ returned receipt
```
