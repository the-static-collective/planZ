// HEARTH 002: fixture-only cold handoff; original Jubilee owns every event.
export const PIN = "9f6f1c339109f73c351eff1dcf1ed77187044693";
const SCHEMA = "hearth.empty-chair/synthetic-v1";
const clone = x => JSON.parse(JSON.stringify(x));
function require(ok, message) { if (!ok) throw Error(message); }
const keys = (o, expected) => o && typeof o === "object" && !Array.isArray(o) &&
  Object.keys(o).sort().join("|") === expected.slice().sort().join("|");
export function createAPI(engine) {
  const {canonical, replay, applyEvent} = engine;
  // The sender cannot export notes, fixture data or authority through this schema.
  function pack(fixture, events, privateNotes) {
    require(fixture.status === "SYNTHETIC_ONLY", "Fixture only");
    require(Array.isArray(events) && events.length === 9, "Expected cut after helper report");
    const state = replay(fixture, events);
    require(state.introductions.length === 1 && state.introductions[0].status === "REPORTED"
      && state.returns.length === 0, "Not the reviewed checkpoint");
    return {schema:SCHEMA, source:PIN, audience:"operator-b",
      events:clone(events), authority:"NONE"};
  }
  // reviewedPrefix is independently held fixture history, NOT supplied by the packet.
  // This deliberately tests restart logic, not signatures, live identity, or trust.
  function receive(raw, fixture, reviewedPrefix, decision) {
    require(typeof raw === "string" && raw.length <= 16000, "Packet size");
    const p = JSON.parse(raw);
    require(keys(p, ["schema","source","audience","events","authority"]), "Packet shape");
    require(p.schema === SCHEMA && p.source === PIN && p.audience === "operator-b" &&
      p.authority === "NONE" && fixture.status === "SYNTHETIC_ONLY", "Scope or source");
    require(Array.isArray(reviewedPrefix) && reviewedPrefix.length === 9 &&
      canonical(p.events) === canonical(reviewedPrefix), "Checkpoint differs from reviewed history");
    const state = replay(fixture, p.events);
    require(state.introductions.length === 1 && state.introductions[0].status === "REPORTED" &&
      state.returns.length === 0, "Checkpoint incomplete");
    if (decision === undefined || decision === "HOLD" || decision === "REFUSE")
      return {status:decision === "REFUSE" ? "REFUSED" : "HELD", authority:"NONE"};
    require(decision === "ACCEPT_REHEARSAL", "Explicit receiver decision required");
    return {status:"READY_SYNTHETIC_ONLY", state, authority:"NONE"};
  }
  // A receiving operator coordinates, not substitutes for the fictional actor.
  // Each proposed event requires an independently entered matching actor decision.
  function step(received, event, actorDecision) {
    require(received.status === "READY_SYNTHETIC_ONLY", "No accepted rehearsal");
    require(keys(actorDecision, ["eventId","actor","decision"]), "Decision shape");
    require(actorDecision.eventId === event.id && actorDecision.decision === "ACCEPT" &&
      actorDecision.actor === (event.actor || "rehearsal-coordinator"), "Separate decision missing");
    return {status:received.status, state:applyEvent(received.state,event), authority:"NONE"};
  }
  return {pack,receive,step};
}
export function rehearse(engine,fixture,journey) {
  const api=createAPI(engine), results=[];
  const prefix=journey.slice(0,9), suffix=journey.slice(9);
  const secret="SYNTHETIC_PRIVATE_NOTE_DO_NOT_EXPORT";
  const packet=JSON.stringify(api.pack(fixture,prefix,secret));
  // Independent receiver API instance, parsed packet and trusted fixture.
  const receiver=createAPI(engine), trusted=clone(prefix);
  const fresh=(decision="ACCEPT_REHEARSAL",raw=packet,f=fixture)=>receiver.receive(raw,f,trusted,decision);
  const approval=e=>({eventId:e.id,actor:e.actor||"rehearsal-coordinator",decision:"ACCEPT"});
  const change=f=>{const p=JSON.parse(packet);f(p);return JSON.stringify(p);};
  const reject=f=>{try{f();return false;}catch{return true;}};
  function check(name,fn){try{results.push({name,pass:!!fn()});}catch(e){results.push({name,pass:false,error:String(e)});}}
  check("private narrative and private fixture card absent",()=>!packet.includes(secret)&&!packet.includes("held-need")&&!packet.includes("Private synthetic placeholder"));
  check("default hold exposes no actionable state",()=>{const x=receiver.receive(packet,fixture,trusted);return x.status==="HELD"&&!x.state;});
  check("refusal exposes no actionable state",()=>{const x=fresh("REFUSE");return x.status==="REFUSED"&&!x.state;});
  check("cold reconstructed checkpoint remains reported, not confirmed",()=>fresh().state.introductions[0].status==="REPORTED");
  check("no inherited authority",()=>fresh().authority==="NONE");
  check("changed event rejected",()=>reject(()=>fresh("ACCEPT_REHEARSAL",change(p=>p.events[8].actor="neighbor"))));
  check("unknown packet field rejected",()=>reject(()=>fresh("ACCEPT_REHEARSAL",change(p=>p.privateNotes=secret))));
  check("wrong source rejected",()=>reject(()=>fresh("ACCEPT_REHEARSAL",change(p=>p.source="unreviewed"))));
  check("wrong receiver rejected",()=>reject(()=>fresh("ACCEPT_REHEARSAL",change(p=>p.audience="operator-a"))));
  check("missing event rejected",()=>reject(()=>fresh("ACCEPT_REHEARSAL",change(p=>p.events.pop()))));
  check("held packet cannot advance",()=>reject(()=>receiver.step(fresh("HOLD"),suffix[0],approval(suffix[0]))));
  check("coordinator cannot substitute for recipient",()=>reject(()=>receiver.step(fresh(),suffix[0],{...approval(suffix[0]),actor:"rehearsal-coordinator"})));
  check("native engine rejects wrong recipient even with matching claimed decision",()=>{const e={...suffix[0],actor:"host-river"};return reject(()=>receiver.step(fresh(),e,approval(e)));});
  check("current fictional withdrawal blocks confirmation",()=>{const w={id:"withdraw-after-cut",type:"WITHDRAW_CARD",card:"shared-table",actor:"neighbor"};const x=receiver.step(fresh(),w,approval(w));return reject(()=>receiver.step(x,suffix[0],approval(suffix[0])));});
  check("later return without confirmation rejected",()=>reject(()=>suffix.slice(1).reduce((s,e)=>receiver.step(s,e,approval(e)),fresh())));
  let resumed=fresh();
  for(const e of suffix) resumed=receiver.step(resumed,e,approval(e));
  check("cold continuation matches uninterrupted original",()=>engine.canonical(resumed.state)===engine.canonical(engine.replay(fixture,journey)));
  check("return stays synthetic",()=>resumed.state.returns.length===1&&resumed.state.returns[0].status==="SYNTHETIC_RETURN"&&resumed.authority==="NONE");
  return {status:"SYNTHETIC_ONLY",cut:prefix.length,resumed:suffix.length,packetCharacters:packet.length,checks:results,authority:"NONE",admission:"none"};
}
