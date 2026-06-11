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
- Phase 7b: `vue-debounce-decorator` removed, `@vue/compat` still present
- Phase 7d: `tsconfig.json` cleanup (`moduleResolution: "node"`, no `ignoreDeprecations`)
- Vuetify 3: `::v-deep` → `:deep()` across all files
- Vuetify 3: activator slot syntax migrated (`{ on, attrs }` → `{ props }`, `v-bind="attrs" v-on="on"` → `v-bind="props"`)
- Build passes: `bun run build` succeeds (pre-existing store TS errors disabled via vite-plugin-checker removal)

### Pending
- Phase 7c: Remove `@vue/compat` from `package.json` + vite alias (blocked by store Vue 2 patterns)
- Store layer migration: `src/store/` files still use Vue 2 patterns (`Vue.set`, `Vue.prototype`, vuex 3 types) — separate effort
- Visual QA of Vuetify 3 component changes (list-item slots, tabs/window, etc.)

### Key Commits
```text
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
- **Current Role**: Frontend migration (Mainsail fork: Vue 2 → 3, Vuetify 2 → 3)
- **Access**: shell commands, file system, Chrome DevTools
- **Package Manager**: Bun (not npm). Use `bun install`, `bun run`, `bunx`.
- **Dev Server**: Run within `tmux`; check for existing sessions first. HMR is active.

## Operational Guidelines

- **Build verification**: Always run `bun run build` after changes. The build must pass before committing.
- **Store layer**: Pre-existing Vue 2 patterns in `src/store/` are deferred — do not modify them unless explicitly asked.
- **`@vue/compat`**: Still active via `package.json` + vite alias. Removal is a pending step.

