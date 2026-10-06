#!/usr/bin/env node
import fs from "node:fs";
import { buildHeart001 } from "../src/heart-001-chain.mjs";

const records=fs.readFileSync("registry/seed-plan-records.jsonl","utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(JSON.parse);

const fatherhandRecord=records.find((r)=>r.planId==="PLZ-TRANCH-FATHERHAND-001");
const heartLungRecord=records.find((r)=>r.planId==="PLZ-IRON-LUNG-COMBINATRIX-001");
if(!fatherhandRecord || !heartLungRecord) throw new Error("HEART-001 source records missing");

const witness=buildHeart001({fatherhandRecord,heartLungRecord});
process.stdout.write(JSON.stringify(witness,null,2)+"\n");
