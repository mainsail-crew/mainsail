# WCS (Work Coordinate Systems) — Integration Plan

## Problem

Stock Klipper does **not** support `G10 L2/L20` — the standard CNC commands for
setting and managing work coordinate system offsets. Cam software (Fusion 360,
EstlCam, V-Carve, etc.) emits `G10 L2 P<n> X... Y... Z...` in their post-processors.
Without a G10 handler, those commands are silently ignored or raise errors.

Additionally, Klipper's `G54`–`G59` are parsed as valid modal codes but have no
backing offset tables — they are accepted but do not change coordinate behaviour.
The Moonraker CNC agent tracks WCS state in its own model, but it cannot
translate that back into Klipper's `gcode_move.base_position` at the g-code
execution layer.

## Solution

A two-part integration:

| Layer | Component | File |
|-------|-----------|------|
| **Klipper extra** | `WorkCoordinateSystems` | `klipper-extras/work_coordinate_systems.py` |
| **Klipper macros** | WCS selector and zero macros | `klipper-macros/wcs_macros.cfg` |
| **Moonraker agent** | WCS endpoint enrichment | `moonraker-cnc-agent/src/moonraker_cnc_agent/cnc_agent.py` |
| **Frontend** | Offsets panel → WCS-aware | `src/components/panels/Cnc/OffsetsPanel.vue` |

### Klipper extra plugin (`klipper-extras/work_coordinate_systems.py`)

A standard Klipper `[work_coordinate_systems]` module registered via
`load_config(config)`. It:

- Maintains six independent origin offsets (G54–G59) in machine space
- Implements `G10 L2 P<n> Xv Yv Zv` — set WCS n to explicit machine coordinates
- Implements `G10 L20 P<n> Xv Yv Zv` — set WCS n so current tool position reads
  as the given work coordinates (equivalent to per-WCS zero)
- Implements `G53` — switch to raw machine coordinates (base_position = 0)
- Implements `WCS_STATUS` — report active WCS and all offsets
- Implements `SAVE_WCS` — force-persist offsets to JSON
- Listens on `klippy:ready` → load persisted offsets, apply G54
- Listens on `homing:home_rails_end` → reset to G54 after homing
- State queryable via `printer.work_coordinate_systems.*` (active_wcs, active_p,
  machine_mode, wcs dict)
- Persists offsets to `~/wcs_offsets.json` by default (confgurable via
  `persist_file:` in printer.cfg)

### Klipper macros (`klipper-macros/wcs_macros.cfg`)

Dashboard-friendly macros that reference the WCS printer object:

| Macro | Description |
|-------|-------------|
| `WCS_1` … `WCS_6` | Activate G54–G59 |
| `MACHINE_COORDS` | Activate G53 raw machine mode |
| `ZERO_X` / `ZERO_Y` / `ZERO_Z` | Zero a single axis in the active WCS |
| `ZERO_ALL` | Zero X+Y+Z in the active WCS, show status |

All zero macros call `G10 L20 P{active_p} <axis>0`, which goes through the
plugin's handler. This replaces the existing `G92`-based approach.

### Moonraker agent enrichment (`cnc_agent.py`)

The `handle_wcs_get` endpoint should be updated to read live WCS state from
Klipper's printer object via `klippy_apis.query_objects`:

```python
async def handle_wcs_get(self, request=None):
    klippy = self._get_klippy_apis()
    if klippy is not None:
        try:
            result = await klippy.query_objects({'work_coordinate_systems': None})
            wcs_state = result.get('work_coordinate_systems', {})
            self._state['wcs']['active'] = wcs_state.get('active_wcs', DEFAULT_WCS)
            self._state['wcs']['offsets'] = {
                name: dict(zip('XYZ', vals))
                for name, vals in wcs_state.get('wcs', {}).items()
            }
            self._state['wcs']['machine_mode'] = wcs_state.get('machine_mode', False)
        except Exception:
            self.logger.warning("WCS: could not query Klipper state", exc_info=True)
    return copy.deepcopy(self._state['wcs'])
```

This makes the frontend's `/server/cnc/wcs` GET endpoint return authoritative
WCS data from the Klipper plugin, not stubs.

### Frontend (`OffsetsPanel.vue`)

The OffsetsPanel already has:
- G54–G59 selector buttons (calls `selectCncWcs`)
- Set XY Zero / Set Z Zero (calls `setCncZero`, agent runs G92)
- Manual offset entry fields (calls `doSend('G92 X... Y... Z...')`)

**Post-WCS changes:**
- `setCncZero` should call `G10 L20 P{active_p} X0 Y0` instead of `G92 X0 Y0`
  — this sets the origin per-WCS, not a global offset
- Manual offset Apply should call `G10 L20 P{active_p} X... Y... Z...`
  — same reasoning
- The panel should display per-WCS origin offsets from the agent, not just
  the single `gcode_position`

## Integration Steps

### Phase 1 — Deploy Klipper plugin and macros

1. Add a new step to `scripts/install_to_moonraker.sh` (or a new
   `scripts/install_klipper_extras.sh`) that:

   ```bash
   # Copy the Klipper extra plugin
   scp klipper-extras/work_coordinate_systems.py \
       cnc:~/klipper/klippy/extras/work_coordinate_systems.py

   # Copy the macros
   scp klipper-macros/wcs_macros.cfg \
       cnc:~/printer_data/config/macros/wcs_macros.cfg
   ```

2. Manually add to `printer.cfg`:

   ```ini
   [work_coordinate_systems]
   # persist_file: ~/wcs_offsets.json   # optional

   [include macros/wcs_macros.cfg]
   ```

3. Restart Klipper.

4. Verify: `WCS_STATUS` in the console shows "G54 active" with all offsets at zero.

### Phase 2 — Wire agent to live WCS state

1. Update `CncAgent.handle_wcs_get` to query Klipper's printer object.
2. Deploy via `install_to_moonraker.sh`.
3. Verify: `GET /server/cnc/wcs` returns the live WCS data.

### Phase 3 — Update frontend

1. Replace `G92` calls in `OffsetsPanel.vue` with `G10 L20` calls.
2. Show per-WCS origin offsets (not just gcode_position) from the agent.
3. `setCncZero` in `cncApi.ts` — change G92 to G10 L20 payload.
4. Remove `G10 unsupported` caveat from README.

### Phase 4 — Deprecation

- Comment out or remove the old `SET_KINEMATIC_POSITION` macros from
  `macros.cfg` on the printer.
- Remove `position_min` workarounds from stepper configs if present.

## Open Questions

- **G92 interaction**: G92 is still widely used in g-code for offsets.
  The plugin's `_apply_wcs` sets `base_position` directly, which is
  the same mechanism G92 manipulates. After a G92, switching WCS will
  overwrite the G92 offset — is this the correct behaviour?
- **Mainsail store integration**: Should `wcs.active` be added to
  `printer.work_coordinate_systems` in the frontend store subscription
  so the DRO and TopBar can show the active WCS label?
- **Nesting with homing override**: The `homing:home_rails_end` event
  fires our handler AFTER `gcode_move` resets base_position to the
  homing position. We re-apply G54. Does the homing override template
  interact correctly? (Tests on the CNC machine suggest yes.)

## References

- `klipper-extras/work_coordinate_systems.py` — the Klipper plugin
- `klipper-macros/wcs_macros.cfg` — WCS macros
- `moonraker-cnc-agent/src/moonraker_cnc_agent/cnc_agent.py` — Moonraker agent
- `src/components/panels/Cnc/OffsetsPanel.vue` — frontend Offsets panel
- `README.md` — see Klipper G-code caveats (to be updated)
