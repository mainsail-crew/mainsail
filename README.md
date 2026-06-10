# mainsail-cnc

CNC-focused control stack built around Klipper, Moonraker, and a maintained Mainsail fork.

## Overview

A real [Mainsail](https://github.com/mainsail-prusa/mainsail) fork extended with CNC-native dashboard panels, CNC-specific navigation terminology, file-card metadata enrichment, and a Moonraker-side CNC agent for normalized CNC state and guarded command endpoints.

## Installation

See the full installation guide: [docs/INSTALLATION.md](docs/INSTALLATION.md)

Two paths are documented:

- **Quick install via KIAUH** — automated setup for Debian/Raspberry Pi/any Linux SBC
- **Manual install** — full step-by-step from zero (Klipper, Moonraker, Nginx, Bun, build, deploy, agent)

### Quick start (existing Klipper + Moonraker)

```bash
# 1. Clone the fork
git clone https://github.com/isaaceliape/mainsail-cnc.git ~/mainsail-cnc
cd ~/mainsail-cnc

# 2. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# 3. Build and deploy
bun install --frozen-lockfile
bun run build
./deploy.sh --live

# 4. Install the Moonraker CNC agent
./scripts/install_to_moonraker.sh

# 5. Restart Moonraker
sudo systemctl restart moonraker
```

Then open `http://<your-device-ip>` in a browser.

## Mainsail Fork — CNC Features

### Dashboard panels

Six CNC panels registered in the dashboard system and visible when `cncMode` is enabled (on by default in this fork):

| Panel | Description |
|---|---|
| **CNC Status** | Printer state, active job filename, feed override %, requested feed speed, max velocity, host load, free RAM. Auto-loads CAM metadata sidecar for the active file. |
| **DRO** | Three-axis digital readout showing machine position, work position, computed offset, axis limits, homed flags, absolute/relative mode, and live velocity. Also rendered in compact form in the app header toolbar. |
| **Jog** | Jog/homing controls — Home All / XY / Z, XY directional pad (cross layout), Z ± buttons, step-size selector (100 µm … 25 mm), configurable X/Y/Z feedrates, keyboard navigation, emergency stop (M112). |
| **Offsets** | Work coordinate system manager — G54 … G59 selector, current work position, per-WCS origin offsets, per-axis Set Zero, manual offset entry with Apply / Reset (all via `G10 L20`). |
| **Spindle & Coolant** | Spindle ON/OFF/CCW, RPM input (0–24 000), SET button. Flood and Mist coolant toggles. All commands sent through `/server/cnc/*` API. |
| **MDI** *(placeholder)* | Dedicated CNC-native MDI panel stub. Full console/MDI functionality is available via the existing console page; a proper MDI panel is planned for V2. |

### Work Coordinate Systems (WCS)

This fork ships a Klipper extra plugin (`klipper-extras/work_coordinate_systems.py`)
that adds **full G10 L2/L20 support** to Klipper — natively, without macro trickery.

**Six independent offset tables** (G54–G59) with automatic JSON persistence to
`~/wcs_offsets.json`. Each WCS stores its machine-space origin offset and
survives Klipper restarts.

**Dashboard-friendly macros** (`klipper-macros/wcs_macros.cfg`):

| Macro | What it does |
|-------|-------------|
| `WCS_1` … `WCS_6` | Select G54–G59 |
| `ZERO_X` / `Y` / `Z` / `ALL` | Set work zero in the active WCS |
| `MACHINE_COORDS` | Switch to raw machine coordinates (G53) |

**Moonraker integration** — the agent's `/server/cnc/wcs` endpoint queries live
WCS state from Klipper via `printer.work_coordinate_systems.*`, so the frontend
always shows authoritative data. The `set-zero` endpoint uses `G10 L20 P{n}`
instead of `G92`.

**The Offsets panel** shows both the current work position and the active WCS's
origin offset in machine space. Per-WCS origin offsets are fetched from the
agent and displayed for all six coordinate systems.

Panels render through the standard responsive dashboard layout engine (mobile, tablet, desktop, widescreen columns). Default layouts include **DRO** and **Jog** in every viewport.

### Dashboard navigation

| Original route | CNC label in this fork |
|---|---|
| Dashboard | unchanged |
| Macros | unchanged |
| **G-Code → Job Files** | Cards show CAM metadata (when available) |
| Console → **MDI** | Text-area console kept as the MDI page |
| Config | unchanged |
| Temperature | unchanged |
| Screen | unchanged |
| Interface Settings | **Console** tab renamed to **MDI** |

All navigation routes are gated behind `klipperIsConnected`.

### Gating & visibility

- `gui.gcodeViewer.cncMode` defaults to `true` in this fork. When disabled, all six CNC panels are filtered from the dashboard. Panels can also be individually re-ordered or hidden via the existing dashboard layout settings.
- The G-code viewer sets `forceWireMode` and `g1AsExtrusion = true` when `cncMode` is on so G1 moves render as extrusion paths instead of rapid moves.

### Job Files — card grid with CAM metadata

The G-Code Files panel uses a card grid instead of a table. Card fields include:

- File name, size, time, and completion (`Completed` / `Run` status)
- **CAM tool** name and version (from `.cnc-meta.json` sidecar)
- **Work envelope** (X / Y / Z min/max)
- **Tool list** used in the job
- **Spindle RPM**, **plunge/cut/rapid feed rates**, operation count

Metadata loads lazily from `{filename}.cnc-meta.json` sibling files placed alongside g-code files on the filesystem. A standalone extractor script (`scripts/cnc_metadata_extractor.py`) detects common CAM signatures (EstlCam, FreeCAD, Fusion 360 MPCNC, V-Carve) and writes the sidecar only when CAM comments are found.

### Moonraker CNC agent — API endpoints

Registered under `/server/cnc/...`:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/server/cnc/spindle` | Current spindle state (off / cw / ccw, rpm) |
| POST | `/server/cnc/spindle` | Set spindle state + RPM |
| GET | `/server/cnc/coolant` | Current coolant channels (flood, mist) |
| POST | `/server/cnc/coolant` | Toggle flood / mist coolant |
| GET | `/server/cnc/wcs` | Active WCS + per-WCS offset list |
| POST | `/server/cnc/wcs/select` | Switch active WCS (G54 … G59) |
| POST | `/server/cnc/wcs/set-zero` | Set work zero on specified axes |
| GET | `/server/cnc/units` | Current units (MM / INCH) |
| POST | `/server/cnc/units` | Switch units |
| GET | `/server/cnc/settings` | Get persisted CNC dashboard settings |
| POST | `/server/cnc/settings` | Update persisted CNC dashboard settings |
| POST | `/server/cnc/jog` | Distance-based jog command |

GET handlers return authoritative CNC state. POST handlers currently persist agent state (stubs); full machine actuation wiring requires Moonraker/Klipper integration.

### Frontend architecture

Read-only Klipper state flows directly from Mainsail's Vuex store subscription — no agent round-trip. Write commands go through HTTP calls in `src/store/files/cncApi.ts` to the agent. There is no dedicated `cnc/*` Vuex module in this fork.

#### Key integration points

| File | What it does |
|---|---|
| `src/store/variables.ts` | Registers CNC panel IDs: `dro`, `cnc-status`, `jog`, `offsets`, `mdi`, `spindle-coolant` |
| `src/store/gui/index.ts` | Enables `cncMode: true` by default; places CNC panels in default layouts; hides stock printer metadata columns |
| `src/store/gui/getters.ts` | Gates CNC panels behind `gcodeViewer.cncMode`; filters them out when disabled |
| `src/pages/Dashboard.vue` | Imports and registers all CNC panels; renders them in responsive layout columns |
| `src/components/mixins/dashboard.ts` | Provides CNC labels and icons (`mdiAxisArrow`, `mdiCrosshairsGps`, etc.) |
| `src/store/files/cncApi.ts` | Typed HTTP helpers for all `/server/cnc/...` endpoints |
| `src/store/files/cncMetadata.ts` | Sidecar loader + ViewModel builder for CAM metadata display |
| `src/components/panels/Gcodefiles/GcodefilesPanelListCardFile.vue` | Renders CAM metadata fields on each card |

## Status

This repository has progressed well beyond its initial scaffold. The fork is deployed and live on a Linux SBC at `~/mainsail/`, tracked by Moonraker's update_manager on the `develop` branch. On-device builds are supported (Node.js v20 + Bun).

### Mainsail fork features implemented

- ✅ Six CNC dashboard panels (CNC Status, DRO, Jog, Offsets, Spindle & Coolant, MDI placeholder)
- ✅ Dashboard registration, labels, icons, responsive layouts
- ✅ CNC panels gateable via `cncMode` setting (on by default)
- ✅ Navigation relabelling: G-Code → Job Files, Console → MDI
- ✅ G-Code Files card grid with CAM metadata sidecar rendering
- ✅ Moonraker CNC agent component with 11 REST endpoints
- ✅ Metadata extractor CLI (`scripts/cnc_metadata_extractor.py`)
- ✅ Deploy script + Moonraker update-manager integration
- ✅ Klipper G-code caveats documented (G10 unsupported, G92 for work-zero)
- ✅ Compact DRO readout in app header toolbar (machine position, homed state, live velocity, G90/G91 mode)
- ✅ Jog console log suppression — `SAVE_GCODE_STATE`/`G91`/`G1`/`RESTORE_GCODE_STATE` no longer spams the terminal
- ✅ Homing override fix — corrected uppercase param keys (`'X'`/`'Y'`/`'Z'`) so `G28 X Y` no longer homes Z
- ✅ **WCS Klipper plugin** — G10 L2/L20 support, G54–G59 offset tables with JSON persistence (`klipper-extras/work_coordinate_systems.py`)
- ✅ **WCS macros** — dashboard-friendly WCS selector and per-WCS zero macros (`klipper-macros/wcs_macros.cfg`)

### Moonraker CNC agent

- ✅ Python component (`moonraker-cnc-agent/`) loading as a Moonraker component
- ✅ CNC-specific state stores: spindle, coolant, units, WCS offsets
- ✅ Guarded command endpoints: jog, set-zero, WCS select, spindle, coolant
- ✅ Settings persistence: runtime store + GET/POST at `/server/cnc/settings`
- ⏳ Machine actuation wiring (POST handlers persist agent state; Klipper/Moonraker layer needed)
- ⏳ `[cnc_agent]` section removed from moonraker.conf (agent endpoints not actively wired)

### Klipper macros

- ⏳ Macro contract scaffold in `klipper-macros/` (not yet wired to machine-safe implementations)

### Klipper G-code caveats

With the `[work_coordinate_systems]` Klipper extra plugin installed
(`klipper-extras/work_coordinate_systems.py`), this build **does** support
`G10 L2/L20`:

- `G10 L2 P<n> X<v> Y<v> Z<v>` — set WCS n (G54–G59) to explicit machine-space
  coordinates
- `G10 L20 P<n> X<v> Y<v> Z<v>` — set WCS n so current tool position reads as
  the given work coordinates (per-WCS zero)
- `G54`–`G59` — active WCS selection, backed by offset tables persisted to
  `~/wcs_offsets.json`
- `G53` — switch to raw machine coordinates
- Offsets survive Klipper restart (auto-loaded from JSON on `klippy:ready`)
- State queryable via `printer.work_coordinate_systems.*` and the
  `WCS_STATUS` command
- Dashboard-friendly macros: `WCS_1`…`WCS_6`, `ZERO_X`/`Y`/`Z`/`ALL`

Without the plugin installed, stock Klipper behaviour applies:
`G10` is unsupported and work-zero operations fall back to `G92`.

**Migration from G92.** If you were using the old G92-based approach,
the WCS plugin replaces it entirely. Remove any `[include ...coordinate-systems...]`
and `[include ...origin-offset...]` from your config, and update zeroing macros
to use `G10 L20 P{n}` — the `ZERO_X`/`Y`/`Z`/`ALL` macros in
`klipper-macros/wcs_macros.cfg` do this automatically.

## Primary Plan

The main implementation plan lives in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Repository Layout

- `src/`: Mainsail Vue frontend with CNC panels and modifications
- `moonraker-cnc-agent/`: Moonraker CNC agent (Python component)
- `klipper-extras/`: Klipper extra plugins (e.g. `work_coordinate_systems.py`)
- `klipper-macros/`: CNC macros (WCS selector/zero macros, scaffold macros)
- `scripts/`: metadata extractor and test fixtures (`scripts/cnc_metadata_extractor.py`)
- `config/examples/`: example machine profile and update-manager config
- `specs/`: design specs and integration plans (e.g. `wcs-integration.md`)
- `docs/`: supporting architecture and API notes
- `deploy.sh`: portable build-and-deploy script (dry-run by default, `--live` to deploy)
- `moonraker-cnc-update.conf`: drop-in Moonraker update_manager config snippet

## Architecture Summary

This project assumes:

1. `Mainsail fork`
- CNC-native UI panels and dashboard behavior live here. Panels read
  read-only Klipper state directly from the existing Vuex store
  subscription.

2. `Moonraker CNC agent`
- owns CNC-specific state that Klipper does not model (spindle, coolant,
  units, WCS offsets) and guarded command endpoints (jog, set-zero, WCS
  select, spindle, coolant)
- persists CNC dashboard settings (separate from Mainsail's settings)

3. `Klipper extras + macros`
- Klipper extra plugins (in `klipper-extras/`) extend Klipper's g-code
  language, e.g. `[work_coordinate_systems]` adds G10 L2/L20 support
- Macros (in `klipper-macros/`) provide dashboard-friendly wrappers
  around the extra plugins and machine-safe motion primitives
- (NB: stock Klipper does not support `G10`; this fork ships a plugin
  that does. See the Klipper G-code caveats above for details.)

4. `Machine profile`
- defines machine capabilities and safety rules

## Development

This project uses **Bun**. `package-lock.json` is not used; lockfiles are `bun.lock`.

### Frontend dev server

```bash
bun install
bun run serve --host 0.0.0.0
```

The dev server supports Hot Module Reload — changes apply without manual refresh.

### Moonraker update_manager entry

A ready-to-paste snippet lives at `moonraker-cnc-update.conf`. On the CB1, the `[update_manager mainsail-cnc]` section is already in `/home/biqu/printer_data/config/moonraker.conf`, pointing at `https://github.com/isaaceliape/mainsail-cnc.git` on the `develop` branch.

The update_manager runs `deploy.sh --live` as its `post_update` hook.

## Current Focus

- **Remove remaining 3D-printer-specific code** — settings tabs (Timelapse, Presets, Heightmap), locale keys, StatusPanel references, G-code viewer extruder colors, SettingsControlTab extruder section. See [TODO.md](TODO.md) for the full list.
- **Wire frontend → agent for CNC state** — replace native Klipper getters in DRO/status panels with `/server/cnc/*` endpoints so the agent is the authoritative source
- **Harden POST handlers** — move from stubs to guarded machine actuation: jog, set-zero, WCS select, spindle, coolant
- **Full MdiPanel implementation** — replace placeholder with CNC-native MDI panel matching console page functionality
- **Phase 4 safety hardening** — confirmations, disabled states when not homed, machine-profile-driven feature toggles
- **Klipper config tuning** — `stealthchop_threshold: 30` for quieter high-speed spreads, homing center move feedrate capped at `max_velocity`
- ~~WCS Phase 2 — wire Moonraker agent to live Klipper WCS state~~ _(done)_
- ~~WCS Phase 3 — update OffsetsPanel frontend: replace G92 calls with G10 L20, show per-WCS origin offsets~~ _(done)_

## Contributors

- **Shadowphyre** — documentation, WCS integration review, and project guidance

## Notes

This is not being treated as a classic Mainsail plugin project. The working assumption is that a maintained fork is the correct frontend integration model for CNC-specific functionality.
