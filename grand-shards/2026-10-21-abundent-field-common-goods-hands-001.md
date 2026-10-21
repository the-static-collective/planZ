# GRAND PLAN SHARD 001 — ABUNDENT FIELD / COMMON GOODS, LOCAL HANDS

**Date:** 2026-10-21
**Owner for this shard:** planZ — recovery, provenance and bounded coordination only
**Proposed implementation home:** `the-static-collective/webZ` as a reviewable `/field/` sidecar; deployment requires the actual Abundent site's owner
**Status:** PROPOSED / HELD FOR HUMAN REVIEW
**Field window:** Oct 24 Greater Mankato Coalition of Care → Oct 25 Waseca Community Grocery planning → Oct 26 Real Life worship-team coffee
**Note:** The third meeting is primarily about music. No church partnership, co-op endorsement, Coalition mandate, volunteer assignment, food handling, or public service is implied.

## The particular

Two independent, user-provided paper designs are already prepared:

- `Coalition_of_Care_Room_Deck_v0.1.pdf` — `THE ROOM IS A DECK`, POSTYMON × REALITY.2, nine capacities + nine quests and optional return path. Saturday's instrument.
- `Waseca_Right_Hands_Field_Deck_001.pdf` — `THE RIGHT HANDS GAME`, eight local-food-capacity cards + eight bounded questions and anonymous return slips. Sunday's discussion instrument.

A Waseca Community Grocery Planning Event registration confirmation records **Sun Oct 25, 2026, 2–4 PM at The Mill, 310 2nd Ave SW, Waseca**. This is an exploration of a proposed cooperative grocery, not a launched grocery or existing partnership.

**Proposition:** Give every approved public card a reproducible digital door and a physical printable carrier. People can discover a question, take it offline, share it, propose a descendant, and optionally bring back a bounded insight. Abundent is the **node of return, not the node of control**.

## The offer, in ordinary language

> I am exploring practical ways for local producers, neighbors and organizations to discover their existing capacities, coordinate one bounded food-related question, and carry a useful result to the right decision-maker. These cards are invitations to investigate, not work orders. The digital site can preserve the public question and enable reprinting; it does not own the resulting relationship.

## The composed architecture (do not collapse source authority)

| Independent source | Verified material | Reusable insight | Boundary |
|---|---|---|---|
| [REALITY.2 Little Yes card grammar](https://github.com/the-static-collective/national-treasure/blob/main/threads/REALITY2-LITTLE-YES-CARD-GRAMMAR.md) | Merged formation document; proto-rules, not a finished game | Particular → relation → descendant card; offline-first; card face ≠ card worldline | Play never rewrites real-world occurrences |
| [REALITY.2 × postEmahh'n crossing membrane PR #82](https://github.com/the-static-collective/national-treasure/pull/82) | Open, noncanonical design | Software may print recognizable cards; each destination locally receives, holds, admits/refuses, receipts | Not an implemented scanner/admission ledger |
| [STATIC FIELD living deck experiment](https://github.com/the-static-collective/static-field/tree/experiment/postemahhn-living-deck-001/experiments/postemahhn-living-deck-001) | Experimental local browser composer + portable proposal exports | Composition, file-based handoff, separate source and destination verification | Fixture cards and browser previews are not source-issued POSTYMON identities |
| [planZ Jubilee Field Kit PR #16](https://github.com/the-static-collective/planZ/pull/16) | Experimental branch with offline notebook, scoped PRINT/INTRODUCE, withdrawal, encrypted backup | Manual field mechanics and privacy gate patterns | No public, authenticated multiuser service; no verified physical outcomes |
| [Derek Derrick Dark](https://github.com/the-static-collective/DerekDerrikDark) | Executable world cuts, receipts and integrity checks; candidate compile-from-within | Printed revision as bounded world cut; evidence/interpretation separation; leave without penalty | DDD is not itself Abundent's card backend |
| [webZ](https://github.com/the-static-collective/webZ) | Existing independent site code and experimental site variants | Host an additive and deploy-independent field door | Do not assume webZ `main` matches deployed abundent.org: prior release work reports a separate deployed garden tree |

**Important distinction:** POSTYMON, PostEmahh'n and REALITY.2 may interoperate by explicit adapters; their identifiers, source ownership, and authority are not automatically interchangeable.

## Surface A — the paper game

Coalition: discover who or what could help. Grocery: discover the specific unanswered supplier / storage / route / governance / access questions. A respectful refusal, a valid referral or a clearer question already counts as a return. No one is enrolled by holding a card.

## Surface B — Abundent Field 001 / the smallest byte

One independently reviewable, static, account-free `/field/` sidecar:

1. Browse a **small, openly declared seed set** drawn faithfully from the two decks. Each seed gets a stable publicly routable ID and printable QR to its public card door.
2. Read the source deck title, exact bounded question, role/category and proper **independent prototype / not co-op authorized** notice.
3. Print one card or a 4-up/9-up sheet. Verify on US Letter, ordinary printer, phone viewport; avoid print-only external QR services.
4. Propose a descendant card in the browser **without uploading it**. Give it a new local identity and reference its parent. Download a portable proposal/return JSON with provenance and `UNREVIEWED` status.
5. Open/print a portable draft by encoded share fragment if practical, while explicitly labeling it an **unpublished draft**, not a permanently hosted identity. A visible printable URL or QR alone cannot constitute publication.
6. Run entirely static. No accounts, analytics, external scripts, public message board, real names, real helper assignment, payments or organizational endorsements.
7. Build deterministic tests for seed uniqueness, draft validation, escaped output, proposal/receipt boundaries and print-link construction.

**Explicitly not in this byte:** public write API; multiuser synchronized graph; completed-service claims; donation acceptance; co-op membership/equity ledger; supply-chain inventory/POS; live aid intake; real identity or consent verification; location tracking; any automatically deployed production change.

## Three different ledgers, never silently merged

1. **Commercial co-op**: goods, inventory, retail orders, pricing, purchasing, money and accounting — the co-op's chosen operating systems and authorized staff.
2. **Aid and gifts**: separately authorized donations, privacy, safeguarding, nonprofit accounting, recipient choice.
3. **Public questions and voluntary coordination**: abstract capacities, bounded offers, introductions and confirmation status — only as consented and steward-reviewed.

PENNY can inform lane three. It is not currency, co-op equity, an automatic donation receipt, or proof of labor.

## Card envelope (candidate; local draft is not a public record)

```json
{
  "schema": "abundent.field-card/v0.1",
  "id": "waseca-p01",
  "kind": "POSTYMON",
  "title": "THE GROWER",
  "question": "What would a small grocery need to know before buying directly from local producers?",
  "origin": { "deck": "Waseca Right Hands Field Deck 001", "card": "P01" },
  "parent": null,
  "state": "SEED",
  "publication": "REVIEWED_SEED_ONLY"
}
```

A local descendant has separate `DRAFT` state and no claim of server persistence. Digital identity describes a card **type**; a physical printed copy may acquire a distinct unobserved history. Scans do not establish custody, creator identity, participation, approval, completed delivery or new membership.

## The crossing / return grammar

```text
NOTICE -> HOLD -> ASK -> OPTIONAL PROPOSE -> LOCAL REVIEW
       -> (DECLINE | DEFER | ADMIT) -> OPTIONAL ACT -> REPORT -> INDEPENDENT CONFIRM
```

Only actual authorised parties can admit real-life work, distribute food, or confirm delivery. No silent promotion from click / scan / print / request / report to independent witness. `RETURN` may simply be “I learned what to ask next.”

## This weekend's three acts

- **Sat Oct 24, Coalition:** bring the `Room Is A Deck` and an approved URL/demo if ready; gather voluntary *questions*, not people's contact details. Find real co-op-adjacent capacity and identify proper introduction paths.
- **Sun Oct 25, Waseca:** arrive primarily to listen; share one producer → storage → route → shelf supply-chain sketch and **Right Hands Game** only with organizer consent. Ask which priority and steward could evaluate a 10-minute synthetic demonstration; no claim of partnership.
- **Mon Oct 26, coffee:** worship conversation first. Any community/service connector is a separate opt-in introduction through church leadership, not an implied assignment to Ashley or Real Life.

## Proof gate sequence

**B0 — runnable local byte:** seed browse, QR print, draft and return export, repeatable automated tests. No production deploy claimed.

**B1 — public readonly door:** site owner reviews security/accessibility/data, confirms actual deployed garden source, approves deployment; live routes and QR are smoke-tested on multiple phones. Preserve existing 11-dial/composer/week paths.

**B2 — steward review:** named accountable steward + organizational permission; moderated public submissions, reject sensitive/identifying material, withdrawal and abuse response. No collection of private household details.

**B3 — field use:** one paper-first **fictional** demonstration. Real logistics require authorized food-safety, insurance, supplier and operational controls.

**B4 — verified physical pilot:** co-op/partner separately approves one bounded real workflow, clear costs/decision maker/recipient confirmation. Independent receipt; measurable impact; stop/rollback.

## Risks, mitigations and kill gates

- **Site mismatch:** `webZ/main` may not be deployed Abundent. Keep sidecar isolated; do not rewrite root or deploy before source alignment.
- **QR mismatch:** long unreviewed drafts can yield dense QR. Bound payload; print and scan-test. Never make unpublished draft look like public permanent card.
- **Consent/reidentification:** no direct public personal data or public registry of farmers/households. Human-only approvals for introductions.
- **False affiliation:** independent prototype footer and unambiguous no co-op/Coalition/church authority.
- **Cargo cult platform:** ask whether existing co-op tool solves the problem first; stop if duplicate/irrelevant.
- **Wasteful expansion:** freeze feature count until at least one organizer identifies an actual need.
- **Public write abuse:** B0 has no public write API.
- **Print failure:** paper PDF handoff, plain text URL, and manual question remain usable.

## Minimal acceptance receipts

- B0: run tests; two seed families browsable; scan/print on a phone and print a new question marked DRAFT; round-trip return/proposal JSON through a local file.
- B1: verified public URL, owner-reviewed target commit, no regression to existing site.
- B3: human records exact organizer feedback (approved / held / refused / unclear) without inventing participation.
- B4: independently acknowledged physical outcome or an honest unresolved/declined result.

## Source roads / return addresses

- Physical seed cards: the two 2026-10-21 PDFs, provided in conversation (not copied into public repositories).
- Implementation PR: [webZ Abundent Field Byte 001 PR #66](https://github.com/the-static-collective/webZ/pull/66), experimental review branch only, not deployed.
- planZ shard location: `grand-shards/2026-10-21-abundent-field-common-goods-hands-001.md`.
- Recovery rule: planZ records this proposal, its source roads and later disposition; source owners determine actual admission. **PLAN != BUILD; BUILD != DEPLOY; SCAN != CONSENT; PROPOSAL != ADMISSION.**

## Reconciliation descendant · October 21, 2026

- **Verified deployed source:** `webZ` `release/needs-001-abundent-live` commit `65539f065db609c97e5c3ca1ca0b2d0f90c7498a`, Vercel `abundent.org` project `webz-field-porch`, production deployment `dpl_8pyC6dqZpWdbvGjDwDh5WirmzJsj`.
- **Implementation review:** [webZ PR #67 — FIELD CARDS RECONCILIATION](https://github.com/the-static-collective/webZ/pull/67) grafts the portable-card byte onto the **actual garden release** rather than `webZ/main`.
- **Identity collision avoided:** the existing `/field/` is an 11-world source-observation catalog; the cards correctly live at `/field/cards/`. The original garden home now offers a direct card-door link. The original cards PR #66 remains an experimental source branch, not the deployment base.
- **Integrity:** new public assets are included in the commit-bound release allowlist, the existing garden SW is regenerated for the one new navigation link, and the card maker keeps its own nested SW scope. No public sharing backend or organizational endorsement.
- **Preview:** a Vercel **preview deployment** was created from the reconciliation branch; this is not a production promotion. The original production commit/domain alias remain unchanged.
- **Open physical gates:** actual mobile/physical QR scan test; line-for-line comparison of the 34 provisional card descriptions against the user-provided original PDFs; host/organizer permission and any later publication moderation.
