import copy
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("planz_relay",ROOT/"scripts/relay001_planz.py")
P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)
FG=Path(os.environ["FREE_GRAPH_CORE"])
NATIVE=P.get_fg(FG)
NAMES=[
 "autodiscography-vault","the-haunted-phonography","black-star","freeport",
 "ALEX.2","3rdi","Dogram","national-treasure","free-graph","MEMENTO","corpus-os","the-daily-slice",
 "planZ","CANNON","project0","static-os","static-workbench","tranchnode",
 "the-haunted-toaster","the-haunted-blender","playdeck","ROroomOM","STORYSHIP","fogGlass",
 "lemonPRESS","static-live","GOATnote","static-field","GrO","BananaSpork","Jubilee-Engine-VM",
 "idea-grove","King-sCup","Jubilee-Campfire"
]

def synthetic_graph():
 """Native valid FG packet, but contains NO user source bytes or genuine receipts."""
 src={"id":"tmp","source_class":"project-source","authority":"source-local",
      "locator":{"system":"synthetic-test","coordinate":"unit-fixture","revision":"v0","resolution":"exact"},
      "digest":P.sha(b"synthetic"),"access":"restricted","export":"pointer-only",
      "redaction":"synthetic only"}
 src["id"]=NATIVE.record_id("source",src)
 nodes=[{"id":"song","kind":"artifact","label":"Blue Night Morning Bloom · source",
         "status":"observed","source_ids":[src["id"]]}]
 status=["BOUND","EXECUTED","RECEIVED_HELD","OBSERVED","INDEXED"]
 for i,name in enumerate(P.PREVIOUS[:5],1):
  nodes.append({"id":"stage-"+str(i),"kind":"artifact",
                "label":f"{i:02d} · {name} · {status[i-1]}",
                "status":"observed","source_ids":[src["id"]]})
 for i,name in enumerate(NAMES):
  nodes.append({"id":"candidate-"+str(i),"kind":"question",
                "label":name+" · unexecuted invitation",
                "status":"proposed","source_ids":[src["id"]],
                "extensions":{"lane":"test","execution":"not attempted"}})
 ids={}
 for n in nodes:
  old=n["id"];n["id"]=NATIVE.record_id("node",n);ids[old]=n["id"]
 links=[]
 def relation(frm,to,verb,status):
  v={"id":"temp","from":ids[frm],"to":ids[to],"verb":verb,
     "qualifier":"synthetic provenance / not a grant","status":status,
     "source_ids":[src["id"]],"authority":"none"}
  v["id"]=NATIVE.record_id("link",v);links.append(v)
 for i in range(1,6):relation("stage-"+str(i),"song","connects","observed")
 for i in range(34):relation("song","candidate-"+str(i),"connects","proposed")
 for i in range(2,6):relation("stage-"+str(i),"stage-"+str(i-1),"descends-from","observed")
 packet={"schema":"free-graph.packet/v0","purpose":"synthetic six-organ history test",
         "modes":["seed"],"scope":{"task":"synthetic","worlds":P.PREVIOUS},
         "task_world_cut":{"status":"sufficient","selected_ids":[ids["song"]],
                           "owner_head_source_ids":[],"omitted":[],"rationale":"test only"},
         "sources":[src],"nodes":nodes,"links":links,
         "residual_fog":[],"non_imports":[],
         "extensions":{"mission_id":P.MISSION,"source_system":"SIA",
             "exact_local_evidence_bytes_checked":True,"owner_admission":False,
             "verified_upstream_signatures_here":False,"source_media_sha256":P.SOURCE_SHA,
             "fixture_note":"synthetic graph has no real song media or receipts"}}
 packet["packet_id"]=NATIVE.packet_id(packet)
 assert not NATIVE.validate_packet(packet)
 return packet

class TestPlanZ(unittest.TestCase):
 def setUp(self):
  t=tempfile.TemporaryDirectory();self.addCleanup(t.cleanup)
  self.file=Path(t.name)/"synthetic.json"
  self.put(synthetic_graph())
 def put(self,value):self.file.write_text(json.dumps(value)+"\n")
 def compile(self):return P.compile_mission(self.file,FG)
 def test_native_graph_compiles_and_replays(self):
  a=self.compile();self.assertEqual(a,self.compile())
  self.assertTrue(P.verify_offer(a,self.file,FG))
  self.assertEqual(a["census"]["now_locally_compiled"],7)
  self.assertEqual(a["census"]["still_proposed"],32)
  self.assertEqual(len(a["remaining_invitation_inventory"]),32)
  self.assertEqual([x["candidate"] for x in a["shortlist"]],
                   ["the-haunted-toaster","autodiscography-vault","lemonPRESS"])
  self.assertFalse(a["selection_policy"]["auto_execution"])
  self.assertFalse(a["required_next_gate"]["render_authorized"])
 def test_owner_admission_forgery(self):
  g=json.loads(self.file.read_text());g["extensions"]["owner_admission"]=True
  g["packet_id"]=NATIVE.packet_id(g);self.put(g)
  with self.assertRaisesRegex(P.PlanError,"HISTORICAL_EVIDENCE_BOUNDARY_INVALID"):self.compile()
 def test_false_audio_identity(self):
  g=json.loads(self.file.read_text());g["extensions"]["source_media_sha256"]="sha256:"+"0"*64
  g["packet_id"]=NATIVE.packet_id(g);self.put(g)
  with self.assertRaisesRegex(P.PlanError,"WRONG_SOURCE_PARTICULAR"):self.compile()
 def test_changed_history(self):
  g=json.loads(self.file.read_text());g["nodes"][0]["label"]="Invented song";self.put(g)
  with self.assertRaisesRegex(P.PlanError,"FREE_GRAPH_INVALID"):self.compile()
 def test_refuses_rehashed_alternative_pretending_to_be_selected(self):
  o=self.compile();o["selection_policy"]["next_offer"]="lemonPRESS"
  o["id"]=P.sha(P.DOMAIN.encode()+P.enc({k:v for k,v in o.items() if k!="id"}))
  with self.assertRaisesRegex(P.PlanError,"MISSION_OFFER_DIVERGES_FROM_GRAPH"):
   P.verify_offer(o,self.file,FG)
 def test_refuses_forged_execution_consent(self):
  o=self.compile();o["shortlist"][0]["execution_authorized"]=True
  o["id"]=P.sha(P.DOMAIN.encode()+P.enc({k:v for k,v in o.items() if k!="id"}))
  with self.assertRaisesRegex(P.PlanError,"MISSION_OFFER_DIVERGES_FROM_GRAPH"):
   P.verify_offer(o,self.file,FG)
 def test_source_packet_is_unchanged(self):
  before=self.file.read_bytes();self.compile();self.assertEqual(before,self.file.read_bytes())
if __name__=="__main__":unittest.main()
