import {replayNotebook} from './ledger.mjs';
const ITERATIONS=210000;
const to64=bytes=>btoa(Array.from(bytes,c=>String.fromCharCode(c)).join(''));
const from64=s=>{if(typeof s!=='string'||s.length>4000000||! /^[A-Za-z0-9+/]*={0,2}$/.test(s))throw Error('Invalid backup encoding');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
async function key(passphrase,salt){if(typeof passphrase!=='string'||passphrase.length<12||passphrase.length>512)throw Error('Use a passphrase with at least 12 characters');
  const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function sealNotebook(notebook,passphrase){replayNotebook(notebook);const encoded=new TextEncoder().encode(JSON.stringify(notebook));if(encoded.length>2000000)throw Error('Notebook too large');
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('jubilee/encrypted-notebook/v1')},await key(passphrase,salt),encoded);
  return {schema:'jubilee/encrypted-notebook/v1',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:to64(salt),iv:to64(iv),ciphertext:to64(new Uint8Array(encrypted))};}
export async function openNotebook(envelope,passphrase){
  if(!envelope||Object.keys(envelope).sort().join(',')!=='ciphertext,iterations,iv,kdf,salt,schema'||envelope.schema!=='jubilee/encrypted-notebook/v1'||envelope.kdf!=='PBKDF2-SHA256'||envelope.iterations!==ITERATIONS)throw Error('Unsupported encrypted backup');
  const salt=from64(envelope.salt),iv=from64(envelope.iv),ciphertext=from64(envelope.ciphertext);if(salt.length!==16||iv.length!==12||ciphertext.length<16)throw Error('Malformed backup');
  const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('jubilee/encrypted-notebook/v1')},await key(passphrase,salt),ciphertext);
  const notebook=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decrypted));replayNotebook(notebook);return notebook;
}
