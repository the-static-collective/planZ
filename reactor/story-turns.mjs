#!/usr/bin/env node
// STORY-ROOMS-004: ORIGINAL planZ four lenses applied to a held JAR;VIS story packet.
// Replayable planning only. No media render, story-canon rewrite, grants, or field actions.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {LENSES} from './recursive.mjs';
const hash=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const need=(ok,label)=>{if(!ok)throw Error('STORY_TURNS_HOLD_'+label);};
const statuses=new Map([
 ['collective-movie','CROSS_MEDIA_RELATION_CANON_EVENT_ONLY'],
 ['pet-sitter','FEATURED_STORY_SEED'],
 ['deuce-stream','INCUBATING_MULTIMEDIA_SEED'],
 ['renji-game','INCUBATING_MULTIMEDIA_SEED'],
 ['renji-treatise','FICTIONAL_BOOK_PROPOSAL'],
 ['collection-event','FIXED_FICTIONAL_CANON'],
 ['octopus-rooms','CANDIDATE_CREATIVE_SEED'],
 ['octopus-mutation','CANDIDATE_MUTATION_NOT_CANON']
]);
export function compileStoryTurn(input,{depth=2}={}){
 need(Number.isInteger(depth)&&depth>=1&&depth<=2,'DEPTH');
 need(input&&input.schema==='jarvis.story-rooms-packet/v1'&&input.payload&&
    input.digest==='sha256:'+hash(input.payload),'SOURCE_PACKET_DIGEST');
 const p=input.payload;
 need(p.schema==='jarvis.story-rooms-payload/v1'&&p.authority==='NONE_REVIEW_HOLD'&&
    p.humanOutcomes===0&&p.realWorldClaims===false&&p.mediaEnginesExecuted===0&&
    p.newStoryCanonDeclared===false&&p.sourceOwnerAdmission===false&&p.externalAction===false&&
    p.voqalApplicationSubmitted===false&&p.sourceMode==='PUBLIC_CREATIVE_SOURCE_DESCRIPTIONS_NO_MEDIA_COPIED','SOURCE_AUTHORITY');
 need(Array.isArray(p.rules)&&p.rules.includes('CANON_001_STAYS_FIXED')&&
    p.rules.includes('RENJI_NOT_AMNESIAC')&&p.rules.includes('ANIMALS_NOT_PUPPETS')&&
    p.rules.includes('OCTOPUS_NOT_SCIENTIFIC_CLAIM'),'STORY_BOUNDARIES');
 need(Array.isArray(p.sourceReferences)&&p.sourceReferences.length>=2&&p.sourceReferences.length<=5&&
    Array.isArray(p.planCandidates)&&p.planCandidates.length>=1&&p.planCandidates.length<=10,'SOURCE_SET');
 const ids=p.sourceReferences.map(x=>x.id);
 need(ids.length===new Set(ids).size&&ids.every((id,i)=>statuses.get(id)===p.sourceReferences[i].state),'SOURCE_ID');
 need(Array.isArray(p.branches)&&p.branches.length===p.planCandidates.length,'BRANCH_COUNT');
 need(p.planCandidates.every(c=>c.executed===false&&c.ownerApproved===false&&
    c.rightsCleared===false&&c.realPeople===0&&c.status==='PLANNING_CANDIDATE_ONLY'),'PROPOSAL_AUTHORITY');
 const sourceDigest=input.digest;
 const plans=[],cuts=[];
 let previous=p.planCandidates.map((c,i)=>{
  need(c.question===p.branches[i].question&&JSON.stringify(c.parentIds)===JSON.stringify(p.branches[i].parentIds),'PAIR_LINK');
  need(c.parentIds.every(id=>ids.includes(id)),'SOURCE_PAIR');
  return {id:c.id,question:c.question,generation:0,sourceIds:c.parentIds,sourcePacketDigest:sourceDigest};
 });
 for(let generation=1;generation<=depth;generation++){
  const next=[];
  for(const parent of previous){
   const views=LENSES.map(lens=>{
    const b={schema:'static-collective/planz-story-turn/v1/cut',generation,parentId:parent.id,
     rootSourceIds:parent.sourceIds,sourcePacketDigest:sourceDigest,
     lensId:lens.id,originalQuestion:parent.question,
     pressureQuestion:lens.pressure,proposedExperiment:lens.protocol,stopCondition:lens.stop,
     status:'HELD_FICTION_INSPIRED_PLANNING_ONLY',executed:false,sourceOwnerApproved:false,
     realOutcomeVerified:false};
    return {id:'story-cut-'+hash(b).slice(0,24),...b};
   });
   cuts.push(...views);
   const body={schema:'static-collective/planz-story-turn/v1/plan',generation,
    parentId:parent.id,sourceIds:parent.sourceIds,sourcePacketDigest:sourceDigest,
    lensIds:views.map(x=>x.id),originalQuestion:parent.question,
    nextQuestion:'After four independently retained planZ pressures, what smallest optional and independently reviewable paper-first second-table prototype can address '+parent.question,
    abortIf:'If participants cannot refuse, leave, keep their own records or safely continue without the founder, do not promote this plan.',
    status:'HELD_PROPOSAL_ONLY',executed:false,admitted:false,published:false,
    humanSelection:'NONE',nativeMediaEnginesExecuted:0,realOutcomeVerified:false};
   const plan={id:'story-plan-'+hash(body).slice(0,24),...body};
   plans.push(plan);
   next.push({id:plan.id,question:plan.nextQuestion,generation,sourceIds:parent.sourceIds,sourcePacketDigest:sourceDigest});
  }
  previous=next;
 }
 const manifest={schema:'static-collective/planz-story-turn/v1',sourcePacketDigest:sourceDigest,
  sourceOwner:'the-static-collective/JAR-VIS / STORY-ROOMS-002',
  nativePlanZLenses:LENSES.map(x=>x.id),generationLimit:depth,
  originalFictionSources:p.sourceReferences.map(x=>({id:x.id,state:x.state,url:x.url})),
  cuts,plans,fictionalCanonModified:false,sourceCodeExecutedHere:'ORIGINAL_PLANZ_LENSES_ONLY',
  externalMediaRenders:0,externalPlanDispatches:0,realHumanOutcomes:0,
  secondTableHumanPermission:'UNPROVEN',voqalApplicationSubmitted:false,
  status:'HELD_PROPOSED_NO_REAL_WORLD_AUTHORITY'};
 return {...manifest,manifestDigest:'sha256:'+hash(manifest)};
}
export function verifyStoryTurn(manifest,input){
 const actual=compileStoryTurn(input,{depth:manifest?.generationLimit});
 need(JSON.stringify(actual)===JSON.stringify(manifest),'TAMPER_OR_FOREIGN_PLAN');
 return {digest:manifest.manifestDigest,disposition:'REPLAY_VERIFIED_LOCAL_ONLY',realWorldAuthority:false};
}
const cli=process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href;
if(cli){
 const [op,source,output]=process.argv.slice(2);
 try{
  if(!['compile','verify'].includes(op)||!source||!output)throw Error('Usage: node reactor/story-turns.mjs compile INPUT.json OUTPUT.json | verify INPUT.json MANIFEST.json');
  const input=JSON.parse(readFileSync(source,'utf8'));
  if(op==='compile'){
   const manifest=compileStoryTurn(input);writeFileSync(output,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
   process.stdout.write(manifest.manifestDigest+'\n');
  }else{
   const manifest=JSON.parse(readFileSync(output,'utf8'));
   process.stdout.write(JSON.stringify(verifyStoryTurn(manifest,input))+'\n');
  }
 }catch(err){console.error(String(err));process.exitCode=1;}
}
