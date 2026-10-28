import test from "node:test";import assert from "node:assert/strict";
import {parseBridgeFile,validateBridgeWork} from "../scripts/bridge-work-contract.mjs";
import {triageBridgeFile} from "../scripts/triage-bridge.mjs";
const src="27c280d5297e593512d85eb3c83d74904856cfdf";
function packet(target){
 const p={schema:"abundent.bridge-work-card/v1",sourceCommit:src,
 sourceUrl:"https://github.com/the-static-collective/webZ/blob/"+src+"/bridge/network/model.mjs",
 snapshot:"BRIDGE-NETWORK-003/2026-10-28",doorId:"voqal",target,
 actionCode:"VERIFY_ELIGIBILITY",classification:"PUBLIC_ONLY_HOLD_FOR_LOCAL_REVIEW",
 manualExport:true,externalContact:false,applicationSubmitted:false,receiverAdmitted:false,fieldVerified:false,authority:"NONE"};
 return {...p,candidateId:target==="JARVIS"?
 "bridge-work-v1:b901e29d73dec2879211254f1057df6c31cebd5dc37ee601bd6fc99d0ea24d3b":
 "bridge-work-v1:1fac08572d288addaf339a454864916f8ca57132ca9b143756ca5a675c5f7ef0"};
}

test("planZ accepts exactly its own public-only candidate and yields non-mutating HOLD",()=>{
 const p=packet("PLANZ"),r=triageBridgeFile(p);
 assert.equal(r.disposition,"HOLD_FOR_PLAN_OWNER_REVIEW");
 assert.equal(r.fieldVerified,false);
 assert.equal(r.sourceOwnerApproved,false);
 assert.equal(r.issueUpdated,false);
 assert.equal(r.networkSent,false);
 assert.equal(r.actionCode,"VERIFY_ELIGIBILITY");
 assert.equal(parseBridgeFile(Buffer.from(JSON.stringify(p))).target,"PLANZ");
});
test("planZ refuses foreign receiver, tamper and authority-claiming payloads",()=>{
 const good=packet("PLANZ");
 for(const bad of [
  packet("JARVIS"),{...good,authority:"SEND"},{...good,operatorPrivateNote:"confidential"},
  {...good,applicationSubmitted:true},{...good,candidateId:"bridge-work-v1:"+"0".repeat(64)}
 ])assert.throws(()=>validateBridgeWork(bad,"PLANZ"),/HOLD/);
 assert.throws(()=>parseBridgeFile(Buffer.alloc(3100)),/HOLD_PACKET_SIZE/);
});
