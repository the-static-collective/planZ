# KINSHIP-PORTAL-001 — A neighbor board inside the listening experience

**HEAP-CUT-001 proposed integration / 2026-10-21**
**Status: DRAFT · HELD · zero station adoption, deployment, or listener data.**

> **Radio carries the invitation. A portal carries the current state. The originating neighbor organization owns the response and verifies the return.**

## The particular

A listener hears an optional human-edited Kinship morning-show "Right Hands" card mention. They open **Neighbors / Right Hands** from Kinship's *website* or *radio app*, see a short list of currently open, consented, public-safe needs/offers, and choose **I might be able to help**. The potential offer reaches the **actual local steward**, not Kinship's announcers. The steward alone determines coordination, pauses the item when appropriate, and later records independently confirmed outcomes. Future station bulletins draw from **fresh editor-reviewed versions**, not stale audio.

The portal is a station-optional face of the card network, **not** a Kinship charity intake, donor tool, shop POS, or emergency hotline. No food, assistance, membership or broadcast depends on faith participation or a station account.

## Verified external product context / not a capability promise

1. The station's [website](https://kinshipradio.org/main/) prominently advertises its official Android/iOS listening app and also has a community calendar.
2. The Apple App Store [identifies Kinship Radio's app developer as Invubu Solutions LLC](https://apps.apple.com/us/app/kinship-radio/id708391233).
3. [Invubu's mobile app features](https://www.invubu.com/solutions/mobile_phones.html) describe **Web View (custom website page), configurable bottom-menu items, and external website links**. Invubu lists Kinship Radio as a live app example.
4. **Not established:** That Kinship's current contracted app configuration has enabled such a tab; native deep links, embedded web navigation, background audio continuity when opening Web View, push notifications, API permissions or edit rights. Those must be confirmed with Kinship/Invubu and tested on actual iOS/Android builds.
5. No reason to touch the station's app for phase one: a public, owner-approved HTTPS URL accessible from an ordinary browser is the conservative first door.

## Proposed information architecture (one portal, multiple carriers)

```
               SOURCE-OWNED CARD SYSTEM
      local grocery / common table / garden / aid stewards
           private records, permission, human checks
                         |
               REDACTED PUBLIC SNAPSHOT
          card ID, status, category, coarse area,
            reviewed time, expiry, safe response path
                         |
             PUBLIC NEIGHBOR BOARD PAGE
                         |
           ┌─────────────┼────────────────┐
           |             |                |
       Kinship website  Kinship app    radio speech
       link or approved vendor        "check the board"
       embed            Web View/link   (no auto air)
           |             |                |
           └─────────────┴────────────────┘
                         |
              Listener opens current card
                         |
                 SAFE SOURCE INBOX
                         |
           LOCAL STEWARD REVIEWS / COORDINATES
                         |
               RESPONSE / RETURN / CORRECTION
                         |
                    NEW SNAPSHOT
```

The website and app **must read the same canonical current public state**. Kinship editors also receive a *separate* reviewed producer packet; online board eligibility is NOT approval for broadcast.

## Three surfaces / three authority modes

### A · Website visitor

- A familiar "From the morning show" entry point. Current opportunities, categorical filters and clear **as-of** timestamps.
- Buttons: **See the card**, **I might help** (real release goes to a steward-approved contact form, not a generic public wall), **Share this public card**, **Ask a question** (only if supported by steward capacity).
- Each item has an unchanging public ID and a *changing* status. A previously announced card may display FILLED / PAUSED / WITHDRAWN / EXPIRED.
- Never publish private household details, exact pickup addresses, beneficiary identities, prayer records, payment links or unmoderated requests.

### B · Kinship listening-app visitor

- Same URL, touch-first layout with a possible station-authorized tab "Neighbors" or "Right Hands".
- Use vendor-supported external link or custom Web View **only if Kinship/Invubu confirms eligibility**. No claims that it is already supported in the deployed app.
- Returning to the live audio player must remain intuitive; continuity of stream under Web View requires actual platform testing. Never assume a push notification or custom deep-link API.
- Reading the board does not enroll anyone in church, volunteer programs, radio campaigns or donation funnels.

### C · Morning show producer

- A very small **read-only candidate queue**, sourced from source-owner-approved online cards and rechecked near any proposed air date.
- 20-, 45- and 90-second *candidate* wording. Producer decides whether to prepare, omit or air; may use the on-air fallback instead.
- Last minute revocation, filled/paused needs, expiry or broken landing page => **do not announce as open**.
- Airing is its own dated occurrence receipt, not automatically inferred from scheduling or previewing the packet.

## The truthful action semantics

```
OPEN → LISTENER INTEREST → STEWARD REVIEW → OPTIONAL ACCEPTANCE
      → REPORT → INDEPENDENT CONFIRM / DISPUTE → CLOSED / RETURN
```

The portal may *immediately* move a card to PAUSED if the steward's configured capacity threshold or manual action so dictates, but only in a **real authenticated owner system**; no demo is proof that such a service exists. An interest button never promises assignment, transport, aid or success.

## Integration stages

| Phase | Destination | What is really delivered | Owner and gate |
| --- | --- | --- | --- |
| **P0 (in this PR)** | planZ preview | One fictional offline browser demo with website/app views and producer-only candidate copy; no network | Collective can propose, no station role |
| **P1 (only with owner invitation)** | standalone public HTTPS link | Steward-reviewed static current-status board, with direct owner-safe response pathway; no live personal submissions | Card owners, hosting operator and data/privacy review |
| **P2** | Kinship website | Station-controlled button/link or carefully sandboxed embed to source-approved public board | Kinship site administrator and source owners |
| **P3** | Kinship mobile app | Invubu-approved menu link or Web View to the same mobile URL, if contracted/configurable | Kinship + Invubu; test audio/nav/accessibility |
| **P4** | Producer console | Separate dated, fresh, editorial candidate queue | Kinship producers/station editorial authority |
| **P5** | Field witnessing | Independent listener offer + actual local steward handling + recipient verification; optional station air receipt | Each responsible real-world actor |

All stages are optional. P1 may work without Kinship, P2 without P3, and the grocery continues without radio.

## P0 offline interface

[kinship-portal-preview.html](kinship-portal-preview.html) depicts the core loop with **fictional data only**: current card states, a "heard on the radio" card, a mock response that pauses one selected need, closing a simulated case, reset, a website/app layout switch and a mock producer candidate script. It uses no fetch/network, storage, real forms, accounts, app SDK or actual station service. Export deliberately excluded to avoid mixing demo and actual data.

This lets a prospective producer or station manager answer a concrete question: **"Would you ever want a guest portal like this inside your website or listening app, without having to operate the underlying grocery network?"** Not a request to install anything or modify station-owned properties.

## The non-negotiables

`PORTAL_VIEW != STATION_ENDORSEMENT`  
`APP_WEBVIEW_CAPABILITY != DEPLOYED_APP_CONFIGURATION`  
`PUBLIC_CARD != RADIO_APPROVAL`  
`ONLINE_INTEREST != LOCAL_STEWARD_ACCEPTANCE`  
`LISTENER_RESPONSE != RECIPIENT_CONFIRMATION`  
`RADIO_SNAPSHOT != CURRENT_CARD_STATE`  
`GROCERY_ACCESS != RELIGIOUS_PARTICIPATION`

**Next real step:** get an independent grocery/aid steward's consent to prepare a publicly shareable fictional *demonstration*; ask Kinship whether its digital team would be interested in reviewing the idea. No station integration or real participant enrollment without both owners' separate authorization.
