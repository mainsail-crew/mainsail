# Architecture

**Stack:** Vue 2.7, Vuetify 2, Vuex 3, TypeScript (strict), Vite

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Vue components by feature (dialogs/, panels/, inputs/, webcams/, console/, charts/) |
| `src/components/mixins/` | Reusable Vue mixins |
| `src/pages/` | Page components (Dashboard, Console, Files, Settings) |
| `src/store/` | Vuex modules |
| `src/plugins/` | Vue plugins and utilities |
| `src/locales/` | Translation JSON files |
| `src/types/` | TypeScript type definitions |

## Vuex Store Modules

### `src/store/socket/`
WebSocket connection state

### `src/store/server/`
Moonraker API state with submodules:
- `announcements/` - Server announcements
- `history/` - Print history and statistics
- `jobQueue/` - Print job queue
- `power/` - Power device management
- `sensor/` - Sensor data
- `spoolman/` - Filament spool management
- `timelapse/` - Timelapse recording
- `updateManager/` - Software updates

### `src/store/printer/`
Printer state (temperatures, toolhead, extruders)

### `src/store/gui/`
UI state with submodules:
- `console/` - Console settings
- `gcodehistory/` - G-code command history
- `heightmap/` - Bed mesh visualization
- `macros/` - Macro management
- `maintenance/` - Maintenance tracking
- `miscellaneous/` - Misc UI settings
- `navigation/` - Navigation state
- `notifications/` - UI notifications
- `presets/` - Temperature presets
- `reminders/` - User reminders
- `remoteprinters/` - Multi-printer config
- `webcams/` - Webcam configuration

### `src/store/files/`
File browser state

### `src/store/farm/`
Multi-printer management

### `src/store/editor/`
Config file editor state

### `src/store/gcodeviewer/`
G-code viewer state
