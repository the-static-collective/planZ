import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile, renderMarkdown } from "./collide.mjs";

const recipeText = readFileSync(new URL("./recipes-v0.json", import.meta.url), "utf8");
const harvestedText = readFileSync(new URL("../registry/conversation-plan-records-2026-10-16.jsonl", import.meta.url), "utf8");
const records = harvestedText.trim().split(/\r?\n/).map(x => JSON.parse(x));
const serialized = rows => rows.map(x => JSON.stringify(x)).join("\n") + "\n";

test("all 64 actual harvested seeds belong to eight bounded chambers", () => {
  const result = compile(harvestedText, recipeText);
  assert.deepEqual(result.coverage, {
    uniqueSeeds: 64, chambers: 8, memberships: 98, multiChamberSeeds: 34, uncovered: []
  });
  assert.equal(result.currentInputEvidence.allUnknown, true);
  assert.equal(result.currentInputEvidence.allLowConfidence, true);
  assert.ok(result.chambers.every(x => x.executed === false && x.admitted === false && x.published === false));
  assert.ok(result.chambers.every(x => x.humanAndSourceGates.length >= 2));
});

test("identical source and recipes produce byte-identical replay and Markdown", () => {
  const a = compile(harvestedText, recipeText);
  const b = compile(harvestedText, recipeText);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(renderMarkdown(a), renderMarkdown(b));
  assert.match(renderMarkdown(a), /64-Seed Reactor/);
  assert.match(renderMarkdown(a), /PROPOSAL ONLY/);
});

test("a missing seed is refused, not silently covered", () =>
  assert.throws(() => compile(serialized(records.slice(1)), recipeText), /expected exactly 64/));

test("duplicate seed and forged planId are refused", () => {
  assert.throws(() => compile(serialized([...records.slice(0, 63), records[0]]), recipeText), /duplicate seed/);
  const altered = structuredClone(records);
  altered[5].planId = "PLZ-CHAT-20261016-Z99";
  assert.throws(() => compile(serialized(altered), recipeText), /unexpected planId/);
});

test("unknown member, missing gates and recipe status escalation are refused", () => {
  const raw = JSON.parse(recipeText);
  raw.cards[0].primary.push("N99");
  assert.throws(() => compile(harvestedText, JSON.stringify(raw)), /unknown member/);
  const gates = JSON.parse(recipeText);
  gates.cards[0].gates = [];
  assert.throws(() => compile(harvestedText, JSON.stringify(gates)), /missing independent gates/);
  const status = JSON.parse(recipeText);
  status.status = "LANDED";
  assert.throws(() => compile(harvestedText, JSON.stringify(status)), /must remain provisional/);
});

test("source records remain unchanged and status is not inferred as acceptance", () => {
  const before = serialized(records);
  const r = compile(before, recipeText);
  assert.equal(serialized(records), before);
  assert.deepEqual(r.boundary.includes("PROPOSAL != EXECUTION"), true);
  assert.ok(r.chambers.every(c => c.status === "PROPOSED_UNVERIFIED"));
});
