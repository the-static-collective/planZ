// Local operator notebook. Declarations stay declarations; aliases are not authentication.
export const HOST_CHECKS=['local-host','safeguarding','unconditional-help','food-and-access','paper-fallback','rest-and-transport'];
const identifier=v=>{if(typeof v!=='string'||! /^[a-z][a-z0-9-]{0,63}$/.test(v))throw Error('Use a short local alias or identifier');};
const label=v=>{if(typeof v!=='string'||!v.trim()||v.length>160)throw Error('A bounded public label is required');};
const timestamp=v=>{if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v.replace(/(?<!\.\d{3})Z$/,'.000Z'))throw Error('Use a valid UTC timestamp');};
const shape=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k))||keys.some(k=>!(k in v)))throw Error('Unexpected or missing notebook fields');};
const digest=v=>{if(typeof v!=='string'||! /^[a-f0-9]{64}$/.test(v))throw Error('Exact SHA-256 required');};
const events={HOST:['town','label','host','decision','checks'],CARD:['card','town','owner','kind','label','visibility','expiresAt','permissions','citation','mediaDigest'],
  WITHDRAW:['card','actor'],VISIT:['town','actor','observedAt'],OBSERVE:['card','town','actor','medium','observedAt'],
  INTRODUCE:['need','offer'],DECIDE:['introduction','actor','decision'],HELP_REPORT:['introduction','actor','observedAt'],HELP_CONFIRM:['introduction','actor','observedAt'],
  HANDOFF:['card','toTown','actor','mediaDigest'],RECEIVE:['carry','actor','receivedDigest','observedAt'],RETURN_REVIEW:['actor']};
export function newNotebook(id,createdAt){identifier(id);timestamp(createdAt);return {schema:'jubilee/field-notebook/v1',id,createdAt,events:[]};}
function initial(n){return {id:n.id,createdAt:n.createdAt,hosts:[],cards:[],visits:[],observations:[],introductions:[],carries:[],returns:[],eventCount:0,basis:'OPERATOR_DECLARATION',authority:'NONE'};}
function active(c,now){return c.visibility==='PUBLIC'&&!c.withdrawn&&Date.parse(c.expiresAt)>Date.parse(now);}
function reduce(s,e){
  const keys=events[e.type];if(!keys)throw Error('Unsupported notebook operation');shape(e,['id','type','recordedAt',...keys]);identifier(e.id);timestamp(e.recordedAt);
  for(const k of ['actor','town','host','owner','card','toTown','introduction','need','offer','carry'])if(k in e)identifier(e[k]);
  if('observedAt'in e){timestamp(e.observedAt);if(Date.parse(e.observedAt)>Date.parse(e.recordedAt))throw Error('Observation cannot be after its recorded time');}
  const host=town=>{const h=s.hosts.find(h=>h.town===town);if(!h||h.decision!=='ACCEPT')throw Error('Local host acceptance must be recorded');return h;};
  const card=cid=>{const c=s.cards.find(c=>c.card===cid);if(!c||!active(c,e.recordedAt))throw Error('Public invitation is withdrawn, private, expired or missing');host(c.town);return c;};
  const intro=iid=>{const i=s.introductions.find(i=>i.id===iid);if(!i)throw Error('Unknown help introduction');card(i.need);card(i.offer);return i;};
  switch(e.type){
    case 'HOST':{
      label(e.label);if(!['ACCEPT','DECLINE','REVOKE'].includes(e.decision)||!Array.isArray(e.checks)||e.checks.some(c=>!HOST_CHECKS.includes(c))||new Set(e.checks).size!==e.checks.length)throw Error('Invalid host declaration');
      if(e.decision==='ACCEPT'&&HOST_CHECKS.some(c=>!e.checks.includes(c)))throw Error('All six host checks need a separately recorded declaration');
      const prior=s.hosts.find(h=>h.town===e.town);if(prior&&prior.host!==e.host)throw Error('Host alias changes need a separate town record');
      const h={town:e.town,label:e.label,host:e.host,decision:e.decision,checks:[...e.checks]};if(prior)Object.assign(prior,h);else s.hosts.push(h);break;
    }
    case 'CARD':{
      if(s.cards.length>=100||s.cards.some(c=>c.card===e.card))throw Error('Duplicate or excessive cards');host(e.town);label(e.label);timestamp(e.expiresAt);
      if(!['SCRIPTURE','NEED','OFFER','MUSIC'].includes(e.kind)||!['PRIVATE','PUBLIC'].includes(e.visibility)||!Array.isArray(e.permissions)||new Set(e.permissions).size!==e.permissions.length||e.permissions.some(p=>!['PRINT','INTRODUCE'].includes(p)&&!/^HANDOFF:[a-z][a-z0-9-]{0,63}$/.test(p)))throw Error('Invalid card scope');
      if(e.kind==='SCRIPTURE'){if(typeof e.citation!=='string'||!e.citation.trim()||e.citation.length>80)throw Error('Explicit Scripture citation required');}else if(e.citation!==null)throw Error('Only Scripture cards name citations');
      if(e.kind==='MUSIC')digest(e.mediaDigest);else if(e.mediaDigest!==null||e.permissions.some(p=>p.startsWith('HANDOFF:')))throw Error('Only music cards have handoff bytes');
      if(e.permissions.includes('INTRODUCE')&&!['NEED','OFFER'].includes(e.kind))throw Error('Only help invitations have introduction scope');
      if(Date.parse(e.expiresAt)<=Date.parse(e.recordedAt))throw Error('Invitation must expire after registration');
      s.cards.push({...e,withdrawn:false});break;
    }
    case 'WITHDRAW':{const c=s.cards.find(c=>c.card===e.card);if(!c||c.owner!==e.actor)throw Error('Only the recorded owner can withdraw');c.withdrawn=true;break;}
    case 'VISIT':{const h=host(e.town);if(e.actor!==h.host)throw Error('A host records the local visit');s.visits.push({id:e.id,town:e.town,observedAt:e.observedAt});break;}
    case 'OBSERVE':{
      const c=card(e.card);host(e.town);if(!['PAPER','QR','SOUND'].includes(e.medium))throw Error('Unsupported observation medium');
      if(c.town!==e.town&&!s.carries.some(x=>x.card===c.card&&x.toTown===e.town))throw Error('Observation needs a local or permitted carried invitation');
      s.observations.push({id:e.id,card:e.card,town:e.town,medium:e.medium,observedAt:e.observedAt,status:'HUMAN_REPORTED'});break;
    }
    case 'INTRODUCE':{
      const n=card(e.need),o=card(e.offer);if(n.kind!=='NEED'||o.kind!=='OFFER'||n.owner===o.owner||!n.permissions.includes('INTRODUCE')||!o.permissions.includes('INTRODUCE'))throw Error('Two separately scoped help invitations required');
      if(s.introductions.some(i=>i.need===n.card&&i.offer===o.card))throw Error('Introduction already recorded; use a new invitation for a new proposal');
      s.introductions.push({id:e.id,need:n.card,offer:o.card,recipient:n.owner,helper:o.owner,decisions:[],status:'PROPOSED'});break;
    }
    case 'DECIDE':{
      const i=intro(e.introduction);if(!['PROPOSED','APPROVED'].includes(i.status)||![i.recipient,i.helper].includes(e.actor)||!['ACCEPT','DECLINE'].includes(e.decision)||i.decisions.some(d=>d.actor===e.actor))throw Error('Separate, current participant decision required');
      i.decisions.push({actor:e.actor,decision:e.decision});i.status=e.decision==='DECLINE'?'REFUSED':i.decisions.length===2?'APPROVED':'PROPOSED';break;
    }
    case 'HELP_REPORT':{const i=intro(e.introduction);if(i.status!=='APPROVED'||e.actor!==i.helper)throw Error('Only the approved helper reports');i.status='REPORTED';i.reportedAt=e.observedAt;break;}
    case 'HELP_CONFIRM':{const i=intro(e.introduction);if(i.status!=='REPORTED'||e.actor!==i.recipient)throw Error('Only the recipient confirms a prior report');if(Date.parse(e.observedAt)<Date.parse(i.reportedAt))throw Error('Confirmation cannot precede the reported act');i.status='RECIPIENT_CONFIRMED_DECLARATION';i.confirmedAt=e.observedAt;break;}
    case 'HANDOFF':{
      const c=card(e.card);host(e.toTown);digest(e.mediaDigest);
      if(c.kind!=='MUSIC'||e.actor!==c.owner||e.toTown===c.town||!c.permissions.includes('HANDOFF:'+e.toTown)||c.mediaDigest!==e.mediaDigest)throw Error('Owner scope and exact media bytes required');
      if(s.carries.some(x=>x.card===c.card&&x.toTown===e.toTown))throw Error('Handoff already recorded');
      s.carries.push({id:e.id,card:c.card,fromTown:c.town,toTown:e.toTown,mediaDigest:e.mediaDigest,status:'HANDOFF_REPORTED'});break;
    }
    case 'RECEIVE':{
      const c=s.carries.find(c=>c.id===e.carry);if(!c)throw Error('Unknown handoff');card(c.card);const h=host(c.toTown);digest(e.receivedDigest);
      if(e.actor!==h.host||c.status!=='HANDOFF_REPORTED'||e.receivedDigest!==c.mediaDigest||!s.visits.some(v=>v.town===c.toTown))throw Error('Receiver declaration, visit and matching bytes required');
      c.status='RECEIVER_CONFIRMED_DECLARATION';c.receivedAt=e.observedAt;break;
    }
    case 'RETURN_REVIEW':{const readiness=fieldReadiness(s,e.recordedAt);s.returns.push({id:e.id,status:readiness.missing.length?'HELD_MISSING_EVIDENCE':'READY_FOR_HUMAN_REVIEW',missing:readiness.missing,basis:'OPERATOR_DECLARATION'});break;}
  }
  s.eventCount++;return s;
}
export function replayNotebook(notebook){
  shape(notebook,['schema','id','createdAt','events']);if(notebook.schema!=='jubilee/field-notebook/v1')throw Error('Unsupported notebook');identifier(notebook.id);timestamp(notebook.createdAt);
  if(!Array.isArray(notebook.events)||notebook.events.length>500)throw Error('Notebook event limit');
  const ids=new Set();let latest=notebook.createdAt;const s=initial(notebook);
  for(const e of notebook.events){if(ids.has(e.id))throw Error('Repeated event ID');ids.add(e.id);timestamp(e.recordedAt);if(Date.parse(e.recordedAt)<Date.parse(latest))throw Error('Recorded time must preserve ledger order');latest=e.recordedAt;reduce(s,e);}return s;
}
export function appendNotebook(notebook,event){const next=structuredClone(notebook);next.events.push(structuredClone(event));replayNotebook(next);return next;}
export function fieldReadiness(s,now){timestamp(now);const visible=new Set(s.cards.filter(c=>active(c,now)&&s.hosts.some(h=>h.town===c.town&&h.decision==='ACCEPT')).map(c=>c.card));
  const missing=[];if(new Set(s.visits.filter(v=>s.hosts.some(h=>h.town===v.town&&h.decision==='ACCEPT')).map(v=>v.town)).size<3)missing.push('THREE_ACCEPTED_TOWN_VISITS');
  if(!s.observations.some(o=>visible.has(o.card)))missing.push('ONE_RECORDED_ENCOUNTER');
  if(!s.carries.some(c=>visible.has(c.card)&&c.status==='RECEIVER_CONFIRMED_DECLARATION'&&s.hosts.some(h=>h.town===c.toTown&&h.decision==='ACCEPT')))missing.push('ONE_RECEIVER_CONFIRMED_CARRY');
  if(!s.introductions.some(i=>visible.has(i.need)&&visible.has(i.offer)&&i.status==='RECIPIENT_CONFIRMED_DECLARATION'))missing.push('ONE_RECIPIENT_CONFIRMED_HELP_ACT');
  return {status:missing.length?'HELD_MISSING_EVIDENCE':'READY_FOR_HUMAN_REVIEW',missing,basis:'OPERATOR_DECLARATION',ownerAdmission:'NOT_CLAIMED'};
}
export function publicFieldProjection(s,now){timestamp(now);const cards=s.cards.filter(c=>active(c,now)&&s.hosts.some(h=>h.town===c.town&&h.decision==='ACCEPT'));
  return {schema:'jubilee/public-field-summary/v1',basis:'OPERATOR_DECLARATION',authority:'NONE',
    cards:cards.map(c=>({id:c.card,town:c.town,kind:c.kind,label:c.label,citation:c.citation,printAllowed:c.permissions.includes('PRINT')})),
    counts:{publicInvitations:cards.length,reportedObservations:s.observations.filter(o=>cards.some(c=>c.card===o.card)).length,
      receiverDeclarations:s.carries.filter(c=>cards.some(x=>x.card===c.card)&&c.status==='RECEIVER_CONFIRMED_DECLARATION'&&s.hosts.some(h=>h.town===c.toTown&&h.decision==='ACCEPT')).length,
      recipientDeclarations:s.introductions.filter(i=>cards.some(c=>c.card===i.need)&&cards.some(c=>c.card===i.offer)&&i.status==='RECIPIENT_CONFIRMED_DECLARATION').length},
    readiness:fieldReadiness(s,now),performedEffects:[],createdConnections:[]};
}
