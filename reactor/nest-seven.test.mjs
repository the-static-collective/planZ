import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,dirname} from "node:path";
import {compileNestedSeven,saveNestedSeven} from "./nest-seven.mjs";
import {compileSevenReturn,saveSevenReturn} from "./return-seven.mjs";

const hash=x=>createHash("sha256").update(x).digest("hex");
const format=x=>JSON.stringify(x,null,2)+"\n";
const names=["Haunted Toaster","PlayDeck","Haunted Blender","Static Field","JAR;VIS","Static Live","STATIC OS"];
const plan="plan-"+"a".repeat(24),book="b".repeat(64),manifest="c".repeat(64);
function fixture(){
 const root=mkdtempSync(join(tmpdir(),"nested-seven-test-"));
 const source=join(root,"native-seven"),prior=join(root,"return-from-native");
 mkdirSync(source);
 const files={};
 const add=(name,value)=>{files[name]=Buffer.from(typeof value==="string"?value:format(value));};
 const original={id:plan,kind:"LENS_SYNTHESIS",generation:1,status:"PROPOSED_UNVERIFIED",humanSelection:"NONE",executed:false};
 const workbench={selectedPlanId:plan,board:{status:"candidate_with_gaps"},sourceCutIds:{ABSENCE:"cut-a",TIME:"cut-b",CARRIER:"cut-c",RECEIVER:"cut-d"}};
 const expressions=names.map((owner,i)=>({owner,sourcePlanId:plan,payloadSha256:hash("native-"+i),
  authority:"NONE",originalSoftwareExecuted:true,realWorldEffect:false,realHumanKeep:false}));
 const candidates=expressions.map(x=>{
  const body={schema:"cannon.machine-return-proposal/v1",originalPlanId:plan,
   owner:x.owner,ownerOutputSha256:x.payloadSha256,originalBookReceiptId:book,
   nextExperiment:"What would the independently verified real-world port contract for "+x.owner+" require?",
   humanReview:"NONE",authority:"NONE",status:"HELD_UNVALIDATED",sourceIsNativeSoftware:true,realWorldValidation:false};
  return {id:"return-"+hash(format(body)).slice(0,24),...body};
 });
 add("lineage/original-planz-synthesis.json",original);
 add("lineage/original-workbench-folios.json",workbench);
 add("lineage/expressions.json",expressions);
 add("lineage/return.json",{schema:"cannon.seven-ways-return-ledger/v1",originalPlanZRecursionReexecutedWithReturns:false,
  sevenNewCandidatesHeld:true,sourcePlanId:plan,originalBookReceiptId:book,candidates});
 for(const row of candidates)add("return-proposals/"+row.id+".json",row);
 const receipt={schema:"cannon.one-invention-seven-native/v1",status:"SEVEN_NATIVE_CREATIVE_SOFTWARE_EXPRESSIONS_HELD",
  expressionCount:7,heldReturnQuestionCount:7,originalHumanSelections:0,originalPlanZUpdated:false,
  physicalMachineOperated:false,licensedPublicRelease:false,independentFieldTest:false,
  sourcePlanId:plan,sourcePlanZManifest:manifest,sourceBookReceiptId:book,
  files:Object.fromEntries(Object.entries(files).map(([p,v])=>[p,hash(v)]))};
 add("receipt.json",{...receipt,receiptId:hash(format(receipt))});
 for(const [name,data] of Object.entries(files)){
  const p=join(source,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,data);
 }
 const originalReturn=compileSevenReturn(source);
 saveSevenReturn(originalReturn,prior);
 return {root,source,prior,originalReturn,candidates};
}
test("one PlanZ source is the outer planning cycle; seven native creative subcycles are genuinely nested",()=>{
 const f=fixture();
 try{
  const m=compileNestedSeven(f.source,f.prior,{depth:2});
  assert.equal(m.originalPlanId,plan);
  assert.equal(m.totalNativeCreatorOwners,7);
  assert.equal(m.cycleCount,14);
  assert.equal(m.planCount,14);
  assert.equal(m.cutCount,56);
  assert.equal(m.newPlanningOnlyPlans,7);
  assert.equal(m.tree.root.children.length,7);
  for(const child of m.tree.root.children){
   assert.equal(child.generation,1);
   assert.equal(child.parentCycleId,m.rootCycleId);
   assert.equal(child.turns[0].stage,"CREATIVE_SOFTWARE_EVIDENCE");
   assert.equal(child.turns[1].stage,"FOUR_LENS_PLANNING");
   assert.equal(child.turns[1].lenses.length,4);
   assert.equal(child.children.length,1);
   assert.equal(child.children[0].generation,2);
   assert.equal(child.children[0].parentCycleId,child.id);
   assert.equal(child.children[0].evidenceMode,"INHERITED_UNRERUN_HISTORICAL_EVIDENCE");
   assert.equal(child.children[0].children.length,0);
  }
  assert.ok(m.plans.every(p=>p.authority==="NONE"&&p.executed===false));
  assert.equal(m.newNativeOwnerRuns,0);
  assert.deepEqual(compileNestedSeven(f.source,f.prior,{depth:2}),m);
 }finally{rmSync(f.root,{force:true,recursive:true});}
});
test("depth is bounded and increases exactly seven cycles, 7 plans, 28 angle cuts per generation",()=>{
 const f=fixture();
 try{
  for(const [depth,cycles,plans,cuts] of [[1,7,7,28],[2,14,14,56],[3,21,21,84]]){
   const m=compileNestedSeven(f.source,f.prior,{depth});
   assert.equal(m.cycleCount,cycles);assert.equal(m.planCount,plans);assert.equal(m.cutCount,cuts);
   assert.equal(m.tree.root.children.length,7);
  }
  assert.throws(()=>compileNestedSeven(f.source,f.prior,{depth:4}),/DEPTH/);
  assert.throws(()=>compileNestedSeven(f.source,f.prior,{depth:0}),/DEPTH/);
 }finally{rmSync(f.root,{force:true,recursive:true});}
});
test("original PlanZ return ledger is required exact and any unreviewed mutation fails before nesting",()=>{
 const f=fixture();
 try{
  const p=join(f.prior,"cuts",f.originalReturn.cuts[0].id+".json");
  writeFileSync(p,"FORGED SOURCE OWNER ADMISSION");
  assert.throws(()=>compileNestedSeven(f.source,f.prior),/PRIOR_LEDGER_TAMPER/);
 }finally{rmSync(f.root,{force:true,recursive:true});}
});
test("nested manuscript and independently addressed cycles replay exactly and refuse tampering",()=>{
 const f=fixture();
 try{
  const out=join(f.root,"nested"),m=compileNestedSeven(f.source,f.prior,{depth:2});
  const first=saveNestedSeven(m,out);
  assert.equal(first.fileCount,3+14+14+56);
  assert.equal(saveNestedSeven(m,out).fileCount,first.fileCount);
  const html=readFileSync(join(out,"exhibit/index.html"),"utf8");
  assert.match(html,/THE MACHINE THAT THINKS/);
  assert.match(html,/Seven independent subcycles/);
  const p=join(out,"cycles",m.cycles[0].id+".json");
  writeFileSync(p,"GRANTED AUTHORIZATION");
  assert.throws(()=>saveNestedSeven(m,out),/OUTPUT_TAMPER/);
 }finally{rmSync(f.root,{force:true,recursive:true});}
});
