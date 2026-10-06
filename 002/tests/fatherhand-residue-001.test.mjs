import test from "node:test";
import assert from "node:assert/strict";
import { buildFatherhandResidue001 } from "../src/fatherhand-residue-001.mjs";
import { verifyTransitionChain } from "../../arrow/src/transition-engine.mjs";

test("new residue admission does not reverse prior Fatherhand refusal",()=>{
  const w=buildFatherhandResidue001();
  assert.equal(w.priorFatherhandDecision,"REFUSE");
  assert.equal(w.priorCandidateId,"mut-ba2399e2f3d57d8e");
  assert.equal(w.newDecision,"ACCEPT");
  assert.ok(w.laws.includes("NEW ADMISSION != REVERSAL OF PRIOR REFUSAL"));
  assert.ok(w.receipts[0].nonClaims.some((x)=>/does not reopen or reverse/.test(x)));
});

test("residue crosses through a fresh OBSERVE → PROPOSE → ADMIT → PERFORM → RETURN chain",()=>{
  const w=buildFatherhandResidue001();
  assert.deepEqual(w.receipts.map((r)=>r.kind),[
    "OBSERVE","PROPOSE","ADMIT","PERFORM","RETURN"
  ]);
  assert.ok(verifyTransitionChain(w.receipts).valid);
  assert.equal(w.receipts[2].admission.decision,"ACCEPT");
  assert.equal(w.receipts[2].admission.authorityRef,
    "human:current-conversation:2026-10-06:fatherhand-grant-chain-approved");
});

test("owning-project consequence is pinned and receipts remain non-authoritative",()=>{
  const w=buildFatherhandResidue001();
  assert.equal(w.ownerConsequence,"https://github.com/the-static-collective/tranchnode/pull/79");
  assert.equal(w.ownerHead,"cfb7b5009deb16d318c08885ced5a7f4ba2c846b");
  assert.equal(w.receiptAuthority,"none");
  assert.ok(w.receipts.every((r)=>r.receiptAuthority==="none"));
});

test("residue witness replay is deterministic",()=>{
  assert.deepEqual(buildFatherhandResidue001(),buildFatherhandResidue001());
});
