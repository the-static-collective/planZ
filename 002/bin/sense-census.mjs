#!/usr/bin/env node
import fs from "node:fs";
import { senseCensus, stableStringify } from "../src/senses-engine.mjs";

const path=process.argv[2];
if (!path) {
  console.error("usage: node 002/bin/sense-census.mjs <plan-records.jsonl>");
  process.exit(2);
}

let text;
try {
  text=fs.readFileSync(path,"utf8");
} catch (error) {
  console.error(`cannot read census: ${error.message}`);
  process.exit(3);
}

const records=[];
for (const [index,line] of text.split(/\r?\n/).entries()) {
  if (!line.trim()) continue;
  try {
    records.push(JSON.parse(line));
  } catch (error) {
    console.error(`invalid JSONL at line ${index + 1}: ${error.message}`);
    process.exit(4);
  }
}

const sensed=senseCensus(records);
const output={
  schema:"static-collective/planz-sense-run/v0",
  input:path,
  recordCount:records.length,
  frames:sensed.map(({sense}) => sense),
  unaryCandidates:sensed.map(({mutation}) => mutation).filter(Boolean),
  authority:"none",
  selection:"NONE"
};

process.stdout.write(stableStringify(output) + "\n");
