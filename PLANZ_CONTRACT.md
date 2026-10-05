# PLANZ-001 — Global Plan Census

## One-line law

> **Gather every attributable plan. Follow every promised edge. Name what happened. Leave no unclassified future behind.**

PLANZ-001 draws one circle around the Static Collective's planning history:

```text
trace
  → idea
  → design
  → plan
  → implementation
  → witness
  → admission / refusal / hold
  → descendant consequence
  → present disposition
```

The process itself is inside the circle.

planZ does **not** become authority over the plans it indexes. Project-local repositories, commits, receipts, human gates, and constitutive documents remain authoritative for their own state.

## The question

For every attributable plan we can discover:

1. What exactly was proposed?
2. Where is the source evidence?
3. What deliverables or gates were promised?
4. Did implementation begin?
5. Did implementation land?
6. Was it stranded off-main?
7. Was it superseded?
8. Did its body die while its law or capability reincarnated elsewhere?
9. Was it intentionally held or refused?
10. What remains, if anything?
11. What evidence would make the plan complete **as a historical record**, regardless of whether the plan itself should still be built?

## Core distinction

```text
PLAN COMPLETE AS HISTORY
    ≠
PLAN IMPLEMENTED
    ≠
PLAN LANDED
    ≠
PLAN STILL DESIRABLE
```

A planZ record is historically complete when the plan has a provenance-backed present disposition and any remaining edge is explicit.

## Present dispositions

Every discovered plan must eventually receive exactly one current disposition:

- **LANDED** — promised work reached its declared owning surface and the evidence supports that claim.
- **STRANDED** — meaningful implementation exists but is not admitted into the current owning surface.
- **PARTIAL** — some promised work was completed, but material declared completion gates remain.
- **REINCARNATED** — the original carrier died or stalled, but a materially equivalent law/capability continued elsewhere.
- **SUPERSEDED** — a later explicit plan replaced this one.
- **HELD** — intentionally preserved without present execution authority.
- **ABANDONED** — explicitly or evidentially discontinued with no live descendant currently claimed.
- **UNKNOWN** — evidence is insufficient to classify without guessing.

A record may additionally carry historical stage labels such as DESIGN, IMPLEMENTATION_PLAN, IMPLEMENTING, TESTED, or WITNESSED.

## Recovery rule

Never recover merely because something is old and unfinished.

Recovery priority is based on:

```text
remaining unique capability
× present relevance
× recoverability
× evidence quality
÷ divergence / resurrection risk
```

## Source boundary

Raw Git artifacts remain evidence.

planZ stores:
- source references;
- exact SHAs / branch / PR / issue identifiers where available;
- normalized records;
- derived classifications;
- explicit negative-search receipts;
- recovery recommendations.

planZ does not rewrite old project history to make the census cleaner.

## Initial exclusions

The first unfinished-business hunt intentionally excluded:
- `autodiscography-vault`
- `STORYSHIP`

Those exclusions belong to that hunt only. They do **not** imply permanent exclusion from the global census.

## Completion contract for PLANZ-001

PLANZ-001 is complete when:

1. the declared repository scope has been enumerated;
2. every declared plan-bearing carrier class has been searched;
3. every discovered candidate has a stable planZ record;
4. every record points back to source evidence;
5. every record has a current disposition or explicit UNKNOWN;
6. every incomplete live record states what remains;
7. every STRANDED record identifies the recoverable branch/commit and divergence from current authority where measurable;
8. every REINCARNATED record identifies both ancestor and descendant evidence;
9. duplicate plans are linked rather than silently collapsed;
10. intentionally excluded surfaces are named;
11. the census queries and classification rules are reproducible;
12. a final coverage audit finds no uncatalogued candidate in the declared search surfaces.

**Completion does not require implementing every plan.**

It requires that the Collective can finally answer:

> **What futures did we open, and where are they now?**
