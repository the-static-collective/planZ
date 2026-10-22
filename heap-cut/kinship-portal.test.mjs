import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("./kinship-portal-preview.html",import.meta.url),"utf8");
const doc=readFileSync(new URL("./KINSHIP-PORTAL-001.md",import.meta.url),"utf8");

test("portal remains a clearly labeled fictional station-unapproved concept",()=>{
  for(const part of ["UNOFFICIAL CONCEPT","Not sponsored, deployed, or approved by Kinship Radio","All people, needs, responses and radio mentions below are invented.","No account · No data sent"]){
    assert.ok(html.includes(part),part);
  }
  assert.ok(doc.includes("DRAFT · HELD"));
});
test("app and website preview are the same card interface; no hidden app write",()=>{
  for(const id of ["modeWebsite","modeApp","cards","rundown","rereview","newCard","reset","ledger","message"])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.includes('data-layout="website"'));
  assert.ok(html.includes('root.dataset.layout=mode'));
  assert.ok(html.includes("Kinship/Invubu"));
});
test("no source or station connectivity, credentials, personal data, real volunteer intake",()=>{
  assert.ok(!/\bfetch\s*\(/.test(html));
  assert.ok(!/\b(localStorage|sessionStorage|WebSocket|sendBeacon|XMLHttpRequest|geolocation)\b/.test(html));
  assert.ok(!/<form\b/i.test(html));
  assert.ok(!/<script[^>]+src=/i.test(html));
  assert.ok(!/<iframe\b/i.test(html));
  assert.ok(html.includes("Mock response recorded locally"));
  assert.ok(html.includes("No real help was assigned"));
  assert.ok(html.includes("not aired"));
});
test("all action functions and interface events are syntactically valid",()=>{
  const m=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(m,"script present");
  assert.doesNotThrow(()=>new Function(m[1]));
  for(const fragment of ["respond(c.id)","complete(c.id)","draft()","switchMode","aria-pressed","FILLED","PAUSED","radioApproved:false"]){
    assert.ok(html.includes(fragment),fragment);
  }
});
test("integration requirements do not assume enabled app Web View or station permission",()=>{
  for(const word of ["not a capability promise","Invubu","P0","P1","P2","P3","P4","P5","app configuration","data/privacy review","GROCERY_ACCESS != RELIGIOUS_PARTICIPATION"]){
    assert.ok(doc.toLowerCase().includes(word.toLowerCase()),word);
  }
});
