# Moonraker CNC Agent

A Moonraker component for CNC-specific state and workflows.

## Scope

Klipper already exposes the read-only machine state used by the Mainsail CNC
panels (`toolhead`, `gcode_move`, `print_stats`, `configfile`), and the
frontend reads it directly from Mainsail's existing Vuex store subscription.
The agent does **not** re-expose that data.

This component owns the things Klipper does not model and the workflows that
need a central, guarded surface:

- spindle state and control (`state`, `rpm`, `override`)
- coolant state and control (`flood`, `mist`)
- units tracking (`G20`/`G21`)
- active work coordinate system (`G54`..`G59`, `G53`) and per-WCS offsets
- safe jog / set-zero / WCS-select command endpoints
- CNC dashboard settings persistence (separate from Mainsail's settings)

## Current state

The component is an empty shell. It loads cleanly under `[cnc_agent]` in
`moonraker.conf` and logs readiness, but registers no HTTP endpoints yet.
Endpoints will be added in `/server/cnc/...` as the corresponding state
sources (Klipper extras, gcode parser callbacks, persisted settings) come
online.

## Installation

Use the deploy script from the repo root:

```sh
./scripts/install_to_moonraker.sh
```

It vendors the package into moonraker's `components/` directory, installs
runtime dependencies into `moonraker-env`, ensures the `[cnc_agent]` section
is present in the active `moonraker.conf`, and restarts Moonraker.

## Updates via the Mainsail update manager

The install script also wires the project into Moonraker's update manager
by default, so mainsail-cnc shows up in Mainsail's **Machine → Update
Manager** panel alongside Klipper, Moonraker, and stock Mainsail.

The entry is `type: git_repo` pointing at the monorepo clone on the
printer (`~/mainsail-cnc` by default). The install script creates that
clone on first run (and `git pull --ff-only`s on subsequent runs) so
it's a real git checkout of the project — no synthetic subpath, no
"ahead 1, behind N" weirdness.

Clicking **Update** in the Mainsail UI runs `git pull` and restarts
Moonraker. The agent is vendored into
`moonraker/moonraker/components/cnc_agent/` by the install script, so a
pull alone won't activate the new code — re-run
`./scripts/install_to_moonraker.sh` to re-vendor and restart Moonraker.

To skip the update-manager work on install:

```sh
CNC_SKIP_UPDATE_MANAGER=1 ./scripts/install_to_moonraker.sh
# or skip just the clone/pull step (use an existing checkout):
CNC_SKIP_CLONE=1 ./scripts/install_to_moonraker.sh
```

Path and channel overrides are also available as `CNC_REPO_DIR`,
`CNC_REPO_URL`, and `CNC_CHANNEL`. See the script header for the full
list.

A standalone snippet that you can `[include]` from `moonraker.conf`
manually lives at [`config/examples/update-manager.conf`](../config/examples/update-manager.conf).

