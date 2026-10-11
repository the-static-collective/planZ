import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {census,verify} from '../bin/branch-census.mjs';
const seed=()=>JSON.parse(readFileSync(new URL('../capabilities.json',import.meta.url),'utf8'));
test('real pinned branch census is replayable and non-authoritative',()=>{
  const report=census(seed());
  assert.equal(report.records.length,4);
  assert.equal(report.effects,0);
  assert(report.records.every(r=>r.execution_authorized===false&&r.branch_is_not_backlog));
  assert.equal(verify(seed(),report).status,'COLD_REPLAY_VERIFIED');
});
test('tamper, duplicate, path traversal, invented authority, missing gates HOLD',()=>{
  const mutate=fn=>{const s=seed();fn(s);assert.throws(()=>census(s));};
  mutate(s=>s.records.push(s.records[0]));
  mutate(s=>s.records[0].entrypoint='../secret');
  mutate(s=>s.records[0].commit='main');
  mutate(s=>s.records[0].branchHint='main');
  mutate(s=>s.records[0].executionAuthorized=true);
  mutate(s=>s.records[0].evidence.url='https://example.org/fake');
  mutate(s=>s.records[0].gates=['']);
  const s=seed(),r=census(s);r.records[0].execution_authorized=true;
  assert.throws(()=>verify(s,r),/SNAPSHOT_REPLAY_MISMATCH/);
});
