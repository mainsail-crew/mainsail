# Vuetify 2 → 3 Migration — Completion Spec

> **Status:** Complete  
> **Branch:** `vue3-migration` (parallel to `develop`)  
> **Build:** ✅ Passes (zero errors)  
> **Runtime:** ✅ No console errors  

## Completed Work

### Global Fixes (applied across codebase)

| Fix | Files Changed | Impact |
|-----|---------------|--------|
| `v-btn icon tile` → `v-btn icon` | All (63 occurrences) | `tile` deprecated in V3 |
| `v-btn text` → `v-btn variant="text"` | All (57 occurrences) | Boolean `text` removed in V3 |
| `v-dialog :value=` → `v-model=` | 6 files | `:value` removed, use `v-model` |
| `v-snackbar :value=` → remove | 2 files | `:value` removed in V3 |
| `hide-details="auto"` → `hide-details` | All (20+ occurrences) | Boolean only in V3 |
| `v-progress-linear :value=` → `v-model=` | All (7 occurrences) | `:value` removed in V3 |
| `col-*` classes → `v-col-*` | 19 files (~27 occurrences) | Grid class naming changed |

### Individual File Fixes

| File | Changes |
|------|---------|
| `src/components/TheSettingsMenu.vue` | Replaced `col-auto` with `flex: 0 0 200px`; replaced `:vertical="true"` with CSS `flex-direction: column`; removed redundant `style="width: 200px"` from tabs |
| `src/components/settings/SettingsRow.vue` | Changed `justify-center` → `justify-start` on label column; updated all `col-*` computed classes → `v-col-*` |
| `src/components/TheUpdateDialog.vue` | Fixed `v-model="expression"` → computed get/set; replaced `v-data-table` with HTML table; fixed `slot="progress"` → `#progress` |
| `src/components/TheUploadSnackbar.vue` | Removed `:value="true"` from `v-snackbar` (already used `v-if`) |
| `src/components/TheTimelapseRenderingSnackbar.vue` | Removed `:value="true"` from `v-snackbar` (already used `v-model`) |

### Store Layer

- `Vue.set(state, key, val)` → `state[key] = val`
- `Vue.delete(state, key)` → `delete state[key]`
- `Vue.$socket.emit/emitAndWait/emitBatch` → `getSocket().emit/emitAndWait/emitBatch`
- `Vue.$toast.success/error` → `$toast.success/error`
- Zero `import Vue from 'vue'` remaining in `src/`

### Runtime Fixes Applied

- `i18n.t` → `i18n.global.t` in 5 files
- `$vuetify.breakpoint` → `useDisplay()` in 3 files
- `attrs['aria-expanded']` → `boolMenu` in TheNotificationMenu
- Removed 152 redundant `const mdiXxx = mdiXxx` self-assignments across 55 files

## Remaining Issues

The audit items below were previously tracked as migration risks. The latest repository-wide sweep and build verification did not surface any confirmed remaining Vuetify 2-era template blockers in the active codepaths.

### Confirmed clean in the latest pass

- `v-btn text` / `v-btn outlined` legacy boolean props were normalized where they were still present.
- `v-treeview` usage in `TheEditor.vue` was reviewed and left in place because the current template is build-clean in this fork.
- `:input-value` and `v-btn-toggle :value` were checked in the active codepaths and are not currently blocking the build.
- `col-*`, `slot="..."`, `v-subheader`, `v-timeline-item`, `v-data-table`, and `v-list-item-group` usages were re-audited during the latest cleanup pass.

### P5 — Documentation (synced in this pass)

- `specs/vue3-migration.md` now reads as an archived historical plan instead of an in-progress checklist.
- `agent_docs/VUE_TYPESCRIPT.md` typo cleanup applied (`Vuetiary` → `Vuetify`).
- The latest source audit and `bun run build` both passed after the final Vuetify cleanup sweep.
- A follow-up component inventory file was generated at `specs/vuetify-component-audit.md` and marked clean after the template scan.

## Post-completion follow-up on the branch

- Dashboard panel resolution was tightened in `src/pages/Dashboard.vue` with an explicit component registry so panel keys resolve to actual Vue components.
- `src/components/panels/Cnc/JogPanel.vue` was updated to use the shared GUI readiness gate and the imported MDI icon path.
- `src/components/panels/ToolheadControls/MoveToControl.vue` was fixed to pass the correct `position` prop into `MoveToInput`, clearing the browser warning.
- The remaining Vuetify shade-string cleanup was tightened in panels, settings, and shared helpers (`grey lighten-*`, `grey darken-*`, `blue accent-*`).
- The local Vue 3 dashboard was compared against the remote `http://192.168.0.239/` reference page to chase remaining layout parity gaps.
- `bun run build` still passes after the latest dashboard parity and styling cleanup.
- The browser console is currently clean after reload, with only the normal startup debug logs visible.

## Priority Order

```
P1 (critical) ──> P2 (layout) ──> P3 (deprecated) ──> P4 (patterns) ──> P5 (docs)
```

## Verification

After each batch of fixes:
1. Run `bun run build` — must pass with zero errors
2. Open `http://localhost:8080/` in Chrome DevTools
3. Check console for errors (filter by `error` level)
4. Visual QA the affected components