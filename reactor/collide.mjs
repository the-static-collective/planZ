#!/usr/bin/env node
// BANANAS-001: deterministic proposal compiler. No repo mutation, source import or execution.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const digest = value => createHash("sha256").update(value, "utf8").digest("hex");
const expectedIds = new Set(
  [["N", 12], ["M", 10], ["V", 9], ["W", 10], ["P", 11], ["C", 12]]
    .flatMap(([prefix, count]) => Array.from({ length: count }, (_, i) =>
      prefix + String(i + 1).padStart(2, "0")))
);

function fail(message) { throw new Error("BANANAS-001: " + message); }
function seedCode(planId) {
  const match = /^PLZ-CHAT-20261016-([NMVWPC][0-9]{2})$/.exec(planId);
  if (!match) fail("unexpected planId: " + planId);
  return match[1];
}

export function compile(recordsText, recipesText) {
  const lines = recordsText.trim().split(/\r?\n/).filter(Boolean);
  const records = lines.map((line, i) => {
    try { return JSON.parse(line); }
    catch { fail("malformed input JSONL line " + (i + 1)); }
  });
  const config = JSON.parse(recipesText);
  if (config.schema !== "static-collective/planz-banana-reactor/v0") fail("wrong recipe schema");
  if (config.status !== "PROPOSED_UNVERIFIED") fail("recipe status must remain provisional");
  if (records.length !== 64) fail("expected exactly 64 quarantined records");
  const byCode = new Map();
  for (const row of records) {
    if (row.schema !== "static-collective/planz-plan-record/v0") fail("wrong PlanRecord schema");
    const key = seedCode(row.planId);
    if (!expectedIds.has(key) || byCode.has(key)) fail("unknown or duplicate seed: " + key);
    if (!Array.isArray(row.source) || !row.source.length) fail("missing source lead: " + key);
    if (!row.remaining?.summary) fail("missing smallest remaining edge: " + key);
    byCode.set(key, row);
  }
  for (const id of expectedIds) if (!byCode.has(id)) fail("missing harvested seed: " + id);
  if (!Array.isArray(config.cards) || config.cards.length !== 8) fail("expected eight chambers");
  const counts = new Map();
  const chamberIds = new Set();
  const offers = config.cards.map(card => {
    if (!card.id || chamberIds.has(card.id)) fail("duplicate or empty chamber id");
    chamberIds.add(card.id);
    if (!card.name || !card.question || !card.smallestProof || !card.returns) fail("incomplete chamber: " + card.id);
    if (!card.todayDoor || !Array.isArray(card.ownerCandidates) || !card.ownerCandidates.length) fail("missing routing candidate: " + card.id);
    if (!Array.isArray(card.gates) || card.gates.length < 2) fail("missing independent gates: " + card.id);
    if (!Array.isArray(card.primary) || card.primary.length < 3 || !Array.isArray(card.orbit)) fail("bad membership: " + card.id);
    const members = [...card.primary, ...card.orbit];
    if (new Set(members).size !== members.length) fail("duplicate member within " + card.id);
    for (const id of members) {
      if (!byCode.has(id)) fail("unknown member " + id + " in " + card.id);
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    const summarize = id => {
      const r = byCode.get(id);
      return { id, planId: r.planId, title: r.title, ownerRepo: r.ownerRepo ?? null,
        stage: r.stage, disposition: r.disposition, confidence: r.confidence };
    };
    return {
      chamberId: card.id,
      name: card.name,
      todayDoor: card.todayDoor,
      question: card.question,
      status: "PROPOSED_UNVERIFIED",
      candidateOwnersNotApprovals: card.ownerCandidates,
      proposedChainNotDependencies: card.primary.map(summarize),
      orbitNotRequirements: card.orbit.map(summarize),
      smallestProof: card.smallestProof,
      proposedReturn: card.returns,
      humanAndSourceGates: card.gates,
      executed: false,
      admitted: false,
      published: false
    };
  });
  const uncovered = [...expectedIds].filter(id => !counts.has(id));
  if (uncovered.length) fail("uncovered seeds: " + uncovered.join(", "));
  const normalizedInput = { recordsSha256: digest(recordsText), recipesSha256: digest(recipesText) };
  const result = {
    schema: "static-collective/planz-banana-reactor-output/v0",
    claim: "Proposal-only composition of unverified candidate leads",
    source: { branchCarrier: "harvest/conversation-ideas-2026-10-16-001", ...normalizedInput },
    boundary: ["CONVERSATION != SOURCE WITNESS", "COMPOSITION != APPROVAL", "REACHABILITY != AUTHORITY",
      "SOURCE RIGHTS REMAIN LOCAL", "PROPOSAL != EXECUTION", "PUBLICATION REQUIRES HUMAN CHOICE"],
    loop: config.loop,
    coverage: { uniqueSeeds: byCode.size, chambers: offers.length,
      memberships: [...counts.values()].reduce((a, b) => a + b, 0),
      multiChamberSeeds: [...counts.values()].filter(n => n > 1).length, uncovered },
    currentInputEvidence: { allUnknown: [...byCode.values()].every(r => r.disposition === "UNKNOWN"),
      allLowConfidence: [...byCode.values()].every(r => r.confidence === "LOW"),
      primaryTranscriptHashesSupplied: false, freshOwnerRuntimeAuditPerformed: false },
    chambers: offers
  };
  result.outputSha256 = digest(JSON.stringify(result));
  return result;
}

const escapeCell = x => String(x).replaceAll("|", "\\|").replaceAll("\n", " ");
export function renderMarkdown(result) {
  const h = result.source;
  const parts = [
    "# BANANAS-001 — The 64-Seed Reactor",
    "",
    "**PROPOSAL ONLY. No seed promoted, owner admitted, machine run, or public site deployed.**",
    "",
    "64 distinct candidate seeds -> eight overlapping chambers -> one human-chosen bounded pilot -> locally controlled source/selection/return receipts.",
    "",
    "This is a new **composition view** over the quarantined conversation harvest, not an authoritative plan ledger or a proof that any specific project is ready.",
    "",
    "## Replay receipt",
    "",
    "- Harvest SHA-256: \`" + h.recordsSha256 + "\`",
    "- Recipe SHA-256: \`" + h.recipesSha256 + "\`",
    "- Derived output SHA-256: \`" + result.outputSha256 + "\`",
    "- Seeds: " + result.coverage.uniqueSeeds + "; chambers: " + result.coverage.chambers +
      "; membership edges: " + result.coverage.memberships + "; seeds crossing multiple chambers: " + result.coverage.multiChamberSeeds + ".",
    "- Present evidence: all disposition UNKNOWN = " + result.currentInputEvidence.allUnknown +
      "; all confidence LOW = " + result.currentInputEvidence.allLowConfidence + ".",
    "",
    "## Eight unapproved candidate missions",
    "",
    "| Door | Chamber | Proposed chain (not dependency proof) | Smallest bounded pilot |",
    "|---|---|---|---|"
  ];
  for (const c of result.chambers) parts.push("| " + escapeCell(c.todayDoor) + " | " + escapeCell(c.name) +
    " | " + c.proposedChainNotDependencies.map(x => x.id).join(" → ") +
    " | " + escapeCell(c.smallestProof) + " |");
  parts.push("", "## Mission capsules");
  for (const c of result.chambers) {
    parts.push("", "### " + c.name + " — " + c.todayDoor, "",
      c.question, "",
      "**Core proposed encounter:** " + c.proposedChainNotDependencies.map(x => x.id + " " + x.title).join(" → "), "",
      "**Orbit (possibilities, not requirements):** " + c.orbitNotRequirements.map(x => x.id).join(", "), "",
      "**One proof:** " + c.smallestProof, "",
      "**Returns:** " + c.proposedReturn, "",
      "**Candidate owners (not consent):** " + c.candidateOwnersNotApprovals.join(", "), "",
      "**Independent gates:**");
    for (const gate of c.humanAndSourceGates) parts.push("- " + gate);
  }
  parts.push("", "## Selection and refusal", "",
    "The chamber menu never chooses its own deployment. A person must select exactly one particular and one chamber; then an owning project verifies current source, rights, implementation and smallest remaining edge.",
    "Refusal preserves the seed and its ancestry. A missing source, unsuitable rights, absent receiver or unapproved owner yields HOLD; no synthetic success receipt.",
    "",
    "## Tool boundary", "",
    "This static compiler reads the existing public-safe quarantine JSONL and a reviewed recipe map. It emits deterministic JSON or Markdown **proposals**, with no network calls, modification of seed records, private export import, Git merge, provider invocation, physical-world operation or site deployment.",
    "",
    "When a project actually performs a pilot, it needs a separate real owner-issued receipt. Do not write that receipt in this generator.",
    "");
  return parts.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  let recordsPath = fileURLToPath(new URL("../registry/conversation-plan-records-2026-10-16.jsonl", import.meta.url));
  let recipesPath = fileURLToPath(new URL("./recipes-v0.json", import.meta.url));
  let outputPath = null, format = "md";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--records") recordsPath = resolve(args[++i] || fail("missing records path"));
    else if (args[i] === "--recipes") recipesPath = resolve(args[++i] || fail("missing recipes path"));
    else if (args[i] === "--out") outputPath = resolve(args[++i] || fail("missing output path"));
    else if (args[i] === "--format") format = args[++i];
    else fail("unknown argument: " + args[i]);
  }
  if (!["md", "json"].includes(format)) fail("format must be md or json");
  const r = compile(readFileSync(recordsPath, "utf8"), readFileSync(recipesPath, "utf8"));
  const printed = format === "json" ? JSON.stringify(r, null, 2) + "\n" : renderMarkdown(r);
  if (outputPath) writeFileSync(outputPath, printed, "utf8");
  else process.stdout.write(printed);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { process.stderr.write(error.message + "\n"); process.exitCode = 1; }
}
