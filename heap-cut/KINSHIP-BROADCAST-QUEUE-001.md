# KINSHIP × RIGHT HANDS — THE ROTATING BROADCAST CARD QUEUE
### HEAP-CUT-001 / KINSHIP-BROADCAST-QUEUE-001 · 2026-10-21 · PROPOSED / NOT STATION-ADOPTED

**Correction of emphasis:** Kinship is proposed not merely as an outlet for occasional calendar notices or retrospective stories, but as a **potential recurring broadcast node of the living card system**. The station's producer could read a periodically refreshed, human-reviewed selection of *currently actionable public-safe needs and offers*; listeners could respond through independently controlled online card doors; the originating stewards would update the cards when capacity changes or needs are met. No broadcast cadence, editorial agreement, public aid service, station adoption or current need is established.

> **The card changes because real life changes. The broadcast announces a recent snapshot. The online door tells you what is true now.**

## 1. What actually crosses

```text
LOCAL ACTOR / RESPONSIBLE STEWARD
creates/updates a consented, time-limited public-safe need or offer
                  |
                  v
SOURCE CARD REGISTRY (locally accountable, not Kinship-owned)
OPEN / PAUSED / FILLED / WITHDRAWN / EXPIRED
                  |
                  | fresh, reviewed projection; no private case file
                  v
KINSHIP CANDIDATE QUEUE (station-owned editorial gate)
HOLD / REVIEW / APPROVE / OMIT
                  |
                  | station chooses *if and when* to read a cut
                  v
RADIO EDITION  (immutable dated/as-of snapshot)
"Here are a few open community cards ... check current status online"
                  |
                  | no automatic OBS/API action
                  v
LISTENER → PUBLIC CARD LANDING PAGE
current status, public-safe summary, safe response form
                  |
                  v
LOCAL STEWARD INBOX
OFFER RECEIVED != OFFER ACCEPTED != SERVICE PROVIDED
                  |
                  | verified owner / recipient action
                  v
CURRENT CARD UPDATE + SCOPED RETURN / CLOSE
                  |
                  v
NEXT POTENTIAL RADIO EDITION (a NEW current snapshot)
```

**Radio is one-to-many; online response is two-way.** The radio audio is not literally live-updating, and an old airing cannot be retroactively edited. A person hearing an earlier broadcast must reach the **stable card ID/current-state page** and see "open", "paused", "filled", "expired" or "withdrawn", with a safe alternative action if the item is no longer accepting responses. A producer re-checks freshness at the intended air slot; older approved editions must not be silently replayed as current.

## 2. Two independent life cycles

### Source card (the originating group owns it)

`DRAFT → OWNER_VERIFIED → OPEN → {PAUSED | FILLED | WITHDRAWN | EXPIRED}`

- **DRAFT:** internal, unpublishable.
- **OWNER_VERIFIED:** accountable person checked accuracy, safety and specific permission to publicize *this abstracted need*.
- **OPEN:** accepting voluntary expressions of help until quantity/deadline changes.
- **PAUSED:** steward suspends new responses (for example while earlier offers are screened).
- **FILLED:** fulfillment separately confirmed by the legitimate recipient/operator; not inferred because someone clicked "I can help".
- **WITHDRAWN:** owner revokes publication; scrub from fresh feeds immediately and update public-safe landing.
- **EXPIRED:** hard deadline reached or owner check is stale; a new revision/reverification is required to reopen.

No card is an emergency dispatch channel; urgent or medical emergencies must use ordinary local services, not a broadcast queue. Sensitive case records and private contact instructions never enter station projection.

### Station edition (Kinship, if it elects to participate, owns it)

`CANDIDATE → HELD / DECLINED / HUMAN_APPROVED → SCHEDULED → HUMAN_CONFIRMED_AIRED → ARCHIVED`

- A source owner approving a card does **not** approve radio publication; station approval is independent.
- An item may enter a queue through a producer-facing read-only projection; import creates no automatic studio content.
- Each on-air edition has an **as-of timestamp**, a checked source revision/hash per card, an editorial decision, and a set of stable card short IDs/URLs; the station chooses cadence and copy.
- Prior to air, a fresh source recheck can make the edition **UNSAFE_TO_AIR** if a card is withdrawn, filled, expired, consent revoked, route broken or owner freshness unknown. A fallback script ("please check the current community card board") is safer than claiming a particular live need.
- A producer's actual witnessed air event is a separate receipt; no software inference from a schedule/playlist.
- If a need changes after air, the public landing must reflect the new status. A later producer may give a correction/update if appropriate, but **a later update does not rewrite the original air**.

**"Whenever" means producer-directed, as available**: e.g. an optional 30-second segment during a station-selected block, a recurring daypart, or a longer community-bulletin slot. No station schedule or airtime is assumed.

## 3. Online response semantics and scarcity

**Never equate responses with fulfilled needs.**

A listener reaches the public card and may submit an offer/interest *to its actual local steward* via a safe response mechanism; steward checks suitability, availability, scope and consent before coordination. An online expression is `OFFER_RECEIVED`, not `ASSIGNED`. Further bounded states: `ACCEPTED_FOR_COORDINATION`, `COMPLETION_REPORTED`, `FULFILLMENT_CONFIRMED / DISPUTED / CLOSED_UNMET`.

For needs with limited quantity, a steward may set `PAUSED` while reviewing offers. Additional responders get "not currently accepting" or a consented alternate, not a private beneficiary address or false confirmation. Do not use private contact info, automated volunteer matching or a public board of identifiable needs.

Where an offer is fulfilled, the source status changes; the next radio edition excludes it unless the station explicitly chooses a separately permissioned retrospective "thank-you" item. A declined/withdrawn offer never becomes a failed person's public reputation.

## 4. Minimum public-safe card envelope (design sketch, not production schema)

```json
{
  "cardId": "EXAMPLE-ONLY-001",
  "revision": 4,
  "sourceSteward": "locally-accountable-organization-not-named-here",
  "kind": "MATERIAL_HELP",
  "category": "food_transport",
  "coarseRegion": "Southern Minnesota",
  "publicSummary": "Help with one authorized nonemergency food pickup",
  "sourceState": "OPEN",
  "lastVerifiedAtUtc": "ILLUSTRATIVE_VALUE",
  "expiresAtUtc": "ILLUSTRATIVE_VALUE",
  "approvedForPublicBoard": false,
  "approvedForRadio": false,
  "publicRoute": "OWNER_APPROVED_ROUTE_PENDING"
}
```

**Suggested smallest digital feature:** public card ID; source revision; category and bounded summary; coarse service area; deadline; public display status; safe steward-approved response path; voluntary consent to online listing **and separately to radio**; independent station review; withdrawal and correction; no beneficiary/donor/household directory.

The existing [KINSHIP-006](https://github.com/the-static-collective/static-live/pull/31) is an experimentally verified signed **public need history → HELD producer candidate** bridge. It is a strong precursor, **not** a live feed, complete registry, authenticated beneficiary proof, website response service or automated scheduler. It accepts nonmoney material needs only and requires human freshness/permission reviews. [KINSHIP-002–005](https://github.com/the-static-collective/static-live/tree/main/examples/kinship-fall-share-room) already model a human-controlled Live Stack and `draft → ready → aired → returned` separation.

## 5. Network map meaning

Keep Kinship in the **optional outer ring**; the grocery still functions independently if Kinship refuses or disappears. Recast its principal edge as:

```
ACTIVE PUBLIC CARDS → STATION-REVIEWED ROTATING EDITION
    → LISTENER ONLINE RESPONSE → LOCAL STEWARD
    → SOURCE CARD REVISION → NEXT EDITION
```

This cycle can include food, nonfinancial material goods, garden-related volunteering, pickup drivers, and community gatherings **only when approved by the appropriate local operator and the station**. Commercial promotions, store inventory/POS and paid advertisements must not be disguised as charitable help notices. The station decides whether any category fits its programming and sponsorship policies.

## 6. First proof: an entirely fictional radio-queue round trip

The companion [kinship-live-queue.html](kinship-live-queue.html) is an **offline, interactive, synthetic demonstration**. It supports a sequence in which fictional cards enter, get a mock edition, receive offers, pause, become fulfilled/withdrawn and yield a different later edition. No outside messages, live needs, local identity collection or broadcast actions occur.

[kinship-broadcast-loop.mjs](kinship-broadcast-loop.mjs) produces **candidate-only** edition reports with hard expiry/freshness/consent/refusal gates. Both the generator and the browser demonstration use hand-provided fixtures, **not real Kinship feed data**. CI tests show that:
- A withdrawn, filled, paused, expired or stale card cannot be read as a currently active opportunity.
- Public-board approval does not imply radio authorization.
- The same card ID can change status without losing history; old snapshots do not rewrite.
- A listener offer is not fulfillment; radio airing is not a delivery receipt.
- A station declining the entire orbit leaves the grocery passport valid.

## 7. Real integration acceptance gates (all currently UNMET)

1. **Grocery/aid source owner** chooses whether any material help cards may be shared; establishes data minimization, service-area definition, a human response coordinator and correction mechanisms.
2. **Kinship editorial/programming authority** opts in, defines policy, approves language, categories, cadence, cutoff and how producers confirm actual air.
3. **Safety/privacy** review distinguishes ordinary non-emergency local coordination from urgent aid, protected people, coercive religious participation, money solicitation, and individual stories.
4. **Data contract and identity** preserve full private need records with the local owner; use a minimal station-facing signed/verified current public projection; establish authentication and revocation behavior before an actual feed.
5. **On-air protocol** sets explicit max card age, pre-air freshness check, response URL/shortcode control, offline fallback, and correction after stale airings.
6. **Field witness** uses one real approved low-risk card, one separately controlled candidate edition, an actual documented station-approved airing (if any), optional real listener response and a distinct steward/recipient confirmation. A nonair/refusal is a valid returned outcome.

**Current state: PROPOSED; no verified live source, consent, station partnership, broadcast cadence, response service, or field outcome.**

**Founding law:** `AUDIO_BROADCAST = DATED_SNAPSHOT`; `ONLINE_CARD = CURRENT_OWNER_STATE`; `RESPONSE != ASSIGNMENT`; `AIR != FULFILLMENT`; `PUBLIC_BOARD_CONSENT != RADIO_CONSENT`.
