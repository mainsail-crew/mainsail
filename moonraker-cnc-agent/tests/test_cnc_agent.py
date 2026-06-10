import asyncio
import copy
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.abspath(os.path.join(HERE, "..", "src"))
sys.path.insert(0, SRC)

from moonraker_cnc_agent.cnc_agent import CncAgent


def resolve(value):
    if asyncio.iscoroutine(value):
        return asyncio.run(value)
    return value


class FakeServer:
    def __init__(self, file_manager=None, register_endpoint_signature="path-method-handler"):
        self.file_manager = file_manager
        self.register_endpoint_signature = register_endpoint_signature
        self.event_handlers = {}
        self.endpoints = []
        self.klippy_apis = None

    def register_event_handler(self, name, handler):
        self.event_handlers[name] = handler

    def lookup_component(self, name):
        if name == "file_manager":
            if self.file_manager is None:
                raise KeyError(name)
            return self.file_manager
        if name == "klippy_apis" and self.klippy_apis is not None:
            return self.klippy_apis
        raise KeyError(name)

    def register_endpoint(self, *args, **kwargs):
        self.endpoints.append((args, kwargs))
        if self.register_endpoint_signature == "path-method-handler":
            if len(args) != 3:
                raise TypeError("expected path, method, handler")
            return None
        if self.register_endpoint_signature == "path-handler-methodkw":
            if len(args) != 2 or "method" not in kwargs:
                raise TypeError("expected path, handler, method=...")
            return None
        if self.register_endpoint_signature == "path-handler":
            if len(args) != 2:
                raise TypeError("expected path, handler")
            return None
        raise AssertionError(self.register_endpoint_signature)


class FakeFileManager:
    def __init__(self):
        self.processors = []

    def register_gcode_processor(self, name, config):
        self.processors.append((name, copy.deepcopy(config)))


class FakeKlippyApis:
    def __init__(self, wcs_state=None):
        self.scripts = []
        self._wcs_state = wcs_state

    async def run_gcode(self, script, default=None):
        self.scripts.append(script)
        return "ok"

    async def query_objects(self, objects, default=None):
        return {"work_coordinate_systems": self._wcs_state} if self._wcs_state else {}


class FakeConfig:
    def __init__(self, server, values=None):
        self._server = server
        self._values = values or {}

    def get_server(self):
        return self._server

    def get(self, key, default=None):
        return self._values.get(key, default)

    def getfloat(self, key, default=None):
        value = self._values.get(key, default)
        return float(value) if value is not None else default


class CncAgentTests(unittest.TestCase):
    def _make_server(self, file_manager=True, klippy_apis=True):
        fm = FakeFileManager() if file_manager else None
        server = FakeServer(fm)
        server.klippy_apis = FakeKlippyApis() if klippy_apis else None
        return server

    def test_component_init_registers_routes_and_klippy_ready_handler(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.component_init())

        self.assertIn("server:klippy_ready", server.event_handlers)
        registered_paths = [args[0] for args, _ in server.endpoints]
        self.assertIn("/server/cnc/state", registered_paths)
        self.assertIn("/server/cnc/spindle", registered_paths)
        self.assertIn("/server/cnc/coolant", registered_paths)
        self.assertIn("/server/cnc/units", registered_paths)
        self.assertIn("/server/cnc/wcs", registered_paths)
        self.assertIn("/server/cnc/settings", registered_paths)
        self.assertIn("/server/cnc/jog", registered_paths)

    def test_component_init_registers_routes_without_file_manager(self):
        server = self._make_server(file_manager=False)
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.component_init())

        self.assertGreater(len(server.endpoints), 0)
        registered_paths = [args[0] for args, _ in server.endpoints]
        self.assertIn("/server/cnc/state", registered_paths)

    def test_state_accessors_return_copies_and_support_updates(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        agent.set_spindle_state("cw", rpm=18000, override=0.75)
        agent.set_coolant_state(flood=True, mist=False)
        agent.set_units("G20")
        agent.set_active_wcs("G55", offsets={"X": 12.5, "Y": -2.0, "Z": 0.0})
        agent.update_settings({"theme": "dark", "show_grid": True})

        snapshot = agent.get_state()
        self.assertEqual(snapshot["spindle"]["state"], "cw")
        self.assertEqual(snapshot["spindle"].get("rpm"), 18000)
        self.assertTrue(snapshot["coolant"]["flood"])
        self.assertEqual(snapshot["units"], "G20")
        self.assertEqual(snapshot["wcs"]["active"], "G55")
        self.assertEqual(snapshot["settings"]["theme"], "dark")

        snapshot["settings"]["theme"] = "light"
        snapshot["spindle"]["state"] = "off"
        self.assertEqual(agent.get_state()["settings"]["theme"], "dark")
        self.assertEqual(agent.get_state()["spindle"]["state"], "cw")

    def test_jog_and_wcs_handlers_normalize_payloads(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        self.assertEqual(resolve(agent.handle_jog({"axis": "X", "distance": 5, "feedrate": 1200})), {"ok": True, "type": "jog", "axis": "X", "distance": 5.0, "feedrate": 1200.0})
        self.assertEqual(resolve(agent.handle_wcs_select({"wcs": "G54"}))["wcs"], "G54")
        result = resolve(agent.handle_set_zero({"axes": ["X", "Z"]}))
        self.assertEqual(result["type"], "set_zero")
        self.assertEqual(result["wcs"], "G54")
        self.assertEqual(result["axes"], ["X", "Z"])

    def test_spindle_handler_sends_gcode(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.handle_spindle_post({"state": "cw", "rpm": 18000}))

        self.assertEqual(server.klippy_apis.scripts[-1], "M3 S18000")

    def test_coolant_handler_sends_gcode(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.handle_coolant_post({"flood": True, "mist": False}))

        self.assertEqual(server.klippy_apis.scripts[-1], "M8")

    def test_wcs_select_handler_sends_modal_command(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.handle_wcs_select({"wcs": "G56"}))

        self.assertEqual(server.klippy_apis.scripts[-1], "G56")

    def test_units_handler_sends_gcode(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.handle_units_post({"units": "G20"}))

        self.assertEqual(server.klippy_apis.scripts[-1], "G20")
        self.assertEqual(agent.get_state()["units"], "G20")

    def test_set_zero_handler_sends_g10_l20(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.handle_set_zero({"axes": ["X", "Y"]}))

        self.assertEqual(server.klippy_apis.scripts[-1], "G10 L20 P1 X0 Y0")

    def test_set_zero_rejects_g53(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        agent.set_active_wcs("G53")

        with self.assertRaises(ValueError):
            asyncio.run(agent.handle_set_zero({"axes": ["X", "Y"]}))

    def test_jog_handler_sends_relative_move(self):
        server = self._make_server()
        agent = CncAgent(FakeConfig(server))

        asyncio.run(agent.handle_jog({"axis": "X", "distance": 5, "feedrate": 100}))

        self.assertEqual(
            server.klippy_apis.scripts[-1],
            "SAVE_GCODE_STATE NAME=_ui_movement\nG91\nG1 X5 F6000\nRESTORE_GCODE_STATE NAME=_ui_movement",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
