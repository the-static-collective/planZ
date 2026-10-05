# SENSE-001 Verification — Seed Ride 001

Date: 2026-10-05

## Exact source

Branch: `feat/census-senses-mutation-002`

Initial exact-head test attempt exposed an import-path defect in:

`002/tests/senses-engine.test.mjs`

The test imported:

`../002/src/senses-engine.mjs`

from inside `002/tests/`, producing the nonexistent path `002/002/src/senses-engine.mjs`.

The defect was corrected in commit:

`4b98428fc1bdd3821dbd081fa5f4011252974163`

to:

`../src/senses-engine.mjs`

## Constitutional test result

Command:

```bash
node --test 002/tests/senses-engine.test.mjs
```

Observed:

```text
tests 6
pass 6
fail 0
```

Covered:
- GAP + STRANDING derive without authority;
- declared recovery posture maps to a bounded Maxhinal;
- CROSS refuses without an explicit hinge;
- CROSS with an explicit hinge preserves both ancestries;
- PRESSURE remains non-promoting;
- semantic output is deterministic.

## Seed census run

Command:

```bash
node 002/bin/sense-census.mjs registry/seed-plan-records.jsonl
```

Input records: **4**

Observed unary mutation chambers:

- `PLZ-TRANCH-ROOM-001` → **REANIMATE**
- `PLZ-ALEX-BOOKROOM-001` → **RECONSTITUTE**
- `PLZ-HUMAN-SUPABARDO-001` → **REANIMATE**
- `PLZ-DAILY-DURABLE-PRIMITIVE-001` → **GRAFT**

No source record carried an explicit composition relation, so every SenseFrame returned:

```text
compositionPressure.present = false
```

This is a desired result. The engine did not manufacture a relation from vocabulary or proximity.

Raw CLI output SHA-256 from the local verification run:

`9a7eb455a8f32565e0090f53164b686438019faa5523342e550a5534cf1f363e`

## First mutation ride

Ride: `SENSE-001-SEED-001`

The ride preserves:
- four SenseFrames;
- four unary mutation candidates;
- one PRESSURE descendant for each candidate;
- one deliberate CROSS refusal between Room 001 and BOOKROOM because no explicit hinge was supplied;
- `humanDisposition: UNREVIEWED`;
- `authority: none`;
- `selection: NONE`.

Semantic ride digest:

`6b385f729797f978c2395ec1b272c089eb56ee8c1151f1317801fe98186b0286`

Local serialized ride-file SHA-256 during verification:

`8e9c6589566ff21cd72a805784e1c1a3cf6de6d3455c5df84a830183820defa8`

## What this proves

SENSE-001 has earned only the following bounded claim:

> One exact census cut can deterministically produce provenance-bound senses, bounded unary mutation candidates, pressure questions, and an explicit no-hinge composition refusal without selecting or authorizing a future.

It does **not** prove:
- PLANZ-001 coverage is complete;
- any mutation candidate should be implemented;
- any two plans should cross;
- project-local authority;
- a Heart-return witness.

The first ride remains intentionally **UNREVIEWED**.
