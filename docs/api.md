# CNC Agent API (draft)

## Architectural note

The agent does **not** re-expose read-only Klipper state. The frontend
consumes `printer.toolhead`, `printer.gcode_move`, `printer.print_stats`, and
`printer.configfile` directly from Mainsail's existing Vuex subscription.

The agent only owns:

- CNC-specific state Klipper does not model (spindle, coolant, units, WCS offsets)
- guarded command endpoints (jog, set-zero, units, WCS select, spindle, coolant)
- CNC dashboard settings persistence (separate from Mainsail's settings)

The current Moonraker component registers `/server/cnc/...` endpoints now.
The POST handlers persist and normalize state, but machine-actuation wiring is
still a follow-up.

## Backend command mapping

All actuation eventually funnels through Moonraker's Klippy API:
`klippy_apis.run_gcode(...)` → Klippy endpoint `gcode/script` → websocket/event
name `printer.gcode.script` on the frontend.

Planned endpoint-to-command mapping:

- `POST /server/cnc/jog`
  - send `SAVE_GCODE_STATE NAME=_ui_movement`
  - send `G91`
  - send `G1 ... F...` for the requested axis move
  - send `RESTORE_GCODE_STATE NAME=_ui_movement`
  - if `_CLIENT_LINEAR_MOVE` exists, prefer that macro:
    - `_CLIENT_LINEAR_MOVE X=... Y=... Z=... F=...`

- `POST /server/cnc/spindle`
  - `state=off` → `M5`
  - `state=cw` → `M3 S<rpm>`
  - `state=ccw` → `M4 S<rpm>`
  - `override` is dashboard state unless a future Klipper macro exposes spindle override control

- `POST /server/cnc/coolant`
  - `flood=true` → `M8`
  - `mist=true` → `M7`
  - `flood=false` / `mist=false` → `M9` for coolant off

- `POST /server/cnc/units`
  - `G20` or `G21`

- `POST /server/cnc/wcs/select`
  - send the modal coordinate system command `G54`..`G59`
  - keep `G53` as a special-case machine-coordinate escape hatch if we expose it later

- `POST /server/cnc/wcs/set-zero`
  - send `G92 ...` for the selected axes
  - e.g. `G92 X0 Y0`, `G92 Z0`, or `G92 X0 Y0 Z0`

- `POST /server/cnc/settings`
  - no Klippy command
  - persist to `~/printer_data/config/cnc_dashboard_settings.json` (or the configured `settings_path`)

## Current read endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /server/cnc/spindle` | Current spindle state (`off`/`cw`/`ccw`), rpm, override |
| `GET /server/cnc/coolant` | Current coolant state (`flood`, `mist`) |
| `GET /server/cnc/wcs`     | Active WCS + G54..G59 offsets |
| `GET /server/cnc/units`   | Current units (`G20`/`G21`) |
| `GET /server/cnc/settings` | CNC dashboard settings |

## Current command endpoints

### `POST /server/cnc/jog`
Safe jog with step, axis, and feed; safe-Z handling is reserved for a later macro-backed implementation.

### `POST /server/cnc/spindle`
Start, stop, set direction, optionally set speed.

### `POST /server/cnc/coolant`
Toggle coolant channels.

### `POST /server/cnc/units`
Switch between metric and imperial units.

### `POST /server/cnc/wcs/select`
Switch active work coordinate system.

### `POST /server/cnc/wcs/set-zero`
Set work zero with explicit axis selection.

### `POST /server/cnc/settings`
Update CNC dashboard settings.
