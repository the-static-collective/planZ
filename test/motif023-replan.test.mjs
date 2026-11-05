import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {planEvidence,verifyObservation,verifyPlan,replanAfterObservation}
 from '../scripts/motif023-replan.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const repo='the-static-collective/GRAFT';
const source={repository:repo,source_commit:'a'.repeat(40),tree_sha:'b'.repeat(40),
 default_branch:'main',public_eligibility_verified:true,
 selected_documents:[{path:'README.md',git_blob:'c'.repeat(40),size:120}],
 eligible_files:2,tree_items:5,selection_truncated:true};
export function makeSample(question,sourceCount=1){
 const sources=[source];
 if(sourceCount===2)sources.push({...source,
  repository:'the-static-collective/ALEX.2',
  source_commit:'d'.repeat(40),tree_sha:'e'.repeat(40)});
 const base={
  schema:'alex.motif023.live-public-evidence/v0',
  status:'HELD_SOURCE_RESEARCH_PACKET',question,
  selection:{repositories:sources.map(s=>s.repository)},
  sources,errors:[],hits:[{
   repository:repo,source_commit:source.source_commit,
   path:'README.md',git_blob:'c'.repeat(40),line:5,
   support:'SEARCH_LEAD_NOT_ADMITTED_SOURCE_EVIDENCE'}],
  authority:'none',remote_writes:0,
  private_material_accessed:false,
  evidence_admission:'NONE',source_custody_authenticated:false
 };
 return {...base,receipt_sha256:hash(base)};
}
test('actually observed public source cut creates a replayable classical plan',()=>{
 const source=makeSample('Where does source custody identify Maxhinal ancestry?');
 assert.equal(verifyObservation(source),true);
 const plan=planEvidence(source);
 assert.equal(plan.status,'HELD_CLASSICAL_PLAN');
 assert.equal(plan.mode,'LINEAGE');
 assert.ok(plan.steps.includes('PROPOSE_INDEPENDENT_CUSTODY_CHALLENGE'));
 assert.ok(!plan.steps.includes('RUN_UNBOUNDED_GENEALOGY_SEARCH'));
 assert.equal(plan.no_remote_execution,true);
 assert.equal(verifyPlan(plan,source),true);
});
test('different questions and observed repo count change the shortest-cost plan',()=>{
 const lineage=planEvidence(makeSample('Where does original Maxhinal custody reside?',1));
 const composition=planEvidence(makeSample('How does GRAFT compose executable code?',2));
 const trust=planEvidence(makeSample('What causes reference reliability drift?',1));
 assert.equal(composition.mode,'COMPOSITION');
 assert.equal(trust.mode,'REFERENCE');
 assert.notDeepEqual(lineage.steps,composition.steps);
 assert.ok(composition.total_declared_cost<lineage.total_declared_cost);
 assert.ok(trust.steps.includes('PROPOSE_REFERENCE_INDEPENDENCE_AUDIT'));
});
test('feedback causes a NEW classical plan with next question and unexplored public collections',()=>{
 const packet=makeSample('Where is the original source custody for Maxhinal?');
 const plan=planEvidence(packet);
 const feedback={
  schema:'graft.motif023.capability-observation/v0',
  source_plan_receipt:plan.receipt_sha256,
  source_alex_receipt:packet.receipt_sha256,
  authority:'none',external_actions:0,
  independent_custody_confirmed:false,
  source_coverage_complete:false,
  gaps:['UNCERTIFIED_SOURCE_FAMILY','SOURCE_SCOPE_PARTIAL']
 };
 const next=replanAfterObservation(packet,plan,feedback);
 assert.equal(next.selected_next_discriminator,'TEST_INDEPENDENT_SOURCE_FAMILY');
 assert.ok(next.classical_steps.includes('FORM_INDEPENDENCE_QUESTION'));
 assert.equal(next.new_collection_not_in_initial_query,true);
 assert.deepEqual(next.next_source_collections,
  ['the-static-collective/ALEX.2','the-static-collective/GRAFT']);
 assert.equal(next.external_actions,0);
});
test('a search that found no sources can NEVER trigger a capability',()=>{
 const p=makeSample('Are undecipherable things in source X?');
 p.status='HOLD_NO_MATCHING_VERIFIED_SOURCE';
 p.hits=[];
 const {receipt_sha256,...body}=p;p.receipt_sha256=hash(body);
 const plan=planEvidence(p);
 assert.equal(plan.status,'HOLD_NO_ADMISSIBLE_SOURCE_LEADS');
 assert.deepEqual(plan.actions,[]);
});
test('packet scope forgery, altered receipt, owner admission, feedback forgery HOLD',()=>{
 const p=makeSample('Where is the original source custody?');
 assert.throws(()=>verifyObservation({...p,question:'forged'}),/CHANGED/);
 assert.throws(()=>verifyObservation({...p,private_material_accessed:true}),/INVALID/);
 assert.throws(()=>verifyObservation({...p,sources:[{...p.sources[0],public_eligibility_verified:false}]}),/CHANGED/);
 const plan=planEvidence(p);
 assert.throws(()=>verifyPlan({...plan,total_declared_cost:0},p),/CHANGED/);
 assert.throws(()=>replanAfterObservation(p,plan,{
  schema:'graft.motif023.capability-observation/v0',
  source_plan_receipt:plan.receipt_sha256,
  source_alex_receipt:p.receipt_sha256,
  independent_custody_confirmed:true,source_coverage_complete:false,
  gaps:['UNCERTIFIED_SOURCE_FAMILY'],authority:'none',external_actions:0
 }),/UNVERIFIED/);
});
