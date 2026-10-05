# PLANZ-001 Process

## 0. Freeze the census scope

Record:
- organization / repository set;
- timestamp;
- explicit exclusions;
- inaccessible repositories or surfaces;
- search limitations.

The scope receipt must be preserved before classification begins.

## 1. Enumerate repositories

For every accessible Static Collective repository, capture:
- default branch;
- branch inventory;
- repository age / last activity where available;
- open and closed PRs;
- open and closed issues;
- relevant commit history.

Do not assume `main` contains the full historical organism.

## 2. Gather plan-bearing carriers

Search at minimum:

### Files
- `docs/superpowers/plans/**`
- `plans/**`
- `PLANS/**`
- ROADMAP / TODO / NEXT / STATUS / HANDOFF / DESIGN documents
- project-local implementation plans
- proposal/spec files that contain explicit future execution gates

### Git topology
- `plan/*`
- `design/*`
- `docs/*`
- `feat/*`
- `experiment/*`
- `research/*`
- archive/rescue/reconcile branches when they preserve planned work

### Collaboration surfaces
- open PRs
- closed-unmerged PRs
- merged design-only PRs with later implementation promises
- issues containing acceptance criteria, “next slice,” “implementation,” or named deliverables
- commits whose messages indicate plan/design/proposal/handoff work

A carrier is evidence of a plan candidate, not proof that the plan remains unfinished.

## 3. Normalize each candidate

Create one PlanRecord per distinguishable promise.

Do not collapse:
- design into implementation;
- parent plan into child slice;
- old carrier into later reincarnation;
- duplicate wording into one plan without provenance.

Link them.

## 4. Follow the promised edge

For each candidate, search forward for:
- exact named artifacts;
- planned files / modules;
- implementation branches;
- PR descendants;
- issue closure;
- commit descendants;
- renamed/rephrased capability;
- cross-repository migration;
- reconciliation/re-port branches;
- tests and witness receipts;
- human or project admission gates.

Record negative searches when they materially support “never implemented.”

## 5. Classify the present disposition

Use evidence, not age.

A stale open issue may be LANDED.
A merged design may be ABANDONED.
A closed-unmerged PR may be REINCARNATED.
A green implementation branch may still be STRANDED.

When evidence conflicts, preserve the conflict and use UNKNOWN until resolved.

## 6. Compute the remaining edge

For every non-terminal plan, state the smallest remaining work that would close its declared contract.

Examples:
- “run the already-designed N=1 treatment/control”
- “re-port Tasks 1–5 to current main before implementing Tasks 6–11”
- “implement SB-001; do not extract a standalone service”
- “no runtime exists; begin at Task 1”
- “nothing remains; descendant X satisfied the original capability under a new carrier”

## 7. Separate resurrection from recomposition

Use **resurrection** when the original artifact can be safely continued.

Use **re-port** when an old implementation is materially behind present authority.

Use **recomposition** when only laws/capabilities should survive and the old architecture should not.

Never wholesale-merge a fossil merely because it is complete.

## 8. Produce three views

### Source Ledger
One record per plan candidate, provenance first.

### Present Futures Map
Grouped by disposition and dependency/descendant relation.

### Action Surface
Only plans with a justified remaining edge:
- quick close;
- recover;
- re-port;
- recompose;
- intentionally hold;
- investigate.

## 9. Coverage audit

Before declaring PLANZ-001 complete:

- re-run the carrier searches;
- compare discovered sources against the registry;
- inspect branch-only and closed-unmerged artifacts;
- sample “completed” records for false closure;
- sample “abandoned” records for hidden descendants;
- ensure exclusions and inaccessible surfaces are explicit.

## 10. Delta mode

After the first census, future runs become cheaper.

A delta census asks only:
- what new plan-bearing carriers appeared;
- what recorded plans changed disposition;
- what stranded work moved closer to or farther from current authority;
- what UNKNOWN records gained evidence.

The first run is archaeology.

Later runs are maintenance.
