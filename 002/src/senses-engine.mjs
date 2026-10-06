import crypto from "node:crypto";

export const SENSE_SCHEMA = "static-collective/planz-sense-frame/v0";
export const MUTATION_SCHEMA = "static-collective/planz-mutation-candidate/v0";

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = stableValue(value[key]);
      return acc;
    }, {});
  }
  return value;
}

export function stableStringify(value) {
  return JSON.stringify(stableValue(value), null, 2);
}

function signal(present, reasons = []) {
  return { present: Boolean(present), reasons: reasons.filter(Boolean) };
}

function sourceRefs(record) {
  return (record.source || []).map((source) => source.ref);
}

export function deriveSenseFrame(record) {
  if (!record || !record.planId) throw new Error("PlanRecord with planId required");

  const remaining = record.remaining || {};
  const evidence = record.evidence || {};
  const relations = record.relations || [];
  const tasks = Array.isArray(remaining.tasks) ? remaining.tasks : [];
  const implementationRefs = Array.isArray(evidence.implementationRefs) ? evidence.implementationRefs : [];
  const descendantRefs = Array.isArray(evidence.descendantRefs) ? evidence.descendantRefs : [];

  const hasGap = remaining.recoveryMode !== "NONE" &&
    (tasks.length > 0 || Boolean(remaining.nextGate) || Boolean(remaining.summary));

  const stranded = ["STRANDED","PARTIAL"].includes(record.disposition) && implementationRefs.length > 0;

  const lineage = record.disposition === "REINCARNATED" ||
    descendantRefs.length > 0 ||
    relations.some((relation) => [
      "parent","child","supersedes","superseded-by","reincarnated-as","implements","implemented-by"
    ].includes(relation.type));

  const ambiguity = record.disposition === "UNKNOWN" ||
    record.confidence === "LOW" ||
    record.confidence === "MEDIUM";

  const recoveryMode = remaining.recoveryMode || "NONE";
  const recoverable = recoveryMode !== "NONE";

  const explicitComposition = relations.some((relation) =>
    ["related","reincarnated-as","implemented-by","implements"].includes(relation.type)
  );

  return {
    schema:SENSE_SCHEMA,
    planId:record.planId,
    signals:{
      gap:signal(hasGap, hasGap ? [remaining.summary || "explicit remaining edge"] : []),
      stranding:signal(stranded, stranded ? [
        record.disposition,
        ...implementationRefs.map((ref) => `implementation:${ref}`)
      ] : []),
      lineage:signal(lineage, lineage ? [
        ...descendantRefs.map((ref) => `descendant:${ref}`),
        ...relations.map((relation) => `${relation.type}:${relation.target}`)
      ] : []),
      ambiguity:signal(ambiguity, ambiguity ? [
        `disposition:${record.disposition}`,
        `confidence:${record.confidence}`
      ] : []),
      recoverability:signal(recoverable, recoverable ? [`recoveryMode:${recoveryMode}`] : []),
      compositionPressure:signal(explicitComposition, explicitComposition ? ["explicit relation present"] : [])
    },
    basisRefs:sourceRefs(record),
    authority:"none",
    selection:"NONE"
  };
}

function hashId(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex").slice(0, 16);
}

function chamberFor(record) {
  const mode = record.remaining && record.remaining.recoveryMode || "NONE";
  if (mode === "RESURRECT") return "REANIMATE";
  if (mode === "REPORT") return "RECONSTITUTE";
  if (mode === "RECOMPOSE") return "GRAFT";
  if (mode === "INVESTIGATE") return "PROBE";
  if (mode === "HOLD") return "HOLD";
  return null;
}

function proposalFor(chamber, record) {
  const edge = record.remaining && record.remaining.summary || "No remaining edge declared.";
  const title = record.title || record.planId;
  if (chamber === "REANIMATE") return `Re-check present authority, then continue the smallest still-valid edge of ${title}: ${edge}`;
  if (chamber === "RECONSTITUTE") return `Re-port only proven behavior from ${title} onto current authority before continuing: ${edge}`;
  if (chamber === "GRAFT") return `Extract only the surviving law or organ from ${title}; do not restore obsolete ancestry wholesale: ${edge}`;
  if (chamber === "PROBE") return `Resolve one discriminating unknown before deciding whether ${title} should continue: ${edge}`;
  if (chamber === "HOLD") return `Preserve ${title} without execution until its declared hold condition changes: ${edge}`;
  return edge;
}

export function unaryMutation(record, senseFrame = deriveSenseFrame(record)) {
  if (!senseFrame || senseFrame.planId !== record.planId) {
    throw new Error("SenseFrame must belong to the same PlanRecord");
  }

  const chamber = chamberFor(record);
  if (!chamber) return null;

  if (!senseFrame.signals?.recoverability?.present) {
    throw new Error("SenseFrame does not support the PlanRecord's declared recovery posture");
  }
  if (chamber === "PROBE" && !senseFrame.signals?.ambiguity?.present) {
    throw new Error("PROBE requires an ambiguous SenseFrame");
  }

  const core = {
    chamber,
    sourcePlanIds:[record.planId],
    hinge:null,
    proposal:proposalFor(chamber, record),
    residuals:[
      "candidate-not-selected",
      "present authority must be re-checked before consequence"
    ],
    authority:"none",
    selection:"NONE"
  };

  return {
    schema:MUTATION_SCHEMA,
    candidateId:`mut-${hashId(core)}`,
    ...core
  };
}

export function crossMutation(left, right, hinge) {
  if (!left || !right || !left.planId || !right.planId) {
    throw new Error("Two PlanRecords are required");
  }
  if (!hinge || !String(hinge).trim()) {
    return {
      schema:MUTATION_SCHEMA,
      candidateId:`mut-${hashId({left:left.planId,right:right.planId,refusal:"missing-hinge"})}`,
      chamber:"CROSS",
      sourcePlanIds:[left.planId,right.planId],
      hinge:null,
      proposal:"REFUSED: CROSS requires an explicit hinge; similarity or co-occurrence is insufficient.",
      residuals:["MISSING_EXPLICIT_HINGE","no relation inferred"],
      authority:"none",
      selection:"NONE"
    };
  }

  const normalizedHinge=String(hinge).trim();
  const core={
    chamber:"CROSS",
    sourcePlanIds:[left.planId,right.planId],
    hinge:normalizedHinge,
    proposal:`Explore one bounded composition between ${left.title || left.planId} and ${right.title || right.planId} only at the declared hinge: ${normalizedHinge}`,
    residuals:["candidate-not-selected","both source ancestries remain independently authoritative for their own history"],
    authority:"none",
    selection:"NONE"
  };

  return {
    schema:MUTATION_SCHEMA,
    candidateId:`mut-${hashId(core)}`,
    ...core
  };
}

export function pressureMutation(candidate) {
  if (!candidate || !candidate.candidateId) throw new Error("MutationCandidate required");
  const core={
    chamber:"PRESSURE",
    sourcePlanIds:[...(candidate.sourcePlanIds || [])],
    hinge:candidate.candidateId,
    proposal:`What evidence would make ${candidate.candidateId} wrong, redundant, already satisfied, or unnecessary?`,
    residuals:["pressure-survival-does-not-promote"],
    authority:"none",
    selection:"NONE"
  };
  return {
    schema:MUTATION_SCHEMA,
    candidateId:`mut-${hashId(core)}`,
    ...core
  };
}

export function senseCensus(records) {
  return records.map((record) => {
    const sense=deriveSenseFrame(record);
    return {
      plan:record,
      sense,
      mutation:unaryMutation(record,sense)
    };
  });
}
