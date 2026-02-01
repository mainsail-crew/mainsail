# Vue & TypeScript

## Vue Class Components

Use Vue Class Component with TypeScript decorators.
Never use Vue 3 `<script setup>` or Options API.

See canonical example: [examples/VueComponentExample.vue](examples/VueComponentExample.vue)

### Class Member Order

1. `@Prop` declarations
2. Data fields (class properties)
3. Getters (computed properties)
4. `@Watch` decorators
5. Lifecycle hooks (mounted, beforeDestroy)
6. Methods

### Documentation

- [vue-class-component](https://class-component.vuejs.org/)
- [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator)

## TypeScript

Use explicit types for props, return values, and complex objects.
Use `@/` alias for imports (e.g., `import { foo } from '@/store/types'`).

Define `type`, `required`, and `default` for all props.

## Template Best Practices

Extract complex logic into computed properties.
Keep templates declarative - no inline filtering or complex expressions.

## Cleanup in beforeDestroy

Always clean up resources:

- Event listeners
- Timers and intervals
- Observers (ResizeObserver, MutationObserver)
- ECharts instances
- WebSocket/WebRTC connections
