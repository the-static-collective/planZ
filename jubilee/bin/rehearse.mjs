import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {canonical,replay,projectSession} from '../src/engine.mjs';
const read = path => JSON.parse(readFileSync(path,'utf8'));
const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
export function buildWitness(fixture,events) {
  const body={schema:'jubilee/replay-witness/v1',status:'SYNTHETIC_ONLY',
    fixtureSha256:hash(fixture),eventsSha256:hash(events),projection:projectSession(replay(fixture,events)),
    nonclaims:['LIVE_EVENT','SOURCE_VERIFICATION','AUTHENTICATED_CONSENT','DELIVERY','OWNER_ADMISSION','SIGNATURE']};
  return {...body,semanticSha256:hash(body)};
}
if(process.argv[1] && import.meta.url===new URL(process.argv[1],'file:').href) {
  try {
    const [mode,fixturePath,eventPath,witnessPath]=process.argv.slice(2);
    if(!['build','verify'].includes(mode) || !fixturePath || !eventPath || (mode==='verify' && !witnessPath)) throw Error('Usage: node jubilee/bin/rehearse.mjs build|verify FIXTURE EVENTS [WITNESS]');
    const expected=buildWitness(read(fixturePath),read(eventPath));
    if(mode==='verify') {
      if(canonical(read(witnessPath))!==canonical(expected)) throw Error('Witness mismatch: cold replay refused');
      console.log(JSON.stringify({status:'COLD_REPLAY_VERIFIED',semanticSha256:expected.semanticSha256,events:expected.projection.eventCount,effects:0}));
    } else if(witnessPath) writeFileSync(witnessPath,JSON.stringify(expected,null,2)+'\n',{flag:'wx'});
    else console.log(JSON.stringify(expected,null,2));
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
