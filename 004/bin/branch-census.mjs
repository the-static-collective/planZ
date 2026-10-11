#!/usr/bin/env node
// planZ 004 — a read-only, branch-native capability directory; not a runtime.
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const SCHEMA='static-collective/planz-branch-capability/v0';
const SNAPSHOT='static-collective/planz-branch-capability-snapshot/v0';
const SHAS=/^[0-9a-f]{40}$/;
const REPO=/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
const ID=/^[a-z][a-z0-9-]{1,79}$/;
const fail=(ok,why)=>{if(!ok)throw Error(why);};
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const exact=(x,keys)=>plain(x)&&Object.keys(x).sort().join('|')===keys.slice().sort().join('|');
const canonical=x=>{
  if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);
  if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
  fail(plain(x),'NON_JSON_VALUE');
  return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
};
const digest=x=>createHash('sha256').update(canonical(x)).digest('hex');
const pathSafe=x=>typeof x==='string'&&x.length>0&&x.length<220&&/^[a-zA-Z0-9_.\/-]+$/.test(x)&&!x.startsWith('/')&&x.split('/').every(y=>y!=='.'&&y!=='..'&&y!=='');
const list=(x,max=20)=>Array.isArray(x)&&x.length<=max&&x.every(y=>typeof y==='string'&&y.trim().length>0&&y.length<=280);
export function validate(input){
  fail(exact(input,['schema','observedAt','records','origin']),'INVALID_MANIFEST_FIELDS');
  fail(input.schema===SCHEMA&&input.origin==='HUMAN_CURATED_EXACT_GIT_PINS'&&/^\d{4}-\d\d-\d\d$/.test(input.observedAt),'INVALID_MANIFEST_HEADER');
  fail(Array.isArray(input.records)&&input.records.length>0&&input.records.length<=500,'INVALID_RECORD_COUNT');
  const ids=new Set();
  for(const c of input.records){
    fail(exact(c,['id','repository','branchHint','commit','entrypoint','runtime','role','evidence','gates','claims','nonClaims']),'INVALID_RECORD_FIELDS');
    fail(ID.test(c.id)&&!ids.has(c.id),'DUPLICATE_OR_BAD_ID');ids.add(c.id);
    fail(REPO.test(c.repository)&&SHAS.test(c.commit)&&pathSafe(c.entrypoint),'INVALID_SOURCE_IDENTITY');
    fail(typeof c.branchHint==='string'&&c.branchHint.length<=180&&c.branchHint!=='main'&&/^[a-zA-Z0-9_./-]+$/.test(c.branchHint),'INVALID_BRANCH_HINT');
    fail(['NODE_22','NODE_24','OTHER_MANUAL'].includes(c.runtime)&&['CLI','LIBRARY','INSTRUMENT'].includes(c.role),'INVALID_RUNTIME_ROLE');
    fail(exact(c.evidence,['kind','url'])&&c.evidence.kind==='CI_RUN_OBSERVED'&&typeof c.evidence.url==='string'&&
      new RegExp('^https://github\\.com/'+c.repository.replace('/','\\/')+'/actions/runs/[0-9]+$').test(c.evidence.url),'INVALID_CI_EVIDENCE');
    fail(list(c.gates)&&list(c.claims)&&list(c.nonClaims)&&c.nonClaims.length>0,'INVALID_BOUNDARIES');
  }
  return input;
}
export function census(input){
  validate(input);
  const records=input.records.map(c=>({
    ...c,
    status:'PINNED_REVIEW_CANDIDATE',
    branch_is_not_backlog:true,
    source_bytes_verified_by_this_census:false,
    ci_rechecked_by_this_census:false,
    execution_authorized:false,
  })).sort((a,b)=>a.id.localeCompare(b.id));
  const body={schema:SNAPSHOT,observedAt:input.observedAt,sourceManifestSha256:digest(input),records,
    claims:['Human-curated snapshot of exact branch commit references','Evidence links are observed references, not independently attested CI'],
    nonClaims:['No merge required','No source Git object inspected by this census','No owner identity established','No deployment or runtime grant','No project-local disposition override'],
    authority:'none',selection:'NONE',effects:0};
  return {...body,semanticSha256:digest(body)};
}
export function verify(input,snapshot){
  const expected=census(input);
  fail(canonical(snapshot)===canonical(expected),'SNAPSHOT_REPLAY_MISMATCH');
  return {status:'COLD_REPLAY_VERIFIED',semanticSha256:expected.semanticSha256,records:expected.records.length,effects:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const [command,manifest='004/capabilities.json',out]=process.argv.slice(2);
    fail(['build','verify'].includes(command),'USAGE: build|verify [manifest] [snapshot]');
    const data=JSON.parse(readFileSync(resolve(manifest),'utf8'));
    if(command==='build'){
      const result=census(data);
      const json=JSON.stringify(result,null,2)+'\n';
      if(out)writeFileSync(resolve(out),json,{flag:'wx',mode:0o600});else process.stdout.write(json);
    }else{
      fail(!!out,'VERIFY_NEEDS_SNAPSHOT');
      console.log(JSON.stringify(verify(data,JSON.parse(readFileSync(resolve(out),'utf8')))));
    }
  }catch(e){console.error('HOLD:',e.message);process.exitCode=2;}
}
