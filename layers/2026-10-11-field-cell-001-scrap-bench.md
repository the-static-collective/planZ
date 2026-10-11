# FIELD-CELL-001 — Scrap Copper/Soil Physical Proof Prep

**Observed/planned:** 2026-10-11. **Disposition:** PREPARED SOFTWARE / PHYSICAL FIELD WITNESS NOT YET PERFORMED.
**Owner implementation:** [STATIC-OS draft PR #88](https://github.com/the-static-collective/static-os/pull/88), stacked on [FIELD-PROCESSOR #87](https://github.com/the-static-collective/static-os/pull/87), stacked on [Instrument Host #54](https://github.com/the-static-collective/static-os/pull/54).
**Parent plan:** [GO.STATIC FIELD COMPUTER](2026-10-11-go-static-field-computer-001.md) ← [ROOMTONE](2026-10-11-roomtone-ambient-addressing-001.md) ← [FIELD-SCORE](2026-10-11-field-score-material-counterpoint-001.md) ← [MASTER-SERVANT](../plans/2026-10-11-master-servant-physical-internet-001.md).

## Why this experiment is worth crossing now

The human has a soldering iron and substantial miscellaneous scrap. Rather than requiring a commercial sensor ecosystem, build one extremely bounded *measurable physical computation specimen* from a common low-voltage battery, resistors, known-safe capacitor, copper electrodes and a small soil cup.

**First real physical operation proposed:** a 2-AA, 100 kΩ-current-limited physical RC delay circuit. The capacitor holds charge (memory); the bounded copper/soil bridge may affect electrical charge-transfer timing. A three-condition or five-condition contrast, measured under actual repeated controls, determines whether there is reproducible *material-dependent physical transfer*. This is not yet proof of an independent "soil CPU"; software observation and capacitor memory remain distinct from substrate computation.

## Exact deliverables in STATIC-OS #88

- docs/FIELD-CELL-001.md — safe isolated topology, component inventory, five controlled conditions, test sequence, data semantics and field-processor criteria.
- docs/FIELD-CELL-001-POCKET-CARD.md — small scrap inventory + wiring sketch + human measurement checklist.
- scripts/field-cell-analyze.py — standard-library offline finite CSV parser; raw bytes SHA256, per-trial t63, sampled output, negative controls, repetition and suspicious-input rejection. Output has no grant or actuation.
- fixtures/field-cell-001/synthetic-rc.csv — 105 **synthetic** RC rows across 15 trials, intentionally not sensor observations.
- tests/test_field_cell_001.py — 17 hostile static/normal tests, no new network or hardware requirements.

**Software proof:** GitHub Actions verifies code through inherited test discovery; exact-head results should be read on #88 before making a final pass claim.

**Unmet proof:** no operator has submitted real component inventory, DC measurements, raw trial rows, instrument calibration, or independent field witness through this PR.

## Gates and safeguards

- **C0 inventory:** verify battery holder, actual resistance, rated/polarized capacitor, dry board, isolated cup, meter; no uncertain capacitors.
- **C1 human assembly:** solder only with batteries removed; no live mains, unknown power supplies, Tesla apparatus, outdoors ground rods, underground utility, telecom plant, laptop mic/USB, or re-used lithium pack.
- **C2 fixed/open controls:** true resistor baseline and physically open-circuit baseline, three repetitions; unexpected residual potential reported.
- **C3 material contrasts:** dry/damp/wet with identical copper geometry and repeated timestamped values; loss/noise and polarization included.
- **C4 physical circuit proof:** raw measurements show a bounded, repeatable physical transfer function and capacitor-based state; do not conflate material effect with environmental cognition.
- **C5 stateful processing proof:** separately define a useful input-output computation, real physical state contribution, held-out control, repeated uncertainty, power budget and falsification.
- **C6 native instrument crossing:** independently authorized real sensor/data logger adapter to Static-OS, with explicit observation vs claimed hardware status and local HOLD.

No real human room matching, broadcast, transmission, implicit permission or outdoor deployment arises here. The owner-reported measurements, when supplied, remain unverified reports until independent calibration/corroboration earns stronger labels.

## PlanZ scope

This is **one planned descendant with actual software artifacts**. It is not permission to promote any unmerged instrument-host or field-processor branch to canon. The physical premise remains uncertain and its failure data are welcome. The local owner decides what to admit, implement or refuse.

**Next practical encounter:** look at the operator's scrap inventory and photograph; verify low-voltage safe components; assemble a battery-free checkable layout; only then conduct isolated AA-powered measurement with a known DC meter.

> THE FIRST FIELD COMPUTER DOES NOT BEGIN WITH A CLAIM OF INTELLIGENCE. IT BEGINS WITH A FIELD THAT CAN HONESTLY SAY WHAT CHANGED.


## Salvage update — audio-first field proof

User-reported hardware materially changes the fastest lawful test route: [SCRAP-ORCHESTRA-001](2026-10-11-scrap-orchestra-001.md) records the multimeter, soldering iron, laptops, desktops, routers, audio mixers/amplifiers/receivers, CD player, and doorbells as **uninspected assets**. A working laptop microphone and an intact audio emitter can demonstrate a genuine physical propagation observation before parts are soldered or unknown devices opened. The AA-powered RC/soil material computation objective is **retained**, not replaced.

Do not promote model compatibility, installed operating systems, actual RF reception, geolocation or consent from equipment ownership alone.
