# CIRCULATION-001 — Source-preserving two-receiver planZ return

**Status:** experimental, fixture-only, no owner admission, no Coalition partnership, no Abundent deployment.

This is a **generic extension separate from RELAY-001**. It does not rewrite the historical song compiler, impose a shared person/project identity, or grant authority to a graph edge.

## Native input and independent outputs

1. Receive a `free-graph.packet/v0` packet with **native** Free Graph validation and exact content address.
2. Require exactly one fictional question seed, two distinct named project address nodes, and two separate proposed invitations, one CARE and one CULTURE. The receiving projects are **addresses only**, not asserted collaborators.
3. Compile content-addressed `planz.circulation-offer-set/v0`, with independent opt-in proposals. No actual recipient is contacted.
4. Receive **two explicit simulated fixture replies** keyed to different destinations. Choices are HOLD, DECLINE, or PROPOSE_FURTHER_REVIEW; there is no ACCEPTED/CONFIRMED/PUBLISHED state.
5. Produce a bounded, hashed `planz.circulation-return/v0` return artifact. Source Free Graph packet is not edited, and planZ does not assume authority over recipients.

A companion CANNON branch uses this result to build a **new**, natively validated Free Graph packet recording only that a fictional simulation returned. No source history is overwritten.

## Test command from a workspace with three sibling checkouts

```sh
python CANNON/labs/circulation-001/cannon_seed.py run \
  --seed CANNON/labs/circulation-001/seed.json \
  --free-graph-core free-graph/scripts/fg_core.py --output /tmp/circulation-source.json
python planZ/scripts/circulation001_planz.py run \
  --graph /tmp/circulation-source.json \
  --replies CANNON/labs/circulation-001/replies.json \
  --free-graph-core free-graph/scripts/fg_core.py --output /tmp/circulation-planz.json
```

`verify` instead of `run` cold-checks a preserved output without overwriting it. The CANNON CI also executes the native return step and adversarial tests.

## Boundaries

- Hashes detect drift but do not authenticate human intent, ownership, or the actual identity of a receiver.
- CARE report/confirmation and CULTURE rights are separate, with **neither** present in the fixture.
- No runtime contact with BananaSpork or Static Live. Their labels here are proposed destinations, not executed adapters.
- No transfer of contacts, private field observations, audio, monetary instruments, or real-world need data.
- Candidate for future Abundent inspection only after local tests and an explicit production release decision.

**The source owner retains the source. Each receiver retains its right to accept, refuse, or ignore an invitation.**
