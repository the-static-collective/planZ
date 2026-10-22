/**
 * HEAP-CUT-001: structural validation only. A passing result proves a legible
 * proposal fixture, never a food network, participation, authorization or delivery.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const CORE = Object.freeze([
  "GOVERNANCE", "SUPPLY", "CUSTODY", "PLACE",
  "COMMERCE", "ACCESS", "RETURN"
]);
const REQUIRED = Object.freeze([
  ["GOVERNANCE", "SUPPLY"], ["SUPPLY", "CUSTODY"],
  ["PLACE", "CUSTODY"], ["CUSTODY", "COMMERCE"],
  ["COMMERCE", "ACCESS"], ["ACCESS", "RETURN"],
  ["RETURN", "COMMERCE"], ["RETURN", "GOVERNANCE"],
  ["GOVERNANCE", "PLACE"], ["GOVERNANCE", "COMMERCE"]
]);

export function inspectPassport(passport) {
  const errors = [];
  const push = (ok, why) => { if (!ok) errors.push(why); };
  const object = passport && typeof passport === "object" && !Array.isArray(passport);
  if (!object) return { structuralValidity: "FAIL", errors: ["Expected passport object."] };
  push(passport.schema === "static-collective/planz-network-passport/v0", "Wrong schema.");
  push(passport.authority === "NONE", "Fixture must not claim authority.");
  push(passport.claim === "WHOLE_NETWORK_PROPOSAL_ONLY", "Fixture cannot claim operational status.");
  push(passport.classification === "N0_CONCEIVED_N1_CANDIDATE", "Fixture cannot promote itself past N0/N1.");
  const organs = Array.isArray(passport.coreOrgans) ? passport.coreOrgans : [];
  const names = organs.map(x => x?.id);
  push(names.length === CORE.length && new Set(names).size === CORE.length &&
    CORE.every(id => names.includes(id)), "Seven unique essential organs are required.");
  for (const organ of organs) {
    push(organ?.critical === true, `Organ ${organ?.id} must be critical.`);
    push(!!organ?.question && !!organ?.authorityNeeded, `Organ ${organ?.id} lacks question/authority.`);
    push(organ?.ownerAssigned === null && organ?.ownerConsent === "NOT_ESTABLISHED" &&
      organ?.capabilityStatus === "UNKNOWN" && Array.isArray(organ?.evidence) && organ.evidence.length === 0,
      `Organ ${organ?.id} has an unwarranted owner/capability assertion.`);
  }
  const links = Array.isArray(passport.criticalLinks) ? passport.criticalLinks : [];
  const keys = links.map(x => x?.id);
  push(new Set(keys).size === keys.length, "Duplicate edge IDs.");
  for (const link of links) {
    push(names.includes(link?.from) && names.includes(link?.to), `Edge ${link?.id} lacks a valid endpoint.`);
    push(link?.refusalSupported === true, `Edge ${link?.id} needs a refusal path.`);
    push(link?.status === "PROPOSED" && link?.operatorConsent === "NOT_ESTABLISHED" &&
      link?.receipt === null, `Edge ${link?.id} falsely claims agreement/performance.`);
  }
  const pairs = new Set(links.map(link => `${link?.from}->${link?.to}`));
  for (const [from,to] of REQUIRED) {
    push(pairs.has(`${from}->${to}`), `Missing critical network relation ${from}->${to}.`);
  }
  const lanes = Array.isArray(passport.separateLedgerLanes) ? passport.separateLedgerLanes : [];
  push(lanes.length === 3 && new Set(lanes.map(x => x?.id)).size === 3 &&
    ["COMMERCIAL","AID","NONMONETARY"].every(id => lanes.some(x => x?.id === id)),
    "Commercial, aid and nonmonetary lanes must remain separate.");
  for (const lane of lanes) push(!!lane?.custodian && Array.isArray(lane?.mayConvertTo) &&
    lane.mayConvertTo.length === 0, `Lane ${lane?.id} must have distinct custody/no conversion.`);
  const orbits = Array.isArray(passport.optionalOrbits) ? passport.optionalOrbits : [];
  for (const orbit of orbits) push(orbit?.requiredForCore === false, `Optional orbit ${orbit?.id} became compulsory.`);
  const gates = Array.isArray(passport.crossingGates) ? passport.crossingGates : [];
  push(gates.length === 6 && gates.every((x,i) => x?.id === `N${i}`),
    "Missing N0-N5 independent crossing stages.");
  for (const [i,gate] of gates.entries()) push(gate?.passed === (i===0),
    `Stage ${gate?.id} claims an unearned transition.`);
  push(passport.privateDataPolicy &&
    Object.values(passport.privateDataPolicy).every(value=> value===false) &&
    Object.keys(passport.privateDataPolicy).length >= 5, "Public default-privacy requirements missing.");
  const ok = errors.length === 0;
  return {
    structuralValidity: ok ? "PASS" : "FAIL",
    stage: "N0_CONCEIVED",
    n1: ok ? "STRUCTURALLY_LEGIBLE_FIXTURE_NOT_OWNER_REVIEWED" : "FAILED",
    operationalEvidence: "NONE",
    assignedEssentialOwners: 0,
    criticalOrgans: organs.length,
    criticalLinks: links.length,
    outstandingIndependentApprovals: "UNRESOLVED",
    errors
  };
}

function main() {
  const target = process.argv[2] || fileURLToPath(new URL("./network-passport-v0.json", import.meta.url));
  const pass = JSON.parse(readFileSync(target, "utf8"));
  const report = inspectPassport(pass);
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  if (report.structuralValidity !== "PASS") process.exitCode = 1;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) main();
