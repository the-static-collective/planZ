import {createHash} from 'node:crypto';
import {validatePublicAttention} from './validate-attention.mjs';
// Receiver-local triage only. This does not open or modify a planZ issue.
const HASH=/^sha256:[a-f0-9]{64}$/;
const only=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).sort().join('|')===keys.slice().sort().join('|');
const digest=v=>'sha256:'+createHash('sha256').update('CULTURE_RETURN_005|'+JSON.stringify(v)).digest('hex');
function fail(p,m){if(!p)throw Error('PLANZ_CULTURE_HOLD: '+m)}
export function checkCultureOffer(p){
 fail(only(p,['schema','identity','source','proposal','truth','effects']),'ENVELOPE_FIELDS');
 fail(p.schema==='cannon.culture-reuse-offer/v1','ENVELOPE_SCHEMA');
 const {identity,...body}=p;
 fail(identity===digest(body),'PACKET_TAMPERED');
 fail(only(p.source,['cultureReceipt','comicSha256','pressReceipt','ghotReceipt','crossing','received','held']),'SOURCE_FIELDS');
 fail(Object.values(p.source).every(x=>typeof x==='string'&&x.length>15&&x.length<256),'SOURCE_IDS_MISSING');
 fail(HASH.test(p.source.comicSha256),'CULTURAL_BYTES_UNBOUND');
 fail(only(p.proposal,['kind','title','candidateMethod','suggestedUse']),'PROPOSAL_FIELDS');
 fail(p.proposal.kind==='REUSABLE_CULTURAL_METHOD_CANDIDATE'&&p.proposal.title==='A Room That Remembers'&&
  typeof p.proposal.candidateMethod==='string'&&p.proposal.candidateMethod.length>=20&&
  p.proposal.candidateMethod.length<=240&&typeof p.proposal.suggestedUse==='string'&&
  p.proposal.suggestedUse.length>=20&&p.proposal.suggestedUse.length<=240,'PROPOSAL_SCOPE');
 fail(only(p.truth,['fictional','humanAuthenticated','fieldUseVerified','licensedEdition','ownerCanonSelected','sourceSignatureIndependentlyVerified']),'TRUTH_FIELDS');
 fail(p.truth.fictional===true&&Object.entries(p.truth).every(([k,v])=>k==='fictional'||v===false),'TRUTH_ESCALATION');
 fail(only(p.effects,['pennyIssued','humanDeeds','externalPayments','nftsMinted','automaticActions']),'EFFECTS_FIELDS');
 fail(Object.values(p.effects).every(x=>x===0),'EFFECTS_ESCALATION');
 return p;
}
export function triageCultureOffer(packet,feed,planId){
 const p=checkCultureOffer(packet),index=validatePublicAttention(feed);
 fail(typeof planId==='string','PLAN_SELECTION_REQUIRED');
 const matches=index.entries.filter(e=>e.id===planId);
 fail(matches.length===1,'PLAN_ABSENT_OR_DUPLICATE');
 const plan=matches[0];
 fail(plan.executionAllowed===false&&plan.fieldOutcome==='NOT_VERIFIED'&&plan.thirdPartyApproval==='NOT_ESTABLISHED',
  'PLAN_AUTHORITY_CHANGED');
 // Do not claim an actual fit, even when the operator names an existing plan.
 const body={schema:'planz.culture-return-triage/v1',
  culturePacket:p.identity,planId:plan.id,planSource:plan.source,
  indexEdition:index.edition,selection:'OPERATOR_DEFINED_PLAN_POINTER',
  relation:'POSSIBLE_METHOD_REUSE_NOT_VERIFIED_FIT',
  ownerGate:plan.nextGate,blockedBy:[...plan.blockedBy],
  disposition:'HOLD_FOR_PLAN_OWNER_REVIEW',sourceOwnerApproved:false,
  planUpdated:false,fieldVerified:false,thirdPartyApproved:false,executionAllowed:false,
  networkSent:false,authority:'NONE'};
 return {...body,triageId:'sha256:'+createHash('sha256').update(JSON.stringify(body)).digest('hex')};
}
