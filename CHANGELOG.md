<!-- THIS FILE IS UPDATED AUTOMATICALLY, ANY CHANGES WILL BE OVERRIDDEN -->
# Changelog
All notable changes to Mainsail will be documented in this file.

## [2.10.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.10.0) - 2024-02-15
### Features

- **history**: Add interrupted state to history job ([#1738](https://github.com/mainsail-crew/mainsail/pull/1738))
- Add ability to re-arrange job queue's items ([#1692](https://github.com/mainsail-crew/mainsail/pull/1692))
- Add sum + eta in jobqueue panel ([#1770](https://github.com/mainsail-crew/mainsail/pull/1770))
- Add devices dialog in editor ([#1765](https://github.com/mainsail-crew/mainsail/pull/1765))
- Add ability to add history items to job queue ([#1778](https://github.com/mainsail-crew/mainsail/pull/1778))

### Bug Fixes and Improvements

- **console**: Fix color of autocomplete and command list ([#1733](https://github.com/mainsail-crew/mainsail/pull/1733))
- **timelapse**: Fix issue with changing timelapse settings ([#1745](https://github.com/mainsail-crew/mainsail/pull/1745))
- Incorrect scaling of images in dialogImage ([#1746](https://github.com/mainsail-crew/mainsail/pull/1746))
- Show extruder extra menu without load/unload macros ([#1747](https://github.com/mainsail-crew/mainsail/pull/1747))
- Fix ETA calculation from jobqueue during print preheat ([#1773](https://github.com/mainsail-crew/mainsail/pull/1773))
- File upload rate displays `NaN` instead of an actual value ([#1777](https://github.com/mainsail-crew/mainsail/pull/1777))

### Performance

- Batch gcode file metadata requests ([#1737](https://github.com/mainsail-crew/mainsail/pull/1737))

### Refactor

- Refactor spoolman integration to support v2 response ([#1749](https://github.com/mainsail-crew/mainsail/pull/1749))
- Refactor heightmap page ([#1759](https://github.com/mainsail-crew/mainsail/pull/1759))

### Localization

- **da**: Update danish translation ([#1757](https://github.com/mainsail-crew/mainsail/pull/1757))
- **de**: Update german locale ([#1772](https://github.com/mainsail-crew/mainsail/pull/1772))
- **en**: Fix typo in DescriptionPreviouslyThrottled ([#1776](https://github.com/mainsail-crew/mainsail/pull/1776))
- **it**: Update italian translation ([#1763](https://github.com/mainsail-crew/mainsail/pull/1763))
- **zh**: Update chinese locale ([#1767](https://github.com/mainsail-crew/mainsail/pull/1767))

### Other

- **deps**: Update @sindarius/gcodeviewer ([#1755](https://github.com/mainsail-crew/mainsail/pull/1755))
- Update github issue bot text ([#1743](https://github.com/mainsail-crew/mainsail/pull/1743))
- Fix typo in bot text ([#1748](https://github.com/mainsail-crew/mainsail/pull/1748))

## [2.9.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.9.1) - 2023-12-31
### Bug Fixes and Improvements

- **exclude objects**: Fix tooltip position in object map ([#1719](https://github.com/mainsail-crew/mainsail/pull/1719))
- **exclude_objects**: Fix order of objects in map ([#1716](https://github.com/mainsail-crew/mainsail/pull/1716))
- **temperature**: Hide multiple same temp presets in dropdown ([#1724](https://github.com/mainsail-crew/mainsail/pull/1724))
- Fix language switch ([#1704](https://github.com/mainsail-crew/mainsail/pull/1704))
- Only display section options which exists in ExtruderPanel ([#1694](https://github.com/mainsail-crew/mainsail/pull/1694))
- Fix spoolman list (comment & location) ([#1693](https://github.com/mainsail-crew/mainsail/pull/1693))
- Fix theme issue in tempchart ([#1706](https://github.com/mainsail-crew/mainsail/pull/1706))
- Fix aspectRatio in MjpegstreamerAdaptive ([#1707](https://github.com/mainsail-crew/mainsail/pull/1707))
- Fix webcam url with multiple moonraker instances ([#1713](https://github.com/mainsail-crew/mainsail/pull/1713))
- Fix icon for deleted files in the history ([#1708](https://github.com/mainsail-crew/mainsail/pull/1708))
- Fix tooltip of tempchart ([#1715](https://github.com/mainsail-crew/mainsail/pull/1715))
- Fix long initial time with huge print history ([#1714](https://github.com/mainsail-crew/mainsail/pull/1714))
- Only check initableServerComponents for init server check ([#1725](https://github.com/mainsail-crew/mainsail/pull/1725))

### Refactor

- Remove unused icon in SettingsGeneralTab.vue ([#1705](https://github.com/mainsail-crew/mainsail/pull/1705))

### Localization

- **sv**: Update swedish translation ([#1720](https://github.com/mainsail-crew/mainsail/pull/1720))

## [2.9.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.9.0) - 2023-12-16
### Features

- **file browsers**: Add ability to quickly jump to any segment ([#1659](https://github.com/mainsail-crew/mainsail/pull/1659))
- **webcam**: Add support for go2rtc webrtc ([#1651](https://github.com/mainsail-crew/mainsail/pull/1651))
- Rework spoolman change dialog to display spool ids ([#1605](https://github.com/mainsail-crew/mainsail/pull/1605))
- Add buttons for PURGE_FILAMENT and CLEAN_NOZZLE ([#1641](https://github.com/mainsail-crew/mainsail/pull/1641))
- Add different color maps for heightmap ([#1666](https://github.com/mainsail-crew/mainsail/pull/1666))
- Add option to change the save z-offset method ([#1631](https://github.com/mainsail-crew/mainsail/pull/1631))
- Add option to hide parts of the ToolheadPanel ([#1621](https://github.com/mainsail-crew/mainsail/pull/1621))
- Add macro prompt dialog ([#1630](https://github.com/mainsail-crew/mainsail/pull/1630))
- Add minimum_cruise_ratio support in MotionSettingsPanel ([#1670](https://github.com/mainsail-crew/mainsail/pull/1670))
- Show filament sensor state even when it is disabled ([#1656](https://github.com/mainsail-crew/mainsail/pull/1656))
- Add option to hide parts of the ExtruderPanel ([#1679](https://github.com/mainsail-crew/mainsail/pull/1679))
- Add moonraker init component check with warning ([#1680](https://github.com/mainsail-crew/mainsail/pull/1680))
- Resize heightmap to get a better heightmap overview ([#1683](https://github.com/mainsail-crew/mainsail/pull/1683))
- Light mode ui ([#1580](https://github.com/mainsail-crew/mainsail/pull/1580))
- Improve contrast of job queue items count ([#1678](https://github.com/mainsail-crew/mainsail/pull/1678))
- Add mmu.log to logfiles panel ([#1685](https://github.com/mainsail-crew/mainsail/pull/1685))

### Bug Fixes and Improvements

- **pwa**: Make sure the service worker can be loaded ([#1594](https://github.com/mainsail-crew/mainsail/pull/1594))
- Allow null as spool id response from spoolman ([#1611](https://github.com/mainsail-crew/mainsail/pull/1611))
- Fix filament type check in StartPrintDialog ([#1620](https://github.com/mainsail-crew/mainsail/pull/1620))
- Fix round issue in git commit list diff calculation ([#1637](https://github.com/mainsail-crew/mainsail/pull/1637))
- Fix hide/show navi points in different languages ([#1638](https://github.com/mainsail-crew/mainsail/pull/1638))
- Fix adding multiple presets ([#1636](https://github.com/mainsail-crew/mainsail/pull/1636))
- Fix wrong output in temp chart tooltip ([#1646](https://github.com/mainsail-crew/mainsail/pull/1646))
- Fix ETA 12hour detection if the user use default setting ([#1657](https://github.com/mainsail-crew/mainsail/pull/1657))
- Fix 12hour browser time format detection ([#1660](https://github.com/mainsail-crew/mainsail/pull/1660))
- Fix 12-hour time format in ETA output ([#1662](https://github.com/mainsail-crew/mainsail/pull/1662))
- Fix issue with hidden LED groups ([#1669](https://github.com/mainsail-crew/mainsail/pull/1669))
- More tolerant with thumbnails sizes ([#1674](https://github.com/mainsail-crew/mainsail/pull/1674))
- Add anchor to regex for special msg replacement ([#1635](https://github.com/mainsail-crew/mainsail/pull/1635))
- Add port to webcam url if port is not 80 ([#1566](https://github.com/mainsail-crew/mainsail/pull/1566))
- Add random colors, when colorArray is too small ([#1688](https://github.com/mainsail-crew/mainsail/pull/1688))
- Incorrect sum of rest jobs printing time ([#1689](https://github.com/mainsail-crew/mainsail/pull/1689))
- Fix panels squeezed on mobile when navi is open ([#1690](https://github.com/mainsail-crew/mainsail/pull/1690))

### Performance

- **vite**: Chunk webcams, locales and large libraries ([#1578](https://github.com/mainsail-crew/mainsail/pull/1578))

### Refactor

- Also allow FILAMENT_LOAD and FILAMENT_UNLOAD macros ([#1639](https://github.com/mainsail-crew/mainsail/pull/1639))
- Fix linter issue in SettingsControlTab ([#1677](https://github.com/mainsail-crew/mainsail/pull/1677))
- Import unused getter from printer/getters ([#1686](https://github.com/mainsail-crew/mainsail/pull/1686))

### Localization

- **da**: Update Danish locale ([#1634](https://github.com/mainsail-crew/mainsail/pull/1634))
- **de**: Update german locale ([#1687](https://github.com/mainsail-crew/mainsail/pull/1687))
- **fr**: French translation of the Spoolman module ([#1598](https://github.com/mainsail-crew/mainsail/pull/1598))
- **fr**: French full translation ([#1613](https://github.com/mainsail-crew/mainsail/pull/1613))
- **fr**: Correction of several errors ([#1614](https://github.com/mainsail-crew/mainsail/pull/1614))
- **fr**: Correction of the term Unretract ([#1628](https://github.com/mainsail-crew/mainsail/pull/1628))
- **fr**: Add translation clean_nozzle and purge_filament ([#1645](https://github.com/mainsail-crew/mainsail/pull/1645))
- **fr**: Add HeightMapTab and others updates ([#1667](https://github.com/mainsail-crew/mainsail/pull/1667))
- **it**: Italian translation of the Spoolman module ([#1606](https://github.com/mainsail-crew/mainsail/pull/1606))
- **it**: Italian translation completed and more fixes ([#1608](https://github.com/mainsail-crew/mainsail/pull/1608))
- **it**: Fix several old translation errors ([#1609](https://github.com/mainsail-crew/mainsail/pull/1609))
- **pl**: Update Polish translations ([#1593](https://github.com/mainsail-crew/mainsail/pull/1593))
- **zh**: Update Chinese (zh) localization ([#1595](https://github.com/mainsail-crew/mainsail/pull/1595))

### Other

- Disable workbox logs ([#1629](https://github.com/mainsail-crew/mainsail/pull/1629))
- Add workflow to check PR title for conventional commits ([#1640](https://github.com/mainsail-crew/mainsail/pull/1640))
- Update check_locale.yml to new github workflow output ([#1584](https://github.com/mainsail-crew/mainsail/pull/1584))
- Fix check-pr-title workflow to allow locale as type ([#1663](https://github.com/mainsail-crew/mainsail/pull/1663))

## [2.8.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.8.0) - 2023-10-07
### Features

- Add warning for outdated browsers ([#1537](https://github.com/mainsail-crew/mainsail/pull/1537))
- Automatic selection of the gcode offset save gcode ([#1531](https://github.com/mainsail-crew/mainsail/pull/1531))
- Hide Moonraker power devices with a `_` as first char ([#1545](https://github.com/mainsail-crew/mainsail/pull/1545))
- Add option to block autoscroll in console ([#1519](https://github.com/mainsail-crew/mainsail/pull/1519))
- Add 12-hour time format in printers overview ([#1571](https://github.com/mainsail-crew/mainsail/pull/1571))
- Add monitors (like TMC2240) to Temperature Panel ([#1532](https://github.com/mainsail-crew/mainsail/pull/1532))
- Add spoolman support ([#1542](https://github.com/mainsail-crew/mainsail/pull/1542))
- Add optional background color for big gcode thumbnails ([#1535](https://github.com/mainsail-crew/mainsail/pull/1535))

### Bug Fixes and Improvements

- Show confirm emergency stop dialog only when turned on ([#1526](https://github.com/mainsail-crew/mainsail/pull/1526))
- Eta time format detection from browser ([#1522](https://github.com/mainsail-crew/mainsail/pull/1522))
- Fix min/max positions in heightmap current mesh data panel ([#1533](https://github.com/mainsail-crew/mainsail/pull/1533))
- Fix autorestart of webcam camerastreamer ([#1546](https://github.com/mainsail-crew/mainsail/pull/1546))
- Fix missing reset options for print history data ([#1534](https://github.com/mainsail-crew/mainsail/pull/1534))
- Fix some issues with the presets ([#1529](https://github.com/mainsail-crew/mainsail/pull/1529))
- Fix macro parameter with spaces ([#1551](https://github.com/mainsail-crew/mainsail/pull/1551))
- Fix type issue in TemperaturePanelListItem ([#1563](https://github.com/mainsail-crew/mainsail/pull/1563))
- Fix webcam (camera-streamer) stop autorestart beforeDestory ([#1556](https://github.com/mainsail-crew/mainsail/pull/1556))
- Fix gcode command for generic_heater in presets ([#1569](https://github.com/mainsail-crew/mainsail/pull/1569))
- Fix wrong date function in multiple files ([#1568](https://github.com/mainsail-crew/mainsail/pull/1568))
- Fix WebRTC (camera-streamer) port with external instance ([#1586](https://github.com/mainsail-crew/mainsail/pull/1586))
- Fix webcam flip in timelapse preview ([#1587](https://github.com/mainsail-crew/mainsail/pull/1587))
- Fix webcam switch button ([#1589](https://github.com/mainsail-crew/mainsail/pull/1589))

### Refactor

- Refactor ToolheadControlPanel ([#1530](https://github.com/mainsail-crew/mainsail/pull/1530))
- Split ExtruderControlPanel.vue in multiple SFC ([#1565](https://github.com/mainsail-crew/mainsail/pull/1565))
- Remove unused import in store/printer/getters.ts ([#1574](https://github.com/mainsail-crew/mainsail/pull/1574))
- Rework tool color in extruder panel ([#1576](https://github.com/mainsail-crew/mainsail/pull/1576))
- Update webcam "WebRTC MediaMTX" client ([#1558](https://github.com/mainsail-crew/mainsail/pull/1558))

### Localization

- **de**: Update german translations ([#1583](https://github.com/mainsail-crew/mainsail/pull/1583))
- **en**: Remove unused keys in english locale ([#1585](https://github.com/mainsail-crew/mainsail/pull/1585))
- **es**: Update spanish locale ([#1548](https://github.com/mainsail-crew/mainsail/pull/1548))
- **pl**: Update Polish translations ([#1544](https://github.com/mainsail-crew/mainsail/pull/1544))
- **pl**: Update polish locale ([#1554](https://github.com/mainsail-crew/mainsail/pull/1554))
- **pl**: Update Polish translations ([#1573](https://github.com/mainsail-crew/mainsail/pull/1573))
- **zh**: Update Chinese (zh) localization ([#1588](https://github.com/mainsail-crew/mainsail/pull/1588))

### Other

- Fix ftp upload in release workflow ([#1590](https://github.com/mainsail-crew/mainsail/pull/1590))

## [2.7.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.7.1) - 2023-08-16
### Bug Fixes and Improvements

- Fix issue on tablet and smaller devices with the sidebar ([#1518](https://github.com/mainsail-crew/mainsail/pull/1518))

### Localization

- **zh**: Update Chinese (zh) localization ([#1521](https://github.com/mainsail-crew/mainsail/pull/1521))

## [2.7.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.7.0) - 2023-08-12
### Features

- Hide screws tilt adjust dialog, when using MAX_DEVIATION ([#1474](https://github.com/mainsail-crew/mainsail/pull/1474))
- Add option to hide MCU/Host sensors in the temp panel ([#1496](https://github.com/mainsail-crew/mainsail/pull/1496))
- Hide axis controls during print ([#1452](https://github.com/mainsail-crew/mainsail/pull/1452))
- Add an option to set the sidebar default state ([#1462](https://github.com/mainsail-crew/mainsail/pull/1462))
- Add option to hide FPS counter in webcams ([#1488](https://github.com/mainsail-crew/mainsail/pull/1488))
- Add a select all option on the backup and restore dialogs ([#1448](https://github.com/mainsail-crew/mainsail/pull/1448))
- Add nevermore to temperature panel ([#1511](https://github.com/mainsail-crew/mainsail/pull/1511))

### Bug Fixes and Improvements

- Fix cursor style for item name to be a pointer ([#1514](https://github.com/mainsail-crew/mainsail/pull/1514))

### Refactor

- Soft down info buttons in update manager ([#1513](https://github.com/mainsail-crew/mainsail/pull/1513))

### Localization

- **pl**: Update Polish translation ([#1502](https://github.com/mainsail-crew/mainsail/pull/1502))
- **pl**: Update Polish translation ([#1515](https://github.com/mainsail-crew/mainsail/pull/1515))
- **zh**: Update Chinese (zh) localization ([#1503](https://github.com/mainsail-crew/mainsail/pull/1503))

## [2.6.2](https://github.com/mainsail-crew/mainsail/releases/tag/v2.6.2) - 2023-07-30
### Bug Fixes and Improvements

- Fix editor save & restart button behavior ([#1483](https://github.com/mainsail-crew/mainsail/pull/1483))
- Hide rpm in temperature_fans without tachometer_pin ([#1489](https://github.com/mainsail-crew/mainsail/pull/1489))
- Fix flip function in several webcam clients ([#1487](https://github.com/mainsail-crew/mainsail/pull/1487))
- Fix issue with camel-case object names in temperature panel ([#1491](https://github.com/mainsail-crew/mainsail/pull/1491))
- Use webcam name instead of UUID for timelapse plugin ([#1492](https://github.com/mainsail-crew/mainsail/pull/1492))
- Fix issue with create/edit presets and refactor settings ([#1499](https://github.com/mainsail-crew/mainsail/pull/1499))
- Fix multiple issues in the refactored update manager ([#1497](https://github.com/mainsail-crew/mainsail/pull/1497))
- Fix issue with cannot extrude after a Klipper restart ([#1495](https://github.com/mainsail-crew/mainsail/pull/1495))

### Refactor

- Refactor SettingsRow ([#1484](https://github.com/mainsail-crew/mainsail/pull/1484))

### Localization

- **pl**: Update Polish translation ([#1482](https://github.com/mainsail-crew/mainsail/pull/1482))
- **zh**: Update chinese locale ([#1486](https://github.com/mainsail-crew/mainsail/pull/1486))

## [2.6.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.6.1) - 2023-07-24
### Bug Fixes and Improvements

- Show delete dialog for single files too ([#1442](https://github.com/mainsail-crew/mainsail/pull/1442))
- Remove variable check in klipper config StreamParser ([#1435](https://github.com/mainsail-crew/mainsail/pull/1435))
- Fix condition in restartServiceNameExists check ([#1450](https://github.com/mainsail-crew/mainsail/pull/1450))
- Avoid hitting 100% before print is complete ([#1455](https://github.com/mainsail-crew/mainsail/pull/1455))
- Fix issue with ETA and 12h time format ([#1463](https://github.com/mainsail-crew/mainsail/pull/1463))
- Fix issue with CSV separator in contents ([#1460](https://github.com/mainsail-crew/mainsail/pull/1460))
- Fix issue with webcams in farm printers ([#1469](https://github.com/mainsail-crew/mainsail/pull/1469))

### Refactor

- Build version file for moonraker ([#1449](https://github.com/mainsail-crew/mainsail/pull/1449))
- Use moonraker webcam api instead of direct DB access ([#1445](https://github.com/mainsail-crew/mainsail/pull/1445))
- Change SettingsGeneralTab file ([#1475](https://github.com/mainsail-crew/mainsail/pull/1475))
- Extract Presets and Settings from TemperaturePanel ([#1465](https://github.com/mainsail-crew/mainsail/pull/1465))
- Display errors and warnings in the update_manager ([#1453](https://github.com/mainsail-crew/mainsail/pull/1453))

### Localization

- **pl**: Update Polish translation ([#1434](https://github.com/mainsail-crew/mainsail/pull/1434))
- **pl**: Update Polish translation ([#1447](https://github.com/mainsail-crew/mainsail/pull/1447))
- **pl**: Update polish locale ([#1471](https://github.com/mainsail-crew/mainsail/pull/1471))
- **pl**: Update Polish translation ([#1476](https://github.com/mainsail-crew/mainsail/pull/1476))
- **tr**: Update turkish locale ([#1480](https://github.com/mainsail-crew/mainsail/pull/1480))
- **zh**: Update Chinese (zh) localization ([#1459](https://github.com/mainsail-crew/mainsail/pull/1459))

### Other

- **pwa**: Remove debug warnings in browser console ([#1441](https://github.com/mainsail-crew/mainsail/pull/1441))
- Add dev-dist to .gitignore ([#1451](https://github.com/mainsail-crew/mainsail/pull/1451))

## [2.6.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.6.0) - 2023-06-19
### Features

- Allow negative time estimate in slicer ([#1372](https://github.com/mainsail-crew/mainsail/pull/1372))
- Customize sidebar navi ([#1336](https://github.com/mainsail-crew/mainsail/pull/1336))
- Add AHT10 to additionalSensors ([#1378](https://github.com/mainsail-crew/mainsail/pull/1378))
- Add function to duplicate gcode files ([#1321](https://github.com/mainsail-crew/mainsail/pull/1321))
- Add jmuxer-stream webcam type, supporting raw h264 ([#1342](https://github.com/mainsail-crew/mainsail/pull/1342))
- Add options to disable klipper helper dialogs ([#1319](https://github.com/mainsail-crew/mainsail/pull/1319))
- Add facility to Scan Metadata from G-code Files ([#1316](https://github.com/mainsail-crew/mainsail/pull/1316))
- Allows adjustable tab size in file editor ([#1354](https://github.com/mainsail-crew/mainsail/pull/1354))
- Add printer name to browser tab while printing or complete ([#1371](https://github.com/mainsail-crew/mainsail/pull/1371))
- Add an option to change the height of the temperatur chart ([#1391](https://github.com/mainsail-crew/mainsail/pull/1391))
- Updating WebRTC with camera-streamer signaling protocol ([#1417](https://github.com/mainsail-crew/mainsail/pull/1417))
- Add portuguese/brazil translate ([#1407](https://github.com/mainsail-crew/mainsail/pull/1407))
- Add bed aspect ratio to heightmap graph ([#1420](https://github.com/mainsail-crew/mainsail/pull/1420))
- Add WebRTC (MediaMTX / rtsp-simple-server) webcam mode ([#1318](https://github.com/mainsail-crew/mainsail/pull/1318))
- Add retry button to ScrewsTiltAdjust helper dialog ([#1429](https://github.com/mainsail-crew/mainsail/pull/1429))

### Bug Fixes and Improvements

- Find LOAD & UNLOAD_FILAMENT macros case-insensitive ([#1335](https://github.com/mainsail-crew/mainsail/pull/1335))
- Fix thumbnail guide link in settings ([#1337](https://github.com/mainsail-crew/mainsail/pull/1337))
- Fix configuration guide link for thumbnails ([#1338](https://github.com/mainsail-crew/mainsail/pull/1338))
- Fix miscellaneous slider + button for fans/outputs with max power ([#1344](https://github.com/mainsail-crew/mainsail/pull/1344))
- Add gcode offset to live position in gcodeviewer ([#1341](https://github.com/mainsail-crew/mainsail/pull/1341))
- Fix zip file timestamp ([#1375](https://github.com/mainsail-crew/mainsail/pull/1375))
- Make the correct notification appear on gcode file move ([#1376](https://github.com/mainsail-crew/mainsail/pull/1376))
- Fix issue when moving a file to the root directory ([#1377](https://github.com/mainsail-crew/mainsail/pull/1377))
- DisableFanAnimation getter getting wrong value ([#1381](https://github.com/mainsail-crew/mainsail/pull/1381))
- Check only not empty filename for metadata in farm printers ([#1392](https://github.com/mainsail-crew/mainsail/pull/1392))
- Fix navigation to display allPrinters ([#1423](https://github.com/mainsail-crew/mainsail/pull/1423))

### Refactor

- Improve syntax highlighting and change theme in editor ([#1200](https://github.com/mainsail-crew/mainsail/pull/1200))
- Add webcam-wrapper component ([#1422](https://github.com/mainsail-crew/mainsail/pull/1422))
- Refactor Panel.vue ([#1427](https://github.com/mainsail-crew/mainsail/pull/1427))
- Remove unused import in FarmPrinterPanel.vue ([#1428](https://github.com/mainsail-crew/mainsail/pull/1428))

### Styling

- Fix eslint issue in SettingsNavigationTabItem ([#1383](https://github.com/mainsail-crew/mainsail/pull/1383))

### Localization

- **de**: Update German localization ([#1424](https://github.com/mainsail-crew/mainsail/pull/1424))
- **en**: Remove unused key ([#1425](https://github.com/mainsail-crew/mainsail/pull/1425))
- **ko**: Update Korean localization ([#1368](https://github.com/mainsail-crew/mainsail/pull/1368))
- **pl**: Update Polish language ([#1411](https://github.com/mainsail-crew/mainsail/pull/1411))
- **ru**: Update russian localization ([#1394](https://github.com/mainsail-crew/mainsail/pull/1394))
- **zh**: Fix translation ([#1418](https://github.com/mainsail-crew/mainsail/pull/1418))
- **zh_TW**: Update Chinese localization ([#1386](https://github.com/mainsail-crew/mainsail/pull/1386))

### Documentation

- Add Contributing section in README.md ([#1339](https://github.com/mainsail-crew/mainsail/pull/1339))
- Fix broken coding standards link in contributing doc ([#1415](https://github.com/mainsail-crew/mainsail/pull/1415))

### Other

- Exclude htaccess file on upload to my.mainsail.xyz ([#1347](https://github.com/mainsail-crew/mainsail/pull/1347))
- Add PULL_REQUEST_TEMPLATE ([#1340](https://github.com/mainsail-crew/mainsail/pull/1340))
- Add PWA caching and cache updater ([#1421](https://github.com/mainsail-crew/mainsail/pull/1421))
- Update ftp upload action in release workflow ([#1430](https://github.com/mainsail-crew/mainsail/pull/1430))

## [2.5.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.5.1) - 2023-04-02
### Bug Fixes and Improvements

- Missing M117 output in status panel ([#1309](https://github.com/mainsail-crew/mainsail/pull/1309))
- Disallow non-ascii chars in bed_mesh name ([#1311](https://github.com/mainsail-crew/mainsail/pull/1311))
- Fix issue of empty Screws tilt adjust helper dialog ([#1329](https://github.com/mainsail-crew/mainsail/pull/1329))
- Fix invalid name input checks ([#1312](https://github.com/mainsail-crew/mainsail/pull/1312))

### Localization

- **cz**: Add Czech localization ([#1327](https://github.com/mainsail-crew/mainsail/pull/1327))
- **de**: Update German localization ([#1326](https://github.com/mainsail-crew/mainsail/pull/1326))

### Other

- Update caniuse ([#1330](https://github.com/mainsail-crew/mainsail/pull/1330))

## [2.5.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.5.0) - 2023-03-12
### Features

- Add multi download to ConfigFilesPanel.vue ([#1194](https://github.com/mainsail-crew/mainsail/pull/1194))
- Add table view for print status stats ([#1192](https://github.com/mainsail-crew/mainsail/pull/1192))
- Add new CodeStream control to Gcodeviewer ([#1224](https://github.com/mainsail-crew/mainsail/pull/1224))
- Add support for cnc mode in g-code viewer ([#1239](https://github.com/mainsail-crew/mainsail/pull/1239))
- Hide/ignore .git directories in file init process ([#1227](https://github.com/mainsail-crew/mainsail/pull/1227))
- Log rollover function for klipper and moonraker ([#1243](https://github.com/mainsail-crew/mainsail/pull/1243))
- Add power button on dashboard to switch printer on ([#1254](https://github.com/mainsail-crew/mainsail/pull/1254))
- Add button to hide SAVE_CONFIG button for pending bed_mesh ([#1255](https://github.com/mainsail-crew/mainsail/pull/1255))
- Add HLS Support for webcams ([#1258](https://github.com/mainsail-crew/mainsail/pull/1258))
- Add helper display for screws_tilt_adjust ([#1261](https://github.com/mainsail-crew/mainsail/pull/1261))
- Add jobs to queue in batches ([#1253](https://github.com/mainsail-crew/mainsail/pull/1253))
- Add function to send PAUSE at a specific layer change ([#1230](https://github.com/mainsail-crew/mainsail/pull/1230))
- Add x_only and y_only option in timelapse park position ([#1231](https://github.com/mainsail-crew/mainsail/pull/1231))
- Support a color or colour variable from tool change macros ([#1244](https://github.com/mainsail-crew/mainsail/pull/1244))
- Max webcam height to fit on the screen ([#1246](https://github.com/mainsail-crew/mainsail/pull/1246))
- Add WebRTC (camera streamer) support ([#1275](https://github.com/mainsail-crew/mainsail/pull/1275))
- Allow fan animations to be disabled to save browser perf. ([#1232](https://github.com/mainsail-crew/mainsail/pull/1232))

### Bug Fixes and Improvements

- Hide temperature sensors with `_` at first char ([#1195](https://github.com/mainsail-crew/mainsail/pull/1195))
- Add webcam rotate to timelapse preview ([#1198](https://github.com/mainsail-crew/mainsail/pull/1198))
- Fix ExcludeObjectDialogMap for delta printers ([#1217](https://github.com/mainsail-crew/mainsail/pull/1217))
- G-Code Viewer UI fixes ([#1240](https://github.com/mainsail-crew/mainsail/pull/1240))
- Fix dateTime output in print history detail dialog ([#1248](https://github.com/mainsail-crew/mainsail/pull/1248))
- Hide unused panels on dashboard ([#1233](https://github.com/mainsail-crew/mainsail/pull/1233))
- Fix cancel button in rollover logs dialog ([#1256](https://github.com/mainsail-crew/mainsail/pull/1256))
- Fix output of klippy state, if UDS path/address dont fit ([#1263](https://github.com/mainsail-crew/mainsail/pull/1263))
- Fix position of webcam fps ([#1278](https://github.com/mainsail-crew/mainsail/pull/1278))
- Fix browser title, when printer is off ([#1300](https://github.com/mainsail-crew/mainsail/pull/1300))
- Only display PAUSE AT LAYER button, when the macros exists ([#1291](https://github.com/mainsail-crew/mainsail/pull/1291))

### Refactor

- Use moonraker zip function ([#1245](https://github.com/mainsail-crew/mainsail/pull/1245))
- Rename download zip name ([#1252](https://github.com/mainsail-crew/mainsail/pull/1252))
- HLS streamer - improve latency ([#1268](https://github.com/mainsail-crew/mainsail/pull/1268))
- Change jobqueue entry attribute to hyphenated names ([#1271](https://github.com/mainsail-crew/mainsail/pull/1271))
- Add ENABLE=1 to SET_PAUSE_AT_LAYER/NEXT_LAYER ([#1293](https://github.com/mainsail-crew/mainsail/pull/1293))

### Localization

- **da**: Update Danish localization ([#1288](https://github.com/mainsail-crew/mainsail/pull/1288))
- **de**: Update German localization ([#1277](https://github.com/mainsail-crew/mainsail/pull/1277))
- **fr**: Update French localization ([#1289](https://github.com/mainsail-crew/mainsail/pull/1289))
- **ja**: Update Japanese localization ([#1270](https://github.com/mainsail-crew/mainsail/pull/1270))
- **nl**: Update NL locale ([#1282](https://github.com/mainsail-crew/mainsail/pull/1282))
- **zh**: Update locale ([#1269](https://github.com/mainsail-crew/mainsail/pull/1269))
- **zh**: Update Chinese (zh) localization ([#1284](https://github.com/mainsail-crew/mainsail/pull/1284))
- Remove unused locale `PresetSubTitle` ([#1264](https://github.com/mainsail-crew/mainsail/pull/1264))

### Other

- Add .vscode to .gitignore ([#1290](https://github.com/mainsail-crew/mainsail/pull/1290))
- Add armv6 support for Docker image ([#1285](https://github.com/mainsail-crew/mainsail/pull/1285))
- Update gcodeviewer from v3.2.0 to v3.2.2 ([#1303](https://github.com/mainsail-crew/mainsail/pull/1303))

## [2.4.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.4.1) - 2022-12-10
### Bug Fixes and Improvements

- **ExtruderPanel**: Wrong calculation for estimated extrusion length ([#1157](https://github.com/mainsail-crew/mainsail/pull/1157))
- **Heightmap**: Save z scale setting ([#1175](https://github.com/mainsail-crew/mainsail/pull/1175))
- Display layer count with older klipper versions ([#1161](https://github.com/mainsail-crew/mainsail/pull/1161))
- Display can interfaces in system panel ([#1159](https://github.com/mainsail-crew/mainsail/pull/1159))
- Fix relative webcam urls on multi instances ([#1162](https://github.com/mainsail-crew/mainsail/pull/1162))
- Fix handling issues with number-inputs ([#1168](https://github.com/mainsail-crew/mainsail/pull/1168))
- Fix neopixel settings if name is uppercase ([#1169](https://github.com/mainsail-crew/mainsail/pull/1169))
- Fix dashboard interface settings ([#1176](https://github.com/mainsail-crew/mainsail/pull/1176))
- Add theming for find/search panel Search panel ([#1174](https://github.com/mainsail-crew/mainsail/pull/1174))
- Disable circle control while printing or not homed ([#1171](https://github.com/mainsail-crew/mainsail/pull/1171))
- Add more space between the rows in manual probe window ([#1189](https://github.com/mainsail-crew/mainsail/pull/1189))

### Refactor

- Rename variance to range in heightmap ([#1166](https://github.com/mainsail-crew/mainsail/pull/1166))
- Replace emergency stop icon ([#1170](https://github.com/mainsail-crew/mainsail/pull/1170))

### Localization

- **da**: Update Danish localization ([#1179](https://github.com/mainsail-crew/mainsail/pull/1179))
- **nl**: Update NL localization ([#1191](https://github.com/mainsail-crew/mainsail/pull/1191))
- **tr**: Update Turkish localization ([#1188](https://github.com/mainsail-crew/mainsail/pull/1188))
- **zh**: Update Chinese localization ([#1142](https://github.com/mainsail-crew/mainsail/pull/1142))

### Documentation

- Add BIGTREETECH to repo README as official sponsor ([#1178](https://github.com/mainsail-crew/mainsail/pull/1178))

### Other

- Add release workflow ([#1185](https://github.com/mainsail-crew/mainsail/pull/1185))
- Fix release workflow ([#1190](https://github.com/mainsail-crew/mainsail/pull/1190))

## [2.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.4.0) - 2022-11-14
### Features

- Add manual_probe helper dialog ([#1077](https://github.com/mainsail-crew/mainsail/pull/1077))
- Add SET_PRINT_STATS_INFO command support ([#1034](https://github.com/mainsail-crew/mainsail/pull/1034))
- Add z_thermal_adjust to temperatures panel ([#1113](https://github.com/mainsail-crew/mainsail/pull/1113))
- Add option to change date & time format in settings ([#1069](https://github.com/mainsail-crew/mainsail/pull/1069))
- Add LED / Neopixel support ([#1050](https://github.com/mainsail-crew/mainsail/pull/1050))
- Add bed_screws helper dialog ([#1115](https://github.com/mainsail-crew/mainsail/pull/1115))
- Multi column for many inputs in gcode macro ([#1153](https://github.com/mainsail-crew/mainsail/pull/1153))

### Bug Fixes and Improvements

- **Heightmap**: Flat for bed mesh not displayed if only one probe count set ([#1146](https://github.com/mainsail-crew/mainsail/pull/1146))
- **UI**: Missing bottom border radius in status panel ([#1106](https://github.com/mainsail-crew/mainsail/pull/1106))
- **UI**: Tweak font sizes ([#1107](https://github.com/mainsail-crew/mainsail/pull/1107))
- Set init values in TheManualProbeDialog.vue ([#1092](https://github.com/mainsail-crew/mainsail/pull/1092))
- Broken link in readme ([#1104](https://github.com/mainsail-crew/mainsail/pull/1104))
- Fix relative webcam urls with port ([#1147](https://github.com/mainsail-crew/mainsail/pull/1147))
- Cannot upload GCODE files on iOS ([#1152](https://github.com/mainsail-crew/mainsail/pull/1152))

### Refactor

- **KlippyStatePanel**: Display buttons as outlined text buttons ([#1134](https://github.com/mainsail-crew/mainsail/pull/1134))
- **editor**: Use the config reference link of a translated version if it exists ([#1120](https://github.com/mainsail-crew/mainsail/pull/1120))
- Display bit version of OS ([#1101](https://github.com/mainsail-crew/mainsail/pull/1101))
- Fix lint issues ([#1111](https://github.com/mainsail-crew/mainsail/pull/1111))
- Improve webcam settings logic and layout ([#1114](https://github.com/mainsail-crew/mainsail/pull/1114))
- Rework of the KlippyState panel ([#1118](https://github.com/mainsail-crew/mainsail/pull/1118))

### Localization

- **ja**: Update Japanese localization ([#1131](https://github.com/mainsail-crew/mainsail/pull/1131))
- **ko-kr**: Update Korean localization ([#1098](https://github.com/mainsail-crew/mainsail/pull/1098))
- **uk**: Update Ukrainian localization ([#1094](https://github.com/mainsail-crew/mainsail/pull/1094))
- **zh**: Update Chinese localization ([#1089](https://github.com/mainsail-crew/mainsail/pull/1089))

### Other

- **build**: Update compiler target to support import.meta ([#1112](https://github.com/mainsail-crew/mainsail/pull/1112))
- **deps**: Update dependencies ([#1103](https://github.com/mainsail-crew/mainsail/pull/1103))
- **locales**: Rename locales as per ISO 639 ([#1108](https://github.com/mainsail-crew/mainsail/pull/1108))
- **locales**: Remove all unused keys ([#1109](https://github.com/mainsail-crew/mainsail/pull/1109))
- Rename and clean up AboutModal ([#1090](https://github.com/mainsail-crew/mainsail/pull/1090))
- Remove LGTM workflow ([#1091](https://github.com/mainsail-crew/mainsail/pull/1091))
- Update gcode viewer to V3.1.4 ([#1119](https://github.com/mainsail-crew/mainsail/pull/1119))

## [2.3.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.3.1) - 2022-09-16
### Bug Fixes and Improvements

- Use background to fix border issues between the elements ([#1068](https://github.com/mainsail-crew/mainsail/pull/1068))
- Load instances from localStore if instance store is browser ([#1086](https://github.com/mainsail-crew/mainsail/pull/1086))
- Add input validation in filemanagers to prevent overwriting existing files ([#1087](https://github.com/mainsail-crew/mainsail/pull/1087))

### Refactor

- Extend css editor support to .scss and .sass files ([#1083](https://github.com/mainsail-crew/mainsail/pull/1083))

### Localization

- **fr**: Update fr locale ([#1072](https://github.com/mainsail-crew/mainsail/pull/1072))
- **uk**: Update Ukrainian localization ([#1067](https://github.com/mainsail-crew/mainsail/pull/1067))

### Other

- Update broken link to DCO ([#1084](https://github.com/mainsail-crew/mainsail/pull/1084))
- Lint:fix locales ([#1088](https://github.com/mainsail-crew/mainsail/pull/1088))

## [2.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.3.0) - 2022-09-09
### Features

- **editor**: Add .css language support ([#936](https://github.com/mainsail-crew/mainsail/pull/936))
- Allow collapsing of config file panel ([#943](https://github.com/mainsail-crew/mainsail/pull/943))
- Init interface before display panels ([#961](https://github.com/mainsail-crew/mainsail/pull/961))
- Allow for more decimal places in move-to-input ([#976](https://github.com/mainsail-crew/mainsail/pull/976))
- Rotate webcam in Mjpegstreamer-adaptive mode ([#923](https://github.com/mainsail-crew/mainsail/pull/923))
- Improve load/unload filament button logic in Extruder panel ([#989](https://github.com/mainsail-crew/mainsail/pull/989))
- Download button for crowsnest.log and sonar.log ([#991](https://github.com/mainsail-crew/mainsail/pull/991))
- Show current bed mesh profile name in toolhead panel ([#1000](https://github.com/mainsail-crew/mainsail/pull/1000))
- Add defaultLocale in config.json ([#1010](https://github.com/mainsail-crew/mainsail/pull/1010))
- Add option to switch print progress calculation ([#1013](https://github.com/mainsail-crew/mainsail/pull/1013))
- Add temperatures to gcode files list ([#1017](https://github.com/mainsail-crew/mainsail/pull/1017))
- Add warnings if gcodes/config root dirs don't exists ([#1018](https://github.com/mainsail-crew/mainsail/pull/1018))
- Add exclude objects in G-Code Viewer ([#1028](https://github.com/mainsail-crew/mainsail/pull/1028))
- Add button to edit crowsnest.conf in webcam settings ([#1037](https://github.com/mainsail-crew/mainsail/pull/1037))
- Add multiselect to timelapse file manager ([#1039](https://github.com/mainsail-crew/mainsail/pull/1039))
- Add Turkish localization ([#1049](https://github.com/mainsail-crew/mainsail/pull/1049))
- Show nozzle size in estimated extrusion info ([#1048](https://github.com/mainsail-crew/mainsail/pull/1048))
- Export only selected jobs from print history ([#1055](https://github.com/mainsail-crew/mainsail/pull/1055))

### Bug Fixes and Improvements

- **Heightmap**: Improve input validation for rename profile dialog ([#1002](https://github.com/mainsail-crew/mainsail/pull/1002))
- **editor**: Partial improvement of config syntax highlighting ([#612](https://github.com/mainsail-crew/mainsail/pull/612))
- **timelapse**: Renaming a .zip file caused extension to become .mp4 ([#992](https://github.com/mainsail-crew/mainsail/pull/992))
- Create folders with spaces in the name ([#942](https://github.com/mainsail-crew/mainsail/pull/942))
- Add fallback for gcode files without thumbnail ([#959](https://github.com/mainsail-crew/mainsail/pull/959))
- Match mcu temp sensor of additional mcus ([#957](https://github.com/mainsail-crew/mainsail/pull/957))
- Max_power setting in miscellaneous panel ([#953](https://github.com/mainsail-crew/mainsail/pull/953))
- Remove js scrollbars in body & editor ([#962](https://github.com/mainsail-crew/mainsail/pull/962))
- Fix output with number groupings & add slicer in csv header ([#967](https://github.com/mainsail-crew/mainsail/pull/967))
- Reset webcam store on printer switch ([#996](https://github.com/mainsail-crew/mainsail/pull/996))
- Hide TemperaturePanel if no sensors would be shown ([#982](https://github.com/mainsail-crew/mainsail/pull/982))
- Divider in temperature presets is transparent ([#1004](https://github.com/mainsail-crew/mainsail/pull/1004))
- Distro output for armbian in SystemPanel ([#1021](https://github.com/mainsail-crew/mainsail/pull/1021))
- Webcam name input alignment ([#1019](https://github.com/mainsail-crew/mainsail/pull/1019))
- Global form validation error misalignment ([#1020](https://github.com/mainsail-crew/mainsail/pull/1020))
- Add missing locale to factory restart options ([#1023](https://github.com/mainsail-crew/mainsail/pull/1023))
- Fix type issue in releaseName parsing ([#1043](https://github.com/mainsail-crew/mainsail/pull/1043))
- Fix progress above 100% with filament based calculation ([#1042](https://github.com/mainsail-crew/mainsail/pull/1042))
- Combine small entries in history pie chart ([#1056](https://github.com/mainsail-crew/mainsail/pull/1056))
- Use correct unit for pressure advance ([#1053](https://github.com/mainsail-crew/mainsail/pull/1053))
- Fix dep loading issue after update vite ([#1058](https://github.com/mainsail-crew/mainsail/pull/1058))
- Remove scrollbar on init load of status panel ([#1059](https://github.com/mainsail-crew/mainsail/pull/1059))

### Refactor

- Refactor code in Gcodefiles.vue ([#910](https://github.com/mainsail-crew/mainsail/pull/910))
- Reverse order of negative offset values in inline z-offset value layout ([#987](https://github.com/mainsail-crew/mainsail/pull/987))
- Change remoteMode to instancesDB in config.json ([#997](https://github.com/mainsail-crew/mainsail/pull/997))
- Move firmware retraction settings to Extruder panel ([#1003](https://github.com/mainsail-crew/mainsail/pull/1003))
- Remove input validation from MoveToInput ([#1022](https://github.com/mainsail-crew/mainsail/pull/1022))

### Localization

- **da**: Update Danish localization ([#1026](https://github.com/mainsail-crew/mainsail/pull/1026))
- **de**: Update German localization ([#1015](https://github.com/mainsail-crew/mainsail/pull/1015))
- **hu**: Update Hungarian localization ([#986](https://github.com/mainsail-crew/mainsail/pull/986))
- **ja**: Update Japanese localization ([#1030](https://github.com/mainsail-crew/mainsail/pull/1030))
- **ja**: Update Japanese localization ([#1064](https://github.com/mainsail-crew/mainsail/pull/1064))
- **ko-kr**: Update Korean localization ([#926](https://github.com/mainsail-crew/mainsail/pull/926))
- **nl**: Update Dutch localization ([#1065](https://github.com/mainsail-crew/mainsail/pull/1065))
- **uk**: Add Ukrainian localization ([#1061](https://github.com/mainsail-crew/mainsail/pull/1061))
- **zh**: Update Chinese localization ([#938](https://github.com/mainsail-crew/mainsail/pull/938))

### Other

- **docker**: Add linux/arm/v7 architecture to Docker builds ([#949](https://github.com/mainsail-crew/mainsail/pull/949))
- Update CONTRIBUTING.md ([#902](https://github.com/mainsail-crew/mainsail/pull/902))
- Update develop branch with master bugfixes ([#965](https://github.com/mainsail-crew/mainsail/pull/965))
- Add workflow to answer on issues with specified labels ([#969](https://github.com/mainsail-crew/mainsail/pull/969))
- Update codemirror to v6 ([#795](https://github.com/mainsail-crew/mainsail/pull/795))
- Update codemirror to v6 ([#975](https://github.com/mainsail-crew/mainsail/pull/975))
- Change workflow action to dessant/label-actions ([#1005](https://github.com/mainsail-crew/mainsail/pull/1005))
- Add LGTM action ([#1008](https://github.com/mainsail-crew/mainsail/pull/1008))
- Switch to new stale workflow ([#1007](https://github.com/mainsail-crew/mainsail/pull/1007))
- Add auto-analyze.yml action ([#1009](https://github.com/mainsail-crew/mainsail/pull/1009))
- Add github_token to auto-analyze.yml ([#1029](https://github.com/mainsail-crew/mainsail/pull/1029))
- Fix issues with auto analyze workflow ([#1031](https://github.com/mainsail-crew/mainsail/pull/1031))
- Change cron interval stale action ([#1062](https://github.com/mainsail-crew/mainsail/pull/1062))

## [2.2.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.2.1) - 2022-06-21
### Bug Fixes and Improvements

- Macro buttons with single char attribute ([#903](https://github.com/mainsail-crew/mainsail/pull/903))
- Display status tab on dashboard as default while printing ([#907](https://github.com/mainsail-crew/mainsail/pull/907))
- Fix typo in adding new heaters/temperature_fans to chart dataset ([#918](https://github.com/mainsail-crew/mainsail/pull/918))
- Editor safe & restart with multi instances ([#925](https://github.com/mainsail-crew/mainsail/pull/925))

### Localization

- **en**: Remove unused keys in EN locale ([#913](https://github.com/mainsail-crew/mainsail/pull/913))
- **en**: Fix typos in English localization ([#924](https://github.com/mainsail-crew/mainsail/pull/924))
- **ko-kr**: Fix Korean localization ([#890](https://github.com/mainsail-crew/mainsail/pull/890))
- **ko-kr**: Update Korean localization ([#894](https://github.com/mainsail-crew/mainsail/pull/894))
- **ko-kr**: Fix Korean localization ([#890](https://github.com/mainsail-crew/mainsail/pull/890))
- **ko-kr**: Update Korean localization ([#894](https://github.com/mainsail-crew/mainsail/pull/894))
- **ko-kr**: Update Korean localization ([#914](https://github.com/mainsail-crew/mainsail/pull/914))
- **ru**: Update ru.json ([#889](https://github.com/mainsail-crew/mainsail/pull/889))
- **ru**: Update ru.json ([#889](https://github.com/mainsail-crew/mainsail/pull/889))
- **zh**: Update Chinese localization ([#896](https://github.com/mainsail-crew/mainsail/pull/896))
- **zh**: Update Chinese localization ([#896](https://github.com/mainsail-crew/mainsail/pull/896))
- **zh**: Update Chinese localization ([#906](https://github.com/mainsail-crew/mainsail/pull/906))
- Fix locale keys ([#916](https://github.com/mainsail-crew/mainsail/pull/916))
- Fix Editor placeholder for download/upload snackbar ([#919](https://github.com/mainsail-crew/mainsail/pull/919))

### Other

- **bug_report.yml**: Extend issue template ([#911](https://github.com/mainsail-crew/mainsail/pull/911))
- Add workflow to close issues with 'User Input' labels after 7 days ([#912](https://github.com/mainsail-crew/mainsail/pull/912))
- Add workflow to check locale files in pull requests ([#917](https://github.com/mainsail-crew/mainsail/pull/917))

## [2.2.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.2.0) - 2022-06-11
### Features

- **console**: Add the ability to clear the console ([#672](https://github.com/mainsail-crew/mainsail/pull/672))
- **pwa**: Add PWA support for https based instances ([#654](https://github.com/mainsail-crew/mainsail/pull/654))
- Add custom number input component ([#638](https://github.com/mainsail-crew/mainsail/pull/638))
- Multiselect in history jobs ([#509](https://github.com/mainsail-crew/mainsail/pull/509))
- Display only existing/useable bed_mesh profiles ([#660](https://github.com/mainsail-crew/mainsail/pull/660))
- Add localization options to NumberInput.vue ([#661](https://github.com/mainsail-crew/mainsail/pull/661))
- Add profile name field to calibrate bed_mesh dialog ([#664](https://github.com/mainsail-crew/mainsail/pull/664))
- Rework heightmap page ([#667](https://github.com/mainsail-crew/mainsail/pull/667))
- Add input fields to sliders ([#674](https://github.com/mainsail-crew/mainsail/pull/674))
- Export print history as CSV ([#675](https://github.com/mainsail-crew/mainsail/pull/675))
- Add default moonraker instances to config.json ([#695](https://github.com/mainsail-crew/mainsail/pull/695))
- Change default port for https instances in remote mode ([#694](https://github.com/mainsail-crew/mainsail/pull/694))
- Each viewport size can have different panels open/close ([#696](https://github.com/mainsail-crew/mainsail/pull/696))
- Add settings for klipper & moonraker 'SAVE & RESTART' ([#700](https://github.com/mainsail-crew/mainsail/pull/700))
- Implement moonraker connection identify ([#701](https://github.com/mainsail-crew/mainsail/pull/701))
- Add responsive component ([#704](https://github.com/mainsail-crew/mainsail/pull/704))
- Translate job status in history ([#713](https://github.com/mainsail-crew/mainsail/pull/713))
- Extend system load panel ([#536](https://github.com/mainsail-crew/mainsail/pull/536))
- Confirm before closing the browser tab ([#723](https://github.com/mainsail-crew/mainsail/pull/723))
- Display error messages when console is not on the screen ([#724](https://github.com/mainsail-crew/mainsail/pull/724))
- Display gcodeviewer always and store klipper settings in moonraker DB as a fallback ([#725](https://github.com/mainsail-crew/mainsail/pull/725))
- Add note to history job ([#716](https://github.com/mainsail-crew/mainsail/pull/716))
- Notifications ([#738](https://github.com/mainsail-crew/mainsail/pull/738))
- Temperature panel rework ([#748](https://github.com/mainsail-crew/mainsail/pull/748))
- Extruder control panel ([#711](https://github.com/mainsail-crew/mainsail/pull/711))
- Toolhead control panel ([#712](https://github.com/mainsail-crew/mainsail/pull/712))
- Rework gcode file list ([#753](https://github.com/mainsail-crew/mainsail/pull/753))
- Global fullscreen fileupload ([#777](https://github.com/mainsail-crew/mainsail/pull/777))
- Gcode-files & jobqueue on dashboard ([#726](https://github.com/mainsail-crew/mainsail/pull/726))
- Add arm64 docker image support ([#787](https://github.com/mainsail-crew/mainsail/pull/787))
- Add multi select for config files ([#790](https://github.com/mainsail-crew/mainsail/pull/790))
- Always show scrollbar in the editor ([#791](https://github.com/mainsail-crew/mainsail/pull/791))

### Bug Fixes and Improvements

- **ConfigFilesPanel**: Change delete button color ([#779](https://github.com/mainsail-crew/mainsail/pull/779))
- **CrossControl**: Step size was not applied correctly ([#805](https://github.com/mainsail-crew/mainsail/pull/805))
- **SettingsPresetTab**: Improve form validation for heater preset ([#749](https://github.com/mainsail-crew/mainsail/pull/749))
- **TemperaturePanel.vue**: Remove hover effect ([#785](https://github.com/mainsail-crew/mainsail/pull/785))
- Import bugfixes from release v2.1.2 ([#639](https://github.com/mainsail-crew/mainsail/pull/639))
- Removing remote printer in remote mode ([#676](https://github.com/mainsail-crew/mainsail/pull/676))
- Fix gcode from macros with single char attributes ([#680](https://github.com/mainsail-crew/mainsail/pull/680))
- Match input field behavior to slider behavior ([#684](https://github.com/mainsail-crew/mainsail/pull/684))
- Missing icon imports (follow up of #646) ([#687](https://github.com/mainsail-crew/mainsail/pull/687))
- Don't allow to add/update printers with empty hostname ([#693](https://github.com/mainsail-crew/mainsail/pull/693))
- Icon rotation with svg icons ([#691](https://github.com/mainsail-crew/mainsail/pull/691))
- Fix init issue in controls panel
- Missing object in dashboard expand panel getter
- Search temperature_store_size in data_store and server ([#705](https://github.com/mainsail-crew/mainsail/pull/705))
- Hide gcode thumbnail, if a webcam is active in printer farm ([#706](https://github.com/mainsail-crew/mainsail/pull/706))
- Double defined variable viewport in SettingsDashboardTab.vue
- Add missing translation keys ([#714](https://github.com/mainsail-crew/mainsail/pull/714))
- Disable home button in heightmap page while printing ([#722](https://github.com/mainsail-crew/mainsail/pull/722))
- Missing file icon import in gcode file browser ([#731](https://github.com/mainsail-crew/mainsail/pull/731))
- Check if panel exists before load on dashboard ([#734](https://github.com/mainsail-crew/mainsail/pull/734))
- Compiler type warning ([#744](https://github.com/mainsail-crew/mainsail/pull/744))
- Resize tempchart on window resize event ([#750](https://github.com/mainsail-crew/mainsail/pull/750))
- Add error message in webcam panel, if no webcam is available ([#754](https://github.com/mainsail-crew/mainsail/pull/754))
- Hide unknown panels in interface settings > dashboard page ([#763](https://github.com/mainsail-crew/mainsail/pull/763))
- Update missing out of range translation ([#767](https://github.com/mainsail-crew/mainsail/pull/767))
- Margin bottom of TemperaturePanel.vue ([#782](https://github.com/mainsail-crew/mainsail/pull/782))
- Migrate tools panel to temperature panel on gui init ([#783](https://github.com/mainsail-crew/mainsail/pull/783))
- Add missing context menu to dashboard jobqueue ([#794](https://github.com/mainsail-crew/mainsail/pull/794))
- Remove image from cache after loading it in Mjpegstreamer.vue ([#797](https://github.com/mainsail-crew/mainsail/pull/797))
- Close stream on beforeDestory Uv4lMjpeg.vue ([#796](https://github.com/mainsail-crew/mainsail/pull/796))
- Edit files/gcodes in subfolders ([#803](https://github.com/mainsail-crew/mainsail/pull/803))
- Duplicate checkbox for pwm fan ([#799](https://github.com/mainsail-crew/mainsail/pull/799)) ([#802](https://github.com/mainsail-crew/mainsail/pull/802))
- Resize issues with tempchart and other components ([#808](https://github.com/mainsail-crew/mainsail/pull/808))
- Stop stream when changing browser tab ([#810](https://github.com/mainsail-crew/mainsail/pull/810))
- Fix some issues with unreadable values in the control panel ([#817](https://github.com/mainsail-crew/mainsail/pull/817))
- Disable toolhead 3-dot menu during printing ([#812](https://github.com/mainsail-crew/mainsail/pull/812)) ([#814](https://github.com/mainsail-crew/mainsail/pull/814))
- Do not show `null RPM` in temp chart ([#818](https://github.com/mainsail-crew/mainsail/pull/818)) ([#820](https://github.com/mainsail-crew/mainsail/pull/820))
- Unable to set heater target temperature ([#828](https://github.com/mainsail-crew/mainsail/pull/828))
- Add file from sub directory to job queue ([#826](https://github.com/mainsail-crew/mainsail/pull/826))
- Switch back to files, after clear printjob from status panel ([#816](https://github.com/mainsail-crew/mainsail/pull/816))
- Add u4vl-mjpeg to printfarm & only display supported modes ([#831](https://github.com/mainsail-crew/mainsail/pull/831))
- Store only name of icon instead of svg in moonraker db ([#833](https://github.com/mainsail-crew/mainsail/pull/833))
- Don't createObjectURL, when webcam img doesn't exist in Mjpegstreamer.vue ([#834](https://github.com/mainsail-crew/mainsail/pull/834))
- Regex to replace url to a clickable link in notifictiaons ([#832](https://github.com/mainsail-crew/mainsail/pull/832))
- Miscellaneous target change issue when max_power != 1 ([#840](https://github.com/mainsail-crew/mainsail/pull/840))
- Stop webcam when webcam panel is collapse ([#839](https://github.com/mainsail-crew/mainsail/pull/839))
- Wrong default path in moonraker db ([#843](https://github.com/mainsail-crew/mainsail/pull/843))
- Tool selection in extruder panel ([#842](https://github.com/mainsail-crew/mainsail/pull/842))
- Search files also with single word snippets ([#851](https://github.com/mainsail-crew/mainsail/pull/851))
- Hide toolhead, extruder & temperature panel if they have no content ([#852](https://github.com/mainsail-crew/mainsail/pull/852))
- Add headlines to console tab settings ([#853](https://github.com/mainsail-crew/mainsail/pull/853))
- Don't start webcam after switching tab ([#855](https://github.com/mainsail-crew/mainsail/pull/855))
- Bed mesh calibrate dialog not opening on mobile ([#858](https://github.com/mainsail-crew/mainsail/pull/858))
- Echarts getters in heightmap, tempchart & history statistics ([#859](https://github.com/mainsail-crew/mainsail/pull/859))
- Fix img size without a stream (u4vl-mode) ([#860](https://github.com/mainsail-crew/mainsail/pull/860))
- MjpegstreamerAdaptive.vue image size ([#863](https://github.com/mainsail-crew/mainsail/pull/863))
- Max size of tempchart ([#865](https://github.com/mainsail-crew/mainsail/pull/865))
- Sort of toolchange macros ([#867](https://github.com/mainsail-crew/mainsail/pull/867))
- Display filename in gcodeviewer ([#872](https://github.com/mainsail-crew/mainsail/pull/872))
- Unable to set target values ([#873](https://github.com/mainsail-crew/mainsail/pull/873))
- Restart services with name matching files ([#876](https://github.com/mainsail-crew/mainsail/pull/876))
- Unable to submit coordinate values ([#878](https://github.com/mainsail-crew/mainsail/pull/878))
- CommandHelpModal mobile fullscreen size ([#882](https://github.com/mainsail-crew/mainsail/pull/882))
- Fix some gui issues ([#880](https://github.com/mainsail-crew/mainsail/pull/880))

### Performance

- Load codemirror into a chunk for faster LCP ([#641](https://github.com/mainsail-crew/mainsail/pull/641))
- Replace echart library and load it modular ([#645](https://github.com/mainsail-crew/mainsail/pull/645))

### Refactor

- **MachineSettingsPanel.vue**: Tweak visual appearance ([#784](https://github.com/mainsail-crew/mainsail/pull/784))
- Move rename button in heightmap ([#665](https://github.com/mainsail-crew/mainsail/pull/665))
- Rework webcam settings visuals ([#679](https://github.com/mainsail-crew/mainsail/pull/679))
- Make all MachineSettings use new NumberInput ([#651](https://github.com/mainsail-crew/mainsail/pull/651))
- Replace font icons with their svg counterparts ([#646](https://github.com/mainsail-crew/mainsail/pull/646))
- Replace the mdiclock for an emoji on the TempChart ([#690](https://github.com/mainsail-crew/mainsail/pull/690))
- Change delete button color ([#766](https://github.com/mainsail-crew/mainsail/pull/766))
- Remove unused option in SettingsUiSettingsTab.vue ([#792](https://github.com/mainsail-crew/mainsail/pull/792))
- Display scrollbar when mouse is moving ([#793](https://github.com/mainsail-crew/mainsail/pull/793))
- Match icon for editing config and gcode files ([#798](https://github.com/mainsail-crew/mainsail/pull/798))
- Remove unused file ([#813](https://github.com/mainsail-crew/mainsail/pull/813))
- Remove duplicated settings header ([#830](https://github.com/mainsail-crew/mainsail/pull/830))
- Remove temperature_store_size from server section ([#837](https://github.com/mainsail-crew/mainsail/pull/837))
- Hide PA input fields if extruder_stepper is configured ([#846](https://github.com/mainsail-crew/mainsail/pull/846))
- Update GCode Viewer to 3.1.0 ([#847](https://github.com/mainsail-crew/mainsail/pull/847))
- Replace drag handle icons ([#879](https://github.com/mainsail-crew/mainsail/pull/879))

### Styling

- **icons**: Update PWA icons ([#727](https://github.com/mainsail-crew/mainsail/pull/727))
- Use prettier on other file formats as well ([#648](https://github.com/mainsail-crew/mainsail/pull/648))
- Improve prettier integration ([#662](https://github.com/mainsail-crew/mainsail/pull/662))
- Order all locale keys alphabetically ([#702](https://github.com/mainsail-crew/mainsail/pull/702))
- Indent size of 4 spaces in json ([#715](https://github.com/mainsail-crew/mainsail/pull/715))
- Fix lint issue of locale files ([#764](https://github.com/mainsail-crew/mainsail/pull/764))

### Localization

- **da**: Updated ([#718](https://github.com/mainsail-crew/mainsail/pull/718))
- **de**: Update German locale ([#871](https://github.com/mainsail-crew/mainsail/pull/871))
- **en**: Fix typo in GreaterOrEqualError ([#854](https://github.com/mainsail-crew/mainsail/pull/854))
- **es**: Typos/grammar review ([#689](https://github.com/mainsail-crew/mainsail/pull/689))
- **es**: Update spanish localization ([#862](https://github.com/mainsail-crew/mainsail/pull/862))
- **fr**: Update French localization ([#844](https://github.com/mainsail-crew/mainsail/pull/844))
- **fr**: Update locale file ([#856](https://github.com/mainsail-crew/mainsail/pull/856))
- **ja**: Add Japanese translation ([#774](https://github.com/mainsail-crew/mainsail/pull/774))
- **ja**: Update Japanese localization ([#824](https://github.com/mainsail-crew/mainsail/pull/824))
- **ja**: Update Japanese localization ([#850](https://github.com/mainsail-crew/mainsail/pull/850))
- **ja**: Update Japanese localization ([#864](https://github.com/mainsail-crew/mainsail/pull/864))
- **ko-kr**: Add new lanquage pack such that south korean users ([#874](https://github.com/mainsail-crew/mainsail/pull/874))
- **nl**: Update dutch localization ([#861](https://github.com/mainsail-crew/mainsail/pull/861))
- **pl**: Update Polish locale ([#884](https://github.com/mainsail-crew/mainsail/pull/884))
- **ru**: Update Russian locale ([#836](https://github.com/mainsail-crew/mainsail/pull/836))
- **se-SV**: Add swedish localization ([#762](https://github.com/mainsail-crew/mainsail/pull/762))
- **zh-tw**: Update zh-tw.json ([#627](https://github.com/mainsail-crew/mainsail/pull/627))
- Cleanup locale files ([#841](https://github.com/mainsail-crew/mainsail/pull/841))

### Documentation

- Improve README.md ([#709](https://github.com/mainsail-crew/mainsail/pull/709))

### Other

- **deps**: Regenerate lockfile because of indent change ([#652](https://github.com/mainsail-crew/mainsail/pull/652))
- **deps**: Update dependencies ([#681](https://github.com/mainsail-crew/mainsail/pull/681))
- **deps**: Update dependencies ([#717](https://github.com/mainsail-crew/mainsail/pull/717))
- Add cypress for e2e testing ([#655](https://github.com/mainsail-crew/mainsail/pull/655))
- Add host settings to vite.config.ts ([#671](https://github.com/mainsail-crew/mainsail/pull/671))
- Remove development docker ([#677](https://github.com/mainsail-crew/mainsail/pull/677))
- Improved bug report and feature request forms ([#683](https://github.com/mainsail-crew/mainsail/pull/683))
- Remove unused mutations ([#697](https://github.com/mainsail-crew/mainsail/pull/697))
- Remove unused getter ([#698](https://github.com/mainsail-crew/mainsail/pull/698))
- Remove components.d.ts from git ([#703](https://github.com/mainsail-crew/mainsail/pull/703))
- Some toolhead panel tweaks ([#781](https://github.com/mainsail-crew/mainsail/pull/781))
- Exclude .DS_Store files in build.zip ([#886](https://github.com/mainsail-crew/mainsail/pull/886))
- Exclude .DS_Store files in build.zip ([#887](https://github.com/mainsail-crew/mainsail/pull/887))

## [2.1.2](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.2) - 2022-02-14
### Bug Fixes and Improvements

- **env**: Parse environment variable as string ([#632](https://github.com/mainsail-crew/mainsail/pull/632))
- Video and download link in timelapse video dialog ([#611](https://github.com/mainsail-crew/mainsail/pull/611))
- Console error regarding touch directive ([#633](https://github.com/mainsail-crew/mainsail/pull/633))

### Refactor

- Migrate `longpress.js` to `longpress.ts` ([#619](https://github.com/mainsail-crew/mainsail/pull/619))
- Replace 'vue-headful' with 'vue-meta' ([#620](https://github.com/mainsail-crew/mainsail/pull/620))
- Make sure that port '80' and '443' are correctly passed through ([#631](https://github.com/mainsail-crew/mainsail/pull/631))

### Styling

- Add prettier as default formatter ([#614](https://github.com/mainsail-crew/mainsail/pull/614))

### Localization

- **da**: Update da.json ([#596](https://github.com/mainsail-crew/mainsail/pull/596))
- **pl**: Bugfix 29/01/2022 ([#598](https://github.com/mainsail-crew/mainsail/pull/598))
- **pl**: Update 03.02.2022 ([#606](https://github.com/mainsail-crew/mainsail/pull/606))

### Documentation

- Split up quicktips ([#584](https://github.com/mainsail-crew/mainsail/pull/584))
- Cleanup assets folder ([#601](https://github.com/mainsail-crew/mainsail/pull/601))
- Update credits ([#602](https://github.com/mainsail-crew/mainsail/pull/602))

### Other

- **docker**: Windows compatible, without docker-compose wrapper ([#613](https://github.com/mainsail-crew/mainsail/pull/613))
- Add .editorconfig ([#582](https://github.com/mainsail-crew/mainsail/pull/582))
- Fix initial development environment ([#593](https://github.com/mainsail-crew/mainsail/pull/593))

### Release

- Release v2.1.2 ([#639](https://github.com/mainsail-crew/mainsail/pull/639))

## [2.1.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.1) - 2022-01-28
### Bug Fixes and Improvements

- Read nozzle_diameter from klipper config in gcodeviewer ([#558](https://github.com/mainsail-crew/mainsail/pull/558))
- Default color mode in gcodeviewer was wrong ([#559](https://github.com/mainsail-crew/mainsail/pull/559))
- Farm printer switch and display klippy connection errors ([#563](https://github.com/mainsail-crew/mainsail/pull/563))
- Delete remote printers dont work ([#564](https://github.com/mainsail-crew/mainsail/pull/564))
- Input field and spinner bug ([#551](https://github.com/mainsail-crew/mainsail/pull/551)) ([#555](https://github.com/mainsail-crew/mainsail/pull/555))
- Hide second notification in timelapse > remove mp4 ([#572](https://github.com/mainsail-crew/mainsail/pull/572))
- Polling klippy error messages ([#571](https://github.com/mainsail-crew/mainsail/pull/571))

### Localization

- **da**: Danish - minor updates, missing tags and removed "deceleration" ([#578](https://github.com/mainsail-crew/mainsail/pull/578))
- **it**: IT translation update ([#553](https://github.com/mainsail-crew/mainsail/pull/553))
- **pl**: Polish translation ([#581](https://github.com/mainsail-crew/mainsail/pull/581))
- **pl**: Fix polish translation ([#589](https://github.com/mainsail-crew/mainsail/pull/589))
- **pl**: Additional fix for polish language ([#592](https://github.com/mainsail-crew/mainsail/pull/592))
- **zh**: Update zh.json ([#557](https://github.com/mainsail-crew/mainsail/pull/557))

### Documentation

- Additions to the readme/index for 2.1 ([#543](https://github.com/mainsail-crew/mainsail/pull/543))
- Review Themes  Chapter in Documentation ([#486](https://github.com/mainsail-crew/mainsail/pull/486))
- Fix macro link
- Update prepare themes page with review feedback ([#554](https://github.com/mainsail-crew/mainsail/pull/554))
- Fix some broken links ([#580](https://github.com/mainsail-crew/mainsail/pull/580))

### Other

- **build**: Sets Node engine to version 16 ([#569](https://github.com/mainsail-crew/mainsail/pull/569))
- Use node 16 for base docker image ([#568](https://github.com/mainsail-crew/mainsail/pull/568))

## [2.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.0) - 2022-01-19
### Features

- **editor**: Add webcam.conf as webcamd config
- **panel**: Disable text select for panel headline
- Add backup and restore gcode viewer state
- Add snackbar for display the rendering process and cancel it
- Add snackbar for display the downloading gcode file and option to cancel it
- Move color mode select from settings to gcode viewer page and remove debounce of z slider
- Automatic rendering after changing color mode
- Optimize g-code viewer workflow and button positions
- Clear settings from gcode viewer
- Add some rendering options to gcode viewer
- Add klipper warnings panel on the dashboard ([#355](https://github.com/mainsail-crew/mainsail/pull/355))
- Exclude object map ([#369](https://github.com/mainsail-crew/mainsail/pull/369))
- Add perfect scrollbar to update commits dialog
- Exclude object map ([#371](https://github.com/mainsail-crew/mainsail/pull/371))
- Collapsable and normalize panels ([#372](https://github.com/mainsail-crew/mainsail/pull/372))
- Change panel toolbar buttons to v-toolbar-items
- Add hover effect to collapse panel button
- Add option to hide config backup files ([#378](https://github.com/mainsail-crew/mainsail/pull/378))
- Redesign commits dialog in update manager (github like list) ([#380](https://github.com/mainsail-crew/mainsail/pull/380))
- Adds optional confirmation dialogs for emergency stop and power device change ([#384](https://github.com/mainsail-crew/mainsail/pull/384))
- Uses monospace font on console ([#389](https://github.com/mainsail-crew/mainsail/pull/389))
- Add function to change/select time calculations for estimate and ETA times
- Macro management ([#396](https://github.com/mainsail-crew/mainsail/pull/396))
- Added modified file tracking and a confirmation ([#393](https://github.com/mainsail-crew/mainsail/pull/393))
- Add a compact console style option
- Change color of presets button in tool panel
- Add heightmap current mesh information panel
- Add tooltip with extrude volume on feedrate buttons
- Add full update function to update manager
- Add start/stop service buttons and display service state in top corner menu
- Add moonraker file_manager permissions to store and config files
- Use moonraker server.files.get_directory root_info to set root permissions
- Add link to gcode thumbnail docs in ui settings
- Change overlaps-scrollbar instead of perfect-scrollbar ([#400](https://github.com/mainsail-crew/mainsail/pull/400))
- Mainsail dependencies panel on the dashboard (klipper, moonraker)
- Move webcams to new db namespace ([#401](https://github.com/mainsail-crew/mainsail/pull/401))
- Add autofocus and action by press enter in crate/rename dialogs in config file manager
- Add autofocus and action by press enter in crate/rename dialogs in gcode files
- New design of the web UI ([#408](https://github.com/mainsail-crew/mainsail/pull/408))
- Lockable sliders ([#412](https://github.com/mainsail-crew/mainsail/pull/412))
- Reset database namespaces and/or history jobs/totals
- Gui for the timelapse moonraker plugin ([#417](https://github.com/mainsail-crew/mainsail/pull/417))
- Add save frames button in TimelapseStatusPanel.vue
- Disable camera setting in timelapse setting if snapshoturl exists in moonraker.conf
- Add serial_number to system cpu info
- Add moonraker job queue ([#433](https://github.com/mainsail-crew/mainsail/pull/433))
- Add metadata to job_queue panel
- Reset timelapse settings
- Machine settings panel on dashboard ([#440](https://github.com/mainsail-crew/mainsail/pull/440))
- Icons for print settings ([#441](https://github.com/mainsail-crew/mainsail/pull/441))
- Add option to hide TL gcodes in console ([#451](https://github.com/mainsail-crew/mainsail/pull/451))
- Add stream_delay_compensation and park_time to timelapse settings
- Pressure advance settings on dashboard ([#459](https://github.com/mainsail-crew/mainsail/pull/459))
- Store last gcode commands in moonraker db ([#460](https://github.com/mainsail-crew/mainsail/pull/460))
- Display moonraker-timelapse error message ([#467](https://github.com/mainsail-crew/mainsail/pull/467))
- Custom number input spin buttons ([#468](https://github.com/mainsail-crew/mainsail/pull/468))
- Backup/restore/default moonraker db ([#476](https://github.com/mainsail-crew/mainsail/pull/476))
- Add fw_retract setting in timelapse setting menu
- Display release_info in SystemPanel.vue
- Highlight hovered objectname in exclude object dialog list
- Confirmation service host control ([#481](https://github.com/mainsail-crew/mainsail/pull/481))
- Add special output text for klipper stop service
- Add tooltip by icon only sidebar navi
- Convert presets from V2.0.1 to V2.1.0 moonraker DB
- Add displaying/sorting of/by more gcode metadata ([#519](https://github.com/mainsail-crew/mainsail/pull/519))
- Ignore timelapse pause state during a print
- Send gcode macro with keyup enter ([#544](https://github.com/mainsail-crew/mainsail/pull/544))

### Bug Fixes and Improvements

- **websocket**: Close websocket before connecting ([#383](https://github.com/mainsail-crew/mainsail/pull/383))
- Inconsistent spelling and typos ([#379](https://github.com/mainsail-crew/mainsail/pull/379))
- Remove [display_status] from min settings, when [display] exists
- Load metadata of current print file of farm printers
- Init data in heightmap dont exist without bed_mesh
- Bump the version for @codemirror/search to 0.19.2 to benefit from ([#394](https://github.com/mainsail-crew/mainsail/pull/394))
- Update getMacroParams regex
- Safe gcode offset button wrong type
- Font size in console was to big after font change
- Hide main branch in update manager
- Hide string chars in default macro params
- Hide horizontal scrollbar in settings menu
- Update manager commits list icon and show days if smaller than 1 day ago
- Translations in ui-settings tab
- Change default extruder feedrates
- Remove eventListener in farmprinter panel
- Jumping panels when webcam (mjpegstreamer) is not in viewport
- Wrong variable name for cooldown preset gcode
- GetDirectory didn't check metadata changes
- Update links from klipper warnings
- Init directories dont work
- Duplicate dirs in filetree
- Drag & drop upload in gcode files
- Margin between DependenciesPanel.vue and next panel
- Dependencies getter dont work with commits after release tag
- Use repo_name instead of update_manager module name for creating github link
- Autoscroll function in update dialog doesn't work after switching to overlay scrollbar
- Autoscroll function in console page doesn't work after switching to overlay scrollbar
- Wrong download link for load current file in g-code viewer
- Don't display confirm changes dialog in editor for read-only files
- Store databases in farm printer states
- Update farm printers webcam to new webcam db namespace
- Fix spaces update manager panel
- Update metadata and gcode thumbnail of farm printers
- Remove hide-overlay in settings menu dialog
- Padding in simple macro panel
- Hide deleted macros on dashboard macro groups
- Convert old presets to new namespace
- All gui/webcam requests
- Check existsPresetName update index to id
- Remove replace space to underline in fileupload
- Remove replace space to underline in fileupload in topbar upload
- Fix typo from webcam panel logo in settings dashboard
- Display standby macrogroup/macro when klipper state is cancelled
- Remove macrogroup panel from dashboard when delete macrogroup
- Wrong action names in settings webcam tab
- Dont polling printer.info in klipper state disconnected
- Main scroll height (smaller topbar)
- Close button in update manager commits to tile
- Switch every time to relative mode for movements
- Webcam mjpegstreamer mode ([#419](https://github.com/mainsail-crew/mainsail/pull/419))
- Update action name for saving gui settings
- Add locale for empty timelapse state
- Rename cancel button in macro management to close
- Webcam create/edit form validation
- Reverse logic to show render & save_frames button in TL status panel
- Cut heightmap variance to 3 numbers behind the dot
- Check for null when running in docker or non pi ([#428](https://github.com/mainsail-crew/mainsail/pull/428))
- Patch slider lock feature ([#425](https://github.com/mainsail-crew/mainsail/pull/425))
- UI fixes and changes on timelapse page ([#430](https://github.com/mainsail-crew/mainsail/pull/430))
- Restart mjpegstreamer stream each 60sec to fix browser issues
- Add webcam rotation to new mjpegstreamer method
- Use webcam settings for TL preview image (rotation/mirror)
- Dependency build check
- Add path to add gcode files in subdirs to query
- Check if metadata exist in job_queue
- Disk_usage in sub-directories
- Add file permissions to edit gcode files
- Special cases in thumbnail urls
- Allow upper case sensor names ([#429](https://github.com/mainsail-crew/mainsail/pull/429))
- Macro param regexp ([#437](https://github.com/mainsail-crew/mainsail/pull/437))
- Reload required bug
- IOS orientation changed didn't trigger resize event
- Escape urls also escape / in the url
- Bug in dependency getter ([#445](https://github.com/mainsail-crew/mainsail/pull/445))
- Enable update if commits available but version number is above
- Input layout on small devices ([#448](https://github.com/mainsail-crew/mainsail/pull/448))
- Correct i18n key name ([#449](https://github.com/mainsail-crew/mainsail/pull/449))
- Cancel open connection before close fetch ([#450](https://github.com/mainsail-crew/mainsail/pull/450))
- Hide SystemPanel.vue if klipper is not connected/ready
- Enable g-code files, history and jobqueue when klipper is not ready
- Hide console, when klipper is not connected to moonraker
- Support for printer farm in https mode ([#452](https://github.com/mainsail-crew/mainsail/pull/452))
- Add hideTimelapse setting to console settings tab
- Wrong min/max position in current heightmap panel
- Update job_queue start command
- Delete also timelapse preview image if exists
- Add accept attribute to gcode file upload
- Add file extension filter to drag&drop fileupload in gcode files
- Disable context menu options for not allowed file extensions in GcodefilesPanel.vue
- Disable print start dialog for non gcode files
- Change exclude object icon and cut object name, if it is too long
- Fixed editor highlight stop bug ([#462](https://github.com/mainsail-crew/mainsail/pull/462))
- Prevent duplicates ([#464](https://github.com/mainsail-crew/mainsail/pull/464))
- Correct spelling of `max_accel_to_decel` input field ([#475](https://github.com/mainsail-crew/mainsail/pull/475))
- Hide timelapse console filter doesnt work
- Fixe some renamed store paths
- Axis name are undefined in the heightmap tooltip
- Fix renamed moonraker db gui paths
- Issue with tempchart/temphistory if the browser go into sleep mode
- Min height in settings menu cut dropdown menus
- Settings toggle to hide upload & print button doesnt work after store rework
- Custom console filters were not displayed (rework moonraker db)
- Disable moonraker serive stop button
- Hide stop moonraker service button
- Recover gcode viewer after switching tabs
- Modify text color of console output
- Hide timelapse root directories in config files panel
- Set default primary color in exclude object dialog map
- Check if settings object exists
- Check if settings object exists
- Check if settings object exists in getMiscellaneous
- Tempchart length/duration issues
- Settings menu in config files
- Settings menu in gcode files
- Reactivity of sidebar navi points
- Ignore maxTouchPoints === 256 ([#493](https://github.com/mainsail-crew/mainsail/pull/493))
- Dispatch with correct keyName ([#498](https://github.com/mainsail-crew/mainsail/pull/498))
- Ignore wrong presets in moonraker db
- Tooltip bug in sidebar with text + icons
- Hide webcam panel in config & dashboard if no webcam exists
- UI fixes related to feedback form beta-phase ([#494](https://github.com/mainsail-crew/mainsail/pull/494))
- Remove buggy condition for sidebar overlay ([#505](https://github.com/mainsail-crew/mainsail/pull/505))
- Logical error causing issues with input fields ([#507](https://github.com/mainsail-crew/mainsail/pull/507))
- Webcam selector doesnt work
- Restart stream when switching between mjpegstreamer webcams
- Hide fps in farm printer panel with mjpegstreamer webcam
- Send temp input only when blur, select value or press enter or tab key
- Sidebar logo and top-sidebar overlay ([#514](https://github.com/mainsail-crew/mainsail/pull/514))
- Button and input placement based on screen width ([#515](https://github.com/mainsail-crew/mainsail/pull/515))
- Only update / send temp commands on blur if they are changed
- Only update / send temp commands if they are changed
- Gcode files view with queue on mobile devices
- Request metadata for gcode files, when using search function
- Fix locale output in confirm dialog for service control
- Sort endstops in EndstopPanel.vue
- Sort mcus in SystemPanel.vue
- Hide snackbar details if total not available
- Workaround to display download status in editor
- Workaround to display download status in gcode-viewer
- Klippy connected/disconnected change
- Set default for min_extrude_temp ([#540](https://github.com/mainsail-crew/mainsail/pull/540))
- EncodeURI for thumbnails and timelapse files ([#539](https://github.com/mainsail-crew/mainsail/pull/539))
- Ipv6 issues with encodeURI
- Improve machine settings number inputs ([#537](https://github.com/mainsail-crew/mainsail/pull/537))

### Refactor

- **locale**: Update FR locale file
- Change toolbar buttons to text buttons in ToolsPanel.vue toolbar
- Change toolbar buttons to text buttons in WebcamPanel.vue
- Change TheSettingsMenu.vue to panel component
- Change CommandHelpModal.vue to panel component
- Change StatusPanelExcludeObjectDialog.vue to panel component
- Change panel buttons to toolbar text/icon buttons
- Remove padding right in toolbar to move toolbar buttons to the right corner
- Change color of cooldown button
- Remove debug output
- Change defaults macro param usecase
- Convert editor confirm dialog to new panel component
- Sort interface settings tabs and add a border between navi and content
- Rename theme settings tab to ui settings and move some ui settings from general to ui-settings
- Convert emergency stop dialog to new panel component
- Convert editor to panel component and add perfect-scrollbar
- Remove divider between buttons in editor toolbar
- Use getter getDirectory in gcode files
- Change thumbnail sizes and use a global variable
- Change main scrollbar to perfect-scrollbar
- Update dependency panel and text
- Fix typo in dependency text
- Change icon position in top right corner navi
- Modify dependencies text
- Move presets to own moonraker db namespace and create sub module of gui store ([#405](https://github.com/mainsail-crew/mainsail/pull/405))
- Rename gui/webcam to gui/webcams store
- New order of init moonraker databases and printer
- Use Vue.set in addClosePanel and removeClosePanel mutations
- Rename webcamTab to webcamsTab in settings menu
- Move consolefilters to own moonraker db namespace and create a sub module of gui store
- Move remotePrinters to own moonraker db namespace and create a sub module of gui store
- Remove old actions in farm module
- Move macrogroups to own moonraker db namespace and create a sub module of gui store
- Cleanup gui/actions from old functions
- Update klipper warings output
- Minor changes to menu and settings tab ([#411](https://github.com/mainsail-crew/mainsail/pull/411))
- Button overhaul and minor changes to the ui ([#413](https://github.com/mainsail-crew/mainsail/pull/413))
- Remove debug output in timelapse mutations
- Update download button in timelapse preview dialog
- Remove db update for locked sliders
- Update moonraker dependency for job_queue
- Update job_queue to moonraker notification
- Fix i18n-extract test in power device dialog
- Change icon in PrintsettingsPanel.vue
- Some fixes in 2.1.0 beta and minor changes to ui ([#457](https://github.com/mainsail-crew/mainsail/pull/457))
- New sort of context menu options in gcode files
- Style heightmap tooltip
- Remove old comment
- Remove debug outputs
- Add variable descriptions in variables.ts
- Remove old function in TheSidebar.vue
- Remove debug output
- Improve confirmation dialog visuals ([#508](https://github.com/mainsail-crew/mainsail/pull/508))
- Sort buttons in status panel toolbar
- Change panel expansion indicator ([#516](https://github.com/mainsail-crew/mainsail/pull/516))
- Change default colors ([#523](https://github.com/mainsail-crew/mainsail/pull/523))

### Localization

- **IT**: Minor edits in italian ([#415](https://github.com/mainsail-crew/mainsail/pull/415))
- **da**: Add DA language file
- **da**: Update da.json ([#491](https://github.com/mainsail-crew/mainsail/pull/491))
- **da**: Minor changes and spellchecking ([#512](https://github.com/mainsail-crew/mainsail/pull/512))
- **da**: Fix typo in locale file
- **da**: Updated Danish translations ([#527](https://github.com/mainsail-crew/mainsail/pull/527))
- **de**: Update de translation ([#446](https://github.com/mainsail-crew/mainsail/pull/446))
- **de**: Remove all unused keys
- **de**: Fix missing entry
- **de**: Add temp too high/too low messages to locale file
- **en**: Update en translation ([#447](https://github.com/mainsail-crew/mainsail/pull/447))
- **en**: Remove all unused keys
- **es**: Update spanish translation ([#443](https://github.com/mainsail-crew/mainsail/pull/443))
- **es**: Remove all unused keys
- **es**: Fix some missing translates ([#461](https://github.com/mainsail-crew/mainsail/pull/461))
- **es**: Correcciones de la Beta6 ([#492](https://github.com/mainsail-crew/mainsail/pull/492))
- **es**: Traslation Spanish RC1 ([#528](https://github.com/mainsail-crew/mainsail/pull/528))
- **fr**: Fix some typos
- **fr**: Update fr locale
- **fr**: Update beta2 fr translations
- **fr**: Remove all unused keys
- **fr**: Update FR language file
- **fr**: Update FR translation
- **fr**: Update FR locale
- **hu**: Update translation file ([#454](https://github.com/mainsail-crew/mainsail/pull/454))
- **hu**: Remove unused keys
- **hu**: Hu updated for the latest eng local ([#517](https://github.com/mainsail-crew/mainsail/pull/517))
- **hu**: Hun update 20220110 as requested :) ([#530](https://github.com/mainsail-crew/mainsail/pull/530))
- **hu**: 2022 01 12 update ([#531](https://github.com/mainsail-crew/mainsail/pull/531))
- **it**: IT Translation(beta) ([#435](https://github.com/mainsail-crew/mainsail/pull/435))
- **it**: Remove all unused keys
- **it**: Update translation file ([#455](https://github.com/mainsail-crew/mainsail/pull/455))
- **it**: Remove unused keys
- **it**: Update IT to beta6 ([#483](https://github.com/mainsail-crew/mainsail/pull/483))
- **nl**: NL translations for 2.1-beta ([#453](https://github.com/mainsail-crew/mainsail/pull/453))
- **nl**: Remove unused keys
- **nl**: Add last 2.1-beta strings ([#499](https://github.com/mainsail-crew/mainsail/pull/499))
- **nl**: Update NL locale ([#529](https://github.com/mainsail-crew/mainsail/pull/529))
- **ru**: Update translation file ([#458](https://github.com/mainsail-crew/mainsail/pull/458))
- **ru**: Fix ru language file for the word "Flow"
- **ru**: Remove unused keys
- **ru**: Update RU v2.1 ([#552](https://github.com/mainsail-crew/mainsail/pull/552))
- **zh**: Mandarin Translation for V2 beta ([#444](https://github.com/mainsail-crew/mainsail/pull/444))
- **zh**: Fix syntax error in zh.json
- **zh**: Remove all unused keys
- **zh**: Remove unused keys
- **zh-tw**: Add chinese traditional ([#418](https://github.com/mainsail-crew/mainsail/pull/418))
- **zh-tw**: Remove all unused keys
- **zh-tw**: Remove unused keys
- Update de translation ([#482](https://github.com/mainsail-crew/mainsail/pull/482))
- Add KlipperStop to translate list
- Fix missing entry
- Add "Temp too high", "Temp too low" output to i18n in ToolsPanel
- Fix keys in top corner menu

### Documentation

- Fix typo in CONTRIBUTING.md
- Major docs update by tomlawesome ([#358](https://github.com/mainsail-crew/mainsail/pull/358))
- Remove sudo for editing printer.cfg
- Fix order of first-boot.md
- Update manual setup/update ([#368](https://github.com/mainsail-crew/mainsail/pull/368))
- Add Rat Rig community theme by Raabi91
- Add FAQ with some klipper warnings
- Pre-flight fix
- Update moonraker dependencies
- Add 'command format mismatch' to faq ([#406](https://github.com/mainsail-crew/mainsail/pull/406))
- Update mainsailOS urls
- Updated all meteyou/mainsail urls to mainsail-crew/mainsail
- Change default value of PRINT_START macro
- Add "NTC 100K beta 3950" note
- Fix pre-flight
- Fix layout
- Removed duplicate entry
- Fix link to pre-flight
- Add youtube videos for themes & thumbnails
- Fix thumbnail toc
- Remove description for legacy slicers
- Thumbnails - replace prusaslicer screenshot
- Add new community theme "Cryd"
- Fix theme
- Update Home Page and Setup Guides ([#478](https://github.com/mainsail-crew/mainsail/pull/478))
- Update First Boot docs ([#506](https://github.com/mainsail-crew/mainsail/pull/506))
- First boot - fix info box
- Themes / changed name to cryd-s
- Add redirect dor configuration
- Update Quicktips ([#518](https://github.com/mainsail-crew/mainsail/pull/518))
- Update screenshot to v2.1.0

### Other

- **build**: Lint errors ([#381](https://github.com/mainsail-crew/mainsail/pull/381))
- **deps**: Bump nokogiri from 1.12.3 to 1.12.5 in /docs ([#363](https://github.com/mainsail-crew/mainsail/pull/363))
- Merge master in develop
- Update gcodeviewer to v2.1.10
- Update gcodeviewer to v2.1.11
- Change tracking button
- Update gcodeviewer to v2.1.13
- Add CODE_OF_CONDUCT.md
- Move CODE_OF_CONDUCT.md to .github/
- Add CONTRIBUTING.md
- Fix types from last commits
- Update perfect scrollbar package in npm
- Update vuetify package
- Add overlayscrollbars to package.json
- Update vuetify package ([#456](https://github.com/mainsail-crew/mainsail/pull/456))
- Update echarts packages
- Update gcode-viewer to v2.1.17
- Update package-lock.json

## [2.0.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.0.1) - 2021-09-08
### Features

- **console**: Autofocus input field after click on a command
- Gcodeviewer ([#322](https://github.com/mainsail-crew/mainsail/pull/322))

### Documentation

- Update screenshot to v2.0.0
- Multi webcam documentation ([#343](https://github.com/mainsail-crew/mainsail/pull/343))

### Other

- **editor**: Update gcodeviewer
- **eslint**: Config and fix eslint rules ([#340](https://github.com/mainsail-crew/mainsail/pull/340))
- **gcodeviewr**: Convert to TS
- **gcodeviewr**: Fix some types
- **type**: Fix type for build
- Fix eslint rules and update from develop
- Increment version number to V2.0.1

## [2.0.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.0.0) - 2021-08-26
### Features

- **editor**: Add JSON syntax highlighting
- Add SVG support for sidebar & main background
- Feature: restart webcamd by webcam*.txt files
feature: display root path logs in config files

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Add logfile paths to "connection failed" dialog
- Store file list (gcode files & config files) sortBy in moonraker DB
- Update not connecting dialogs with better descriptions
- Display moonraker warnings on the dashboard
- Show all available services (moonraker) in TopCornerMenu to restart the service
- Add mooncord to "save & restart" function of the config file editor
- Add dynamic root paths to config files
- Dynamic max of machine limits
- Display status of QGL & z_Tilt status in control panel
- Hide klipper_mcu service in topcornermenu
- Hide klipper_mcu service in topcornermenu (fix if empty)
- Add message to include mainsail.cfg in printer.cfg
- Change to motion_report with fallback to toolhead position in status panel
- Show gcode thumbnail in full height on focus
- Add support for save gcode offset to endstop/probe
- Sortable dashboard panels ([#319](https://github.com/mainsail-crew/mainsail/pull/319))
- Add logo favicon and progress favicon in logo color
- Set current viewport as default when open settings > dashboard
- Disable heightmap panels when klipper is not ready
- Linux like console & customize console height ([#321](https://github.com/mainsail-crew/mainsail/pull/321))
- Add welcome message in empty console
- Hide heaters, temperature_fans and temperature_sensors with _ as first letter in the name
- Add canvas to tool color picker

### Localization

- **fr**: Remove unused keys
- **fr**: Fixed last missing translations
- **fr**: Fix one type in settings console tab
- **hu**: Update hu json ([#333](https://github.com/mainsail-crew/mainsail/pull/333))
- **hu**: Fix last words
- **it**: Remove unused keys
- **it**: Add translation
- **nl**: Remove unused keys
- **nl**: Fixed last missing translations
- **zh**: Update chinese trans ([#332](https://github.com/mainsail-crew/mainsail/pull/332))
- Update francais
- Last fr fixes

### Documentation

- Add .svg as valid background extension ([#285](https://github.com/mainsail-crew/mainsail/pull/285))
- Add home and temp check to PAUSE and RESUME ([#288](https://github.com/mainsail-crew/mainsail/pull/288))
- Add voron toolhead and cyperpunk communtiy themes and a few improvements of how screenshots get loaded. ([#298](https://github.com/mainsail-crew/mainsail/pull/298))
- Fix typo
- Added nvm node install for standalone dev env ([#325](https://github.com/mainsail-crew/mainsail/pull/325))

### Other

- **App**: Fix build warnings
- **build**: Change sass version as workaround for vuetify sass warnings
- **docs**: Update gem packages
- **github**: Add build workflow for test builds
- **github**: Add build workflow for test builds
- Increment version number
- Increment version number to 2.0.0-rc.2
- Increment version number to 2.1.0-alpha
- Fix some eslint warnings
- Increment version number to V2.0.0

## [1.6.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.6.0) - 2021-05-18
### Features

- Delete directory with content in g-code files
- Delete directory with content in config files panel
- Feature: limit requested_speed wiht current max_velocity
cleanup StatusPanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Display printername in SelectPrinterDialog.vue
- Display filament weight metadata in gcode-files list
- Store webcam settings in printer farm
- Multiple custom console filters
- Rename directory in ConfigFilesPanel.vue
- Add FR to i18n
- Add filament_motion_sensors
- Add UV4L-MJPEG webcam support

### Documentation

- A simple recommendation for remote access ([#277](https://github.com/mainsail-crew/mainsail/pull/277))
- Stylesheets & escaping gcode ([#279](https://github.com/mainsail-crew/mainsail/pull/279))

## [1.5.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.5.0) - 2021-04-13
### Features

- Add probe to endstop status panel
- Add option to display ZOffsetPanel in Standby ([#230](https://github.com/mainsail-crew/mainsail/pull/230))
- Add restart webcamd button in top corner menu, when webcam is enabled in sidebar or dashboard
- Show/hide printed files in gcode files
- Add tooltip with object height on layer counter
- Add ETA to page title
- Add ETA to page title
- New editor ([#243](https://github.com/mainsail-crew/mainsail/pull/243))
- Add days to ETA (status panel + tab title)
- Add ip cam to webcams
- Add recovery function to update manager
- Add debug mode to display ram usage
- Feature: grid view for multi webcam
feature: lazy loading for adaptive mjpegstreamer webcam

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Add webcam support to printer farm
- Add M117 output to status panel in standby mode
- Add "Busy"-State, if the printer is in "standby" and execute some commands
- Redesign status panel
- Send an api e-stop instead of M112 gcode
- Display full version number of up-to-date components in the update manager
- Add state avg to heaters and temperature_fans in ToolsPanel.vue

### Documentation

- Fix theme list
- Add Localization to development docs
- Fix localization guide
- Add credits ([#263](https://github.com/mainsail-crew/mainsail/pull/263))

## [1.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.4.0) - 2021-03-09
### Features

- Add tacho value to miscellaneous fans and temperature_fans
- Display bed_mesh variance and make profile name clickable
- Display power/speed axis in tempchart only with a enabled dataset
- Add info icon to clickable update logs
- Add .nc to valid gcode extensions
- Add option to enable cancel_print button permanently

## [1.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.3.0) - 2021-02-27
### Features

- Feature: customizeable tempchart length (moonraker: temperature_store_size)
bugfix: autoscale chart (ignore hidden series)

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Add configable chart rendering intervals
- Save last setting of ExtruderPanel.vue in .mainsail.json
- Commit dialog for upgradeable components

### Documentation

- Update manager config in manual setup
- Add custom.css example
- Custom.css slight reformat
- Theme warning fix
- Add different message styles

## [1.2.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.2.0) - 2021-02-09
### Features

- Disable power devices with attribute "locked_while_printing" in moonraker while printing
- Process notify_klippy_shutdown from moonraker
- Feature: add update notification
feature: display branch if not master in UpdatePanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Add disk usage to gcode-files
- Add preheat function in gcode files context menu
- Add customize feedrate for ControlPanel.vue ([#49](https://github.com/mainsail-crew/mainsail/pull/49))
- Add customize feedrate & feed distances to ExtruderPanel.vue ([#158](https://github.com/mainsail-crew/mainsail/pull/158))
- Hide additional sensors
- Hide additional sensors in temp list

## [1.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.1.0) - 2021-01-31
### Features

- Add autoscale tempchart
- Save chart settings in mainsail.json
- Feature: add zoom in tempchart
feature: add combine tooltip in tempchart

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Add combobox for target temp with preset values
- Add hover marker in tempchart
- Add additional sensor support in temperature panel (bme280...)

## [1.0.1](https://github.com/mainsail-crew/mainsail/releases/tag/v1.0.1) - 2021-01-24
### Features

- **refresh-webcam**: Refresh webcam view on focus
- Add registered_directories in server init process
- Restart moonraker if you click SAVE & RESTART of moonraker.conf
- Redesign MoonrakerFailedPluginsPanel.vue and MinSettingsPanel.vue

## [1.0.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.0.0) - 2021-01-19
### Features

- Add farm mode
- Add moonraker update notifications
- Moonraker failed_plugin output on dashboard
- Add gcodeStore types (respond, command)
- Feature: hide mainsail in the update manager in remoteMode
bugfix: fixed padding bottom of the close button in the UpdateDialog.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Feature: show klipper & moonraker branch on hover
feature: disable update buttons during a print

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Add detached state in update manager
- Add output_pin to PeripheriePanel.vue (fan panel before)
- Add clear print stats button in complete state
- Display reprint & clear print button in print_state error
- Feature: add requested speed to StatusPanel.vue during print
feature: add ETA to StatusPanel.vue
feature: add current & max layer to StatusPanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Feature: add klipper config references link in editor
feature: add save & restart button in editor

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Close top corner menu after all functions except power devices
- Upload & start button in topbar
- Add preheat & cooldown function in ToolsPanel.vue
- Add HomeAll (G28) button in Heightmap.vue
- Add custom gcode to presets
- Convert heater, fan & sensor names

## [0.4.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.4.1) - 2020-12-31
### Features

- Add log during a update
- Add customizing sidebar logo
- Add customizing favicons
- Gcode files fileupload progress
- Feature: add multi file upload in gcode-files & config-files
feature: add upload status in config-files

Signed-off-by: Stefan Dej <meteyou@gmail.com>

## [0.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.4.0) - 2020-12-27
### Features

- Console Dashboard -> input field
- Customizable sidebar background
- Hide hidden files in config files
- Custom sidebar background image & custom css
- Update of the heightmap
- Move power switches to top corner navi
- Variable max temp from temp chart
- Display PWM value in heater list
- Tool panel > temperature_sensor > tooltip on mouseover (min/max)
- Disable save_config during a print
- Colorize console output & input
- Update manager for klipper, moonraker, mainsail & os packages
- Hide temperature output in console and add custom filters
- Restart services (moonraker, klipper)
- Update manager -> add loading to sync button

## [0.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.3.0) - 2020-11-28
### Features

- Show/hide columns in G-Code-Files
- Show klippy state panel in settings > machine & rename SystemPanel.vue to LogfilesPanel.vue.
- Missing config panel on Dashboard.vue
- Debug .env.development.local.example for moonraker connection
- Feature: new estimate time calculation
move getters to printer/getters

Signed-off-by: meteyou <meteyou@gmail.com>
- Save countPerPage from gcode files & config files in gui.json
- Update PowerControlPanel.vue > new moonraker version of power plugin
- Dynamic temperature-sensor icons + header minimize from temperature panel
- Redesign panel headers

## [0.2.6](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.6) - 2020-10-27
### Features

- Modify dashboard console for more message space

## [0.2.5](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.5) - 2020-10-24
### Features

- Feature: rework the StatusPanel.vue
feature: add Sys Commands to the topbar

Signed-off-by: Stefan Dej <meteyou@gmail.com>

## [0.2.3](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.3) - 2020-10-15
### Features

- Add "edit file" in context menu of configfiles
- Allows flipping the webcam horizontally and vertically
- Add slicer version in g-codes files
- Ensures app bar doesn't scroll off page
- Feature: SAVE_CONFIG button, if klipper needs a "SAVE_CONFIG"
bugfix: temp chart bug after loosing connection ([#82](https://github.com/mainsail-crew/mainsail/pull/82))
bugfix: clear mainsail store after klipper restart
bugfix: heater min/max temp input field

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Read version from package.json

### Refactor

- Docs move upstreams and common vars to independent conf

## [0.2.2](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.2) - 2020-09-03
### Features

- Switch to meta data notifiy

## [0.2.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.1) - 2020-09-01
### Features

- Show gcode thumbnail in StatusPanel.vue while printing

## [0.1.3](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.3) - 2020-08-14
### Features

- Feature: add config editor
bugfix: new file named "e" after upload in root directory

Signed-off-by: Stefan Dej <meteyou@gmail.com>

## [0.1.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.1) - 2020-08-01
### Features

- Fine babystepping (0.01 steps)
- Feature: add Z_TILT in ControlPanel.vue
feature: replace "_" in macro names in ControlPanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com>
- Rename "Host restart" to "Host reboot"

## [0.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.0) - 2020-07-26
### Features

- If Filament used > 1000mm -> convert to m
- Babystepping, switch between idle interface & printing interface, first tests with PS thumbnails
- Show temperature_probe on dashboard
- Feature: file manager -> show/browse directories
feature: file manager -> grab metadata per page
feature: file manager -> search in directory
- Feature: file manager -> create/remove directores
feature: file manager -> show thumbnails (list + printstart)
- Feature: rename files & directories in g-code files
bugfix: message display on dashboard
- Feature: move files in filemanager
bugfix: update endstop status mutations
- Update package.json
- Warning tool input if temp too high or too low

## [0.0.12](https://github.com/mainsail-crew/mainsail/releases/tag/v0.0.12) - 2020-05-11
### Features

- Temperature_sensor min/max temp by hover
- Select value by focus heater input field

