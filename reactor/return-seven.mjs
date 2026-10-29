#!/usr/bin/env node
// RETURN-SEVEN-002 — source-native PlanZ compiler of seven genuine CANNON
// creative-software observations into four-lens, HELD descendant experiments.
// It never changes or authorizes its ancestors, nor executes their real-world effects.
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync,lstatSync,readdirSync,existsSync} from "node:fs";
import {join,resolve,relative,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {LENSES} from "./recursive.mjs";

const hash=x=>createHash("sha256").update(typeof x==="string"||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest("hex");
const render=x=>JSON.stringify(x,null,2)+"\n";
const claim={status:"HELD_EXPERIMENTAL_RETURN",authority:"NONE",humanSelection:"NONE",
 admitted:false,published:false,executed:false,physicalWork:false,
 humanReviewVerified:false,sourceOwnerApprovalsObtained:false};
const requireProof=(v,m)=>{if(!v)throw Error("RETURN_SEVEN_002_"+m)};
const OWNER_NAMES=["Haunted Toaster","PlayDeck","Haunted Blender","Static Field","JAR;VIS","Static Live","STATIC OS"];
const frozen=(prefix,body)=>prefix+"-"+hash(JSON.stringify(body)).slice(0,24);
const loadJson=p=>JSON.parse(readFileSync(p,"utf8"));
function walk(dir,prefix=""){
 const output={};
 for(const item of readdirSync(dir,{withFileTypes:true})){
  requireProof(!item.isSymbolicLink(),"SYMLINK");
  const path=join(dir,item.name),name=prefix+item.name;
  if(item.isDirectory())Object.assign(output,walk(path,name+"/"));
  else{requireProof(item.isFile(),"NONFILE");output[name]=readFileSync(path);}
 }
 return output;
}
function collectSource(root){
 const source=resolve(root),files=walk(source);
 const receipt=loadJson(join(source,"receipt.json"));
 requireProof(receipt.schema==="cannon.one-invention-seven-native/v1"&&
  receipt.status==="SEVEN_NATIVE_CREATIVE_SOFTWARE_EXPRESSIONS_HELD"&&
  receipt.expressionCount===7&&receipt.heldReturnQuestionCount===7&&
  receipt.originalHumanSelections===0&&receipt.originalPlanZUpdated===false&&
  receipt.physicalMachineOperated===false&&receipt.licensedPublicRelease===false&&
  receipt.independentFieldTest===false,"SOURCE_SCOPE");
 const {receiptId,...body}=receipt;
 requireProof(receiptId===hash(render(body)),"SOURCE_RECEIPT_ID");
 requireProof(Object.keys(files).length===Object.keys(receipt.files).length+1,"SOURCE_FILE_COUNT");
 for(const [name,digest] of Object.entries(receipt.files)){
  requireProof(typeof name==="string"&&name!==""&&!name.includes("..")&&!name.startsWith("/")&&
    !name.includes("\\"),"PATH");
  requireProof(files[name]&&hash(files[name])===digest,"SOURCE_HASH_"+name);
 }
 requireProof(Object.keys(files).every(x=>x==="receipt.json"||Object.hasOwn(receipt.files,x)),"EXTRA_SOURCE_FILE");
 const proposal=JSON.parse(files["lineage/original-planz-synthesis.json"]);
 const workbench=JSON.parse(files["lineage/original-workbench-folios.json"]);
 const expression=JSON.parse(files["lineage/expressions.json"]);
 const returnEnvelope=JSON.parse(files["lineage/return.json"]);
 requireProof(proposal.id===receipt.sourcePlanId&&proposal.kind==="LENS_SYNTHESIS"&&
  proposal.generation===1&&proposal.status==="PROPOSED_UNVERIFIED"&&
  proposal.humanSelection==="NONE"&&!proposal.executed,"ORIGINAL_PLAN");
 requireProof(workbench.selectedPlanId===receipt.sourcePlanId&&
  workbench.board.status==="candidate_with_gaps"&&Object.keys(workbench.sourceCutIds).length===4,"WORKBENCH");
 requireProof(returnEnvelope.schema==="cannon.seven-ways-return-ledger/v1"&&
  returnEnvelope.originalPlanZRecursionReexecutedWithReturns===false&&
  returnEnvelope.sevenNewCandidatesHeld===true&&
  returnEnvelope.sourcePlanId===receipt.sourcePlanId&&
  returnEnvelope.originalBookReceiptId===receipt.sourceBookReceiptId,"RETURN_ENVELOPE");
 requireProof(Array.isArray(expression)&&expression.length===7&&
  Array.isArray(returnEnvelope.candidates)&&returnEnvelope.candidates.length===7,"SEVEN_REQUIRED");
 requireProof(JSON.stringify(expression.map(x=>x.owner).sort())===JSON.stringify([...OWNER_NAMES].sort())&&
  new Set(expression.map(x=>x.owner)).size===7,"EXACT_ORIGINAL_OWNERS");
 const owners=new Map(expression.map(x=>[x.owner,x]));
 const seen=new Set();
 for(const row of returnEnvelope.candidates){
  requireProof(row&&row.schema==="cannon.machine-return-proposal/v1"&&
   typeof row.id==="string"&&row.id.startsWith("return-")&&!seen.has(row.id),"RETURN_ID");
  seen.add(row.id);
  const {id,...payload}=row;
  requireProof("return-"+hash(render(payload)).slice(0,24)===id,"RETURN_ID_FORGED");
  requireProof(row.originalPlanId===receipt.sourcePlanId&&
   row.originalBookReceiptId===receipt.sourceBookReceiptId&&
   row.status==="HELD_UNVALIDATED"&&row.authority==="NONE"&&
   row.humanReview==="NONE"&&row.realWorldValidation===false&&
   row.sourceIsNativeSoftware===true,"RETURN_AUTHORITY");
  const native=owners.get(row.owner);
  requireProof(native&&row.ownerOutputSha256===native.payloadSha256&&
   native.sourcePlanId===receipt.sourcePlanId&&
   native.authority==="NONE"&&native.originalSoftwareExecuted===true&&
   native.realWorldEffect===false&&native.realHumanKeep===false,"NATIVE_SOURCE_LINK");
  requireProof(typeof row.nextExperiment==="string"&&row.nextExperiment.length>30&&
    row.nextExperiment.length<600,"QUESTION");
  const path="return-proposals/"+row.id+".json";
  requireProof(files[path]&&files[path].equals(Buffer.from(render(row))),"RETURN_BYTES");
 }
 return {receipt,proposal,workbench,expression,returns:returnEnvelope,files};
}
export function compileSevenReturn(root){
 const entry=collectSource(root);
 const resultCuts=[],resultPlans=[],seen=new Set();
 for(const candidate of entry.returns.candidates){
  const source=entry.expression.find(x=>x.owner===candidate.owner);
  const cuts=LENSES.map(lens=>{
   const body={schema:"static-collective/planz-seven-return/v1/cut",
    ancestorPlanId:entry.receipt.sourcePlanId,ancestorPlanZManifest:entry.receipt.sourcePlanZManifest,
    ancestorBookReceipt:entry.receipt.sourceBookReceiptId,
    evidenceOwner:candidate.owner,evidenceOriginalNativeSha256:source.payloadSha256,
    evidenceCannonReturnId:candidate.id,lens:lens.id,
    originatingQuestion:candidate.nextExperiment,
    pressureQuestion:lens.pressure,
    proposedExperiment:lens.protocol,
    stopCondition:lens.stop,
    relation:"SOFTWARE_OUTPUT_TO_HUMAN_REVIEW_EXPERIMENT_NOT_AUTORUN",...claim};
   return {id:frozen("cut",body),...body};
  });
  requireProof(cuts.length===4&&new Set(cuts.map(x=>x.lens)).size===4,"LENS_COVERAGE");
  resultCuts.push(...cuts);
  const body={schema:"static-collective/planz-seven-return/v1/plan",
    kind:"NATIVE_SOFTWARE_EVIDENCE_SYNTHESIS",generationRelativeToOriginalPlan:1,
    ancestorPlanId:entry.receipt.sourcePlanId,
    originalPlanZManifest:entry.receipt.sourcePlanZManifest,
    originalBookReceipt:entry.receipt.sourceBookReceiptId,
    evidenceOwner:candidate.owner,evidenceNativeOutputSha256:source.payloadSha256,
    evidenceOriginalCannonReturnId:candidate.id,
    title:candidate.owner+" / four-angle machine refinement",
    nextQuestion:candidate.nextExperiment,
    cutIds:cuts.map(x=>x.id).sort(),
    portVerifiedForRealExecution:false,sourceCandidateNotOwnerAdmission:true,...claim};
  resultPlans.push({id:frozen("plan",body),...body});
 }
 requireProof(resultCuts.length===28&&resultPlans.length===7,"EXPECTED_BOUNDS");
 for(const x of [...resultCuts,...resultPlans]){
  requireProof(!seen.has(x.id),"DUPLICATE");seen.add(x.id);
 }
 const summary={schema:"static-collective/planz-seven-return/v1/manifest",
  inputCannonReceiptId:entry.receipt.receiptId,sourcePlanId:entry.receipt.sourcePlanId,
  originalPlanZManifest:entry.receipt.sourcePlanZManifest,
  originalBookReceipt:entry.receipt.sourceBookReceiptId,
  sourceReturnCount:7,angleCutCount:28,proposedDescendantCount:7,
  evidenceOwnerNames:[...OWNER_NAMES],lensIds:LENSES.map(x=>x.id),
  donorEnginesExecutedHere:false,cannonEvidenceDeclaredNativeSoftware:true,
  originalPlanZRecordsModified:false,...claim,
  cuts:resultCuts.sort((a,b)=>a.id.localeCompare(b.id)),
  plans:resultPlans.sort((a,b)=>a.id.localeCompare(b.id))};
 return {...summary,manifestSha256:hash(render(summary))};
}
export function saveSevenReturn(manifest,out){
 const root=resolve(out);
 const items=[
  ...manifest.cuts.map(x=>["cuts/"+x.id+".json",x]),
  ...manifest.plans.map(x=>["proposals/"+x.id+".json",x]),
  ["manifests/"+manifest.manifestSha256+".json",manifest]
 ];
 for(const [name,content] of items){
  const path=join(root,name),bytes=render(content);
  mkdirSync(dirname(path),{recursive:true});
  try{writeFileSync(path,bytes,{flag:"wx"});}
  catch(e){if(e.code!=="EEXIST"||readFileSync(path,"utf8")!==bytes)throw Error("RETURN_SEVEN_002_TAMPER_"+name);}
 }
 return items.length;
}
function main(args){
 let source=null,destination=null,format="json";
 for(let i=0;i<args.length;i++){
  if(args[i]==="--source-dir")source=args[++i];
  else if(args[i]==="--out-dir")destination=args[++i];
  else if(args[i]==="--format")format=args[++i];
  else throw Error("RETURN_SEVEN_002_BAD_FLAG");
 }
 requireProof(typeof source==="string"&&source&&format==="json","USAGE");
 const result=compileSevenReturn(source);
 if(destination)saveSevenReturn(result,destination);
 process.stdout.write(render(result));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{main(process.argv.slice(2));}
 catch(e){process.stderr.write(String(e.message||e)+"\n");process.exitCode=2;}
}
