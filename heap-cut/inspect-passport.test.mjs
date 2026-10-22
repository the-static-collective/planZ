import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inspectPassport } from "./inspect-passport.mjs";

const fixture = JSON.parse(readFileSync(new URL("./network-passport-v0.json", import.meta.url), "utf8"));
const clone = () => structuredClone(fixture);

test("the whole proposed network is structurally legible but NOT operational", () => {
  const result = inspectPassport(clone());
  assert.equal(result.structuralValidity, "PASS", result.errors.join("; "));
  assert.equal(result.stage, "N0_CONCEIVED");
  assert.equal(result.operationalEvidence, "NONE");
  assert.equal(result.assignedEssentialOwners, 0);
  assert.equal(result.criticalOrgans, 7);
  assert.equal(result.criticalLinks, 10);
});

test("one successful-looking leg never substitutes for an essential organ", () => {
  const p = clone();
  p.coreOrgans = p.coreOrgans.filter(x => x.id !== "GOVERNANCE");
  assert.equal(inspectPassport(p).structuralValidity, "FAIL");
});

test("a network cannot quietly skip custody or recipient-return links", () => {
  for (const missing of ["L03", "L06"]) {
    const p = clone();
    p.criticalLinks = p.criticalLinks.filter(x => x.id !== missing);
    assert.equal(inspectPassport(p).structuralValidity, "FAIL", missing);
  }
});

test("a proposal cannot certify governance, food delivery or field proof", () => {
  for (const stage of ["N2", "N4", "N5"]) {
    const p = clone();
    p.crossingGates.find(x => x.id === stage).passed = true;
    assert.equal(inspectPassport(p).structuralValidity, "FAIL", stage);
  }
  const p = clone();
  p.coreOrgans[0].ownerConsent = "APPROVED";
  assert.equal(inspectPassport(p).structuralValidity, "FAIL");
});

test("aid cannot silently become commercial grocery money", () => {
  const p = clone();
  p.separateLedgerLanes[1].mayConvertTo.push("COMMERCIAL");
  assert.equal(inspectPassport(p).structuralValidity, "FAIL");
});

test("removing independent refusal or mandatory owner boundary is detected", () => {
  const p = clone();
  p.criticalLinks[1].refusalSupported = false;
  assert.equal(inspectPassport(p).structuralValidity, "FAIL");
  const q = clone();
  q.authority = "ASSUMED_BY_PLANZ";
  assert.equal(inspectPassport(q).structuralValidity, "FAIL");
});

test("the network survives optional nodes declining or disappearing", () => {
  const p = clone();
  p.optionalOrbits = [];
  assert.equal(inspectPassport(p).structuralValidity, "PASS");
});
