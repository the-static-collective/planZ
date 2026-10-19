import {checkBoard,sha256Text,localSelection} from "./engine.mjs";
const boardElement=document.querySelector("#cards");
const tabs=document.querySelector("#tabs");
const details=document.querySelector("#details");
const daily=document.querySelector("#daily");
const summary=document.querySelector("#summary");
const response=await fetch("./board.json");
const raw=await response.text();
const board=JSON.parse(raw);
checkBoard(board);
const digest=await sha256Text(raw);
const escapeHtml=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let selectedLane="ALL";
function draw(){
  tabs.innerHTML=["ALL",...board.lanes].map(x=>'<button data-lane="'+x+'" aria-pressed="'+(x===selectedLane)+'">'+x+'</button>').join("");
  const shown=board.records.filter(r=>selectedLane==="ALL"||r.lane===selectedLane);
  summary.textContent=shown.length+" entries · snapshot "+board.as_of+" · NOT LIVE";
  boardElement.innerHTML=shown.map(r=>'<article class="card"><p class="tag">'+r.lane+" / "+r.phase+'</p><h3>'+escapeHtml(r.title)+'</h3><p>'+escapeHtml(r.next)+'</p><button data-open="'+r.id+'">Inspect source / decide</button></article>').join("")||"<p>No observed cards in this lane.</p>";
}
function openCard(id){
  const r=board.records.find(x=>x.id===id);if(!r)return;
  details.hidden=false;
  details.innerHTML='<h2>'+escapeHtml(r.title)+'</h2><p class="gate">'+escapeHtml(r.next)+'</p><p><a href="'+r.source+'" target="_blank" rel="noopener">Owning source ↗</a></p><p>Human choice can be saved locally. No work is executed.</p><button id="choose">Select for review</button><button id="hold">Hold locally</button><button id="decline">Decline locally</button>';
  details.scrollIntoView({behavior:"smooth"});
  for(const [button,decision] of [["choose","SELECT_FOR_REVIEW"],["hold","HOLD_LOCALLY"],["decline","DECLINE_LOCALLY"]]){
    details.querySelector("#"+button).onclick=()=>save(r,decision);
  }
}
