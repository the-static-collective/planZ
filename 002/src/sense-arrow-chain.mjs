import crypto from "node:crypto";
import {
  deriveSenseFrame,
  unaryMutation,
  stableStringify as senseStableStringify
} from "./senses-engine.mjs";
import {
  createTransitionReceipt,
  transitionChainId,
  verifyTransitionChain
} from "../../arrow/src/transition-engine.mjs";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function digestObject(value) {
  return {algorithm:"sha256",value:sha256(senseStableStringify(value))};
}

export function buildSenseMutationArrowChain(record) {
  if (!record?.planId) throw new Error("PlanRecord required");

  const sense=deriveSenseFrame(record);
  const mutation=unaryMutation(record,sense);
  const recordDigest=digestObject(record);
  const senseDigest=digestObject(sense);
  const senseRef=`sense:sha256:${senseDigest.value}`;

  const derive=createTransitionReceipt({
    kind:"DERIVE",
    operation:"Derive the exact SenseFrame from the exact PlanRecord without changing source history.",
    inputs:[{
      role:"plan-record",
      ref:`plan:${record.planId}`,
      digest:recordDigest
    }],
    outputs:[{
      role:"sense-frame",
      ref:senseRef,
      digest:senseDigest
    }],
    claims:["SenseFrame is deterministically derived from the supplied PlanRecord."],
    nonClaims:[
      "Sense does not alter the PlanRecord.",
      "Sense does not select a future."
    ]
  });

  const receipts=[derive];

  if (mutation) {
    const mutationDigest=digestObject(mutation);
    const propose=createTransitionReceipt({
      kind:"PROPOSE",
      operation:"Generate the bounded unary MutationCandidate using the PlanRecord under the validated exact SenseFrame.",
      inputs:[
        {role:"plan-record",ref:`plan:${record.planId}`,digest:recordDigest},
        {role:"sense-frame",ref:senseRef,digest:senseDigest}
      ],
      outputs:[{
        role:"mutation-candidate",
        ref:`candidate:${mutation.candidateId}`,
        digest:mutationDigest
      }],
      predecessorReceiptIds:[derive.receiptId],
      claims:[
        "The MutationCandidate was emitted only after validating that the SenseFrame belongs to the PlanRecord.",
        "The exact SenseFrame identity is bound into this transition receipt."
      ],
      nonClaims:[
        "The candidate does not become a plan.",
        "The candidate does not become selected or admitted."
      ]
    });
    receipts.push(propose);
  }

  const check=verifyTransitionChain(receipts);
  if (!check.valid) throw new Error(check.errors.join("; "));

  return {
    schema:"static-collective/planz-sense-mutation-transition-chain/v0",
    planId:record.planId,
    sense,
    mutation,
    receipts,
    chainId:transitionChainId(receipts),
    receiptAuthority:"none"
  };
}
