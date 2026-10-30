import test from "node:test";
import assert from "node:assert/strict";
import {startCreativeBrief,planNext,confirmReturn} from "./minute-mail.mjs";
const objective="Build a delightful useful post office where a lost minute of scrolling is returned as a small act of care for a neighbor.";
test("new open objective yields a bounded novel concept and four successive real evidence-gated rounds",()=>{
 const intent=startCreativeBrief(objective);
 assert.equal(intent.workingTitle,"THE LOST MINUTE POST OFFICE");
 assert.ok(intent.usefulAct.includes("neighbor"));
 let prev=null,ev=null;
 for(let i=0;i<4;i++){
  const plan=planNext(intent,i,prev,ev);
  assert.equal(plan.round,i);
  assert.equal(plan.status,"LOCAL_PROPOSED_NOT_AUTHORIZED");
  assert.equal(plan.published,false);
  const returned={schema:"jarvis.minute-mail-return/v1",round:i,kind:plan.expectedReturn,
   planSha256:plan.planSha256,nativeArtifactSha256:String(i+4).repeat(64),
   published:false,rightsGranted:false};
  assert.equal(confirmReturn(plan,returned).permissionGranted,false);
  prev=plan;ev=returned;
 }
 assert.throws(()=>planNext(intent,4,prev,ev),/BOUNDED/);
});
test("different objective genuinely influences original creative plan, no fixed Genesis template",()=>{
 const a=startCreativeBrief(objective);
 const b=startCreativeBrief("Create a beautiful one-minute exchange to help two people listen carefully to one another after a difficult day.");
 assert.notEqual(a.intentSha256,b.intentSha256);
 assert.notEqual(a.usefulAct,b.usefulAct);
 assert.notEqual(planNext(a,0).planSha256,planNext(b,0).planSha256);
});
test("no skipped return, invented proof, or authority promotion",()=>{
 const intent=startCreativeBrief(objective);
 const p=planNext(intent,0);
 assert.throws(()=>planNext(intent,1,p,null),/PARENT_EVIDENCE/);
 const good={schema:"jarvis.minute-mail-return/v1",round:0,kind:p.expectedReturn,
  planSha256:p.planSha256,nativeArtifactSha256:"a".repeat(64),
  published:false,rightsGranted:false};
 for(const changed of [{published:true},{nativeArtifactSha256:"invented"},{round:3},{planSha256:"b".repeat(64)}]){
  assert.throws(()=>confirmReturn(p,{...good,...changed}),/RETURN/);
 }
 assert.throws(()=>planNext({...intent,rightsGranted:true},0),/INTENT/);
});
