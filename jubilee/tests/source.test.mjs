import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifySourceBundle} from '../source/verify.mjs';
const json=n=>JSON.parse(readFileSync(new URL('../source/'+n,import.meta.url),'utf8'));
const bundle=()=>({manifest:json('manifest.json'),world:json('world.json'),html:readFileSync(new URL('../source/genesis-world.html',import.meta.url),'utf8')});
test('pinned owner bytes yield an actual Genesis address, receipt and license boundary',async()=>{
  const got=await verifySourceBundle(bundle(),json('pin.json'));
  assert.equal(got.locator,'Gen.1.1');assert.match(got.revivalAddress,/\/passage\/Gen.1.1$/);
  assert.equal(got.licenses.length,2);assert.equal(got.authority,'NONE');assert.equal(got.effect,'NONE');
});
test('changed HTML, world or manifest cannot pass source verification',async()=>{
  for(const kind of ['html','world','manifest']){
    const b=bundle();if(kind==='html')b.html+='changed';else if(kind==='world')b.world.receipt.projection_sha256='0'.repeat(64);else b.manifest.locator='Luke.4';
    await assert.rejects(verifySourceBundle(b,json('pin.json')),/mismatch/);
  }
});
test('an unreviewed rehashed export is outside the selected source pin',async()=>{
  const b=bundle();b.manifest.artifactSha256='0'.repeat(64);
  await assert.rejects(verifySourceBundle(b,json('pin.json')),/owner pin/);
});
test('manifest source and exporter pins cannot be silently advanced',async()=>{
  const b=bundle();b.manifest.producer.sourceCommit='1'.repeat(40);
  await assert.rejects(verifySourceBundle(b,json('pin.json')),/owner pin/);
});
