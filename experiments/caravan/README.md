# CARAVAN 004 — The Crossing

Cumulative local prototype: First Signal, The Voice, The Library, and independently signed review parcels. Python 3.9+; Crossing requires the optional `cryptography` package (tested with 46.0.4). Install it before disconnecting from the internet, or obtain appropriate trusted wheels for offline installation. Older modules remain standard-library only (Voice projection optionally uses FFmpeg).

```
python -m pip install -r requirements-crossing.txt
python crossing.py --data node-a init
python crossing.py --data node-b init
python crossing.py --data node-a card a.json
python crossing.py --data node-b card b.json
```

Compare the fingerprints printed by each independent node through an independent trusted channel (in person, for example). Replace the uppercase placeholders below with those verified full fingerprints and actual media IDs. Never send the private key.

```
python crossing.py --data node-a pin b.json B_FINGERPRINT
python crossing.py --data node-b pin a.json A_FINGERPRINT
python caravan.py --data node-a demo
python crossing.py --data node-a offer audio MEDIA_ID B_FINGERPRINT offer.zip --confirm-review
python crossing.py --data node-b receive offer.zip
python crossing.py --data node-b receipt OFFER_ID hold.json
python crossing.py --data node-a verify-receipt hold.json
python crossing.py --data node-b inspect OFFER_ID review.wav
python crossing.py --data node-b refuse OFFER_ID
python crossing.py --data node-b receipt OFFER_ID refusal.json
python crossing.py --data node-a verify-receipt refusal.json
```

Use the ID returned by `offer` for OFFER_ID. For an independently operated physical node, carry only peer cards, offer.zip and receipt JSON files between machines. Use `document DOCUMENT_ID` instead of `audio MEDIA_ID` for a library document, with explicit per-offer permission. Audio additionally requires the existing review permission. Document review is separate from guest sharing. Inspect writes the exact held content to an explicit local file with matching extension; do not open untrusted content in unsafe readers. `list` shows incoming and outgoing state. New parcels expire after 24 hours by default; `--ttl` sets 1–604800 seconds. A repeated delivery is idempotent even after refusal; expiry prevents new acceptance, not historical verification. Refusal cannot be rolled back by an older HOLD receipt.

## Security and scope

P-256 ECDSA via cryptography, SHA-256 content and domain-separated body IDs, deterministic restricted Python JSON encoding (not RFC 8785/JCS), out-of-band peer key pinning, separate SQLite custody, ZIP read without extraction, signed receiver HOLD/REFUSE. No claim of native reLATTE or SUITCASE compatibility; compare their exact profiles before adapter work. The private key is plaintext PEM (created with POSIX mode 0600 where supported); restrict the host and backup access, especially Windows ACLs. Parcels are NOT encrypted. Use only explicitly consented public-safe material, not private records. Signatures establish key possession, not organizational identity or truth. No automatic peer discovery, key rotation/revocation, secure deletion, automated forwarding, ADMIT, guest publication, or broadcast rights. Refusal removes the journal payload logically, not secure erasure or recall of other copies. Sender-side revocation blocks new offers but does not invalidate copies already sent. The journal stores current signed disposition, not an append-only record of every prior response. The previous unsigned audio transfer commands remain legacy and distinct; do not treat them as authenticated. Single operator per data directory; no hardened multi-tenant deployment. Cold-copy backups preserve keys; do not use the same copied identity as a separate node. The sender writes the ZIP before committing the journal; a crash may leave an untracked output; discard it and create a fresh offer. No physical device proof or external outreach. No source repository modifications.

## Tests

`python -m unittest discover -v` — 39 tests passed, including 25 inherited and 14 crossing tests. Simulated distinct independent directories, real ECDSA signing/verification, peer pin mismatch, wrong recipient, unknown sender, modified content and metadata, expiry, replay, signed refusal monotonicity, private review extraction, document exchange, wrong receipt signer, and ZIP member rejection. No actual two-phone or USB field test. Test clock initially triggered a ZIP timestamp restriction (pre-1980); corrected the fixture to a valid date, then all tests passed.

Source reference: https://github.com/the-static-collective/reLATTE/blob/main/README.md (blob 2e70033f20041c7908b54bdd0be2a3fea449cbea). Prior implementation ancestry is retained below; older release statements apply to their respective versions.

---

# CARAVAN 003 — The Library

A community-owned offline resource shelf alongside the existing gathering portal, listening room and private recording archive. Python 3.9+, no additional packages; optional FFmpeg for Voice only. This is a controlled local prototype.

## Start a library

```
python caravan.py init "Community Media House"
python library.py add examples/welcome.txt --title "Welcome to the community library" --credit "CARAVAN example" --rights "CC0 example" --category "Orientation" --description "A local-first field guide"
python library.py list
python library.py allow DOCUMENT_ID
python caravan.py serve
```

Replace `DOCUMENT_ID` with the ID printed by add/list. Open http://127.0.0.1:8765/. Phones on an approved isolated LAN can use the same portal via the host's private IP (see First Signal below). The shelf searches title, credit, category and description; full-text indexing is not implemented. Category filtering works with search. TXT and Markdown display as escaped plain text, not rendered Markdown or HTML. PDF and EPUB download as attachments to open in a trusted reader. Files are limited to 64 MiB. Original bytes are preserved and checked on access.

## Curation and custody

Each import requires a title, credit, rights/source statement and category; optional description. These are operator statements, not verified licenses. Confirm rights for copying and local distribution before enabling sharing; use public-domain, appropriately licensed, or community-owned material. The included welcome note is original and freely reusable. Imported documents are private by default; local share permission is separate from media permissions. No document export or automatic sync with other nodes is included. The catalog and original documents remain under the host's custody. Do not import confidential or unsafe documents; PDFs and EPUBs may contain malicious content, and header checks are not security scanning or full file validation. The server never interprets their contents. Only explicitly approved files can be requested by guests; revocation blocks new requests but cannot recall copies already downloaded. Use a dedicated trusted LAN; no public exposure or private records. No built-in user authentication, encryption or digital rights management.

```
python library.py verify DOCUMENT_ID
python library.py revoke DOCUMENT_ID
```

For cold backup, stop the server and all operators; copy the entire `caravan-data` directory (including `documents` and SQLite) to separate storage. Restore using `--data` before the subcommand. The document import stages a temporary file, fsyncs file contents and renames, then commits the catalog; sudden power loss can still leave an orphan, and no automatic reconciliation or directory fsync is implemented. No quota or multi-operator concurrency assurance. Do not edit storage manually.

## Verification

25 automated tests passed (15 inherited + 10 library). Tests include actual loopback HTTP, private metadata/content blocking, local search/filter, escaping hostile text, revocation, duplicate rejection, tamper detection, rights field requirement, cold backup/restore and download-only PDF/EPUB routing using header fixtures (not real book-reader tests). No physical phone/WAN-off trial, real-world venue operation, malicious document scan, browser accessibility audit, or real PDF/EPUB reading validation. No external network requests during the test workflow.

---

## Previous release documentation

# CARAVAN 002 — The Voice

Includes the complete First Signal host plus a private recording archive and audio projection handoff. No internet required after dependencies are installed. Python 3.9+; FFmpeg with libmp3lame is optional for projection. No OBS installation is required for the manual path.

## From a gathering to a local listening room

1. Record locally in OBS, Audacity, or another recorder with appropriate host and contributor permission. Stop and finalize the recording before importing. Preserve the source file yourself as a backup.
2. From the extracted package directory, run (replace example paths and titles):

```
python voice.py preserve recording.mkv --title "Original performance" --attribution "Approved artist credit" --confirmed-private-preservation
python voice.py list
python voice.py verify RECORDING_ID
python voice.py project RECORDING_ID
python caravan.py list
python caravan.py allow MEDIA_ID local
python caravan.py serve
```

The first command prints a recording ID; the projection prints a different media ID. Do not enable local sharing until expressly permitted. The original stays in the private `caravan-data/recordings/` archive; the guest HTTP server never serves it. Use public-safe titles and attribution only. `project` produces a mono, 96 kbps MP3 (about 43 MB/hour); original sound and video stay intact. The first audio track is selected, so check that it is the intended mix. The First Signal 64 MiB limit still applies; long recordings may exceed it. The conversion has a five-minute execution limit. Failure leaves the original intact. A missing FFmpeg binary does not stop preservation or First Signal. No download/install is attempted by the program.

## Static Live handoff

If you have an actual `static-live.broadcast-receipt/v0.1` JSON from the recording-first controller, explicitly choose it and the completed local source:

```
python voice.py preserve recording.mkv --receipt session-receipt.json --title "Original performance" --attribution "Approved artist credit" --confirmed-private-preservation
```

The receipt must report recording started and confirmed stopped, and its absolute output path must resolve to the operator-selected file. It may report a stream failure. The archive preserves the original and the supplied receipt separately. Moved files must use manual mode. This adapter consumes a receipt file; it does not run or modify OBS, automatically fetch receipts, stream, or control the Static Live controller. The receipt is unsigned, contains no source digest, and cannot establish actual consent or airtime. Exact-byte SHA-256 verification applies to the preserved copy, not to the authenticity of upstream claims. The test failure receipt is synthetic; no real OBS session was run.

## Private custody and recovery

Use a host-owned machine and trusted finalized local recordings only. The original archive is not encrypted; source receipts can contain private machine paths and fault text. Keep the data directory outside any public web root or shared sync folder. No third-party files or untrusted codecs should be processed on a sensitive machine. Archive directories stage copies and rename only after verification. The source is never deleted. Stop all operations before copying the complete data directory to backup. Pending folders from abrupt interruption require local review. Projection writes the catalog and then the archive manifest separately: an interruption between these can leave a private orphan or duplicate rejection, requiring manual reconciliation. Run only one operator command at a time. No power-cut, malicious-media, physical LAN or real OBS integration test has been performed. There is no disk quota, automatic rollback, encryption, recipient authentication or production-grade security. Check free disk space before archiving large files.

## Test results

15 tests passed, including all seven First Signal tests plus eight Voice tests. Real FFmpeg synthetic MKV-to-MP3 conversion was executed locally; stream failure is a simulated receipt. See `test-results.txt`. Source: [Static Live broadcast controller](https://github.com/the-static-collective/static-live/blob/main/src/broadcast-controller.js), observed Git blob `6da404c89d48a04aaff18ecde3b4b39e20994122`. The receipt shape is reused; controller implementation is not vendored. [CARAVAN #48](https://github.com/the-static-collective/planZ/issues/48).

---

## First Signal reference (001, included unchanged)

# CARAVAN 001 — First Signal
One body, many vocations. A local-first community media host, not a deployed network.

## Start (Python 3.9+ installed, no pip packages)
Extract the ZIP. Open a terminal in the extracted directory. On Windows use `py -3` in place of `python` if needed. On macOS/Linux use `python3` if needed.

```
python caravan.py init "Community Media House"
python caravan.py demo
python caravan.py notice "Friday 8 PM — community gathering (example)"
python caravan.py serve
```
Open http://127.0.0.1:8765/ on that computer. `demo` creates an original synthetic one-second tone, explicitly marked local/review permitted. The notice is only a sample; omit it for a real installation. Stop with Ctrl+C. Re-running demo rejects duplicate bytes. The data directory persists after shutdown.

## Local phones
Use an owner-approved private Wi-Fi network with no port forwarding or guest-to-Internet exposure; unplug WAN but leave router powered. Find host's private IPv4 address (`ipconfig` on Windows; network settings on Mac/Linux). Example only:

```
python caravan.py serve --bind 192.168.1.20 --private-lan
```
Replace the example with your actual address. Approve local firewall access only on the dedicated private network, never public networks. Phones join that Wi-Fi and open `http://HOST-IP:8765/`. Some guest networks isolate clients; use a dedicated router under host control. Phone may say no internet; stay connected to Wi-Fi. No account needed. Do not expose the server to the internet. Anyone on that LAN can access approved guest material. HTTP is plaintext. Do not enter private or sensitive information. No QR generator included; print the actual URL or create a QR offline using a trusted local tool.

## Operator controls (local terminal only)
Record a consented adult performance using existing OBS, Audacity, or another local recorder. Export to WAV/MP3/OGG/M4A (browser support varies; max 64 MiB per file). Raw OBS video is not accepted. Import defaults to unshared; attribution must be public-safe. Before allow, confirm explicit rights for that scope.

```
python caravan.py add song.wav --title "Original song" --attribution "Approved artist credit"
python caravan.py list
python caravan.py allow ITEM_ID local
python caravan.py allow ITEM_ID review
python caravan.py export ITEM_ID "Receiver B" review.zip
python caravan.py revoke ITEM_ID local
python caravan.py revoke ITEM_ID review
```
Replace ITEM_ID with the printed ID. Local permission covers access on this LAN, not public broadcast. Review permission covers preparing a copy for separately named recipient, not publication or rebroadcast. Revocation blocks new requests/exports; previously downloaded/in-flight copies cannot be recalled. Never export without separately confirming recipient-specific authorization. CLI permission is a local operator declaration, not proof of consent. Guest page is read-only; no upload or admin routes. A copied file could still be redistributed by someone; use only media you can safely share.

## Independent receiving rehearsal
```
python caravan.py --data receiver-data receive review.zip "Receiver B"
python caravan.py --data receiver-data list
python caravan.py --data receiver-data refuse RECEIVED_ID
```
Receiver gets HOLD by default. It cannot be enabled for playback or re-export in this version. Refusal is a local state, not secure deletion or a signed receipt. SHA-256 detects altered bytes relative to the manifest; it does NOT authenticate sender or prove authorization. The name constraint is not cryptographic identity or encryption. Packages are plaintext. This format is not native SUITCASE or reLATTE, nor does it provide an authenticated HUMKIN inlet.

## Backup / power interruption
Stop server and all CLI commands. Copy the complete `caravan-data` directory onto independently controlled storage. Restore to a new directory and point `--data` to it. Do not copy a running SQLite database. Test opening the restored library. Keep a second copy; SQLite transaction durability does not guarantee media file atomicity or power-loss safety. Files may be orphaned if interrupted during import. No automatic reconciliation implemented. Use normal certified power equipment. No mains modifications.

## Test
```
python -m unittest -v
```
See test-results.txt for the executed tests. These are local loopback tests and do not establish real two-phone WAN-off operation, actual power loss recovery, browser compatibility, consent, or venue deployment. Prototype has no production-grade authentication, HTTPS, network rate limits, concurrency assurance, receiver acceptance workflow, or byte-range support; use only a trusted dedicated LAN and short audio.

## Source ancestry (inspected contracts, not imported implementations)
- [planZ #48 CARAVAN](https://github.com/the-static-collective/planZ/issues/48)
- [Traveling Jubilee](https://github.com/the-static-collective/planZ/issues/13)
- [SUITCASE-001](https://github.com/the-static-collective/webZ/blob/main/docs/SUITCASE-001.md), observed blob 43be42a0b09bf08c3c4b6e4b80f6fa57ff2ff294. Signed offer/independent disposition architecture is a future adapter, not implemented here.
- [Static Live controller](https://github.com/the-static-collective/static-live/blob/main/src/broadcast-controller.js), observed blob 6da404c89d48a04aaff18ecde3b4b39e20994122. Existing recording-first OBS controller; no automatic integration here.
- [Radio House](https://github.com/the-static-collective/GHoT/issues/97) and [Radio House 004](https://github.com/the-static-collective/GHoT/issues/104). Media priority and local operator boundaries, no compute adapter implemented here.

Next: actual isolated LAN test, recording import, independent cold backup, native signed exchange and authorized HUMKIN review-only adapter. No partner participation, publication, real-world performance or field milestone claimed.

## 005 — The Airwaves (cumulative)

A local multi-station listening lineup with user-initiated sequential playback and a separate, private station-review index. No internet, credentials or remote actions are needed. This is not synchronized radio, HLS, terrestrial broadcast, or a HUMKIN upload/schedule connector.

```sh
python caravan.py init "Community Media House"
python caravan.py demo
# copy the printed item ID
python airwaves.py station "Community Radio"
python airwaves.py lineup "Community Radio" ITEM_ID
python caravan.py serve
```

Open http://localhost:8765 and choose Community Radio, then a track. For other approved audio, add it with `caravan.py add`, explicitly grant local sharing (`caravan.py allow ITEM_ID local`), then list its ID in the lineup command. Grant local playback only with the relevant rights and consent. The ordered lineup is replaced as one transaction, and each station has its own sequence. Reload the guest page to refresh; playback advances after each track completes, stopping at the end. Browser autoplay policies may require another click. A revoked track cannot be newly fetched; already buffered or copied bytes cannot be recalled. No authenticated guest access: use the trusted dedicated private LAN only. Operator CLI is not exposed to guests.

### Independent station review

Install the optional Crossing dependency as described above. A prospective receiving station operator creates its own CARAVAN identity and independently pins the originating node. The origin must address its signed audio offer specifically to that station's node. After verifying it using `crossing.py receive`, the recipient can create a local station review index:

```sh
python airwaves.py station "Station editorial review"
python airwaves.py stage "Station editorial review" OFFER_ID
python airwaves.py review "Station editorial review"
```

Use the same `--data` root across commands, and put that option before the subcommand. Review output is local JSON metadata only: exact source/recipient fingerprint, title, credit, declared rights, digest, size, format, expiry, HOLD and NOT_AUTHORIZED. Duplicate staging is idempotent. Refused, expired or damaged material is BLOCKED on inspection. To privately inspect audio, use Crossing's `inspect` command; never forward review-only parcels to a different party. The station label is a local organizational label, not evidence of an actual station relationship. No approval-to-air mechanism exists. No conversion of received HOLD to local playlist. Review permissions do not establish distribution rights. No remote withdrawal protocol; sender-side revocation prevents new exports but cannot revoke already delivered copies. The recipient's local refusal or expiry blocks the review index, not already extracted bytes.

### Source alignment / future adapter

- HUMKIN TOWER 012: https://github.com/the-static-collective/HUMKIN/issues/202 — existing authenticated owner intents and private intake. No new parallel cloud sequencer.
- HUMKIN durable asset spine: https://github.com/the-static-collective/HUMKIN/blob/main/docs/TOWER-DURABLE-ASSET-SPINE-011.md (blob a85e698e96a45ca5b6bc0cf6ddf378e1e858264f). Approved catalog assets, encoding and on-air program publication are separate. CARAVAN review metadata is NOT its native intake schema.
- Future adapter: verify the station's live owner-controlled intake contract, obtain separately documented broadcast rights, and import an approved source asset through the existing authenticated operator workflow. Scheduling remains an independent owner decision. No R2 writes, live schedule edits, API calls, or credentials added here.

### Verification

`python -m unittest discover -v` — 49 automated tests (39 inherited, 10 Airwaves). Loopback HTTP checks cover HTML, script serving, CSP and private paths. Browser execution, physical phone/WAN-off playback, synchronized programming, long-running audio and actual station intake remain untested. Single operator assumption, plaintext local storage, inherited Crossing limitations. No production deployment or GitHub source commit.

## 006 — The Seed: independent foundation and voluntary ancestry

The full ZIP is the reusable **software** body, not a node backup. Extract it to a clean directory on each computer. Never distribute an existing `caravan-data` directory as a starter installation. Python 3.9+ and the optional Crossing dependency are needed for Seed; FFmpeg is optional for Voice. On the target system, with an appropriate predownloaded wheelhouse (matching its OS, Python and architecture), install without network access:

```sh
python -m pip install --no-index --find-links ./wheelhouse -r requirements-crossing.txt
```

Prepare that wheelhouse on a compatible connected system using `python -m pip download -r requirements-crossing.txt -d wheelhouse`; it is not included in this ZIP. No package fetch occurs during runtime. Python and FFmpeg installers are not bundled. Verify the source hashes with `python verify_source.py` before running. This checksum manifest detects accidental modification, not malicious replacement of the entire bundle.

### Found a new house

```sh
python seed.py --data house-a found "First Community House"
python seed.py --data house-b found "Second Community House"
python caravan.py --data house-b serve
```

`found` requires a new directory, creates a fresh local key and empty catalog/journals, and copies no private material, permissions, stations, contacts or notices. A child does not need a parent, invitation, or ancestry to operate. Protect the plaintext data root and signing key; avoid shared folders and untrusted users. Existing nodes may use the optional ancestry exchange without migrating their catalog. A node can only record one founding seed; this is a bounded v0 ancestry convention, not a universal genealogy system.

### Optional signed founding ancestry (two operators)

```sh
python crossing.py --data house-a card a-card.json
python crossing.py --data house-b card b-card.json
python crossing.py --data house-a pin b-card.json B_FINGERPRINT
python crossing.py --data house-b pin a-card.json A_FINGERPRINT
python seed.py --data house-a invite B_FINGERPRINT seed.json
python seed.py --data house-b adopt seed.json --confirm-local
python seed.py --data house-b genesis genesis.json
python seed.py --data house-a verify-genesis genesis.json
python seed.py --data house-b status
```

Replace the placeholders with the actual fingerprints independently compared by both operators. Carry cards, seed and genesis files manually. Declining simply means not adopting. Ancestry is optional and never supplies remote privileges or copies permissions. For knowledge or music, use separate, addressed, signed Crossing review-only parcels; the child can refuse. Reuse/publishing requires a separately established rights grant; no automatic content promotion. This is not the native reLATTE or SUITCASE wire format. Signing keys, data and parcels remain unencrypted; expiry depends on local clocks. The parent can disappear without disabling the child. There is no remote update, automatic discovery, or inherited control. Do not treat signature as organizational identity.

### Verification and field proof

Run `python -m unittest discover -v`. 59 automated tests passed, including 49 inherited tests and 10 Seed tests: fresh identity, empty catalogs, no overwrite, explicit consent, wrong recipient, tampering, unpinned peer, replay, competing seed rejection, parent absence, and separate media refusal (some tests cover multiple assertions). Tests ran on one Linux environment with Python and cryptography 46.0.4. No two-machine physical trial, Windows/macOS installer test, live OBS or HUMKIN integration, synchronized radio, encrypted storage, key recovery, or production readiness claimed. Single operator per root. Database and file write crash atomicity remains incomplete. Source placement in GitHub requires a separate reviewed integration; this ZIP includes source, tests and launchers, not a deployment.

## First field trial

1. Copy only the verified software ZIP and compatible offline dependency installers to two independent devices. Each operator founds their own node.
2. Disconnect WAN; connect two phones to a dedicated private Wi-Fi LAN; open only the guest portal using the host's private IPv4 address (explicit LAN opt-in; see earlier instructions).
3. Play the synthetic demonstration audio, read an intentionally shared document, restart the host, and verify persistence.
4. Exchange public peer cards, independently verify fingerprints, and optionally sign/adopt one seed and return genesis. Disconnect the parent, repeat child access.
5. Separately send one synthetic review parcel and refuse it at the receiving node. Record actual results, failures and operating cost; no physical proof is inferred from automated tests.
