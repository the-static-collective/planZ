#!/usr/bin/env node
/**
 * NESTED-SEVEN-003 — Original PlanZ root proposal *contains* seven cycles.
 * Each cycle has a genuine earlier native software observation, a four-lens
 * pressure pass, a HELD plan, and (if depth>1) a planning-only child cycle.
 * Original creative runtimes run once upstream, not again for descendants.
 */
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,readdirSync,mkdirSync,lstatSync,existsSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {compileSevenReturn} from "./return-seven.mjs";
import {LENSES} from "./recursive.mjs";

const hash=v=>createHash("sha256").update(typeof v==="string"||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest("hex");
const bytes=v=>JSON.stringify(v,null,2)+"\n";
const id=(prefix,body)=>prefix+"-"+hash(bytes(body)).slice(0,24);
const need=(v,label)=>{if(!v)throw Error("NESTED_SEVEN_003_"+label);};
const held=()=>({status:"HELD_PROPOSAL_ONLY",authority:"NONE",humanSelection:"NONE",
    executed:false,admitted:false,published:false,externalOutcomeVerified:false});
const sort=x=>[...x].sort((a,b)=>a.id.localeCompare(b.id));
const escape=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function filesIn(dir,prefix=""){
  const all={};
  for(const f of readdirSync(dir,{withFileTypes:true})){
    need(!f.isSymbolicLink(),"SOURCE_SYMLINK");
    const name=prefix+f.name,path=join(dir,f.name);
    if(f.isDirectory())Object.assign(all,filesIn(path,name+"/"));
    else {need(f.isFile(),"SOURCE_NONFILE");all[name]=readFileSync(path);}
  }
  return all;
}
function exact(a,b,label){
  need(a.length===b.length&&a.equals(b),label);
}
function verifyOriginalLedger(original,dir){
  const current=filesIn(resolve(dir));
  const wanted={};
  for(const cut of original.cuts)wanted["cuts/"+cut.id+".json"]=Buffer.from(bytes(cut));
  for(const plan of original.plans)wanted["proposals/"+plan.id+".json"]=Buffer.from(bytes(plan));
  wanted["manifests/"+original.manifestSha256+".json"]=Buffer.from(bytes(original));
  need(Object.keys(current).length===Object.keys(wanted).length,"PRIOR_LEDGER_FILES");
  for(const [name,content] of Object.entries(wanted)) {
    need(Object.hasOwn(current,name),"PRIOR_LEDGER_MISSING_"+name);
    exact(current[name],content,"PRIOR_LEDGER_TAMPER_"+name);
  }
}
// Recursive nested HTML shows actual owner boundaries and human controls,
// not pretend "successful mechanical execution".
function renderExhibit(tree){
  const node=(c)=>{
    const turns=c.turns.map(t=>{
      if(t.stage==="CREATIVE_SOFTWARE_EVIDENCE")return '<p><b>Source-owned software evidence:</b> '+escape(t.owner)+
          '<br><code>'+escape(t.nativeOutputSha256)+'</code></p>';
      if(t.stage==="FOUR_LENS_PLANNING")return '<p><b>Planning perspectives:</b> '+
          t.lenses.map(k=>'<a href="../cuts/'+escape(k.id)+'.json">'+escape(k.lens)+'</a>').join(" · ")+'</p>';
      return '<p><b>Proposed descendant:</b> <a href="../plans/'+escape(t.planId)+'.json">'+escape(t.planId)+'</a></p>';
    }).join("");
    return '<details '+(c.generation===1?'open':'')+'><summary><span class="number">ROUND '+c.generation+
       '</span> '+escape(c.owner)+' <span class="state">HELD / planning-only'+(c.generation===1?' (real prior software evidence)':'')+'</span></summary>'+
       '<div class="inner"><p>'+escape(c.question)+'</p>'+turns+
       (c.children.length?'<div class="sub">'+c.children.map(node).join("")+'</div>':'<p class="stop">No further generation without explicit bounded review.</p>')+
       '</div></details>';
  };
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>THE NESTED BOOK OF MACHINES — HELD</title>'+
    '<style>:root{color-scheme:dark}body{max-width:1100px;margin:0 auto;background:#0d1d24;color:#f4e8ce;font:18px/1.55 Georgia,serif;padding:3vw}h1{font-size:clamp(2.4rem,6vw,5.4rem);line-height:1.02;color:#f3c082}p{max-width:75ch}code{font:14px monospace;overflow-wrap:anywhere;color:#a4e4da}a{color:#9fdfd8}details{border:1px solid #ac8d62;background:#1d3439;margin:10px 0;padding:15px}summary{cursor:pointer;font-size:1.15rem;font-weight:bold}summary::marker{color:#f9cfa3}.inner{margin:1rem 0 0 1.1rem}.sub{border-left:3px solid #bf9364;padding-left:1.4rem;margin-top:1.4rem}.number{font:13px monospace;color:#edb491}.state{display:inline-block;font:12px monospace;color:#ffd68c;margin-left:12px}.stop{font-size:.82rem;opacity:.7}.tag{letter-spacing:2px;color:#eab792;font:14px monospace}header{border-bottom:2px solid #a47b57;padding-bottom:2rem}footer{border-top:1px solid #748079;margin-top:3rem;padding:1rem 0}</style>'+
    '<header><p class="tag">PLANZ × CANNON · BOUNDED RECURSIVE INVENTION · HELD</p><h1>THE MACHINE THAT THINKS<br>INSIDE ITS OWN PLANS</h1>'+
    '<p>The first PlanZ invention is the ROOT of this entire planning cycle. Seven actual source-owned creative SOFTWARE results are held inside its first generation. Each result gets four independently preserved planning perspectives and a descendant plan. The descendant receives its own inner planning cycle; no engine is rerun or human approval inferred.</p>'+
    '<p>Original source: <code>'+escape(tree.root.sourcePlanId)+'</code><br>Root cycle: <code>'+escape(tree.root.id)+'</code></p>'+
    '<p><a href="../../one-invention-held/exhibit/index.html">View the earlier seven creative outputs</a> · <a href="../tree.json">Inspect complete nested source tree</a> · <a href="../manifest.json">Inspect proof manifest</a></p></header><h2>Seven independent subcycles inside the root</h2>'+
    tree.root.children.map(node).join("")+
    '<footer><p>Every original owner remains sovereign. This is a deterministic, bounded plan compiler, not self-directed execution. Source models and project participants have not admitted or executed the resulting ideas. No physical machine, concert, real-world witness, publication or human KEEP is implied.</p></footer></html>\n';
}
export function compileNestedSeven(sourceDir,priorReturnDir,{depth=2}={}){
  need(Number.isInteger(depth)&&depth>=1&&depth<=3,"DEPTH_1_TO_3");
  const prev=compileSevenReturn(sourceDir);
  verifyOriginalLedger(prev,priorReturnDir);
  need(prev.status==="HELD_EXPERIMENTAL_RETURN"&&prev.sourceReturnCount===7&&
    prev.angleCutCount===28&&prev.proposedDescendantCount===7&&
    prev.donorEnginesExecutedHere===false&&prev.originalPlanZRecordsModified===false,"PRIOR_SCOPE");
  need(prev.plans.length===7&&prev.cuts.length===28&&new Set(prev.plans.map(p=>p.evidenceOwner)).size===7,"NATIVE_OWNERS");
  const rootBody={schema:"static-collective/planz-nested-cycle/v1/root",
    kind:"ORIGINAL_PLAN_CYCLE",sourcePlanId:prev.sourcePlanId,
    inputOriginalPlanZManifest:prev.originalPlanZManifest,
    inputOriginalBookReceipt:prev.originalBookReceipt,
    inputCannonSoftwareReceipt:prev.inputCannonReceiptId,
    inputReturnPlanZManifest:prev.manifestSha256,rounds:depth,
    realNativeSoftwareExecutionsWereUpstream:true,nativeSoftwareRerunsHere:0,
    intendedChildCount:7,...held()};
  const rootId=id("cycle-root",rootBody);
  const plans=[...prev.plans],cuts=[...prev.cuts],cycles=[];
  function cycle(owner,priorPlan,priorCuts,parentCycleId,round,sourceDigest){
    need(priorCuts.length===4&&new Set(priorCuts.map(x=>x.lens||x.lensId)).size===4,"FOUR_LENSES");
    const nodeBody={schema:"static-collective/planz-nested-cycle/v1/turn",
      kind:"OWNER_EXPERIMENT_PLANNING_SUBCYCLE",generation:round,
      parentCycleId,rootCycleId:rootId,originalSourcePlanId:prev.sourcePlanId,
      owner,sourceNativeSoftwareOutputSha256:sourceDigest,
      currentHeldPlanId:priorPlan.id,currentLensIds:priorCuts.map(x=>x.id).sort(),
      evidenceMode:round===1?"VERIFIED_UPSTREAM_SOFTWARE_ARTIFACT":"INHERITED_UNRERUN_HISTORICAL_EVIDENCE",
      softwareEngineExecutedInThisCycle:false,
      humanActionRequiredBeforeWork:true,...held()};
    const cycleId=id("cycle",nodeBody);
    const question=priorPlan.nextQuestion||priorPlan.nextExperiment||
      (owner+" / what source-owned contract permits real work?");
    const lensTurn={stage:"FOUR_LENS_PLANNING",
      lenses:priorCuts.map(x=>({id:x.id,lens:x.lens||x.lensId})).sort((a,b)=>a.lens.localeCompare(b.lens))};
    const first={stage:"CREATIVE_SOFTWARE_EVIDENCE",owner,nativeOutputSha256:sourceDigest,
      historicalOnly:round>1,actualHumanKeep:false};
    const turns=[first,lensTurn,{stage:"HELD_DESCENDANT_PLAN",planId:priorPlan.id,status:"HELD_PROPOSAL_ONLY"}];
    const children=[];
    if(round<depth){
      const freshCuts=LENSES.map(lens=>{
        const body={schema:"static-collective/planz-nested-cycle/v1/cut",kind:"NESTED_PLANNING_ONLY_PRESSURE",
          generation:round+1,rootCycleId:rootId,parentCycleId:cycleId,
          sourceParentPlanId:priorPlan.id,sourceNativeSoftwareOutputSha256:sourceDigest,
          originalSourcePlanId:prev.sourcePlanId,sourceOwner:owner,
          lens:lens.id,originatingQuestion:question,pressureQuestion:lens.pressure,
          proposedExperiment:lens.protocol,stopCondition:lens.stop,
          realNativeSoftwareRerun:false,...held()};
        return {id:id("cut",body),...body};
      });
      cuts.push(...freshCuts);
      const planBody={schema:"static-collective/planz-nested-cycle/v1/plan",
        kind:"NESTED_REVIEW_GENERATED_HYPOTHESIS",generation:round+1,
        rootCycleId:rootId,parentCycleId:cycleId,parentPlanId:priorPlan.id,
        originalSourcePlanId:prev.sourcePlanId,
        sourceOwner:owner,sourceNativeSoftwareOutputSha256:sourceDigest,
        cutIds:freshCuts.map(x=>x.id).sort(),
        nextQuestion:"Given "+owner+"'s HELD software observation, "+question+
          " What would the four pressure tests require from a separately authorized source-owner experiment?",
        evidenceScope:"PLANNING_ONLY_INHERITED_NATIVE_SOFTWARE_NOT_NEW_NATIVE_TEST",
        realPortVerified:false,realNativeSoftwareRerun:false,...held()};
      const plan={id:id("plan",planBody),...planBody};
      plans.push(plan);
      children.push(cycle(owner,plan,freshCuts,cycleId,round+1,sourceDigest));
    }
    const saved={id:cycleId,...nodeBody,question,turns,childCycleIds:children.map(x=>x.id)};
    cycles.push(saved);
    return {...saved,children};
  }
  const firstChildren=sort(prev.plans).map(plan=>{
    const entryCuts=prev.cuts.filter(x=>x.evidenceOwner===plan.evidenceOwner&&plan.cutIds.includes(x.id));
    need(entryCuts.length===4,"ORIGINAL_CUTS");
    return cycle(plan.evidenceOwner,plan,entryCuts,rootId,1,plan.evidenceNativeOutputSha256);
  });
  const root={id:rootId,...rootBody,childCycleIds:firstChildren.map(x=>x.id)};
  const tree={schema:"static-collective/planz-nested-tree/v1",root:{...root,children:firstChildren},
    totalNativeCreatorOwners:7,totalCycles:cycles.length,totalAngleCuts:cuts.length,
    totalHeldPlans:plans.length,originalNativeSoftwareRunsReused:true,
    totalNewNativeSoftwareRuns:0,additionalPlansPlanningOnly:7*(depth-1),
    independentReceiverAdmission:false,...held()};
  const preliminary={schema:"static-collective/planz-nested-ledger/v1",
    sourceCannonReceipt:prev.inputCannonReceiptId,sourcePlanZReturnManifest:prev.manifestSha256,
    originalPlanId:prev.sourcePlanId,rootCycleId:rootId,depth,
    totalNativeCreatorOwners:7,cycleCount:cycles.length,cutCount:cuts.length,
    planCount:plans.length,newPlanningOnlyPlans:7*(depth-1),
    originalSourceMutated:false,newNativeOwnerRuns:0,
    rootNestedInsideOriginalPlanId:true,...held(),
    cycles:sort(cycles),cuts:sort(cuts),plans:sort(plans),tree};
  const manifest={...preliminary,manifestSha256:hash(bytes(preliminary))};
  return manifest;
}
export function saveNestedSeven(manifest,destination){
  const dir=resolve(destination);
  const output={
    "tree.json":Buffer.from(bytes(manifest.tree)),
    "manifest.json":Buffer.from(bytes(manifest)),
    "exhibit/index.html":Buffer.from(renderExhibit(manifest.tree))
  };
  for(const x of manifest.cycles)output["cycles/"+x.id+".json"]=Buffer.from(bytes(x));
  for(const x of manifest.cuts)output["cuts/"+x.id+".json"]=Buffer.from(bytes(x));
  for(const x of manifest.plans)output["plans/"+x.id+".json"]=Buffer.from(bytes(x));
  const wanted=Object.keys(output).sort();
  if(existsSync(dir)){
    const actual=filesIn(dir);
    need(JSON.stringify(Object.keys(actual).sort())===JSON.stringify(wanted),"OUTPUT_FILE_SET");
    for(const name of wanted)need(actual[name].equals(output[name]),"OUTPUT_TAMPER_"+name);
  }else{
    for(const name of wanted){
      const path=join(dir,name);
      mkdirSync(dirname(path),{recursive:true});
      writeFileSync(path,output[name],{flag:"wx"});
    }
  }
  return {fileCount:wanted.length,rootCycleId:manifest.rootCycleId};
}
function cli(args){
  const a={};
  for(let i=0;i<args.length;i+=2){
    need(["--source-dir","--return-dir","--out-dir","--depth"].includes(args[i])&&args[i+1]&&!Object.hasOwn(a,args[i]),"CLI");
    a[args[i]]=args[i+1];
  }
  need(args.length%2===0&&a["--source-dir"]&&a["--return-dir"]&&a["--out-dir"],"USAGE");
  const depth=a["--depth"]===undefined?2:Number(a["--depth"]);
  const result=compileNestedSeven(a["--source-dir"],a["--return-dir"],{depth});
  const saved=saveNestedSeven(result,a["--out-dir"]);
  process.stdout.write(bytes({status:"NESTED_SEVEN_PROPOSALS_HELD",sourcePlanId:result.originalPlanId,
    nestedRootCycleId:result.rootCycleId,nativeSoftwareOwners:7,planningDepth:depth,
    nestedCycleCount:result.cycleCount,planCount:result.planCount,cutCount:result.cutCount,
    nativeEnginesExecutedInThisCompiler:0,savedFiles:saved.fileCount}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{cli(process.argv.slice(2));}
  catch(e){process.stderr.write(String(e.message||e)+"\n");process.exitCode=2;}
}
