# DUAL-BODY-001 — STATIC-OS × reLATTE Compatibility Membrane

**Origin:** GO.STATIC / ROOMTONE / SCRAP-ORCHESTRA, 2026-10-11.
**Status:** PROPOSED interoperability proof. Hardware is user-reported but not remotely inspected.
**Parent:** [SCRAP-ORCHESTRA](2026-10-11-scrap-orchestra-001.md) and [GO.STATIC](2026-10-11-go-static-field-computer-001.md).

> TWO COMPUTERS MAY SHARE VERIFIED BYTES WITHOUT SHARING A WORLD, A DECISION, OR AN EXECUTION AUTHORITY.

## The new opportunity

The human reports **a couple of laptops believed to work and working desktop computers as well**, in addition to old routers, audio gear and scrap. This updates the number of *candidate machines*, not verified details: OS, hardware architecture, boot health, microphones, network ports and installed software remain UNKNOWN until observed.

Start with:
- **BODY A**: intact, operator-controlled candidate source/emitter.
- **BODY B**: separate intact candidate receiver/observer.
- **ROAD 0**: a personally controlled removable-file transfer if USB storage is available, or an explicitly isolated and operator-owned wired LAN. No public internet, mesh, router flashing or radio required.
- **ROAD 1**: controlled private Ethernet only after both machines and power supplies are checked.

## Existing code wires and compatibility boundaries

| Source inspected | What actually exists | Missing cross |
| --- | --- | --- |
| [STATIC-OS Instrument Host #54](https://github.com/the-static-collective/static-os/pull/54), head 8d3de9160a1f1fdffc6741712a112d34fbadf7e3 | Native InstrumentAdapterV0: describe / observe / select, local SQLite receipts, read-only record, explicit owner admission | No cross-machine service or generic signed export/import API demonstrated |
| STATIC-OS Instrument Host source: instruments/authority.py and instruments/relatte_bridge.mjs | Pins reLATTE exact commit dcc8cdca84c440aa4294134f020fb7095bf87f24. Uses sealOpaqueOrganCrossing / verifyOpaqueOrganCrossing / LocalReceiver / verifyReceipt and separate owner-local HOLD/ADMIT | Local bridge packet storage and identity are not an authenticated transport |
| [STATIC-OS Field Processor #87](https://github.com/the-static-collective/static-os/pull/87), head 7126d16091a156a2c075145d56dfd965bf57f7dd | Bounded synthetic ROOMTONE read-only adapter on the host; its software CI passed | Real sensors, microphone, external receiver not proved |
| [STATIC-OS Scrap Orchestra #88](https://github.com/the-static-collective/static-os/pull/88), head at inspection d52e8be0557512f150bba914eb2c0c0d651da6b0 | Candidate hardware inventory and isolated experiments | Actual devices not inventoried by model, powered or observed here |
| [reLATTE Transport Composition #93](https://github.com/the-static-collective/reLATTE/pull/93), head f7b51ec13ab084aa3c4d3880758f5f0f0562c5c8 | createCrossingFieldManifest / makeCarrierFragment / CrossingFieldReceiver fragments a signed relatte.crossing-envelope/v0 across simulated roads, including file-courier | Expects standard crossing envelope, while Static-OS host uses opaque-organ crossing; simulation does not constitute physical transfer |
| [STATIC-OS Return Room #86](https://github.com/the-static-collective/static-os/pull/86) | Another independently verifiable portable offline native reLATTE receipt experiment | Separate base stack; not automatic integration with Instrument Host |
| [GHoT Radio House #106](https://github.com/the-static-collective/GHoT/pull/106) | Signed work-card intake using two local loopback HTTP listeners | Two *physical* host pilot not claimed there |

**Critical type/version mismatch:** Static-OS host's signed opaque organ grammar and reLATTE #93's signed standard crossing envelope are **not interchangeable**. The host's exact reLATTE donor pin is also different from the newer experimental transport branch. Any eventual bridge needs an explicit typed, tested adapter; do not silently relabel a crossing or copy A's receiver keys or SQLite database to B.

**Proposed membrane:** export a separately authorized, small, public-safe portable evidence packet containing exact signed source crossing, exact referenced bytes/digests, typed donor contract and separately verifiable receipts. B checks the original source key/policy and exact bytes with native reLATTE, then creates **its own** independent LocalReceiver RECEIVE/HOLD. A's prior owner-local ADMIT must not confer B's admission.

If later using Transport Composition #93, one separately signed **outer standard crossing** could reference the exact byte digest of an inner signed opaque-organ packet. The outer crossing must pass the actual standard crossing verifier, and the inner packet must independently pass the opaque verifier. A fragment's route observation is not a signature by the source nor receiver admission. This is a design proposal, not an existing implementation.

## Compatibility gate ladder

| Gate | Exact proof | Current status |
| --- | --- | --- |
| P0 — Two bodies | Human witnesses A and B independently boot with intact, matched power | Reported likely, not verified |
| P1 — Runtime | Local CPU/OS/architecture; Python/Node availability; no private inventory uploaded | Unknown |
| P2 — Ordinary bytes | A creates deterministic harmless test file; B verifies exact SHA-256 after explicit offline courier | Not run |
| P3 — Native signed packet | A signs with pinned native reLATTE; B independently verifies exact source bytes, signature and trusted public key | Native primitives exist, two-body integration not implemented |
| P4 — Sovereign local reception | B LocalReceiver RECEIVE/HOLD is its own, not borrowed from A | Semantics exist; two-body test not run |
| P5 — Read-only instrument | B explicitly selects a verified, sanitized observation and local STATIC-OS instrument record after separate owner gate | Existing local host; portable ingestion not proven |
| P6 — Failure tests | Lost, corrupt, stale, unknown-version, replayed and duplicated packets stay HOLD/refuse without automatic effects | Not run on two machines |
| P7 — Room tone | One computer produces approved sound; other actually captures by microphone under consent and separately hashes evidence | Not run |
| P8 — Alternative roads | Segregated Ethernet, later verified optical/radio/copper after legal and hardware checks | Not run |

### Runtime truth

STATIC-OS instrument-host GitHub CI used **Python 3.12 + Node 24** on Linux. reLATTE Transport Composition documentation specifies **Node 22+** for its experimental run. These are source-specific environment observations, not guarantees that a 2012 laptop runs them, that older Windows/macOS is supported, or that an architecture/OS passes native tests.

The [portable two-body diagnostic script](../tools/dual-body-compat.py) should check only OS family, architecture, Python/Node version and a user-chosen alias. It does not access files, home directories, installed applications, usernames, hostnames, MAC/IPs, serial numbers, accounts, audio or network. It must clearly label reported toolchains and flag native compatibility as UNTESTED.

### Operator-local usage, when ready

~~~sh
python3 tools/dual-body-compat.py probe --alias BODY-A
python3 tools/dual-body-compat.py probe --alias BODY-B

# On A: make a harmless deterministic byte specimen.
python3 tools/dual-body-compat.py make-test --out field-courier-test.bin

# Transfer that file deliberately via a controlled USB medium or isolated LAN.

# On B: compare exact specimen bytes; not a cryptographic signature.
python3 tools/dual-body-compat.py verify-test --path field-courier-test.bin
~~~

These commands do not install software, use a public network, copy old user data or perform a crossing. They work only if a suitable Python interpreter is already installed; otherwise P1 remains UNKNOWN. On Windows the Python launcher may be py -3; syntax and invocation need local inspection.

## Necessary owner-local bridge (future STATIC-OS/reLATTE work)

1. A makes one properly classified source observation with original retained locally and exactly tracked digest.
2. A's STATIC-OS owner explicitly selects a bounded read-only record. The local opaque-organ crossing and HOLD are signed/verified by actual native reLATTE.
3. A explicitly exports a sanitized portable packet; do not export private keys, receiver DB, full personal audio or credentials.
4. B receives only deliberately transferred bytes. Its verifier checks exact signed payload hash, trusted keys, donor type/version and allowed scope, refusing altered or unsupported input.
5. B creates independent receiver-local RECEIVED and HOLD receipts. No copy of A's authority; no automatic ADMIT or execution.
6. If B wishes, B separately and explicitly records the received observation using its own installed read-only instrument. A local record gate does not imply file propagation, a message room or people discovery.
7. Restart, duplication, unknown key, bad signature, bad digest, wrong type, source disappearance and clock uncertainty must be tested.
8. Only after file-courier proof attempt a private cable route. Later radio/audio/light transports require separate actual physical witness and constraints.

## Physical safety, privacy and ownership

Keep old unpatched machines off the public internet until inspected. Check power labels and swollen packs; do not open desktop PSUs or unknown mains audio/doorbell equipment. Preserve personal files before repurposing. Do not disclose usernames, location, serials, MACs, private household audio or persistent hardware IDs as part of the initial experiment. Do not transfer unknown executables or copy a raw drive image just to prove transport.

**No need to solder yet.** A real file courier and an actual acoustic capture will teach us which of the *intact machines* can become stable independent bodies.

## Present disposition

**HELD FOR P0/P1/P2 REAL MACHINE EVIDENCE.** There is an existing native STATIC-OS-to-reLATTE local compatibility seam and a promising simulated reLATTE transport seam. Their *two-machine*, cross-envelope integration remains to be designed, implemented and proven by source-owner projects. planZ owns only this account of the crossing and its falsifiable remaining edges.

> SAME BYTES != AUTHENTICATED SOURCE.
> SIGNED CROSSING != RECEIVER ADMISSION.
> PORTABLE OBSERVATION != REMOTE EXECUTION.
> TWO MACHINES != TWO INDEPENDENT RECEIVER HISTORIES WITHOUT AN ACTUAL TEST.
