"""Offline adversarial checks for planZ DUAL-BODY-001. No hardware or network."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("dual-body-compat.py")
SPEC = importlib.util.spec_from_file_location("dual_body_compat", SCRIPT)
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


class DualBodyCompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_probe_is_minimal_and_claims_no_machine_verification(self):
        profile = module.probe("BODY-A")
        self.assertEqual(profile["schema"], module.SCHEMA)
        self.assertFalse(profile["boot_verified"])
        self.assertFalse(profile["native_relatte_verified"])
        self.assertFalse(profile["audio_verified"])
        self.assertFalse(profile["lan_verified"])
        for key in ("hostname","username","ip","mac","serial","files","location"):
            self.assertNotIn(key, profile)

    def test_alias_validation_refuses_identity_injection(self):
        for alias in ("", "a b", "../../etc", "a@example.com", "z"*33):
            with self.subTest(alias=alias), self.assertRaises(module.Refuse):
                module.probe(alias)

    def test_test_bytes_roundtrip_cannot_prove_source_signature(self):
        path = self.root/"courier.bin"
        created = module.make_test(path)
        verified = module.verify_test(path)
        self.assertEqual(created["sha256"], verified["sha256"])
        self.assertEqual(created["byte_count"], verified["byte_count"])
        self.assertTrue(verified["exact_match"])
        self.assertFalse(verified["signature_verified"])
        self.assertFalse(verified["native_relatte_verified"])
        self.assertFalse(verified["human_courier_witness"])

    def test_create_only_refuses_overwrite(self):
        path = self.root/"courier.bin"
        module.make_test(path)
        with self.assertRaises(module.Refuse):
            module.make_test(path)

    def test_one_changed_byte_refuses(self):
        path = self.root/"courier.bin"
        module.make_test(path)
        data = bytearray(path.read_bytes())
        data[5] ^= 1
        path.write_bytes(data)
        result = module.verify_test(path)
        self.assertEqual(result["status"], "REFUSED_CHANGED_TEST_BYTES")
        self.assertFalse(result["exact_match"])

    def test_extra_bytes_do_not_pass(self):
        path = self.root/"courier.bin"
        path.write_bytes(module.TEST_BYTES + b"extra")
        self.assertFalse(module.verify_test(path)["exact_match"])

    def test_missing_file_is_a_refusal(self):
        with self.assertRaises(module.Refuse):
            module.verify_test(self.root/"nonexistent")

    def _profile(self, alias, node=24, py=(3,12,2)):
        result = module.probe(alias)
        result.update({
            "python_version": list(py), "node_major": node,
            "python_312_plus": list(py)[:2] >= [3,12],
            "node_22_plus": node is not None and node >= 22,
            "node_24_plus": node is not None and node >= 24
        })
        return result

    def _save(self, name, payload):
        path = self.root/name
        path.write_text(json.dumps(payload), encoding="utf-8")
        return path

    def test_two_declared_supported_toolchains_still_not_attestation(self):
        a = self._profile("BODY-A")
        b = self._profile("BODY-B")
        out = module.compare(a,b)
        self.assertTrue(out["python_host_ci_environment_candidate"])
        self.assertTrue(out["node_host_ci_environment_candidate"])
        self.assertFalse(out["physical_two_host_witness"])
        self.assertFalse(out["native_relatte_cross_host_verified"])

    def test_absent_toolchain_is_explicitly_not_compatible(self):
        a = self._profile("BODY-A")
        b = self._profile("BODY-B", node=None, py=(3,8,10))
        out = module.compare(a,b)
        self.assertFalse(out["python_host_ci_environment_candidate"])
        self.assertFalse(out["node_transport_documented_min_candidate"])

    def test_read_profiles_exact_shape(self):
        data = self._profile("BODY-A")
        self.assertEqual(module.read_profile(self._save("a.json",data)),data)

    def test_fake_native_verification_refused(self):
        data = self._profile("BODY-A")
        data["native_relatte_verified"] = True
        with self.assertRaises(module.Refuse):
            module.read_profile(self._save("a.json", data))

    def test_forged_boottime_claim_refused(self):
        data = self._profile("BODY-A")
        data["boot_verified"] = True
        with self.assertRaises(module.Refuse):
            module.read_profile(self._save("a.json", data))

    def test_contradictory_versions_refused(self):
        data = self._profile("BODY-A",node=21)
        data["node_24_plus"] = True
        with self.assertRaises(module.Refuse):
            module.read_profile(self._save("a.json", data))

    def test_unknown_sensitive_field_refused(self):
        data = self._profile("BODY-A")
        data["ip_address"] = "198.51.100.10"
        with self.assertRaises(module.Refuse):
            module.read_profile(self._save("a.json", data))

    def test_same_alias_refuses_fake_second_machine(self):
        a=self._profile("BODY-A")
        with self.assertRaises(module.Refuse):
            module.compare(a,a)

    def test_oversized_json_refused(self):
        p=self.root/"too-large.json"
        p.write_bytes(b"x"*(module.MAX_INPUT+1))
        with self.assertRaises(module.Refuse):
            module.read_profile(p)

    def test_node_probe_always_only_a_version(self):
        result=module.node_major()
        self.assertTrue(result is None or (isinstance(result,int) and result>=0))


if __name__=="__main__":
    unittest.main()
