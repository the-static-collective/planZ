#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import { buildSenseMutationArrowChain } from "../src/sense-arrow-chain.mjs";
import { stableStringify } from "../../arrow/src/transition-engine.mjs";

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
  console.error("usage: node 002/bin/sense-arrow-global.mjs <seed.jsonl> <provisional.jsonl>");
  process.exit(2);
}

const seed=readJsonl(seedPath);
const provisional=readJsonl(provisionalPath);

// Preserve GLOBAL-SENSE-001's exact-source field cut for this witness.
// This is not a general identity law; PLANZ-001's source-dedupe limitation remains open.
const sourceSeen=new Set();
const combined=[];

for (const record of [...seed,...provisional]) {
  const refs=(record.source||[]).map((source)=>source.ref).filter(Boolean);
  if (refs.length && refs.some((ref)=>sourceSeen.has(ref))) continue;
  combined.push(record);
  for (const ref of refs) sourceSeen.add(ref);
}

const chains=combined.map(buildSenseMutationArrowChain);
const receiptCount=chains.reduce((sum,chain)=>sum+chain.receipts.length,0);
const mutationCount=chains.filter((chain)=>chain.mutation).length;

const run={
  schema:"static-collective/planz-global-sense-arrow-run/v0",
  inputs:{
    seedPath,
    provisionalPath,
    seedRecords:seed.length,
    provisionalRecords:provisional.length
  },
  dedupedRecordCount:combined.length,
  planToSenseTransitions:chains.length,
  senseToMutationTransitions:mutationCount,
  transitionReceiptCount:receiptCount,
  chainCount:chains.length,
  chainIds:chains.map((chain)=>chain.chainId),
  chains,
  receiptAuthority:"none",
  selection:"NONE"
};

run.semanticSha256=crypto.createHash("sha256")
  .update(stableStringify(run))
  .digest("hex");

process.stdout.write(stableStringify(run)+"\n");
