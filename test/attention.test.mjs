import test from "node:test";import assert from "node:assert/strict";
import {readFileSync} from "node:fs";import {validatePublicAttention} from "../scripts/validate-attention.mjs";
const data=JSON.parse(readFileSync(new URL("../public/attention-v1.json",import.meta.url),"utf8"));
test("reviewed planZ index points at actual issue ownership, never authorizes execution",()=>{
  assert.equal(validatePublicAttention(data),data);
  assert.ok(data.entries.some(x=>x.id==="REGIONAL-HELP-001"));
  assert.ok(data.entries.some(x=>x.id==="GLOBAL-CROSSING-001"));
  assert.ok(data.entries.every(x=>x.fieldOutcome==="NOT_VERIFIED"&&!x.executionAllowed));
});
test("relabeling any plan as field-complete or approved is rejected",()=>{
  const d=structuredClone(data);d.entries[0].fieldOutcome="CONFIRMED";
  assert.throws(()=>validatePublicAttention(d),/HOLD boundary/);
  d.entries[0].fieldOutcome="NOT_VERIFIED";d.entries[0].thirdPartyApproval="GRANTED";
  assert.throws(()=>validatePublicAttention(d),/HOLD boundary/);
});
test("broken relations, nonpublic URLs and sensitive contacts are rejected",()=>{
  const d=structuredClone(data);d.entries[0].related=["MADE-UP"];
  assert.throws(()=>validatePublicAttention(d),/relation/);
  d.entries[0].related=[];d.entries[0].source="https://example.com";
  assert.throws(()=>validatePublicAttention(d),/source/);
  d.entries[0].source=data.entries[0].source;d.entries[0].nextGate="Email someone@example.com about their private history and try later.";
  assert.throws(()=>validatePublicAttention(d),/private data/);
});
