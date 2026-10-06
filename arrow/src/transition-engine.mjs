import crypto from "node:crypto";

export const TRANSITION_SCHEMA = "static-collective/planz-transition-receipt/v0";
export const TRANSITION_KINDS = [
  "OBSERVE","DERIVE","PROPOSE","ADMIT","REFUSE","HOLD","PERFORM","RETURN"
];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc,key)=>{
      acc[key]=stableValue(value[key]);
      return acc;
    },{});
  }
  return value;
}

export function stableStringify(value) {
  return JSON.stringify(stableValue(value),null,2);
}

function hash(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

function strings(values=[]) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((v)=>String(v).trim()).filter(Boolean))].sort();
}

function endpoint(value) {
  if (!value || !String(value.role||"").trim() || !String(value.ref||"").trim()) {
    throw new Error("Transition endpoint requires role and ref");
  }
  const digest=value.digest == null ? null : {
    algorithm:String(value.digest.algorithm||"").trim(),
    value:String(value.digest.value||"").trim()
  };
  if (digest && (!digest.algorithm || !digest.value)) {
    throw new Error("Digest requires algorithm and value");
  }
  return {role:String(value.role).trim(),ref:String(value.ref).trim(),digest};
}

function compareStable(a,b) {
  const left=stableStringify(a);
  const right=stableStringify(b);
  return left < right ? -1 : left > right ? 1 : 0;
}

function endpoints(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Transition requires at least one endpoint");
  }
  return values.map(endpoint).sort(compareStable);
}

function normalizeAdmission(value={decision:"NONE",authorityRef:null}) {
  const decision=String(value.decision || "NONE").trim().toUpperCase();
  if (!["NONE","ACCEPT","REFUSE","HOLD"].includes(decision)) {
    throw new Error("Admission decision must be NONE, ACCEPT, REFUSE, or HOLD");
  }
  const authorityRef=value.authorityRef == null ? null : String(value.authorityRef).trim();
  if (decision === "NONE" && authorityRef) {
    throw new Error("NONE admission cannot carry authorityRef");
  }
  if (decision !== "NONE" && !authorityRef) {
    throw new Error(`${decision} admission requires external authorityRef`);
  }
  return {decision,authorityRef};
}

function validateKindAdmission(kind,admission) {
  const required={
    ADMIT:"ACCEPT",
    REFUSE:"REFUSE",
    HOLD:"HOLD"
  }[kind] || "NONE";

  if (admission.decision !== required) {
    throw new Error(`${kind} transition requires admission decision ${required}`);
  }
}

function receiptCore(spec) {
  const kind=String(spec.kind||"").trim().toUpperCase();
  const operation=String(spec.operation||"").trim();
  if (!TRANSITION_KINDS.includes(kind)) {
    throw new Error(`Transition kind must be one of: ${TRANSITION_KINDS.join(", ")}`);
  }
  if (!operation) throw new Error("Transition requires operation");

  const admission=normalizeAdmission(spec.admission);
  validateKindAdmission(kind,admission);

  return {
    kind,
    operation,
    inputs:endpoints(spec.inputs),
    outputs:endpoints(spec.outputs),
    predecessorReceiptIds:strings(spec.predecessorReceiptIds),
    admission,
    claims:strings(spec.claims),
    nonClaims:strings(spec.nonClaims),
    receiptAuthority:"none"
  };
}

export function createTransitionReceipt(spec) {
  const core=receiptCore(spec);
  return {
    schema:TRANSITION_SCHEMA,
    receiptId:`tr-${hash(core).slice(0,24)}`,
    ...core
  };
}

export function verifyTransitionReceipt(receipt) {
  if (!receipt || receipt.schema !== TRANSITION_SCHEMA || !receipt.receiptId) return false;
  try {
    const expected=createTransitionReceipt(receipt);
    return expected.receiptId === receipt.receiptId &&
      stableStringify(expected) === stableStringify(receipt);
  } catch {
    return false;
  }
}

export function verifyTransitionChain(receipts) {
  if (!Array.isArray(receipts) || receipts.length === 0) {
    return {valid:false,errors:["transition chain is empty"]};
  }

  const errors=[];
  const seen=new Map();

  for (let index=0; index<receipts.length; index+=1) {
    const receipt=receipts[index];

    if (!verifyTransitionReceipt(receipt)) {
      errors.push(`invalid receipt:${receipt?.receiptId || "missing-id"}`);
      continue;
    }

    if (seen.has(receipt.receiptId)) {
      errors.push(`duplicate receipt:${receipt.receiptId}`);
    }

    if (index === 0 && receipt.predecessorReceiptIds.length > 0) {
      errors.push(`first receipt cannot have predecessor:${receipt.receiptId}`);
    }
    if (index > 0 && receipt.predecessorReceiptIds.length === 0) {
      errors.push(`disconnected receipt:${receipt.receiptId}`);
    }

    const predecessorOutputs=new Set();
    let predecessorsResolved=true;

    for (const predecessor of receipt.predecessorReceiptIds) {
      const prior=seen.get(predecessor);
      if (!prior) {
        errors.push(`missing or forward predecessor:${predecessor}`);
        predecessorsResolved=false;
        continue;
      }
      for (const output of prior.outputs) predecessorOutputs.add(output.ref);
    }

    if (predecessorsResolved && receipt.predecessorReceiptIds.length > 0) {
      const consumesPredecessor=receipt.inputs.some((input)=>predecessorOutputs.has(input.ref));
      if (!consumesPredecessor) {
        errors.push(`predecessor output not consumed:${receipt.receiptId}`);
      }
    }

    seen.set(receipt.receiptId,receipt);
  }

  return {valid:errors.length===0,errors};
}

export function transitionChainId(receipts) {
  const check=verifyTransitionChain(receipts);
  if (!check.valid) throw new Error(check.errors.join("; "));
  return `chain-${hash(receipts.map((r)=>r.receiptId)).slice(0,24)}`;
}
