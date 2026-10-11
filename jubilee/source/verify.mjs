import {canonical} from '../src/engine.mjs';
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('');
export async function verifySourceBundle(bundle,pin) {
  const {manifest:m,world,html}=bundle;
  if(!m || m.schema!=='revival.jubilee-source-door/0.1' || m.status!=='SOURCE_BOUND_READ_ONLY' || m.authority!=='NONE' || m.effect!=='NONE')throw Error('Unsupported source artifact');
  const {artifactSha256,...core}=m;
  if(artifactSha256!==pin.artifactSha256 || m.producer.repository!=='https://github.com/the-static-collective/revival' || m.producer.sourceCommit!==pin.sourceCommit || m.producer.exporterSha256!==pin.exporterSha256)throw Error('Source artifact is outside the selected owner pin');
  if(await hash(canonical(core))!==artifactSha256 || await hash(canonical(world))!==m.worldSha256 || await hash(html)!==m.htmlSha256)throw Error('Source artifact byte mismatch');
  if(await hash(canonical(world.world))!==world.receipt.projection_sha256 || canonical(world.receipt)!==canonical(m.worldReceipt))throw Error('World receipt mismatch');
  const embedded=html.match(/<script id="revival-data" type="application\/json">([\s\S]*?)<\/script>/);
  if(!embedded || canonical(JSON.parse(embedded[1]))!==canonical(world))throw Error('HTML does not carry the verified world');
  const place=world.world.places.find(p=>p.kind==='passage' && p.label===m.locator);
  if(!place || place.address!==m.revivalAddress || place.witness_sha256!==m.witnessSha256 || m.fragment!=='#'+encodeURIComponent(place.address))throw Error('Address is absent from the owner world');
  if(!Array.isArray(m.licenses) || m.licenses.length!==2 || !canonical(m.licenses).includes('CC BY 4.0'))throw Error('Source attribution required');
  return {status:'VERIFIED_LOCAL_ARTIFACT',locator:m.locator,revivalAddress:m.revivalAddress,
    artifactSha256,sourceCommit:m.producer.sourceCommit,witnessSha256:m.witnessSha256,
    receipt:structuredClone(m.worldReceipt),licenses:structuredClone(m.licenses),effect:'NONE',authority:'NONE'};
}
