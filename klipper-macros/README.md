# Klipper CNC Macros

This directory contains Klipper macros for CNC operation.

## Files

| File | Description |
|------|-------------|
| `cnc_base.cfg` | Scaffold macros (`CNC_SAFE_Z`, `CNC_GO_TO_WORK_ZERO`, `CNC_PARK`) — replace with machine-safe implementations |
| `wcs_macros.cfg` | WCS selector macros (`WCS_1`..`WCS_6`), per-WCS zero macros (`ZERO_X`/`Y`/`Z`/`ALL`), and `MACHINE_COORDS` |

## WCS Macros (`wcs_macros.cfg`)

Requires the `[work_coordinate_systems]` Klipper extra plugin
(`klipper-extras/work_coordinate_systems.py`), which provides:

- **G54–G59** — six independent work coordinate system offset tables
- **G10 L2 P<n> X<v> Y<v> Z<v>** — set WCS n to explicit machine coordinates
- **G10 L20 P<n> X<v> Y<v> Z<v>** — set origin so current position reads as
  the given work coordinates (per-WCS zero)
- **G53** — switch to raw machine coordinates
- **SAVE_WCS** — force-persist offsets to disk
- **WCS_STATUS** — report active WCS and all six offset tables
- JSON persistence at `~/wcs_offsets.json` (survives Klipper restart)

The macros in `wcs_macros.cfg` provide dashboard-friendly aliases:

| Macro | Equivalent |
|-------|------------|
| `WCS_1` .. `WCS_6` | `G54` .. `G59` |
| `MACHINE_COORDS` | `G53` |
| `ZERO_X` / `ZERO_Y` / `ZERO_Z` | `G10 L20 P{active_p} X0` / `Y0` / `Z0` |
| `ZERO_ALL` | `G10 L20 P{active_p} X0 Y0 Z0` + `WCS_STATUS` |

## Installation

1. The WCS Klipper plugin is deployed automatically by
   `scripts/install_to_moonraker.sh` (step 7/11).

2. Add to `printer.cfg`:

   ```ini
   [work_coordinate_systems]
   # persist_file: ~/wcs_offsets.json   # optional override

   [include macros/wcs_macros.cfg]
   ```

3. Restart Klipper.

4. Verify:

   ```
   WCS_STATUS
   ```

   Should show "G54 active" with all six offset tables at zero.

## Background

Stock Klipper does **not** support `G10` (Klipper logs
`Unknown command: "G10"`). Before this plugin was integrated,
the project used `G92` for work-zero operations. The table below
documents what changed:

| Intent | LinuxCNC / GRBL | Old approach (G92) | New approach (WCS plugin) |
| --- | --- | --- | --- |
| Set work zero | `G10 L20 Pn X0 Y0` | `G92 X0 Y0` | `G10 L20 Pn X0 Y0` (per-WCS) |
| Zero a single axis | `G10 L20 Pn Z0` | `G92 Z0` | `G10 L20 Pn Z0` (per-WCS) |
| Apply manual offset | `G10 L2 Pn X<x>` | `G92 X<x>` | `G10 L2 Pn X<x>` (absolute) |
| Switch active WCS | `G54`..`G59` | `G54`..`G59` (accepted, no effect) | `G54`..`G59` (backed by offset table) |
| Query active WCS | system var | not exposed | `printer.work_coordinate_systems.active_wcs` |
| Persist offsets | per-WCS | `SAVE_VARIABLE` (manual) | JSON file (automatic) |
