import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyEvent,createRehearsal,evaluateCards,replay,projectSession} from '../src/engine.mjs';
import {buildWitness} from '../bin/rehearse.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../fixtures/'+n,import.meta.url)));
const fixture=()=>read('three-towns.json');
const journey=()=>read('journey.json');
const prefix=n=>replay(fixture(),journey().slice(0,n));
const event=(type,extra={})=>({id:'hostile-event',type,...extra});

test('T0: exact three-card frontier; private card never appears in projection',()=>{
  const p=evaluateCards(read('three-cards.json'));
  assert.deepEqual(p.cards.map(c=>[c.id,c.disposition]),[['genesis-door','ELIGIBLE_FOR_LOOKUP'],['jubilee-theme','CITATION_ONLY_SOURCE_UNRESOLVED']]);
  assert.equal(p.excludedCount,1); assert.ok(!JSON.stringify(p).includes('held-need'));
  assert.equal(p.exclusions.PRIVATE_OR_WITHDRAWN,1);
  for(const c of p.cards) assert.equal(c.revivalAddress,null);
  assert.deepEqual(p.appliedEffects,[]);
});
test('real captures and fabricated source fields are refused',()=>{
  let f=fixture(); f.status='LIVE'; assert.throws(()=>createRehearsal(f),/Synthetic/);
  f=fixture(); f.cards[0].revivalAddress='revival://invented'; assert.throws(()=>evaluateCards(f),/fields/);
});
test('expired, opted-out and revoked cards all disappear',()=>{
  const f=fixture(); f.cards[0].expiresAt=f.now; f.cards[1].optIn=false; f.cards[2].revoked=true;
  const p=evaluateCards(f); assert.ok(!p.cards.some(c=>['genesis-door','jubilee-theme','shared-table'].includes(c.id)));
});
test('unknown weather, inferred source citation and extra personal data cannot enter the schema',()=>{
  const f=fixture(); f.cards[0].email='private@example.invalid'; assert.throws(()=>evaluateCards(f),/fields/);
  delete f.cards[0].email; f.cards[0].citation='Genesis 1:1'; assert.equal(evaluateCards(f).cards.find(c=>c.id==='genesis-door').disposition,'CITATION_ONLY_SOURCE_UNRESOLVED');
});
test('duplicate IDs and malformed times refuse',()=>{
  let f=fixture(); f.cards[1].id=f.cards[0].id; assert.throws(()=>createRehearsal(f),/Duplicate/);
  f=fixture(); f.now='yesterday'; assert.throws(()=>createRehearsal(f),/fixed time/);
  f=fixture(); f.now='2026-02-31T12:00:00Z'; assert.throws(()=>createRehearsal(f),/fixed time/);
});
test('separate paper inspections keep separate occurrences without effects or source addresses',()=>{
  let s=applyEvent(prefix(0),event('INSPECT_DOOR',{card:'genesis-door'}));
  s=applyEvent(s,{id:'another-inspection',type:'INSPECT_DOOR',card:'genesis-door'});
  assert.equal(s.observations.length,2); assert.notEqual(s.observations[0].id,s.observations[1].id);
  assert.ok(s.observations.every(o=>o.effect==='NONE' && o.revivalAddress===null));
  assert.deepEqual(projectSession(s).appliedEffects,[]);
});
test('both local hosts must opt in before travel',()=>{
  assert.throws(()=>applyEvent(prefix(1),event('TRAVEL',{town:'river'})),/Host/);
  assert.throws(()=>applyEvent(prefix(0),event('ACCEPT_HOST',{town:'river',actor:'host-orchard'})),/local host/);
});
test('town skipping and unowned destinations refuse',()=>{
  assert.throws(()=>applyEvent(prefix(2),event('TRAVEL',{town:'harbor'})),/next town/);
});
test('physical CD permission does not become broadcast or arbitrary destination permission',()=>{
  assert.throws(()=>applyEvent(prefix(2),event('CARRY_ARTIFACT',{card:'traveling-song',town:'harbor',actor:'musician'})),/permission/);
  assert.throws(()=>applyEvent(prefix(2),event('BROADCAST',{card:'traveling-song'})),/Unknown/);
});
test('carrying and arrival do not establish receiver acceptance',()=>{
  const s=prefix(7); assert.equal(s.carries[0].status,'AWAITING_RECEIPT');
  assert.throws(()=>applyEvent(s,event('RECEIVE_ARTIFACT',{carry:'carry-song',actor:'musician'})),/acceptance/);
  assert.throws(()=>applyEvent(prefix(3),event('RECEIVE_ARTIFACT',{carry:'carry-song',actor:'host-river'})),/acceptance/);
});
test('unrelated party and fabricated owner cannot withdraw a card',()=>{
  assert.throws(()=>applyEvent(prefix(2),event('WITHDRAW_CARD',{card:'traveling-song',actor:'host-river'})),/owner/);
});
test('withdrawal blocks fresh matching and handoff even after travel',()=>{
  const s=applyEvent(prefix(7),event('WITHDRAW_CARD',{card:'traveling-song',actor:'musician'}));
  assert.throws(()=>applyEvent(s,{id:'attempt-receive',type:'RECEIVE_ARTIFACT',carry:'carry-song',actor:'host-river'}),/unavailable/);
  assert.equal(projectSession(s).carries.length,0); assert.ok(!JSON.stringify(projectSession(s)).includes('traveling-song'));
});
test('private tags cannot be proposed as introductions',()=>{
  assert.throws(()=>applyEvent(prefix(2),event('PROPOSE_HELP',{card:'held-need',town:'river',recipient:'private-neighbor',helper:'host-river'})),/unavailable/);
});
test('unilateral permission cannot report or confirm aid',()=>{
  assert.equal(prefix(5).introductions[0].status,'PROPOSED');
  assert.throws(()=>applyEvent(prefix(5),event('REPORT_DELIVERY',{introduction:'help-table',actor:'host-river'})),/Approved/);
  assert.throws(()=>applyEvent(prefix(6),event('CONFIRM_AID',{introduction:'help-table',actor:'neighbor'})),/reported/);
});
test('decline is terminal and prevents delivery',()=>{
  const s=applyEvent(prefix(4),event('DECIDE_HELP',{introduction:'help-table',actor:'neighbor',decision:'DECLINE'}));
  assert.equal(s.introductions[0].status,'REFUSED');
  assert.throws(()=>applyEvent(s,{id:'helper-late',type:'DECIDE_HELP',introduction:'help-table',actor:'host-river',decision:'ACCEPT'}),/decision/);
});
test('helpers cannot confirm their own delivery reports',()=>{
  assert.equal(prefix(9).introductions[0].status,'REPORTED');
  assert.throws(()=>applyEvent(prefix(9),event('CONFIRM_AID',{introduction:'help-table',actor:'host-river'})),/Recipient/);
});
test('withdrawn need blocks new reports and disappears from discovery',()=>{
  const s=applyEvent(prefix(8),event('WITHDRAW_CARD',{card:'shared-table',actor:'neighbor'}));
  assert.throws(()=>applyEvent(s,{id:'late-report',type:'REPORT_DELIVERY',introduction:'help-table',actor:'host-river'}),/unavailable/);
  assert.equal(projectSession(s).introductions.length,0);
});
test('repeated scan/action IDs are idempotent; changed replay is refused',()=>{
  const s=prefix(1); const reordered={actor:'host-orchard',town:'orchard',type:'ACCEPT_HOST',id:'host-a'};
  assert.deepEqual(applyEvent(s,reordered),s);
  assert.throws(()=>applyEvent(s,{...journey()[0],actor:'host-river'}),/Conflicting/);
});
test('repeated distinct carry events cannot duplicate a consequence',()=>{
  assert.throws(()=>applyEvent(prefix(3),{...journey()[2],id:'second-carry'}),/already carried/);
});
test('replay leaves input fixture and event arrays unchanged',()=>{
  const f=fixture(), es=journey(), before=JSON.stringify([f,es]); replay(f,es); assert.equal(JSON.stringify([f,es]),before);
});
test('return requires all three towns, receipt and recipient confirmation',()=>{
  assert.throws(()=>applyEvent(prefix(10),event('RECORD_RETURN')),/Third town/);
  const es=journey().filter(e=>e.type!=='CONFIRM_AID' && e.type!=='RECORD_RETURN');
  assert.throws(()=>applyEvent(replay(fixture(),es),event('RECORD_RETURN')),/confirmation/);
});
test('full three-town journey closes with synthetic return and zero effects',()=>{
  const p=projectSession(prefix(13)); assert.deepEqual(p.visitedTowns,['orchard','river','harbor']);
  assert.equal(p.returns[0].status,'SYNTHETIC_RETURN'); assert.equal(p.introductions[0].status,'CONFIRMED');
  assert.equal(p.carries[0].sourceTown,'orchard'); assert.equal(p.carries[0].receivedAt,'river');
  assert.equal(p.authority,'NONE'); assert.deepEqual(p.appliedEffects,[]); assert.deepEqual(p.createdConnections,[]);
});
test('withdrawal after return preserves local history but removes reusable public references',()=>{
  const p=projectSession(applyEvent(prefix(13),event('WITHDRAW_CARD',{card:'shared-table',actor:'neighbor'})));
  assert.equal(p.returns.length,1); assert.deepEqual(p.returns[0].aidIds,[]); assert.equal(p.introductions.length,0);
});
test('cold witness is deterministic and binds changed input, not physical truth',()=>{
  const a=buildWitness(fixture(),journey()); assert.deepEqual(a,buildWitness(fixture(),journey()));
  const f=fixture(); f.cards[0].label='Different card'; assert.notEqual(a.semanticSha256,buildWitness(f,journey()).semanticSha256);
  assert.ok(a.nonclaims.includes('AUTHENTICATED_CONSENT')); assert.equal(a.semanticSha256.length,64);
});
test('checked-in return witness replays as exact canonical JSON',()=>{
  assert.deepEqual(buildWitness(fixture(),journey()),read('return-witness.json'));
});
