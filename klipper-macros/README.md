# Klipper CNC Macros

This directory is reserved for the machine-action contract that the frontend and agent assume exists.

## Example categories

- jogging helpers
- WCS selection helpers
- zeroing helpers
- spindle helpers
- coolant helpers
- probing helpers
- park and safe-Z helpers

## Klipper G-code caveats

Stock Klipper does **not** support `G10` (Klipper logs `Unknown command:"G10"`).
The CNC panel uses these equivalents:

| Intent | LinuxCNC / GRBL | Stock Klipper |
| --- | --- | --- |
| Set work zero (current pos → 0) | `G10 L20 Pn X0 Y0` | `G92 X0 Y0` |
| Zero a single axis | `G10 L20 Pn Z0` | `G92 Z0` |
| Apply manual offset | `G10 L2 Pn X<x> Y<y> Z<z>` | `G92 X<x> Y<y> Z<z>` |
| Switch active WCS | `G54`..`G59` | `G54`..`G59` (accepted, no echo) |

Implications:
- `G92` always affects the *currently active* WCS — it does not have a
  `P` parameter. Per-WCS zeroing requires switching WCS first.
- The active WCS is not exposed via `gcode_move.gcode_system` in stock
  Klipper, so the frontend tracks the active WCS locally after sending
  `G54`..`G59`.
- Per-WCS origin offsets (G54_origin .. G59_origin) are not queryable. To
  model true per-WCS origins, the agent would need to track them itself
  or the Klipper build would need `G10` support.
