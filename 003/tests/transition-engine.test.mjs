import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import {
  createTransitionReceipt,
  verifyTransitionReceipt,
  verifyTransitionChain,
  transitionChainId
} from "../src/transition-engine.mjs";
import { buildLulArrowChain } from "../src/lul-arrow-chain.mjs";

test("receipt identity is deterministic and endpoint-order independent",()=>{
  const spec={
    kind:"derive",
    operation:"bounded transform",
    inputs:[{role:"b",ref:"2"},{role:"a",ref:"1"}],
    outputs:[{role:"out",ref:"3"}],
    claims:["z","a"],
    nonClaims:["n"]
  };
  const a=createTransitionReceipt(spec);
  const b=createTransitionReceipt({...spec,inputs:[...spec.inputs].reverse(),claims:["a","z"]});
  assert.equal(a.receiptId,b.receiptId);
  assert.ok(verifyTransitionReceipt(a));
});

test("receipt never manufactures external authority",()=>{
  assert.throws(()=>createTransitionReceipt({
    kind:"ADMIT",
    operation:"bad admission",
    inputs:[{role:"proposal",ref:"p"}],
    outputs:[{role:"admission",ref:"a"}],
    admission:{decision:"ACCEPT",authorityRef:null}
  }),/requires external authorityRef/);

  assert.throws(()=>createTransitionReceipt({
    kind:"OBSERVE",
    operation:"bad none",
    inputs:[{role:"x",ref:"x"}],
    outputs:[{role:"y",ref:"y"}],
    admission:{decision:"NONE",authorityRef:"invented"}
  }),/NONE admission cannot carry authorityRef/);
});

test("tampering invalidates a receipt",()=>{
  const receipt=createTransitionReceipt({
    kind:"OBSERVE",
    operation:"see",
    inputs:[{role:"x",ref:"x"}],
    outputs:[{role:"y",ref:"y"}]
  });
  const tampered=structuredClone(receipt);
  tampered.outputs[0].ref="changed";
  assert.equal(verifyTransitionReceipt(tampered),false);
});

test("chain rejects missing or forward predecessors",()=>{
  const one=createTransitionReceipt({
    kind:"OBSERVE",operation:"one",
    inputs:[{role:"x",ref:"x"}],outputs:[{role:"y",ref:"y"}]
  });
  const two=createTransitionReceipt({
    kind:"DERIVE",operation:"two",
    inputs:[{role:"y",ref:"y"}],outputs:[{role:"z",ref:"z"}],
    predecessorReceiptIds:["tr-000000000000000000000000"]
  });
  const check=verifyTransitionChain([one,two]);
  assert.equal(check.valid,false);
  assert.match(check.errors.join(" "),/missing or forward predecessor/);
});

test("L-to-U-to-L real witness traverses five explicit arrows",()=>{
  const realText=fs.readFileSync("003/witnesses/l-to-u-to-l-real-001.json","utf8");
  const humanText=fs.readFileSync("003/witnesses/l-to-u-to-l-human-play-001.json","utf8");
  const completionText=fs.readFileSync("003/witnesses/l-to-u-to-l-completion-001.json","utf8");
  const chain=buildLulArrowChain(
    JSON.parse(realText),
    JSON.parse(humanText),
    JSON.parse(completionText),
    {humanText,completionText}
  );

  assert.deepEqual(chain.receipts.map((r)=>r.kind),[
    "OBSERVE","PROPOSE","ADMIT","PERFORM","RETURN"
  ]);
  assert.match(chain.proposal.proposalId,/^inst-/);
  assert.equal(chain.receipts[2].admission.decision,"ACCEPT");
  assert.equal(chain.receipts[2].receiptAuthority,"none");
  assert.equal(chain.receipts[3].inputs.find((x)=>x.role==="human-play-receipt").digest.value,
    "01f1080529929cad287d6517050776b4dc56641587720fcf4ed9f0cbf361601e");
  assert.equal(chain.receipts[3].outputs[0].digest.value,
    "aa037c362789c27fbab13adc94baa464d7d7509aa6c4c536b41a584d42cafac3");
  assert.ok(verifyTransitionChain(chain.receipts).valid);
  assert.equal(chain.chainId,transitionChainId(chain.receipts));
});
