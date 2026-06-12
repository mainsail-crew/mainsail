# Mainsail — Maintenance Date Picker

Feature branch adding a custom datetime picker to maintenance entry creation and editing.

## Changes

### `feat(maintenance): add datetime picker for start_time`

- Added `<input type="datetime-local">` styled with Vuetify (`v-text-field`) to both **Add** and **Edit** maintenance dialogs
- Default value: current date/time
- Falls back to `Date.now()` if no value selected (backward compatible)
- Uses `History.StartTime` i18n key (already present in all locales)

**Modified files:**
- `src/components/dialogs/HistoryListPanelAddMaintenance.vue`
- `src/components/dialogs/HistoryListPanelEditMaintenance.vue`
- `vite.config.ts` — added Vite dev proxy for Moonraker (avoids CORS)
- `.env.development.local.example` — added `MOONRAKER_TARGET` variable

## How it works

Before, `start_time` was always set to `Date.now()` automatically. Now the user can pick a custom date/time via a native datetime picker in the maintenance form.

```
Form:
  Name: [__________]
  Note: [__________]
  Start Time: [2026-06-12T15:30]  ← NEW
  Reminder: [None / One-time / Repeat]
```

## Dev mode (local)

```powershell
cp .env.development.local.example .env.development.local
# Edit → MOONRAKER_TARGET=http://<printer-ip>:7125
npm run serve
# → http://localhost:8080/
```

## Deploy to Raspberry Pi

```powershell
# 1. Build
npm run build

# 2. Copy to Pi
scp -r dist/* <user>@<printer-ip>:~/mainsail/

# 3. Fix permissions + restart services
ssh -t <user>@<printer-ip> "chmod 755 /home/<user> && chmod -R 755 /home/<user>/mainsail/assets && sudo systemctl restart moonraker && sudo systemctl reload nginx"

# 4. Open in incognito (bypass PWA cache)
# → http://<printer-ip>/
```
