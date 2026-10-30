// PLANZ-PRODUCTION-001 — deterministic source-evidence-driven returns.
// Source-owning planZ describes next work; it never executes or authorizes it.
import {createHash} from "node:crypto";
const digest=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
function hold(v,r){if(!v)throw Error("PLANZ_PRODUCTION_HOLD_"+r)}
const phases=["CHECKPOINT_STILL","MOVING_EXCERPT","SCREENING_DRAFT","SCREENING_FINAL"];
export function compileProductionRound({brief,round=0,previous=null,evidence=null}){
 hold(brief?.schema==="jarvis.creative-production-brief/v1"
  &&brief.projectId==="GENESIS-RETURN-001"
  &&brief.approval==="SYNTHETIC_TEST_ONLY"
  &&brief.publish===false&&brief.rightsGranted===false
  &&brief.requestedArtifact==="LOCAL_SCREENING_PACKAGE","BRIEF");
 hold(Number.isInteger(round)&&round>=0&&round<=3,"ROUND_BOUND");
 if(round===0)hold(previous===null&&evidence===null,"ROOT_NO_PRETEND");
 else{
  hold(previous?.schema==="planz.creative-production-round/v1"
   &&previous.round===round-1&&previous.roundSha256===digest(
    Object.fromEntries(Object.entries(previous).filter(([k])=>k!=="roundSha256"))),"PARENT_HASH");
  hold(evidence?.schema==="jarvis.production-return/v1"
   &&evidence.round===round-1&&evidence.parentRoundSha256===previous.roundSha256
   &&evidence.status==="SOURCE_NATIVE_VERIFIED"
   &&/^[a-f0-9]{64}$/.test(evidence.artifactSha256)
   &&evidence.published===false&&evidence.rightsGranted===false
   &&evidence.realWorldActions===0,"OWNER_RETURN_NOT_VERIFIED");
  const expected=round===1?"CHECKPOINT_STILL":round===2?"MOVING_EXCERPT":"SCREENING_DRAFT";
  hold(previous.route===expected&&evidence.route===expected,"PREVIOUS_PHASE");
 }
 const steps=[
  {next:"Create original PlayDeck image checkpoint, verify original Toaster render and Dogram, then return real media receipts.",
   owner:"CANNON",contract:"cannon.creative-route-run-receipt/v1"},
  {next:"Use checkpoint evidence to approve a distinct PlayDeck moving-video native route; preserve original audio, render through Toaster, return digested video bytes.",
   owner:"CANNON",contract:"cannon.creative-route-run-receipt/v1"},
  {next:"Give both prior verified video receipts to the original lemonPRESS screening-program compiler; create editorial draft with explicit no-publication limits.",
   owner:"lemonPRESS",contract:"lemonpress.screening-program/v1"},
  {next:"Revise and finalize original lemonPRESS screening program only after JAR;VIS checks the draft and the videos against the original source receipts.",
   owner:"lemonPRESS",contract:"lemonpress.screening-program/v1"}
 ];
 const route=phases[round],item=steps[round];
 const body={schema:"planz.creative-production-round/v1",projectId:brief.projectId,
  round,route,requestedNextOwner:item.owner,requiredOutputContract:item.contract,
  humanReadablePlan:item.next,
  parentRoundSha256:previous?.roundSha256??null,
  parentArtifactSha256:evidence?.artifactSha256??null,
  intentSha256:digest(brief),complete:false,
  modelGeneratedInstructions:false,automaticallyAuthorized:false,
  publish:false,rightsGranted:false,externalActions:0};
 return {...body,roundSha256:digest(body)};
}
export function confirmRound({plan,evidence}){
 hold(plan?.schema==="planz.creative-production-round/v1"
  &&plan.roundSha256===digest(Object.fromEntries(Object.entries(plan).filter(([k])=>k!=="roundSha256"))),
  "PLAN_INTEGRITY");
 hold(evidence?.schema==="jarvis.production-return/v1"
  &&evidence.route===plan.route&&evidence.round===plan.round
  &&evidence.parentRoundSha256===plan.roundSha256
  &&evidence.status==="SOURCE_NATIVE_VERIFIED"
  &&/^[a-f0-9]{64}$/.test(evidence.artifactSha256)
  &&evidence.published===false&&evidence.rightsGranted===false
  &&evidence.realWorldActions===0,"EVIDENCE_NOT_MATCHING");
 const body={schema:"planz.creative-production-confirmation/v1",
  round:plan.round,route:plan.route,roundSha256:plan.roundSha256,
  originalEvidenceSha256:evidence.artifactSha256,
  disposition:plan.round===3?"LOCAL_ARTIFACT_COMPLETE_REVIEW_HELD":"ADVANCE_ONE_BOUNDED_STEP",
  permissionToPublish:false,authority:"NONE"};
 return {...body,confirmationSha256:digest(body)};
}
