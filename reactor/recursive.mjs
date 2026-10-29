#!/usr/bin/env node
// REACTOR-001: bounded recursive plan compiler. Proposals only; no external effects.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile as compileBananas } from "./collide.mjs";

const SCHEMA = "static-collective/planz-recursive-reactor/v1";
const hash = value => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
const frozen = (prefix, value) => prefix + "-" + hash(value).slice(0, 24);
const assert = (condition, message) => { if (!condition) throw new Error("REACTOR-001: " + message); };
const sorted = xs => [...new Set(xs)].sort();
const ordered = (a, b) => a.id.localeCompare(b.id);
const proofOnly = {
  status: "PROPOSED_UNVERIFIED",
  authority: "NONE",
  humanSelection: "NONE",
  executed: false,
  admitted: false,
  published: false,
  externalOutcomeVerified: false
};

// The lenses are explicit procedural questions, not AI or empirical results.
// The owning projects have NOT approved these crossings.
export const LENSES = Object.freeze([
  {
    id: "ABSENCE",
    inspiration: "Static Workbench / MADDLOOP + MACHINE-CONJECTURE",
    pressure: "Remove one assumed capability or join. Which missing concrete port breaks the promised route?",
    protocol: "Freeze the original hypothesis; propose one missing-port counterexample and a separate repair descendant. Do not infer a viable executable lift.",
    stop: "Stop at the first unverified concrete join; preserve the obstruction."
  },
  {
    id: "TIME",
    inspiration: "Static Live / Ghostcast delayed encounter",
    pressure: "What changes if the return arrives a day later and must be treated as a new occurrence?",
    protocol: "Create a proposed delayed-return card with separate source and encounter clocks; never rewrite an earlier occurrence.",
    stop: "Stop if a replay is represented as original participation or a scheduled delivery is assumed."
  },
  {
    id: "CARRIER",
    inspiration: "STATIC OS / universal cartridges and offline first boot",
    pressure: "What is the smallest portable, offline-readable version that survives loss of the original environment?",
    protocol: "Propose a read-only ASK/OFFER/PROPOSE card, include exact source ancestry, and keep WITNESS/REPLICATE as unsatisfied human gates.",
    stop: "Stop at missing bytes, untested hardware, rights, or a required owner."
  },
  {
    id: "RECEIVER",
    inspiration: "Static Field / two-world reception and refusal",
    pressure: "What can a separate receiving world refuse without destroying the sender's history?",
    protocol: "Propose a two-sided HOLD/REFUSE simulation with separately named source and receiver decisions; no implicit arrival.",
    stop: "Stop whenever sender intention is mistaken for receiver admission."
  }
]);

function makeRoot(chamber, sourceDigest) {
  assert(typeof chamber.chamberId === "string" && chamber.chamberId.length > 0, "missing chamber identity");
  assert(chamber.status === "PROPOSED_UNVERIFIED" && chamber.executed === false && chamber.admitted === false, "source was promoted");
  assert(Array.isArray(chamber.proposedChainNotDependencies) && chamber.proposedChainNotDependencies.length, "missing source chain");
  assert(Array.isArray(chamber.orbitNotRequirements), "missing source orbit");
  assert(Array.isArray(chamber.humanAndSourceGates) && chamber.humanAndSourceGates.length >= 2, "missing source gates");
  const primary = sorted(chamber.proposedChainNotDependencies.map(x => x.planId));
  const orbit = sorted(chamber.orbitNotRequirements.map(x => x.planId));
  assert(primary.every(Boolean) && orbit.every(Boolean), "empty plan reference");
  const payload = {
    schema: SCHEMA + "/source", generation: 0, sourceDigest,
    chamberId: chamber.chamberId, title: chamber.name, question: chamber.question,
    smallestProof: chamber.smallestProof, primaryPlanIds: primary, orbitPlanIds: orbit,
    sourcePlanIds: sorted([...primary, ...orbit]),
    candidateOwnersNotApprovals: sorted(chamber.candidateOwnersNotApprovals || []),
    gates: chamber.humanAndSourceGates, ...proofOnly
  };
  return { id: frozen("src", payload), ...payload };
}

function cut(parent, lens, generation, sourceDigest) {
  const payload = {
    schema: SCHEMA + "/cut", generation, parentId: parent.id, sourceDigest,
    sourceRootIds: parent.sourceRootIds || [parent.id],
    sourcePlanIds: parent.sourcePlanIds,
    lensId: lens.id, inspirationNotIntegration: lens.inspiration,
    originalQuestion: parent.question, originalSmallestProof: parent.smallestProof,
    pressureQuestion: lens.pressure,
    proposedExperiment: lens.protocol,
    stopCondition: lens.stop, ...proofOnly
  };
  return { id: frozen("cut", payload), ...payload };
}

function synthesis(parent, cuts, generation, sourceDigest) {
  assert(cuts.length === LENSES.length && new Set(cuts.map(c => c.lensId)).size === LENSES.length, "synthesis requires four distinct lenses");
  assert(cuts.every(c => c.parentId === parent.id && c.generation === generation), "cut not from parent");
  const payload = {
    schema: SCHEMA + "/proposal", kind: "LENS_SYNTHESIS", generation, sourceDigest,
    parentIds: [parent.id], cutIds: cuts.map(c => c.id).sort(),
    sourceRootIds: parent.sourceRootIds || [parent.id],
    sourcePlanIds: parent.sourcePlanIds,
    title: parent.title + " / four-angle descendant " + generation,
    question: "Can four independent pressure tests reveal a better bounded route for " + parent.title + " without merging evidence or authority?",
    smallestProof: "Compare four independently saved proposed tests for " + parent.title + "; pick one reversible owner-reviewed experiment, or HOLD all.",
    unresolved: cuts.map(c => ({ lensId: c.lensId, stopCondition: c.stopCondition })),
    gates: sorted([...(parent.gates || []), "Explicit human KEEP/REFUSE before any source-owner execution."]),
    ...proofOnly
  };
  return { id: frozen("plan", payload), ...payload };
}

function bridge(a, b, aCuts, bCuts, generation, sourceDigest) {
  const shared = sorted(a.sourcePlanIds.filter(x => b.sourcePlanIds.includes(x)));
  assert(shared.length > 0 && a.id !== b.id, "bridge needs distinct source plans and shared exact leads");
  const selectedCuts = [...aCuts, ...bCuts].filter(x => x.lensId === "ABSENCE" || x.lensId === "RECEIVER");
  assert(selectedCuts.length === 4, "bridge must cite separate cuts for both parents");
  const payload = {
    schema: SCHEMA + "/proposal", kind: "OVERLAP_BRIDGE", generation, sourceDigest,
    parentIds: [a.id, b.id], cutIds: sorted(selectedCuts.map(x => x.id)),
    sourceRootIds: sorted([a.id, b.id]), sourcePlanIds: sorted([...a.sourcePlanIds, ...b.sourcePlanIds]),
    exactSharedLeadsNotVerifiedCompatibility: shared,
    title: a.title + " × " + b.title + " / provisional bridge",
    question: "Can one shared plan lead be tested from both independent worlds without treating their overlap as compatibility or consent?",
    smallestProof: "Choose one shared lead (" + shared[0] + "); prepare two independent proposal cards and one explicit refusal test; HOLD the crossing.",
    unresolved: [{ question: "No actual owner-to-owner transport, compatibility, authorization, or real-world handoff was checked." }],
    gates: sorted([...a.gates, ...b.gates, "Verify actual compatibility and independent receiver choice."]),
    ...proofOnly
  };
  return { id: frozen("plan", payload), ...payload };
}

// Each round is an immutable, source-linked projection. Round outputs are new
// proposals, never modifications to source plans or approvals to run anything.
export function compileRecursion(bananas, { depth = 2, crossLimit = 4 } = {}) {
  assert(Number.isInteger(depth) && depth >= 1 && depth <= 3, "depth must be 1..3");
  assert(Number.isInteger(crossLimit) && crossLimit >= 0 && crossLimit <= 8, "crossLimit must be 0..8");
  assert(bananas?.schema === "static-collective/planz-banana-reactor-output/v0", "requires native BANANAS-001 output");
  assert(bananas.currentInputEvidence?.allUnknown === true && bananas.currentInputEvidence?.allLowConfidence === true, "unexpected source evidence state");
  assert(Array.isArray(bananas.chambers) && bananas.chambers.length === 8, "requires eight original chambers");
  assert(typeof bananas.outputSha256 === "string" && /^[a-f0-9]{64}$/.test(bananas.outputSha256), "missing ancestor digest");
  const original = { ...bananas }; delete original.outputSha256;
  assert(hash(original) === bananas.outputSha256, "ancestor output digest mismatch");
  const sourceDigest = bananas.outputSha256;
  const roots = bananas.chambers.map(c => makeRoot(c, sourceDigest)).sort(ordered);
  assert(new Set(roots.map(r => r.chamberId)).size === roots.length, "duplicate chamber");
  const cuts = [], proposals = [], rounds = [];
  let frontier = roots;
  for (let generation = 1; generation <= depth; generation++) {
    const next = [], byParent = new Map();
    for (const plan of frontier) {
      const views = LENSES.map(l => cut(plan, l, generation, sourceDigest));
      cuts.push(...views); byParent.set(plan.id, views);
      next.push(synthesis(plan, views, generation, sourceDigest));
    }
    let bridges = [];
    if (generation === 1 && crossLimit > 0) {
      const ranked = [];
      for (let i = 0; i < roots.length; i++) for (let j = i + 1; j < roots.length; j++) {
        const a = roots[i], b = roots[j];
        const sharedCount = a.sourcePlanIds.filter(x => b.sourcePlanIds.includes(x)).length;
        if (sharedCount) ranked.push({ a, b, sharedCount });
      }
      ranked.sort((x, y) => y.sharedCount - x.sharedCount || x.a.id.localeCompare(y.a.id) || x.b.id.localeCompare(y.b.id));
      bridges = ranked.slice(0, crossLimit).map(({ a, b }) => bridge(a, b, byParent.get(a.id), byParent.get(b.id), generation, sourceDigest));
      next.push(...bridges);
    }
    const unique = new Set(next.map(p => p.id));
    assert(unique.size === next.length, "duplicate generated plan");
    proposals.push(...next);
    rounds.push({ generation, inputPlans: frontier.length, savedPerspectiveCuts: frontier.length * LENSES.length,
      newLensPlans: frontier.length, newBridgePlans: bridges.length, nextFrontier: next.length });
    frontier = next.sort(ordered);
  }
  const result = {
    schema: SCHEMA + "/manifest", source: {
      recipeCompiler: "BANANAS-001", ancestorOutputSha256: sourceDigest,
      harvestedRecordsSha256: bananas.source.recordsSha256, recipesSha256: bananas.source.recipesSha256,
      evidenceLevel: "LOW/UNKNOWN conversation reconstruction"
    },
    parameters: { depth, crossLimit, fixedLensCount: LENSES.length },
    lenses: LENSES,
    roots, cuts: cuts.sort(ordered), proposedPlans: proposals.sort(ordered), rounds,
    boundary: ["DIFFERENT VIEW != NEW FACT", "RECURSION != AUTHORITY",
      "ABSTRACT JOIN != CONCRETE EXECUTION", "SOURCE OVERLAP != COMPATIBILITY",
      "SELECTION != ADMISSION", "HISTORY != REWRITTEN"],
    ...proofOnly
  };
  const all = [...roots, ...cuts, ...proposals];
  assert(new Set(all.map(x => x.id)).size === all.length, "address collision");
  assert(all.every(x => x.sourceDigest === sourceDigest), "lost ancestor digest");
  assert(all.every(x => x.authority === "NONE" && !x.executed && !x.admitted && !x.published), "spurious authority");
  result.manifestSha256 = hash(result);
  return result;
}

export function renderMarkdown(result) {
  const lines = [
    "# REACTOR-001 — The Recursive Plan Compiler", "",
    "**PROPOSED / HELD. Not a source-owner acceptance, engine integration, field result or autonomous planner.**", "",
    "Ancestor digest: " + result.source.ancestorOutputSha256,
    "Manifest digest: " + result.manifestSha256, "",
    "Four different lenses make separate immutable views. Compositions cite those views and become only **candidate plans** for the next bounded round.",
    "Each run has finite depth, finite crossing count, no model or network, and no effect authority.", "",
    "## Rounds", "",
    "| Generation | Input plans | Saved cuts | Lens proposals | Shared-lead bridges |",
    "|---|---:|---:|---:|---:|"
  ];
  for (const r of result.rounds) lines.push("| " + r.generation + " | " + r.inputPlans + " | " + r.savedPerspectiveCuts + " | " + r.newLensPlans + " | " + r.newBridgePlans + " |");
  lines.push("", "## Newly proposed plans", "");
  for (const p of result.proposedPlans.filter(p => p.generation === result.parameters.depth)) {
    lines.push("### " + p.title, "",
      "ID: " + p.id + " | " + p.kind + " | generation " + p.generation, "",
      p.question, "", "Smallest proposed proof: " + p.smallestProof,
      "", "Parents: " + p.parentIds.join(", "),
      "", "Cuts: " + p.cutIds.join(", "),
      "", "Status: PROPOSED_UNVERIFIED; authority NONE; execution NO.", "");
  }
  lines.push("## The human gate", "",
    "A person may inspect, compare, KEEP as an editorial preference, HOLD or REFUSE. A project owner must separately verify its sources, rights, real ports, and execution. The compiler never edits source plans, publishes, runs donor machines, or manufactures a receipt of success.", "");
  return lines.join("\n");
}

// Persist each addressed cut/plan as a separate immutable JSON file.
// A repeated save is idempotent; existing tampered bytes fail closed.
export function saveLedger(result, destination) {
  const out = resolve(destination);
  const save = (kind, id, value) => {
    const dir = join(out, kind); mkdirSync(dir, { recursive: true });
    const path = join(dir, id + ".json");
    const bytes = JSON.stringify(value, null, 2) + "\n";
    try { writeFileSync(path, bytes, { encoding: "utf8", flag: "wx" }); }
    catch (err) {
      if (err.code !== "EEXIST") throw err;
      assert(readFileSync(path, "utf8") === bytes, "saved identity collision or tampering: " + id);
    }
    return path;
  };
  for (const c of result.cuts) save("cuts", c.id, c);
  for (const p of result.proposedPlans) save("proposals", p.id, p);
  return save("manifests", result.manifestSha256, result);
}

function main(argv) {
  let depth = 2, crossLimit = 4, format = "md", outDir = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--depth") depth = Number(argv[++i]);
    else if (argv[i] === "--cross-limit") crossLimit = Number(argv[++i]);
    else if (argv[i] === "--format") format = argv[++i];
    else if (argv[i] === "--out-dir") outDir = argv[++i];
    else throw new Error("unknown argument " + argv[i]);
  }
  assert(["md", "json"].includes(format), "format must be md or json");
  const harvest = readFileSync(new URL("../registry/conversation-plan-records-2026-10-16.jsonl", import.meta.url), "utf8");
  const recipes = readFileSync(new URL("./recipes-v0.json", import.meta.url), "utf8");
  const result = compileRecursion(compileBananas(harvest, recipes), { depth, crossLimit });
  if (outDir) saveLedger(result, outDir);
  process.stdout.write(format === "json" ? JSON.stringify(result, null, 2) + "\n" : renderMarkdown(result));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (err) { process.stderr.write(err.message + "\n"); process.exitCode = 1; }
}
