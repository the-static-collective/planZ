# planZ MOTIF-021 — Classic STRIPS plans over ALEX research

This branch holds a **real finite classical planner** (`scripts/motif-classical.mjs`) and a **persisted optimal classical plan** (`plans/MOTIF-021-classical.json`) generated from the exact ALEX packet at `the-static-collective/ALEX.2` commit `c697ce69...`.

The input bytes are held under `intake/MOTIF-021/alex-research-packet.json` and verified against original Git blob `71485bd8327bb1bf320d00e0e6e1cee3449365b6`. ALEX inspected five **pinned public source Markdown documents**, not private source custody or any actual third-party witness. Its 12 search hits are bounded discovery leads, not admitted evidence.

The plan uses conventional **uniform-cost Dijkstra graph search** on a finite STRIPS-like action domain with explicit preconditions, add/delete effects and positive integer costs. Two alternative methods for preparing investigation questions exist; the cheaper route is selected by the search rather than handpicked. The stored result contains a replay trace showing every state transition.

**The optimizer plans only. It does not execute external research, owner approval, GRAFT code, deploys, human contact or actual source verification.** No new facts such as `EVIDENCE_ADMITTED`, `DEPLOYED_PRODUCTION`, or `REAL_SOURCE_INDEPENDENCE_ESTABLISHED` may be introduced as domain effects. The cost of not acting is deliberately `UNQUANTIFIED_NOT_TREATED_AS_ZERO`.

Next: hand this source-bound, review-held plan to a separate GRAFT branch as an input for an allowlisted compiled executable *candidate*. Independent source owners must review adoption and effect scopes. No automatic PR merges or deployments.

Reproduce with Node 20+: `node --test test/motif-classical.test.mjs` and `node scripts/motif-classical.mjs`.
