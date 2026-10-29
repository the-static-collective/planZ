import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,dirname} from "node:path";
import {compileSevenReturn,saveSevenReturn} from "./return-seven.mjs";
const hash=x=>createHash("sha256").update(x).digest("hex"),format=x=>JSON.stringify(x,null,2)+"\n";
const names=["Haunted Toaster","PlayDeck","Haunted Blender","Static Field","JAR;VIS","Static Live","STATIC OS"];
const plan="plan-"+"a".repeat(24),book="b".repeat(64),manifest="c".repeat(64);
function fixture(){
 const root=mkdtempSync(join(tmpdir(),"planz-return-seven-")), files={};
 const add=(path,content)=>{files[path]=Buffer.from(typeof content==="string"?content:format(content));};
 const original={id:plan,kind:"LENS_SYNTHESIS",generation:1,status:"PROPOSED_UNVERIFIED",humanSelection:"NONE",executed:false};
 const workbench={selectedPlanId:plan,board:{status:"candidate_with_gaps"},sourceCutIds:{ABSENCE:"cut-a",TIME:"cut-b",CARRIER:"cut-c",RECEIVER:"cut-d"}};
 const expressions=names.map((owner,i)=>({owner,sourcePlanId:plan,payloadSha256:hash("native-"+i),
  authority:"NONE",originalSoftwareExecuted:true,realWorldEffect:false,realHumanKeep:false}));
 const returns=expressions.map(x=>{
  const body={schema:"cannon.machine-return-proposal/v1",originalPlanId:plan,
   owner:x.owner,ownerOutputSha256:x.payloadSha256,originalBookReceiptId:book,
   nextExperiment:"What exact source-owned capability would let "+x.owner+" execute a real typed port safely?",
   humanReview:"NONE",authority:"NONE",status:"HELD_UNVALIDATED",sourceIsNativeSoftware:true,realWorldValidation:false};
  return {id:"return-"+hash(format(body)).slice(0,24),...body};
 });
 add("lineage/original-planz-synthesis.json",original);
 add("lineage/original-workbench-folios.json",workbench);
 add("lineage/expressions.json",expressions);
 add("lineage/return.json",{
  schema:"cannon.seven-ways-return-ledger/v1",originalPlanZRecursionReexecutedWithReturns:false,
  sevenNewCandidatesHeld:true,sourcePlanId:plan,originalBookReceiptId:book,candidates:returns});
 for(const row of returns)add("return-proposals/"+row.id+".json",row);
 const receipt={schema:"cannon.one-invention-seven-native/v1",status:"SEVEN_NATIVE_CREATIVE_SOFTWARE_EXPRESSIONS_HELD",
  expressionCount:7,heldReturnQuestionCount:7,originalHumanSelections:0,originalPlanZUpdated:false,
  physicalMachineOperated:false,licensedPublicRelease:false,independentFieldTest:false,
  sourcePlanId:plan,sourcePlanZManifest:manifest,sourceBookReceiptId:book,
  files:Object.fromEntries(Object.entries(files).map(([p,bytes])=>[p,hash(bytes)]))};
 add("receipt.json",{...receipt,receiptId:hash(format(receipt))});
 for(const [name,bytes] of Object.entries(files)){
  const file=join(root,name);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes);
 }
 return {root,returns,expressions};
}
test("PlanZ accepts seven source-bound software experiments, emits 28 original four-lens cuts and seven plans",()=>{
 const x=fixture();try{
  const m=compileSevenReturn(x.root);
  assert.equal(m.cuts.length,28);assert.equal(m.plans.length,7);
  assert.equal(m.cannonEvidenceDeclaredNativeSoftware,true);
  assert.equal(m.donorEnginesExecutedHere,false);
  assert.equal(m.originalPlanZRecordsModified,false);
  assert.ok(m.plans.every(p=>p.authority==="NONE"&&p.humanSelection==="NONE"&&!p.executed&&p.cutIds.length===4));
  assert.equal(new Set(m.plans.map(p=>p.id)).size,7);
  assert.equal(new Set(m.cuts.map(c=>c.id)).size,28);
  assert.deepEqual(compileSevenReturn(x.root),m);
  assert.equal(saveSevenReturn(m,join(x.root,"saved")),36);
  assert.equal(saveSevenReturn(m,join(x.root,"saved")),36);
 }finally{rmSync(x.root,{recursive:true,force:true})}
});
test("tampered native return file refuses even if JSON remains parseable",()=>{
 const x=fixture();try{
  const f=join(x.root,"lineage/return.json"),r=JSON.parse(readFileSync(f,"utf8"));
  r.candidates[0].nextExperiment="FAKE PERMISSION";writeFileSync(f,format(r));
  assert.throws(()=>compileSevenReturn(x.root),/SOURCE_HASH/);
 }finally{rmSync(x.root,{recursive:true,force:true})}
});
test("forged human approval refuses even after attacker recalculates outer receipt",()=>{
 const x=fixture();try{
  const p=join(x.root,"lineage/return.json"),value=JSON.parse(readFileSync(p,"utf8"));
  value.candidates[0].humanReview="APPROVED";
  writeFileSync(p,format(value));
  const f=join(x.root,"receipt.json"),old=JSON.parse(readFileSync(f,"utf8"));
  old.files["lineage/return.json"]=hash(format(value));
  const {receiptId,...body}=old;writeFileSync(f,format({...body,receiptId:hash(format(body))}));
  assert.throws(()=>compileSevenReturn(x.root),/RETURN_AUTHORITY/);
 }finally{rmSync(x.root,{recursive:true,force:true})}
});
test("source owner identity is mandatory and immutable PlanZ saved outputs refuse tampering",()=>{
 const x=fixture();try{
  const m=compileSevenReturn(x.root);
  const path=join(x.root,"saved");saveSevenReturn(m,path);
  const first=join(path,"cuts",m.cuts[0].id+".json");writeFileSync(first,"corrupt");
  assert.throws(()=>saveSevenReturn(m,path),/TAMPER/);
 }finally{rmSync(x.root,{recursive:true,force:true})}
});
