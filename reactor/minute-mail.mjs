// PLANZ-MINUTE-001: original owner, new-brief deterministic creative cycle.
// No model invocation or execution rights. Evidence is an input, not an assumption.
import {createHash} from "node:crypto";
const hash=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const insist=(v,x)=>{if(!v)throw Error("PLANZ_MINUTE_HOLD_"+x)};
const phrases=[
  ["listen","Listen without fixing."],
  ["carry","Carry something together."],
  ["neighbor","Ask a neighbor what would help."],
  ["help","Offer one small useful hand."],
  ["care","Leave a place kinder than you found it."],
  ["time","Give one minute back to the world."]
];
export function startCreativeBrief(objective){
 insist(typeof objective==="string"&&objective.length>=45&&objective.length<=440
  &&!/[<>]/.test(objective),"OBJECTIVE");
 const chosen=phrases.find(([token])=>objective.toLowerCase().includes(token))??phrases.at(-1);
 const basis={schema:"planz.minute-mail-creative-intent/v1",
  originalObjective:objective,workingTitle:"THE LOST MINUTE POST OFFICE",
  usefulAct:chosen[1],concept:"A fantastical post office that returns one minute of attention as a small act of service.",
  desiredDeliverable:"A short original native film, an independently revised cut, and a self-contained playable/printable local action kit.",
  rightsGranted:false,publicDistribution:false,autonomousAgent:false,createdBy:"deterministic original planZ compiler, creative seed provided by JAR;VIS"};
 return {...basis,intentSha256:hash(basis)};
}
export function planNext(intent,round,previous=null,proof=null){
 insist(intent?.schema==="planz.minute-mail-creative-intent/v1"
  &&intent.intentSha256===hash(Object.fromEntries(Object.entries(intent).filter(([k])=>k!=="intentSha256")))
  &&intent.rightsGranted===false,"INTENT");
 insist(Number.isInteger(round)&&round>=0&&round<4,"BOUNDED");
 if(round===0)insist(!previous&&!proof,"ROOT");
 else{
  insist(previous?.schema==="planz.minute-mail-round/v1"
   &&previous.round===round-1
   &&previous.planSha256===hash(Object.fromEntries(Object.entries(previous).filter(([k])=>k!=="planSha256")))
   &&proof?.schema==="jarvis.minute-mail-return/v1"&&proof.round===round-1
   &&proof.planSha256===previous.planSha256&&proof.kind===previous.expectedReturn
   &&/^[a-f0-9]{64}$/.test(proof.nativeArtifactSha256)
   &&proof.rightsGranted===false&&proof.published===false,"PARENT_EVIDENCE");
 }
 const tasks=[
  {target:"CANNON",kind:"PROOF_FILM",next:"Produce a new moving audiovisual proof from the new storyboard through the original Haunted Toaster renderer."},
  {target:"CANNON",kind:"REVISED_FILM",next:"Use verified proof-film evidence to make a longer and clearer second edit. Return actual original renderer receipt."},
  {target:"lemonPRESS",kind:"KIT_DRAFT",next:"Compose a playable post-office page, printable minute stamps, action slips and source receipt."},
  {target:"lemonPRESS",kind:"KIT_FINAL",next:"Apply JAR;VIS evidence/readability review to issue a final local action-kit package."}
 ];
 const t=tasks[round];
 const lines=round===0?
  ["THE LOST MINUTE","POST OFFICE","A MINUTE IS RETURNED"]:
  ["THE LOST MINUTE","POST OFFICE","GIVE ONE MINUTE BACK",intent.usefulAct.toUpperCase()];
 insist(lines.every(x=>x.length<=42),"READABILITY");
 const b={schema:"planz.minute-mail-round/v1",round,
  intentSha256:intent.intentSha256,targetOwner:t.target,
  stage:t.kind,expectedReturn:t.kind,instruction:t.next,
  subtitleLines:lines,
  shotSeconds:round===0?6:round===1?10:null,
  priorPlanSha256:previous?.planSha256??null,
  priorNativeArtifactSha256:proof?.nativeArtifactSha256??null,
  sourceInfluence:round===0?"NEW_BRIEF": "ACTUAL_PREVIOUS_PHASE_RECEIPT",
  status:"LOCAL_PROPOSED_NOT_AUTHORIZED",
  rightsGranted:false,published:false};
 return {...b,planSha256:hash(b)};
}
export function confirmReturn(plan,r){
 insist(plan?.schema==="planz.minute-mail-round/v1"&&
  plan.planSha256===hash(Object.fromEntries(Object.entries(plan).filter(([k])=>k!=="planSha256"))),"PLAN");
 insist(r?.schema==="jarvis.minute-mail-return/v1"&&r.round===plan.round
  &&r.kind===plan.expectedReturn&&r.planSha256===plan.planSha256
  &&/^[a-f0-9]{64}$/.test(r.nativeArtifactSha256)
  &&r.rightsGranted===false&&r.published===false,"RETURN");
 return {schema:"planz.minute-mail-confirmation/v1",
  planSha256:plan.planSha256,receiptSha256:r.nativeArtifactSha256,
  outcome:plan.round===3?"LOCAL_ARTIFACT_FINISHED_REVIEW_HELD":"NEXT_ROUND_ALLOWED",
  executedByPlanner:false,permissionGranted:false};
}
