import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {validatePublicAttention} from "./validate-attention.mjs";
const expectedKeys=["schema","candidateId","planId","sourceIssue","sourceEdition","sourceSha256","weaveId","publicMethodCandidate","preparedAt","localReport","review","disposition","fieldVerified","sourceOwnerApproved","recipientConfirmed","sentExternally","authority","notice"];
const issue=/^https:\/\/github\.com\/the-static-collective\/[\w.-]+\/issues\/[1-9]\d*$/;
const pii=/(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d ().-]{8,}\d|\b(?:street address|shelter address|home address|apartment|account number|case number)\b|\b\d{1,5}\s+\w+\s+(?:st|street|ave|avenue|road|rd|drive|dr|lane|ln)\b)/i;
const sha=x=>createHash("sha256").update(x).digest("hex");
export function validateReturnCandidate(p){
  if(!p||typeof p!=="object"||Array.isArray(p)||Object.keys(p).sort().join("|")!==[...expectedKeys].sort().join("|")||
     p.schema!=="planz.return-candidate/v0"||
     typeof p.planId!=="string"||! /^[A-Z0-9-]{5,44}$/.test(p.planId)||
     !issue.test(p.sourceIssue??"")||
     !/^ATTENTION-\d{4}-\d{2}-\d{2}-\d{3}$/.test(p.sourceEdition??"")||
     !/^[a-f0-9]{64}$/.test(p.sourceSha256??"")||
     !/^weave:[0-9a-f-]{36}$/.test(p.weaveId??"")||
     typeof p.publicMethodCandidate!=="string"||p.publicMethodCandidate.length<30||p.publicMethodCandidate.length>220||
     pii.test(p.publicMethodCandidate)||/https?:\/\//i.test(p.publicMethodCandidate)||
     !/^\d{4}-\d{2}-\d{2}T/.test(p.preparedAt??"")||
     p.localReport!=="COMPLETED_REPORTED_UNVERIFIED"||
     p.review!=="SECOND_ALIAS_REVIEW_ASSERTED_NOT_AUTHENTICATED"||
     p.disposition!=="HOLD_FOR_OWNER_REVIEW"||
     p.fieldVerified!==false||p.sourceOwnerApproved!==false||
     p.recipientConfirmed!==false||p.sentExternally!==false||p.authority!=="NONE"||
     typeof p.notice!=="string"||p.notice.length>300||
     !/^planz-return-v0:[a-f0-9]{64}$/.test(p.candidateId??""))
     throw Error("Invalid, unsafe or authority-claiming plan return");
  const basis={planId:p.planId,sourceIssue:p.sourceIssue,sourceEdition:p.sourceEdition,
    sourceSha256:p.sourceSha256,weaveId:p.weaveId,publicMethodCandidate:p.publicMethodCandidate};
  if(p.candidateId!=="planz-return-v0:"+sha("PLANZ-RETURN-001|"+JSON.stringify(basis)))
    throw Error("Immutable return candidate content differs from ID");
  return p;
}
export function triageReturnCandidate(p,feed,rawFeed){
  validateReturnCandidate(p);validatePublicAttention(feed);
  const source=feed.entries.find(x=>x.id===p.planId);
  const current=source&&source.source===p.sourceIssue;
  const pinned=current&&p.sourceEdition===feed.edition&&p.sourceSha256===sha(rawFeed);
  const disposition=!current?"HOLD_UNKNOWN_OR_CHANGED_SOURCE":
    !pinned?"HOLD_STALE_SOURCE_SNAPSHOT":"HOLD_FOR_OWNER_REVIEW";
  return {schema:"planz.return-triage/v0",candidateId:p.candidateId,planId:p.planId,
    sourceIssue:p.sourceIssue,disposition,fieldVerified:false,sourceOwnerApproved:false,
    indexUpdated:false,issueUpdated:false,networkSent:false,
    reviewerAction:disposition==="HOLD_FOR_OWNER_REVIEW"?
      "Independently inspect permissions, actual evidence and recipient confirmation before any source-owner decision.":
      "Reconcile the original source and current planZ snapshot before considering the candidate.",
    note:"Offline format and source-binding triage only; never proof of external delivery or consent."};
}
export function parseLocalPacket(bytes){
 if(bytes.byteLength>12288)throw Error("Return packet exceeds local size limit");
 try{return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes))}
 catch{throw Error("Invalid return packet bytes")}
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const file=process.argv[2];
 if(!file||process.argv.length!==3){console.error("Usage: npm run triage -- /path/to/packet.json");process.exitCode=2;}
 else try{
  const raw=readFileSync(new URL("../public/attention-v1.json",import.meta.url));
  const feed=JSON.parse(raw.toString("utf8"));
  const packet=parseLocalPacket(readFileSync(file));
  console.log(JSON.stringify(triageReturnCandidate(packet,feed,raw),null,2));
 }catch(e){console.error("HOLD: "+e.message);process.exitCode=1;}
}
