#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import { senseCensus, stableStringify } from "../src/senses-engine.mjs";

function readJsonl(path) {
  return fs.readFileSync(path,"utf8")
    .split(/\r?\n/)
    .filter((line)=>line.trim())
    .map((line,index)=>{
      try { return JSON.parse(line); }
      catch (error) { throw new Error(`${path} line ${index + 1}: ${error.message}`); }
    });
}

const [seedPath, provisionalPath] = process.argv.slice(2);
if (!seedPath || !provisionalPath) {
  console.error("usage: node 002/bin/sense-global.mjs <seed.jsonl> <provisional.jsonl>");
  process.exit(2);
}

const seed=readJsonl(seedPath);
const provisional=readJsonl(provisionalPath);

const sourceSeen=new Set();
const combined=[];

for (const record of [...seed,...provisional]) {
  const refs=(record.source||[]).map((source)=>source.ref).filter(Boolean);
  if (refs.length && refs.some((ref)=>sourceSeen.has(ref))) continue;
  combined.push(record);
  for (const ref of refs) sourceSeen.add(ref);
}

const sensed=senseCensus(combined);
const signalCounts={gap:0,stranding:0,lineage:0,ambiguity:0,recoverability:0,compositionPressure:0};
const chamberCounts={};
const repoCounts={};

for (const row of sensed) {
  for (const key of Object.keys(signalCounts)) {
    if (row.sense.signals[key].present) signalCounts[key]+=1;
  }
  if (row.mutation) chamberCounts[row.mutation.chamber]=(chamberCounts[row.mutation.chamber]||0)+1;
  const repo=row.plan.ownerRepo||"unknown";
  repoCounts[repo]=(repoCounts[repo]||0)+1;
}

const run={
  schema:"static-collective/planz-global-sense-run/v0",
  inputs:{seedPath,provisionalPath,seedRecords:seed.length,provisionalRecords:provisional.length},
  dedupedRecordCount:combined.length,
  signalCounts,
  chamberCounts,
  repositoryCounts:repoCounts,
  frames:sensed.map((row)=>row.sense),
  unaryCandidates:sensed.map((row)=>row.mutation).filter(Boolean),
  authority:"none",
  selection:"NONE"
};

const semantic=stableStringify(run);
run.semanticSha256=crypto.createHash("sha256").update(semantic).digest("hex");
process.stdout.write(stableStringify(run)+"\n");
