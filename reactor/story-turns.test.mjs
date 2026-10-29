import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {compileStoryTurn,verifyStoryTurn} from './story-turns.mjs';
const hash=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
function source(){
 const refs=[
 {id:'collection-event',state:'FIXED_FICTIONAL_CANON',url:'https://example.invalid/fiction-source'},
 {id:'octopus-rooms',state:'CANDIDATE_CREATIVE_SEED',url:'https://example.invalid/fiction-source2'}
 ];
 const question='Can story rooms provide a paper-first way to welcome a stranger?';
 const pair=refs.map(x=>x.id);
 const payload={schema:'jarvis.story-rooms-payload/v1',authority:'NONE_REVIEW_HOLD',
  humanOutcomes:0,realWorldClaims:false,mediaEnginesExecuted:0,newStoryCanonDeclared:false,
  sourceOwnerAdmission:false,externalAction:false,voqalApplicationSubmitted:false,
  sourceMode:'PUBLIC_CREATIVE_SOURCE_DESCRIPTIONS_NO_MEDIA_COPIED',
  rules:['CANON_001_STAYS_FIXED','RENJI_NOT_AMNESIAC','ANIMALS_NOT_PUPPETS','OCTOPUS_NOT_SCIENTIFIC_CLAIM'],
  sourceReferences:refs,branches:[{parentIds:pair,question}],
  planCandidates:[{id:'candidate-001',parentIds:pair,question,executed:false,ownerApproved:false,
   rightsCleared:false,realPeople:0,status:'PLANNING_CANDIDATE_ONLY'}]};
 return {schema:'jarvis.story-rooms-packet/v1',payload,digest:'sha256:'+hash(payload)};
}
test('original PlanZ four lenses over JAR;VIS story packet, two generations HELD',()=>{
 const a=compileStoryTurn(source());
 assert.deepEqual(a.nativePlanZLenses,['ABSENCE','TIME','CARRIER','RECEIVER']);
 assert.equal(a.cuts.length,8);assert.equal(a.plans.length,2);
 assert.equal(a.status,'HELD_PROPOSED_NO_REAL_WORLD_AUTHORITY');
 assert.equal(a.fictionalCanonModified,false);assert.equal(a.realHumanOutcomes,0);
 assert.deepEqual(verifyStoryTurn(a,source()).realWorldAuthority,false);
 assert.deepEqual(a,compileStoryTurn(source()));
});
test('forged grant, fictional canon, edited receipt, altered plan and unbounded recursion refused',()=>{
 const s=source();
 const bad={...s,payload:{...s.payload,newStoryCanonDeclared:true}};
 assert.throws(()=>compileStoryTurn(bad),/STORY_TURNS_HOLD/);
 assert.throws(()=>compileStoryTurn(s,{depth:4}),/STORY_TURNS_HOLD/);
 const a=compileStoryTurn(s);
 assert.throws(()=>verifyStoryTurn({...a,realHumanOutcomes:1},s),/STORY_TURNS_HOLD/);
 assert.throws(()=>verifyStoryTurn({...a,plans:[]},s),/STORY_TURNS_HOLD/);
});
