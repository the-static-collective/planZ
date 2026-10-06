import test from "node:test";
import assert from "node:assert/strict";
import {
  proposeDeclaredOrgans,
  proposeInstrument,
  consequenceStub,
  stableStringify
} from "../src/instrument-engine.mjs";

const finishedArtifact={
  artifactId:"artifact:finished-demo-001",
  title:"Finished lyric-video pass",
  posture:"FINISHED",
  sourceRefs:[
    "git:example/repo@deadbeef",
    "receipt:render-001"
  ],
  organs:[
    {
      organId:"organ:lyric-geometry-001",
      kind:"lyric-geometry",
      description:"Words form traversable scene geometry.",
      behavior:"Expose text shapes as spatial collision / placement surfaces.",
      basisRefs:["receipt:timing-map-001"],
      candidateDestinations:["Haunted Toaster","PlayDeck"]
    }
  ]
};

test("explicit organ becomes a non-authoritative instrument proposal", () => {
  const [proposal]=proposeDeclaredOrgans(finishedArtifact);
  assert.equal(proposal.organ.organId,"organ:lyric-geometry-001");
  assert.equal(proposal.authority,"none");
  assert.equal(proposal.selection,"NONE");
  assert.deepEqual(proposal.sourceArtifactIds,["artifact:finished-demo-001"]);
});

test("source and organ basis references survive composition", () => {
  const [proposal]=proposeDeclaredOrgans(finishedArtifact);
  assert.deepEqual(proposal.basisRefs,[
    "git:example/repo@deadbeef",
    "receipt:render-001",
    "receipt:timing-map-001"
  ]);
});

test("no explicit organs means no invented instruments", () => {
  const proposals=proposeDeclaredOrgans({
    artifactId:"artifact:opaque-001",
    sourceRefs:["receipt:opaque-001"]
  });
  assert.deepEqual(proposals,[]);
});

test("an organ must be explicitly addressable", () => {
  assert.throws(
    () => proposeInstrument(finishedArtifact,{kind:"motion",description:"something reusable"}),
    /organId/
  );
});

test("candidate destinations remain suggestions, not proof", () => {
  const [proposal]=proposeDeclaredOrgans(finishedArtifact);
  assert.deepEqual(proposal.candidateDestinations,["Haunted Toaster","PlayDeck"]);
  assert.ok(proposal.residuals.includes("destination capability not proven by proposal"));
});

test("no consequence occurs without explicit admission", () => {
  const [proposal]=proposeDeclaredOrgans(finishedArtifact);
  const receipt=consequenceStub(proposal,{decision:"HOLD"});
  assert.equal(receipt.consequence,"NONE");
});

test("explicit admission crosses only to external play, not to claimed performance", () => {
  const [proposal]=proposeDeclaredOrgans(finishedArtifact);
  const receipt=consequenceStub(proposal,{
    decision:"ACCEPT",
    destination:"PlayDeck",
    authorityRef:"human:admission-001"
  });
  assert.equal(receipt.consequence,"ADMITTED_FOR_EXTERNAL_PLAY");
  assert.match(receipt.note,/not proof of performance/);
});

test("semantic proposal output is deterministic", () => {
  const a=stableStringify(proposeDeclaredOrgans(finishedArtifact));
  const b=stableStringify(proposeDeclaredOrgans(structuredClone(finishedArtifact)));
  assert.equal(a,b);
});
