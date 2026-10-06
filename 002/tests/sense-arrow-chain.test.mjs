import test from "node:test";
import assert from "node:assert/strict";
import { buildSenseMutationArrowChain } from "../src/sense-arrow-chain.mjs";
import { verifyTransitionChain } from "../../arrow/src/transition-engine.mjs";

const recoverable={
  schema:"static-collective/planz-plan-record/v0",
  planId:"P-ARROW",
  title:"Arrow specimen",
  source:[{kind:"pr",ref:"pr:arrow",sha:null,note:null}],
  stage:"IMPLEMENTING",
  disposition:"STRANDED",
  evidence:{implementationRefs:["branch:old"],descendantRefs:[],negativeSearches:[],notes:[]},
  remaining:{summary:"Run the final gate.",tasks:["gate"],nextGate:"human witness",recoveryMode:"RESURRECT"},
  relations:[],
  confidence:"HIGH"
};

const terminal={
  ...recoverable,
  planId:"P-DONE",
  title:"Done specimen",
  disposition:"LANDED",
  evidence:{implementationRefs:["main:landed"],descendantRefs:[],negativeSearches:[],notes:[]},
  remaining:{summary:"Nothing remains.",tasks:[],nextGate:null,recoveryMode:"NONE"}
};

test("recoverable record forms PlanRecord → SenseFrame → MutationCandidate",()=>{
  const chain=buildSenseMutationArrowChain(recoverable);
  assert.deepEqual(chain.receipts.map((r)=>r.kind),["DERIVE","PROPOSE"]);
  assert.equal(chain.receipts[1].inputs.some((x)=>
    x.ref === chain.receipts[0].outputs[0].ref
  ),true);
  assert.equal(chain.mutation.sourcePlanIds[0],"P-ARROW");
  assert.ok(verifyTransitionChain(chain.receipts).valid);
});

test("terminal record stops after the SenseFrame without inventing a candidate",()=>{
  const chain=buildSenseMutationArrowChain(terminal);
  assert.equal(chain.mutation,null);
  assert.deepEqual(chain.receipts.map((r)=>r.kind),["DERIVE"]);
  assert.ok(verifyTransitionChain(chain.receipts).valid);
});

test("exact same record yields exact same arrow chain",()=>{
  const a=buildSenseMutationArrowChain(recoverable);
  const b=buildSenseMutationArrowChain(structuredClone(recoverable));
  assert.equal(a.chainId,b.chainId);
  assert.deepEqual(a.receipts,b.receipts);
});
