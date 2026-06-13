# CNC Panels

This directory contains CNC-focused dashboard panels for the Mainsail fork.

## Audit (June 2026)

| Panel | Data source | Status |
| --- | --- | --- |
| `CncStatusPanel.vue` | native Mainsail store (`printer.print_stats`, `printer.gcode_move`, `printer.toolhead`, `printer.system_stats`) | wired, renders |
| `JogPanel.vue` | native store + `ControlMixin.doSend` | wired, renders |
| `OffsetsPanel.vue` | `printer.gcode_move.gcode_position` + `G10 L20` work-zero actions (WCS plugin) | wired, renders |
| `SpindleCoolantPanel.vue` | `doSend` (`M3`/`M4`/`M5`/`M7`/`M8`/`M9`) | wired, renders |
| `MdiPanel.vue` | `ConsoleTextarea` + quick commands for G20/G21/G90/G91 and WCS shortcuts | wired, renders |
| `DroPanel.vue` | `printer.motion_report`, `printer.gcode_move`, `printer.toolhead` | wired, renders |

## Integration points

- dashboard panel registration in `src/store/variables.ts`
- dashboard rendering pipeline in `src/store/gui/*`
- Moonraker websocket subscription for read-only state — read directly from
  the existing `printer` store, **no dedicated `cnc` Vuex module**
- Moonraker CNC agent for CNC-specific state and guarded commands (see
  `moonraker-cnc-agent/`)
- With the `[work_coordinate_systems]` Klipper extra plugin (see
  `klipper-extras/`), this build **does** support `G10 L2/L20`. Work-zero
  operations use `G10 L20` per-WCS commands. The plugin is deployed as part
  of `install_to_moonraker.sh`. Without it, stock Klipper behaviour applies
  and work-zero falls back to `G92`.

## Re-registering this directory

`upstream-mainsail/` is a submodule-shaped fork working tree. Component
files in this directory are imported from `src/pages/Dashboard.vue` and
listed in the layout definitions under `src/store/gui/` like any other
Mainsail panel. To add a new panel, follow the same pattern as the existing
files (Vue 3 `<script setup>`, `klipperReadyForGui` gate, composables from
`@/composables/useBase` and `@/composables/useControl`).
