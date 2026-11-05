import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {classifyQuestion,planQuestion,validatePlan} from '../scripts/motif022-plan.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
function fake(question,found=true){
 const body={schema:'alex.motif022.question-packet/v0',
  question,query_hash:sha(question),terms:['question','source'],
  status:found?'RESEARCH_PACKET_HELD':'HOLD_NO_MATCHES',
  hits:found?[{source_blob:'a'.repeat(40),source_commit:'b'.repeat(40),line:3}]:[],
  coverage:Array.from({length:5},(_,i)=>({id:'SRC-0'+(i+1)})),
  source_count:5,partial_coverage:true,total_matched_lines:found?1:0,
  truncated:false,inquiry_not_source_authentication:true,
  real_independence_proved:false,authority:'none',external_actions:0};
 return {...body,checksum:sha(JSON.stringify(body))};
}
test('new questions construct DIFFERENT actual classical plans',()=>{
 const lineage=planQuestion(fake('Which original ancestor should we trace?'));
 const compose=planQuestion(fake('Which GRAFT capability could we compose?'));
 const trust=planQuestion(fake('Could independent reference observers be corrupted?'));
 assert.equal(lineage.intent,'LINEAGE');
 assert.equal(compose.intent,'COMPOSITION');
 assert.equal(trust.intent,'RELIABILITY');
 assert.equal(lineage.status,'PLAN_HELD_FOR_OWNER');
 assert.ok(lineage.actions.includes('TRACE_ORIGINAL_PROVENANCE'));
 assert.ok(compose.actions.includes('COMPOSE_ALLOWED_RECIPE'));
 assert.ok(trust.actions.includes('TEST_INDEPENDENT_REPORTS'));
 assert.notDeepEqual(lineage.actions,compose.actions);
 assert.ok(lineage.cost>compose.cost);
 assert.equal(validatePlan(lineage,fake('Which original ancestor should we trace?')),true);
});
test('cheap classical path beats more expensive route',()=>{
 const p=planQuestion(fake('Which original ancestor should we trace?'));
 assert.ok(!p.actions.includes('COMPARE_SUSPECTED_FAMILIES'));
 assert.equal(p.cost,7);
 assert.equal(p.external_actions,0);
 assert.equal(p.no_owner_approval,true);
});
test('no matched sources produces HOLD, not plausible-looking plan',()=>{
 const p=planQuestion(fake('Can a flibber quasarship turn to squarzonium?',false));
 assert.equal(p.status,'HOLD_NO_SOURCED_LEADS');
 assert.deepEqual(p.actions,[]);
 assert.equal(p.authority,'none');
});
test('forged source evidence or changed plan cannot enter classical engine',()=>{
 const pkt=fake('Which original ancestor should we trace?');
 assert.throws(()=>planQuestion({...pkt,real_independence_proved:true}),/UNTRUSTED/);
 assert.throws(()=>planQuestion({...pkt,question:'forged'}),/CHANGED/);
 const p=planQuestion(pkt);
 assert.throws(()=>validatePlan({...p,cost:0},pkt),/NOT_REPLAYABLE/);
});
