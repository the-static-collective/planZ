import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ACTIONS,solve,replaySteps,makePlan,validateSavedPlan,validatePacket}
 from '../scripts/motif-classical.mjs';
const raw=readFileSync(new URL('../intake/MOTIF-021/alex-research-packet.json',import.meta.url));
const packet=JSON.parse(raw);
const saved=JSON.parse(readFileSync(new URL('../plans/MOTIF-021-classical.json',import.meta.url)));
test('actual ALEX source bytes are Git-blob pinned and preserve public-only evidence limits',()=>{
 const pin=validatePacket(packet,raw);
 assert.equal(pin.source_count,5);
 assert.equal(pin.hit_count,12);
 assert.equal(pin.git_blob,'71485bd8327bb1bf320d00e0e6e1cee3449365b6');
 assert.equal(packet.restrictions.evidence_admission,'NONE');
});
test('uniform-cost Dijkstra returns optimal finite STRIPS plan, not narrative instructions',()=>{
 const result=solve();
 assert.equal(result.status,'PLAN_FOUND');
 assert.equal(result.cost,9);
 assert.ok(result.expanded>0);
 assert.ok(!result.steps.includes('RECONSIDER_ANCESTRY_ALTERNATIVES'));
 const replay=replaySteps(ACTIONS,result.steps);
 assert.ok(replay.reached_goal);
 assert.equal(replay.cost,9);
 assert.ok(replay.trace.every(x=>x.executed_external_action===false));
});
test('persistent plan equals a reproduced shortest path at exact pinned ALEX source',()=>{
 assert.deepEqual(saved,makePlan(packet,raw));
 assert.equal(validateSavedPlan(saved,packet,raw),true);
 assert.equal(saved.status,'HELD_PLAN_NOT_EXECUTED');
 assert.equal(saved.cost_of_not_acting,'UNQUANTIFIED_NOT_TREATED_AS_ZERO');
});
test('newly proposed compiled capability is permissionless and has an allowlisted recipe',()=>{
 assert.deepEqual(saved.candidate_capability.recipe,[
   'VERIFY_PINNED_SOURCE_PACKET','BUILD_CITED_CANDIDATE_GRAPH',
   'RETURN_HUMAN_REVIEW_QUESTIONS']);
 assert.equal(saved.candidate_capability.permissions,'NONE');
 assert.equal(saved.candidate_capability.implementation_needed,true);
});
test('impossible goals and unknown actions explicitly HOLD',()=>{
 assert.equal(solve(ACTIONS,['ALEX_PUBLIC_PACKET_PRESENT'],['AUTHORITY_NOT_IN_DOMAIN']).status,'HOLD_UNREACHABLE_GOAL');
 assert.throws(()=>replaySteps(ACTIONS,['TEST_CAPABILITY_SANDBOX']),/FAILED_PRECONDITION/);
 assert.throws(()=>replaySteps(ACTIONS,['AUTOMATIC_DEPLOY']),/UNKNOWN_CLASSICAL_ACTION/);
});
test('illegal effects, goals, negative action costs and forged source packet are refused',()=>{
 assert.throws(()=>solve([...ACTIONS,{name:'EVIL',pre:[],add:['EVIDENCE_ADMITTED'],del:[],cost:1}]),/UNSAFE/);
 assert.throws(()=>solve([...ACTIONS,{name:'EVIL',pre:[],add:['X'],del:[],cost:-4}]),/UNSAFE/);
 assert.throws(()=>solve(ACTIONS,['ALEX_PUBLIC_PACKET_PRESENT'],['PRIVATE_CONTENT_PUBLISHED']),/FORBIDDEN/);
 assert.throws(()=>validatePacket(packet,Buffer.from(raw.toString()+' ')),/CHANGED/);
 assert.throws(()=>validatePacket({...packet,restrictions:{...packet.restrictions,evidence_admission:'YES'}},raw),/INTAKE/);
});
test('tampered staged plan cannot silently inherit owner authority',()=>{
 assert.throws(()=>validateSavedPlan({...saved,source_owner_approval:true},packet,raw),/CHANGED_OR_AUTHORITY/);
 assert.throws(()=>validateSavedPlan({...saved,actions:['AUTOMATIC_DEPLOY']},packet,raw),/CHANGED_OR_AUTHORITY/);
});
