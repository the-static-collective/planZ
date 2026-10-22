# HEAP-CUT-001 — The living neighbor network

**Public-safe research bench / 2026-10-21 / DRAFT · HELD**

This directory holds **one complete-network proposal**—a Waseca community-grocery and neighbor-help question carried across independently operated physical services, printable/digital cards, human-controlled broadcasting, listening-app or website portals, and separately verified returns.

**START HERE:** [The Living Neighbor Network — master planZ shard](../grand-shards/2026-10-21-the-living-neighbor-network-001.md)

## Read the project in layers

| Layer | Document or artifact | Status |
| --- | --- | --- |
| **Whole-network object** | [HEAP-CUT-001](HEAP-CUT-001-WHOLE-GROCERY-NETWORK.md), [passport](network-passport-v0.json), [network map](network-map.html) | Structural proposal; no owner commitments |
| **Broadcast / response loop** | [KINSHIP-BROADCAST-QUEUE-001](KINSHIP-BROADCAST-QUEUE-001.md), [synthetic queue simulator](kinship-live-queue.html) | Offline-only mock card state transitions |
| **Morning-show use** | [KINSHIP-MORNING-BOARD-001](KINSHIP-MORNING-BOARD-001.md) | Candidate host-controlled 20/45/90-second editorial cuts |
| **Portal in station carriers** | [KINSHIP-PORTAL-001](KINSHIP-PORTAL-001.md), [interactive offline website/app preview](kinship-portal-preview.html) | Fictional UI, no web/app deployment or station permission |
| **Independent station overlay** | [Kinship candidate protocol](kinship-candidate-overlay-v0.json), [editorial orbit analysis](KINSHIP-OPTIONAL-EDITORIAL-ORBIT-001.md) | Hypothesis, not station partnership |
| **Reproducible synthetic checks** | [Source-passport tests](inspect-passport.test.mjs), [broadcast tests](kinship-broadcast-loop.test.mjs), [portal tests](kinship-portal.test.mjs) | CI checks structural/fixture behavior only |

## Sequence of human decisions

1. **Hear** from the independent grocery/network organizers what is real, optional, already managed, or unhelpful.
2. **Source** one safe public card through its real authorized steward, with consent, response-route safety, expiry and revocation, if they invite it.
3. **Prepare** only an approved website/current-state door; one online expression of interest is not a task assignment.
4. **Offer** Kinship a fully fictional editorial/portal demonstration only with appropriate invitation; the station owns its program, schedule, website and vendor.
5. **Return** only witnessed independent facts; no radio air, food delivery, consent or partnership can be inferred from the demos.

The owner of a need is not a listener analytics record. A station is not a volunteer dispatcher. A shared card address is not one global permission system.

**Claim ledger:** `network_model: drafted` · `synthetic_demos: implemented` · `local_operator_approval: unknown` · `Kinship_approval: none` · `station_or_app_integration: none` · `real_delivery: not evidenced`.

## Run locally

Open `network-map.html`, `kinship-live-queue.html` or `kinship-portal-preview.html` in a browser. They use fictional data, no server, no app connection, and do not send messages. Run the structural tests from the repository root:

```sh
node --test heap-cut/*.test.mjs
node heap-cut/inspect-passport.mjs
```

These checks establish *structural honesty* and predictable offline behavior, never real-life readiness.

**Law:** The radio is a dated invitation. The page shows current source status. The response belongs to the steward. The return belongs to the people who witnessed it.
