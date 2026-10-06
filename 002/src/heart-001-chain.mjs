import {
  buildSenseMutationArrowChain
} from "./sense-arrow-chain.mjs";
import {
  createTransitionReceipt,
  transitionChainId,
  verifyTransitionChain
} from "../../arrow/src/transition-engine.mjs";

export const HEART001_AUTHORITY_REF =
  "human:current-conversation:2026-10-06:heart-001-approved";

function append(prefix, receipt) {
  const receipts=[...prefix,receipt];
  const check=verifyTransitionChain(receipts);
  if(!check.valid) throw new Error(check.errors.join("; "));
  return receipts;
}

export function buildHeart001({fatherhandRecord,heartLungRecord}) {
  const fatherBase=buildSenseMutationArrowChain(fatherhandRecord);
  if(!fatherBase.mutation) throw new Error("Fatherhand mutation missing");

  const fatherRefuse=createTransitionReceipt({
    kind:"REFUSE",
    operation:"Human review refuses a Fatherhand project consequence after current TranchNode pressure/reincarnation comparison.",
    inputs:[{
      role:"mutation-candidate",
      ref:`candidate:${fatherBase.mutation.candidateId}`
    }],
    outputs:[{
      role:"human-decision",
      ref:"decision:heart-001:fatherhand:refuse"
    }],
    predecessorReceiptIds:[fatherBase.receipts.at(-1).receiptId],
    admission:{decision:"REFUSE",authorityRef:HEART001_AUTHORITY_REF},
    claims:[
      "The generated Fatherhand candidate was deliberately reviewed and not admitted for project consequence.",
      "Current TranchNode material already carries purpose-before-activation, heterogeneous witness, stewardship, consequence-return, and independent reckoning organs."
    ],
    nonClaims:[
      "Refusal does not prove every Fatherhand organ already exists.",
      "A deterministic grant-chain validator remains preserved as unresolved residue rather than silently promoted to work."
    ]
  });
  const fatherReceipts=append(fatherBase.receipts,fatherRefuse);

  const heartBase=buildSenseMutationArrowChain(heartLungRecord);
  if(!heartBase.mutation) throw new Error("Heart-Lung mutation missing");

  const admit=createTransitionReceipt({
    kind:"ADMIT",
    operation:"Human review admits only the bounded deterministic Iron Lung combinatrix specimen.",
    inputs:[{
      role:"mutation-candidate",
      ref:`candidate:${heartBase.mutation.candidateId}`
    }],
    outputs:[{
      role:"admission",
      ref:"admission:heart-001:iron-lung-combinatrix"
    }],
    predecessorReceiptIds:[heartBase.receipts.at(-1).receiptId],
    admission:{decision:"ACCEPT",authorityRef:HEART001_AUTHORITY_REF},
    claims:[
      "Admission is limited to the deterministic model-free specimen requested by the Iron Lung design."
    ],
    nonClaims:[
      "Admission does not authorize a T5 dependency, autonomous model loop, or universal Heart primitive.",
      "Admission does not authorize merge of the owning-project pull request."
    ]
  });

  const perform=createTransitionReceipt({
    kind:"PERFORM",
    operation:"Record the owning-project consequence implemented in Iron Lung and verified by its repository CI.",
    inputs:[{
      role:"admission",
      ref:"admission:heart-001:iron-lung-combinatrix"
    }],
    outputs:[{
      role:"project-consequence",
      ref:"https://github.com/the-static-collective/iron-lung/pull/7",
      digest:{
        algorithm:"git-commit-sha1",
        value:"8e0c7a3f6f94a2a40562d59522ee1390d3b0dfb1"
      }
    }],
    predecessorReceiptIds:[admit.receiptId],
    claims:[
      "Iron Lung PR #7 contains the deterministic bounded combinatrix consequence.",
      "Iron Lung check run 37475903996 passed 39/39 tests and deterministic first-breath and HEART-001 replay checks."
    ],
    nonClaims:[
      "The pull request is a project consequence but is not claimed merged into Iron Lung main.",
      "Green CI does not convert proposal ancestry into authority."
    ]
  });

  const returned=createTransitionReceipt({
    kind:"RETURN",
    operation:"Return the owning-project consequence to planZ as the first PLANZ-002 Heart witness.",
    inputs:[{
      role:"project-consequence",
      ref:"https://github.com/the-static-collective/iron-lung/pull/7",
      digest:{
        algorithm:"git-commit-sha1",
        value:"8e0c7a3f6f94a2a40562d59522ee1390d3b0dfb1"
      }
    }],
    outputs:[{
      role:"heart-witness",
      ref:"002/witnesses/HEART-001.json"
    }],
    predecessorReceiptIds:[perform.receiptId],
    claims:[
      "One PLANZ-002 MutationCandidate crossed a separately authorized consequence edge into its owning repository and returned as attributable project history."
    ],
    nonClaims:[
      "Return does not imply the owning-project PR is merged.",
      "One successful Heart witness does not select any other PLANZ candidate."
    ]
  });

  const heartReceipts=[...heartBase.receipts,admit,perform,returned];
  const heartCheck=verifyTransitionChain(heartReceipts);
  if(!heartCheck.valid) throw new Error(heartCheck.errors.join("; "));

  return {
    schema:"static-collective/planz-heart-001/v0",
    authorityRef:HEART001_AUTHORITY_REF,
    fatherhand:{
      planId:fatherhandRecord.planId,
      candidateId:fatherBase.mutation.candidateId,
      decision:"REFUSE",
      residue:[
        "possible missing organ: deterministic Fatherhand grant-chain validator",
        "do not restore the old Fatherhand body wholesale"
      ],
      chainId:transitionChainId(fatherReceipts),
      receipts:fatherReceipts
    },
    heartLung:{
      planId:heartLungRecord.planId,
      candidateId:heartBase.mutation.candidateId,
      decision:"ACCEPT",
      ownerConsequence:"https://github.com/the-static-collective/iron-lung/pull/7",
      ownerHead:"8e0c7a3f6f94a2a40562d59522ee1390d3b0dfb1",
      ownerCiRun:"https://github.com/the-static-collective/iron-lung/actions/runs/37475903996",
      chainId:transitionChainId(heartReceipts),
      receipts:heartReceipts
    },
    result:{
      humanReviewedRide:true,
      deliberateGeneratedCandidateRefusal:true,
      separatelyAdmittedCandidate:true,
      owningProjectConsequenceReturned:true,
      planZ002CompletionLawSatisfied:true
    },
    receiptAuthority:"none"
  };
}
