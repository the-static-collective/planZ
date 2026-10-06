import {
  createTransitionReceipt,
  transitionChainId,
  verifyTransitionChain
} from "../../arrow/src/transition-engine.mjs";

export const FATHERHAND_RESIDUE_AUTHORITY_REF =
  "human:current-conversation:2026-10-06:fatherhand-grant-chain-approved";

export function buildFatherhandResidue001() {
  const observe=createTransitionReceipt({
    kind:"OBSERVE",
    operation:"Observe the unresolved Fatherhand grant-chain-validator residue preserved by HEART-001 without reversing the prior Fatherhand restoration refusal.",
    inputs:[{
      role:"heart-witness",
      ref:"002/witnesses/HEART-001.json"
    }],
    outputs:[{
      role:"residue",
      ref:"residue:heart-001:fatherhand:deterministic-grant-chain-validator"
    }],
    claims:[
      "HEART-001 refused restoration of the historical Fatherhand body while preserving a possible missing deterministic grant-chain validator as residue."
    ],
    nonClaims:[
      "Observing residue does not reopen or reverse the prior REFUSE decision.",
      "Residue is not itself a plan or authorization."
    ]
  });

  const propose=createTransitionReceipt({
    kind:"PROPOSE",
    operation:"Propose only the bounded deterministic Fatherhand grant-chain validator as a new residue-derived organ.",
    inputs:[{
      role:"residue",
      ref:"residue:heart-001:fatherhand:deterministic-grant-chain-validator"
    }],
    outputs:[{
      role:"residue-proposal",
      ref:"proposal:fatherhand-grant-chain-001"
    }],
    predecessorReceiptIds:[observe.receiptId],
    claims:[
      "The proposal is narrower than the refused historical Fatherhand restoration candidate."
    ],
    nonClaims:[
      "The proposal does not authorize Fatherhand restoration.",
      "The proposal does not authorize ontology expansion, signature infrastructure, or canonical hash changes."
    ]
  });

  const admit=createTransitionReceipt({
    kind:"ADMIT",
    operation:"Record the external human decision to implement the deterministic grant-chain validator now.",
    inputs:[{
      role:"residue-proposal",
      ref:"proposal:fatherhand-grant-chain-001"
    }],
    outputs:[{
      role:"admission",
      ref:"admission:fatherhand-grant-chain-001"
    }],
    predecessorReceiptIds:[propose.receiptId],
    admission:{
      decision:"ACCEPT",
      authorityRef:FATHERHAND_RESIDUE_AUTHORITY_REF
    },
    claims:[
      "Human approval admits only the deterministic grant-chain-validator organ."
    ],
    nonClaims:[
      "Admission does not reverse HEART-001's Fatherhand REFUSE.",
      "Admission does not authorize merge of the owning-project pull request."
    ]
  });

  const perform=createTransitionReceipt({
    kind:"PERFORM",
    operation:"Record the TranchNode owning-project consequence implementing the bounded Fatherhand grant-chain validator.",
    inputs:[{
      role:"admission",
      ref:"admission:fatherhand-grant-chain-001"
    }],
    outputs:[{
      role:"project-consequence",
      ref:"https://github.com/the-static-collective/tranchnode/pull/79",
      digest:{
        algorithm:"git-commit-sha1",
        value:"cfb7b5009deb16d318c08885ced5a7f4ba2c846b"
      }
    }],
    predecessorReceiptIds:[admit.receiptId],
    claims:[
      "TranchNode PR #79 implements the deterministic Fatherhand grant-chain validator.",
      "TranchNode CI run 37478576902 passed 130/130 tests and byte-identical deterministic Fatherhand replay."
    ],
    nonClaims:[
      "The pull request is not claimed merged into TranchNode main.",
      "Green CI does not prove rightful root jurisdiction or cryptographic signature validity."
    ]
  });

  const returned=createTransitionReceipt({
    kind:"RETURN",
    operation:"Return the implemented Fatherhand residue organ to planZ without rewriting the earlier refusal history.",
    inputs:[{
      role:"project-consequence",
      ref:"https://github.com/the-static-collective/tranchnode/pull/79",
      digest:{
        algorithm:"git-commit-sha1",
        value:"cfb7b5009deb16d318c08885ced5a7f4ba2c846b"
      }
    }],
    outputs:[{
      role:"residue-consequence-witness",
      ref:"002/witnesses/FATHERHAND-RESIDUE-001.json"
    }],
    predecessorReceiptIds:[perform.receiptId],
    claims:[
      "The previously preserved grant-chain-validator residue produced a separately admitted owning-project consequence."
    ],
    nonClaims:[
      "The prior Fatherhand restoration candidate remains refused.",
      "Implemented residue does not imply the historical Fatherhand body should be restored."
    ]
  });

  const receipts=[observe,propose,admit,perform,returned];
  const check=verifyTransitionChain(receipts);
  if(!check.valid) throw new Error(check.errors.join("; "));

  return {
    schema:"static-collective/planz-fatherhand-residue-001/v0",
    sourceHeartWitness:"002/witnesses/HEART-001.json",
    priorFatherhandDecision:"REFUSE",
    priorCandidateId:"mut-ba2399e2f3d57d8e",
    residue:"deterministic Fatherhand grant-chain validator",
    newDecision:"ACCEPT",
    ownerConsequence:"https://github.com/the-static-collective/tranchnode/pull/79",
    ownerHead:"cfb7b5009deb16d318c08885ced5a7f4ba2c846b",
    ownerCiRun:"https://github.com/the-static-collective/tranchnode/actions/runs/37478576902",
    chainId:transitionChainId(receipts),
    receipts,
    receiptAuthority:"none",
    laws:[
      "REFUSAL != ERASURE",
      "RESIDUE != PLAN",
      "NEW ADMISSION != REVERSAL OF PRIOR REFUSAL"
    ]
  };
}
