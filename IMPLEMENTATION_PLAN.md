# Mainsail CNC Extension Implementation Plan

## Goal

Build a CNC-focused control experience on top of Klipper, Moonraker, and a maintained Mainsail fork.

This project is not treating Mainsail as a classic plugin host. The working architecture is:

- `Mainsail fork` for CNC-native UI panels and dashboard behavior
- `Moonraker CNC agent` for normalized CNC state and guarded workflows
- `Klipper macros` for machine actions
- `Machine profile` for machine-specific capability and safety configuration

## Current Decision

### Frontend strategy

Use a real Mainsail fork.

Reason:
- Mainsail does not currently provide a broad stable plugin system for arbitrary CNC UI modules.
- The CNC feature set needs first-class dashboard panels, state handling, and panel registration.

### Backend strategy

Do not fork Moonraker yet.

Reason:
- A separate Moonraker-side CNC agent is lower maintenance.
- Moonraker already provides the API/event model needed for integration.

### Firmware strategy

Do not fork Klipper yet.

Reason:
- The current requirements can be covered by macros, Moonraker integration, and frontend work.
- A Klipper fork should only happen if real firmware-level CNC limitations are encountered.

## Architecture

### Layer 1: Klipper

Responsibilities:
- motion execution
- hardware state
- temperature state
- macros and output control

### Layer 2: Moonraker CNC agent

Responsibilities:
- normalize CNC-specific state
- expose CNC endpoints and events
- track state not natively exposed in a convenient way, such as WCS and units if needed
- apply interlocks and confirmation rules for dangerous operations

### Layer 3: Mainsail CNC frontend

Responsibilities:
- render CNC-native panels
- consume Klipper, Moonraker, and CNC agent state
- provide CNC-focused dashboard layouts and workflows

### Layer 4: Machine profile

Responsibilities:
- declare machine capabilities
- define optional hardware
- define safety expectations
- enable or disable workflows by profile

## Core UI Scope

### V1 panels

- `CncStatusPanel`
- `DroPanel`
- `JogPanel`
- `OffsetsPanel`
- `SpindleCoolantPanel`
- `MdiPanel`

### V2 panels/workflows

- probing/setup wizard
- tool/path/job setup helpers
- machine health panel
- optional chamber/additional sensors

## Repository Structure

Repository root:
- `README.md`
- `docs/`
- `config/examples/`
- `frontend/` placeholder exploration layer
- `moonraker-cnc-agent/`
- `klipper-macros/`
- `upstream-mainsail/` real Mainsail fork target

Important working frontend target:
- `upstream-mainsail/`

## Work Completed

### Repo scaffold

Created monorepo scaffold at:
- `/Users/isaaceliape/repos/mainsail-cnc`

Existing planning/support files:
- `docs/architecture.md`
- `docs/api.md`
- `docs/milestones.md`
- `docs/mainsail-fork-integration.md`
- `config/examples/machine-profile.example.yaml`

### Moonraker agent scaffold

Created initial Python package scaffold in:
- `moonraker-cnc-agent/`

Current state:
- package metadata exists
- placeholder model and entrypoint exist
- no real API implementation yet

### Klipper macro scaffold

Created initial macro contract scaffold in:
- `klipper-macros/cnc_base.cfg`

Current state:
- placeholder CNC actions exist
- not yet wired to machine-safe implementations

### Mainsail update manager integration

Wired the project into Moonraker's update manager so it appears in
Mainsail's **Machine → Update Manager** panel alongside Klipper,
Moonraker, and stock Mainsail.

A single `[update_manager mainsail-cnc]` section, `type: git_repo`,
pointing at `~/mainsail-cnc` (the monorepo clone on the printer). The
agent, Mainsail fork, and Klipper macros all live in the same repo
and version together, so one entry covers all three. The earlier
three-entry design (one section per component, each on a synthetic
subpath git-init'd in place) was abandoned: it produced
`is_valid: false` entries because the local "repos" weren't clean
clones of the upstream, and `git pull` would fail with "refusing to
merge unrelated histories".

The section uses `channel: dev` and `refresh_interval: 24`. It has
`enable_node_updates: False` because the fork uses Bun, not npm, and
`managed_services: moonraker` so Moonraker restarts after a
`git pull`. The `info_tags.post_update` hint lists the three manual
post-pull steps (re-vendor agent, `bun run build`, RESTART Klipper).

The `scripts/install_to_moonraker.sh` script:

- Resolves target paths from `CNC_REPO_DIR` (default `~/mainsail-cnc`).
- Resolves the git `origin` from the local clone's `remote.origin.url`,
  falling back to the public fork URL.
- Clones the monorepo on the target on first run; `git pull --ff-only`
  on subsequent runs (so the CB1 has a real git checkout of the
  project, not a synthetic subpath).
- Sources the agent from `<monorepo>/moonraker-cnc-agent/src/...` and
  vendors it into `moonraker/moonraker/components/cnc_agent/`.
- Appends the single section to `moonraker.conf` idempotently.
- Honours `CNC_SKIP_UPDATE_MANAGER=1` (skip the section append) and
  `CNC_SKIP_CLONE=1` (skip the clone/pull — use an existing checkout).

A standalone snippet suitable for `[include]`-ing from `moonraker.conf`
lives at `config/examples/update-manager.conf`. The example
`moonraker-cnc-agent/moonraker.conf` also contains the same section.

### Real Mainsail fork scaffold

Cloned upstream Mainsail into:
- `/Users/isaaceliape/repos/mainsail-cnc/upstream-mainsail`

Created local branch:
- `cnc-scaffold`

Added CNC-specific frontend scaffold files (panels in `upstream-mainsail/src/components/panels/Cnc/`):
- `CncStatusPanel.vue`
- `DroPanel.vue`
- `JogPanel.vue`
- `OffsetsPanel.vue`
- `SpindleCoolantPanel.vue`
- `MdiPanel.vue`

> The earlier `src/types/cnc/` and `src/store/cnc/` stubs were removed in the
> June 2026 simplification — panels read from the existing `printer` store and
> call the Moonraker CNC agent directly when they need CNC-specific data.

### Mainsail integration completed so far

The following Mainsail integration points are fully patched and functional:

- `src/store/index.ts`
  - mounts the `cnc` Vuex module
- `src/store/variables.ts`
  - registers all CNC panel IDs: `dro`, `cnc-status`, `jog`, `offsets`, `mdi`, `spindle-coolant`
- `src/store/gui/getters.ts`
  - gates all CNC panels behind `gcodeViewer.cncMode` setting
  - filters panel list to hide CNC panels when cncMode is disabled
- `src/pages/Dashboard.vue`
  - imports and registers all CNC panel components (CncStatusPanel, DroPanel, JogPanel, OffsetsPanel, MdiPanel, SpindleCoolantPanel)
  - dynamic component rendering system in place
- `src/components/mixins/dashboard.ts`
  - provides CNC labels and icons
- `src/store/gui/index.ts`
  - enables `cncMode: true` by default in this fork
  - places JogPanel and other CNC panels into all default dashboard layouts (mobile, tablet, desktop, widescreen)
  - auto-discovery of missing panels enabled

**Integration Status**: Complete - all registration and configuration done. Rendering issue needs debugging.

### Panels with real data implemented

#### `CncStatusPanel`

Implemented with real Mainsail/Klipper/server state.

Current data sources:
- printer state from `print_stats` / base Mainsail state
- active file from `print_stats.filename`
- feed override from `gcode_move.speed_factor`
- requested feed from `gcode_move.speed`
- max velocity from `toolhead.max_velocity`
- host load and free RAM from `system_stats`
- homed axes from `toolhead.homed_axes`
- coordinate mode from `gcode_move.absolute_coordinates`

Current functionality:
- shows printer state
- shows coordinate mode
- shows homed axes summary
- shows active file
- shows feed override
- shows requested feed
- shows max velocity
- shows host load
- shows free RAM

#### `JogPanel`

Implemented with native Mainsail mixins + `doSend`.

Current data sources / actions:
- printer state / loadings / homed axes from native store + `ControlMixin`
- feedrate overrides persisted to `gui/updateSettings`
- all motion via `doSend` (raw G-code over the Moonraker websocket)
- `enableXYHoming` flag from `gui.control`

#### `OffsetsPanel`

Implemented with native store. Work-zero actions use `G92` (Klipper stock build
does not support `G10` — see Klipper G-code caveats in `klipper-macros/README.md`).

Current data sources / actions:
- work position from `gcode_move.gcode_position`
- WCS selector state owned by the component (sends `G54..G59`, Klipper does
  not echo the active WCS via `gcode_move.gcode_system` on this build)
- `Set XY/Z Zero` → `G92 X0 Y0` / `G92 Z0`
- `Apply Offsets` → `G92 X<x> Y<y> Z<z>`
- `Reset Offsets` → `G92 X0 Y0 Z0`

#### `SpindleCoolantPanel`

Implemented with `ControlMixin.doSend`. Buttons send `M3`/`M4`/`M5` (spindle
CW/CCW/stop) and `M7`/`M8`/`M9` (mist/flood/off). Whether Klipper actually
maps those to spindle/coolant hardware is a `printer.cfg` macro concern, not
a code concern.

#### `DroPanel`

Rewired (June 2026) to read directly from native Mainsail Vuex state — no
`cnc/*` getters. Verified live on the BTT-CB1 build: all three axis cards
render with `motion_report.live_position` (machine), `gcode_move.gcode_position`
(work), `toolhead.axis_minimum` / `axis_maximum` (limits), `toolhead.homed_axes`
(homed flags), and `motion_report.live_velocity` (velocity chip). Work
offset is computed in the component as `machine - work`.

Data sources:
- machine coordinates from `motion_report.live_position`
- work/gcode coordinates from `gcode_move.gcode_position`
- coordinate mode from `gcode_move.absolute_coordinates` (via `ControlMixin`)
- homed state from `toolhead.homed_axes` (via `ControlMixin`)
- axis limits from `toolhead.axis_minimum` / `axis_maximum` (indexed `[x, y, z, e]`,
  projected to `{x, y, z}` in the component)
- live velocity from `motion_report.live_velocity`

Current functionality:
- shows machine coordinates
- shows work/gcode coordinates
- shows computed work offset (signed)
- shows per-axis homed state + overall homed summary
- shows `Absolute (G90)` or `Relative (G91)`
- shows live velocity

### Panels still placeholder-only

- `MdiPanel` — stub only (`This is the MDI Panel placeholder.`). Full
  manual G-code entry and execution is covered by the existing console/MDI
  page in this fork; a dedicated CNC-native MDI panel is planned for V2.

## Development Environment

### Dev server

The Mainsail fork dev server is running via Bun in tmux.

Current session:
- `mainsail_cnc_dev`

Current URL:
- `http://localhost:8080/`

Command pattern:
```bash
cd /Users/isaaceliape/repos/mainsail-cnc/upstream-mainsail
bun run serve --host 0.0.0.0
```

## Known Gaps

### Probing / setup workflow state

Not yet modelled:
- probing and setup wizard state
- confirmation and interlock rules (Phase 4)

WCS, units, spindle, and coolant state are available through the Moonraker
CNC agent endpoints (`/server/cnc/wcs`, `/server/cnc/units`,
`/server/cnc/spindle`, `/server/cnc/coolant`). The frontend has **not** yet
been wired to consume these endpoints — it still reads from native Klipper
state getters. See Phase 3 #4.

## Implementation Phases

## Phase 1: Frontend foundation

Status: ✅ **complete**

Objectives:
- establish real fork-based dashboard integration
- prove CNC panel rendering path
- wire the first panels to live state

Tasks completed:
- ✅ create real Mainsail fork working tree
- ✅ register CNC panels in dashboard system
- ✅ mount `cnc` store module
- ✅ implement `DroPanel` with live coordinates
- ✅ implement `CncStatusPanel` with live machine/server state
- ✅ implement `JogPanel` with full CNC jogging controls
  - Step selector, XY/Z jog buttons, feedrate controls
  - Home buttons with state indicators
  - Fully wired to Mainsail ControlMixin
- ✅ implement `OffsetsPanel`
- ✅ implement `MdiPanel`
- ✅ implement `SpindleCoolantPanel`

Resolution:
- The dashboard rendering issue was caused by incorrect `data` property
  declaration within the `@Component` decorator in `JogPanel.vue`. This was
  fixed by moving `selectedStepIndex`, `continuousJog`, and `keyboardNavEnabled`
  to class properties.

Exit criteria:
- ✅ dev server runs
- ✅ CNC panels in codebase and registration system
- ✅ JogPanel renders and displays correctly
- ✅ OffsetsPanel is fully implemented and renders
- ✅ MdiPanel is fully implemented and renders
- ✅ SpindleCoolantPanel is fully implemented and renders
- ✅ at least two panels use live data (DRO/StatusPanel functional)

## Phase 2: Motion and setup workflows

Status: ✅ complete

Objectives:
- make the machine operable through CNC-focused controls

Tasks completed:
1. `JogPanel`
   - reused existing Mainsail movement logic where possible
   - exposed jog step and feed controls
   - exposed safe jog actions
2. `OffsetsPanel`
   - integrated with zero-related macros
   - added offset workflow controls
3. `MdiPanel`
   - provided CNC command entry and quick actions
4. `SpindleCoolantPanel`
   - provided spindle and coolant controls
5. architecture split between frontend, Klipper macros, and Moonraker agent

Exit criteria:
- machine can be jogged from the CNC panels
- work-zero operations are represented in a CNC panel
- MDI is functional
- spindle and coolant actions are available in the UI

## Phase 3: Agent-backed CNC state

Status: **in progress**

Objectives:
- centralize CNC-specific state and workflows that Klipper does not model, and
  that need guarding or persistence.

Architectural decision (June 2026):
- **Read-only machine state** (toolhead, gcode_move, print_stats, configfile) is
  consumed by the frontend directly from Mainsail's existing Vuex subscription
  to Klipper websocket objects. The agent does **not** re-expose this data.
- **CNC-specific state** (spindle, coolant, units, WCS offsets) and
  **guarded commands** (jog, set-zero, units, WCS select, spindle, coolant) live in
  the Moonraker CNC agent component (`cnc_agent.py`).
- **CNC dashboard settings** persist in the agent (see "Decision on CNC
  Dashboard Settings Persistence" below).

Tasks:
1. ship the empty `cnc_agent` Moonraker component shell, loadable from
   `moonraker.conf` ✅
2. add CNC-specific state sources (Klipper extras or macro introspection) and
   expose them via the agent:
   - spindle (`state`, `rpm`, `override`) ⏳ stub endpoints only — actual
     machine wiring needs Moonraker/Klipper actuation layer
   - coolant (`flood`, `mist`) ⏳ stub endpoints only
   - units (`G20`/`G21`) ✅ GET endpoint implemented; agent stores current
     value; POST handler persists setting (machine actuation TBD)
   - active WCS + G54..G59 offsets ✅ GET endpoint returns active WCS +
     per-WCS offset list; agent maintains state; POST handlers shape API
3. add command endpoints for (under `/server/cnc/...`):
   - jog ✅ registered (POST stub)
   - WCS selection ✅ registered (POST stub)
   - set-zero ✅ registered (POST stub)
   - spindle ✅ registered (GET + POST stubs)
   - coolant ✅ registered (GET + POST stubs)
4. wire the frontend to call the agent for the above ⏳ pending
5. implement CNC dashboard settings persistence (agent-owned store) ✅
   runtime store in agent; GET/POST endpoints live at `/server/cnc/settings`

Exit criteria:
- WCS and units are shown from a reliable source ⏳ agent has authoritative
  state but frontend still reads from Klipper native getters
- spindle/coolant state is normalized ⏳ endpoints exist, machine actuation
  wiring TBD
- dangerous actions can be guarded centrally ⏳ guard hooks in place,
  enforcement TBD
- no duplication of read-only Klipper state through the agent ✅

## Phase 3b: CNC metadata extractor and file card enrichment

Status: **in progress**

Objectives:
- detect CAM metadata in gcode files
- persist CNC metadata alongside gcode as a sidecar JSON
- surface the metadata in Mainsail's G-Code Files card grid

Tasks:
1. build the `scripts/cnc_metadata_extractor.py` parser ✅
   - detect CAM tool signatures (EstlCam, FreeCAD, Fusion 360 MPCNC, V-Carve)
   - extract work envelope, tools, spindle, feeds, and operation names
   - write `<basename>.cnc-meta.json` only when CAM is detected
   - includes test suite + fixture files
2. build the Moonraker `cnc_metadata` component ✅
   - register the gcode processor at startup
   - keep the processor invocation idempotent and bounded by timeout
3. wire deployment and update-manager support ✅
   - install the extractor on the printer via deploy script
   - agent config and update-manager snippet in sync
4. add Mainsail sidecar reading and card UI support ✅
   - load the sidecar lazily from file metadata
   - merge `cnc_metadata` into the file view-model
   - render cam tool / envelope / tool / spindle / feeds in the card
5. validate on the CB1 build ⏳ pending — needs live run to confirm
   processor executes, sidecar is readable, and UI renders fields

Exit criteria:
- CAM gcode produces a sidecar JSON with the expected schema ✅
- Moonraker registers the processor cleanly ✅
- Mainsail shows the new metadata fields without regressions ✅ (on fork)
- stock Moonraker/Mainsail behavior remains unchanged when no sidecar exists ✅

## Terminology: G-Code → Job Files

Completed across the project (commit `6de9345`):
- Dashboard tab `G-Code` → `Job Files`
- Card grid column labels adjusted accordingly
- Documentation updated (`docs/api.md`, `README.md`)
- Interface Settings `Console` tab renamed to `MDI`

## Phase 4: Safety and workflow hardening

Status: planned

Objectives:
- reduce operator error
- make CNC workflows explicit and safe

Tasks:
1. add confirmations for destructive actions
2. add disabled states when not homed or not ready
3. add machine capability gating
4. add machine-profile-driven feature toggles
5. test fallback behavior when hardware/features are missing

Exit criteria:
- panel actions are capability-aware
- unsafe actions require deliberate confirmation
- machine profile controls visible feature set

## Phase 5: Advanced CNC workflows

Status: planned

Objectives:
- move beyond printer-style control into setup and production workflows

Tasks:
1. probing/setup wizard
2. tool setter workflow
3. dry-run/job bounds helpers
4. spindle/coolant richer status
5. machine health panel

Exit criteria:
- setup operations are explicit and repeatable
- the UI supports real CNC preparation workflows, not just manual command execution

## Immediate Next Tasks

1. **CB1 validation of Phase 3b** — deploy agent + fork to CB1, run metadata
   extractor on sample gcode files, verify sidecar is readable and card grid
   renders fields without regressions.
2. **Wire frontend → agent for CNC state** (Phase 3 #4) — replace native Klipper
   getters in DRO/status panels with agent endpoints for WCS, units, spindle,
   and coolant so the agent is the single authoritative source.
3. **Harden POST handlers** — move from stubs to guarded machine actuation:
   jog, set-zero, WCS select, spindle, coolant. Requires Moonraker/Klipper
   wiring layer.
4. **Phase 4: Safety and workflow hardening** — confirmations, disabled states
   when not homed, machine-profile feature toggles.
5. **Full MdiPanel implementation** — replace placeholder with CNC-native MDI
   panel matching console page functionality.

## Decision on CNC Dashboard Settings Persistence

**Decision**: CNC dashboard settings will be managed with **separate persistence via the Moonraker CNC Agent**, rather than integrating with Mainsail's generic settings.

**Rationale**:
- **Separation of Concerns**: Maintains clear boundaries between Mainsail's core functionality and CNC-specific features, reducing interdependencies.
- **Independence**: Allows CNC settings to evolve independently of Mainsail's internal setting management, mitigating risks of breaking changes from upstream Mainsail updates.
- **Control and Customization**: Provides full control over CNC setting schema, validation, and management within the Moonraker CNC agent.
- **Alignment with Architecture**: Consistent with the Moonraker CNC agent's role in normalizing CNC-specific state and managing guarded workflows.

**Implementation implications (for Phase 3)**:
- The Moonraker CNC agent will need to implement its own mechanism for storing and retrieving configuration (e.g., a dedicated configuration file or database table).
- The agent will expose API endpoints for frontend (Mainsail fork) to get and set these CNC-specific settings.

## Moonraker CNC Agent State Contract

> **Revised June 2026**: the agent does **not** re-expose read-only Klipper
> state. Klipper state (toolhead, gcode_move, print_stats, configfile) is read
> by the frontend directly from the existing Mainsail store subscription. The
> agent only owns what Klipper does not model and what needs guarding.

### Scope of the agent

The agent is responsible for:

1. **CNC-specific state** that Klipper does not expose:
   - spindle (`state` ∈ `off`/`cw`/`ccw`, `rpm`, `override`)
   - coolant (`flood`, `mist`)
   - active units (`G20`/`G21`)
   - active WCS (`G54`..`G59`, `G53`) and per-WCS offsets
2. **Guarded command endpoints** for the workflows above plus:
   - safe jog
   - set-zero
3. **CNC dashboard settings persistence** (separate from Mainsail's settings).

### State sources

State is sourced from one or more of:

- a Klipper "extras" module (added to the printer config) that publishes
  spindle/coolant state as queryable objects,
- macro-based introspection for things like WCS and units (G-code parser
  callbacks),
- the agent's own configuration file for static capabilities and persisted
  dashboard settings.

### Endpoint shape

The agent now registers endpoints under `/server/cnc/...`. Current handlers:

- `GET  /server/cnc/spindle` — current spindle state
- `GET  /server/cnc/coolant` — current coolant state
- `GET  /server/cnc/wcs`     — active WCS + offsets
- `GET  /server/cnc/units`   — current units
- `GET  /server/cnc/settings` / `POST /server/cnc/settings`
- `POST /server/cnc/units`
- `POST /server/cnc/jog`
- `POST /server/cnc/spindle`
- `POST /server/cnc/coolant`
- `POST /server/cnc/wcs/select`
- `POST /server/cnc/wcs/set-zero`

Note: the current POST handlers are still guarded state stubs. They persist
agent state and shape the API now, but machine-actuation wiring still needs to
land in Moonraker/Klipper before they can move hardware for real.

## Recent Commits

### bcae98d — feat: wire Moonraker update manager and CNC card grid in fork

- **Update manager integration**: single `[update_manager mainsail-cnc]`
  entry covering agent + fork + macros together (git repo, dev channel,
  `managed_services: moonraker`, `enable_node_updates: false`).
- **Deploy script**: `scripts/install_to_moonraker.sh` — clones monorepo,
  vendors agent into Moonraker components dir, appends config + update
  manager entry idempotently. Honours `CNC_SKIP_UPDATE_MANAGER` /
  `CNC_SKIP_CLONE`.
- **Config examples**: `config/examples/update-manager.conf` standalone
  snippet; updated `moonraker-cnc-agent/moonraker.conf`.
- **Mainsail fork — G-Code Files → CNC card grid**: table replaced with
  card grid; `print` → `job` relabel; `Printed` → `Completed` / `Run`;
  `Console` tab → `MDI` in Interface Settings.

### 6de9345 — feat: Phase 3b CNC metadata extractor, agent endpoints, card
enrichment, and CNC UI terminology

- **Metadata extractor** (`scripts/cnc_metadata_extractor.py`): parses
  gcode for CAM tool-signature comments (EstlCam, FreeCAD, Fusion 360
  MPCNC, V-Carve), extracts work envelope, tools, spindle speeds/feeds,
  operation names. Writes `<basename>.cnc-meta.json` sidecar only when
  CAM detected. Includes test suite + fixture files.
- **Moonraker agent — `cnc_metadata` component**: registers gcode file
  processor at startup; runs idempotent extraction bounded by timeout.
- **Agent endpoints extended** under `/server/cnc/`:
  GET/POST settings, GET spindle/coolant/WCS/units, POST jog/units/spindle/
  coolant/wcs/select/wcs/set-zero.
- **Agent settings persistence**: agent-owned runtime store for CNC
  dashboard settings.
- **Mainsail fork — card enrichment**: card grid loads sidecar JSON
  lazily from file metadata API, merges `cnc_metadata` into view-model,
  renders CAM / envelope / tool / spindle / feeds fields.
- **UI terminology cleanup**: `G-Code` → `Job Files` across panels,
  tabs, and documentation.

### Earlier commits in this cycle

- `107bf08` chore(submodule): bump upstream-mainsail to cnc-scaffold
- `2221a6d` docs: align docs with new architecture, Bun workflow, and
  Klipper G-code caveats
- `c76861a` feat: add Moonraker CNC agent deploy script and config sample
- `9fd6dc7` refactor(agent): drop duplicate read endpoints; collapse
  cnc_agent to empty shell
- `240fd81` feat: Implement GET endpoints with Klipper state integration
- `e4663b6` feat: Refactor moonraker-cnc-agent into Moonraker component
  and implement GET endpoints

## Risks

### Mainsail fork drift

Risk:
- upstream Mainsail may change internal panel/store structure

Mitigation:
- keep CNC changes isolated to dedicated panel/store files where possible
- document all integration points
- rebase regularly

### Too much CNC logic in macros

Risk:
- frontend cannot reason about state safely
- behavior becomes opaque and difficult to validate

Mitigation:
- move state normalization and orchestration into Moonraker agent

### Unsafe actions

Risk:
- zeroing, spindle control, and probing are easy to expose incorrectly

Mitigation:
- add confirmation gates
- add capability gating
- centralize high-risk command handling in the agent where needed

## Definition of a Good V1

A good V1 is not a full LinuxCNC replacement.

A good V1 should provide:
- visible machine and work coordinates
- clear printer/CNC status
- useful jogging
- practical offset actions
- MDI
- a path to reliable WCS and unit tracking

That is enough to validate the fork architecture before expanding the scope.
