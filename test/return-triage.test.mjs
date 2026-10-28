import test from "node:test";import assert from "node:assert/strict";
import {createHash} from "node:crypto";import {readFileSync} from "node:fs";
import {validateReturnCandidate,triageReturnCandidate,parseLocalPacket} from "../scripts/triage-return.mjs";
const raw=readFileSync(new URL("../public/attention-v1.json",import.meta.url));
const feed=JSON.parse(raw.toString("utf8"));
const hash=s=>createHash("sha256").update(s).digest("hex");
function candidate(){
 const plan=feed.entries.find(x=>x.id==="GLOBAL-CROSSING-001");
 const basis={planId:plan.id,sourceIssue:plan.source,sourceEdition:feed.edition,
 sourceSha256:hash(raw),weaveId:"weave:7f3baec7-03bc-4ff4-8d78-cac2f24e0410",
 publicMethodCandidate:"Compare local food procurement with a lawful shipment before committing funds or volunteers."};
 return {schema:"planz.return-candidate/v0",
 candidateId:"planz-return-v0:"+hash("PLANZ-RETURN-001|"+JSON.stringify(basis)),...basis,
 preparedAt:"2026-10-28T20:00:00.000Z",localReport:"COMPLETED_REPORTED_UNVERIFIED",
 review:"SECOND_ALIAS_REVIEW_ASSERTED_NOT_AUTHENTICATED",
 disposition:"HOLD_FOR_OWNER_REVIEW",fieldVerified:false,sourceOwnerApproved:false,
 recipientConfirmed:false,sentExternally:false,authority:"NONE",
 notice:"Unverified local candidate. No personal notes, aliases or evidence exported."};
}
test("exact source returns review HOLD, never source-owner approval",()=>{
 const p=candidate();assert.equal(validateReturnCandidate(p),p);
 const decision=triageReturnCandidate(p,feed,raw);
 assert.equal(decision.disposition,"HOLD_FOR_OWNER_REVIEW");
 assert.equal(decision.fieldVerified,false);
 assert.equal(decision.indexUpdated,false);
});
test("moved feed forces stale HOLD and unlisted sources remain untrusted",()=>{
 const p=candidate();const moved=structuredClone(feed);moved.edition="ATTENTION-2026-10-28-002";
 assert.equal(triageReturnCandidate(p,moved,Buffer.from(JSON.stringify(moved)+"\n")).disposition,"HOLD_STALE_SOURCE_SNAPSHOT");
 const missing=structuredClone(feed);
 missing.entries=missing.entries.filter(x=>x.id!==p.planId).map(x=>({...x,related:x.related.filter(y=>y!==p.planId)}));
 assert.equal(triageReturnCandidate(p,missing,Buffer.from(JSON.stringify(missing)+"\n")).disposition,"HOLD_UNKNOWN_OR_CHANGED_SOURCE");
});
test("fabricated fields, changed summaries, contacts and execution claims are refused",()=>{
 const p=candidate();
 for(const variant of [
  {...p,fieldVerified:true},{...p,authority:"WRITE"},{...p,sentExternally:true},
  {...p,ownerApproved:true},{...p,publicMethodCandidate:"Please contact someone@example.org as soon as possible."}
 ])assert.throws(()=>validateReturnCandidate(variant),/Invalid/);
 assert.throws(()=>validateReturnCandidate({...p,publicMethodCandidate:p.publicMethodCandidate+"!"}),/Immutable/);
});
test("unbounded or malformed file input refuses",()=>{
 assert.throws(()=>parseLocalPacket(Buffer.alloc(14000)),/size limit/);
 assert.throws(()=>parseLocalPacket(Buffer.from("{bad")),/Invalid/);
});
