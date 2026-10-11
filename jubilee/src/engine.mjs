// TOPPER-001 executable rehearsal. Pure local projections; no live owner authority.
const ID = /^[a-z][a-z0-9-]{0,63}$/;
const text = (v, name) => { if (typeof v !== 'string' || !v.trim() || v.length > 240) throw Error(`Invalid ${name}`); };
const id = (v) => { if (typeof v !== 'string' || !ID.test(v)) throw Error('Invalid identifier'); };
const shape = (v, keys) => { if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).some(k => !keys.includes(k))) throw Error('Unexpected fields'); };
const exactKeys = (v, keys) => { shape(v, keys); if (keys.some(k => !(k in v))) throw Error('Missing fields'); };
const time = v => typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v.replace('Z','.000Z');
const sorted = values => [...values].sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
export function canonical(value) {
  if(Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if(value && typeof value==='object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}

export function validateFixture(f) {
  exactKeys(f, ['schema','status','now','towns','cards']);
  if (f.schema !== 'jubilee/rehearsal/v1' || f.status !== 'SYNTHETIC_ONLY' || !time(f.now)) throw Error('Synthetic fixture and fixed time required');
  if (!Array.isArray(f.towns) || f.towns.length !== 3 || !Array.isArray(f.cards) || f.cards.length > 100) throw Error('Expected three towns and bounded cards');
  const towns = new Set(); const cards = new Set();
  for (const t of f.towns) { exactKeys(t,['id','label','host']); id(t.id); id(t.host); text(t.label,'town label'); if(towns.has(t.id)) throw Error('Duplicate town'); towns.add(t.id); }
  for (const c of f.cards) {
    exactKeys(c,['id','town','owner','kind','label','visibility','optIn','revoked','expiresAt','citation','permissions']);
    id(c.id); id(c.owner); text(c.label,'card label');
    if(cards.has(c.id)) throw Error('Duplicate card'); cards.add(c.id);
    if (!towns.has(c.town) || !['SCRIPTURE','NEED','OFFER','MUSIC'].includes(c.kind) || !['PUBLIC','PRIVATE'].includes(c.visibility) || typeof c.optIn !== 'boolean' || typeof c.revoked !== 'boolean' || !time(c.expiresAt)) throw Error('Invalid card');
    if(c.kind === 'SCRIPTURE') text(c.citation,'citation'); else if(c.citation !== null) throw Error('Only Scripture cards have citations');
    if(!Array.isArray(c.permissions) || new Set(c.permissions).size !== c.permissions.length || c.permissions.some(p=> ![...towns].some(t=>p===`HANDOFF:${t}`)) || (c.kind !== 'MUSIC' && c.permissions.length)) throw Error('Invalid scoped permission');
  }
  return f;
}

function publicCard(c, now) { return c.visibility === 'PUBLIC' && c.optIn === true && c.revoked === false && Date.parse(c.expiresAt) > Date.parse(now); }
export function evaluateCards(f) {
  validateFixture(f);
  const cards = sorted(f.cards.filter(c=>publicCard(c,f.now))).map(c=>({
    id:c.id, town:c.town, kind:c.kind, label:c.label, citation:c.citation,
    disposition: c.kind === 'SCRIPTURE' ? c.citation === 'Gen.1.1' ? 'ELIGIBLE_FOR_LOOKUP' : 'CITATION_ONLY_SOURCE_UNRESOLVED' : 'PUBLIC_INVITATION',
    revivalAddress:null, sourceDigest:null, effect:'NONE'
  }));
  return {schema:'jubilee/card-projection/v1', status:'SYNTHETIC_ONLY', cards,
    excludedCount:f.cards.length-cards.length,
    exclusions:{PRIVATE_OR_WITHDRAWN:f.cards.filter(c=>c.visibility!=='PUBLIC' || !c.optIn || c.revoked).length,
      EXPIRED:f.cards.filter(c=>c.visibility==='PUBLIC' && c.optIn && !c.revoked && Date.parse(c.expiresAt)<=Date.parse(f.now)).length},
    createdConnections:[], appliedEffects:[]};
}

export function createRehearsal(f) {
  validateFixture(f);
  return {schema:'jubilee/session/v1', fixture:structuredClone(f), currentTown:f.towns[0].id,
    acceptedHosts:[], visitedTowns:[f.towns[0].id], carries:[], introductions:[], observations:[], returns:[], events:[], effect:'NONE'};
}
const ACTIONS = {
  ACCEPT_HOST:['town','actor'], TRAVEL:['town'], WITHDRAW_CARD:['card','actor'], INSPECT_DOOR:['card'],
  CARRY_ARTIFACT:['card','town','actor'], RECEIVE_ARTIFACT:['carry','actor'],
  PROPOSE_HELP:['card','town','recipient','helper'], DECIDE_HELP:['introduction','actor','decision'],
  REPORT_DELIVERY:['introduction','actor'], CONFIRM_AID:['introduction','actor'], RECORD_RETURN:[]
};

// Each accepted event records a simulated declaration, never a real event witness.
export function applyEvent(state, event) {
  const keys = ACTIONS[event?.type]; if(!keys) throw Error('Unknown action');
  exactKeys(event,['id','type',...keys]); id(event.id);
  for(const key of keys) if(key !== 'decision') id(event[key]);
  const previous = state.events.find(e=>e.id===event.id);
  if(previous) { if(canonical(previous)!==canonical(event)) throw Error('Conflicting replay'); return structuredClone(state); }
  if(state.events.length >= 300) throw Error('Rehearsal event limit');
  const s=structuredClone(state); const f=s.fixture;
  const town = tid => { const t=f.towns.find(t=>t.id===tid); if(!t) throw Error('Unknown town'); return t; };
  const host = tid => { town(tid); if(!s.acceptedHosts.includes(tid)) throw Error('Host has not accepted'); };
  const card = cid => { const c=f.cards.find(c=>c.id===cid); if(!c || !publicCard(c,f.now)) throw Error('Card unavailable'); return c; };
  const intro = iid => { const i=s.introductions.find(i=>i.id===iid); if(!i) throw Error('Unknown introduction'); card(i.cardId); host(i.town); return i; };
  switch(event.type) {
    case 'INSPECT_DOOR': { const c=card(event.card); s.observations.push({id:event.id,cardId:c.id,medium:'PAPER',status:'SIMULATED_INSPECTION',revivalAddress:null,effect:'NONE'}); break; }
    case 'ACCEPT_HOST': { const t=town(event.town); if(event.actor!==t.host) throw Error('Only local host accepts'); if(!s.acceptedHosts.includes(t.id)) s.acceptedHosts.push(t.id); break; }
    case 'TRAVEL': {
      const current=f.towns.findIndex(t=>t.id===s.currentTown); if(f.towns[current+1]?.id!==event.town) throw Error('Travel requires next town');
      host(s.currentTown); host(event.town); s.currentTown=event.town; s.visitedTowns.push(event.town); break;
    }
    case 'WITHDRAW_CARD': { const c=f.cards.find(c=>c.id===event.card); if(!c || c.owner!==event.actor) throw Error('Only card owner withdraws'); c.revoked=true; break; }
    case 'CARRY_ARTIFACT': {
      const c=card(event.card); host(s.currentTown); town(event.town);
      if(c.kind!=='MUSIC' || c.owner!==event.actor || c.town!==s.currentTown || event.town===s.currentTown || !c.permissions.includes(`HANDOFF:${event.town}`)) throw Error('Handoff permission required');
      if(s.carries.some(x=>x.cardId===c.id)) throw Error('Artifact already carried');
      s.carries.push({id:event.id,cardId:c.id,sourceTown:c.town,destinationTown:event.town,status:'AWAITING_RECEIPT',receivedAt:null}); break;
    }
    case 'RECEIVE_ARTIFACT': {
      const c=s.carries.find(c=>c.id===event.carry); if(!c) throw Error('Unknown carry'); const source=card(c.cardId);
      host(s.currentTown); if(c.destinationTown!==s.currentTown || event.actor!==town(s.currentTown).host || !source.permissions.includes(`HANDOFF:${s.currentTown}`) || c.status!=='AWAITING_RECEIPT') throw Error('Receiver acceptance required');
      c.status='RECEIVED'; c.receivedAt=s.currentTown; break;
    }
    case 'PROPOSE_HELP': {
      const c=card(event.card); host(c.town); host(event.town);
      if(c.kind!=='NEED' || event.recipient!==c.owner || event.helper!==town(event.town).host || c.town===event.town || event.recipient===event.helper) throw Error('Separate recipient and helper required');
      if(s.introductions.some(i=>i.cardId===c.id && i.town===event.town)) throw Error('Introduction already proposed');
      s.introductions.push({id:event.id,cardId:c.id,town:event.town,recipient:event.recipient,helper:event.helper,decisions:{},status:'PROPOSED'}); break;
    }
    case 'DECIDE_HELP': {
      const i=intro(event.introduction);
      if(![i.recipient,i.helper].includes(event.actor) || !['ACCEPT','DECLINE'].includes(event.decision) || !['PROPOSED','APPROVED'].includes(i.status)) throw Error('Invalid scoped decision');
      if(i.decisions[event.actor]) throw Error('Decision already recorded');
      i.decisions[event.actor]=event.decision;
      i.status=event.decision==='DECLINE'?'REFUSED':i.decisions[i.recipient]==='ACCEPT' && i.decisions[i.helper]==='ACCEPT'?'APPROVED':'PROPOSED'; break;
    }
    case 'REPORT_DELIVERY': { const i=intro(event.introduction); if(i.status!=='APPROVED' || event.actor!==i.helper) throw Error('Approved helper reports'); i.status='REPORTED'; break; }
    case 'CONFIRM_AID': { const i=intro(event.introduction); if(i.status!=='REPORTED' || event.actor!==i.recipient) throw Error('Recipient alone confirms reported aid'); i.status='CONFIRMED'; break; }
    case 'RECORD_RETURN': {
      host(s.currentTown);
      if(s.currentTown!==f.towns[2].id || s.returns.length) throw Error('Third town returns once');
      const carries=s.carries.filter(c=>c.status==='RECEIVED' && publicCard(f.cards.find(x=>x.id===c.cardId),f.now));
      const aid=s.introductions.filter(i=>i.status==='CONFIRMED' && publicCard(f.cards.find(x=>x.id===i.cardId),f.now));
      if(!carries.length || !aid.length) throw Error('Received artifact and recipient confirmation required');
      s.returns.push({id:event.id,towns:[...s.visitedTowns],carryIds:carries.map(c=>c.id),aidIds:aid.map(i=>i.id),status:'SYNTHETIC_RETURN',authority:'NONE'}); break;
    }
  }
  s.events.push(structuredClone(event)); return s;
}

export function replay(f, events) {
  if(!Array.isArray(events)) throw Error('Events required');
  return events.reduce(applyEvent,createRehearsal(f));
}

export function projectSession(s) {
  const projection=evaluateCards(s.fixture); const visible=new Set(projection.cards.map(c=>c.id));
  return {...projection,currentTown:s.currentTown,acceptedHosts:[...s.acceptedHosts],visitedTowns:[...s.visitedTowns],
    carries:s.carries.filter(c=>visible.has(c.cardId)).map(c=>({...c})),
    introductions:s.introductions.filter(i=>visible.has(i.cardId)).map(i=>({id:i.id,cardId:i.cardId,town:i.town,status:i.status})),
    observations:s.observations.filter(o=>visible.has(o.cardId)).map(o=>({...o})),
    returns:s.returns.map(r=>({...r,carryIds:r.carryIds.filter(cid=>s.carries.some(c=>c.id===cid && visible.has(c.cardId))),aidIds:r.aidIds.filter(iid=>s.introductions.some(i=>i.id===iid && visible.has(i.cardId)))})),eventCount:s.events.length,authority:'NONE'};
}
