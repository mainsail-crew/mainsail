# Vue 2 → Vue 3 + Composition API — Migration Plan

> **Status:** Proposed.

## Problem

This project is built on a Vue 2 ecosystem that is at end-of-life. Key
dependencies — `vue-class-component` and `vue-property-decorator` — are
deprecated and have no Vue 3 equivalent. Vuetify 2, Vuex 3, vue-router 3,
and vue-i18n 8 are all superseded by major-version rewrites. Every `.vue`
file (255 total) uses the class-components pattern with `@Component`,
`Mixins()`, `@Prop`, `@Watch`, `@Ref`, etc.

Staying on Vue 2 blocks:
- Vite 7 / modern build optimisations
- Composition API ergonomics (`<script setup>`, `defineProps`, `defineModel`)
- Vuetify 3 component API and theming system
- Pinia (official Vue 3 store, better TypeScript integration)
- Future dependency upgrades that drop Vue 2 support

## Scope

| Metric | Count |
|--------|-------|
| `.vue` files | 255 |
| `.ts` files (non-vue) | 199 |
| Class-component `.vue` files | ~254 |
| Mixin `.ts` files | 18 |
| `@Prop` usages | 323+ |
| `@Watch` usages | 109+ |
| `@Ref` usages | 55+ |
| `@VModel` usages | 28+ |
| `Vue.prototype` injections | 6 |
| `Vue.directive` registrations | 2 |
| Global component registrations | 2 |

## Current Dependency Versions

| Package | Current | Target |
|---------|---------|--------|
| `vue` | `^2.7.10` | `^3.5.x` |
| `vue-class-component` | `^7.2.6` | **remove** |
| `vue-property-decorator` | `^9.1.2` | **remove** |
| `vuetify` | `^2.7.2` | `^3.7.x` |
| `vuex` | `^3.6.2` | `^4.1.x` ∨ Pinia |
| `vue-router` | `^3.5.2` | `^4.5.x` |
| `vue-i18n` | `^8.28.2` | `^10.x` |
| `@vitejs/plugin-vue2` | `^2.3.4` | `@vitejs/plugin-vue` |
| `vue-template-compiler` | `^2.7.16` | **remove** |
| `vue-debounce-decorator` | `^1.0.1` | **remove** (use `lodash.debounce` or custom composable) |
| `vue-observe-visibility` | — | replace with `@vueuse/core` `useIntersectionObserver` |
| `vuedraggable` | `^2.24.3` | `^4.x` (vuedraggable@next) |
| `typescript` | `^4.9.5` | `^5.x` |

## Migration Phases

### Phase 1 — Infrastructure

1. **Upgrade core dependencies** — update `package.json` to Vue 3 versions,
   remove deprecated packages.
2. **Vite plugin swap** — replace `@vitejs/plugin-vue2` with
   `@vitejs/plugin-vue`.
3. **tsconfig cleanup** — remove `experimentalDecorators`, update `moduleResolution`,
   review `target`.
4. **Add `@vue/compat`** (Vue 3 migration build) during transition to catch
   breakages early.
5. **Shim update** — verify `shims-vue.d.ts` works with Vue 3's `DefineComponent`.

### Phase 2 — Global Infrastructure

1. **WebSocket** — refactor `Vue.prototype.$socket` (used in 100+ locations)
   into a composable (`useSocket()`) or provide/inject pattern. The
   `WebSocketClient` class in `src/plugins/webSocketClient.ts` should become
   an injectable service.
2. **EventBus** — replace `Vue.prototype.$eventBus` (9 files) with `mitt`.
3. **Directives** — rewrite `Vue.directive('observe-visibility', ...)` and
   `Vue.directive('longpress', ...)` in Vue 3 directive API.
4. **Global components** — migrate `Vue.component('VueLoadImage', ...)` and
   `Vue.component('EChart', ...)` to `app.component(...)`.
5. **Toast** — migrate `Vue.use(VueToast)` to Vue 3 compatible API.
6. **OverlayScrollbars** — migrate to Vue 3 compatible version.

### Phase 3 — Store, Router, i18n

1. **Vuex → Pinia** (recommended) or **Vuex 4**:
   - Convert each Vuex module to a Pinia store.
   - Replace `Module<State, RootState>` with `defineStore()`.
   - Replace `this.$store.state.x` with `store.x` (or `storeToRefs()`).
   - Replace `this.$store.dispatch('module/action')` with `store.action()`.
   - Replace `this.$store.getters['module/getter']` with `store.getter`.
2. **vue-router v4**:
   - Replace `new VueRouter({ mode: 'history', routes })` with
     `createRouter({ history: createWebHistory(), routes })`.
   - Update navigation guards.
3. **vue-i18n v10**:
   - Replace `new VueI18n(...)` with `createI18n(...)`.
   - Templates keep `$t(...)` syntax; scripts migrate to `useI18n()`.

### Phase 4 — Mixins → Composables

Each of the 18 mixin `.ts` files must be rewritten as a composable function.

| Mixin | Composable | Depends On |
|-------|-----------|------------|
| `base.ts` | `useBase()` | — (core) |
| `control.ts` | `useControl()` | `useBase()` |
| `dashboard.ts` | `useDashboard()` | `useBase()` |
| `navigation.ts` | `useNavigation()` | `useBase()` |
| `console.ts` | `useConsole()` | `useBase()` |
| `extruder.ts` | `useExtruder()` | — |
| `zoffset.ts` | `useZOffset()` | `useBase()` |
| `bedmesh.ts` | `useBedMesh()` | `useBase()` |
| `history.ts` | `useHistory()` | `useBase()` |
| `historyStats.ts` | `useHistoryStats()` | `useHistory()` |
| `webcam.ts` | `useWebcam()` | `useBase()` |
| `services.ts` | `useServices()` | — |
| `timelapse.ts` | `useTimelapse()` | `useBase()` |
| `miscellaneous.ts` | `useMiscellaneous()` | `useBase()` |
| `gcodefiles.ts` | `useGcodeFiles()` | `useBase()` |
| `theme.ts` | `useTheme()` | — |
| `settingsGeneralDatabase.ts` | `useSettingsDatabase()` | `useBase()` |
| `responsive.ts` | `useResponsive()` | — |

**Conversion pattern:**

```ts
// Before (mixin.ts)
import Component from 'vue-class-component'
@Component
export default class MyMixin extends Vue {
    get foo() { return this.$store.state.x }
    bar() { this.$socket.emit('cmd', ...) }
}

// After (composable.ts)
import { computed } from 'vue'
import { useStore } from 'vuex' // or pinia
import { useSocket } from '@/composables/useSocket'

export function useMyMixin() {
    const store = useStore()
    const { emit } = useSocket()
    const foo = computed(() => store.state.x)
    function bar() { emit('cmd', ...) }
    return { foo, bar }
}
```

### Phase 5 — Component Rewrites (Highest volume)

Every `.vue` file must be converted from class-components to `<script setup>`.

**Conversion pattern:**

```vue
<!-- Before -->
<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch, Ref } from 'vue-property-decorator'

@Component({ components: { Foo } })
export default class MyComp extends Mixins(BaseMixin, ControlMixin) {
    @Prop({ type: String, required: true }) readonly name!: string
    @Ref('canvas') readonly canvasRef!: HTMLCanvasElement
    @Watch('name', { immediate: true }) onNameChange(v: string) { ... }
    get doubled() { return this.count * 2 }
    handleClick() { this.$socket.emit('cmd', ...) }
    mounted() { ... }
}
</script>
```

```vue
<!-- After -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'

const props = defineProps<{ name: string }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { $socket } = useBase()
const { count } = useControl()

watch(() => props.name, (v: string) => { ... }, { immediate: true })
const doubled = computed(() => count.value * 2)
function handleClick() { $socket.emit('cmd', ...) }
onMounted(() => { ... })
</script>
```

#### Decorator replacement table

| Decorator | Composition API replacement |
|-----------|---------------------------|
| `@Prop` | `defineProps()` |
| `@Watch` | `watch()` / `watchEffect()` |
| `@Ref` | `ref(null)` + template ref |
| `@VModel` | `defineModel()` |
| `@PropSync` | computed with get/set |
| `@Emit` | `defineEmits()` + `emit(...)` |
| `@Debounce` | `lodash.debounce` or `useDebounceFn` from `@vueuse/core` |
| `get` (computed) | `computed()` |
| `mounted` | `onMounted()` |
| `beforeDestroy` | `onBeforeUnmount()` |
| `$store.state.x` | `store.x` (Pinia) or `store.state.x` (Vuex 4) |
| `$store.getters[...]` | `store.getter` (Pinia) |
| `$store.dispatch(...)` | `store.action()` (Pinia) |
| `this.$t(...)` | `$t(...)` in template; `useI18n().t(...)` in script |
| `this.$socket.emit(...)` | `useSocket().emit(...)` |
| `this.$toast` | `useToast()` composable |
| `this.$vuetify.breakpoint` | `useDisplay()` from Vuetify 3 |
| `this.$vuetify.theme` | `useTheme()` from Vuetify 3 |

### Phase 6 — Vuetify 3

Vuetify 2 → 3 is the single highest-effort upgrade due to pervasive API
changes. Every template must be reviewed.

**Major template changes:**

| Vuetify 2 | Vuetify 3 |
|-----------|-----------|
| `v-btn text` | `v-btn variant="text"` |
| `v-btn icon` | `v-btn icon="mdi..."` (icon prop) |
| `v-text-field` | `v-text-field` (largely similar) |
| `v-select` | `v-select` (largely similar) |
| `v-list-item` `.v-list-item__title` | `v-list-item-title` component |
| `v-dialog` `.v-card` | `v-dialog` + `v-card` (similar) |
| `v-menu` `.v-list` | `v-menu` + `v-list` (similar) |
| `v-slider` | `v-slider` (similar) |
| `v-col col-6` | `v-col cols="6"` |
| `v-row dense` | `v-row density="compact"` |
| `v-subheader` | `v-list-subheader` |
| `$vuetify.theme.dark` | `useTheme().global.name` |
| `$vuetify.breakpoint` | `useDisplay()` |

The `unplugin-vue-components` VuetifyResolver will need to be updated for
Vuetify 3.

### Phase 7 — Polish

1. **Replace `vue-debounce-decorator`** with `lodash.debounce` or
   `@vueuse/core` `useDebounceFn`.
2. **Replace `vue-observe-visibility`** with `@vueuse/core`
   `useIntersectionObserver`.
3. **Update `vuedraggable`** from v2 to v4.
4. **TypeScript strictness** — address new strictness issues from TS 5.x.
5. **Bundle audit** — verify tree-shaking for Vuetify 3, Vue 3, Pinia.
6. **Remove `@vue/compat`** once migration build warnings are resolved.

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Vuetify 3 component breakage | Very High | Phase 6 last; thorough visual QA per component |
| Missed `this.$socket` usages | Medium | Static analysis pass; grep for all `this.$socket` before removal |
| Vuex module chaining breaks | Medium | Convert store tests first; validate each module individually |
| i18n locale key drift | Low | Locale files structure unchanged; key names stay the same |
| Mixin cross-dependencies | Medium | Document dependency graph before conversion |
| Build errors during transition | Medium | Use `@vue/compat` migration build; keep branch isolated until phases 1-3 pass |
| `vue-debounce-decorator` replacement | Low | ~35 usages in ~15 files; straightforward `debounce()` swap |

## Recommended Ordering

```
Phase 1  ──>  Phase 2  ──>  Phase 3  ──>  Phase 4
                                              │
                                              ▼
                                          Phase 5
                                              │
                                              ▼
                                          Phase 6
                                              │
                                              ▼
                                          Phase 7
```

Phases 1–3 lay the foundation and can be validated independently (build
passes, app boots). Phase 4–6 are the bulk of the work and should be done
in order: composables first (Phase 4), then component rewrites (Phase 5),
then Vuetify template updates (Phase 6).

## References

- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Vuetify 3 Upgrade Guide](https://vuetifyjs.com/en/getting-started/upgrade-guide/)
- [Pinia](https://pinia.vuejs.org/) (recommended Vuex replacement)
- [Vuex 4](https://vuex.vuejs.org/) (drop-in Vuex upgrade)
- [vue-i18n v10](https://vue-i18n.intlify.dev/)
- [@vueuse/core](https://vueuse.org/) (Composition API utilities)
- [vue-router v4](https://router.vuejs.org/)
