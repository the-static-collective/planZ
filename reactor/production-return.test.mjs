import test from "node:test";
import assert from "node:assert/strict";
import {compileProductionRound,confirmRound} from "./production-return.mjs";
const brief={schema:"jarvis.creative-production-brief/v1",projectId:"GENESIS-RETURN-001",
 approval:"SYNTHETIC_TEST_ONLY",publish:false,rightsGranted:false,
 requestedArtifact:"LOCAL_SCREENING_PACKAGE"};
test("planZ accepts 4 bounded cycles and moves only after source evidence return",()=>{
 let parent=null,returnEvidence=null;
 for(let i=0;i<4;i++){
  const p=compileProductionRound({brief,round:i,previous:parent,evidence:returnEvidence});
  assert.equal(p.round,i);
  assert.equal(p.automaticallyAuthorized,false);
  assert.equal(p.parentRoundSha256,parent?.roundSha256??null);
  const returnPayload={schema:"jarvis.production-return/v1",round:i,route:p.route,
   parentRoundSha256:p.roundSha256,status:"SOURCE_NATIVE_VERIFIED",
   artifactSha256:(i+1).toString(16).repeat(64),published:false,
   rightsGranted:false,realWorldActions:0};
  const confirmation=confirmRound({plan:p,evidence:returnPayload});
  assert.equal(confirmation.round,i);
  if(i===3)assert.equal(confirmation.disposition,"LOCAL_ARTIFACT_COMPLETE_REVIEW_HELD");
  parent=p;returnEvidence=returnPayload;
 }
 assert.throws(()=>compileProductionRound({brief,round:4,previous:parent,evidence:returnEvidence}),/ROUND_BOUND/);
});
test("forged receipts, source hashes, publication and skipped phases all HOLD",()=>{
 const p=compileProductionRound({brief});
 const receipt={schema:"jarvis.production-return/v1",round:0,route:p.route,
  parentRoundSha256:p.roundSha256,status:"SOURCE_NATIVE_VERIFIED",
  artifactSha256:"a".repeat(64),published:false,rightsGranted:false,realWorldActions:0};
 for(const change of [{artifactSha256:"unknown"},{published:true},{rightsGranted:true},
  {status:"ASSUMED"},{parentRoundSha256:"b".repeat(64)},{round:2}]){
  assert.throws(()=>confirmRound({plan:p,evidence:{...receipt,...change}}),/HOLD/);
 }
 assert.throws(()=>compileProductionRound({brief,round:1,previous:p,evidence:null}),/HOLD/);
 assert.throws(()=>compileProductionRound({brief:{...brief,publish:true}}),/HOLD/);
});
