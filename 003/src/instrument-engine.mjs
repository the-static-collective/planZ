import crypto from "node:crypto";

export const INSTRUMENT_SCHEMA = "static-collective/planz-instrument-proposal/v0";

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

function hashId(value) {
  return crypto
    .createHash("sha256")
    .update(stableStringify(value))
    .digest("hex")
    .slice(0, 16);
}

function normalizeStrings(values = []) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value).trim())
      .filter(Boolean)
  )].sort();
}

function normalizeOrgan(organ) {
  if (!organ || !organ.organId || !organ.kind || !organ.description) {
    throw new Error("Explicit organ requires organId, kind, and description");
  }

  return {
    organId:String(organ.organId),
    kind:String(organ.kind),
    description:String(organ.description),
    behavior:organ.behavior == null ? null : String(organ.behavior)
  };
}

export function proposeInstrument(artifact, organ) {
  if (!artifact || !artifact.artifactId) {
    throw new Error("Artifact witness with artifactId required");
  }

  const explicit=normalizeOrgan(organ);
  const artifactRefs=normalizeStrings(artifact.sourceRefs);
  const organRefs=normalizeStrings(organ.basisRefs);
  const candidateDestinations=normalizeStrings(organ.candidateDestinations);

  const core={
    sourceArtifactIds:[String(artifact.artifactId)],
    organ:explicit,
    candidateDestinations,
    basisRefs:normalizeStrings([...artifactRefs,...organRefs]),
    residuals:[
      "instrument-not-selected",
      "destination capability not proven by proposal",
      "present authority and rights must be checked before consequence",
      "source ancestry does not authorize derivative use"
    ],
    authority:"none",
    selection:"NONE"
  };

  return {
    schema:INSTRUMENT_SCHEMA,
    proposalId:`inst-${hashId(core)}`,
    ...core
  };
}

export function proposeDeclaredOrgans(artifact) {
  if (!artifact || !artifact.artifactId) {
    throw new Error("Artifact witness with artifactId required");
  }

  const organs=Array.isArray(artifact.organs) ? artifact.organs : [];

  // Critical refusal: PLANZ-003 does not mine or hallucinate organs.
  // It only transforms organs explicitly named by a source witness.
  return organs.map((organ) => proposeInstrument(artifact, organ));
}

export function consequenceStub(proposal, admission) {
  if (!proposal || !proposal.proposalId) {
    throw new Error("InstrumentProposal required");
  }

  if (!admission || admission.decision !== "ACCEPT") {
    return {
      proposalId:proposal.proposalId,
      consequence:"NONE",
      reason:"No explicit ACCEPT admission supplied."
    };
  }

  if (!admission.authorityRef || !admission.destination) {
    throw new Error("ACCEPT requires authorityRef and destination");
  }

  return {
    proposalId:proposal.proposalId,
    consequence:"ADMITTED_FOR_EXTERNAL_PLAY",
    destination:String(admission.destination),
    authorityRef:String(admission.authorityRef),
    note:"Admission is a boundary crossing, not proof of performance or a new artifact."
  };
}
