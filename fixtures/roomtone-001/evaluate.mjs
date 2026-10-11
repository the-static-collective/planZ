// ROOMTONE-001 synthetic, pure, offline-only candidate evaluator.
// This module does not access sensors, network, storage, user identity or physical devices.
// It demonstrates *candidate* relations only. No connection is ever executed.

export function evaluateFixture(fixture) {
  if (!fixture || fixture.schema !== "roomtone/three-rooms-fixture/v0" || fixture.status !== "SYNTHETIC_ONLY") throw new Error("Expected synthetic ROOMTONE fixture only");
  const now = Date.parse(fixture.now);
  if (!Number.isFinite(now)) throw new Error("Invalid fixture time");
  if (!Array.isArray(fixture.offers)) throw new Error("Offers required");
  const ids = new Set();
  const active = [];
  const excluded = [];
  for (const offer of fixture.offers) {
    if (!offer || typeof offer.id !== "string" || ids.has(offer.id)) throw new Error("Invalid/duplicate offer ID");
    ids.add(offer.id);
    const expiry = Date.parse(offer.expiresAt);
    if (offer.optIn !== true || offer.revoked === true || !Number.isFinite(expiry) || expiry <= now) excluded.push(offer.id);
    else active.push(offer);
  }
  active.sort((a,b)=>a.id.localeCompare(b.id));
  const candidates = [];
  const nonclaims = ["COLOCATION","PERSON_IDENTITY","INDEPENDENT_PHYSICAL_WITNESS","CONSENT_TO_CONNECT"];
  for (let i=0;i<active.length;i++) for(let j=i+1;j<active.length;j++) {
    const a=active[i], b=active[j];
    const shared = (mode, fields) => a.modes?.includes(mode) && b.modes?.includes(mode) && fields.every(f=>a.share?.includes(f)&&b.share?.includes(f));
    const emit = (mode, matchedOn) => {
      const decisions = [fixture.decisions?.[a.id] || "HOLD",fixture.decisions?.[b.id] || "HOLD"];
      const state = decisions.includes("DECLINE") ? "REFUSED" : decisions.every(v=>v==="ACCEPT") ? "MUTUAL_APPROVAL_PENDING_EFFECT" : "HOLD";
      candidates.push({id:mode+":"+a.id+":"+b.id, mode, participants:[a.id,b.id], matchedOn, status:state, nonclaims});
    };
    if (shared("SONG-SEAT",["song_ref"]) && typeof a.song?.ref==="string" && a.song.ref.length>0 && a.song.ref===b.song?.ref) emit("SONG-SEAT",["song_ref"]);
    if (shared("ROOM-RHYME",["texture","weather"]) && typeof a.features?.texture==="string" && a.features.texture && a.features.texture===b.features?.texture && typeof a.features.weather==="string" && a.features.weather && a.features.weather===b.features?.weather && typeof a.features.weatherBasis==="string" && a.features.weatherBasis===b.features?.weatherBasis) emit("ROOM-RHYME",["texture","weather","weatherBasis"]);
  }
  candidates.sort((a,b)=>a.id.localeCompare(b.id));
  return {schema:"roomtone/synthetic-evaluation/v0",fixtureStatus:"SYNTHETIC_ONLY",candidates,excludedOffers:excluded.sort(),createdConnections:[],appliedEffects:[]};
}
