# FATHERHAND-RESIDUE-001

Date: 2026-10-06

## Historical boundary preserved

HEART-001 reviewed the generated Fatherhand restoration candidate:

`mut-ba2399e2f3d57d8e`

and deliberately returned:

```text
REFUSE
```

That decision remains intact.

The refusal preserved one unresolved residue:

> deterministic Fatherhand grant-chain validator

A later human decision explicitly selected **that residue only** for implementation.

Therefore this is a new chain:

```text
prior REFUSE witness
  ↓ OBSERVE residue
grant-chain-validator residue
  ↓ PROPOSE
bounded organ proposal
  ↓ ADMIT
new human authorization
  ↓ PERFORM
TranchNode PR #79
  ↓ RETURN
new planZ witness
```

not:

```text
REFUSE → secretly become ACCEPT
```

## Owning-project consequence

TranchNode PR:

https://github.com/the-static-collective/tranchnode/pull/79

Exact head:

`cfb7b5009deb16d318c08885ced5a7f4ba2c846b`

Exact CI:

https://github.com/the-static-collective/tranchnode/actions/runs/37478576902

Result:
- **130 / 130 tests pass**;
- deterministic Fatherhand golden receipt replays byte-identically twice.

## Implemented organ

The validator enforces the original transmission laws in a bounded exact-set profile:

- child capability must remain within parent delegable capability;
- child scope must remain within parent delegable scope;
- child grantor must be the parent grantee;
- exact parent seal must remain visible;
- nontransferable, revoked, expired, or already extinguished capacity cannot be revived downstream;
- delegated purpose must expose its parent and may only remain identical, narrow, operationalize, or preserve under ordinary delegation;
- terminal authorization must satisfy exact capability, scope, and governing purpose.

An indeterminate root capacity basis returns `indeterminate`, not manufactured validity.

## Non-claims

No canonical grant-body hashing, cryptographic signature verification, key management, universal scope algebra, or ontology promotion is claimed.

The TranchNode PR remains draft/unmerged.

```text
REFUSAL != ERASURE
RESIDUE != PLAN
NEW ADMISSION != REVERSAL OF PRIOR REFUSAL
```
