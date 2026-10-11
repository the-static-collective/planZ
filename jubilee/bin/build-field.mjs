import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {read,inlineModule,loadSource,sourceRuntime} from './bundle.mjs';
const {bundle,pin}=await loadSource();
const engine=inlineModule(read('../src/engine.mjs'));
const app='const Engine='+engine+';\n'+sourceRuntime(bundle,pin)+'\n'+
  'const FieldLedger='+inlineModule(read('../field/ledger.mjs'))+';\n'+
  'const FieldBackup='+inlineModule(read('../field/backup.mjs'),'const {replayNotebook}=FieldLedger;')+';\n'+
  'const HOST_PACK='+JSON.stringify(read('../field/host-pack.html')).replaceAll('<','\\u003c')+';\n'+read('../field/app.mjs');
const html=read('../field/shell.html').replace('/*__STYLE__*/',()=>read('../web/style.css')+read('../source/style.css')+read('../field/style.css')).replace('/*__APP__*/',()=>'{\n'+app+'\n}');
const path=new URL('../dist/field-kit.html',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==html)throw Error('Field kit build is stale');console.log('Field kit matches verified sources');}
else {mkdirSync(new URL('../dist/',import.meta.url),{recursive:true});writeFileSync(path,html);console.log('Built jubilee/dist/field-kit.html');}
const hostPack=new URL('../dist/host-pack.html',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(hostPack,'utf8')!==read('../field/host-pack.html'))throw Error('Host pack is stale');}
else writeFileSync(hostPack,read('../field/host-pack.html'));
