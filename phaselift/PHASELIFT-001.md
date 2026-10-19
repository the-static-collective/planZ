# PHASELIFT-001 — From census to living possibility

Status: **UNMERGED PROTOTYPE / HUMAN REVIEW REQUESTED** (2026-10-19).

## Why this exists

The original planZ question remains: *What did we say we would do, what became of it, and what remains?* A second question has emerged: *What is one honest, bounded crossing we could choose next?*

The proposed rule is **INTEGRITY > CONTINUITY**. An earlier plan has no automatic claim to continuation. Refusal, splitting, composting, or beginning a genuinely new descendant may preserve more integrity than forced continuity.

## Two independent dimensions

**Interpretive phase:** SEED / DISCERN / COMPOSE / ACT / RETURN.

**Attention lane:** NOW / NEXT / HELD / COMPOST / WILD.

These are independent display lenses, not an enforced linear workflow, and not replacements for project-owned dispositions. The same thing can be ACT and HELD. No movement between phase or lane is by itself evidence of execution.

## What exists in this branch

- `inventory.json`: observed open planZ pull requests, with branch identities. An open PR is not merged or adopted.
- `board.json`: three explicitly selected public records with owning source links, provisional phase and attention lane.
- `index.html` + `app.mjs`: standalone mobile-friendly phase board, daily BUILD / CONNECTION / DISCOVERY doors, source inspection and local human-choice export.
- `engine.mjs`: hard validation and SHA-256 receipts for choices. These bind the exact board JSON bytes.
- `engine.test.mjs`: non-admission, source linkage, uniqueness and stable receipt tests.

## One bounded crossing

A human opens a source-linked card, inspects its original evidence, and chooses SELECT_FOR_REVIEW / HOLD_LOCALLY / DECLINE_LOCALLY. The browser downloads a local JSON receipt with the exact board snapshot digest and a receipt digest. No backend receives anything, no GitHub issue is mutated, no source owner has approved work, and no field result has occurred.

This is a **selection demonstration**, not an ARROW-001 TransitionReceipt: the latter has its own proposal and admission contract on an unmerged branch.

## Important limitations

As of this observation, main only held the original README, and 14 other planZ PRs were open. The inventory enumerates them; it does not resolve branch relationships, verify all tests, adjudicate merge readiness, or canonize unmerged code.

Three real public records test divergent gates: independent commerce owner acceptance, local help human co-design, and a quarantined conversation composition experiment. Private records and sensitive client data are not imported.

## Local read-only preview

From the repository root, run `python3 -m http.server 8000` and open `http://localhost:8000/phaselift/`. Or host the static directory in a properly reviewed site; it is **not deployed at abundent.org** by this PR.

Run tests with `node --test phaselift/engine.test.mjs` (Node 20+).

## Follow-up gates

1. Review every unmerged branch against its owning source and decide which artifacts, if any, can be safely composed.
2. Have a human inspect and select one particular; require a separate, recorded owning-project admission before any project-local action.
3. Build a source-refresh mechanism that cannot silently overwrite the human-reviewed projection.
4. Add a Static Workbench / Abundent door only once a real public URL is available and approved.

Neither receipts nor visualization create authority. **SELECTION ≠ EVIDENCE; PROPOSAL ≠ ADMISSION; BRANCH ≠ DEPLOYMENT.**
