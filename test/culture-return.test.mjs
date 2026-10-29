import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {checkCultureOffer,triageCultureOffer} from '../scripts/triage-culture.mjs';
const feed=JSON.parse(readFileSync(new URL('../public/attention-v1.json',import.meta.url)));
function packet(){
 const body={schema:'cannon.culture-reuse-offer/v1',
  source:{cultureReceipt:'sha256:'+'a'.repeat(64),comicSha256:'sha256:'+'b'.repeat(64),
   pressReceipt:'sha256:'+'c'.repeat(64),ghotReceipt:'ghot-receipt-long-demo',
   crossing:'crossing-long-demo',received:'received-long-demo',held:'held-long-demo-longer'},
  proposal:{kind:'REUSABLE_CULTURAL_METHOD_CANDIDATE',title:'A Room That Remembers',
   candidateMethod:'Use six illustrated panels to show how a neighbor can adapt a useful local method.',
   suggestedUse:'Ask a willing steward whether a public-safe printed learning card is useful.'},
  truth:{fictional:true,humanAuthenticated:false,fieldUseVerified:false,licensedEdition:false,
   ownerCanonSelected:false,sourceSignatureIndependentlyVerified:false},
  effects:{pennyIssued:0,humanDeeds:0,externalPayments:0,nftsMinted:0,automaticActions:0}};
 return {...body,identity:'sha256:'+createHash('sha256').update('CULTURE_RETURN_005|'+JSON.stringify(body)).digest('hex')};
}
test('source-owned planZ owner review never changes the actual published plan',()=>{
 const p=packet(),r=triageCultureOffer(p,feed,'ATLAS-BRIDGE-002');
 assert.equal(r.culturePacket,p.identity);assert.equal(r.indexEdition,feed.edition);
 assert.equal(r.planUpdated,false);assert.equal(r.executionAllowed,false);
 assert.equal(r.ownerGate,feed.entries.find(x=>x.id==='ATLAS-BRIDGE-002').nextGate);
 assert.equal(r.disposition,'HOLD_FOR_PLAN_OWNER_REVIEW');
});
test('fake fees, field outcome, signature, changed SHA, and foreign plan fail',()=>{
 const p=packet();const t=structuredClone(p);t.truth.humanAuthenticated=true;
 assert.throws(()=>checkCultureOffer(t));
 const e=structuredClone(p);e.effects.pennyIssued=1;
 assert.throws(()=>checkCultureOffer(e));
 const s=structuredClone(p);s.source.comicSha256='sha256:'+'e'.repeat(64);
 assert.throws(()=>checkCultureOffer(s));
 assert.throws(()=>triageCultureOffer(p,feed,'UNKNOWN-PLAN'));
 const f=structuredClone(feed);f.entries[0].executionAllowed=true;
 assert.throws(()=>triageCultureOffer(p,f,'ATLAS-BRIDGE-002'));
});
