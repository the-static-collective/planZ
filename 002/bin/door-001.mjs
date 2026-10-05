#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import { crossMutation, pressureMutation, stableStringify } from "../src/senses-engine.mjs";

const records=fs.readFileSync("registry/seed-plan-records.jsonl","utf8")
  .split(/\r?\n/)
  .filter((line)=>line.trim())
  .map(JSON.parse);

const left=records.find((record)=>record.planId==="PLZ-IRON-LUNG-COMBINATRIX-001");
const right=records.find((record)=>record.planId==="PLZ-WORKBENCH-MADDLIB-MAXHINE-001");

if (!left || !right) {
  console.error("DOOR-001 source PlanRecords missing");
  process.exit(2);
}

const hinge=[
  "CENSUS→SENSES mutation boundary:",
  "Iron Lung supplies bounded possibility-space, addressable absence, residue, and the Lung/Heart separation;",
  "the Maxhinal/MADDlib lineage supplies deterministic selected-fuel chambers and append-only mutation rides;",
  "census history remains immutable and Heart/admission remains external."
].join(" ");

const candidate=crossMutation(left,right,hinge);
const pressure=pressureMutation(candidate);

const ride={
  schema:"static-collective/planz-door-witness/v0",
  doorId:"DOOR-001-IRON-LUNG-X-MAXHINAL",
  humanHinge:"user explicitly proposed CENSUS→SENSES with Iron Lung and the Maxhinals, then approved DOOR execution",
  sourcePlanIds:[left.planId,right.planId],
  hinge,
  candidate,
  pressure,
  authority:"none",
  selection:"NONE",
  heart:"NOT_BEATEN"
};

const semantic=stableStringify(ride);
ride.semanticSha256=crypto.createHash("sha256").update(semantic).digest("hex");
process.stdout.write(stableStringify(ride)+"\n");
