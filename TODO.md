# Mainsail-CNC Fork Remaining Work

## Completed

- ✅ ExtruderControlPanel removed (panel + subcomponents)
- ✅ SpoolmanPanel removed (panel + subcomponents + store)
- ✅ MmuPanel removed (panel + subcomponents)
- ✅ AfcPanel removed (panel + subcomponents)
- ✅ PauseAtLayerDialog / ExcludeObjectDialog / PrintstatusThumbnail removed from StatusPanel
- ✅ Print → Job terminology in en.json
- ✅ Printer → Machine terminology in en.json
- ✅ CNC metadata card enrichment (GcodefilesPanelListCardFile.vue)
- ✅ Phase 3b: metadata extractor, agent endpoints, sidecar generation
- ✅ Phase 3c: Purge 3D-printer dead code (108 files, 13k+ lines deleted)
  - All MMU, AFC, Spoolman, Extruder component/dialog/mixin files deleted
  - StatusPanel: ExcludeObject, PauseAtLayer, multi-function menu removed
  - TheSettingsMenu: Timelapse, Presets, Heightmap tabs removed
  - ToolheadControlPanel: ZoffsetControl removed
  - StartPrintDialog: AFC/MMU/Spoolman sub-dialogs removed
  - PrintstatusPrinting: AFC toolchange display removed
  - App.vue: spoolman refresh removed
  - socket/actions.ts: notify_active_spool_set handler removed
  - server/index.ts: spoolman Vuex module removed
  - store/variables.ts: spoolman from initComponents removed
  - dashboard.ts: afcIconLogo reference removed
  - Build: 0 TS errors, 0 lint errors

## Remaining Work

### 1. ~~Remove 3D-Printer-Specific Settings Tabs~~ ✅ Done
Components deleted in Phase 3c. Locale keys still need cleanup (see items 9, 10, 11, 12).

### 2. Clean Up 3D File Metadata Labels (en.json)

| Tab | File | Notes |
|-----|------|-------|
| **Timelapse** | `src/components/settings/SettingsTimelapseTab.vue` | Timelapse capture is 3D-printing only; remove tab + en.json keys |
| **Presets** (Preheat) | `src/components/settings/SettingsPresetsTab.vue` | Preheat presets for bed/extruder; remove tab + en.json keys |
| **Heightmap** | `src/components/settings/SettingsHeightmapTab.vue` | Bed mesh is 3D-printer-specific; could repurpose for CNC surface probing or remove entirely |

### 2. Clean Up 3D File Metadata Labels

Remove or rename in `src/locales/en.json` `Files.*` section:
- `BedTemp` → remove
- `ChamberTemp` → remove
- `ExtruderTemp` → remove
- `FilamentName` → remove
- `Filaments` → remove
- `FilamentType` → remove
- `FilamentUsage` → remove
- `FilamentWeight` → remove
- `LayerHeight` → remove
- `NozzleDiameter` → remove
- `ObjectHeight` → remove
- `Preheat` → remove
- `Slicer` → keep (CNC uses CAM tools, but value is generic)

### 3. Remove StatusPanel 3D-Printer References

File: `src/components/panels/StatusPanel.vue`
- Remaining `mdiLayersPlus`, `mdiSelectionRemove` icon imports → remove
- Remaining `btnExcludeObject()`, `btnPauseAtLayer()` references in action arrays → remove
- Remove `mdiPrinter` import if unused

### 4. Remove G-Code Viewer 3D-Printing References

File: `src/components/settings/SettingsGCodeViewerTab.vue`
- Extruder Colors section (lines 58-85) → remove
- Min/Max Feed rate colors → keep (CNC-relevant)

### 5. Remove Settings Control Tab Extruder Section

File: `src/components/settings/SettingsControlTab.vue`
- Extruder heading + `feedamountsE`, `feedratesE`, `showEstimatedExtrusionInfo` → remove (lines 213-265 + getters 497-533)

### 6. Remove UI Settings 3D-Printer References

File: `src/locales/en.json` `Settings.UiSettingsTab.*`:
- `BedScrewsDialog` → remove
- `BedScrewsDialogDescription` → remove
- `BigThumbnailBackground` → keep
- `BoolBigThumbnail` → keep
- `BoolBigThumbnailDescription` → keep
- `BoolHideUploadAndPrintButton` → keep
- `ConfirmOnCancelJob` → keep
- `ConfirmOnCancelJobDescription` → keep
- `ConfirmOnCoolDown` → keep
- `ConfirmOnCoolDownDescription` → keep
- `DisableFanAnimation` → keep
- `GcodeThumbnails` → keep
- `HideSaveConfigForBedMesh` → remove
- `ManualProbeDialog` → remove
- `ManualProbeDialogDescription` → remove
- `NavigationStyle` → keep
- `NavigationStyleDescription` → keep
- `PowerDeviceName` → keep
- `PowerDeviceNameDescription` → keep
- `PrintstatusThumbnailZoom` → keep
- `ScrewsTiltAdjustDialog` → remove
- `ScrewsTiltAdjustDialogDescription` → remove
- `TempchartHeight` → keep
- `HideUpdateWarnings` → keep

### 7. Remove History 3D-Printer References

File: `src/locales/en.json` `History.*` section:
- `EstimatedFilament` → remove
- `EstimatedFilamentWeight` → remove
- `FirstLayerBedTemp` → remove
- `FirstLayerExtTemp` → remove
- `FirstLayerHeight` → remove
- `Filament` → remove
- `FilamentBasedReminder` → remove
- `FilamentBasedReminderDescription` → remove
- `FilamentCalc` → remove
- `FilamentUsage` → remove
- `FilamentUsed` → remove
- `LayerHeight` → remove
- `ObjectHeight` → remove
- `Slicer` → keep
- `SlicerVersion` → keep

### 8. Remove Panels 3D-Printer References

File: `src/locales/en.json` `Panels.*` section:
- `Panels.ExtruderControlPanel.*` → remove (already removed from UI, clean up locale)
- `Panels.SpoolmanPanel.*` → remove (already removed from UI, clean up locale)
- `Panels.StatusPanel.Filament` → remove
- `Panels.StatusPanel.Layer` → remove
- `Panels.StatusPanel.ObjectHeight` → remove
- `Panels.StatusPanel.Toolchange` → remove
- `Panels.StatusPanel.ExcludeObject` → remove
- `Panels.StatusPanel.PauseAtLayer` → remove
- `Panels.ZoffsetPanel.*` → remove
- `Panels.ScrewsTiltAdjust.*` → remove

### 9. Remove Timelapse Locale Keys

File: `src/locales/en.json` `Timelapse.*` section:
- All 50+ keys → remove

### 10. Remove AFC Locale Keys

File: `src/locales/en.json` `Panels.AfcPanel.*` section:
- All keys → remove

### 11. Remove MMU Locale Keys

File: `src/locales/en.json` `Panels.MmuPanel.*` section:
- All keys → remove

### 12. Remove Spoolman Locale Keys

File: `src/locales/en.json` `Panels.SpoolmanPanel.*` section:
- All keys → remove

### 13. Navigation Items

File: `src/routes/index.ts`:
- `Heightmap` nav item → remove or rename to "Probe"
- `Timelapse` nav item → remove
- `G-Code Viewer` → keep (has CNC Mode)

### 14. Dashboard Panel Settings

File: `src/components/panels/Extruder/ExtruderPanelSettings.vue`:
- Already removed from UI, but file still exists → can delete

### 15. Store Modules

- `src/store/gui/spoolman/` → delete directory
- `src/store/server/spoolman/` → delete directory
- `src/store/gui/types.ts` → remove `afc`, `mmu` view state types

### 16. Component Files to Delete

These component files are no longer used (already removed from UI):
- `src/components/panels/ExtruderControlPanel.vue`
- `src/components/panels/Extruder/` (entire directory)
- `src/components/panels/SpoolmanPanel.vue`
- `src/components/panels/Spoolman/` (entire directory)
- `src/components/panels/MmuPanel.vue`
- `src/components/panels/AfcPanel.vue`
- `src/components/panels/Afc/` (entire directory)
- `src/components/panels/Status/PauseAtLayerDialog.vue`
- `src/components/panels/Status/ExcludeObject.vue`
- `src/components/panels/Status/ExcludeObjectDialog.vue`
- `src/components/panels/Status/ExcludeObjectDialogList.vue`
- `src/components/panels/Status/ExcludeObjectDialogMap.vue`
- `src/components/panels/Status/PrintstatusThumbnail.vue`
- `src/components/panels/ToolheadControls/ZoffsetControl.vue`
- `src/components/panels/Gcodefiles/GcodefilesPanelTableRowFileMetadataFilamentsBadge.vue`
- `src/components/settings/SettingsTimelapseTab.vue`
- `src/components/settings/SettingsPresetsTab.vue`
- `src/components/settings/SettingsHeightmapTab.vue`

### 17. Build Verification

After all removals:
- `bun run build` → should pass
- `bun run lint:fix` → should pass
- Check for any TypeScript errors related to removed types

## Future Enhancements (Phase 4+)

- Safe-Z retract on jog
- Spindle/coolant interlock
- Jog limits
- Guarded WCS switching
- Tool-change workflow support
- Machine capability gating (hide features machine doesn't support)
