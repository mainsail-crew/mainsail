# Mainsail Fork Integration Notes

## Local Upstream Clone

A real upstream Mainsail codebase has been cloned into:

- `/Users/isaaceliape/repos/mainsail-cnc/upstream-mainsail`

A local branch was created for CNC work:

- `cnc-scaffold`

## Relevant Upstream Touch Points

Primary directories discovered in Mainsail for CNC integration:

- `src/components/panels/`
- `src/store/`
- `src/store/gui/`
- `src/store/variables.ts`
- `src/types/`

## CNC Scaffold Added To Upstream Tree

### Panels
- `src/components/panels/Cnc/CncStatusPanel.vue`
- `src/components/panels/Cnc/DroPanel.vue`
- `src/components/panels/Cnc/JogPanel.vue`
- `src/components/panels/Cnc/OffsetsPanel.vue`
- `src/components/panels/Cnc/SpindleCoolantPanel.vue`
- `src/components/panels/Cnc/MdiPanel.vue`

Panels read read-only Klipper state (toolhead, gcode_move, print_stats,
configfile) directly from Mainsail's existing `printer` Vuex store. There is
no dedicated `cnc` Vuex module. CNC-specific state and guarded commands are
served by the Moonraker CNC agent (see `moonraker-cnc-agent/`).

## Next Real Integration Steps

1. Register new CNC panel IDs in `src/store/variables.ts`
2. Add dashboard rendering support for CNC panels
3. Define Moonraker or agent-backed fetch/update actions for CNC-specific state
4. Add settings visibility for CNC panels
5. Gate panels behind machine capability detection

## Why This Structure

This keeps the monorepo architecture discussion separate from the actual Mainsail fork surface. The upstream clone is now the concrete frontend target, while the top-level repo still holds docs, agent work, macros, and example configuration.
