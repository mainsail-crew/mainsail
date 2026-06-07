"""
Unit tests for cnc_metadata_extractor.

Run:
    python3 scripts/test_cnc_metadata_extractor.py

The tests are stdlib-only and exercise the extractor end-to-end against
fixture files in scripts/fixtures/.
"""

import json
import os
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import cnc_metadata_extractor as ext  # noqa: E402

FIXTURES = os.path.join(HERE, "fixtures")


class TestFusionDetection(unittest.TestCase):
    def test_fusion_mpcnc_full(self):
        path = os.path.join(FIXTURES, "fusion_mpcnc.gcode")
        head, tail = ext.read_head_and_tail(path)
        cam = ext.detect_cam(head, tail)
        self.assertIsNotNone(cam)
        self.assertEqual(cam["cam_tool"], "Fusion 360")
        self.assertEqual(cam.get("cam_tool_version"), "2702.1.58")
        self.assertEqual(cam.get("post_processor"), "MPCNC.cps")
        self.assertEqual(cam.get("document"), "pen plotter test v1")
        self.assertEqual(cam.get("setup"), "Setup2")
        with tempfile.TemporaryDirectory() as d:
            target = os.path.join(d, "fusion_mpcnc.gcode")
            with open(path) as src, open(target, "w") as dst:
                dst.write(src.read())
            rc = ext.process(target, force=True)
            self.assertEqual(rc, 0)
            sidecar = target + ".cnc-meta.json"
            self.assertTrue(os.path.isfile(sidecar))
            with open(sidecar) as f:
                meta = json.load(f)
            self.assertEqual(meta["schema_version"], 1)
            self.assertEqual(meta["cam_tool"], "Fusion 360")
            self.assertIn("work_envelope", meta)
            env = meta["work_envelope"]
            self.assertGreater(env["x_max"], env["x_min"])
            self.assertGreater(env["y_max"], env["y_min"])
            self.assertIn("tools", meta)
            self.assertGreaterEqual(len(meta["tools"]), 1)
            self.assertIn("spindle_rpm", meta)
            self.assertEqual(meta["spindle_rpm"], 5000.0)
            self.assertIn("feeds_mm_per_min", meta)
            self.assertIn("rapid", meta["feeds_mm_per_min"])
            self.assertEqual(meta["feeds_mm_per_min"]["rapid"], 99999.0)
            self.assertIn("operations", meta)
            self.assertGreaterEqual(len(meta["operations"]), 1)
            self.assertEqual(meta["feeds_mm_per_min"]["cut"], 1000.0)
            self.assertEqual(meta["feeds_mm_per_min"]["plunge"], 333.0)
            with open(target) as f:
                self.assertIn(ext.FOOTER_MARKER, f.read())

    def test_already_processed_skips(self):
        path = os.path.join(FIXTURES, "fusion_mpcnc.gcode")
        with tempfile.TemporaryDirectory() as d:
            target = os.path.join(d, "fusion_mpcnc.gcode")
            with open(path) as src, open(target, "w") as dst:
                dst.write(src.read())
            self.assertEqual(ext.process(target, force=True), 0)
            self.assertTrue(os.path.isfile(target + ".cnc-meta.json"))
            rc = ext.process(target)
            self.assertEqual(rc, 0)
            with open(target) as f:
                self.assertEqual(f.read().count(ext.FOOTER_MARKER), 1)

    def test_force_reprocess_does_not_duplicate_footer(self):
        path = os.path.join(FIXTURES, "fusion_mpcnc.gcode")
        with tempfile.TemporaryDirectory() as d:
            target = os.path.join(d, "fusion_mpcnc.gcode")
            with open(path) as src, open(target, "w") as dst:
                dst.write(src.read())
            self.assertEqual(ext.process(target, force=True), 0)
            self.assertEqual(ext.process(target, force=True), 0)
            with open(target) as f:
                self.assertEqual(f.read().count(ext.FOOTER_MARKER), 1)


class TestEstlCamDetection(unittest.TestCase):
    def test_estlcam(self):
        path = os.path.join(FIXTURES, "estlcam_basic.gcode")
        head, tail = ext.read_head_and_tail(path)
        cam = ext.detect_cam(head, tail)
        self.assertIsNotNone(cam)
        self.assertEqual(cam["cam_tool"], "EstlCam")
        with tempfile.TemporaryDirectory() as d:
            target = os.path.join(d, "estlcam.gcode")
            with open(path) as src, open(target, "w") as dst:
                dst.write(src.read())
            self.assertEqual(ext.process(target, force=True), 0)
            with open(target + ".cnc-meta.json") as f:
                meta = json.load(f)
            self.assertEqual(meta["cam_tool"], "EstlCam")
            self.assertIn("tools", meta)
            self.assertEqual(meta["feeds_mm_per_min"]["cut"], 500.0)
            self.assertEqual(meta["feeds_mm_per_min"]["plunge"], 100.0)


class TestGenericNoSidecar(unittest.TestCase):
    def test_generic_no_cam_signature(self):
        path = os.path.join(FIXTURES, "generic.gcode")
        with tempfile.TemporaryDirectory() as d:
            target = os.path.join(d, "generic.gcode")
            with open(path) as src, open(target, "w") as dst:
                dst.write(src.read())
            self.assertEqual(ext.process(target, force=True), 0)
            self.assertFalse(os.path.isfile(target + ".cnc-meta.json"))


class TestHelpers(unittest.TestCase):
    def test_sidecar_path(self):
        self.assertEqual(ext.sidecar_path_for("/tmp/foo.gcode"), "/tmp/foo.gcode.cnc-meta.json")

    def test_is_already_processed(self):
        with tempfile.NamedTemporaryFile("w", suffix=".gcode", delete=False) as f:
            f.write("G0 X0 Y0\nG1 X10 Y10\n" + ext.FOOTER_MARKER + "\n")
            path = f.name
        try:
            self.assertTrue(ext.is_already_processed(path))
        finally:
            os.unlink(path)

    def test_too_young(self):
        with tempfile.NamedTemporaryFile("w", suffix=".gcode", delete=False) as f:
            f.write("G0 X0 Y0\n")
            path = f.name
        try:
            self.assertTrue(ext.is_too_young(path))
        finally:
            os.unlink(path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
