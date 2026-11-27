# CARAVAN 007 — NODE ALIVE / physical field trial

Status: **FIELD PROOF PENDING**. Two independent Linux loopback processes passed a rehearsal; no physical devices, WAN disconnection, venue or broadcast verified. Use synthetic media first. No confidential information or real participant recording without separate permission.

## Equipment
Two owner-approved computers with Python 3.9+; two phones; a powered private Wi-Fi router (WAN can be unplugged); optional USB drive. The computers do not need to be identical. Obtain Python and matching `cryptography` wheels before disconnecting. FFmpeg is optional for recording projection. No changes to a production router, no port forwarding, no public Wi-Fi, no connection to the live HUMKIN station.

## Prepare each computer while connected
Extract the same verified Genesis ZIP into a fresh software folder. In a terminal inside that folder:

```sh
python verify_source.py
python -m pip download -r requirements-crossing.txt -d wheelhouse
python -m pip install --no-index --find-links wheelhouse -r requirements-crossing.txt
```

Use `py -3` on Windows or `python3` on Unix if needed. Download matching wheels separately on each OS/architecture. Keep data and wheelhouse out of Git. The software archive is not a data backup. For a basic portal-only trial, cryptography is not needed; for Seed and Crossing it is required. On Windows a sample absolute data root is `C:\CARAVAN-data\house-a`; on Unix use a private absolute path outside any source clone. Replace DATA_A/DATA_B below with the corresponding new private data directories. Do not use existing production data.

## A. Found and populate
Computer A:

```sh
python seed.py --data DATA_A found "First Community House"
python caravan.py --data DATA_A demo
python library.py --data DATA_A add examples/welcome.txt --title "Welcome" --credit "CARAVAN example" --rights "CC0 example" --category "Orientation"
python library.py --data DATA_A allow DOCUMENT_ID
python airwaves.py --data DATA_A station "First Signal FM"
python airwaves.py --data DATA_A lineup "First Signal FM" MEDIA_ID
```

Use IDs printed by demo/add. Computer B:

```sh
python seed.py --data DATA_B found "Second Community House"
```

## B. Local phones / WAN off
Keep router powered; unplug only its WAN connection. Disable cellular data on both phones and confirm they remain on the private Wi-Fi. Find each host's actual private IPv4 address via ipconfig/network settings. Use the actual address, not the sample:

```sh
python caravan.py --data DATA_A serve --bind 192.168.1.20 --private-lan
```

On both phones visit `http://192.168.1.20:8765/` (substitute actual A address), play the tone, read Welcome, and open the station. No internet-required feature should be present. Record browser/device and observed failures. Approve firewall only on dedicated private LAN; HTTP is unencrypted. Stop with Ctrl+C; restart and repeat. If client isolation prevents access, use an isolated owner-controlled network with peer access; do not disable security on a production network.

## C. Two owners / manual courier
Keep separate keys and data roots. In separate terminals on the hosts use the README section 006 commands to export cards, compare full fingerprints independently, and pin each other's public cards. Copy only the public cards, optional seed, genesis, signed review parcel and receipt via USB. Never copy the entire data folder or crossing-key.pem. The receiver can decline the seed or refuse the media; the signed exchange does not authorize playback. Use the README 004 commands with DATA_A/DATA_B and actual IDs to issue a synthetic offer and verify refusal. Run B's own server with its own private IP. Shut down A completely; B must remain reachable, have no inherited media, and retain its identity after reboot. B may create its own demo independently after the no-inherited-media check.

## D. Evidence card — mark observed only
- Host and network permission (held locally): ______
- Date, hardware, Python/OS/browser versions: ______
- [ ] Two independently controlled computers and distinct fingerprint comparison
- [ ] Two phones, cellular off and WAN disconnected, actual portal/audio/document access
- [ ] Local station playback initiated by listener; no synchronized-live claim
- [ ] Parent and child exchange verified; child refusal verified by sender
- [ ] B serves independently after A powered off; B retains identity after reboot
- [ ] Cold backup restoration (same identity, not a new node); separate storage protected
- [ ] Stop server, no unwanted network exposure; actual cost, elapsed time, failures logged
- Optional later: [ ] Actual adult contributor + venue permissions; finalized original recording preserved and projected, local playback separately approved

Status: PENDING / PARTIAL / FIELD PASS (only if the first eight observed checks pass). Real recording optional and separately authorized. No radio transmission or external publication. If any check fails, retain negative result. Do not include private names, IPs, keys or personal recordings in a public issue. Report only a redacted receipt.
