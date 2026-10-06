import crypto from "node:crypto";

export const TRANSITION_SCHEMA = "static-collective/planz-transition-receipt/v0";

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

function endpoints(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Transition requires at least one endpoint");
  }
  return values.map(endpoint).sort((a,b)=>
    stableStringify(a).localeCompare(stableStringify(b))
  );
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

function receiptCore(spec) {
  const kind=String(spec.kind||"").trim().toUpperCase();
  const operation=String(spec.operation||"").trim();
  if (!kind || !operation) throw new Error("Transition requires kind and operation");

  return {
    kind,
    operation,
    inputs:endpoints(spec.inputs),
    outputs:endpoints(spec.outputs),
    predecessorReceiptIds:strings(spec.predecessorReceiptIds),
    admission:normalizeAdmission(spec.admission),
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
  const seen=new Set();

  for (const receipt of receipts) {
    if (!verifyTransitionReceipt(receipt)) {
      errors.push(`invalid receipt:${receipt?.receiptId || "missing-id"}`);
      continue;
    }
    if (seen.has(receipt.receiptId)) {
      errors.push(`duplicate receipt:${receipt.receiptId}`);
    }
    for (const predecessor of receipt.predecessorReceiptIds) {
      if (!seen.has(predecessor)) {
        errors.push(`missing or forward predecessor:${predecessor}`);
      }
    }
    seen.add(receipt.receiptId);
  }

  return {valid:errors.length===0,errors};
}

export function transitionChainId(receipts) {
  const check=verifyTransitionChain(receipts);
  if (!check.valid) throw new Error(check.errors.join("; "));
  return `chain-${hash(receipts.map((r)=>r.receiptId)).slice(0,24)}`;
}
