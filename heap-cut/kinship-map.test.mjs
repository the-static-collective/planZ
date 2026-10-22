import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=name=>readFileSync(new URL(name,import.meta.url),"utf8");
const overlay=JSON.parse(read("kinship-candidate-overlay-v0.json"));
const core=JSON.parse(read("network-passport-v0.json"));
const html=read("network-map.html");

test("Kinship is a proposal overlay and not a hidden core grocery dependency",()=>{
  assert.equal(overlay.schema,"static-collective/planz-optional-media-overlay/v0");
  assert.equal(overlay.networkPassport,core.id);
  assert.equal(overlay.status,"PROPOSED_UNAUTHORIZED");
  assert.equal(overlay.requiredForCoreNetwork,false);
  assert.equal(overlay.stationApproval,"NOT_ESTABLISHED");
  assert.equal(overlay.foodOperatorApproval,"NOT_ESTABLISHED");
  assert.ok(core.coreOrgans.every(x=>x.id!=="KINSHIP"));
  assert.ok(core.criticalLinks.every(x=>x.from!=="KINSHIP"&&x.to!=="KINSHIP"));
});
test("no automated broadcasting, fundraising, data harvesting, or station control",()=>{
  for(const key of ["automaticBroadcast","automaticEventSubmission","automaticDonations","listenershipDatabaseAccess","stationBroadcastControl","privateNeedIngest","bypassOfficialGiving"]) {
    assert.equal(overlay[key],false,key);
  }
  for(const value of Object.values(overlay.privacy))assert.equal(value,false);
  assert.equal(overlay.permissionToPublish,"NOT_ESTABLISHED");
  assert.equal(overlay.networkAuthority,"NONE");
});
test("all three editorial crossings require consent and Kinship-side decision",()=>{
  assert.deepEqual(overlay.mediaDoors.map(x=>x.id),["COMMUNITY_CALENDAR","NEIGHBOR_HELP","OUTCOME_STORY"]);
  for(const m of overlay.mediaDoors){
    assert.equal(m.target,"KINSHIP_EDITORIAL_GATE");
    assert.equal(m.status.startsWith("UNVERIFIED")||m.status.startsWith("DESIGN_ONLY"),true);
    assert.ok(m.preconditions.length>=3);
    assert.ok(m.forbidden.length>=3);
  }
  assert.ok(overlay.mediaDoors.find(x=>x.id==="NEIGHBOR_HELP").preconditions.some(x=>/independent station-owned editorial/.test(x)));
  assert.ok(overlay.mediaDoors.find(x=>x.id==="OUTCOME_STORY").preconditions.some(x=>/approval for each medium\/use/.test(x)));
});
test("owning sources distinguish existing station from experimental adapters",()=>{
  assert.ok(overlay.sourceDoors.some(x=>x.url.endsWith("/pull/31")));
  assert.ok(overlay.sourceDoors.some(x=>x.url.endsWith("/pull/33")));
  assert.ok(overlay.sourceDoors.some(x=>x.url.startsWith("https://kinshipradio.org/main/events")));
});
test("self-contained offline map renders a local Kinship layer without service effects",()=>{
  assert.ok(html.includes("<svg"));
  assert.ok(html.includes('id="layerKinship"'));
  assert.ok(html.includes('id="routeChoice"'));
  assert.ok(html.includes('id="nodesList"'));
  assert.ok(html.includes('id:"KINSHIP"'));
  assert.ok(html.includes("N0: CONCEIVED"));
  assert.ok(html.includes('stationApproval:"NOT_ESTABLISHED"'));
  assert.ok(!/<script[^>]+src=/i.test(html));
  assert.ok(!/\bfetch\s*\(/.test(html));
  const match=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match,"inline script exists");
  assert.doesNotThrow(()=>new Function(match[1]),"embedded map JavaScript parses");
});
