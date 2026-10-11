import {verifySourceBundle} from './verify.mjs';
export async function openSourceWorld(bundle,pin,guard=()=>true){
  if(!guard())throw Error('This invitation is no longer available');
  const verified=await verifySourceBundle(bundle,pin);
  if(!guard())throw Error('This invitation is no longer available');
  let dialog=document.querySelector('#source-dialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='source-dialog';dialog.className='source-dialog';dialog.setAttribute('aria-label','Verified Genesis source world');
    dialog.innerHTML='<button class="close" aria-label="Close Genesis world">×</button><span class="eyebrow">Owner-generated · byte-verified · read only</span><h2>Genesis, with its source trail.</h2><p class="source-note"></p><details><summary>Source receipt and attribution</summary><pre class="source-receipt"></pre></details><iframe title="Revival source-backed Genesis world" sandbox="allow-scripts"></iframe>';
    document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();}
  dialog.querySelector('.source-note').textContent='Gen.1.1 · Source bytes are bound to pinned Revival output. Interpretation, event participation and theological authority remain separate.';
  dialog.querySelector('.source-receipt').textContent=JSON.stringify(verified,null,2);
  const url=URL.createObjectURL(new Blob([bundle.html],{type:'text/html'}));
  dialog.querySelector('iframe').src=url+bundle.manifest.fragment;
  dialog.addEventListener('close',()=>{dialog.querySelector('iframe').src='about:blank';URL.revokeObjectURL(url);},{once:true});
  dialog.showModal();return verified;
}
