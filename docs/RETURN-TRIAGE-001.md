# RETURN-TRIAGE-001 — planZ receiving review boundary

**2026-10-28: Local, offline and read-only. No service or source-owner consent is inferred.**

An operator can inspect a manually exported JAR;VIS plan return candidate in private using:

    npm test
    npm run triage -- /private/path/planz-return-hold.json

The CLI requires an exact, versioned packet shape; verifies its deterministic ID; validates the owner-public planZ attention index and exact snapshot SHA-256. It rejects contact-like text, unrecognized data and asserted authority. An exact source match remains HOLD_FOR_OWNER_REVIEW. Older or missing source bindings return a clearly identified stale/unknown HOLD. This never automatically updates a plan, source issue, partner, beneficiary, or broadcast.

A real source owner must independently review any relevant permissions and evidence, including actual recipient confirmation. A packet is NOT proof of work. Content hashes are not signatures. Machine triage cannot independently authenticate people or verify their reported outcomes.
