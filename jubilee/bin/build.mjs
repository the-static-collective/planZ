// Deterministic, dependency-free standalone build; no HTTP, CDN or remote fonts.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {loadSource,sourceRuntime} from './bundle.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const json=path=>JSON.stringify(JSON.parse(read(path))).replaceAll('<','\\u003c');
const engine=read('../src/engine.mjs').replaceAll('export function ','function ');
const {bundle,pin}=await loadSource();
const app=engine+'\nconst Engine={canonical};\n'+sourceRuntime(bundle,pin)+'\nconst SEED='+json('../fixtures/three-towns.json')+';\nconst JOURNEY='+json('../fixtures/journey.json')+';\n'+read('../web/app.mjs');
const html=read('../web/shell.html').replace('/*__STYLE__*/',()=>read('../web/style.css')+read('../source/style.css')).replace('/*__APP__*/',()=>'{\n'+app+'\n}');
const output=new URL('../dist/index.html',import.meta.url);
if(process.argv.includes('--check')) { if(readFileSync(output,'utf8')!==html)throw Error('Standalone build is stale'); console.log('Standalone build matches sources'); }
else { mkdirSync(new URL('../dist/',import.meta.url),{recursive:true});writeFileSync(output,html);console.log('Built jubilee/dist/index.html'); }
