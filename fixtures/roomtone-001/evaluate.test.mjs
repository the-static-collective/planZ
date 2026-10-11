// ROOMTONE-001: synthetic, no-network, no-device deterministic tests.
// Run from planZ repository root: node --test fixtures/roomtone-001/evaluate.test.mjs
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import {evaluateFixture} from "./evaluate.mjs";

const original = JSON.parse(readFileSync(new URL("./three-rooms.json",import.meta.url),"utf8"));
const copy = () => structuredClone(original);
const get = (f,id) => f.offers.find(o=>o.id===id);

test("baseline candidate identities, disposition, and no effects",()=>{
  const got=evaluateFixture(copy());
  assert.deepEqual(got.candidates.map(c=>c.id),original.expected.candidates);
  assert.deepEqual(Object.fromEntries(got.candidates.map(c=>[c.id,c.status])),original.expected.dispositions);
  assert.deepEqual(got.excludedOffers,["D"]);
  assert.deepEqual(got.createdConnections,[]);
  assert.deepEqual(got.appliedEffects,[]);
});

test("same recording yields candidate but B's decline blocks meeting",()=>{
  const got=evaluateFixture(copy());
  assert.equal(got.candidates.find(c=>c.mode==="SONG-SEAT").status,"REFUSED");
  assert.equal(got.candidates.find(c=>c.mode==="SONG-SEAT").matchedOn[0],"song_ref");
});

test("unpublished room D cannot be discovered by equal song",()=>{
  const got=evaluateFixture(copy());
  assert.ok(got.candidates.every(c=>!c.participants.includes("D")));
});

test("revoke B before discovery: no A-B candidate",()=>{
  const f=copy(); get(f,"B").revoked=true;
  const got=evaluateFixture(f);
  assert.ok(!got.candidates.some(c=>c.participants.includes("B")));
  assert.ok(got.excludedOffers.includes("B"));
});

test("expired offer is excluded even with unchanged song",()=>{
  const f=copy(); get(f,"B").expiresAt=f.now;
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.participants.includes("B")));
});

test("two-sided acceptance creates readiness but never connection effect",()=>{
  const f=copy(); f.decisions.C="ACCEPT";
  const got=evaluateFixture(f);
  const c=got.candidates.find(c=>c.mode==="ROOM-RHYME");
  assert.equal(c.status,"MUTUAL_APPROVAL_PENDING_EFFECT");
  assert.deepEqual(got.createdConnections,[]);
});

test("same visible title but different recording IDs is not SONG-SEAT",()=>{
  const f=copy(); get(f,"B").song.ref="recording:rosemary-roses-another-take";
  assert.equal(get(f,"B").song.title,get(f,"A").song.title);
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.mode==="SONG-SEAT"));
});

test("A declines ROOM-RHYME scope: ambient resemblance cannot override consent",()=>{
  const f=copy();get(f,"A").modes=["SONG-SEAT"];
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.mode==="ROOM-RHYME"));
});

test("withheld shared attribute cannot be silently inferred",()=>{
  const f=copy();get(f,"C").share=["texture"];
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.mode==="ROOM-RHYME"));
});

test("unknown rain is not equivalent to rain or to dry",()=>{
  const f=copy();get(f,"C").features.weather=null;
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.mode==="ROOM-RHYME"));
});

test("weather sensor basis is typed: unverified similarity is not match",()=>{
  const f=copy();get(f,"C").features.weatherBasis="UNVERIFIED_SENSOR";
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.mode==="ROOM-RHYME"));
});

test("only exact permissioned attributes influence matching",()=>{
  const f=copy();get(f,"A").share=["song_ref","weather"];
  assert.ok(!evaluateFixture(f).candidates.some(c=>c.mode==="ROOM-RHYME"));
  assert.ok(evaluateFixture(f).candidates.some(c=>c.mode==="SONG-SEAT"));
});

test("replay is deterministic for unchanged synthetic fixture",()=>{
  assert.deepEqual(evaluateFixture(copy()),evaluateFixture(copy()));
});

test("duplicate IDs refuse rather than ambiguously join",()=>{
  const f=copy();get(f,"C").id="A";
  assert.throws(()=>evaluateFixture(f),/duplicate/);
});

test("no live data may enter this synthetic-only evaluator",()=>{
  const f=copy();f.status="PHYSICAL_CAPTURE";
  assert.throws(()=>evaluateFixture(f),/synthetic/);
});

test("no GROUND-ECHO claim is made from uninstrumented fixture",()=>{
  const got=evaluateFixture(copy());
  assert.ok(got.candidates.every(c=>c.mode!=="GROUND-ECHO"));
});
