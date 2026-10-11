# SINGING-SIGIL-F1 — Printable QR + Audible DTMF Physical Test Coupon

**Date:** 2026-10-11
**Source plan:** [MASTER-SERVANT](../plans/2026-10-11-master-servant-physical-internet-001.md)
→ [FIELD-SCORE](2026-10-11-field-score-material-counterpoint-001.md)
→ [Bandcamp Singing Sigil F0](2026-10-11-bandcamp-singing-sigil-001.md).
**Implementation:** [STATIC-OS draft PR #90](https://github.com/the-static-collective/static-os/pull/90),
stacked on Bandcamp F0 PR #89 (not the separate physical FIELD-CELL #88).
**Disposition:** F1 **COUPON CREATED, DIGITAL SELF-TESTED; HUMAN PHYSICAL OBSERVATIONS NOT RUN**.

## Lab artifact

The first transport coupon gives two independently decodable *file encodings*
of one literal text payload:

    SCF1:SS001:1E49EDB6

- Standard printable QR (the short text, not a URL or executable command).
- Audible, human-hearable DTMF signaling encoded in a standalone 48-kHz
  16-bit mono WAV with two repeats, not embedded in a preexisting album master.
- A local manifest mapping lab ID \`SS001\` to
  \`artifact:singing-sigil-companion-001\`.
- A finite WAV decoder that produces \`CANDIDATE_ONLY\` or
  \`NO_VALID_PACKET\` and explicitly carries \`authority=NONE\`.
- A 40-row physical human test CSV — **20 QR + 20 AUDIO, all UNRUN**.

The optional QR generator depends on \`qrcode[pil]\`; the WAV encoding/decoding
code uses only the Python standard library. It can be reproduced from
STATIC-OS PR #90 without a Bandcamp login.

The QR payload and WAV transport coupon were generated and independently
decoded in the author's isolated software sandbox. The acoustic decoder
recovered both repeated transmissions; nine local software tests passed,
including CRC failure, silence, shifted-capture, stereo refusal, deterministic
generation and coupon manifest binding.

**This does not constitute one actual ambient-wave transmission or physical
sensor observation.** A perfect local decode of a WAV file is not proof the
sound traversed the air into a different microphone.

## Physical gate remaining

- Print the card, scan on a real independent device; preserve QR readout,
  camera conditions, successes and failures for 20 attempts.
- Play the coupon WAV at moderate safe volume from one device; record the
  actual audible sound with an independent recorder, export a 16-bit PCM copy,
  and attempt bounded decoding. Log all 20 attempts, incl. distance/noise
  variations, false negatives and any no-packet outputs.
- Preserve the exact raw original recording and hash as sourced evidence,
  distinct from converted files and from synthetic test fixture bytes.
- Compare QR and AUDIO references while retaining separate event IDs and
  unspecified device-clock relationships. Matching CRC32 is not a signature,
  identity, authorship verification, or consent.
- Only then design a *separate* physical-receipt adapter, not a mutation
  permitting PHYSICAL claims in the existing synthetic-only F0 adapter.

## No-collapse rules

    STANDALONE TONE != PUBLISHED SONG DERIVATIVE
    FILE DECODING != AIR CAPTURE
    SAME TEXT != SAME PHYSICAL EVENT
    CRC != SIGNATURE
    HUMAN SCAN != PERMISSION TO FETCH OR EXECUTE
    PHYSICAL RECEIPT != NETWORK DEPLOYMENT

Source track information from Bandcamp remains an artistic/provenance
reference only. The first F1 coupon is not a watermark and has never
modified the releases. Neither source-owner approval nor CANNON promotion
is implied by this planZ record.
