#!/usr/bin/env python3
"""RELAY-001 planZ: Free Graph history -> bounded, non-executable next-task offer.
Read-only. No remote work, canon selection, owner gate, or consent is implied.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

SCHEMA = "planz/relay-mission-offer/v0"
DOMAIN = "planz-RelayMissionOffer-v0|"
PREVIOUS = ["LOADOUT","GHoT","reLATTE","webZ","SIA","free-graph"]
SOURCE_SHA = "sha256:6ae3a6916c6214f7582da048246596d36a6cf355effe1dd68c47d685fef3acc6"
MISSION = "relay-001-blue-night-morning-bloom"
PROFILE = {
 "the-haunted-toaster": {
   "rank":0, "task":"Compose six visual candidates from the archived original song",
   "input_fit":"Finished local MP3 with source digest is available",
   "output":"Six-up candidate family and source-linked proposal receipts",
   "gate":"HUMAN_KEEP_OR_SCRAPE_BEFORE_RENDER",
   "repo":"the-static-collective/the-haunted-toaster",
   "readme_blob":"335cd41bcff367ae3369f62e8c57d25c99ec9278",
   "capability":"Song-to-six-up; human KEEP/SCRAPE owns continuation"},
 "autodiscography-vault": {
   "rank":1, "task":"Plan one source-acquisition witness if a permitted WAV becomes available",
   "input_fit":"Existing MP3 cannot be relabeled a provider WAV",
   "output":"Single-track preservation candidate receipt, conditional on genuine WAV",
   "gate":"USER_PROVIDER_WAV_ACTION_AND_LOCAL_ADMISSION",
   "repo":"the-static-collective/autodiscography-vault",
   "readme_blob":"1c81a08f0690cd5f8e7d849f87af446959f5492b",
   "capability":"One full-song WAV pilot; not bulk acquisition"},
 "lemonPRESS": {
   "rank":2, "task":"Prepare an editorial listening-room proof with links and source references",
   "input_fit":"Song references and provenance available; editorial admission not given",
   "output":"Unpublished digital and print editorial candidate",
   "gate":"PRESS_OWNER_LOCAL_ADMISSION_BEFORE_PUBLICATION",
   "repo":"the-static-collective/lemonPRESS",
   "readme_blob":"6ec65b26ff97e3d917960770cffbea7595376b97",
   "capability":"Multibranch publication with distinct proof and admission"}
}

class PlanError(ValueError): pass
def check(ok,reason):
 if not ok: raise PlanError(reason)
def enc(v):
 return json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(",",":")).encode()
def sha(b): return "sha256:"+hashlib.sha256(b).hexdigest()
def read(path):
 p=Path(path)
 check(p.is_file() and p.stat().st_size<=2_000_000,"INVALID_INPUT_FILE")
 return json.loads(p.read_text("utf8"))
def get_fg(path):
 p=Path(path).resolve()
 check(p.is_file() and p.name=="fg_core.py","NATIVE_FREE_GRAPH_REQUIRED")
 spec=importlib.util.spec_from_file_location("free_graph_native_planz",p)
 module=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(module)
 return module

def census(graph,fg):
 check(graph.get("schema")=="free-graph.packet/v0" and not fg.validate_packet(graph)
       and graph.get("packet_id")==fg.packet_id(graph),"FREE_GRAPH_INVALID")
 ex=graph.get("extensions",{})
 check(ex.get("mission_id")==MISSION and ex.get("source_system")=="SIA"
       and ex.get("exact_local_evidence_bytes_checked") is True
       and ex.get("owner_admission") is False
       and ex.get("verified_upstream_signatures_here") is False,
       "HISTORICAL_EVIDENCE_BOUNDARY_INVALID")
 check(ex.get("source_media_sha256")==SOURCE_SHA,"WRONG_SOURCE_PARTICULAR")
 observed=[n for n in graph["nodes"] if n["status"]=="observed"]
 check(any(n["label"]=="Blue Night Morning Bloom · source" for n in observed),"MISSING_SOURCE_NODE")
 for i,organ in enumerate(PREVIOUS[:5],1):
  check(any(n["label"].startswith(f"{i:02d} · {organ} ·") and n["status"]=="observed"
            for n in observed),"MISSING_HISTORICAL_STAGE")
 proposed={}
 for node in graph["nodes"]:
  if node["status"]!="proposed":continue
  suffix=" · unexecuted invitation"
  check(node["kind"]=="question" and node["label"].endswith(suffix),"INVALID_INVITATION")
  name=node["label"][:-len(suffix)]
  check(name not in proposed,"DUPLICATE_INVITATION")
  check(node.get("extensions",{}).get("execution")=="not attempted","FALSE_EXECUTION_TAG")
  proposed[name]=node
 check(len(proposed)==34 and "free-graph" in proposed and "planZ" in proposed,
       "HISTORICAL_CENSUS_MISMATCH")
 check(all(name in proposed for name in PROFILE),"MISSING_OPTION_PROFILE")
 outstanding={name:node for name,node in proposed.items() if name not in ("free-graph","planZ")}
 check(len(outstanding)==32,"CURRENT_CENSUS_MISMATCH")
 return outstanding

def compile_mission(graph_path,free_graph_core):
 fg=get_fg(free_graph_core)
 graph=read(graph_path)
 remaining=census(graph,fg)
 shortlist=[]
 for name,profile in sorted(PROFILE.items(),key=lambda x:x[1]["rank"]):
  node=remaining[name]
  shortlist.append({
   "candidate":name,"graph_node_id":node["id"],"lane":node["extensions"]["lane"],
   "rank":profile["rank"]+1,"task":profile["task"],
   "input_fit":profile["input_fit"],"expected_proposal_output":profile["output"],
   "required_owner_gate":profile["gate"],
   "project_readme_reference":{"repository":profile["repo"],"git_blob_sha":profile["readme_blob"]},
   "capability_claim_from_readme":profile["capability"],
   "status":"PROPOSED_NOT_EXECUTED","availability":"NOT_RUNTIME_CHECKED",
   "execution_authorized":False,"canon_selected":False})
 remaining_list=[{"project":name,"node_id":node["id"],"lane":node["extensions"]["lane"],
                  "status":"PROPOSED_NOT_EXECUTED"} for name,node in sorted(remaining.items())]
 body={
  "schema":SCHEMA,"mission":MISSION,"source_particular_sha256":SOURCE_SHA,
  "upstream_graph_id":graph["packet_id"],"input_evidence_class":"graph-historical-projection",
  "local_observation":{"organ":"planZ","event":"MISSION_COMPILED","sequence":7,
                       "has_run":True,"creates_project_local_effect":False,
                       "source_history_rewritten":False},
  "census":{"planned_total":39,"executed_project_labels":PREVIOUS+["planZ"],
            "observed_upstream_executed":6,"now_locally_compiled":7,"still_proposed":32,
            "historical_graph_invitation_count":34,
            "prior_graph_already_marked_free_graph_proposed":True},
  "selection_policy":{"scope":"Ranked by immediate source fit and declared README capability; not live availability",
                      "selection":"editorial task proposal only","next_offer":"the-haunted-toaster",
                      "owner_will_decide_keep_scrape":True,"auto_execution":False},
  "shortlist":shortlist,"remaining_invitation_inventory":remaining_list,
  "required_next_gate":{"world":"the-haunted-toaster","capability":"compose six candidates",
       "source_bytes":"locally verify source_particular_sha256 before touching media",
       "owner_authorization":"fresh explicit local continuation choice; plan is not KEEP",
       "operations":"read-only preparation until separately permitted",
       "publication":False,"render_authorized":False},
  "invariants":["SOURCE_LINK != SOURCE_AUTHENTICATION","GRAPH_REACHABILITY != AUTHORITY",
                "PLAN != APPROVAL","PROPOSAL != EXECUTION","KEEP != PUBLICATION",
                "MAIN != CANON","HISTORICAL_SNAPSHOT_IS_NOT_REWRITTEN"],
  "no_remote_call":True,"no_audio_embedded":True,"no_git_merge":True,"no_canon_admission":True}
 return {"id":sha(DOMAIN.encode()+enc(body)),**body}

def verify_offer(offer,graph,free_graph_core):
 check(offer.get("schema")==SCHEMA,"WRONG_OFFER_SCHEMA")
 check(offer.get("id")==sha(DOMAIN.encode()+enc({k:v for k,v in offer.items() if k!="id"})),
       "PLAN_ID_DRIFT")
 check(offer==compile_mission(graph,free_graph_core),"MISSION_OFFER_DIVERGES_FROM_GRAPH")
 return True

def main():
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument("--graph",required=True,type=Path)
 ap.add_argument("--free-graph-core",required=True,type=Path)
 ap.add_argument("--output",required=True,type=Path)
 a=ap.parse_args()
 try:
  result=compile_mission(a.graph,a.free_graph_core)
  verify_offer(result,a.graph,a.free_graph_core)
  a.output.parent.mkdir(parents=True,exist_ok=True)
  a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+"\n")
  print(json.dumps({"offer_id":result["id"],"executed_organs":7,
                    "remaining":32,"proposed_next":"the-haunted-toaster",
                    "authority_granted":False},indent=2))
  return 0
 except (PlanError,OSError,ValueError,KeyError,TypeError) as error:
  print("PLANZ HOLD: "+str(error),file=sys.stderr)
  return 1
if __name__=="__main__":raise SystemExit(main())
