# CLAUDE.md - Mainsail Codebase Guide

## Project Overview

Mainsail is a lightweight, responsive web user interface for Klipper 3D printer firmware. It communicates with Klipper via the Moonraker API using WebSocket connections.

**Current Version**: 2.14.0

## Tech Stack

- **Framework**: Vue 2.7 with class-based components (`vue-class-component`, `vue-property-decorator`)
- **UI Library**: Vuetify 2.7 (Material Design)
- **State Management**: Vuex 3.x (namespaced modules)
- **Build Tool**: Vite 5.x
- **Language**: TypeScript 4.9
- **Testing**: Cypress for E2E tests
- **Internationalization**: vue-i18n (20 supported locales)
- **Real-time Communication**: WebSocket (custom plugin at `src/plugins/webSocketClient.ts`)
- **Charts**: ECharts via vue-echarts
- **Code Editor**: CodeMirror 6

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── App.vue                 # Root Vue component
├── pages/                  # Main page components (Dashboard, Console, Files, etc.)
├── components/
│   ├── The*.vue            # Global singleton components (TheTopbar, TheSidebar, etc.)
│   ├── panels/             # Dashboard panel components
│   ├── dialogs/            # Modal dialog components
│   ├── settings/           # Settings tab components
│   ├── mixins/             # Vue class mixins (BaseMixin, etc.)
│   ├── charts/             # Chart components
│   ├── console/            # Console-specific components
│   ├── inputs/             # Input components
│   ├── ui/                 # Reusable UI primitives
│   └── webcams/            # Webcam display components
├── store/                  # Vuex store
│   ├── index.ts            # Store initialization
│   ├── socket/             # WebSocket connection state
│   ├── server/             # Moonraker server state
│   ├── printer/            # Klipper printer state
│   ├── gui/                # UI/user preferences state
│   ├── files/              # File management state
│   ├── farm/               # Multi-printer (farm) state
│   ├── editor/             # Code editor state
│   └── gcodeviewer/        # G-Code viewer state
├── plugins/                # Vue plugins and utilities
│   ├── webSocketClient.ts  # WebSocket communication
│   ├── helpers.ts          # Utility functions
│   ├── vuetify.ts          # Vuetify configuration
│   ├── router.ts           # Vue Router setup
│   └── i18n.ts             # i18n configuration
├── routes/                 # Route definitions
├── locales/                # Translation JSON files (20 languages)
├── types/                  # TypeScript declarations
├── assets/                 # Static assets and styles
└── directives/             # Custom Vue directives
```

## Key Architectural Patterns

### Vuex Store Module Structure

Each store module follows this pattern:
```
store/<module>/
├── index.ts      # Module definition with state, getters, mutations, actions
├── types.ts      # TypeScript interfaces
├── getters.ts    # Computed state derivations
├── actions.ts    # Async operations
└── mutations.ts  # State modifications
```

### Component Mixins

Components extend from mixins in `src/components/mixins/`:
- `base.ts` - Core mixin with common getters (klipperState, printerIsPrinting, etc.)
- `dashboard.ts` - Dashboard-specific helpers
- `control.ts` - Toolhead/motion control
- `gcodefiles.ts` - File management utilities
- Other domain-specific mixins

### Panel Components

Dashboard panels in `src/components/panels/` are dynamically loaded based on user layout configuration. Panels can have subdirectories for related child components:
```
panels/
├── StatusPanel.vue
├── Status/               # Child components for StatusPanel
├── TemperaturePanel.vue
├── Temperature/          # Child components
└── ...
```

## Development Commands

```bash
# Install dependencies
npm ci

# Development server (port 8080)
npm run serve

# Production build
npm run build

# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Formatting
npm run format        # Format code with Prettier
npm run format:check  # Check formatting

# Testing
npm run test          # Run Cypress E2E tests (headless)
npm run test:ui       # Open Cypress test runner

# i18n
npm run i18n-extract  # Extract translation keys
```

## Code Style Guidelines

### Formatting (Prettier)

- **Indentation**: 4 spaces
- **Quotes**: Single quotes
- **Semicolons**: None
- **Line width**: 120 characters
- **Trailing commas**: ES5 style
- **Bracket same line**: True for JSX/HTML

### Vue Components

- Use class-based components with decorators
- Template section first, then script, then style
- Use `@Component` decorator for all components
- Extend appropriate mixin (usually `BaseMixin`)

Example:
```vue
<template>
    <div><!-- template content --></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class MyComponent extends Mixins(BaseMixin) {
    // Component logic
}
</script>

<style scoped>
/* Scoped styles */
</style>
```

### TypeScript

- Use strict mode
- Define interfaces in `types.ts` files within store modules
- Use path alias `@/` for imports from `src/`

### Git Workflow

- **Main branch**: `master` (releases only)
- **Development branch**: `develop`
- **PRs**: Submit against `develop` branch
- **Commit style**: Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- **Sign-off**: Required for all commits

Example commit:
```
feat(dashboard): add temperature preset selector

Signed-off-by: Your Name <your.email@example.com>
```

## Key Store Modules

### `socket` - WebSocket Connection
- Manages connection state to Moonraker
- Handles reconnection logic
- Tracks loading states

### `server` - Moonraker State
- Klipper connection status (`klippy_connected`, `klippy_state`)
- Registered components and directories
- Power devices, job queue, history

### `printer` - Klipper State
- Print stats, temperatures, motion status
- All Klipper config sections and objects
- Real-time printer data

### `gui` - User Interface State
- User preferences and settings
- Dashboard layout configuration
- Console filters, macros, presets

## Localization

- 20 supported languages in `src/locales/`
- Use `$t('key.path')` for translations
- Keys are sorted alphabetically in JSON files
- Extract missing keys: `npm run i18n-extract`

## Testing

Cypress E2E tests are in `cypress/e2e/`. Currently minimal test coverage.

```bash
# Run tests headlessly
npm run test

# Open Cypress UI
npm run test:ui
```

## Important Files

- `vite.config.ts` - Build configuration, PWA settings
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `src/store/variables.ts` - Global constants and defaults

## Communication with Klipper

Mainsail communicates with Klipper through Moonraker's JSON-RPC API over WebSocket:

1. WebSocket connection established in `src/plugins/webSocketClient.ts`
2. Messages dispatched to Vuex store via actions
3. Store modules update state based on received data
4. Components reactively render based on store state

## Common Patterns

### Accessing Printer State
```typescript
// In component with BaseMixin
this.$store.state.printer.print_stats
this.$store.state.printer.toolhead
this.$store.getters['printer/getPrintPercent']
```

### Sending G-Code Commands
```typescript
this.$socket.emit('printer.gcode.script', { script: 'G28' }, { action: 'socket/onGcodeScript' })
```

### Making API Calls
```typescript
this.$store.dispatch('server/addRootDirectory', { name: 'gcodes' })
```

## PWA Support

Mainsail is a Progressive Web App with:
- Service worker for offline caching
- Installable on mobile/desktop
- Auto-update mechanism

Configuration in `vite.config.ts` under `VitePWA`.

## Multi-Printer Support (Farm Mode)

The `farm` store module manages connections to multiple printers. Each printer instance has its own nested store with socket, server, and printer modules.
