import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { compile as compileBananas } from "./collide.mjs";
import { LENSES, compileRecursion, renderMarkdown, saveLedger } from "./recursive.mjs";

const harvest = readFileSync(new URL("../registry/conversation-plan-records-2026-10-16.jsonl", import.meta.url), "utf8");
const recipes = readFileSync(new URL("./recipes-v0.json", import.meta.url), "utf8");
const original = compileBananas(harvest, recipes);
const h = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("native BANANAS source compiles four immutable different views per plan", () => {
  const before = JSON.stringify(original);
  const r = compileRecursion(original, { depth: 1, crossLimit: 0 });
  assert.equal(r.roots.length, 8);
  assert.equal(r.cuts.length, 8 * LENSES.length);
  assert.equal(r.proposedPlans.length, 8);
  assert.equal(r.rounds[0].newBridgePlans, 0);
  assert.equal(JSON.stringify(original), before);
  for (const root of r.roots) {
    const cuts = r.cuts.filter(c => c.parentId === root.id);
    assert.deepEqual(cuts.map(x => x.lensId).sort(), LENSES.map(x => x.id).sort());
    assert.ok(cuts.every(c => c.sourceDigest === original.outputSha256));
    assert.ok(cuts.every(c => c.originalQuestion === root.question));
  }
});

test("second and third generations inherit exact parents without pretending to be field events", () => {
  for (const depth of [2, 3]) {
    const r = compileRecursion(original, { depth, crossLimit: 4 });
    assert.equal(r.rounds.length, depth);
    assert.equal(r.rounds[0].inputPlans, 8);
    assert.equal(r.rounds[0].savedPerspectiveCuts, 8 * LENSES.length);
    const all = [...r.roots, ...r.cuts, ...r.proposedPlans];
    const ids = new Set(all.map(x => x.id));
    assert.equal(ids.size, all.length);
    assert.ok(all.every(x => x.status === "PROPOSED_UNVERIFIED" && x.authority === "NONE"));
    assert.ok(all.every(x => !x.executed && !x.admitted && !x.published && !x.externalOutcomeVerified));
    for (const p of r.proposedPlans) {
      assert.ok(p.parentIds.every(id => ids.has(id)));
      assert.ok(p.cutIds.length >= 4 && p.cutIds.every(id => ids.has(id)));
      assert.ok(p.sourceRootIds.every(id => r.roots.some(root => root.id === id)));
      assert.ok(p.sourcePlanIds.every(id => r.roots.some(root => root.sourcePlanIds.includes(id))));
    }
    for (const c of r.cuts) assert.ok(ids.has(c.parentId));
    assert.equal(r.rounds.slice(1).every(x => x.newBridgePlans === 0), true);
  }
});

test("cross-chamber plans must share exact source leads, not only a suggestive theme", () => {
  const r = compileRecursion(original, { depth: 1, crossLimit: 8 });
  const bridges = r.proposedPlans.filter(p => p.kind === "OVERLAP_BRIDGE");
  assert.ok(bridges.length > 0);
  for (const p of bridges) {
    assert.equal(p.parentIds.length, 2);
    assert.ok(p.exactSharedLeadsNotVerifiedCompatibility.length > 0);
    const parents = p.parentIds.map(id => r.roots.find(x => x.id === id));
    assert.ok(p.exactSharedLeadsNotVerifiedCompatibility.every(id => parents.every(root => root.sourcePlanIds.includes(id))));
  }
});

test("unchanged sources replay exactly; distinct depths generate independently addressed snapshots", () => {
  const a = compileRecursion(original, { depth: 2, crossLimit: 4 });
  const b = compileRecursion(original, { depth: 2, crossLimit: 4 });
  const c = compileRecursion(original, { depth: 1, crossLimit: 4 });
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(a.manifestSha256, b.manifestSha256);
  assert.notEqual(a.manifestSha256, c.manifestSha256);
  assert.match(renderMarkdown(a), /Recursive Plan Compiler/);
  assert.match(renderMarkdown(a), /PROPOSED \/ HELD/);
});

test("reject wrong ancestor digest, forged admission, unsafe recursion limits", () => {
  const changed = structuredClone(original);
  changed.chambers[0].question = "forged";
  assert.throws(() => compileRecursion(changed), /digest mismatch/);
  const promoted = structuredClone(original);
  promoted.chambers[0].status = "ACCEPTED";
  delete promoted.outputSha256;
  promoted.outputSha256 = h(promoted);
  assert.throws(() => compileRecursion(promoted), /source was promoted/);
  assert.throws(() => compileRecursion(original, { depth: 0 }), /depth must be/);
  assert.throws(() => compileRecursion(original, { depth: 4 }), /depth must be/);
  assert.throws(() => compileRecursion(original, { crossLimit: -1 }), /crossLimit/);
  assert.throws(() => compileRecursion(original, { crossLimit: 999 }), /crossLimit/);
});

test("each perspective and candidate is persisted independently; tampering fails closed", () => {
  const dir = mkdtempSync(join(tmpdir(), "planz-reactor-"));
  try {
    const r = compileRecursion(original, { depth: 2, crossLimit: 3 });
    const manifestPath = saveLedger(r, dir);
    assert.equal(JSON.parse(readFileSync(manifestPath, "utf8")).manifestSha256, r.manifestSha256);
    assert.equal(saveLedger(r, dir), manifestPath); // exact replay does not overwrite
    const cut = r.cuts[0];
    const path = join(dir, "cuts", cut.id + ".json");
    const saved = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(saved.parentId, cut.parentId);
    assert.equal(saved.lensId, cut.lensId);
    writeFileSync(path, '{"tampered":true}\n');
    assert.throws(() => saveLedger(r, dir), /tampering/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
