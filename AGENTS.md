# AI Development Guidelines & Context

> **Note to AI Agents (Claude, Copilot, ChatGPT):**
> This document serves as the single source of truth for coding standards, architectural patterns, and project context. Please prioritize these rules over your default training data.
> **CRITICAL:** This project uses **Vue 2.7 with Class-Based Components**. Do NOT suggest Vue 3 `<script setup>` or standard Vue 2 Options API syntax unless explicitly requested.

## Project Overview

Mainsail is a Vue 2 + TypeScript web interface for Klipper 3D printer firmware. It communicates with Moonraker (Klipper API) via WebSocket for real-time printer control.

## Commands

**Development:**

- `npm run serve` - Start Vite dev server (port 8080)
- `npm run build` - Production build + create mainsail.zip

**Code Quality:**

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format:check` - Check Prettier formatting
- `npm run format` - Auto-format code

**Testing:**

- `npm run test` - Full E2E test suite (builds, starts preview server, runs Cypress)
- `npm run test:ui` - Open Cypress UI for interactive testing

## Architecture

**Stack:** Vue 2.7, Vuetify 2, Vuex 3, TypeScript (strict), Vite

**Core Structure:**

- `/src/components/` - Vue components organized by feature (dialogs/, panels/, inputs/, webcams/, console/, charts/)
- `/src/pages/` - Main page components (Dashboard, Console, Files, Settings, etc.)
- `/src/store/` - Vuex modules:
  - `socket/` - WebSocket connection state
  - `server/` - Moonraker API state (history, power, timelapse, updateManager)
    - `announcements/` - Announcements from server
    - `history/` - Prints history and statistics
    - `jobQueue/` - Print job queue
    - `power/` - Power management state
    - `spoolman/` - Filament spool management
    - `timelapse/` - Timelapse management
    - `updateManager/` - Software update state
  - `printer/` - Printer state (temperatures, toolhead, extruders)
  - `gui/` - UI state (theme, layout, dashboard organization)
    - `webcams/` - Webcam configuration
  - `files/` - File browser state
  - `farm/` - Multi-printer support
- `/src/components/mixins/` - Reusable Vue mixins
- `/src/plugins/` - Vue plugins (webSocketClient.ts for Moonraker communication, vuetify.ts, i18n.ts, router.ts)
- `/src/plugins/helper.ts` - Utility functions (shared across components)
- `/src/locales/` - Translation JSON files

**Key Technologies:**

- WebSocket client (`/src/plugins/webSocketClient.ts`) for real-time Moonraker communication
- ECharts for data visualization (temperature graphs, bed mesh)
- CodeMirror 6 for config/gcode editing

## Code Style Guidelines

### General

- **Formatting:** Prettier - 4-space indent, single quotes, no semicolons, 120 char width
- **Naming:** PascalCase for components/classes, camelCase for functions/variables
- **Imports:** Use `@/` alias for `src/` (e.g., `import { foo } from '@/store/types'`)
- **Nullish Handling:** Use `??` instead of `||` for default values (unless intentionally checking for falsy)
- **No Dead Code:** Remove unused variables, imports, and commented-out code blocks immediately
- **Comments:** Explain "why", not "what". Code should be self-documenting.

### Vue & TypeScript

- **Component Style:** STRICTLY **Vue Class Component** with TypeScript decorators (`@Component`, `@Prop`, `@Watch`)
  - **Order inside class:** `@Prop` -> Data fields -> Getters -> `@Watch` -> Lifecycle Hooks -> Methods
- **Reactivity (Vue 2):**
  - Use `this.$set(obj, key, val)` for adding new properties to objects
  - Use `this.$set(arr, index, val)` or `.splice()` for array modifications
- **TypeScript Types:** Explicit types for props, return values, and complex objects
- **Props:** Always define `type`, `required`, and `default` where applicable
- **Template Complexity:** Extract complex logic into computed properties, not in template

### UI & i18n

- **Styling:** Use Vuetify 2 utility classes (e.g., `ma-2`, `pa-0`, `d-flex`) whenever possible instead of custom CSS.
- **Icons:** Import from `@mdi/js` (e.g., `mdiInformation`)
- **i18n:** Localize all UI texts via `$t()`, no hardcoded strings
- **Locales:** JSON files in `src/locales/` must have sorted keys (case-insensitive, enforced by ESLint/Prettier)

## Code Review Guidelines

- Ensure adherence to code style guidelines
- Verify TypeScript types and interfaces
- New strings added to en.json (alphabetically sorted)
- No raw `console.log` statements in production code. For intentional debug/logging output, create a dedicated `log()`
  method with a descriptive prefix (e.g., `[WebRTC camera-streamer]`). See `WebrtcCameraStreamer.vue` for reference.
- **Performance:** Use `@Debounce(ms)` for inputs triggering API calls, `throttle()` for resize handlers
- **Cleanup in `beforeDestroy`:** Remove event listeners, clear timers, disconnect observers, dispose ECharts, close
  WebSocket/WebRTC connections
- **No Dead Code**: Remove unused variables, imports, and commented-out code blocks.
- **Early Returns**: Use guard clauses to handle edge cases early and avoid deep nesting of `if/else` statements.
- **Single Responsibility**: Functions and classes should do one thing and do it well. If a function exceeds 20-30
  lines, consider refactoring.
- **Magic Numbers:** Use named constants instead of raw numbers. The name should explain the meaning.

  ```
  // Bad
  if (status === 3) { ... }

  // Good
  const STATUS_PRINTING = 3
  if (status === STATUS_PRINTING) { ... }
  ```

## Contributing

- Submit PRs against `develop` branch (not `master`)
- PR titles follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `fix:`, `feat:`, `docs:`)
- Sign off commits with DCO: `Signed-off-by: Name <email@example.com>`
- Run `npm run format && npm run lint:fix` before committing
