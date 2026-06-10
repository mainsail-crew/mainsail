# Work Coordinate Systems (G54-G59) for Klipper CNC
# Implements modal WCS selection, G53 machine-coordinate mode, and
# G10 L2/L20 offset commands compatible with standard CAM output.
# Offsets persist in a JSON file (default ~/wcs_offsets.json).
#
# Config (printer.cfg):
#   [work_coordinate_systems]
#   # persist_file: ~/wcs_offsets.json   # optional override

import os, json, logging

WCS_NAMES    = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
WCS_P_MAP    = {1: 'G54', 2: 'G55', 3: 'G56', 4: 'G57', 5: 'G58', 6: 'G59'}
WCS_NAME_TO_P = {v: k for k, v in WCS_P_MAP.items()}


class WorkCoordinateSystems:
    def __init__(self, config):
        self.printer = config.get_printer()
        self.gcode   = self.printer.lookup_object('gcode')

        self.persist_path = os.path.expanduser(
            config.get('persist_file', '~/wcs_offsets.json')
        )

        self.wcs = {name: [0.0, 0.0, 0.0] for name in WCS_NAMES}
        self.active_wcs  = 'G54'
        self.machine_mode = False

        for name in WCS_NAMES:
            self.gcode.register_command(name, self.cmd_select_wcs)

        self.gcode.register_command('G53', self.cmd_G53)

        self.prev_g10 = self.gcode.register_command('G10', None)
        self.gcode.register_command('G10', self.cmd_G10)

        self.gcode.register_command('WCS_STATUS', self.cmd_wcs_status,
                                    desc=self.cmd_wcs_status_help)
        self.gcode.register_command('SAVE_WCS', self.cmd_save_wcs,
                                    desc=self.cmd_save_wcs_help)

        self.printer.register_event_handler('klippy:ready',
                                            self._handle_ready)
        self.printer.register_event_handler('homing:home_rails_end',
                                            self._handle_home_rails_end)

    def _load(self):
        if not os.path.exists(self.persist_path):
            return
        try:
            with open(self.persist_path, 'r') as f:
                data = json.load(f)
        except Exception:
            logging.exception("WCS: could not read %s", self.persist_path)
            return
        for name in WCS_NAMES:
            if name in data.get('wcs', {}):
                v = data['wcs'][name]
                self.wcs[name] = [float(v[0]), float(v[1]), float(v[2])]

    def _persist(self):
        data = {
            'wcs': {name: list(self.wcs[name]) for name in WCS_NAMES},
        }
        try:
            with open(self.persist_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception:
            logging.exception("WCS: could not write %s", self.persist_path)

    def _handle_ready(self):
        self._load()
        self._apply_wcs('G54')
        logging.info("WCS: ready — starting in G54, loaded offsets=%s", self.wcs)

    def _handle_home_rails_end(self, homing_state, rails):
        self.machine_mode = False
        self._apply_wcs('G54')

    def _apply_wcs(self, wcs_name):
        gcode_move = self.printer.lookup_object('gcode_move')
        offset = self.wcs[wcs_name]
        for i in range(3):
            gcode_move.base_position[i] = offset[i]
        self.active_wcs   = wcs_name
        self.machine_mode = False

    def _wcs_from_p(self, gcmd):
        p = gcmd.get_int('P', 1, minval=1, maxval=6)
        return WCS_P_MAP[p]

    def cmd_select_wcs(self, gcmd):
        name = gcmd.get_command()
        self._apply_wcs(name)
        o = self.wcs[name]
        gcmd.respond_info(
            "WCS: %s active  (machine origin X=%.4f Y=%.4f Z=%.4f)"
            % (name, o[0], o[1], o[2])
        )

    def cmd_G53(self, gcmd):
        gcode_move = self.printer.lookup_object('gcode_move')
        for i in range(3):
            gcode_move.base_position[i] = 0.0
        self.machine_mode = True
        gcmd.respond_info(
            "WCS: machine coordinates active (G53) — "
            "issue G54-G59 to return to a work coordinate system"
        )

    def cmd_G10(self, gcmd):
        l = gcmd.get_int('L', None)
        if l == 2:
            self._cmd_G10_L2(gcmd)
        elif l == 20:
            self._cmd_G10_L20(gcmd)
        elif self.prev_g10 is not None:
            self.prev_g10(gcmd)
        else:
            raise gcmd.error(
                "G10 requires L=2 (set WCS to absolute machine coords) "
                "or L=20 (set WCS from current position)"
            )

    def _cmd_G10_L2(self, gcmd):
        name = self._wcs_from_p(gcmd)
        for i, axis in enumerate('XYZ'):
            val = gcmd.get_float(axis, None)
            if val is not None:
                self.wcs[name][i] = val
        if name == self.active_wcs:
            self._apply_wcs(name)
        self._persist()
        o = self.wcs[name]
        gcmd.respond_info(
            "WCS: %s set — machine origin X=%.4f Y=%.4f Z=%.4f"
            % (name, o[0], o[1], o[2])
        )

    def _cmd_G10_L20(self, gcmd):
        name = self._wcs_from_p(gcmd)
        toolhead = self.printer.lookup_object('toolhead')
        phys = toolhead.get_position()
        for i, axis in enumerate('XYZ'):
            val = gcmd.get_float(axis, None)
            if val is not None:
                self.wcs[name][i] = phys[i] - val
        if name == self.active_wcs:
            self._apply_wcs(name)
        self._persist()
        o = self.wcs[name]
        gcmd.respond_info(
            "WCS: %s zeroed — machine origin X=%.4f Y=%.4f Z=%.4f"
            % (name, o[0], o[1], o[2])
        )

    cmd_wcs_status_help = "Report active WCS and all stored offsets"
    def cmd_wcs_status(self, gcmd):
        mode = " [G53 machine mode]" if self.machine_mode else ""
        lines = ["WCS status — active: %s%s" % (self.active_wcs, mode)]
        for name in WCS_NAMES:
            o = self.wcs[name]
            marker = " <--" if name == self.active_wcs else ""
            lines.append(
                "  %s: X=%.4f  Y=%.4f  Z=%.4f%s"
                % (name, o[0], o[1], o[2], marker)
            )
        lines.append("  Persist: %s" % self.persist_path)
        gcmd.respond_info("\n".join(lines))

    cmd_save_wcs_help = "Force-save all WCS offsets to disk"
    def cmd_save_wcs(self, gcmd):
        self._persist()
        gcmd.respond_info("WCS: saved to %s" % self.persist_path)

    def get_status(self, eventtime=None):
        return {
            'active_wcs':   self.active_wcs,
            'active_p':     WCS_NAME_TO_P[self.active_wcs],
            'machine_mode': self.machine_mode,
            'wcs': {name: list(v) for name, v in self.wcs.items()},
        }


def load_config(config):
    return WorkCoordinateSystems(config)
