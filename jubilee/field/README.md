# Local field kit — tools for the remaining human gates

Open [the standalone field notebook](../dist/field-kit.html). It starts empty, runs offline and does not send information or automatically listen. [The blank host pack](../dist/host-pack.html) is printable; a copy can also be downloaded from inside the notebook. The [rehearsal](../dist/index.html) remains a separate synthetic learning surface.

## Work down the list

| TOPPER gate | Prepared tool | Actual evidence still needed |
|---|---|---|
| Owner supplies a built Genesis address | [Revival-owned export PR](https://github.com/the-static-collective/revival/pull/15), selected source pin, world/HTML byte verification, explicit offline reader | Export is built and cold-rebuild verified; owner admission is separately unclaimed |
| First host covenant / local run sheet | Six scoped host declarations, five-page blank pack, HOLD/DECLINE/ACCEPT on paper | A real local host supplies their decision and local arrangements |
| One recorded encounter | Separate PAPER / QR / SOUND entries, occurrence and recording times, opt-out/expiry/withdrawal gates | A person actually observes an encounter and preserves their local evidence |
| One cross-town return | Music digest and scoped handoff, separate receiver declaration, two-person help decision, separate report/recipient confirmation | Real carry, independent receiving evidence and real recipient confirmation |
| Owners decide any subsequent adapter admission | Visible `NOT_CLAIMED` admission boundary and held missing-evidence review | Each source owner’s separately recorded decision |

Code/tests and preparation do not tick the real field gates. The notebook records **operator declarations** and marks readiness for human review; it never authenticates a participant or certifies an event.

## Use the notebook

1. Prepare the blank host covenant and run sheet with the local host. Use short local aliases. Record the host’s separately supplied decision and declared arrangements in **Hosts**. Accepting all six checks records the operator’s declaration; it does not obtain consent.
2. Register owner-held cards in **Invitations**. PRIVATE is the default. PUBLIC display, PRINT, help INTRODUCE and destination-specific music HANDOFF are independent scopes. Keep sensitive need/contact details in the local steward’s separately owned process. The notebook has no fields for child names, photographs, contact details or participant profiles.
3. Record each visit and each observed carrier occurrence in **Encounters & handoffs**. These are manual reports; no camera, microphone, signal decoder or tracking system runs. Repeated observations keep separate IDs.
4. Propose help only between two current, separately scoped public need/offer cards. Record recipient and helper decisions independently. DECLINE ends the introduction. Only the helper reports delivery; only its recipient can provide the later confirmation. Help has no worship or belief condition.
5. For music, choose the actual source file locally to compute SHA-256, record only an owner-permitted destination, and have the receiver separately provide their file. A matching digest demonstrates byte equality on this device under these declarations, not independent custody, physical transport, signature or broadcast permission. The notebook never publishes media.
6. Use **Return** to preserve missing gates or review the declared chain. Public summaries contain current public labels and aggregate counts; raw events, host/owner/participant aliases and private labels are omitted. Withdrawn/expired tags and revoked host scopes do not create fresh eligible invitations.
7. Use **Keep the notebook** to download an encrypted backup and reopen it later. Refreshing clears memory. There is no automatic disk/browser storage. The passphrase stays on the device; forgotten passphrases cannot be recovered by this tool.

## Source door

The selected [source manifest](../source/manifest.json) binds an actual Revival-produced `Gen.1.1` place, the frozen-source compiler pin, witness/world receipts, exporter digest, world/HTML bytes and OSHB/MACULA attribution. [pin.json](../source/pin.json) also names the exact exporter review commit. Both builds validate those bytes; the browser rechecks them before an explicit user click loads the exact HTML into a sandboxed iframe. Closing the reader clears that frame. No auto-navigation is performed.

The synthetic card evaluator retains its original null source fields; the owner-built source artifact is a separate inspection surface. Luke / Isaiah / Leviticus / Acts themes are not resolved by this corpus. The source pin and content digests are a reviewed local trust selection, not a cryptographic owner signature or canonical admission. Original attribution/license statements remain in the source manifest and viewer.

To reproduce the owner output, check out Revival exporter commit `cc48fcf1eb469dd998c1317abce21be00a9429b4` with full Git history, then run:

```sh
PYTHONPATH=src python -m revival.jubilee_door build /tmp/jubilee-source
PYTHONPATH=src python -m revival.jubilee_door verify /tmp/jubilee-source
```

This validates exact local inputs against immutable Revival 012 pin `af1e00c24e3d7c6eb6b1ac39ef59bf894e2385fd`. Upstream corpus/blob pins come from existing owner source manifests; an independent upstream retrieval is not claimed.

## Private saved history

Backups use PBKDF2-SHA256 (210,000 iterations) and AES-256-GCM, a fresh 16-byte salt and 12-byte nonce, and authenticated format metadata. Wrong passphrases or tampered ciphertext refuse before replacement. Restored plaintext must pass bounded event validation and full replay before becoming current state. Import failure preserves the existing notebook.

Encryption protects the saved backup’s contents. Active browser state and the operator’s screen are plaintext; there is no multiuser authentication, trusted-clock proof, signature, external server or independently signed witness. Owner withdrawals preserve local past history while blocking fresh use; other people’s copies cannot be erased by this kit.

## Verify the kit

```sh
node --test jubilee/tests/*.test.mjs fixtures/roomtone-001/evaluate.test.mjs
node jubilee/bin/build.mjs --check
node jubilee/bin/build-field.mjs --check
node jubilee/tests/browser.mjs
node jubilee/tests/field-browser.mjs
```

Playwright installation is described in [the parent README](../README.md). Field browser checks cover an actual form-driven declaration chain, private display, participant separation, source-world navigation, public redaction, byte receipts, encrypted reopen/refusal, withdrawal, mobile layout, inert imported labels and absence of external requests. Test data is invented; these tests do not count as real host visits or aid.
