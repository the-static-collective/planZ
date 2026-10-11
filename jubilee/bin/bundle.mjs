import {readFileSync} from 'node:fs';
import {verifySourceBundle} from '../source/verify.mjs';
export const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
export const inert=value=>JSON.stringify(value).replaceAll('<','\\u003c');
export function inlineModule(source,imports=''){
  const names=[...source.matchAll(/^export\s+(?:async\s+)?(?:function|const)\s+(\w+)/gm)].map(m=>m[1]);
  return '(()=>{'+imports+'\n'+source.replace(/^import .*;\n/gm,'').replace(/^export /gm,'')+'\nreturn {'+names.join(',')+'};})()';
}
export async function loadSource(){
  const bundle={manifest:JSON.parse(read('../source/manifest.json')),world:JSON.parse(read('../source/world.json')),html:read('../source/genesis-world.html')};
  const pin=JSON.parse(read('../source/pin.json'));await verifySourceBundle(bundle,pin);return {bundle,pin};
}
export function sourceRuntime(bundle,pin){
  return 'const SOURCE_BUNDLE='+inert(bundle)+';\nconst SOURCE_PIN='+inert(pin)+';\n'+
    'const SourceVerifier='+inlineModule(read('../source/verify.mjs'),'const {canonical}=Engine;')+';\n'+
    'const SourceViewer='+inlineModule(read('../source/viewer.mjs'),'const {verifySourceBundle}=SourceVerifier;')+';\n';
}
