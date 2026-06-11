# Vuetify 2 → 3 Migration — Completion Spec

> **Status:** In Progress  
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

### P1 — Critical (functionality breaking)

| Issue | Files | Occurrences | Fix |
|-------|-------|-------------|-----|
| `v-btn text` boolean prop | 20+ files | 55+ | Replace with `variant="text"` |
| `v-btn outlined` boolean prop | 10 files | 20 | Replace with `variant="outlined"` |
| `v-treeview` component | `TheEditor.vue` | 1 file | Component removed in V3, needs replacement |
| `:input-value` on `v-switch` / `v-checkbox` | 3 files | 5 | Replace with `v-model` |
| `v-btn-toggle :value` | `Cnc/OffsetsPanel.vue` | 1 | Replace with `v-model` |

### P2 — Layout (visual breakage)

| Issue | Files | Occurrences | Fix |
|-------|-------|-------------|-----|
| `col-*` classes in dynamic `:class` bindings | 8 files | ~20 | Use `v-col-*` prefix |
| `col-*` classes in static `class` attributes | 2 files | 2 | Use `v-col-*` prefix |
| `v-col col-12` prop syntax | `Webcam.vue` | 1 | Change to `cols="12"` |
| Double `v-` prefix `v-v-col-sm-6` | 2 files | 3 | Remove duplicate prefix |

### P3 — Component API (deprecated but functional)

| Issue | Files | Occurrences | Fix |
|-------|-------|-------------|-----|
| `v-btn tile` | 5 files | 8 | Replace with `rounded="0"` |
| `v-btn small` / `v-btn x-small` | ~15 files | ~40 | Replace with `size="small"` / `size="x-small"` |
| `v-btn block` | 3 files | 15 | Replace with `class="d-block w-100"` |
| `v-alert dense` | 7 files | 9 | Replace with `density="compact"` |
| `v-alert text` prop | 8 files | 10 | Replace with `variant="text"` or `variant="outlined"` |
| `v-toolbar dense` | 1 file | 1 | Replace with `density="compact"` |
| `v-expansion-panels accordion` | 1 file | 1 | `accordion` prop removed in V3 |
| `v-btn-toggle` | 1 file | 1 | API changed, check V3 docs |
| `v-text-field :value` | 1 file | 1 | Replace with `v-model` |

### P4 — Template Patterns (Vue 3 compatibility)

| Issue | Files | Occurrences | Fix |
|-------|-------|-------------|-----|
| `slot="..."` syntax | 5 files | 21 | Replace with `#name` |
| `v-subheader` CSS class | 2 files | 4 | Replace with custom styling |
| `v-timeline` / `v-timeline-item` | 4 files | 20 | API changed in V3 (`align-top` → `side="end"`, `dense` → `density="compact"`, `small` → `size="small"`) |
| `v-data-table` | 4 files | 4 | API changed but component still exists in V3 labs. Review slots/props |
| `v-list-item-group` CSS class | 2 files | 3 | Component removed in V3 |

### P5 — Documentation (cosmetic)

| File | Issue |
|------|-------|
| `agent_docs/ARCHITECTURE.md` | Still references "Vue 2.7, Vuetify 2, Vuex 3" |
| `agent_docs/VUE_TYPESCRIPT.md` | Says "Use Vue Class Component... Never use `<script setup>`" |
| `src/types/websocket.d.ts:6` | Comment references `@vue/compat` (removed) |

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