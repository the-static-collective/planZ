#!/usr/bin/env python3
"""DUAL-BODY-001: offline, consent-first compatibility and deterministic test-byte probe.

No network, device enumeration, MAC/IP/serials, microphone access, key access,
actual reLATTE signing, hardware attestation or remote operation.
Requires Python 3.8+; depends only on the standard library.
"""
import argparse
import hashlib
import json
import os
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path

SCHEMA = "planz.dual-body-capability/v0"
TEST_BYTES = (b"STATIC-DUAL-BODY-001\n"
              b"Public synthetic artifact for deliberate offline transfer only.\n"
              b"No credentials, location, sensor reading or signature.\n")
TEST_HASH = hashlib.sha256(TEST_BYTES).hexdigest()
MAX_INPUT = 16384
ALIAS = re.compile(r"^[A-Za-z0-9_-]{1,32}$")


class Refuse(ValueError):
    pass


def node_major():
    """Inspect only an existing Node CLI version, not an installed-app census."""
    executable = shutil.which("node")
    if not executable:
        return None
    try:
        proc = subprocess.run([executable, "--version"], capture_output=True,
                              timeout=3, check=False, text=True)
    except (OSError, subprocess.TimeoutExpired):
        return None
    match = re.fullmatch(r"v([0-9]+)(?:\.[0-9]+){1,2}", proc.stdout.strip()[:50])
    return int(match.group(1)) if proc.returncode == 0 and match else None


def probe(alias):
    if not ALIAS.fullmatch(alias):
        raise Refuse("alias must be 1-32 characters: letters, digits, underscore, hyphen")
    py = [sys.version_info.major, sys.version_info.minor, sys.version_info.micro]
    node = node_major()
    return {
        "schema": SCHEMA, "alias": alias,
        "os_family": platform.system() or "UNKNOWN",
        "architecture": platform.machine() or "UNKNOWN",
        "python_version": py, "node_major": node,
        "python_312_plus": py[:2] >= [3, 12],
        "node_22_plus": node is not None and node >= 22,
        "node_24_plus": node is not None and node >= 24,
        "source": "UNATTESTED_LOCAL_VERSION_PROBE",
        "boot_verified": False,
        "audio_verified": False,
        "lan_verified": False,
        "native_relatte_verified": False,
        "external_effects": "NONE"
    }


def make_test(path):
    out = Path(path)
    try:
        with out.open("xb") as f:
            f.write(TEST_BYTES)
    except FileExistsError as exc:
        raise Refuse("test file already exists; refuse overwrite") from exc
    except OSError as exc:
        raise Refuse("test file could not be created") from exc
    return {"status": "CREATED_LOCAL_TEST_BYTES", "byte_count": len(TEST_BYTES),
            "sha256": TEST_HASH, "signature_verified": False, "transport_witness": False,
            "file": str(out)}


def verify_test(path):
    try:
        with Path(path).open("rb") as f:
            raw = f.read(len(TEST_BYTES) + 1)
    except OSError as exc:
        raise Refuse("test file unavailable") from exc
    digest = hashlib.sha256(raw).hexdigest()
    exact = raw == TEST_BYTES
    return {"status": "EXACT_SYNTHETIC_BYTES" if exact else "REFUSED_CHANGED_TEST_BYTES",
            "byte_count": len(raw), "sha256": digest,
            "expected_sha256": TEST_HASH,
            "exact_match": exact,
            "signature_verified": False, "human_courier_witness": False,
            "native_relatte_verified": False,
            "receiver_admitted": False}


def read_profile(path):
    try:
        with Path(path).open("rb") as f:
            raw = f.read(MAX_INPUT + 1)
    except OSError as exc:
        raise Refuse("profile unavailable") from exc
    if not raw or len(raw) > MAX_INPUT:
        raise Refuse("profile size invalid")
    try:
        data = json.loads(raw)
    except (ValueError, UnicodeError) as exc:
        raise Refuse("invalid profile JSON") from exc
    keys = {"schema","alias","os_family","architecture","python_version",
            "node_major","python_312_plus","node_22_plus","node_24_plus","source",
            "boot_verified","audio_verified","lan_verified",
            "native_relatte_verified","external_effects"}
    if type(data) is not dict or set(data) != keys or data["schema"] != SCHEMA:
        raise Refuse("unknown profile contract")
    if not isinstance(data["alias"], str) or not ALIAS.fullmatch(data["alias"]):
        raise Refuse("malformed profile alias")
    if data["source"] != "UNATTESTED_LOCAL_VERSION_PROBE" or data["external_effects"] != "NONE":
        raise Refuse("profile is not a local-only declared probe")
    py = data["python_version"]
    node = data["node_major"]
    if (type(py) is not list or len(py) != 3 or
        any(type(v) is not int or v < 0 or v > 999 for v in py) or
        (node is not None and (type(node) is not int or not 0 <= node <= 999))):
        raise Refuse("invalid toolchain version")
    for key in ("python_312_plus","node_22_plus","node_24_plus",
                "boot_verified","audio_verified","lan_verified",
                "native_relatte_verified"):
        if type(data[key]) is not bool:
            raise Refuse("malformed toolchain claim")
    if (data["python_312_plus"] != (py[:2] >= [3,12]) or
        data["node_22_plus"] != (node is not None and node >= 22) or
        data["node_24_plus"] != (node is not None and node >= 24)):
        raise Refuse("internally contradictory toolchain claim")
    if any(data[key] for key in ("boot_verified","audio_verified","lan_verified","native_relatte_verified")):
        raise Refuse("probe cannot elevate physical or native signing proof")
    return data


def compare(a, b):
    if a["alias"] == b["alias"]:
        raise Refuse("two machine aliases must be distinct; alias is not physical attestation")
    return {
        "schema": "planz.dual-body-compatibility-report/v0",
        "candidate_aliases": [a["alias"], b["alias"]],
        "same_os_family_declared": a["os_family"] == b["os_family"],
        "python_host_ci_environment_candidate": a["python_312_plus"] and b["python_312_plus"],
        "node_transport_documented_min_candidate": a["node_22_plus"] and b["node_22_plus"],
        "node_host_ci_environment_candidate": a["node_24_plus"] and b["node_24_plus"],
        "physical_two_host_witness": False,
        "native_relatte_cross_host_verified": False,
        "status": "ENVIRONMENT_DECLARATIONS_ONLY",
        "next_gate": "HUMAN_P0_INDEPENDENT_BOOT_AND_P2_TEST_FILE_COURIER"
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("probe", help="show coarse local toolchain only")
    p.add_argument("--alias", required=True)
    p = sub.add_parser("make-test", help="write one harmless create-only public specimen")
    p.add_argument("--out", required=True)
    p = sub.add_parser("verify-test", help="verify exact public specimen (NOT a signature)")
    p.add_argument("--path", required=True)
    p = sub.add_parser("compare", help="compare two local coarse JSON profiles")
    p.add_argument("--a", required=True)
    p.add_argument("--b", required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "probe":
            result = probe(args.alias)
        elif args.command == "make-test":
            result = make_test(args.out)
        elif args.command == "verify-test":
            result = verify_test(args.path)
        else:
            result = compare(read_profile(args.a), read_profile(args.b))
        print(json.dumps(result, sort_keys=True, indent=2))
        return 0 if result.get("status") != "REFUSED_CHANGED_TEST_BYTES" else 2
    except Refuse as exc:
        print(json.dumps({"status": "HOLD", "reason": str(exc)}, sort_keys=True),
              file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
