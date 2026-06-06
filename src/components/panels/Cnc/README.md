# CNC Panels

This directory contains scaffold panels for a CNC-focused Mainsail fork.

Planned V1 panels:
- `CncStatusPanel.vue`
- `DroPanel.vue`
- `JogPanel.vue`
- `OffsetsPanel.vue`
- `SpindleCoolantPanel.vue`
- `MdiPanel.vue`

Expected integration points:
- dashboard panel registration in `src/store/variables.ts`
- dashboard rendering pipeline in `src/store/gui/*`
- Moonraker and agent-backed state in `src/store/cnc/`
