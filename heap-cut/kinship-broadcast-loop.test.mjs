import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { candidateEdition, checkFixtureCard, reviseFixtureCard, mockListenerOffer } from "./kinship-broadcast-loop.mjs";
const fx=JSON.parse(readFileSync(new URL("./kinship-rotating-cards-fixture.json",import.meta.url),"utf8"));
const copy=()=>structuredClone(fx.cards);
const at=fx.asOfUtc;

test("candidate radio edition chooses only presently open, separately reviewed, nonexpired mock cards",()=>{
 const edition=candidateEdition(copy(),at);
 assert.equal(edition.publicationAuthority,"NONE");
 assert.equal(edition.airAuthority,"NONE");
 assert.equal(edition.editionStatus,"PREVIEW_ONLY_NO_STATION_APPROVAL");
 assert.deepEqual(edition.selected.map(x=>x.id),["SAMPLE-FOOD-001","SAMPLE-STORE-003","SAMPLE-GOODS-006"]);
 assert.ok(edition.excluded.some(x=>x.id==="SAMPLE-GARDEN-002"&&x.reasons.includes("RADIO_CONSENT_UNPROVEN")));
 assert.ok(edition.excluded.some(x=>x.id==="SAMPLE-RIDE-004"&&x.reasons.includes("SOURCE_PAUSED")));
 assert.ok(edition.excluded.some(x=>x.id==="SAMPLE-TOOLS-005"&&x.reasons.includes("EXPIRED")));
});
test("source fulfilled after a radio cut does not rewrite historic edition; next edition drops the card",()=>{
 const c=copy();
 const before=candidateEdition(c,at);
 const idx=c.findIndex(x=>x.id==="SAMPLE-FOOD-001");
 c[idx]=reviseFixtureCard(c[idx],{sourceState:"FILLED"},"2026-10-21T23:16:00Z");
 const next=candidateEdition(c,"2026-10-21T23:17:00Z");
 assert.ok(before.selected.some(x=>x.id==="SAMPLE-FOOD-001"&&x.revision===1));
 assert.ok(!next.selected.some(x=>x.id==="SAMPLE-FOOD-001"));
 assert.ok(next.excluded.some(x=>x.id==="SAMPLE-FOOD-001"&&x.reasons.includes("SOURCE_FILLED")));
 assert.equal(c[idx].revision,2);
});
test("a listener offer is neither assignment nor delivery confirmation",()=>{
 const c=copy()[0];
 const offer=mockListenerOffer(c,at);
 assert.equal(offer.status,"OFFER_RECEIVED_NOT_ASSIGNED");
 assert.equal(offer.fulfillment,"NOT_CLAIMED");
 assert.equal(offer.sourceOperatorApproval,"NOT_ESTABLISHED");
 assert.equal(c.sourceState,"OPEN");
});
test("withdrawal or lost radio permission immediately excludes next mock broadcast edition",()=>{
 for(const change of [{sourceState:"WITHDRAWN"},{radioConsentSimulated:false},{publicConsentSimulated:false},{editorialReviewSimulated:false}]){
  const c=copy();c[0]=reviseFixtureCard(c[0],change,"2026-10-21T23:16:00Z");
  assert.ok(!candidateEdition(c,"2026-10-21T23:17:00Z").selected.some(x=>x.id===c[0].id));
 }
});
test("stale check and an older replay cannot claim a current live need",()=>{
 const e=candidateEdition(copy(),"2026-10-22T00:00:00Z");
 assert.equal(e.selected.length,0);
 assert.ok(e.excluded.some(x=>x.reasons.includes("STALE_OR_FUTURE_CHECK")));
});
test("fixture generator cannot accept live cards, real response routes or money-only solicitations",()=>{
 const c=copy()[0];delete c.fixtureOnly;
 assert.throws(()=>checkFixtureCard(c),/synthetic/);
 const d=copy()[0];d.responseDoor="https://private-address.example";
 assert.throws(()=>checkFixtureCard(d),/no real URLs/);
 const m=copy()[0];m.kind="money";
 assert.throws(()=>checkFixtureCard(m),/money-only/);
});
test("duplicate current identities, unsafe state promotions and foreign revision fields refuse",()=>{
 const c=copy();assert.throws(()=>candidateEdition([c[0],structuredClone(c[0])],at),/duplicate/);
 assert.throws(()=>reviseFixtureCard(c[0],{authoritativeAir:true},"2026-10-21T23:17:00Z"),/bounded/);
 assert.throws(()=>candidateEdition(c,"not-a-time"),/as-of/);
});
test("bounded candidate edition never auto-publishes; station can opt out entirely",()=>{
 const e=candidateEdition(copy(),at,{maxCards:1});
 assert.equal(e.candidateCount,1);assert.equal(e.overflowingEligible,2);
 assert.equal(candidateEdition([],at).candidateCount,0);
 assert.equal(candidateEdition([],at).airAuthority,"NONE");
});
