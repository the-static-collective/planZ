/**
 * KINSHIP-BROADCAST-QUEUE-001
 * Deterministic, offline, SYNTHETIC-only candidate edition generator.
 *
 * This instrument does NOT ingest real needs, approve publication, send
 * station submissions, broadcast, collect responses, or establish aid outcomes.
 * Passing validation here does NOT establish consent or identity. It is a
 * falsifiable rehearsal of the shape of a rotating source-owned card feed.
 */
const CARD_STATES = new Set(["OPEN","PAUSED","FILLED","WITHDRAWN","EXPIRED"]);
const CATEGORIES = new Set(["food_goods","food_transport","food_sorting","garden_work","community_event","mobility_help","tools"]);
const SAFE = /^[A-Z0-9][A-Z0-9-]{3,41}$/;
const FRESHNESS_MS = 30 * 60 * 1000;
const MAX_CARDS = 5;
const isoTime = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(s)
  && Number.isFinite(Date.parse(s)) ? Date.parse(s) : null;
function required(ok, reason) { if (!ok) throw new Error("BROADCAST QUEUE REFUSED: " + reason); }

/**
 * Card envelope has no real operator personal data. All records used by this
 * module MUST have fixtureOnly:true; the real solution needs independent
 * human, source, editorial and current-permission checks before reuse.
 */
export function checkFixtureCard(card) {
  required(card && typeof card === "object" && !Array.isArray(card),"card object required");
  required(card.fixtureOnly === true, "only explicit synthetic fixture cards permitted");
  required(typeof card.id === "string" && SAFE.test(card.id), "invalid opaque public card ID");
  required(Number.isSafeInteger(card.revision) && card.revision >= 1, "invalid revision");
  required(CARD_STATES.has(card.sourceState), "invalid source status");
  required(CATEGORIES.has(card.category), "category not in proposed material-help and events scope");
  required(card.kind === "goods" || card.kind === "service" || card.kind === "public_event", "money-only help is out of scope");
  required(card.region === "South-central Minnesota" || card.region === "Southern Minnesota", "unrecognized coarse demo region");
  required(typeof card.publicSummary === "string" && card.publicSummary.length>=8 && card.publicSummary.length<=130
    && !/[<>@]/.test(card.publicSummary), "summary requires separate human safety review");
  required(card.responseDoor === "DEMO_ONLY", "no real URLs/contact fields permitted in fixture");
  required(typeof card.publicConsentSimulated === "boolean" &&
    typeof card.radioConsentSimulated === "boolean" &&
    typeof card.editorialReviewSimulated === "boolean", "simulated independent decisions required");
  required(isoTime(card.checkedAtUtc)!==null && isoTime(card.expiresAtUtc)!==null, "UTC timestamps required");
  return true;
}

export function candidateEdition(cards, atUtc, options = {}) {
  required(Array.isArray(cards) && cards.length<=100, "bounded cards list required");
  const now=isoTime(atUtc);required(now!==null,"valid as-of UTC timestamp required");
  const maxCards=options.maxCards??MAX_CARDS;
  const freshnessMinutes=options.freshnessMinutes??30;
  required(Number.isSafeInteger(maxCards)&&maxCards>=1&&maxCards<=10,"maxCards out of bounds");
  required(Number.isSafeInteger(freshnessMinutes)&&freshnessMinutes>=1&&freshnessMinutes<=1440,"freshnessMinutes out of bounds");
  const seen=new Set(); const eligible=[];const excluded=[];
  for(const card of cards) {
    checkFixtureCard(card);
    required(!seen.has(card.id),"duplicate current card identity");seen.add(card.id);
    const checked=isoTime(card.checkedAtUtc), expiry=isoTime(card.expiresAtUtc);
    const reasons=[];
    if(card.sourceState!=="OPEN")reasons.push("SOURCE_"+card.sourceState);
    if(!card.publicConsentSimulated)reasons.push("PUBLIC_CONSENT_UNPROVEN");
    if(!card.radioConsentSimulated)reasons.push("RADIO_CONSENT_UNPROVEN");
    if(!card.editorialReviewSimulated)reasons.push("STATION_REVIEW_UNPROVEN");
    if(expiry <= now)reasons.push("EXPIRED");
    if(checked>now || now-checked>freshnessMinutes*60*1000)reasons.push("STALE_OR_FUTURE_CHECK");
    if(reasons.length){ excluded.push({id:card.id,revision:card.revision,reasons}); continue; }
    eligible.push(card);
  }
  eligible.sort((a,b)=>isoTime(a.expiresAtUtc)-isoTime(b.expiresAtUtc) || a.id.localeCompare(b.id));
  const selected=eligible.slice(0,maxCards).map(card=>({
    id:card.id,revision:card.revision,category:card.category,
    region:card.region,publicSummary:card.publicSummary,
    checkedAtUtc:card.checkedAtUtc,expiresAtUtc:card.expiresAtUtc,
    responseDoor:"DEMO_ONLY",
    visibility:"SYNTHETIC_CANDIDATE"
  }));
  return {
    schema:"planz.kinship-broadcast-edition-candidate/v0",
    asOfUtc:atUtc,expiryPolicyMinutes:freshnessMinutes,
    publicationAuthority:"NONE",airAuthority:"NONE",
    editionStatus:"PREVIEW_ONLY_NO_STATION_APPROVAL",
    assumedConsent:"SIMULATED_ASSERTIONS_NOT_HUMAN_EVIDENCE",
    candidateCount:selected.length,
    selected,excluded,
    overflowingEligible:Math.max(0,eligible.length-selected.length),
    voiceIntro:"FICTIONAL REHEARSAL. For live local opportunities, visit the organizer-approved current card board before responding.",
    safeReturn:"Current card status, permissions and response coordination remain with the source stewards."
  };
}

/** Offline synthetic state mutation. Creates a new revision, never rewrites a past edition. */
export function reviseFixtureCard(card, changes, atUtc) {
  checkFixtureCard(card);
  const at=isoTime(atUtc);required(at!==null,"revision time required");
  required(changes && typeof changes==="object" && !Array.isArray(changes),"changes required");
  const keys=Object.keys(changes);
  required(keys.length>0 && keys.every(k=>["sourceState","radioConsentSimulated","publicConsentSimulated","editorialReviewSimulated"].includes(k)),
    "only bounded demo revisions permitted");
  const next={...card,...changes,revision:card.revision+1,checkedAtUtc:atUtc};
  checkFixtureCard(next);
  return next;
}

/** Listener interest is not a task assignment, let alone recipient confirmation. */
export function mockListenerOffer(card, atUtc) {
  checkFixtureCard(card);required(isoTime(atUtc)!==null,"valid response time required");
  return {schema:"planz.synthetic-listener-offer/v0",cardId:card.id,
    sourceRevision:card.revision,asOfUtc:atUtc,status:"OFFER_RECEIVED_NOT_ASSIGNED",
    fulfillment:"NOT_CLAIMED",sourceOperatorApproval:"NOT_ESTABLISHED",
    publicData:null,fixtureOnly:true};
}
