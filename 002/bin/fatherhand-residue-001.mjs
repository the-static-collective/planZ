#!/usr/bin/env node
import { buildFatherhandResidue001 } from "../src/fatherhand-residue-001.mjs";
process.stdout.write(JSON.stringify(buildFatherhandResidue001(),null,2)+"\n");
