# mainsail-cnc

CNC-focused control stack built around Klipper, Moonraker, and a maintained Mainsail fork.

## Overview

A real [Mainsail](https://github.com/mainsail-prusa/mainsail) fork (`upstream-mainsail/`) extended with CNC-native dashboard panels, CNC-specific navigation terminology, file-card metadata enrichment, and a Moonraker-side CNC agent for normalized CNC state and guarded command endpoints.

## Mainsail Fork — CNC Features

### Dashboard panels

Six CNC panels registered in the dashboard system and visible when `cncMode` is enabled (on by default in this fork):

| Panel | Description |
|---|---|
| **CNC Status** | Printer state, active job filename, feed override %, requested feed speed, max velocity, host load, free RAM. Auto-loads CAM metadata sidecar for the active file. |
| **DRO** | Three-axis digital readout showing machine position, work position, computed offset, axis limits, homed flags, absolute/relative mode, and live velocity. |
| **Jog** | Jog/homing controls — Home All / XY / Z, XY directional pad (cross layout), Z ± buttons, step-size selector (100 µm … 25 mm), configurable X/Y/Z feedrates, keyboard navigation, emergency stop (M112). |
| **Offsets** | Work coordinate system manager — G54 … G59 selector, current work position display, per-axis Set Zero, manual offset entry with Apply / Reset (all via `G92`). |
| **Spindle & Coolant** | Spindle ON/OFF/CCW, RPM input (0–24 000), SET button. Flood and Mist coolant toggles. All commands sent through `/server/cnc/*` API. |
| **MDI** *(placeholder)* | Dedicated CNC-native MDI panel stub. Full console/MDI functionality is available via the existing console page; a proper MDI panel is planned for V2. |

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

This repository has progressed well beyond its initial scaffold.

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

### Moonraker CNC agent

- ✅ Python component (`moonraker-cnc-agent/`) loading as a Moonraker component
- ✅ CNC-specific state stores: spindle, coolant, units, WCS offsets
- ✅ Guarded command endpoints: jog, set-zero, WCS select, spindle, coolant
- ✅ Settings persistence: runtime store + GET/POST at `/server/cnc/settings`
- ⏳ Machine actuation wiring (POST handlers persist agent state; Klipper/Moonraker layer needed)

### Klipper macros

- ⏳ Macro contract scaffold in `klipper-macros/` (not yet wired to machine-safe implementations)

### Klipper G-code caveats

Klipper on the BTT-CB1 (and most stock Klipper builds) does **not** support
`G10`. Work-zero operations use `G92` instead:

- `G92 X0 Y0` — set the work position counter to 0 at the current machine
  location (the closest equivalent to GRBL/LinuxCNC's "set work zero")
- `G54`–`G59` — accepted as modal commands, but Klipper does not currently
  expose the active WCS via `gcode_move.gcode_system`, and per-WCS origin
  offsets (G54_origin .. G59_origin) are not queryable in standard builds.
  True per-WCS origins require a custom Klipper with G10 support, or
  per-WCS tracking in the Moonraker CNC agent.

## Primary Plan

The main implementation plan lives here:

- [IMPLEMENTATION_PLAN.md](/Users/isaaceliape/repos/mainsail-cnc/IMPLEMENTATION_PLAN.md)

Read that file first if you want the current architecture, implementation phases, completed work, and next tasks.

## Repository Layout

- `upstream-mainsail/`: real frontend fork target
- `moonraker-cnc-agent/`: Moonraker CNC agent (Python component)
- `klipper-macros/`: CNC macro contract scaffold
- `scripts/`: deploy and ops scripts (see `install_to_moonraker.sh`)
- `config/examples/`: example machine profile
- `docs/`: supporting architecture and API notes
- `frontend/`: scratch panel scaffolds superseded by `upstream-mainsail/`

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

3. `Klipper macros`
- perform machine actions and integrate with real hardware/motion behavior
- (NB: stock Klipper does not support `G10` — work-zero operations use
  `G92`. See the Klipper G-code caveats above.)

4. `Machine profile`
- defines machine capabilities and safety rules

## Development

This project uses **Bun** for both the root and the upstream-mainsail fork
(see `AGENTS.md`). `package-lock.json` is not used; lockfiles are `bun.lock`.

### Frontend dev server

```bash
cd upstream-mainsail
bun install
bun run serve --host 0.0.0.0
```

### Deploy the Moonraker CNC agent

```bash
./scripts/install_to_moonraker.sh
```

This rsyncs the package to the target, vendors it into Moonraker's
`components/` directory, ensures the `[cnc_agent]` section is in the active
`moonraker.conf`, restarts Moonraker, and verifies a clean load. Override the
target with `CNC_HOST=myprinter` (defaults to `cnc`).

### Mainsail update manager integration

The install script also registers the project with Moonraker's update
manager by default — a single `[update_manager mainsail-cnc]` section
pointing at the monorepo clone on the printer. The agent, the Mainsail
fork, and the Klipper macros all live in the same repo and version
together, so one entry covers all three. After running the install
script, the project appears in Mainsail's **Machine → Update Manager**
panel and can be updated with a single click.

Manual update flow after clicking **Update** in the Mainsail UI (or after
`git pull` on the CB1):

1. Mainsail does `git pull` on `~/mainsail-cnc` and restarts Moonraker.
2. Re-run `./scripts/install_to_moonraker.sh` to re-vendor the agent
   from `moonraker-cnc-agent/src/...` into
   `moonraker/moonraker/components/cnc_agent/` and pick up the new code.
3. In `upstream-mainsail/`: `bun install` (only if `bun.lock` changed)
   and `bun run build`, then refresh the browser.
4. RESTART Klipper from the Mainsail dashboard to reload the macros.

A standalone, hand-pasteable snippet lives at
[`config/examples/update-manager.conf`](config/examples/update-manager.conf),
and a full example `moonraker.conf` (with the agent component and the
update-manager entry, commented) is at
[`moonraker-cnc-agent/moonraker.conf`](moonraker-cnc-agent/moonraker.conf).

Skip the update-manager work with `CNC_SKIP_UPDATE_MANAGER=1`, or skip
just the clone/pull step (use an existing monorepo checkout) with
`CNC_SKIP_CLONE=1`. Path overrides: `CNC_REPO_DIR`, `CNC_REPO_URL`,
`CNC_CHANNEL`.

## Current Focus

- **CB1 validation** of Phase 3b — deploy agent + fork to CB1, run metadata
  extractor on sample gcode files, verify sidecar rendering on the card grid
- **Wire frontend → agent for CNC state** — replace native Klipper getters in
  DRO/status panels with `/server/cnc/*` endpoints so the agent is the single
  authoritative source
- **Harden POST handlers** — move from stubs to guarded machine actuation:
  jog, set-zero, WCS select, spindle, coolant
- **Full MdiPanel implementation** — replace placeholder with CNC-native MDI
  panel matching console page functionality
- **Phase 4 safety hardening** — confirmations, disabled states when not homed,
  machine-profile-driven feature toggles

## Notes

This is not being treated as a classic Mainsail plugin project. The working assumption is that a maintained fork is the correct frontend integration model for CNC-specific functionality.
