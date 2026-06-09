import copy
import json
import logging
import os
from typing import Any, Dict, Iterable, Mapping, Optional

DEFAULT_SETTINGS_PATH = os.path.expanduser("~/printer_data/config/cnc_dashboard_settings.json")
DEFAULT_WCS = "G54"
DEFAULT_JOG_RATE_LIMIT_MS = 50
VALID_UNITS = {"G20", "G21"}
VALID_WCS = {"G53", "G54", "G55", "G56", "G57", "G58", "G59"}
VALID_SPINDLE_STATES = {"off", "cw", "ccw"}


class CncAgent:
    """
    Moonraker component for CNC-specific work.

    The agent owns CNC-specific state that Klipper does not model cleanly and
    the guarded workflows that should not be duplicated in the frontend.

    Read-only machine state remains in Mainsail's existing Klipper websocket
    subscription; this component does not re-expose it.
    """

    def __init__(self, config):
        self.server = config.get_server()
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.settings_path = os.path.expanduser(config.get("settings_path", DEFAULT_SETTINGS_PATH))
        self._state = self._build_default_state()
        self._state["settings"].update(self._load_settings())
        self._klippy_apis: Any = None
        self._jog_rate_limit_ms = float(config.get("jog_rate_limit_ms", DEFAULT_JOG_RATE_LIMIT_MS))
        self._last_jog: Dict[str, float] = {}
        self.server.register_event_handler("server:klippy_ready", self._on_klippy_ready)
        self.logger.info("CncAgent component initialized.")
        self.logger.info("Jog rate limit: %.1fms per axis", self._jog_rate_limit_ms)

    def _build_default_state(self) -> Dict[str, Any]:
        return {
            "spindle": {"state": "off", "rpm": 0.0, "override": 1.0},
            "coolant": {"flood": False, "mist": False},
            "units": "G21",
            "wcs": {
                "active": DEFAULT_WCS,
                "offsets": {code: {"X": 0.0, "Y": 0.0, "Z": 0.0} for code in VALID_WCS},
            },
            "capabilities": {},
            "settings": {},
        }

    async def component_init(self):
        self._register_http_endpoints()

    def _register_http_endpoints(self):
        register_endpoint = getattr(self.server, "register_endpoint", None)
        if not callable(register_endpoint):
            self.logger.debug("CncAgent: server does not expose register_endpoint; skipping registration")
            return

        endpoint_groups = {
            "/server/cnc/state": {"GET": self.handle_state},
            "/server/cnc/spindle": {
                "GET": self.handle_spindle_get,
                "POST": self.handle_spindle_post,
            },
            "/server/cnc/coolant": {
                "GET": self.handle_coolant_get,
                "POST": self.handle_coolant_post,
            },
            "/server/cnc/units": {
                "GET": self.handle_units_get,
                "POST": self.handle_units_post,
            },
            "/server/cnc/wcs": {"GET": self.handle_wcs_get},
            "/server/cnc/wcs/select": {"POST": self.handle_wcs_select},
            "/server/cnc/wcs/set-zero": {"POST": self.handle_set_zero},
            "/server/cnc/jog": {"POST": self.handle_jog},
            "/server/cnc/settings": {
                "GET": self.handle_settings_get,
                "POST": self.handle_settings_post,
            },
        }

        for path, handlers in endpoint_groups.items():
            methods = list(handlers.keys())
            if len(handlers) == 1:
                handler = next(iter(handlers.values()))
            else:
                handler = self._make_dispatcher(handlers)
            register_endpoint(path, methods, handler)

    @staticmethod
    def _make_dispatcher(handlers):
        async def dispatch(request):
            method = getattr(request, "method", "GET")
            handler = handlers.get(method)
            if handler is None:
                raise RuntimeError(
                    f"Unsupported method {method} for endpoint"
                )
            return await handler(request)
        return dispatch

    async def _on_klippy_ready(self):
        self.logger.info("Klipper is ready, CncAgent is active.")

    def _get_klippy_apis(self) -> Any:
        if self._klippy_apis is not None:
            return self._klippy_apis
        lookup_component = getattr(self.server, "lookup_component", None)
        if not callable(lookup_component):
            return None
        for name in ("klippy_apis", "klippy_connection"):
            try:
                component = lookup_component(name)
            except Exception:
                continue
            if component is not None and hasattr(component, "run_gcode"):
                self._klippy_apis = component
                return component
        return None

    async def _execute_gcode(self, script: str):
        klippy_apis = self._get_klippy_apis()
        if klippy_apis is None:
            raise RuntimeError("Moonraker klippy_apis component is not available")
        return await klippy_apis.run_gcode(script)

    @staticmethod
    def _format_number(value: Any) -> str:
        number = float(value)
        if number.is_integer():
            return str(int(number))
        return f"{number:g}"

    def get_state(self) -> Dict[str, Any]:
        return copy.deepcopy(self._state)

    def set_spindle_state(self, state: str, rpm: Optional[float] = None, override: Optional[float] = None):
        normalized = state.lower()
        if normalized not in VALID_SPINDLE_STATES:
            raise ValueError(f"unsupported spindle state: {state!r}")
        self._state["spindle"]["state"] = normalized
        if rpm is not None:
            self._state["spindle"]["rpm"] = float(rpm)
        if override is not None:
            self._state["spindle"]["override"] = float(override)
        return copy.deepcopy(self._state["spindle"])

    def set_coolant_state(self, flood: Optional[bool] = None, mist: Optional[bool] = None):
        if flood is not None:
            self._state["coolant"]["flood"] = bool(flood)
        if mist is not None:
            self._state["coolant"]["mist"] = bool(mist)
        return copy.deepcopy(self._state["coolant"])

    def set_units(self, units: str):
        normalized = units.upper()
        if normalized not in VALID_UNITS:
            raise ValueError(f"unsupported units: {units!r}")
        self._state["units"] = normalized
        return normalized

    def set_active_wcs(self, wcs: str, offsets: Optional[Mapping[str, Any]] = None):
        normalized = wcs.upper()
        if normalized not in VALID_WCS:
            raise ValueError(f"unsupported WCS: {wcs!r}")
        self._state["wcs"]["active"] = normalized
        if offsets is not None:
            self._state["wcs"]["offsets"][normalized] = self._normalize_axis_offsets(offsets)
        return copy.deepcopy(self._state["wcs"])

    def update_wcs_offsets(self, wcs: str, offsets: Mapping[str, Any]):
        normalized = wcs.upper()
        if normalized not in VALID_WCS:
            raise ValueError(f"unsupported WCS: {wcs!r}")
        current = self._state["wcs"]["offsets"].setdefault(normalized, {"X": 0.0, "Y": 0.0, "Z": 0.0})
        current.update(self._normalize_axis_offsets(offsets))
        return copy.deepcopy(current)

    def update_settings(self, patch: Mapping[str, Any]):
        self._merge_dict(self._state["settings"], dict(patch))
        self._save_settings(self._state["settings"])
        return copy.deepcopy(self._state["settings"])

    def _merge_dict(self, target: Dict[str, Any], patch: Dict[str, Any]):
        for key, value in patch.items():
            if isinstance(value, dict) and isinstance(target.get(key), dict):
                self._merge_dict(target[key], value)
            else:
                target[key] = copy.deepcopy(value)

    def _normalize_axis_offsets(self, offsets: Mapping[str, Any]) -> Dict[str, float]:
        normalized = {"X": 0.0, "Y": 0.0, "Z": 0.0}
        for axis in normalized:
            if axis in offsets:
                normalized[axis] = float(offsets[axis])
        return normalized

    def _coerce_payload(self, request: Any) -> Dict[str, Any]:
        if request is None:
            return {}
        if isinstance(request, dict):
            return dict(request)
        if hasattr(request, "args"):
            args = getattr(request, "args")
            if isinstance(args, dict):
                return dict(args)
        if hasattr(request, "get_args"):
            try:
                args = request.get_args()
                if isinstance(args, dict):
                    return dict(args)
            except Exception:
                pass
        if hasattr(request, "to_dict"):
            payload = request.to_dict()
            if isinstance(payload, dict):
                return payload
        if hasattr(request, "json"):
            payload = request.json
            if callable(payload):
                payload = payload()
            if isinstance(payload, dict):
                return payload
        return {}

    def _parse_axes(self, request: Any) -> Iterable[str]:
        payload = self._coerce_payload(request)
        axes = payload.get("axes")
        if isinstance(axes, str):
            return [axis.strip().upper() for axis in axes.replace(",", " ").split() if axis.strip()]
        if isinstance(axes, (list, tuple)):
            return [str(axis).upper() for axis in axes]
        axis = payload.get("axis")
        if axis:
            return [str(axis).upper()]
        return []

    def _load_settings(self) -> Dict[str, Any]:
        try:
            with open(self.settings_path, "r", encoding="utf-8") as handle:
                data = json.load(handle)
                return data if isinstance(data, dict) else {}
        except FileNotFoundError:
            return {}
        except json.JSONDecodeError:
            self.logger.warning("CncAgent: settings file at %s is invalid JSON; ignoring it", self.settings_path)
            return {}
        except OSError:
            self.logger.exception("CncAgent: unable to read settings from %s", self.settings_path)
            return {}

    def _save_settings(self, data: Mapping[str, Any]):
        try:
            os.makedirs(os.path.dirname(self.settings_path), exist_ok=True)
            with open(self.settings_path, "w", encoding="utf-8") as handle:
                json.dump(data, handle, indent=2, sort_keys=True)
                handle.write("\n")
        except OSError:
            self.logger.exception("CncAgent: unable to persist settings to %s", self.settings_path)

    # -------------------- HTTP-style handlers --------------------

    async def handle_state(self, request: Any = None):
        return self.get_state()

    async def handle_spindle_get(self, request: Any = None):
        return copy.deepcopy(self._state["spindle"])

    async def handle_spindle_post(self, request: Any = None):
        payload = self._coerce_payload(request)
        state = str(payload.get("state", self._state["spindle"]["state"])).lower()
        if state not in VALID_SPINDLE_STATES:
            raise ValueError(f"unsupported spindle state: {state!r}")
        rpm = payload.get("rpm", self._state["spindle"]["rpm"])
        override = payload.get("override")

        if state == "off":
            await self._execute_gcode("M5")
            rpm_value = 0.0
        else:
            command = "M3" if state == "cw" else "M4"
            rpm_value = float(rpm) if rpm is not None else float(self._state["spindle"]["rpm"] or 0)
            await self._execute_gcode(f"{command} S{self._format_number(rpm_value)}")

        self.set_spindle_state(state, rpm=rpm_value, override=override)
        return {"ok": True, "type": "spindle", **copy.deepcopy(self._state["spindle"])}

    async def handle_coolant_get(self, request: Any = None):
        return copy.deepcopy(self._state["coolant"])

    async def handle_coolant_post(self, request: Any = None):
        payload = self._coerce_payload(request)
        flood = payload.get("flood", self._state["coolant"]["flood"])
        mist = payload.get("mist", self._state["coolant"]["mist"])
        scripts = []
        if flood:
            scripts.append("M8")
        if mist:
            scripts.append("M7")
        if not scripts:
            scripts.append("M9")

        for script in scripts:
            await self._execute_gcode(script)

        self.set_coolant_state(flood=flood, mist=mist)
        return {"ok": True, "type": "coolant", **copy.deepcopy(self._state["coolant"])}

    async def handle_units_get(self, request: Any = None):
        return {"units": self._state["units"]}

    async def handle_units_post(self, request: Any = None):
        payload = self._coerce_payload(request)
        units = payload.get("units", self._state["units"])
        normalized = self.set_units(units)
        await self._execute_gcode(normalized)
        return {"ok": True, "type": "units", "units": normalized}

    async def handle_wcs_get(self, request: Any = None):
        return copy.deepcopy(self._state["wcs"])

    async def handle_wcs_select(self, request: Any = None):
        payload = self._coerce_payload(request)
        wcs = str(payload.get("wcs", DEFAULT_WCS)).upper()
        if wcs not in VALID_WCS:
            raise ValueError(f"unsupported WCS: {wcs!r}")
        offsets = payload.get("offsets")
        if wcs != "G53":
            await self._execute_gcode(wcs)
        if isinstance(offsets, dict):
            self.set_active_wcs(wcs, offsets=offsets)
        else:
            self.set_active_wcs(wcs)
        return {"ok": True, "type": "wcs_select", "wcs": self._state["wcs"]["active"], "offsets": copy.deepcopy(self._state["wcs"]["offsets"][self._state["wcs"]["active"]])}

    async def handle_set_zero(self, request: Any = None):
        axes = list(self._parse_axes(request))
        if not axes:
            axes = ["X", "Y", "Z"]
        active = self._state["wcs"]["active"]
        current = self._state["wcs"]["offsets"].setdefault(active, {"X": 0.0, "Y": 0.0, "Z": 0.0})
        command = "G92 " + " ".join(f"{axis}0" for axis in axes if axis in current)
        await self._execute_gcode(command)
        for axis in axes:
            if axis in current:
                current[axis] = 0.0
        return {"ok": True, "type": "set_zero", "axes": axes}

    async def handle_jog(self, request: Any = None):
        payload = self._coerce_payload(request)
        axis = str(payload.get("axis", "")).upper()
        if axis not in {"X", "Y", "Z"}:
            raise ValueError(f"unsupported jog axis: {axis!r}")
        distance = payload.get("distance")
        if distance is None:
            raise ValueError("jog requires a distance")
        feedrate = payload.get("feedrate")
        if feedrate is None:
            raise ValueError("jog requires a feedrate")

        import time as _time
        now = _time.monotonic()
        last = self._last_jog.get(axis)
        if last is not None:
            elapsed_ms = (now - last) * 1000
            if elapsed_ms < self._jog_rate_limit_ms:
                raise RuntimeError(
                    f"jog rate limit on {axis}: {elapsed_ms:.0f}ms since last jog "
                    f"(minimum {self._jog_rate_limit_ms:.0f}ms)"
                )
        self._last_jog[axis] = now

        script = (
            "SAVE_GCODE_STATE NAME=_ui_movement\n"
            "G91\n"
            f"G1 {axis}{self._format_number(distance)} F{self._format_number(float(feedrate) * 60)}\n"
            "RESTORE_GCODE_STATE NAME=_ui_movement"
        )
        await self._execute_gcode(script)
        return {
            "ok": True,
            "type": "jog",
            "axis": axis,
            "distance": float(distance),
            "feedrate": float(feedrate),
        }

    async def handle_settings_get(self, request: Any = None):
        return copy.deepcopy(self._state["settings"])

    async def handle_settings_post(self, request: Any = None):
        payload = self._coerce_payload(request)
        self.update_settings(payload)
        return {"ok": True, "type": "settings", "settings": copy.deepcopy(self._state["settings"])}


def load_component(config):
    return CncAgent(config)
