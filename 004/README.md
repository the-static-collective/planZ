# BRANCH CAPABILITY CENSUS 004 — availability without promotion

This is a bounded, human-curated capability view. It coexists with planZ's PlanRecord dispositions; it cannot classify project-local branch work as failed, stranded or incomplete merely because it is unmerged.

**BRANCH != BACKLOG. AVAILABLE != AUTHORIZED. TESTED != DEPLOYED. SOURCE PIN != SOURCE VERIFICATION.**

Run with Node 22+:

    node --test 004/tests/branch-census.test.mjs
    node 004/bin/branch-census.mjs build 004/capabilities.json
    node 004/bin/branch-census.mjs build 004/capabilities.json /tmp/planz-branch-snapshot.json
    node 004/bin/branch-census.mjs verify 004/capabilities.json /tmp/planz-branch-snapshot.json

The manifest pins exact Git commits and observed CI-run URLs. The census validates shape, preserves declared gates, produces a deterministic content-addressed catalog and cold-replays it. It does **not** fetch Git objects, verify CI independently, download donor bytes, install dependencies, run a donor CLI, select canon, contact a server, or grant runtime rights.

Suggested next bridge: CANNON verifies source bytes at these exact pins using its existing readSource primitive. Abundent may display this catalog as a **dated static projection** with direct links to source and CI; it must never advertise these candidates as automatically executable services.

To add a capability, preserve an exact SHA, branch hint, entrypoint, observed test receipt, limitations and local gates. Separate improvements to this manifest from any owner decision to execute the work.
