# Vue & TypeScript

## Vue 3 Composition API

Use `<script setup lang="ts">` with Composition API.
Never use `vue-class-component` / `vue-property-decorator` (Vue 2 only).

### `<script setup>` Member Order

1. `import` statements
2. `defineProps()` / `defineEmits()` / `defineModel()`
3. `ref()` / `computed()` / `watch()`
4. Composables (`useStore()`, `useI18n()`, custom composables)
5. Lifecycle hooks (`onMounted`, `onBeforeUnmount`)
6. Functions

### Documentation

- [Vue 3 Script Setup](https://vuejs.org/api/sfc-script-setup.html)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

## TypeScript

Use explicit types for props, return values, and complex objects.
Use `@/` alias for imports (e.g., `import { foo } from '@/store/types'`).

Define types/interfaces for all props via `defineProps<{ ... }>()`.

## Template Best Practices

Extract complex logic into computed properties.
Keep templates declarative - no inline filtering or complex expressions.

## Cleanup in onBeforeUnmount

Always clean up resources:

- Event listeners
- Timers and intervals
- Observers (ResizeObserver, MutationObserver)
- ECharts instances
- WebSocket/WebRTC connections

## Vuetiary 3 Component API

| Vuetify 2 | Vuetify 3 |
|-----------|-----------|
| `<v-btn text>` | `<v-btn variant="text">` |
| `<v-btn outlined>` | `<v-btn variant="outlined">` |
| `<v-btn small>` | `<v-btn size="small">` |
| `<v-btn tile>` | `<v-btn rounded="0">` |
| `<v-btn block>` | `<v-btn class="d-block w-100">` |
| `<v-alert dense>` | `<v-alert density="compact">` |
| `col-6` class | `v-col-6` class |
| `$vuetify.breakpoint` | `useDisplay()` |
| `$vuetify.theme` | `useTheme()` |