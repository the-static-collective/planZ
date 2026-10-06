import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildHeart001 } from "../src/heart-001-chain.mjs";
import { verifyTransitionChain } from "../../arrow/src/transition-engine.mjs";

function records(){
  return fs.readFileSync("registry/seed-plan-records.jsonl","utf8")
    .split(/\r?\n/).filter(Boolean).map(JSON.parse);
}

function run(){
  const all=records();
  return buildHeart001({
    fatherhandRecord:all.find((r)=>r.planId==="PLZ-TRANCH-FATHERHAND-001"),
    heartLungRecord:all.find((r)=>r.planId==="PLZ-IRON-LUNG-COMBINATRIX-001")
  });
}

test("Fatherhand generated candidate is deliberately refused and residue survives",()=>{
  const w=run();
  assert.equal(w.fatherhand.decision,"REFUSE");
  assert.match(w.fatherhand.candidateId,/^mut-/);
  assert.ok(w.fatherhand.residue.some((x)=>/grant-chain validator/.test(x)));
  assert.ok(verifyTransitionChain(w.fatherhand.receipts).valid);
  assert.equal(w.fatherhand.receipts.at(-1).kind,"REFUSE");
});

test("Heart-Lung generated candidate is separately admitted into owning-project history",()=>{
  const w=run();
  assert.equal(w.heartLung.decision,"ACCEPT");
  assert.match(w.heartLung.candidateId,/^mut-/);
  assert.equal(w.heartLung.ownerConsequence,"https://github.com/the-static-collective/iron-lung/pull/7");
  assert.equal(w.heartLung.ownerHead,"8e0c7a3f6f94a2a40562d59522ee1390d3b0dfb1");
  assert.deepEqual(w.heartLung.receipts.slice(-3).map((r)=>r.kind),["ADMIT","PERFORM","RETURN"]);
  assert.ok(verifyTransitionChain(w.heartLung.receipts).valid);
});

test("PLANZ-002 completion law is represented without promoting any receipt to authority",()=>{
  const w=run();
  assert.equal(w.result.humanReviewedRide,true);
  assert.equal(w.result.deliberateGeneratedCandidateRefusal,true);
  assert.equal(w.result.separatelyAdmittedCandidate,true);
  assert.equal(w.result.owningProjectConsequenceReturned,true);
  assert.equal(w.result.planZ002CompletionLawSatisfied,true);
  assert.equal(w.receiptAuthority,"none");
  assert.ok([...w.fatherhand.receipts,...w.heartLung.receipts]
    .every((r)=>r.receiptAuthority==="none"));
});

test("HEART-001 replay is deterministic",()=>{
  assert.deepEqual(run(),run());
});
