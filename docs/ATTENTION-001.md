# PLANZ → JAR;VIS Attention Index 001

**Status: published editorial snapshot; no direct execution or live organization enrollment.**

The owner-maintained [public attention feed](../public/attention-v1.json) maps a **bounded, explicitly reviewed subset** of open cross-project plans to a source issue, topical tags, exact next *human* gate, and known blockers. **It is not PLANZ-001's full global census.** Unlisted plans remain unlisted, not completed.

JAR;VIS may inspect the exact public raw URL by explicit local operator action, validate the schema, hash its bytes, retain an observed snapshot in its local journal, and perform bounded **read-only topical retrieval**. No incoming visitor question is sent to GitHub; the matching happens locally over the already observed text. It must visibly HOLD on network failure, tampered data, unsupported schema or a missing permission.

The index does not convert GitHub issue status, a plan, or a test into field approval. Neither planZ nor JAR;VIS can authorize sending money, shipping e-waste, transferring participant data, broadcasting, dispatching volunteers or contacting third-party operators.

## Public schema contract
Each `entry` must carry `id`, `title`, `source` (an owned GitHub issue), `region`, `disposition`, `nextGate`, `tags`, `blockedBy`, `related`, `fieldOutcome=NOT_VERIFIED`, `executionAllowed=false`, `thirdPartyApproval=NOT_ESTABLISHED`. These are explicit **editorial claims**, not evidence about the field.

## Steward update procedure
1. Inspect source-owned project issue and current owner-approved facts.
2. Adjust only the published pointer, known blockers, scope and explicitly next *review* gate. No personal details, remittance facts, restaurant owner identities, beneficiary information or precise shelter sites.
3. Run `npm test && npm run validate`; review diff; merge.
4. JAR;VIS operator opts into reading the new feed. Previous observations remain in its append-only local journal; new observations do not silently overwrite history.

The first linked frontier is Waseca/Garden/Neighbor Door ↔ Ghana/Porchlight, with Kinship (Minnesota) and Rock Impact (Nigeria) as **independent, optional**, unapproved media/communications modules.
