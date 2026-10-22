import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,"..");
const grand=resolve(root,"grand-shards/2026-10-21-the-living-neighbor-network-001.md");
const bench=resolve(here,"README.md");
const landing=resolve(root,"README.md");
const files=[grand,bench,landing];
const get=f=>readFileSync(f,"utf8");

test("complete grand plan and bench are discoverable from root planZ",()=>{
 const a=get(landing),b=get(bench),g=get(grand);
 assert.match(a,/Living Neighbor Network master shard/);
 assert.match(a,/grand-shards\/2026-10-21-the-living-neighbor-network-001\.md/);
 assert.match(b,/HEAP-CUT-001/);
 assert.match(b,/\.\.\/grand-shards\/2026-10-21-the-living-neighbor-network-001\.md/);
 for(const marker of ["THE CARD IS THE ADDRESS","THE RADIO IS THE VOICE","THE PORTAL IS THE DOOR","THE STEWARD IS THE HAND","THE RETURN IS THE WITNESS"]){
  assert.ok(g.includes(marker),marker);
 }
});
test("all local markdown paths in three top-level planning entrypoints exist",()=>{
 for(const f of files){
  const markdown=get(f);
  const destinations=[...markdown.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]);
  for(const destination of destinations){
   if(/^(https?:|mailto:|#)/.test(destination))continue;
   const local=destination.split("#")[0];
   if(!local)continue;
   assert.ok(existsSync(resolve(dirname(f),decodeURIComponent(local))),`${f}: missing ${destination}`);
  }
 }
});
test("grand shard does not mistake models for deployed or authorized field systems",()=>{
 const g=get(grand);
 for(const phrase of ["PROPOSED — HOLD","Kinship Radio","not a deployed service","GROCERY_ACCESS","RADIO","independently confirmed","NOT VERIFIED"]){
  assert.ok(g.toUpperCase().includes(phrase.toUpperCase()),phrase);
 }
 for(const term of ["PORTAL_VIEW != STATION_ENDORSEMENT","RADIO_SNAPSHOT != CURRENT_CARD_STATE"]){
  const p=get(resolve(here,"KINSHIP-PORTAL-001.md"));
  assert.ok(p.includes(term),term);
 }
 const over=JSON.parse(get(resolve(here,"kinship-candidate-overlay-v0.json")));
 assert.equal(over.stationApproval,"NOT_ESTABLISHED");
 assert.equal(over.rotatingBroadcast.automaticBroadcast,false);
 const pass=JSON.parse(get(resolve(here,"network-passport-v0.json")));
 assert.equal(pass.authority,"NONE");
 assert.equal(pass.crossingGates[0].passed,true);
 assert.ok(pass.crossingGates.slice(1).every(x=>x.passed===false));
});
