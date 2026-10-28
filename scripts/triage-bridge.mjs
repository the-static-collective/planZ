import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {parseBridgeFile,validateBridgeWork} from "./bridge-work-contract.mjs";
export function triageBridgeFile(packet){
 const verified=validateBridgeWork(packet,"PLANZ");
 return {schema:"planz.bridge-work-triage/v1",
  candidateId:verified.candidateId,doorId:verified.doorId,
  sourceCommit:verified.sourceCommit,actionCode:verified.actionCode,
  proposedTask:verified.actionLabel,
  disposition:"HOLD_FOR_PLAN_OWNER_REVIEW",authority:"NONE",
  sourceOwnerApproved:false,recipientAdmitted:false,applicationSubmitted:false,
  fieldVerified:false,issueUpdated:false,attentionIndexUpdated:false,
  networkSent:false,
  nextHumanGate:"Inspect original institution eligibility, explicit applicant permission and project-owned plan before any actual next step.",
  note:"Public-only exported candidate; no private ledger history or independent recipient receipt exists."};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const file=process.argv[2];
 if(!file||process.argv.length!==3){console.error("Usage: npm run triage:bridge -- /path/to/bridge005-HOLD.json");process.exitCode=2}
 else try{console.log(JSON.stringify(triageBridgeFile(parseBridgeFile(readFileSync(file))),null,2))}
 catch(err){console.error("HOLD: "+err.message);process.exitCode=1}
}
