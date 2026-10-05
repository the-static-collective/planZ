# UNFINISHED-BUSINESS-001

Date: 2026-10-05

## Purpose

Preserve the first deep Git archaeology pass that led to PLANZ-001.

This hunt asked:

> Which plans did the Static Collective actually write down but never fully follow through on?

Initial exclusions:
- autodiscography-vault
- STORYSHIP

The hunt searched beyond current default branches into branch inventories, open and closed PRs, issues, implementation plans, and descendant work.

## Primary findings

### TranchNode Room 001
Disposition: **STRANDED / near-current**

Evidence:
- PR #67: https://github.com/the-static-collective/tranchnode/pull/67
- branch: `feature/inhabitable-room-contract-v0`
- 19 commits, 17 changed files
- branch observed only 2 commits behind then-current TranchNode main during the hunt

Substantial runtime/test work exists. The original plan's final fresh-context treatment/control and reconciliation/admission work were not found.

Recovery mode: **RESURRECT**, subject to fresh current-head verification.

### ALEX BOOKROOM-001
Disposition: **STRANDED / partial**

Evidence:
- PR #16: https://github.com/the-static-collective/ALEX.2/pull/16
- branch: `feat/bookroom-001-gate4-runtime`
- approved 11-task implementation plan
- Tasks 1–5 materially implemented off-main
- Tasks 6–11 absent from the stranded branch and current main during the hunt
- branch observed 22 commits ahead / 213 behind then-current main

Remaining planned families:
- Book Cuts + bounded context
- rebuildable Novelist projection
- dossier + offline replay
- Gate-3 service/CLI
- blind Book Room profile
- real-book live witness

Recovery mode: **REPORT** — re-port proven pieces onto present authority before continuing.

### Awareness Organ v0.1
Disposition: **STRANDED / substantially implemented**

Evidence:
- PR #26: https://github.com/the-static-collective/What-is-the-static-collective-/pull/26
- branch: `docs/awareness-world-cut-001`
- 27 commits, 24 files, 3,031 additions
- deterministic read-only observer + World Cuts + tests
- PR reports 40/40 locally available Awareness tests passing
- observed 27 commits ahead / 178 behind then-current main

Recovery mode: **REPORT / RECOMPOSE** — preserve laws/tests, re-evaluate implementation against current world.

### Haunted Polaroid first living-camera proof
Disposition: **IMPLEMENTATION_PLAN / unstarted**

Evidence:
- PR #4: https://github.com/the-static-collective/the-haunted-pol-ish-roids/pull/4
- branch: `plan/haunted-polaroid-first-proof`
- one 1,114-line implementation-plan commit
- no corresponding SourceWitness / KEEP loop / living-camera runtime found during the hunt
- observed only 1 commit behind current main

Recovery mode: **RESURRECT**.

### Durable Primitive v0
Disposition: **IMPLEMENTATION_PLAN / unstarted**

Evidence:
- plan: https://github.com/the-static-collective/the-daily-slice/blob/main/docs/superpowers/plans/2026-08-24-durable-primitive-v0.md
- promised DPR receipt family and durable-primitives surface
- searches for named DPR artifacts found only the plan during the hunt

Recovery mode: **RECOMPOSE** using the stronger later receipt/verification ecosystem.

### jublEchat Causal Explanation v0
Disposition: **PARTIAL / bypassed seam**

Evidence:
- issue #7: https://github.com/the-static-collective/jublEchat/issues/7
- proposed pure `deriveWhyCurrent(...)` and Still Alive projection extraction
- no matching implementation found during the hunt

Recovery mode: **RESURRECT**; likely small.

### SupaBardo / Crossing Field SB-001
Disposition: **DESIGN / unimplemented**

Evidence:
- Human Witness spec: `docs/superpowers/specs/2026-08-25-supabardo-crossing-field-design.md`
- explicit Stage-1 SB-001 ceremony and adversarial matrix
- no Stage-1 implementation found

Recovery mode: **RESURRECT**, bounded exactly to SB-001 before any extraction.

### Ephemeral Task Agents v0.1
Disposition: **DESIGN / unimplemented runtime**

Evidence:
- merged Band Runtime architecture
- development nickname: Meeseeks
- explicit lifecycle vocabulary and 12 executable acceptance tests
- no matching runtime event vocabulary / implementation found during the hunt

Recovery mode: **RECOMPOSE or RESURRECT** after checking current agent/execution machinery.

### TranchNode × Autodisco First-Listen Honeycomb Radio
Disposition: **REINCARNATED / incomplete organ migration**

Evidence:
- closed-unmerged TranchNode PR #10
- branch: `radio-honeycomb-integration`
- later Autodisco work implemented first-encounter / look-twice / audio-window / broadcast-assembly descendants
- no HoneycombCallerReceipt / Archivist / full TranchNode traversal-writeback implementation found during the hunt

Recovery mode: **RECOMPOSE**. Do not restore the old architecture wholesale.

### Nourish Kids food + free-book packets
Disposition: **ABANDONED or UNKNOWN pending broader non-Git evidence**

Evidence:
- BananaSpork PR #2
- branch: `nourish-kids-book-packets`
- proposed first physical run of 25–50 packets
- no later matching packet implementation found in BananaSpork or Nourish-Kids during the Git hunt

Recovery mode: **INVESTIGATE** before revival.

### Fatherhand
Disposition: **REINCARNATED / original body not adopted**

Evidence:
- TranchNode PR #12
- branch: `design/fatherhand-purpose-witness`
- original Fatherhand design never landed intact
- later TranchNode surfaces preserve Covenant Circuit / Projection Covenant descendants

Recovery mode: **RECOMPOSE missing organs only**.

### BoundaryMetadata
Disposition: **REINCARNATED**

Evidence:
- Collective notebook PR #18
- five-field conceptual contract: destination / relation / reachability / provenance / relevance
- no executable schema found
- the same five-field grammar later became part of Front Room orientation law

Recovery mode: **NONE unless executable metadata becomes independently useful**.

## Archaeological lesson

The dominant failure mode was not simple forgetting.

It was:

```text
idea
→ design
→ plan
→ sometimes code
→ sometimes green tests
→ no final admission / reconciliation
→ main keeps moving
→ descendants rediscover pieces
```

That observation directly motivated PLANZ-001.
