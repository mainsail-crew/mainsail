# Architecture

## Overview

The system is split into four layers:

1. `Klipper` + `klipper-extras/`
- Executes motion and macro actions.
- Owns authoritative machine state for motion, pins, temperatures, and macros.
- Exposes state to Moonraker via queryable objects (e.g. `toolhead`,
  `gcode_move`, `print_stats`, `configfile`, `work_coordinate_systems`).
- With the `[work_coordinate_systems]` extra plugin (`klipper-extras/work_coordinate_systems.py`),
  this build **does** support `G10 L2/L20`, six per-WCS offset tables (G54–G59)
  with JSON persistence, and exposes the active WCS, machine mode, and all
  offsets via `printer.work_coordinate_systems.*`.

2. `Moonraker CNC Agent`
- A Moonraker component (`cnc_agent.py`) registered under `[cnc_agent]` in
  `moonraker.conf`.
- Owns CNC-specific state that Klipper does not model: spindle, coolant,
  units, WCS offsets, and per-machine capabilities.
- Exposes guarded command endpoints (jog, set-zero, WCS select, spindle,
  coolant) under `/server/cnc/...`.
- Persists CNC dashboard settings in its own store (separate from
  Mainsail's settings).
- Does **not** re-expose read-only Klipper state — the frontend reads that
  directly from the Klipper websocket subscription.

3. `Mainsail CNC Frontend`
- A Mainsail fork (`upstream-mainsail/`) with CNC-native panels.
- Renders CNC-native panels and consumes Moonraker + agent APIs.
- Surfaces CNC workflows without overloading generic macro lists.
- Read-only state comes from the existing `printer` Vuex store. CNC-
  specific state and commands are fetched from the agent.

4. `Machine Profile`
- Describes optional capabilities such as spindle mode, coolant channels,
  probing hardware, and safety requirements.

## State and Command Flow

```
Klipper  ──websocket objects──>  Mainsail Vuex store
   │                                    │
   │                                    ▼
   │                          CNC panels (read-only state)
   │
   └──gcode/script──> Moonraker ──HTTP/WS──> CNC agent
                                                    │
                                                    ▼
                                          guarded command endpoints
```

The agent only sees what is not already exposed cleanly by Klipper. The
overlap (e.g. work position) is intentionally not duplicated: the
frontend reads `printer.gcode_move.gcode_position` for display, and the
`OffsetsPanel` "Set Work Zero" button sends `G10 L20 P{n} X0 Y0` through
the agent's `/server/cnc/wcs/set-zero` endpoint, which uses the WCS
plugin's G10 handler.

## V1 Panels

| Panel | Data source | Status |
| --- | --- | --- |
| `CncStatusPanel` | `printer.print_stats`, `printer.gcode_move`, `printer.toolhead`, `printer.system_stats` | wired, renders |
| `JogPanel` | `gui.control`, `printer.print_stats`, `printer.toolhead.homed_axes` + `doSend` | wired, renders |
| `OffsetsPanel` | `printer.gcode_move.gcode_position` + `G10 L20` work-zero actions (WCS plugin) | wired, renders |
| `SpindleCoolantPanel` | `doSend` (raw `M3`/`M4`/`M5`/`M7`/`M8`/`M9`) | wired, renders |
| `MdiPanel` | `ConsoleTextarea` + quick commands for G20/G21/G90/G91 and WCS shortcuts | wired, renders |
| `DroPanel` | `printer.motion_report.live_position`, `printer.gcode_move.gcode_position`, `printer.toolhead.axis_minimum`/`axis_maximum`, `printer.toolhead.homed_axes`, `printer.motion_report.live_velocity` | wired, renders |

All wired panels read Klipper state directly from the existing Mainsail
Vuex subscription. No panel round-trips through the agent to fetch data
Klipper already exposes.

## Key Design Rules

- Machine coordinates and work coordinates must be visually distinct.
- The active work coordinate system must always be obvious.
- Dangerous actions must require confirmations.
- Spindle and coolant state should remain visible during job execution.
- The agent only owns what Klipper does not model. Don't re-expose
  read-only state through the agent.
