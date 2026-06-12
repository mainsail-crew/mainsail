# AGENTS.md

This file documents the current state and capabilities of AI agents used in this project.

## Vue 2 → Vue 3 Migration Status

**Branch**: `vue3-migration` (parallel to `develop`)

### Complete
- Phase 1: All deps upgraded (Vue 3.5, Vuetify 3, vue-router 4, vue-i18n 11, vuex 4, Pinia 2, TS 5.7)
- Phase 2: Global infra (`createApp`, `@vue/compat` MODE 2, Vuetify 3, mitt, WebSocket composable, directives, router v4, i18n v11, Vuex 4)
- Phase 3: Router v4, i18n v11, Vuex 4 in place
- Phase 4: All 18 mixin `.ts` files → `use*()` composables in `src/composables/`
- Phase 5: All 255+ `.vue` files rewritten from class components to `<script setup>`
- Phase 6: Vuetify 3 template migration (list-item, tabs, subheader, checkbox, table renames)
- Phase 7a: Mixin files deleted (`src/components/mixins/`)
- Phase 7b: `vue-debounce-decorator` removed
- Phase 7c: `@vue/compat` removed from `package.json` + `vite.config.ts` alias + compatConfig
- Phase 7d: `tsconfig.json` cleanup (`moduleResolution: "node"`, no `ignoreDeprecations`)
- Phase 7e: Removed `vite-plugin-checker`
- Phase 7f: Vuetify 3 slot syntax — all `#activator="{ on, attrs }"` → `#activator="{ props }"`, `v-bind="attrs" v-on="on"` → `v-bind="props"`
- Phase 7g: Bulk removal of all `const mdiXxx = mdiXxx` TDZ self-assignments (~200 lines across 100+ files)
- Phase 7h: All remaining `<overlay-scrollbars>` → `<OverlayScrollbarsComponent>` with imports (17 files)
- Phase 7i: All `$vuetify.breakpoint` → `useDisplay()` (4 files: TheTopbar, Timelapse, TemperaturePanelPresets, GcodefilesEntry)
- Phase 7j: All `v-data-table` sort model migrations: `.sync` → `v-model:`, string sortBy → array (HistoryListPanel, ConfigFilesPanel)
- Phase 8 (store migration): Created `src/store/runtime.ts` — socket singleton (`getSocket()`/`setSocket()`) + shared `$toast` via `useToast()`
- All mutation files: `Vue.set(state, key, val)` → `state[key] = val`, `Vue.delete(state, key)` → `delete state[key]`
- All action/mutation files: `Vue.$socket.emit/emitAndWait/emitBatch` → `getSocket().emit/emitAndWait/emitBatch`, `Vue.$toast.success/error` → `$toast.success/error`
- All store files: `import Vue from 'vue'` removed (zero remaining)
- `src/plugins/helpers.ts`: `Vue.set` → direct assignment, import removed
- `src/components/inputs/CodemirrorAsync.ts`: `Vue.component` → `defineAsyncComponent`
- `src/components/webcams/streamers/DynamicCamLoader.ts`: `Vue.component` → exported `getDynamicCamImport()`
- **Zero `import Vue from 'vue'` remaining anywhere in `src/`**
- Fixed pre-existing runtime bugs: `i18n.t` → `i18n.global.t` in 5 files, `$vuetify.breakpoint` → `useDisplay()` in 4 files, `attrs['aria-expanded']` → `boolMenu` in TheNotificationMenu
- Removed ~200 redundant `const mdiXxx = mdiXxx` self-assignments across 100+ files (TDZ errors in `<script setup>`)
- All 7 routes verified in Chrome DevTools with zero console errors:
  - `/` Dashboard, `/allPrinters` Farm, `/cam` Webcam, `/console` MDI, `/files` G-Code Files, `/history`, `/timelapse`
  - `/config` Machine route also verified clean
- Build passes, dev server runs with zero console errors
- `@vue/compat` fully removed — app now runs on pure Vue 3.5 + Vuetify 3

### Pending
- Visual QA of Vuetify 3 component changes (list-item slots, tabs/window, etc.)
- `/viewer` route verification (gcode viewer — large dependency, deferred)

### Key Commits
```text
6c4ebe2c fix: eliminate remaining overlay-scrollbars and activator warnings
eebb3c50 fix: resolve runtime errors across all routes
ae77a107 fix: bulk cleanup of Vue 3 migration errors and warnings
8216fcf2 docs: update stale migration documentation (ARCHITECTURE.md, VUE_TYPESCRIPT.md, websocket.d.ts)
925839f2 fix: migrate deprecated Vuetify 2 props (small/x-small/tile/block/dense/text/accordion)
c7b0b9b1 fix: complete Vuetify 2→3 prop migration (text/outlined/input-value/tile/pagination) and fix runtime warnings
bbd9bfba fix: update v-snackbar slot from #action to #actions for Vuetify 3
0e83a883 refactor: update Vuetify 3 activator slot syntax across all components
bd1b78a7 feat: complete Vuetify 3 template migration, remove mixins, fix build
2b6fc4d5 chore: update bun.lock for Vue 3 ecosystem dependencies
7cca26d4 refactor: convert remaining components to script setup (phase 5)
efea7662 refactor: convert all settings components to script setup (phase 5)
273d7e36 refactor: convert all dialogs to script setup (phase 5)
d8e833ae refactor: convert all panels to script setup (phase 5)
6756f692 refactor: convert pages, app shell, and UI components to script setup
c1977b8b feat: add composables replacing mixins (phase 4)
d5e768fc phase2: global infrastructure for Vue 3
279ed528 phase1: upgrade to Vue 3 ecosystem + @vue/compat
```

## Gemini CLI Agent

- **Purpose**: Interactive CLI agent specializing in software engineering tasks for this project.
- **Current Role**: Frontend maintenance and docs sync for the Mainsail fork (Vue 3.5, Vuetify 3)
- **Access**: shell commands, file system, Chrome DevTools
- **Package Manager**: Bun (not npm). Use `bun install`, `bun run`, `bunx`.
- **Dev Server**: Run within `tmux`; check for existing sessions first. HMR is active.

## Operational Guidelines

- **Build verification**: Always run `bun run build` after changes. The build must pass before committing.
- **Store layer**: Store migration is complete — all Vue 2 patterns (`Vue.set`, `Vue.$socket`, `Vue.$toast`, `import Vue`) removed.
- **`@vue/compat`**: Fully removed — app runs on pure Vue 3.5 + Vuetify 3.
- **Runtime fixes applied**: `i18n.global.t`, `useDisplay()`, `boolMenu`, removed `const mdiXxx = mdiXxx` TDZ bugs across 100+ files.
