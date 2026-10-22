#!/usr/bin/env python3
"""CIRCULATION-001 planZ receiver: native Free Graph -> two independent, synthetic replies.
No human authentication, donor execution, automatic matching or publication.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

SCHEMA = "planz.circulation-return/v0"
OFFER_SCHEMA = "planz.circulation-offer-set/v0"
REPLIES_SCHEMA = "cannon.circulation-simulated-replies/v0"
REPO = re.compile(r"^the-static-collective/[a-zA-Z0-9._-]+$")
LANES = {"care", "culture"}
CHOICES = {"HOLD", "DECLINE", "PROPOSE_FURTHER_REVIEW"}

class Refused(ValueError):
    pass

def must(ok, why):
    if not ok:
        raise Refused("CIRCULATION_REFUSED: " + why)

def digest(domain, obj):
    raw = json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    return "sha256:" + hashlib.sha256(domain.encode() + raw).hexdigest()

def read(path):
    p = Path(path)
    must(p.is_file() and 0 < p.stat().st_size < 1000000, "bounded JSON input required")
    return json.loads(p.read_text("utf8"))

def native_fg(core_path):
    p = Path(core_path).resolve()
    must(p.name == "fg_core.py" and p.is_file(), "native Free Graph source required")
    spec = importlib.util.spec_from_file_location("circulation_native_fg", p)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def shape(obj, keys):
    must(isinstance(obj, dict) and set(obj) == set(keys), "unexpected or missing field")

def examine(graph, fg):
    must(isinstance(graph, dict) and graph.get("schema") == fg.SCHEMA, "wrong graph")
    must(not fg.validate_packet(graph) and graph.get("packet_id") == fg.packet_id(graph),
         "native Free Graph validation or hash failed")
    ex = graph.get("extensions", {})
    must(ex == {"origin": "cannon.circulation001", "synthetic_only": True,
                "circulation_fixture": True}, "non-fixture packet rejected")
    must(graph.get("modes") == ["seed"], "not a seed-only packet")
    must(all(s["source_class"] == "conversation-witness" and s["authority"] == "none"
             and s["access"] == "public" and s["export"] == "portable"
             and s.get("excerpt", "").startswith("FICTIONAL:")
             for s in graph["sources"]), "unreviewed data or source authority")
    nodes = graph["nodes"]
    must(len(nodes) == 5, "exactly one seed, two invitations and two receiver addresses")
    seeds = [n for n in nodes if n.get("extensions", {}).get("circulation_role") == "seed"]
    invitations = [n for n in nodes if n.get("extensions", {}).get("circulation_role") == "invitation"]
    worlds = [n for n in nodes if n.get("extensions", {}).get("circulation_role") == "receiver-address-only"]
    must(len(seeds) == 1 and len(invitations) == 2 and len(worlds) == 2, "roles not bounded")
    seed = seeds[0]
    must(seed["kind"] == "question" and seed["status"] == "proposed", "seed isn't a question")
    byworld = {n["label"]: n for n in worlds}
    must(len(byworld) == 2 and all(REPO.fullmatch(w) for w in byworld), "bad receivers")
    must(all(n["kind"] == "world" and n["status"] == "observed"
             and set(n.get("extensions", {})) == {"circulation_role"}
             for n in worlds), "address-only receivers must not assert participation")
    must(len(graph["links"]) == 4 and all(
         l["verb"] == "connects" and l["status"] == "proposed" and l["authority"] == "none"
         for l in graph["links"]), "links carry unintended authority")
    edge = {(l["from"], l["to"]) for l in graph["links"]}
    must(len(edge) == 4, "duplicate proposed links")
    seen = set()
    for n in invitations:
        ex = n.get("extensions", {})
        must(set(ex) == {"circulation_role", "destination", "lane", "origin_seed"},
             "unrecognized invitation fields")
        dest, lane = ex["destination"], ex["lane"]
        must(dest in byworld and lane in LANES and lane not in seen,
             "bad destination or CARE/CULTURE duplication")
        seen.add(lane)
        must(ex["origin_seed"] == seed["id"]
             and n["kind"] == "question" and n["status"] == "proposed",
             "invitation must refer to this seed")
        must((seed["id"], n["id"]) in edge and (n["id"], byworld[dest]["id"]) in edge,
             "two exact links required per independent invitation")
    return seed, sorted(invitations, key=lambda n: n["extensions"]["destination"])

def compile_offers(graph, fg):
    seed, invitations = examine(graph, fg)
    offers = []
    for n in invitations:
        ex = n["extensions"]
        body = {"destination": ex["destination"], "lane": ex["lane"],
                "graph_invitation_node": n["id"], "seed_node": seed["id"],
                "question": n["label"], "status": "PROPOSED_ONLY",
                "owner_response": "NONE", "authorized_execution": False,
                "publication": False, "gate": "RECIPIENT_PROJECT_OWNER_EXPLICIT_REVIEW"}
        offers.append({"id": digest("CIRCULATION001-OFFER|", body), **body})
    packet = {"schema": OFFER_SCHEMA, "graph_packet_id": graph["packet_id"],
              "seed_node": seed["id"], "offers": offers,
              "selection": "NO_AUTOMATIC_RECIPIENT_ADMISSION", "execution": "NONE",
              "real_human_permissions": "NOT_COLLECTED"}
    return {"id": digest("CIRCULATION001-SET|", packet), **packet}

def compile_return(offer_set, replies):
    shape(replies, ["schema", "fictional", "decisions"])
    must(replies["schema"] == REPLIES_SCHEMA and replies["fictional"] is True,
         "only simulated responses")
    decisions = replies["decisions"]
    must(isinstance(decisions, list) and len(decisions) == 2, "two independently keyed replies")
    actual = {}
    for d in decisions:
        shape(d, ["destination", "choice"])
        must(isinstance(d["destination"], str) and d["destination"] not in actual,
             "duplicate response or invalid destination")
        must(d["choice"] in CHOICES, "forged or unauthorized disposition")
        actual[d["destination"]] = d["choice"]
    offered = {o["destination"]: o for o in offer_set["offers"]}
    must(set(actual) == set(offered), "responses must target both named receivers")
    receipts = []
    for dest in sorted(offered):
        o = offered[dest]
        body = {"destination": dest, "lane": o["lane"], "offer_id": o["id"],
                "choice": actual[dest], "evidence_class": "FICTIONAL_SIMULATION_ONLY",
                "owner_authentication": "NONE", "owner_admission": False,
                "physical_act": False, "care_confirmation": False,
                "creative_license": False, "publication": False}
        receipts.append({"id": digest("CIRCULATION001-REPLY|", body), **body})
    body = {"schema": SCHEMA, "source_offer_set_id": offer_set["id"],
            "source_graph_packet_id": offer_set["graph_packet_id"],
            "receipts": receipts,
            "no_human_authority_inferred": True,
            "no_source_history_rewritten": True,
            "cross_current_authority": "NONE",
            "return_status": "INSPECTABLE_SYNTHETIC_ONLY"}
    return {"id": digest("CIRCULATION001-RETURN|", body), **body}

def compose(graph, replies, fg):
    offers = compile_offers(graph, fg)
    ret = compile_return(offers, replies)
    body = {"schema": "cannon-planz.circulation-artifact/v0",
            "graph_packet_id": graph["packet_id"], "offer_set": offers,
            "return": ret, "authority": "NONE", "field_proof": False,
            "synthetic_only": True}
    return {"id": digest("CIRCULATION001-ARTIFACT|", body), **body}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("operation", choices=["run", "verify"])
    ap.add_argument("--graph", type=Path, required=True)
    ap.add_argument("--replies", type=Path, required=True)
    ap.add_argument("--free-graph-core", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    a = ap.parse_args()
    try:
        expected = compose(read(a.graph), read(a.replies), native_fg(a.free_graph_core))
        if a.operation == "run":
            with a.output.open("x", encoding="utf8") as f:
                json.dump(expected, f, ensure_ascii=False, sort_keys=True, indent=2)
                f.write("\n")
        else:
            must(read(a.output) == expected, "cold replay output changed or was tampered")
        print(json.dumps({"result": "PASS_SYNTHETIC_ONLY", "digest": expected["id"],
                          "independent_responses": len(expected["return"]["receipts"]),
                          "source_graph_intact": True, "owner_authority": "NONE"}))
        return 0
    except (Refused, ValueError, KeyError, TypeError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
