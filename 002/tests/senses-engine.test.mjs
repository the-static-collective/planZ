import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveSenseFrame,
  unaryMutation,
  crossMutation,
  pressureMutation,
  stableStringify
} from "../002/src/senses-engine.mjs";

const stranded={
  schema:"static-collective/planz-plan-record/v0",
  planId:"P1",
  title:"Stranded machine",
  source:[{kind:"pr",ref:"pr:1",sha:null,note:null}],
  stage:"IMPLEMENTING",
  disposition:"STRANDED",
  evidence:{implementationRefs:["branch:old"],descendantRefs:[],negativeSearches:[],notes:[]},
  remaining:{summary:"Run the final gate.",tasks:["gate"],nextGate:"human witness",recoveryMode:"RESURRECT"},
  relations:[],
  confidence:"HIGH"
};

const other={
  ...stranded,
  planId:"P2",
  title:"Other machine",
  disposition:"UNKNOWN",
  evidence:{implementationRefs:[],descendantRefs:[],negativeSearches:[],notes:[]},
  remaining:{summary:"Find out what happened.",tasks:["probe"],nextGate:null,recoveryMode:"INVESTIGATE"},
  confidence:"MEDIUM"
};

test("derives addressable gap and stranding without authority", () => {
  const frame=deriveSenseFrame(stranded);
  assert.equal(frame.signals.gap.present,true);
  assert.equal(frame.signals.stranding.present,true);
  assert.equal(frame.authority,"none");
  assert.equal(frame.selection,"NONE");
});

test("maps declared recovery posture to bounded maxhinal", () => {
  const candidate=unaryMutation(stranded);
  assert.equal(candidate.chamber,"REANIMATE");
  assert.deepEqual(candidate.sourcePlanIds,["P1"]);
  assert.equal(candidate.authority,"none");
});

test("CROSS refuses automatic composition without a hinge", () => {
  const candidate=crossMutation(stranded,other,null);
  assert.equal(candidate.chamber,"CROSS");
  assert.ok(candidate.residuals.includes("MISSING_EXPLICIT_HINGE"));
  assert.match(candidate.proposal,/REFUSED/);
});

test("CROSS preserves both ancestries when a hinge is explicit", () => {
  const candidate=crossMutation(stranded,other,"shared unresolved receipt boundary");
  assert.deepEqual(candidate.sourcePlanIds,["P1","P2"]);
  assert.equal(candidate.hinge,"shared unresolved receipt boundary");
  assert.equal(candidate.selection,"NONE");
});

test("PRESSURE remains non-promoting", () => {
  const candidate=unaryMutation(stranded);
  const pressure=pressureMutation(candidate);
  assert.equal(pressure.chamber,"PRESSURE");
  assert.ok(pressure.residuals.includes("pressure-survival-does-not-promote"));
});

test("semantic output is deterministic", () => {
  const a=stableStringify(deriveSenseFrame(stranded));
  const b=stableStringify(deriveSenseFrame(structuredClone(stranded)));
  assert.equal(a,b);
});
