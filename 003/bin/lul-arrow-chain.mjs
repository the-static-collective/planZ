#!/usr/bin/env node
import fs from "node:fs";
import { buildLulArrowChain } from "../src/lul-arrow-chain.mjs";

const realPath="003/witnesses/l-to-u-to-l-real-001.json";
const humanPath="003/witnesses/l-to-u-to-l-human-play-001.json";
const completionPath="003/witnesses/l-to-u-to-l-completion-001.json";

const realText=fs.readFileSync(realPath,"utf8");
const humanText=fs.readFileSync(humanPath,"utf8");
const completionText=fs.readFileSync(completionPath,"utf8");

const chain=buildLulArrowChain(
  JSON.parse(realText),
  JSON.parse(humanText),
  JSON.parse(completionText),
  {humanText,completionText}
);

process.stdout.write(JSON.stringify(chain,null,2)+"\n");
