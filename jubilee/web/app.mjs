// Bundled by build.mjs with the engine and synthetic data, without external requests.
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=createRehearsal(SEED), view='tree', selectedTown='orchard', counter=0;
const STEP_COPY=[
  ['A welcome begins locally','Orchard’s imagined host chooses to welcome the caravan. A proposal never lists a host as participating on its own.','Host Orchard accepts'],
  ['Ask the next town','River has its own host and its own choices. Their acceptance belongs to them.','Host River accepts'],
  ['One song. One permission.','The musician allows a physical handoff to River. This permission covers that journey; it does not allow a public broadcast.','Carry the song to River'],
  ['An introduction, offered','Orchard’s public table invitation can be proposed to River’s kitchen. A proposal creates no connection.','Propose a table introduction'],
  ['The neighbor chooses','Let the recipient decide first. Saying no ends this introduction; help never depends on prayer or belief.','The neighbor accepts'],
  ['The helper chooses, too','River’s helper must separately accept. Two choices make an approved rehearsal introduction.','The helper accepts'],
  ['Take the road to River','Both towns have welcomed the caravan. Traveling does not prove a song was received or a meal delivered.','Travel to River'],
  ['A song reaches its receiver','River’s host records their own acceptance of the permitted song. Its original source remains Orchard.','River receives the song'],
  ['A helper reports','A helper can report the shared table. The ledger keeps this as REPORTED until the recipient speaks.','The helper reports a meal'],
  ['The recipient confirms','Only the imagined recipient confirms their own help. The helper cannot supply this confirmation.','The neighbor confirms the meal'],
  ['One more local welcome','Harbor has not joined by proximity. Its host decides separately before the third stop.','Host Harbor accepts'],
  ['Arrive with your histories','The song’s receipt and the table’s confirmation remain distinct as the caravan reaches Harbor.','Travel to Harbor'],
  ['Ask what came home','Record a synthetic return: three visits, one permitted artifact received, one recipient-confirmed act of help.','Record the return']
];
const kindNames={SCRIPTURE:'A DOOR INTO SCRIPTURE',NEED:'I NEED',OFFER:'I HAVE / I CAN MAKE',MUSIC:'A SONG TO CARRY'};
const treeArt='<svg class="tree-art" viewBox="0 0 700 550" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="M350 550Q365 365 340 215M353 451Q238 360 130 295M347 385Q430 309 569 267M347 324Q286 198 221 161M342 262Q419 155 473 127" stroke="#729170" stroke-width="15" fill="none" stroke-linecap="round"/><g fill="#aabf8f"><ellipse cx="137" cy="228" rx="105" ry="65" transform="rotate(-28 137 228)"/><ellipse cx="550" cy="200" rx="99" ry="63" transform="rotate(24 550 200)"/><ellipse cx="269" cy="124" rx="110" ry="63" transform="rotate(19 269 124)"/><ellipse cx="444" cy="106" rx="85" ry="56" transform="rotate(-30 444 106)"/></g></svg>';
function cardHTML(c,print=false){return `<${print?'article':'button'} class="door-card" data-kind="${c.kind}" ${print?'':`data-card="${esc(c.id)}"`}><span class="dot"></span><span class="kind">${kindNames[c.kind]}</span><h3>${esc(c.label)}</h3><span class="open">${print?esc(c.citation||'An invitation to inspect or decline'):'Open this paper door ↗'}</span>${print?`<p style="font-size:10px;margin-top:10px">${esc(SEED.towns.find(t=>t.id===c.town).label)} · Synthetic rehearsal card${c.kind==='SCRIPTURE'?' · Source lookup unresolved':''}</p>`:''}</${print?'article':'button'}>`;}
function act(e){try{state=applyEvent(state,e);selectedTown=state.currentTown;$('#notice').textContent='Choice recorded in this rehearsal.';render();return true;}catch(error){$('#notice').textContent=error.message;return false;}}
function extra(type,data){return {id:'choice-'+(++counter),type,...data};}
function render(){
  const p=projectSession(state), count=JOURNEY.filter(e=>state.events.some(x=>x.id===e.id)).length;
  $('#route').innerHTML=SEED.towns.map((t,i)=>`<button class="town" data-town="${t.id}" aria-pressed="${selectedTown===t.id}"><span>0${i+1} / ${p.visitedTowns.includes(t.id)?'Visited in rehearsal':'On the horizon'}</span><strong>${t.label} ${t.id===state.currentTown?'·':''}</strong><span>${p.acceptedHosts.includes(t.id)?'Host accepted':'Host invitation held'}</span></button>`).join('');
  for(const button of document.querySelectorAll('[data-town]'))button.onclick=()=>{selectedTown=button.dataset.town;render();};
  for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===view));
  const visible=p.cards.filter(c=>c.town===selectedTown), label=SEED.towns.find(t=>t.id===selectedTown).label;
  if(view==='tree') $('#main-view').innerHTML=`<div class="tree-room">${treeArt}<div class="tree-top"><span class="eyebrow">${label}’s local branch</span><h2>The Giving Tree</h2><p>Take a door. Offer a little. Leave freely.</p></div><div class="cards">${visible.map(c=>cardHTML(c)).join('')||'<p class="empty">No public invitations remain on this branch.</p>'}</div><div class="tree-base">The caravan moves. The town keeps a branch.</div></div>`;
  if(view==='caravan') $('#main-view').innerHTML=`<div class="journey-panel"><span class="eyebrow">Three towns · one careful return</span><h2 style="font-size:42px;margin-top:15px">Carry the song.<br>Keep the promises.</h2><p>The current rehearsal stop is ${SEED.towns.find(t=>t.id===state.currentTown).label}. Each welcome, handoff and confirmation is recorded separately.</p><div class="stages"><div class="stage"><span class="eyebrow">Music / physical handoff</span><strong>${p.carries[0]?.status==='RECEIVED'?'Received in River':p.carries.length?'Awaiting River’s receipt':'Still with its musician'}</strong><p>One song, scoped to one receiver. Publication permission stays separate.</p></div><div class="stage"><span class="eyebrow">A shared table</span><strong>${p.introductions[0]?.status||'An open invitation'}</strong><p>Proposal → two choices → helper report → recipient confirmation.</p></div><div class="stage"><span class="eyebrow">Scripture</span><strong>Look up, then verify</strong><p>Genesis is eligible for owner lookup. Jubilee themes remain human-selected citations.</p></div><div class="stage"><span class="eyebrow">A return to the first branch</span><strong>${p.returns.length?'A synthetic return, recorded':'A future question'}</strong><p>What actually carried? Who confirmed? The rehearsal never certifies a real gathering.</p></div></div></div>`;
  if(view==='paper') $('#main-view').innerHTML=`<div class="paper-panel"><span class="eyebrow">A paper door comes first</span><h2 style="font-size:40px;margin-top:15px">A tree without a phone.</h2><p>Print the current public invitations from all three towns. Private, expired and withdrawn tags are excluded. These cards remain visibly marked as rehearsal material.</p><button class="secondary" id="print">Print public paper doors ↗</button><div class="cards">${p.cards.map(c=>cardHTML(c)).join('')}</div></div>`;
  const step=count<13?STEP_COPY[count]:['The branch is still here','You walked through a three-town rehearsal. The song’s receipt and the neighbor’s confirmation came home as distinct histories.','Return recorded ✓'];
  $('#step-number').textContent=count===13?'A RETURN, EARNED IN REHEARSAL':`CHOICE ${String(count+1).padStart(2,'0')} OF 13`;
  $('#step-title').textContent=step[0];$('#step-copy').textContent=step[1];$('#next-action').textContent=step[2]+'  →';$('#progress').style.width=count/13*100+'%';
  let blocked=''; if(count<13)try{applyEvent(state,JOURNEY[count]);}catch(error){blocked=error.message;}
  $('#next-action').disabled=count===13||Boolean(blocked);$('#blocked-note').textContent=blocked?blocked+'. Start again to explore another path.':'';
  $('#next-action').onclick=()=>{if(count<13)act(JOURNEY[count]);};
  $('#metrics').innerHTML=`<div class="metric"><strong>${p.cards.length}</strong><span>public invitations</span></div><div class="metric"><strong>${p.eventCount}</strong><span>separate choices</span></div><div class="metric"><strong>${p.carries.filter(c=>c.status==='RECEIVED').length}</strong><span>synthetic song receipts</span></div><div class="metric"><strong>${p.introductions.filter(i=>i.status==='CONFIRMED').length}</strong><span>synthetic confirmations</span></div>`;
  $('#history').innerHTML=state.events.length?[...state.events].reverse().map((e,i)=>`<li><b>${String(state.events.length-i).padStart(2,'0')}</b><span>${esc(STEP_COPY[JOURNEY.findIndex(x=>x.id===e.id)]?.[2]||({WITHDRAW_CARD:'A public invitation was withdrawn',DECIDE_HELP:'The introduction was declined',INSPECT_DOOR:'A paper door was inspected'}[e.type])||'A separate choice')}<small>SIMULATED DECLARATION · ${esc(e.type.replaceAll('_',' '))}</small></span></li>`).join(''):'<li class="empty">The first welcome has yet to be offered.</li>';
  $('#print-cards').innerHTML=`<h1>The Giving Tree</h1><p>Traveling Jubilee · Synthetic rehearsal · Invitations to inspect or decline</p><div class="cards">${p.cards.map(c=>cardHTML(c,true)).join('')}</div>`;
  for(const button of document.querySelectorAll('[data-card]'))button.onclick=()=>openDoor(button.dataset.card);
  if($('#print'))$('#print').onclick=()=>window.print();
}
function openDoor(cid){
  const c=projectSession(state).cards.find(c=>c.id===cid);if(!c)return;
  if(!act(extra('INSPECT_DOOR',{card:cid})))return;
  const original=state.fixture.cards.find(x=>x.id===cid);
  $('#door-kind').textContent=kindNames[c.kind];$('#door-title').textContent=c.label;
  const copy={
    SCRIPTURE:c.disposition==='ELIGIBLE_FOR_LOOKUP'?`<p>${esc(c.citation)} is a synthetic paper invitation.</p><div class="note">A separate, verified source world is now available from Revival’s owner-local exporter, with its actual passage address, receipts and attribution. Inspecting it does not turn the rehearsal into a real event.</div>`:`<p>${esc(c.citation)} is a human-selected Jubilee theme.</p><div class="note">Citation only. The demonstrated Revival corpus does not establish this source address. A host may read from their separately chosen Bible.</div>`,
    NEED:'<p>A public invitation to share a table, held by its original neighbor.</p><div class="note">An introduction requires the neighbor’s and helper’s separate choices. A helper’s report remains separate from the recipient’s confirmation. Worship is optional.</div>',
    OFFER:'<p>A local offer. The people who offer it retain their own choices.</p><div class="note">This synthetic card does not book a kitchen, promise availability or appoint a host.</div>',
    MUSIC:'<p>A music artifact that may travel from Orchard to River.</p><div class="note">Permission: physical handoff to River only. Public broadcast, recording and onward publication require separate permission. This rehearsal contains no actual recording.</div>'
  };
  $('#door-copy').innerHTML=copy[c.kind];$('#door-actions').innerHTML='<button class="secondary" id="withdraw-card">Withdraw this invitation in rehearsal</button>';
  if(c.kind==='SCRIPTURE'&&c.citation===SOURCE_BUNDLE.manifest.locator){const source=document.createElement('button');source.className='primary';source.id='open-source';source.textContent='Inspect the verified Genesis world ↗';source.onclick=async()=>{try{await SourceViewer.openSourceWorld(SOURCE_BUNDLE,SOURCE_PIN,()=>projectSession(state).cards.some(x=>x.id===c.id));}catch(error){$('#notice').textContent=error.message;}};$('#door-actions').prepend(source);}
  $('#withdraw-card').onclick=()=>{if(act(extra('WITHDRAW_CARD',{card:c.id,actor:original.owner})))$('#door-dialog').close();};
  const intro=state.introductions.find(i=>i.cardId===c.id);
  if(intro && intro.status==='PROPOSED' && !intro.decisions[intro.recipient]){
    const button=document.createElement('button');button.className='secondary';button.textContent='The neighbor declines';
    button.onclick=()=>{if(act(extra('DECIDE_HELP',{introduction:intro.id,actor:intro.recipient,decision:'DECLINE'})))$('#door-dialog').close();};$('#door-actions').append(button);
  }
  $('#door-dialog').showModal();
}
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>{view=button.dataset.view;render();};
$('#close-door').onclick=()=>$('#door-dialog').close();
$('#reset').onclick=()=>{state=createRehearsal(SEED);counter=0;selectedTown='orchard';$('#notice').textContent='A fresh rehearsal. All choices are cleared.';render();};
$('#download').onclick=()=>{const content=JSON.stringify(projectSession(state),null,2)+'\n',url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='jubilee-public-rehearsal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#notice').textContent='Public snapshot saved. Private tags are excluded.';};
render();
