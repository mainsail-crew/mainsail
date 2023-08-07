<!-- THIS FILE IS UPDATED AUTOMATICALLY, ANY CHANGES WILL BE OVERRIDDEN -->
# Changelog
All notable changes to Mainsail will be documented in this file.

## [2.6.2](https://github.com/mainsail-crew/mainsail/releases/tag/v2.6.2) - 2023-07-30
### Bug Fixes and Improvements

- Fix editor save & restart button behavior (#1483) | [8447be2](8447be2ecee64fa4a3c0211ac57f42c3adf1d050)
- Hide rpm in temperature_fans without tachometer_pin (#1489) | [e929c7c](e929c7cc0f45074f40407420b3585d9c02284fa1)
- Fix flip function in several webcam clients (#1487) | [5c40820](5c4082010890e0b341754f42673affe7d1ca9d99)
- Fix issue with camel-case object names in temperature panel (#1491) | [aeee198](aeee1982398acca803f7f4eae7b7b39a29253179)
- Use webcam name instead of UUID for timelapse plugin (#1492) | [d67ef3a](d67ef3aa908601b6bb87353957bcc97ea4f829ea)
- Fix issue with create/edit presets and refactor settings (#1499) | [6a4cca7](6a4cca751c88e89ddf5f2cc0f09a58f097a461af)
- Fix multiple issues in the refactored update manager (#1497) | [9eb133b](9eb133bd85530ac08416e94f02ebe19f060bc095)
- Fix issue with cannot extrude after a Klipper restart (#1495) | [cda3098](cda3098c9e09a054aa7baa69a3195e0a73f43e54)

### Refactor

- Refactor SettingsRow (#1484) | [0b47a80](0b47a80b133e6093aecdb0d7d87b718899dff0c7)

### Localization

- **pl**: Update Polish translation (#1482) | [0c5aca8](0c5aca8baffb65198f43a7d3b2b57571d8e911c9)
- **zh**: Update chinese locale (#1486) | [7251a8c](7251a8c6bae2b92395de4c8c23e8e8e3900df66a)

## [2.6.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.6.1) - 2023-07-24
### Bug Fixes and Improvements

- Show delete dialog for single files too (#1442) | [7da3352](7da33523d1ec7c4a3206400fb92803685176167e)
- Remove variable check in klipper config StreamParser (#1435) | [6e7ef65](6e7ef6554ec88ceb29f66b4d6a5d5f21ef77671b)
- Fix condition in restartServiceNameExists check (#1450) | [a7e70c7](a7e70c75d0009ffed14e8717ad8286f91e4e7e8a)
- Avoid hitting 100% before print is complete (#1455) | [3959000](39590004da7ca22fef82fbd148b31683c462bb13)
- Fix issue with ETA and 12h time format (#1463) | [039a446](039a446944f05ea241574c65040d520bbbef0e9b)
- Fix issue with CSV separator in contents (#1460) | [1895d2d](1895d2d90591946c792faaf3f62c52865f27cd62)
- Fix issue with webcams in farm printers (#1469) | [5b2bea5](5b2bea51aab79aabfab02825cdce45be351c1c6f)

### Refactor

- Build version file for moonraker (#1449) | [21d3d39](21d3d395039ec855d062a5ee5e5b43e2d858f402)
- Use moonraker webcam api instead of direct DB access (#1445) | [7c81690](7c81690c1e299c804edb4ede0acab7d77d1dedbe)
- Change SettingsGeneralTab file (#1475) | [db09bbe](db09bbe043b2e43053779709f5260c7275bc4969)
- Extract Presets and Settings from TemperaturePanel (#1465) | [be25316](be253165a003c50fd992f43c586ce5315dc2352d)
- Display errors and warnings in the update_manager (#1453) | [0cefa24](0cefa24e766c568a56127bfd55272735383cb45e)

### Localization

- **pl**: Update Polish translation (#1434) | [73e503f](73e503fc6448ae174dd7f9d59236c820bd4b6631)
- **pl**: Update Polish translation (#1447) | [d844125](d8441254db04d672fe2137f64e39127f524c4769)
- **pl**: Update polish locale (#1471) | [a58bef2](a58bef2a03479262b4ee5db2b5d103e8dc2194c5)
- **pl**: Update Polish translation (#1476) | [6758049](6758049d29c7410bcdedec689eaca503952b2c7e)
- **tr**: Update turkish locale (#1480) | [f52b94c](f52b94c459ad759e160a568d3b6f366b0e65f484)
- **zh**: Update Chinese (zh) localization (#1459) | [bcbef2f](bcbef2f19af4746b941ddcb29c98ff5f071611d0)

### Other

- **pwa**: Remove debug warnings in browser console (#1441) | [2962df2](2962df21e512baad6976dc502d6234c2969da686)
- Add dev-dist to .gitignore (#1451) | [ef2d17c](ef2d17cadde566e8b713031cb7292d65ca1bec12)

## [2.6.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.6.0) - 2023-06-19
### Features

- Allow negative time estimate in slicer (#1372) | [e6505fe](e6505fe55a30878045cea6611c119b9f3601ab33)
- Customize sidebar navi (#1336) | [a3316eb](a3316eb23bf35eb139c9ba183cfc3a731d013c1d)
- Add AHT10 to additionalSensors (#1378) | [ec53b97](ec53b974fd3e3d32bfa01e06919c8f51014545e4)
- Add function to duplicate gcode files (#1321) | [4d7ffbe](4d7ffbe090611fb82e1524c8428ea3fc4290c410)
- Add jmuxer-stream webcam type, supporting raw h264 (#1342) | [40e8f9c](40e8f9cd63d685b611935e1ceee70e2dfd331eda)
- Add options to disable klipper helper dialogs (#1319) | [74816c5](74816c5c2126d8320028602aa55b075bfd9db647)
- Add facility to Scan Metadata from G-code Files (#1316) | [8bbd5bd](8bbd5bdb0f2ea26b57e1b4977b222c023f7ffa44)
- Allows adjustable tab size in file editor (#1354) | [ea274c6](ea274c6d4a4445ff47c1b5c60d0dca94e5c8cdcd)
- Add printer name to browser tab while printing or complete (#1371) | [140d796](140d796f518cbb2eb72b2394a02c9dfa504fe1fd)
- Add an option to change the height of the temperatur chart (#1391) | [d578c2a](d578c2a107a5b6d4026699d165ab597587c300a4)
- Updating WebRTC with camera-streamer signaling protocol (#1417) | [b948407](b94840736fa26fbb9b5690e40c2ebf87c7f3ec32)
- Add portuguese/brazil translate (#1407) | [630d67e](630d67efc50766857e6b1b8a69605fd7c502dbe6)
- Add bed aspect ratio to heightmap graph (#1420) | [2b4b881](2b4b881c5529834ca1bd4c3f14db44c997b935ba)
- Add WebRTC (MediaMTX / rtsp-simple-server) webcam mode (#1318) | [8682dd7](8682dd785551ac10cec7783fd455f56b9ae340c0)
- Add retry button to ScrewsTiltAdjust helper dialog (#1429) | [2752cfc](2752cfc975bfe4391657bf03e62db5f5317c523b)

### Bug Fixes and Improvements

- Find LOAD & UNLOAD_FILAMENT macros case-insensitive (#1335) | [df83c9d](df83c9d8cc61ecd11c320ec90a9083fdd675d3bf)
- Fix thumbnail guide link in settings (#1337) | [ad8d8ef](ad8d8efb6a41f1d4162ef9d08720a3a19442b1e6)
- Fix configuration guide link for thumbnails (#1338) | [faf09f2](faf09f24f9765397acbde3b6af8c9a521e3616d4)
- Fix miscellaneous slider + button for fans/outputs with max power (#1344) | [c598d62](c598d6260dca0f107f219ee67600c0b969addc6a)
- Add gcode offset to live position in gcodeviewer (#1341) | [ab777d5](ab777d5e04be5bda396096293bd974a6d96307bf)
- Fix zip file timestamp (#1375) | [f701dfb](f701dfbcf8e1a5aec5aefb6abee7854a61257eb2)
- Make the correct notification appear on gcode file move (#1376) | [bb71079](bb710794d277e7116628386250e2b8cb3d3122c1)
- Fix issue when moving a file to the root directory (#1377) | [6484a41](6484a41eca007920495d07d7c009dee720b4f1c6)
- DisableFanAnimation getter getting wrong value (#1381) | [a08f9ac](a08f9ac9a5709ad624274cf4a322a55b81d1b347)
- Check only not empty filename for metadata in farm printers (#1392) | [f9556e2](f9556e27b34489d3abd5d62429c1d908c60dc946)
- Fix navigation to display allPrinters (#1423) | [8a34656](8a34656e82603940197ddc5f399b28eb32848cb1)

### Refactor

- Improve syntax highlighting and change theme in editor (#1200) | [080a713](080a713f4cbd8a994099c2ebaf802d43a06e2ad9)
- Add webcam-wrapper component (#1422) | [cff7b32](cff7b32f02a8dc81eda2b101ffbf7354cd88a886)
- Refactor Panel.vue (#1427) | [5abf417](5abf4173031fe8fb23ded02679d0997d0620ecc7)
- Remove unused import in FarmPrinterPanel.vue (#1428) | [6ce0f4f](6ce0f4f0748fea887acc4767098d2ddae3635245)

### Styling

- Fix eslint issue in SettingsNavigationTabItem (#1383) | [23da881](23da8818c344eb8f77366f16cac6ca1237d3cda8)

### Localization

- **de**: Update German localization (#1424) | [4a41430](4a41430f4006f1d4d131c6aa4cf0d6e26adef4b6)
- **en**: Remove unused key (#1425) | [5b55727](5b55727485e276e714d69a83cabff0a959a8389d)
- **ko**: Update Korean localization (#1368) | [0e86652](0e86652d1c0cd0b933c77599658461f4764cc931)
- **pl**: Update Polish language (#1411) | [a85ec9d](a85ec9d0d746d5c8ea9838a71656e11af676196b)
- **ru**: Update russian localization (#1394) | [7468f88](7468f882c1b0c45051edb64ab8cb90ab82616feb)
- **zh**: Fix translation (#1418) | [30efd64](30efd6496ec2475e68a022e37bd006340a168049)
- **zh_TW**: Update Chinese localization (#1386) | [8481408](84814080291e6f037230491c3e273ddd49ed6e53)

### Documentation

- Add Contributing section in README.md (#1339) | [dd262f7](dd262f74b0a82761de04180c7baf730c9854f71f)
- Fix broken coding standards link in contributing doc (#1415) | [d4f1bf2](d4f1bf209d15763e45f67dfec799fbee78090e47)

### Other

- Exclude htaccess file on upload to my.mainsail.xyz (#1347) | [370d7d4](370d7d414287bd12a1aa7ffa18a5c6ef4f746d4a)
- Add PULL_REQUEST_TEMPLATE (#1340) | [301e838](301e8386b823c4c005172f33cfb0969d4e1b8d20)
- Add PWA caching and cache updater (#1421) | [8fc2750](8fc275086addfc55ff805452b8f8fa4ccb6feb2a)
- Update ftp upload action in release workflow (#1430) | [7966270](7966270ea783f5c79549ba325c9bb11e6a0e3447)

## [2.5.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.5.1) - 2023-04-02
### Bug Fixes and Improvements

- Missing M117 output in status panel (#1309) | [0f01a8f](0f01a8f994953c6518a0ece4870b0328387c5cb1)
- Disallow non-ascii chars in bed_mesh name (#1311) | [7301ae9](7301ae986abea0b71281f62979098bb99b362469)
- Fix issue of empty Screws tilt adjust helper dialog (#1329) | [44f4079](44f4079dacbe88ce84c27ea32080d95756d5e468)
- Fix invalid name input checks (#1312) | [85ea45f](85ea45fbe9b34d9a19ed1a3fcaed95514c3977e5)

### Localization

- **cz**: Add Czech localization (#1327) | [531b75f](531b75fffd2e22c60764e10c4ed1786449d9cad5)
- **de**: Update German localization (#1326) | [ec1b32e](ec1b32eaaf83222591d822b233bdcff54f428560)

### Other

- Update caniuse (#1330) | [c18a959](c18a9594e6c9cc61ff0a7ac68b2206aa73cce697)

## [2.5.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.5.0) - 2023-03-12
### Features

- Add multi download to ConfigFilesPanel.vue (#1194) | [712d681](712d68136b62ddb825c7620071e155571322b927)
- Add table view for print status stats (#1192) | [7ac6a72](7ac6a723b4f2def8d46beb050457cb0ffc725be3)
- Add new CodeStream control to Gcodeviewer (#1224) | [1a32147](1a32147d68938e9c1155b535f9212d9858947d45)
- Add support for cnc mode in g-code viewer (#1239) | [727fc72](727fc722af2a9213670ae4a21d0a1683c24e8fc2)
- Hide/ignore .git directories in file init process (#1227) | [051b896](051b89662b4576f6821c6b8bb66d116db6905397)
- Log rollover function for klipper and moonraker (#1243) | [b6fe84f](b6fe84f19d66cbbcf3170855b3c19c13a3fdb135)
- Add power button on dashboard to switch printer on (#1254) | [d29ce0a](d29ce0a4f02f7be305f337c9a27ed32d02da5d64)
- Add button to hide SAVE_CONFIG button for pending bed_mesh (#1255) | [0f94e80](0f94e80135f426fb558a96a2c419d22180d0c328)
- Add HLS Support for webcams (#1258) | [6b9b695](6b9b69501a6718ea9ae83037a8b43af52b826573)
- Add helper display for screws_tilt_adjust (#1261) | [c904b7b](c904b7ba71144236fe3c6dff9fa82d636a1b9bec)
- Add jobs to queue in batches (#1253) | [b3ce868](b3ce868dec2f9dd6fb9932650e61e219b5944c5c)
- Add function to send PAUSE at a specific layer change (#1230) | [cec3a9f](cec3a9fe33ea931c7496ea1f4bef8af47c51566c)
- Add x_only and y_only option in timelapse park position (#1231) | [2a924bc](2a924bcd27e539452f7c5928b339cedb87cb8d0e)
- Support a color or colour variable from tool change macros (#1244) | [e0e90bc](e0e90bcdaf36a490dc45a505436eb6bbde04e6e5)
- Max webcam height to fit on the screen (#1246) | [43dc843](43dc843eca753154d698f045f7e2d9433d115aa0)
- Add WebRTC (camera streamer) support (#1275) | [6703721](67037215933acf0603a6e1130cc835b98274d3ed)
- Allow fan animations to be disabled to save browser perf. (#1232) | [47feaef](47feaef6718c03ea4ef4130210c958fb60cb2be5)

### Bug Fixes and Improvements

- Hide temperature sensors with `_` at first char (#1195) | [e21439d](e21439d061e2abe566919f5c62b019bc92e89a1f)
- Add webcam rotate to timelapse preview (#1198) | [c2ecc84](c2ecc845cadcb998875f3ab8069a5f76afe86ed9)
- Fix ExcludeObjectDialogMap for delta printers (#1217) | [034ff81](034ff81e4970469f3b4e96ca504e091e792ec326)
- G-Code Viewer UI fixes (#1240) | [9c4fb54](9c4fb547b55e424ca1ddd334b43b6998da32b5b4)
- Fix dateTime output in print history detail dialog (#1248) | [2b7bf2a](2b7bf2a3f43ee8b3d8c14be2d84263abac936c4b)
- Hide unused panels on dashboard (#1233) | [e7eb94f](e7eb94faa1696237890ef8fe546db379067cc5dc)
- Fix cancel button in rollover logs dialog (#1256) | [c65527d](c65527ddf21ff6d5ea87dee6a29d2710e29c049a)
- Fix output of klippy state, if UDS path/address dont fit (#1263) | [a8bf9e9](a8bf9e9559aab80747871fdbce94c429a2360596)
- Fix position of webcam fps (#1278) | [f3c4295](f3c42954f1119157631772622786af7db28a7f98)
- Fix browser title, when printer is off (#1300) | [3e49847](3e49847fc3668295a67c1edcbed28a5e68f2c7a3)
- Only display PAUSE AT LAYER button, when the macros exists (#1291) | [a3a71c8](a3a71c8f15357467f85f9169dc20ef52aff2a535)

### Refactor

- Use moonraker zip function (#1245) | [8782c89](8782c89d71613f3552976e7d0ba60fb6138e580d)
- Rename download zip name (#1252) | [22ccab8](22ccab831b24e2746b6dd7a775225e59b9bf5e1e)
- HLS streamer - improve latency (#1268) | [6a2a1ba](6a2a1baaabc52e85abf6aa05b1cac9bc8fbbf8b7)
- Change jobqueue entry attribute to hyphenated names (#1271) | [92438bf](92438bf8a7f8a0e29162460205321fa25a124ec7)
- Add ENABLE=1 to SET_PAUSE_AT_LAYER/NEXT_LAYER (#1293) | [1a6969e](1a6969eeea2ef4df8b32a1df3b6e5b4369591dcf)

### Localization

- **da**: Update Danish localization (#1288) | [c42f09a](c42f09acc98ed9aba9d4911a36bc6d17e351ddf3)
- **de**: Update German localization (#1277) | [0e4d104](0e4d104d20fd578ea8252d6791bce24e66608396)
- **fr**: Update French localization (#1289) | [c1a5018](c1a50180d0269377b5ec67bca51aed9aedcd8f12)
- **ja**: Update Japanese localization (#1270) | [b0cdbb4](b0cdbb48f3347e5262f24eca14788d5c248359e5)
- **nl**: Update NL locale (#1282) | [3743023](3743023514507577b88540362bc8fbeae086add3)
- **zh**: Update locale (#1269) | [328530a](328530a6a39a62d797c9c20aabf010dc89264152)
- **zh**: Update Chinese (zh) localization (#1284) | [2f868b5](2f868b537d5a42dcac1d76dfc69729037ae3f450)
- Remove unused locale `PresetSubTitle` (#1264) | [3b5d7f1](3b5d7f146b0a5a160b0586e9d9938692895ded09)

### Other

- Add .vscode to .gitignore (#1290) | [1bbbc0c](1bbbc0c0a8ddd8ad8bf1dc3db53c07b63590dd5d)
- Add armv6 support for Docker image (#1285) | [52d0ea4](52d0ea4ec57b94582386666fc6389e7d260741f4)
- Update gcodeviewer from v3.2.0 to v3.2.2 (#1303) | [9665fb9](9665fb9a387a05796b26aefa276a869425099a00)

## [2.4.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.4.1) - 2022-12-10
### Bug Fixes and Improvements

- **ExtruderPanel**: Wrong calculation for estimated extrusion length (#1157) | [d87fe41](d87fe4173d89e6df5b80378e5d005f8ada23248d)
- **Heightmap**: Save z scale setting (#1175) | [3d4b545](3d4b5451ae2d23df04fa6047ba2239586fd3d5c3)
- Display layer count with older klipper versions (#1161) | [bc0018d](bc0018dadc2e77e16ef076ae74ec8aaac2d0b34e)
- Display can interfaces in system panel (#1159) | [a6e38df](a6e38df0129e2e00a9f2ff2efeb8b56761199d58)
- Fix relative webcam urls on multi instances (#1162) | [31664b5](31664b5f3818a2609f9ee599265e8835c4ccf707)
- Fix handling issues with number-inputs (#1168) | [bae7125](bae712540e077ecbaf7328e570bf39ece7711307)
- Fix neopixel settings if name is uppercase (#1169) | [12483ee](12483ee63bb1038acf7d78b5059d158ba1927917)
- Fix dashboard interface settings (#1176) | [45c52e3](45c52e3571b3c21fcd734cc8efe54549c1424db9)
- Add theming for find/search panel Search panel (#1174) | [94d7f0d](94d7f0dc1677ce3ead51f05db52b7679a5dcdc69)
- Disable circle control while printing or not homed (#1171) | [41ca524](41ca5244ccf32ddffc534d87b2fe9821812de821)
- Add more space between the rows in manual probe window (#1189) | [288e511](288e5110f4e823a475820d3aed7fceafb8eec275)

### Refactor

- Rename variance to range in heightmap (#1166) | [ba5aea2](ba5aea2b889adf30d9ae1b28419d0003344c8854)
- Replace emergency stop icon (#1170) | [4c24fa7](4c24fa7284aaf7887bc1c17ff21c11e4810e3164)

### Localization

- **da**: Update Danish localization (#1179) | [dc17ff1](dc17ff1158beb16d1a19a755d46f4c75a9f857ca)
- **nl**: Update NL localization (#1191) | [0735ed3](0735ed37a9b173744dbf426c8c3274bcd9fe2641)
- **tr**: Update Turkish localization (#1188) | [de23cb6](de23cb62438c1cdb0ba70e0b1617a7bcf03c7d89)
- **zh**: Update Chinese localization (#1142) | [1a659d3](1a659d30d2c5e3a939d9fde49dee5af1e636b99e)

### Documentation

- Add BIGTREETECH to repo README as official sponsor (#1178) | [03640e2](03640e239b8cdfaf99e6a87dc09fb4c77938aeca)

### Other

- Add release workflow (#1185) | [3e06c5f](3e06c5fd6690e0e27f45aa12cc1b4e29ec428d31)
- Fix release workflow (#1190) | [655d2fd](655d2fd339da79e2ad813238b5f300a18d93139d)

## [2.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.4.0) - 2022-11-14
### Features

- Add manual_probe helper dialog (#1077) | [950dea1](950dea1e08a2d8ff24be3213979db7a671fe613a)
- Add SET_PRINT_STATS_INFO command support (#1034) | [57bb268](57bb268ea04dac3438543709008676cf4f72f4a1)
- Add z_thermal_adjust to temperatures panel (#1113) | [05dea0c](05dea0c78b27e616df83a132f616f20da94db903)
- Add option to change date & time format in settings (#1069) | [685665b](685665bd46e0e56e820b2825f4b9237cb400ed6f)
- Add LED / Neopixel support (#1050) | [a88c9ba](a88c9ba083cdb5157b58455897890e84bd13fd26)
- Add bed_screws helper dialog (#1115) | [7c28027](7c28027189c399b6dc1697ef116ebbdbcfec12cb)
- Multi column for many inputs in gcode macro (#1153) | [20adf79](20adf79e7cab117072c69df8a32e58d11b706d49)

### Bug Fixes and Improvements

- **Heightmap**: Flat for bed mesh not displayed if only one probe count set (#1146) | [6f8cfaa](6f8cfaa276b455c3c103a96d851336a2d59ddcbb)
- **UI**: Missing bottom border radius in status panel (#1106) | [ff37c7d](ff37c7de32564c59354fd6597defd18d785949fc)
- **UI**: Tweak font sizes (#1107) | [feadc73](feadc738478f969eefe5d366761493c608b72f02)
- Set init values in TheManualProbeDialog.vue (#1092) | [6a40e60](6a40e6047d980d59bb1497057b0ab0acf8bc1527)
- Broken link in readme (#1104) | [829e7a4](829e7a497d4ac5765a41d38007b4d087fa110a46)
- Fix relative webcam urls with port (#1147) | [4760b9d](4760b9d9f1b4542170890690837f6127f92751e2)
- Cannot upload GCODE files on iOS (#1152) | [2aa181c](2aa181c7f567f8bbc9828ea4c921b8dd47711491)

### Refactor

- **KlippyStatePanel**: Display buttons as outlined text buttons (#1134) | [d6015be](d6015be7349364ee8fdfb9e11c87fa47e2400c64)
- **editor**: Use the config reference link of a translated version if it exists (#1120) | [837623e](837623e0a1b3aab3a185e1b0d5d62641078b2dc0)
- Display bit version of OS (#1101) | [37c9fa8](37c9fa865743c785193284ef0d3be6e2b3b2f31f)
- Fix lint issues (#1111) | [835c5da](835c5dacd278caa9df35c101b9665e40dd9ab837)
- Improve webcam settings logic and layout (#1114) | [d1cfe72](d1cfe7251d065a8dd45986abc4023996bddd8f28)
- Rework of the KlippyState panel (#1118) | [cca17a8](cca17a882284f838251607ea6b1f839e3b9d3c41)

### Localization

- **ja**: Update Japanese localization (#1131) | [c9ab078](c9ab0782bf481e9a3868421b7b4879d50dfee35a)
- **ko-kr**: Update Korean localization (#1098) | [285b8b9](285b8b9b6f944f2ab5b126d21428ed2813bb6a4c)
- **uk**: Update Ukrainian localization (#1094) | [8cba020](8cba020fb2bf754276227de4ed430de22b956d29)
- **zh**: Update Chinese localization (#1089) | [f01f421](f01f421c1cbb1c730bb10b624c70c998cc8db4d9)

### Other

- **build**: Update compiler target to support import.meta (#1112) | [d05efe2](d05efe26c438e8057df8172d62adcce172fde06f)
- **deps**: Update dependencies (#1103) | [666c942](666c942b1818794502a47da31ed187ff401ed011)
- **locales**: Rename locales as per ISO 639 (#1108) | [a305f24](a305f243da123d1e5e802430a4eec3f49095f572)
- **locales**: Remove all unused keys (#1109) | [d5cafaa](d5cafaaa06f537b5e6680323296cd6b439885545)
- Rename and clean up AboutModal (#1090) | [27c57ee](27c57eef68efb9e1f050a8c42b37d78f586c077f)
- Remove LGTM workflow (#1091) | [78b9864](78b9864d1112e98ceb4a0f0b5f3fc065bc2a2806)
- Update gcode viewer to V3.1.4 (#1119) | [128baea](128baea88c863f36edef83356a4bb24975fd4765)

## [2.3.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.3.1) - 2022-09-16
### Bug Fixes and Improvements

- Use background to fix border issues between the elements (#1068) | [175a90a](175a90aae55fa318265e010405465918bff35efb)
- Load instances from localStore if instance store is browser (#1086) | [3f67d1d](3f67d1d4c59278111397b29c130711f7ac71bd46)
- Add input validation in filemanagers to prevent overwriting existing files (#1087) | [3ec2ee2](3ec2ee2793348be0b9b753ea4586f8fbbb557295)

### Refactor

- Extend css editor support to .scss and .sass files (#1083) | [e411175](e411175b7f313a230884c05f106b1a8412181aea)

### Localization

- **fr**: Update fr locale (#1072) | [42f7851](42f78516368a24ce6274adcd4c527bdcc321d1e8)
- **uk**: Update Ukrainian localization (#1067) | [2b20576](2b2057648d6aaa10623303adf9953219b4a8bb1c)

### Other

- Update broken link to DCO (#1084) | [12dd1c9](12dd1c9e312fd0637b8b6dc60c282ba42a41b91f)
- Lint:fix locales (#1088) | [a70bd12](a70bd12c1907fddc121c43287de6940a178d1f38)

## [2.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.3.0) - 2022-09-09
### Features

- **editor**: Add .css language support (#936) | [eb1d3c1](eb1d3c1475086c0634338928fcd5bbd8ab5f8b59)
- Allow collapsing of config file panel (#943) | [7da894d](7da894d55ed360714641a5a209f6838eaa32a014)
- Init interface before display panels (#961) | [1f9d8e8](1f9d8e86be7ffe03eb6e8cf4e27a7ec687aa29ab)
- Allow for more decimal places in move-to-input (#976) | [6f68709](6f68709f2151cd116f11a6581d34ff14d0974fe6)
- Rotate webcam in Mjpegstreamer-adaptive mode (#923) | [f27a777](f27a7770a9115423896faf403fa3baf07edd08dd)
- Improve load/unload filament button logic in Extruder panel (#989) | [fa2f07f](fa2f07fc2227a32e5f948f8f4d76ca4a7167d5a8)
- Download button for crowsnest.log and sonar.log (#991) | [9474ae6](9474ae614d185ce1d1400bed1f61f88e6909d32a)
- Show current bed mesh profile name in toolhead panel (#1000) | [2eb3400](2eb34007e1548fce15549dd3c0dc8e8ab2ee5875)
- Add defaultLocale in config.json (#1010) | [46f0879](46f087967705379bd64a2bd2a45084529b836f1a)
- Add option to switch print progress calculation (#1013) | [f55b58a](f55b58a2a93d92acd24410ca1f1b5a0eecd2ba46)
- Add temperatures to gcode files list (#1017) | [1f71d2d](1f71d2dbbc5eb1332a6dcf6dfc62eefe460f8418)
- Add warnings if gcodes/config root dirs don't exists (#1018) | [349372f](349372fd644f54f510529b16cf383c862224b503)
- Add exclude objects in G-Code Viewer (#1028) | [24d5668](24d5668a650f8c96a7ea13a2f492bc013e375411)
- Add button to edit crowsnest.conf in webcam settings (#1037) | [99075fb](99075fb25983ba5452cf1e8911670fcef301f98c)
- Add multiselect to timelapse file manager (#1039) | [cbb7075](cbb70759f5b64b692b9126958b1a1a53f22ff118)
- Add Turkish localization (#1049) | [fd79316](fd7931679946733fcaefe45846cbb91467ad2295)
- Show nozzle size in estimated extrusion info (#1048) | [6387431](6387431ce83d1152e84bf818d71452784a240f79)
- Export only selected jobs from print history (#1055) | [28e1ec3](28e1ec384d4920c59f9395584c9c80889c74b00e)

### Bug Fixes and Improvements

- **Heightmap**: Improve input validation for rename profile dialog (#1002) | [4c9aab5](4c9aab5a2dba1a59562b2fc28c8cd78b40e5ade3)
- **editor**: Partial improvement of config syntax highlighting (#612) | [ea8e8e8](ea8e8e8caa49a4d1d9d26b327e3110cfc8854ccb)
- **timelapse**: Renaming a .zip file caused extension to become .mp4 (#992) | [afb041a](afb041a5fa2332fca88338d87b0e5f5b27742040)
- Create folders with spaces in the name (#942) | [1e0645b](1e0645be6e54abed1e30d54830511ae8f1fad54c)
- Add fallback for gcode files without thumbnail (#959) | [46aa7cc](46aa7cc7c6d9d0cf63262411d3a12b8bcec08bc7)
- Match mcu temp sensor of additional mcus (#957) | [c514b3f](c514b3f1303b69807ad32778e4a30b496c495e66)
- Max_power setting in miscellaneous panel (#953) | [6b6ca69](6b6ca698e66e22736c84819448c6b360ce6a46b1)
- Remove js scrollbars in body & editor (#962) | [a4e268e](a4e268e5434ae52cf8f4504161fabf182a52cdfc)
- Fix output with number groupings & add slicer in csv header (#967) | [2b62647](2b626474b4a5569eae683504ec4032f7698a9d1a)
- Reset webcam store on printer switch (#996) | [79bc617](79bc61780c75e8550d9b9923afb8f703e8a61fd8)
- Hide TemperaturePanel if no sensors would be shown (#982) | [8af3f92](8af3f92a6085f7ff2edaecb5fd0d645bb078c3c6)
- Divider in temperature presets is transparent (#1004) | [24932c0](24932c088f6828189f52bf5c7c3dfd4d27765b1d)
- Distro output for armbian in SystemPanel (#1021) | [8c1f09d](8c1f09d9093099702829a50b7c2dc68d49c38a56)
- Webcam name input alignment (#1019) | [b16c1cf](b16c1cfdd2026e1887654853ef4139f029970351)
- Global form validation error misalignment (#1020) | [d8377ac](d8377ac6e55e6ede07d3289e2bf9a8bd524dc131)
- Add missing locale to factory restart options (#1023) | [157e099](157e099964ba7f6dd5593b2b125a695bd79f2c21)
- Fix type issue in releaseName parsing (#1043) | [14f6799](14f67994894f8514a7529ca20bfcfaed691153b0)
- Fix progress above 100% with filament based calculation (#1042) | [05672b5](05672b55c1a2ef686f390decd57ab09a73880326)
- Combine small entries in history pie chart (#1056) | [719b5c4](719b5c4b0155dea8bdaa1043185189d3b01530c0)
- Use correct unit for pressure advance (#1053) | [da569fc](da569fc9f77f18fa8a3bd0bc763b445a4ec3f4af)
- Fix dep loading issue after update vite (#1058) | [0570568](05705683226afeae829ef2e6d546d9a8d1cf6844)
- Remove scrollbar on init load of status panel (#1059) | [6fefc98](6fefc98da601f469a71ff9812f51e8af837cc94c)

### Refactor

- Refactor code in Gcodefiles.vue (#910) | [d1c1b07](d1c1b077d8dda61cd91aea4a2282bf27b57cfa80)
- Reverse order of negative offset values in inline z-offset value layout (#987) | [c2ddac3](c2ddac3e2f3ef8daa3c393e559d986893f9cf387)
- Change remoteMode to instancesDB in config.json (#997) | [1d117ed](1d117ed82f57488881e635c02509a9d8757608ad)
- Move firmware retraction settings to Extruder panel (#1003) | [4357b8c](4357b8c9d68c363e9f9f89dff47243036868e370)
- Remove input validation from MoveToInput (#1022) | [fe99958](fe9995882a4f0a5af518d71f5b64b651899db23b)

### Localization

- **da**: Update Danish localization (#1026) | [2b5ea0f](2b5ea0f66e789858b73c6c3d9cbca266e123a3cc)
- **de**: Update German localization (#1015) | [8d7e4c1](8d7e4c1ea471ddfcb691b9a54335c965b8d622cd)
- **hu**: Update Hungarian localization (#986) | [09ab107](09ab1077a1f2bb54a6bcfa245e16927ac989a3d1)
- **ja**: Update Japanese localization (#1030) | [e75f0bc](e75f0bcee88ff2cdf8cffe7f499c0bd695bce43f)
- **ja**: Update Japanese localization (#1064) | [4a450fc](4a450fc563d2563b5094dcdb1117d5c1861bf4d5)
- **ko-kr**: Update Korean localization (#926) | [7f57f8b](7f57f8b9aa21d2f2172d9be4ef0199a4fc735654)
- **nl**: Update Dutch localization (#1065) | [c37ea7f](c37ea7f0ed6fa8508b7437e129078d6f14481feb)
- **uk**: Add Ukrainian localization (#1061) | [f22d4d0](f22d4d09c8e178c5f367100e2051802bce87118f)
- **zh**: Update Chinese localization (#938) | [4bd2d28](4bd2d28f4bd5907b0bdf7112c2e15e6428eb9647)

### Other

- **docker**: Add linux/arm/v7 architecture to Docker builds (#949) | [e5d4e62](e5d4e6243a2cec1dac3e7c410232edc9eb6636ce)
- Update CONTRIBUTING.md (#902) | [3beeacb](3beeacb4ee6f5f4ea0983002308299eba6eaf98f)
- Update develop branch with master bugfixes (#965) | [7536bce](7536bce10d88b6c8fbe035ddc5022f2a584094ef)
- Add workflow to answer on issues with specified labels (#969) | [15b12a6](15b12a68e5e535164154ea5084aef46bcb0f26ae)
- Update codemirror to v6 (#795) | [f4ed91e](f4ed91e5159595d3c5f3d0b3d53350549d7c3922)
- Update codemirror to v6 (#975) | [8ab59b6](8ab59b642a7219ebe846c5627a51e1920e8ec5ac)
- Change workflow action to dessant/label-actions (#1005) | [f277193](f277193082ac9efa474074fde77b3f056b49e3c5)
- Add LGTM action (#1008) | [1709001](1709001c8bbb85f4a2ff427c4822c07c117b508c)
- Switch to new stale workflow (#1007) | [69f30ed](69f30ed4602d546807621cc63f8ad830311dc69b)
- Add auto-analyze.yml action (#1009) | [98439b9](98439b916badc1247d444be85bc19e39c135397d)
- Add github_token to auto-analyze.yml (#1029) | [5f2f7dd](5f2f7ddc9f59572a8883651032777980ad743be7)
- Fix issues with auto analyze workflow (#1031) | [8e562c7](8e562c7bba54cfc3ca719f6c44d9722f4e0d7d56)
- Change cron interval stale action (#1062) | [eb4c567](eb4c5678ba1f1fa8d56032d78068b16578412714)

## [2.2.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.2.1) - 2022-06-21
### Bug Fixes and Improvements

- Macro buttons with single char attribute (#903) | [8367f01](8367f01bce7828d63b7f3712bc40acc5b15dd9c4)
- Display status tab on dashboard as default while printing (#907) | [9113877](911387755f49cccbca2d9b916e3d02039763ae3a)
- Fix typo in adding new heaters/temperature_fans to chart dataset (#918) | [b5c92cb](b5c92cbcab2a83b4abbc5f19e4c12bfa7679f18c)
- Editor safe & restart with multi instances (#925) | [dfc91df](dfc91df6816981c69dec0dd1cf687230a01f3887)

### Localization

- **en**: Remove unused keys in EN locale (#913) | [8438c0a](8438c0a86bae51ea3fb2df7c3f517dcdae136aad)
- **en**: Fix typos in English localization (#924) | [229a675](229a6759cf128938d381db2ef3b3a3e9ff25c3c0)
- **ko-kr**: Fix Korean localization (#890) | [a30a001](a30a0012900c0567c533c64ab5a5fb785658816a)
- **ko-kr**: Update Korean localization (#894) | [5029f4d](5029f4d9d5bd3e5b6cde69db3901c3d2e8127221)
- **ko-kr**: Fix Korean localization (#890) | [6b18300](6b18300b5d87bf874cd515f8eedd3e66483368a9)
- **ko-kr**: Update Korean localization (#894) | [21ad4c1](21ad4c16e79483e4cf49ebc914a07a9c20b8c3d4)
- **ko-kr**: Update Korean localization (#914) | [38d2c88](38d2c883b1ac643af3d0b654a9fbc35b2611ebd5)
- **ru**: Update ru.json (#889) | [04159fc](04159fc49c32c9dccb3c4f5d1c001654dfee414d)
- **ru**: Update ru.json (#889) | [0d4c014](0d4c0149b46b6bcc609587394b177d1112ce8582)
- **zh**: Update Chinese localization (#896) | [94338ba](94338ba5d46466ead392b8a1fcb94482993f5a88)
- **zh**: Update Chinese localization (#896) | [1c84e6e](1c84e6ec6db6ce11460949742a87918d32d9edf2)
- **zh**: Update Chinese localization (#906) | [642d5a0](642d5a0cb5b9953e5dcecefbf7db391a550197d8)
- Fix locale keys (#916) | [443b7f9](443b7f9dc841af87498bcd05d843c49ab2f65ea6)
- Fix Editor placeholder for download/upload snackbar (#919) | [a9669ad](a9669ad809cce73ec90ca9e0ff94be4eb583975a)

### Other

- **bug_report.yml**: Extend issue template (#911) | [de911d2](de911d21fc78e5967aedd326cf54ae59ba0d5ac8)
- Add workflow to close issues with 'User Input' labels after 7 days (#912) | [308518a](308518a25c6d2e9059a86a75bb7164ba308ed353)
- Add workflow to check locale files in pull requests (#917) | [753f050](753f0507950e6a1afdcf62272f3e7f2a85acd871)

## [2.2.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.2.0) - 2022-06-11
### Features

- **console**: Add the ability to clear the console (#672) | [87b0a8c](87b0a8c7cb1e7cb87c955b22db82e285a27e0a1e)
- **pwa**: Add PWA support for https based instances (#654) | [db9b19e](db9b19ef0fabbb49ac7118c1353b0d74773b20f2)
- Add custom number input component (#638) | [fa20b19](fa20b19a5b0f58b8b826482e1384361f16379a44)
- Multiselect in history jobs (#509) | [455a3aa](455a3aa19489cfbcbdf740077e3274153d6448c4)
- Display only existing/useable bed_mesh profiles (#660) | [82f756c](82f756c6ae6243591d84ec3c1f85973ed7133b05)
- Add localization options to NumberInput.vue (#661) | [a0d4c66](a0d4c66d6c8b7ce09afca5db0a819e74cfec8904)
- Add profile name field to calibrate bed_mesh dialog (#664) | [f974372](f974372cbebde56733947b20d155b6d93413ed63)
- Rework heightmap page (#667) | [96b212e](96b212e8dc86f58fef6edd02ff10fe7fe36da573)
- Add input fields to sliders (#674) | [91197cc](91197cc0bf255794fe513e7aeb0949f671273dde)
- Export print history as CSV (#675) | [5d146e9](5d146e9ade98c49e05ffd5ccffc39d7744d28d22)
- Add default moonraker instances to config.json (#695) | [9955a72](9955a721a225463d2ff9e89202ff674da19fcb1c)
- Change default port for https instances in remote mode (#694) | [8988789](898878977f111950a484df4945d6482bd2aed670)
- Each viewport size can have different panels open/close (#696) | [fc7dec8](fc7dec8bfa5731dbe391e06346c35a2d5c3dd96f)
- Add settings for klipper & moonraker 'SAVE & RESTART' (#700) | [c85a4ac](c85a4ac5dd100dc4a32fcdde5bf9222b00659998)
- Implement moonraker connection identify (#701) | [dc903bf](dc903bf183a4b5b07934e28e2f52471cd2c41f74)
- Add responsive component (#704) | [8f96aba](8f96aba9d82d5b3fc1763db9bf4bffd6935180e6)
- Translate job status in history (#713) | [adf922c](adf922c0488c4d6fbb376af424d32dbcefc6e370)
- Extend system load panel (#536) | [850bb8b](850bb8b2e351ec2bf8d0438252c9706658639f96)
- Confirm before closing the browser tab (#723) | [1a68218](1a682182671fa9ea5f8fa2390bd8727fae2ff4ae)
- Display error messages when console is not on the screen (#724) | [32ef683](32ef6836e392050d0386d1e322418bbfff67b33e)
- Display gcodeviewer always and store klipper settings in moonraker DB as a fallback (#725) | [94ce369](94ce369f9835a3d412541a3326c3a09bfd358002)
- Add note to history job (#716) | [faa83e7](faa83e7932d013b65bc3689951a82277521c75d0)
- Notifications (#738) | [d830493](d830493accc49e2a2b28cab5c1739d093c690f87)
- Temperature panel rework (#748) | [aee5efc](aee5efcd3d6dba2d1935feb47e81846cbcb4a6c0)
- Extruder control panel (#711) | [095b1db](095b1db0094d16a6b381da67aad22e991d3a8c88)
- Toolhead control panel (#712) | [41ba619](41ba6194202a88c17f1aa57049c14d2b1fdb2153)
- Rework gcode file list (#753) | [14fa54e](14fa54e369283bd1a206769fd38fd6e585dec9cb)
- Global fullscreen fileupload (#777) | [654785f](654785fedf5a9cc24dcfe6b6a23c0a2fef67cd9f)
- Gcode-files & jobqueue on dashboard (#726) | [64eed0b](64eed0b6bd7778778c8d45cb0a2467bc804a3b7b)
- Add arm64 docker image support (#787) | [87cecaf](87cecafd4e14b3c3e001c799ebd2ff4fc7c5b81a)
- Add multi select for config files (#790) | [595b3f1](595b3f1d1c804aaeedc24daebe809020d218e3b3)
- Always show scrollbar in the editor (#791) | [fcc342e](fcc342e4225b4cc9d439b65ac8963f285e2ec9d1)

### Bug Fixes and Improvements

- **ConfigFilesPanel**: Change delete button color (#779) | [dcf72a4](dcf72a470749f04bb8e029c5d4363e51280c03e8)
- **CrossControl**: Step size was not applied correctly (#805) | [087d9b7](087d9b7104f18816c47047856fc734275fd4c47d)
- **SettingsPresetTab**: Improve form validation for heater preset (#749) | [e2caa99](e2caa99f0b0edb8c63a25a83ad5adcfc10d01baf)
- **TemperaturePanel.vue**: Remove hover effect (#785) | [2cf1a13](2cf1a13129408389425a8a8b0e384620e9863b11)
- Import bugfixes from release v2.1.2 (#639) | [7890d1e](7890d1e004f99b70ea9d2aa52152876fe6aad6f3)
- Removing remote printer in remote mode (#676) | [c4e6859](c4e68594cde599cda15657b45956c7f956da3ccd)
- Fix gcode from macros with single char attributes (#680) | [18294b6](18294b6ade8df48f4cdaed904487e1bd2b2320e2)
- Match input field behavior to slider behavior (#684) | [966d934](966d93495aee2cfb95a536014fcf87b37991e823)
- Missing icon imports (follow up of #646) (#687) | [b3a0523](b3a0523624986bfe3e01dff339321d46bb3a1cad)
- Don't allow to add/update printers with empty hostname (#693) | [a6b97f6](a6b97f68e5b4a0f84a87197b576fd3ba1c03d5bc)
- Icon rotation with svg icons (#691) | [0b71d59](0b71d590c243f603a0875e76119e9514bedeb866)
- Fix init issue in controls panel | [a48554d](a48554dd549f0ef81048e5521a6a0c48885b75ad)
- Missing object in dashboard expand panel getter | [81ca419](81ca4192b95dc6e99e21e4ece7a0de273b8a7501)
- Search temperature_store_size in data_store and server (#705) | [3b34ad5](3b34ad547e682f3a6a6811708a6c278009d4939d)
- Hide gcode thumbnail, if a webcam is active in printer farm (#706) | [42a6976](42a6976aba810ec5d8bdf2069078304b12201e23)
- Double defined variable viewport in SettingsDashboardTab.vue | [93f9cd1](93f9cd1f3e3405f272fbf2cb9d503628d695265e)
- Add missing translation keys (#714) | [96d502d](96d502dcc6f50427add2715d1c6023feab8ba093)
- Disable home button in heightmap page while printing (#722) | [8a00b37](8a00b373d5f5fc4ab3c9c2dc08e0d5188cd0257e)
- Missing file icon import in gcode file browser (#731) | [abcf7e7](abcf7e79abcc800671b26c05834a1c9170ba4097)
- Check if panel exists before load on dashboard (#734) | [69394b6](69394b69e15ac22f79e9434a47894861543cf824)
- Compiler type warning (#744) | [ec9126b](ec9126b90346cb22beef1dd02ce1948babd5ebca)
- Resize tempchart on window resize event (#750) | [b521b1c](b521b1cd1ed42da6de17df1af3d2349ce07ea39c)
- Add error message in webcam panel, if no webcam is available (#754) | [1ea5edd](1ea5edd504a532f8032e2b5e7a56563ea7d62d06)
- Hide unknown panels in interface settings > dashboard page (#763) | [632088c](632088c7b5fee49411f0fcfdbe4fbb558d70deed)
- Update missing out of range translation (#767) | [72203ee](72203ee0ba3f50b44e8b47137a96a39ac86eef78)
- Margin bottom of TemperaturePanel.vue (#782) | [4f08ea7](4f08ea7435c592d5e13f2f842f26f874cc7eb623)
- Migrate tools panel to temperature panel on gui init (#783) | [eb19afb](eb19afbfdff24b31698827659299755631d2c18f)
- Add missing context menu to dashboard jobqueue (#794) | [6030a8b](6030a8b506e4c9e66f8a1c20f0f4c50d89f86287)
- Remove image from cache after loading it in Mjpegstreamer.vue (#797) | [05069ee](05069ee43b8aa5b1caab2d9a306bc1bf587f824c)
- Close stream on beforeDestory Uv4lMjpeg.vue (#796) | [35e6a2a](35e6a2a5c4149ea318fd3d9fa3d67e9267d3c302)
- Edit files/gcodes in subfolders (#803) | [8ddf130](8ddf13081f937b631e9b14ba5c076f9e229c8bd7)
- Duplicate checkbox for pwm fan (fixes #799) (#802) | [9791202](97912022c2d54bbcbf976a6349dcca11813e9309)
- Resize issues with tempchart and other components (#808) | [8b44653](8b4465300db5aff2a4debde9a3bf265135c878a1)
- Stop stream when changing browser tab (#810) | [6668975](666897570a8e6141e40eb9a01b1c43036bd21682)
- Fix some issues with unreadable values in the control panel (#817) | [257c317](257c31790ff81244d4559d331074b0d7c27dddba)
- Disable toolhead 3-dot menu during printing (fixes #812) (#814) | [9e64fb1](9e64fb139da960ccf4b4a9365229eccbffa97b89)
- Do not show `null RPM` in temp chart (fixes #818) (#820) | [76cedb1](76cedb174ef744a8dab16faa75cc1dc496417e73)
- Unable to set heater target temperature (#828) | [090cda6](090cda6350a465d0a43f5d364e29439bce8a4782)
- Add file from sub directory to job queue (#826) | [04a3936](04a39361c3af977555a7994e892a1623b4c44f07)
- Switch back to files, after clear printjob from status panel (#816) | [bc84160](bc841609ba8c3a0e44f274d2fe1ac1b505a4912b)
- Add u4vl-mjpeg to printfarm & only display supported modes (#831) | [5cbcebb](5cbcebb771631cb4e4da5b78677632f169865a59)
- Store only name of icon instead of svg in moonraker db (#833) | [cc888a3](cc888a3924b99ad9b21530ad29e947f0dc505964)
- Don't createObjectURL, when webcam img doesn't exist in Mjpegstreamer.vue (#834) | [fd89ff7](fd89ff7ba341849c64a08626dd76d5ec95755e3c)
- Regex to replace url to a clickable link in notifictiaons (#832) | [d657db3](d657db36d6674bcb724a83ab1593de1a8015fb36)
- Miscellaneous target change issue when max_power != 1 (#840) | [c7fc694](c7fc694fca31bbd78f8285e0d63aae5c90832f26)
- Stop webcam when webcam panel is collapse (#839) | [6ffb771](6ffb771eeb7b7c55f8c0fb1297939b9969c634d9)
- Wrong default path in moonraker db (#843) | [fb4bfb3](fb4bfb3f579bb8cff38bc114ebde9bfa46c8751a)
- Tool selection in extruder panel (#842) | [ff0d502](ff0d50239ccb339ab0c92044c7dfaf10eed27b87)
- Search files also with single word snippets (#851) | [132a0d3](132a0d34d33966de7a45f25371a211423564ba89)
- Hide toolhead, extruder & temperature panel if they have no content (#852) | [d85a072](d85a072a394581102b66cd8d5a55db78ea9ed0ce)
- Add headlines to console tab settings (#853) | [02e9b2c](02e9b2c9a1dc9e0bb156f0b8a959418425518ce8)
- Don't start webcam after switching tab (#855) | [1370e08](1370e089ef54c59149b0c6fb3fbff822570d4600)
- Bed mesh calibrate dialog not opening on mobile (#858) | [e0fd25c](e0fd25cd90769936191749f7ffea4ddb8c062a1e)
- Echarts getters in heightmap, tempchart & history statistics (#859) | [4be40b6](4be40b6457a414737e23ff3a2eb0a1798e68680c)
- Fix img size without a stream (u4vl-mode) (#860) | [4671935](46719354916a5f11ebeff3513f5ea9e1876c98b2)
- MjpegstreamerAdaptive.vue image size (#863) | [edd97e0](edd97e077376eae1c36ca01c1f43a31f64fc945c)
- Max size of tempchart (#865) | [0551ea3](0551ea39e7c7ff662db53e02db7c2d30ec6447f7)
- Sort of toolchange macros (#867) | [3d3f292](3d3f29223b999d95991f53f4f4284dda6d9af869)
- Display filename in gcodeviewer (#872) | [ceb0386](ceb03862a5fed0af6ee77925643016c92772a112)
- Unable to set target values (#873) | [5c536b1](5c536b18ec310331f4c03bba97f84ad8bae2a85b)
- Restart services with name matching files (#876) | [5f8f046](5f8f0469e0077a5738764b82710e62c94d630d26)
- Unable to submit coordinate values (#878) | [e7b2817](e7b281739b0196801ce5cad08084d9cbb57e796d)
- CommandHelpModal mobile fullscreen size (#882) | [0f279eb](0f279eb60dfee6d42251e89041a9f9e9f1dd08da)
- Fix some gui issues (#880) | [76c04be](76c04beb4d35c5e51ca8cff689b3eb9593b087e3)

### Performance

- Load codemirror into a chunk for faster LCP (#641) | [6563b7c](6563b7ce4782b8c8cfd287d223634bfba46aefbf)
- Replace echart library and load it modular (#645) | [fe92b97](fe92b97940a4508705aebf179ffb4e2453150558)

### Refactor

- **MachineSettingsPanel.vue**: Tweak visual appearance (#784) | [014a791](014a791c12d0b2bcbc9d63b1d9ce01327d87177d)
- Move rename button in heightmap (#665) | [d30ad58](d30ad5858ad89d0de0e3a2640ad7dbacb76fe9a4)
- Rework webcam settings visuals (#679) | [5bfdcf3](5bfdcf3816232cfb4832ff20d531f4ce328f38c6)
- Make all MachineSettings use new NumberInput (#651) | [fef6ba3](fef6ba3a023ef935207d62a13638586666f9ee37)
- Replace font icons with their svg counterparts (#646) | [213bffd](213bffd3e40bcad3e42c3c6fd7275b5322cb34ea)
- Replace the mdiclock for an emoji on the TempChart (#690) | [f7bb1e1](f7bb1e168c25d66f0cd3c86f645e1e64b03e6958)
- Change delete button color (#766) | [24e3088](24e30881e2e002498a90309d7df433fdf1ba34dd)
- Remove unused option in SettingsUiSettingsTab.vue (#792) | [f294561](f294561e8b08009d2f8832806c2e9b1c047698f3)
- Display scrollbar when mouse is moving (#793) | [f0662b2](f0662b2e705585ef1de9f270aaca182f16096e0e)
- Match icon for editing config and gcode files (#798) | [737b949](737b94995d5b3e9c2de3a8d17a53c39a7174e3f5)
- Remove unused file (#813) | [0da85e0](0da85e0e20b48c2dfbb7d5e212c872b0d108be3f)
- Remove duplicated settings header (#830) | [fccd832](fccd8321bbf4a0a899cc1fef60f3b4d42298e32b)
- Remove temperature_store_size from server section (#837) | [4aec550](4aec550a90efca3889af65b854d8942b90309b37)
- Hide PA input fields if extruder_stepper is configured (#846) | [8b4d534](8b4d534e863b9e775adaec651b17853d62f8cb15)
- Update GCode Viewer to 3.1.0 (#847) | [9f4fb30](9f4fb30b981431fe4d8a7c45d30bb7274a81697d)
- Replace drag handle icons (#879) | [a6c09bc](a6c09bc93776c761332fc907ab9176c6e3f58df2)

### Styling

- **icons**: Update PWA icons (#727) | [cde0156](cde0156df8e075945aa59823516839e036a8cadd)
- Use prettier on other file formats as well (#648) | [615ee73](615ee73801588fdda28494e490a7525719a3d835)
- Improve prettier integration (#662) | [72e0ca8](72e0ca8e837697b8947a7358dbc5eaa58477df5b)
- Order all locale keys alphabetically (#702) | [3aec60f](3aec60f2c91885f01ee0d71c868fbb4707f7c2c0)
- Indent size of 4 spaces in json (#715) | [cb0e40a](cb0e40a53ff4bf85590f1e824528ca86cd27795d)
- Fix lint issue of locale files (#764) | [6c384ce](6c384ceb7259ac54e39c4957196abe33edb585d3)

### Localization

- **da**: Updated (#718) | [a87dcc6](a87dcc65b120c489b1bad8eb7560da8ca46c3dcb)
- **de**: Update German locale (#871) | [cc5c15f](cc5c15fc903e00563168db914c4b5d9c11bdd2b7)
- **en**: Fix typo in GreaterOrEqualError (#854) | [eb0f157](eb0f157fee1d915d1135eac9a25a6bb076f3fee7)
- **es**: Typos/grammar review (#689) | [0d19dff](0d19dff843c82976225515660d4043a3425e70b8)
- **es**: Update spanish localization (#862) | [78ac2bb](78ac2bb0d2be8d0162b49217d75036c55ca1592d)
- **fr**: Update French localization (#844) | [86638ef](86638effdd8fdd46fdb134ea5a0f23d25dbb6548)
- **fr**: Update locale file (#856) | [b6f0020](b6f0020d777eca1fdaa71a030c1225ce91ae3403)
- **ja**: Add Japanese translation (#774) | [c94e70f](c94e70f8764e67a0458bedfdc5c07925e6d1804d)
- **ja**: Update Japanese localization (#824) | [ad6015b](ad6015b69fc1a2b1b2c80940f7962d5eb48cc987)
- **ja**: Update Japanese localization (#850) | [a5a7d05](a5a7d05460bb8deca7f3c3956c3cd64484064ec8)
- **ja**: Update Japanese localization (#864) | [1ed67b4](1ed67b41ab7a64907f4aa9c61888ff89eecf5626)
- **ko-kr**: Add new lanquage pack such that south korean users (#874) | [07db82a](07db82a26954692d413cbcdf0ed0ca0cf040e8c6)
- **nl**: Update dutch localization (#861) | [2113eae](2113eae8fee5e8c2a11117ec8d648065ae7e41d0)
- **pl**: Update Polish locale (#884) | [1c706b0](1c706b0725de5388e5ec085c9687453ecbaa4322)
- **ru**: Update Russian locale (#836) | [3011928](3011928ca33cc3f9b4bae172b4e6acedad969079)
- **se-SV**: Add swedish localization (#762) | [e91bfbd](e91bfbdcf580944e14cded66393fcbbda214cd50)
- **zh-tw**: Update zh-tw.json (#627) | [fee532d](fee532d8f0bd459073dda03203f29efe87a48edb)
- Cleanup locale files (#841) | [bbf2832](bbf2832238ea4a448f5a14e4ebb1c3d8605fbcab)

### Documentation

- Improve README.md (#709) | [f471507](f4715076d5be4d093b27f20ab14daf53dbf2638e)

### Other

- **deps**: Regenerate lockfile because of indent change (#652) | [87c83ec](87c83ec9c38a740ef60e2bd21f7c5cef9d679c24)
- **deps**: Update dependencies (#681) | [610f21b](610f21b1104af42ff52ac8a778c3ff12ed964d49)
- **deps**: Update dependencies (#717) | [f5c3cf7](f5c3cf727c64831c37e89ce02a602c3f3c15d53c)
- Add cypress for e2e testing (#655) | [cc1615a](cc1615acd4b841887b8220e2647a69cdb559c6b2)
- Add host settings to vite.config.ts (#671) | [707ac20](707ac2034e8799f0680ce6959d5825b7acbbbbbb)
- Remove development docker (#677) | [efb0167](efb0167f53376e4143b0392999166fcce77a13c4)
- Improved bug report and feature request forms (#683) | [e3f7ce9](e3f7ce9837ad3f02c2aaea9876ea305ea6b94056)
- Remove unused mutations (#697) | [0cf7642](0cf764291363b61bfbf252a89f120e429e5043a2)
- Remove unused getter (#698) | [4b041c0](4b041c0a55f5748550292dd940f884c06c8f763b)
- Remove components.d.ts from git (#703) | [0da0504](0da05047a1832175aac9591d41903e0f352f37a3)
- Some toolhead panel tweaks (#781) | [63283cd](63283cd9b412c6e6f122c040a6c8249853497a15)
- Exclude .DS_Store files in build.zip (#886) | [8f843e4](8f843e42b11ab2f1846b4b38c800553715b6ccfa)
- Exclude .DS_Store files in build.zip (#887) | [e251d3c](e251d3cfe0ff09a9700ff0aefe33f01acde1e2b2)

## [2.1.2](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.2) - 2022-02-14
### Bug Fixes and Improvements

- **env**: Parse environment variable as string (#632) | [d3172fa](d3172fa3537c6c2087bcfcc319dd164420b0e6e1)
- Video and download link in timelapse video dialog (#611) | [5f0c4ba](5f0c4baacad69ef0a0f43a7b6a04839bded24fb0)
- Console error regarding touch directive (#633) | [fc86125](fc86125ebd9cc32622ea324905a3fb906013efba)

### Refactor

- Migrate `longpress.js` to `longpress.ts` (#619) | [c589a49](c589a495a6ef55bfbb1a498a052ac9d2f56a2acf)
- Replace 'vue-headful' with 'vue-meta' (#620) | [0cf8ba0](0cf8ba05be1a3e43201b94914ab150efe4562a8c)
- Make sure that port '80' and '443' are correctly passed through (#631) | [fd22cc2](fd22cc297d0df7c3a5c82fc5a510b1cb682f88fd)

### Styling

- Add prettier as default formatter (#614) | [04b6992](04b6992f3c202634948ee7c6afa9cd2c517f7af9)

### Localization

- **da**: Update da.json (#596) | [a15cb3c](a15cb3cbeb02d9122b0fd50331c1559faddb4ba3)
- **pl**: Bugfix 29/01/2022 (#598) | [e9157f1](e9157f14c6b1b467ecee770ae4f8e2f9bcbcfc4f)
- **pl**: Update 03.02.2022 (#606) | [30abb68](30abb687a349123ab14156b2a102752be4aa17f9)

### Documentation

- Split up quicktips (#584) | [4f9581f](4f9581f3a0481430e32b080a92a4512c4b74c8ec)
- Cleanup assets folder (#601) | [c6432d5](c6432d5b3c5667ee8c12ca4ea595682f64fe4b0e)
- Update credits (#602) | [02d5f6b](02d5f6b8c31c09fef08ffb109468cecb55e8208e)

### Other

- **docker**: Windows compatible, without docker-compose wrapper (#613) | [dc3f191](dc3f19168466376f467445b2870428d78cb14530)
- Add .editorconfig (#582) | [4559ffc](4559ffcbd54ba423ae890d4bc63b3c1ec19cded0)
- Fix initial development environment (#593) | [20240fc](20240fc442828619e6adc0b71ab319be66974296)

### Release

- Release v2.1.2 (#639) | [ebf7486](ebf74860f4d3119802590c6f6cffeb82e7af5a45)

## [2.1.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.1) - 2022-01-28
### Bug Fixes and Improvements

- Read nozzle_diameter from klipper config in gcodeviewer (#558) | [8eb67ae](8eb67ae2b66c3960770ae45236f5107cbbefad4e)
- Default color mode in gcodeviewer was wrong (#559) | [1e54c92](1e54c92b000e33e41dfc5bf6f4a7f1df33d43063)
- Farm printer switch and display klippy connection errors (#563) | [1de95b1](1de95b12ecdc6eab0f45fea5141542a75c38c0a6)
- Delete remote printers dont work (#564) | [7fc5e29](7fc5e298ad63a36af2396c73b4f1bebfc999e4d4)
- Input field and spinner bug (fixes #551) (#555) | [75aad8b](75aad8b88015e92c3f9dc443a177240dcd15b4c3)
- Hide second notification in timelapse > remove mp4 (#572) | [0db74e9](0db74e9e378c6ab58abb407cbfda24c671581342)
- Polling klippy error messages (#571) | [d856b73](d856b73cd116e75b0c026bd2315c9720560dd22e)

### Localization

- **da**: Danish - minor updates, missing tags and removed "deceleration" (#578) | [0f0180b](0f0180bc50063ff80e41eddf02f64827ddd9e0a8)
- **it**: IT translation update (#553) | [d569483](d5694835d0ea6954d1f64fe071455cc2400b84ef)
- **pl**: Polish translation (#581) | [b944af5](b944af54486ee36ac58e4469d0b64ebc3e957739)
- **pl**: Fix polish translation (#589) | [a121e56](a121e560859c862f36538c19930fb632519182aa)
- **pl**: Additional fix for polish language (#592) | [1c4127a](1c4127acf2f9b9774511d55d3b12d413c71eef1c)
- **zh**: Update zh.json (#557) | [b743467](b743467bca643e66642bdbec69d6c8942d624d08)

### Documentation

- Additions to the readme/index for 2.1 (#543) | [b476419](b4764194b0e73e21b35cd254b52d2a4fb140ab33)
- Review Themes  Chapter in Documentation (#486) | [702981e](702981e32423bf84de22f8337d9bdf6a6dc45bdd)
- Fix macro link | [a3ad590](a3ad590d4b40dae279b64c553a06d2984cb8c2b1)
- Update prepare themes page with review feedback (#554) | [69bb61a](69bb61a30d4aca175e2e634826f5f8a455e7ff94)
- Fix some broken links (#580) | [ed45815](ed45815d3bb185a8829bfb333a8160fb74a7b2d8)

### Other

- **build**: Sets Node engine to version 16 (#569) | [be0063e](be0063e2a06d105e4fbc244f449da3c5f512335f)
- Use node 16 for base docker image (#568) | [8a9bc45](8a9bc456b67e41927d727e67e9f38071d5e3cb7e)

## [2.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.0) - 2022-01-19
### Features

- **editor**: Add webcam.conf as webcamd config | [5efbd50](5efbd5002470a857c0a9ca6a41764f0b5a8f8656)
- **panel**: Disable text select for panel headline | [f8842ff](f8842ff0705017a79789aacd39daf66bce080e69)
- Add backup and restore gcode viewer state | [542e094](542e09434856a670aadd818383b579b69ca926a7)
- Add snackbar for display the rendering process and cancel it | [bb15bbe](bb15bbec083b4d7b03121b301f0a53cbae90d212)
- Add snackbar for display the downloading gcode file and option to cancel it | [2c38aad](2c38aad7fde746fe81559bf6abba660a200f9d9c)
- Move color mode select from settings to gcode viewer page and remove debounce of z slider | [5b622fd](5b622fdcd96b479c2cd125438a612389a8206311)
- Automatic rendering after changing color mode | [638dd0d](638dd0dcb3318ac5f95b89496d01c11bb6959b14)
- Optimize g-code viewer workflow and button positions | [c8551ab](c8551abddababb76224091613ef1a05e494e6450)
- Clear settings from gcode viewer | [5eab191](5eab1917bd229ca7167211d2d6b4bb4f67efc7a7)
- Add some rendering options to gcode viewer | [d3c1d14](d3c1d1409d10f79ad1cab77d625cf593617a98ca)
- Add klipper warnings panel on the dashboard (#355) | [6d5a31c](6d5a31cc39a7d8b06a2c2199bfaeae9cc26f8b76)
- Exclude object map (#369) | [a81a486](a81a486602a069712e4c2f47839fa2d507bb1b5a)
- Add perfect scrollbar to update commits dialog | [ea95381](ea95381410cb6fcfe457ca348f9b3765518e1399)
- Exclude object map (#371) | [d147a92](d147a92695e74afd2ee88776d83be4eb89410d2d)
- Collapsable and normalize panels (#372) | [3dae42e](3dae42edb0dcecf3057fb194f81d0f5a147e8628)
- Change panel toolbar buttons to v-toolbar-items | [11c64e0](11c64e084eb9229f6cc7079e48496d5c92763f67)
- Add hover effect to collapse panel button | [89876a2](89876a2500bd9c2be797db4743215dfa63a66eea)
- Add option to hide config backup files (#378) | [d21b080](d21b080c2b45495e536b35fd3eb4be97798cf0a4)
- Redesign commits dialog in update manager (github like list) (#380) | [5f93aac](5f93aac0951b1da9a2905882291ecf75ff4b978b)
- Adds optional confirmation dialogs for emergency stop and power device change (#384) | [a02963c](a02963cc88d16c9fd5bd1391430ae9a36b6878fd)
- Uses monospace font on console (#389) | [ec8bcc7](ec8bcc7fd83327086c3f215605a33da81f283359)
- Add function to change/select time calculations for estimate and ETA times | [ae82bfe](ae82bfe7f7cf79904dc5e9e36a6bfe49acd5675a)
- Macro management (#396) | [4ece97a](4ece97a535cf7f4be3718905e73c23e32e03d63a)
- Added modified file tracking and a confirmation (#393) | [0a0c456](0a0c456faa3d58bc437852798741d3c1c27ce7d8)
- Add a compact console style option | [5e0198e](5e0198e259608934c26b12c45bade5851d9880af)
- Change color of presets button in tool panel | [4335175](4335175daa05b7e77302e21c6ee02e0b7c0ac686)
- Add heightmap current mesh information panel | [0909dc1](0909dc1357e6d5c0b4f18591bafe406a82fb670e)
- Add tooltip with extrude volume on feedrate buttons | [7a9f601](7a9f601a4ad57b886f9e5c5f31b1776aa1fa056a)
- Add full update function to update manager | [c81311b](c81311bc619145e87e57a38b77f53fbc7e34ed2d)
- Add start/stop service buttons and display service state in top corner menu | [931d0a6](931d0a6d50b8f8811ab5335d69e4c05440961a75)
- Add moonraker file_manager permissions to store and config files | [8ed9f33](8ed9f33dc0e0026b0a9733433d5633d476f85cc8)
- Use moonraker server.files.get_directory root_info to set root permissions | [94896ac](94896ac4f877aba570a4111f89722123c0a85ff1)
- Add link to gcode thumbnail docs in ui settings | [6e97cf2](6e97cf24f2df4b1070fe1a0a411100d64bbc4fe8)
- Change overlaps-scrollbar instead of perfect-scrollbar (#400) | [cb2da07](cb2da07479a8badfdabfd35dc7872a80b4a38286)
- Mainsail dependencies panel on the dashboard (klipper, moonraker) | [e6eb4fa](e6eb4fae187cb300a3c299196075cdf56b0eb575)
- Move webcams to new db namespace (#401) | [0338efd](0338efd914272524a36a0f1479ba96de9e18984f)
- Add autofocus and action by press enter in crate/rename dialogs in config file manager | [875035f](875035f6f3f36a5ee2c3d0ef8b36e14fbfaf8668)
- Add autofocus and action by press enter in crate/rename dialogs in gcode files | [2a85e89](2a85e8999f061ae9763b978461db4a2047ee0247)
- New design of the web UI (#408) | [ced16fb](ced16fbc1b1c274aee4fb41b406cf65fa2468a1c)
- Lockable sliders (#412) | [6b8f569](6b8f56985a20d52c5df38513c87f129dfefd9339)
- Reset database namespaces and/or history jobs/totals | [08b60c0](08b60c00721ec7cf63c82d2bf27f56771811adf5)
- Gui for the timelapse moonraker plugin (#417) | [216099c](216099c524c4ad633c1101faf4aef3b71b766e43)
- Add save frames button in TimelapseStatusPanel.vue | [3262e0c](3262e0cfc1c101de2f18e4bd953c708be53ac898)
- Disable camera setting in timelapse setting if snapshoturl exists in moonraker.conf | [86ab389](86ab389b32352c857066f48635820f912aa1225a)
- Add serial_number to system cpu info | [46e8821](46e88218219ca7525c92312777377800e5ba1bac)
- Add moonraker job queue (#433) | [f608112](f60811255f927cc7b1ed89d16bb67a970206950a)
- Add metadata to job_queue panel | [678eda0](678eda0e8cd0b6489c3c0a3ddc843c86af1c7d63)
- Reset timelapse settings | [5d2400c](5d2400ccbefbbfe3a3db1e7e61e0034f5d9ab700)
- Machine settings panel on dashboard (#440) | [51602fe](51602fe69cb8aaad43a1e0ec019c923d213f71cb)
- Icons for print settings (#441) | [b533955](b533955bc328682c9cc644bd9ed71edd162e1e95)
- Add option to hide TL gcodes in console (#451) | [dd3c897](dd3c897b756c701acd10941a5f5315130ef05f54)
- Add stream_delay_compensation and park_time to timelapse settings | [6277a73](6277a7380db1a636837b442680344223ac4e09b6)
- Pressure advance settings on dashboard (#459) | [abe66b4](abe66b4557182827b7e890098a5692041e184323)
- Store last gcode commands in moonraker db (#460) | [1298da1](1298da15f26157c991973dd404a792b1f0b2d21e)
- Display moonraker-timelapse error message (#467) | [0ba9d9c](0ba9d9c6b6374ef557724a792e20cd363192899d)
- Custom number input spin buttons (#468) | [fae1cc4](fae1cc4ab6656bcd3fc1924ec7c7d5d5488a4e72)
- Backup/restore/default moonraker db (#476) | [7f6e6e5](7f6e6e5bdfd195b4b441e7cd31da8f313a901e5d)
- Add fw_retract setting in timelapse setting menu | [f4b3930](f4b393053d47bd4e61ba6ab08fdf5e91774e1745)
- Display release_info in SystemPanel.vue | [cb87b4c](cb87b4c198efcc8ecd4323a6b1cea5421d67c638)
- Highlight hovered objectname in exclude object dialog list | [a150d11](a150d11e8183073c67780b7cb07519843ec87cfd)
- Confirmation service host control (#481) | [73f445d](73f445d005a08f8e344af983c711549aedb74c72)
- Add special output text for klipper stop service | [81a7289](81a72891944f334bf85c2d85de2b6f68aefc28ff)
- Add tooltip by icon only sidebar navi | [d91e3a6](d91e3a64baf9ad2dd3f74aa48884c6e13c332694)
- Convert presets from V2.0.1 to V2.1.0 moonraker DB | [eeac987](eeac98778477f3a70ba5ae3c41beaa52e4a7352d)
- Add displaying/sorting of/by more gcode metadata (#519) | [55df4da](55df4da10405fe191dea016424678c922bc12985)
- Ignore timelapse pause state during a print | [d6b9863](d6b98639c1c5484cb6ef26d04fc6c4cb264ade3b)
- Send gcode macro with keyup enter (#544) | [1a8a955](1a8a9558d39505462fc0ac2864c9bc88c6d5b852)

### Bug Fixes and Improvements

- **websocket**: Close websocket before connecting (#383) | [182d7f1](182d7f146ed55ede1b9874cf7f3ad2fe05b17266)
- Inconsistent spelling and typos (#379) | [62ccb1f](62ccb1f97de073bdae9b3fdf25870d28c37b855e)
- Remove [display_status] from min settings, when [display] exists | [b99463e](b99463ee99c6ab4dc777b5481b81e47b5df6ffc7)
- Load metadata of current print file of farm printers | [20a969e](20a969ebcdb7f8ad3db9f9e79250fa04d0950b22)
- Init data in heightmap dont exist without bed_mesh | [e53d505](e53d5056dda279bbcc1ad24f35e4a7a334238ce8)
- Bump the version for @codemirror/search to 0.19.2 to benefit from (#394) | [330dee0](330dee04ed9d4df6b0b9bb106b12bf6b5561d237)
- Update getMacroParams regex | [243f0d7](243f0d7df00e2c8dbd4a3c05f60ed009328cebda)
- Safe gcode offset button wrong type | [bafde49](bafde49d15828c98469d58ece4d83c72f256517e)
- Font size in console was to big after font change | [ee18b4c](ee18b4cc334fc3218ee39a58d8a594ef229233c9)
- Hide main branch in update manager | [bd1fd1f](bd1fd1fb121431ad4c83eb79a1f2c4de20d317cb)
- Hide string chars in default macro params | [9221435](922143554b3f75e7f28da9871649e3f80e32df44)
- Hide horizontal scrollbar in settings menu | [76f98ca](76f98caa2523f970c64ba86b94c8cc2de16498d4)
- Update manager commits list icon and show days if smaller than 1 day ago | [b5b1b44](b5b1b44c8db3bb49d872001bd7a54fe670f8a509)
- Translations in ui-settings tab | [1aeaf7d](1aeaf7d36f07416434878e5e47ac31750630874f)
- Change default extruder feedrates | [a307b4e](a307b4e78493cd5a08f83a134a5b15abfe0bb690)
- Remove eventListener in farmprinter panel | [f048150](f0481501d5d8f58370b9dceae9c9edd6fd541a2b)
- Jumping panels when webcam (mjpegstreamer) is not in viewport | [c6d4e06](c6d4e0630ffa5a266bb82b36e824bf7526a90696)
- Wrong variable name for cooldown preset gcode | [9627f62](9627f6248d203f40fc1837f274cf69a21baa4f97)
- GetDirectory didn't check metadata changes | [581cd2b](581cd2b30610244a8f3288d530f6e2a464a0b35e)
- Update links from klipper warnings | [55ab739](55ab7395e2e6f85f51f9e3f5c3983956306805da)
- Init directories dont work | [e7e87eb](e7e87eb20d624687328988c3309a1e5eaf0c9077)
- Duplicate dirs in filetree | [ed3ef6a](ed3ef6adfcb6c628585a8aeaa16d247fc2dadaa7)
- Drag & drop upload in gcode files | [ca298eb](ca298eba0ff575ad268a7dea70fa1a310d46b55c)
- Margin between DependenciesPanel.vue and next panel | [6554f5b](6554f5b084652ae74e96594003f6928f2e280953)
- Dependencies getter dont work with commits after release tag | [2f1fd27](2f1fd2788e3d31b6ec50fb26ac33345246fa7a3b)
- Use repo_name instead of update_manager module name for creating github link | [eecd24a](eecd24a8d6f33beb7e4272b5bdcb7245c2b9ae71)
- Autoscroll function in update dialog doesn't work after switching to overlay scrollbar | [eb88bc7](eb88bc703b50b069fe30f2b9e8c87fc2cfcadab7)
- Autoscroll function in console page doesn't work after switching to overlay scrollbar | [4340b15](4340b15ee0d33620100ce4c3d1ede9fca8c3be6d)
- Wrong download link for load current file in g-code viewer | [840d8c1](840d8c1c960f094b203a166a6d3f32b54f2ab51e)
- Don't display confirm changes dialog in editor for read-only files | [d4cd312](d4cd31291de00e35c0b3c33e36b0d1f6531b7139)
- Store databases in farm printer states | [7e9a274](7e9a274ff7f5fc00a43593a7b022e926109bc0bb)
- Update farm printers webcam to new webcam db namespace | [89f2b2c](89f2b2ce0b7c230389239968ab45609a2fced9a1)
- Fix spaces update manager panel | [60c218f](60c218fe186bbd1941be50d1061a56b953b02a33)
- Update metadata and gcode thumbnail of farm printers | [806ac9c](806ac9cd6ab2eb82bf3acc8136181f1837b583ce)
- Remove hide-overlay in settings menu dialog | [9a270c5](9a270c5054ac3bfe9d04e32eed39d35206003d33)
- Padding in simple macro panel | [890d32c](890d32c2cf32ea4e7a7f9926e54727a73923fc3d)
- Hide deleted macros on dashboard macro groups | [6a9aef4](6a9aef478547c0b36d3f9cf1564048f32d1af863)
- Convert old presets to new namespace | [b6fa2e3](b6fa2e3d83d0519d599e6ce10c100da92c3bff9d)
- All gui/webcam requests | [9cb63ee](9cb63ee193984f498ffaffd7992821abc840a01a)
- Check existsPresetName update index to id | [4cc9c90](4cc9c90a30216b58ce439153d73da86821c51991)
- Remove replace space to underline in fileupload | [ec44294](ec442944417fe989b9f6c7a2aaadc4ab0fd156cb)
- Remove replace space to underline in fileupload in topbar upload | [8bc17d0](8bc17d01b3d408055348765bc83d03d5a3ee389c)
- Fix typo from webcam panel logo in settings dashboard | [8ded071](8ded071403996db85fcd31110de80be3485402af)
- Display standby macrogroup/macro when klipper state is cancelled | [bb9d10e](bb9d10e00c59063aee43dfe5fc514b87810201d1)
- Remove macrogroup panel from dashboard when delete macrogroup | [5495d53](5495d53cd30493537534ae8bb4c706a216ea03ee)
- Wrong action names in settings webcam tab | [d161cf8](d161cf875c369317211cb7b14d211160a7aaac5f)
- Dont polling printer.info in klipper state disconnected | [f12d0dd](f12d0dd89b68e00ceed9cc9b08377ab1e89e9820)
- Main scroll height (smaller topbar) | [de67381](de673810c3ca4d6d25e0d5e3822ff93dcd2c95ac)
- Close button in update manager commits to tile | [5a44322](5a44322ac26e62a03a30455060b09173a79cbd70)
- Switch every time to relative mode for movements | [4ab2def](4ab2def2f8aaeba56f6b52a6d23de2170bc4afe5)
- Webcam mjpegstreamer mode (#419) | [97298f9](97298f92dc1fa3c5d73b69c9114103d6a6b40615)
- Update action name for saving gui settings | [ae6667e](ae6667e25923a9dc088afcb89133cdc5b2eaa922)
- Add locale for empty timelapse state | [96578bb](96578bb95c21da3824d90d2e83bd1d66e7fd5f60)
- Rename cancel button in macro management to close | [6fa1c28](6fa1c28bc405b67ec71318d559f6eea32b230728)
- Webcam create/edit form validation | [a2d90df](a2d90df97cca9e76b86d200c1cb56aae73eaad59)
- Reverse logic to show render & save_frames button in TL status panel | [a581be6](a581be6aec67950c38d54ac5d90046ad4dc178e1)
- Cut heightmap variance to 3 numbers behind the dot | [94c1f35](94c1f35f9c070447c7106702aecb9c0421add92e)
- Check for null when running in docker or non pi (#428) | [eef899c](eef899c19e6df34523ac99ca4ff16d3678383a84)
- Patch slider lock feature (#425) | [57aa964](57aa96420cdef3a3174aed19491ced5b52dc9231)
- UI fixes and changes on timelapse page (#430) | [ad52728](ad5272813133208ca57f96ba999bbd2f79d84ffd)
- Restart mjpegstreamer stream each 60sec to fix browser issues | [1779cca](1779cca828ce7081c1825dcaa1207f91afc95661)
- Add webcam rotation to new mjpegstreamer method | [d4b1be9](d4b1be9fccf9b23d13e91ac87ab577f49848d7ad)
- Use webcam settings for TL preview image (rotation/mirror) | [64f7c2b](64f7c2bebdcd1e86b90b1a84253e137d09a31fa5)
- Dependency build check | [7ab6f32](7ab6f32d3aab2ea0f09260237878a76d1e166ca7)
- Add path to add gcode files in subdirs to query | [3784d8e](3784d8e9c0e56bc884e8072b7aef4ac00f847bf6)
- Check if metadata exist in job_queue | [3f4eead](3f4eeadb6fa64e2a542400ddd8cf98fdef6e205c)
- Disk_usage in sub-directories | [b6c2901](b6c2901908d861fdb8a6bda65913e29e87a2279d)
- Add file permissions to edit gcode files | [fbead2e](fbead2efb1481cfadf7ef2aeec846c1fdfb4297e)
- Special cases in thumbnail urls | [a75b133](a75b133dea142fcea03858141603f141d09ae85c)
- Allow upper case sensor names (#429) | [b6cfb0f](b6cfb0fd883809f37fb6096d82ce1858a77ec46b)
- Macro param regexp (#437) | [34f2eb3](34f2eb3189dad8be6c52da05a5685ec8a74a1f7d)
- Reload required bug | [eaba28e](eaba28e24be66d83132f645f8904443a075e104d)
- IOS orientation changed didn't trigger resize event | [43674bf](43674bf2d5f41180b15f58aa2a0796f2601e17f4)
- Escape urls also escape / in the url | [9bcbfa4](9bcbfa48de9010bab4ad92f824e69c84dac30691)
- Bug in dependency getter (#445) | [1a7a232](1a7a23205b0efc532039e00ce948b9b39310ede5)
- Enable update if commits available but version number is above | [460fa71](460fa71c70553f70617e34036c189284fc86bcec)
- Input layout on small devices (#448) | [9f506f8](9f506f8cbfd4fdbe4fd7ba857bc3a246bc315340)
- Correct i18n key name (#449) | [501b012](501b012bdb32a6c71968095d8498648b8a381067)
- Cancel open connection before close fetch (#450) | [95ebc25](95ebc25434c6a032c85bb0f56ae90045866043a8)
- Hide SystemPanel.vue if klipper is not connected/ready | [fe264e6](fe264e61425206ef11f963b9092ab3aefda35300)
- Enable g-code files, history and jobqueue when klipper is not ready | [8ef89d4](8ef89d42f0009d40d232aeca5b2ebf61a827a00f)
- Hide console, when klipper is not connected to moonraker | [f6fe02a](f6fe02a347c61a22c393a3a3c3c82e58df16e7f9)
- Support for printer farm in https mode (#452) | [8110b2f](8110b2f7b7ec4850ff729d14ade274e418f5e9cc)
- Add hideTimelapse setting to console settings tab | [af1809e](af1809e0257feedaff1ef2ff15add60f366cac7e)
- Wrong min/max position in current heightmap panel | [cb49107](cb4910758ef79db6e66da47d59d3852ff7321632)
- Update job_queue start command | [ca36886](ca368867e28bf2a90c470dac4f2bf986e4ddd713)
- Delete also timelapse preview image if exists | [25062e5](25062e5a36137e030bd3c376f2998c8e7a17f6ba)
- Add accept attribute to gcode file upload | [4037715](4037715c8dc85c564d5569d7c654feb989cf1f4f)
- Add file extension filter to drag&drop fileupload in gcode files | [9d9e914](9d9e91453341f7abfa4c6407d7f1c112ef2e2e93)
- Disable context menu options for not allowed file extensions in GcodefilesPanel.vue | [de4efb5](de4efb514c9353c1af3abb83500084ff2f3e9659)
- Disable print start dialog for non gcode files | [37a08a3](37a08a3a37fdfa94dbed2b6966df157a59333064)
- Change exclude object icon and cut object name, if it is too long | [945a3f8](945a3f8eaf7eca76104d7c3d727a919314dd3177)
- Fixed editor highlight stop bug (#462) | [648bbe5](648bbe581e04d1ad063a5a89a3828f556fe53595)
- Prevent duplicates (#464) | [36b8acd](36b8acdcd9b2bccd4d7b9866b44c09bba9599847)
- Correct spelling of `max_accel_to_decel` input field (#475) | [dda7a48](dda7a488bba049860693c450c27be69e0a187b69)
- Hide timelapse console filter doesnt work | [c418144](c4181443e6dff7ec076e4b2ca5e395610222299a)
- Fixe some renamed store paths | [684e65e](684e65ed5940670f0f8c3d07f5ba441c1f810579)
- Axis name are undefined in the heightmap tooltip | [5e865aa](5e865aa6707206bde833d38987551b7ef3c1c0d7)
- Fix renamed moonraker db gui paths | [1e09048](1e090484ae0d0922c286cd4b23d3d08308ca1546)
- Issue with tempchart/temphistory if the browser go into sleep mode | [25d1267](25d1267a0796a0a4fcd76bbe05f7b6d8bd97dc60)
- Min height in settings menu cut dropdown menus | [f8bbc5e](f8bbc5e97cc1c370330f8cf57435474b303c99e0)
- Settings toggle to hide upload & print button doesnt work after store rework | [9a8c208](9a8c208930dae8d001038e0da9b19277b2b1d53a)
- Custom console filters were not displayed (rework moonraker db) | [63f4386](63f438671f5f4985b810f1b317f58743e2da623c)
- Disable moonraker serive stop button | [07d9b75](07d9b7542539cdeff3c5f9c3cdcd42ca7009b2e5)
- Hide stop moonraker service button | [ec83248](ec832488a9918b4235d96f084852f42acdab513b)
- Recover gcode viewer after switching tabs | [f2a33a8](f2a33a8e483a072246ab0a0789ae3dcb8f14b35d)
- Modify text color of console output | [02ebeb8](02ebeb8371b9eb8042ddf986d9cf4d125d08aa08)
- Hide timelapse root directories in config files panel | [a20bab6](a20bab62a543008577e15de27bc06c6b26026689)
- Set default primary color in exclude object dialog map | [1decdd2](1decdd2c5771f105926652a51dfcaa7d4f85b6a0)
- Check if settings object exists | [93dd1e3](93dd1e3034fe2a43225a431b2679cc0f20d3b6ca)
- Check if settings object exists | [abec546](abec546575159dd27ffdec53d05b9124a192ef89)
- Check if settings object exists in getMiscellaneous | [0c4601e](0c4601e23a5740633f4a82aaa8cd1bc8f2c6a177)
- Tempchart length/duration issues | [cd6a5c3](cd6a5c3b4a52f7726990cb8c03e729b4d26f8c24)
- Settings menu in config files | [e45d7d6](e45d7d69d205e9b4c3dd19e0cbe6a072be9b5503)
- Settings menu in gcode files | [1934e29](1934e29badc7e72c4174ce13fe84837907cf9534)
- Reactivity of sidebar navi points | [667bb29](667bb2976da7d1bba878b21caacee2cb1a334283)
- Ignore maxTouchPoints === 256 (#493) | [bc353a0](bc353a060d189d7405d6723c2305182381aa6cdd)
- Dispatch with correct keyName (#498) | [9c37383](9c373837871e10d13df8b2b588c14006c0e8910d)
- Ignore wrong presets in moonraker db | [275a268](275a268c434f4036147347a2a7bec81429a52e58)
- Tooltip bug in sidebar with text + icons | [a6c9275](a6c927508f3451f8fe39e3ae7c4a1e46042c9f0a)
- Hide webcam panel in config & dashboard if no webcam exists | [706ed47](706ed470c43a8d6183dbd4e3be34a1c657399469)
- UI fixes related to feedback form beta-phase (#494) | [b6966f0](b6966f05ee295bd3e346092140f940fb2d22e253)
- Remove buggy condition for sidebar overlay (#505) | [b2335b1](b2335b16f2e0b9995813d19a501ffd6076fb47a5)
- Logical error causing issues with input fields (#507) | [52ad699](52ad699f924692b1d1c85d9c223a2d14e3f98864)
- Webcam selector doesnt work | [2ff9e5a](2ff9e5a11199a39259d451ceec08a82b72755714)
- Restart stream when switching between mjpegstreamer webcams | [dc4a322](dc4a3224208906ce9be3dd3d633ff39438da94f1)
- Hide fps in farm printer panel with mjpegstreamer webcam | [d1218aa](d1218aa0f564ca637340971bfa935590079f27af)
- Send temp input only when blur, select value or press enter or tab key | [098c946](098c946ddea15e094496d8ed4d46e960fb49c7f3)
- Sidebar logo and top-sidebar overlay (#514) | [450c3db](450c3db1e60392b28a0203d5a84869cab8c1d093)
- Button and input placement based on screen width (#515) | [3d14e8b](3d14e8ba46e22b8b601d19f9aec0ea3bda2587c3)
- Only update / send temp commands on blur if they are changed | [ec67ab3](ec67ab3033e2a0736a881f2852fd3ffb5e930e93)
- Only update / send temp commands if they are changed | [e3db273](e3db2731ab6a9bcb11804c73edcfb85e50812fc4)
- Gcode files view with queue on mobile devices | [61c2ba3](61c2ba38b00772ad0cab45011a56e2c6651e3d02)
- Request metadata for gcode files, when using search function | [629e0f2](629e0f2f7c313741ff9f8f24c19cebb3fe95be55)
- Fix locale output in confirm dialog for service control | [d76343b](d76343b7bb6a28f92511b6f9e8a6c478ea74c6cf)
- Sort endstops in EndstopPanel.vue | [d7c2dc5](d7c2dc5033e8c2597cb4e675a4ca756b1d4fb4d9)
- Sort mcus in SystemPanel.vue | [aa4c269](aa4c269eab5b51cb2b891b2b142cf7219e2348ea)
- Hide snackbar details if total not available | [bd7cf76](bd7cf76076526d4e41df7a261414fe6a836873fb)
- Workaround to display download status in editor | [5307412](530741248464cfa9265c1aa960ae2158694ff8ec)
- Workaround to display download status in gcode-viewer | [06bf0ac](06bf0acdc38045b2a3728bfdbeec77ab90035f4c)
- Klippy connected/disconnected change | [674ad36](674ad36ddb738f4e27b1aac03116f17730319ceb)
- Set default for min_extrude_temp (#540) | [bf60aef](bf60aef3445fee5e561c71d12de06d5b7ec5a9e2)
- EncodeURI for thumbnails and timelapse files (#539) | [7b19c90](7b19c902dee500b58e9a07e074c8c34efa7953e3)
- Ipv6 issues with encodeURI | [56d61ce](56d61ce6ae9af82e4e97d86f9e418b214a6b2fc5)
- Improve machine settings number inputs (#537) | [595c937](595c937d502defbdec9cdd1b7b827a608e6d131c)

### Refactor

- **locale**: Update FR locale file | [fb714fc](fb714fc904e99729c7de77a4245c15a97803f867)
- Change toolbar buttons to text buttons in ToolsPanel.vue toolbar | [ebc61c4](ebc61c4e4b6af92fddbf94bbe4f730a4a29de945)
- Change toolbar buttons to text buttons in WebcamPanel.vue | [2144888](2144888ef8e79fbf990b27dbff4bd72d6e27b9b2)
- Change TheSettingsMenu.vue to panel component | [4803df5](4803df5d5d7deb57081f4e84d73baa039959cd07)
- Change CommandHelpModal.vue to panel component | [e294a5c](e294a5cdc020a0286b88874ebe37a87c6d99dab8)
- Change StatusPanelExcludeObjectDialog.vue to panel component | [49b806a](49b806a10edc3486e7d5798800375801a31e1aca)
- Change panel buttons to toolbar text/icon buttons | [7ce9dc3](7ce9dc30a69a1e7eb520a08bb3e5bf5572ebba6c)
- Remove padding right in toolbar to move toolbar buttons to the right corner | [951de0e](951de0e5e736ab058f342efe1353969e2f747b3b)
- Change color of cooldown button | [f8f730e](f8f730e37991a552ddd7dc316524780ba804ced8)
- Remove debug output | [05f5da9](05f5da93d35d86113f2a2a0824587ea8ec6dccf6)
- Change defaults macro param usecase | [4ef29d3](4ef29d3ad3397920f28f8278b0a5588d4c45673c)
- Convert editor confirm dialog to new panel component | [e9b1b79](e9b1b7963b774de01920e074716dcf67cc152d1f)
- Sort interface settings tabs and add a border between navi and content | [a45d6d2](a45d6d2c2ea617dab82e95b799960b72669c2649)
- Rename theme settings tab to ui settings and move some ui settings from general to ui-settings | [d1a1d43](d1a1d43701c31ec77f7f6b7f2a1b3a869b789be3)
- Convert emergency stop dialog to new panel component | [4d52d96](4d52d9660ef9dc4eccbaa89104ffad75be361fc7)
- Convert editor to panel component and add perfect-scrollbar | [dd9c71a](dd9c71a3bbd2f0700d17d083ff0b2dc983ffdd02)
- Remove divider between buttons in editor toolbar | [c9696ad](c9696ad1f8f5f990d465542aa2a3f0b36290024a)
- Use getter getDirectory in gcode files | [adf3115](adf31153ebb91503fe53b37cdd1ef760fbcf7e4f)
- Change thumbnail sizes and use a global variable | [48b84f9](48b84f9ffde1efce6d8170344a5a55837f4ec58b)
- Change main scrollbar to perfect-scrollbar | [03b8b59](03b8b591b4fddb116adc7f17deef202cb965b88a)
- Update dependency panel and text | [feeee61](feeee61ffb26d8230afdd2ef86f2a992866215ec)
- Fix typo in dependency text | [e858318](e8583181e17f740765b7e10a4aa763a139e02acd)
- Change icon position in top right corner navi | [bf3077d](bf3077d858cf676419060a94c12bc64d882c861a)
- Modify dependencies text | [16a09e0](16a09e006f19a063bfea054523abaccf413c981a)
- Move presets to own moonraker db namespace and create sub module of gui store (#405) | [b7e58d9](b7e58d98ffc5e10bbfafd3efea9aa70cc8eaba46)
- Rename gui/webcam to gui/webcams store | [a24c6bd](a24c6bd90e7f924a0af5f7e2bf9c5aaea4c30f80)
- New order of init moonraker databases and printer | [c6934d7](c6934d751fc8d60e18b9a0a1209430c66af886c0)
- Use Vue.set in addClosePanel and removeClosePanel mutations | [877c7ee](877c7ee8617be45e2d88deb72ac3d6849d513a4c)
- Rename webcamTab to webcamsTab in settings menu | [d12f1cb](d12f1cbb3209fa0505a246c33e787f4061f39610)
- Move consolefilters to own moonraker db namespace and create a sub module of gui store | [645575e](645575ea315426e254836671fae21e2ff9d14887)
- Move remotePrinters to own moonraker db namespace and create a sub module of gui store | [34f44a0](34f44a00b7e8c18835f19351f1f5abab5c1d8446)
- Remove old actions in farm module | [4fdd49f](4fdd49fb2743026f1a8c64f1951813b035adb656)
- Move macrogroups to own moonraker db namespace and create a sub module of gui store | [6597c9c](6597c9cdc2212cbbdf5bd9578e644aec2f27d3d3)
- Cleanup gui/actions from old functions | [a9bb288](a9bb28840793d1e8dbac75ea9044c9c1dd749e72)
- Update klipper warings output | [45a4113](45a4113420e19e9fb0d87262d3cdcdfa32ca31d5)
- Minor changes to menu and settings tab (#411) | [19928e3](19928e32443f1f4cbb9edf5be27a84a6164381a5)
- Button overhaul and minor changes to the ui (#413) | [8a4a4ce](8a4a4ce23418d6eb6463963ac317390d8c48c448)
- Remove debug output in timelapse mutations | [05e88f6](05e88f6ee93edab683140fd1761c0b59295e5535)
- Update download button in timelapse preview dialog | [f4e07b7](f4e07b7278552e601367b77f075c7b003d3e3cd0)
- Remove db update for locked sliders | [0a2a2fd](0a2a2fd3c5eda94d62ad5ce6ad3b50e0dddfb69b)
- Update moonraker dependency for job_queue | [30b0469](30b0469ffdaa2c08e460e4d7fe2bb26219ba1c6f)
- Update job_queue to moonraker notification | [ae1fa87](ae1fa8736a1441c4e705b99f753325f57744c864)
- Fix i18n-extract test in power device dialog | [7aad8f9](7aad8f905dd34cc35168517e296c35b48952c3d4)
- Change icon in PrintsettingsPanel.vue | [d3ee2f9](d3ee2f920bbe529c1253199cf10eb6a982809edd)
- Some fixes in 2.1.0 beta and minor changes to ui (#457) | [8021d5a](8021d5a7ad65fb90284a4156a98649cf1bd19ffb)
- New sort of context menu options in gcode files | [6844e62](6844e6242c5044159f6eb8cbe2cd16124ca7461d)
- Style heightmap tooltip | [62f95cd](62f95cddf50aa812a02b7399bc0faa7657e7fec5)
- Remove old comment | [97ace01](97ace019080fc3957098949452a6cc5419320684)
- Remove debug outputs | [814f232](814f23213e6c593931055415bb1b35fe2012c05e)
- Add variable descriptions in variables.ts | [093cd7c](093cd7c5d4504e357814fce9a87c6be897c9f5c7)
- Remove old function in TheSidebar.vue | [4f65bd4](4f65bd4ba2b882c5653630cea3a5d0055709f287)
- Remove debug output | [deb8109](deb81094d0cb0a6df699a9edf96a9228bfcd4170)
- Improve confirmation dialog visuals (#508) | [26ed70b](26ed70b4a7b674fe4a9a75c4deba5367790a55e7)
- Sort buttons in status panel toolbar | [9702086](97020863d29e2f0c027373ca84fe6b2ab28f98d1)
- Change panel expansion indicator (#516) | [8acf2b3](8acf2b3b7e416b3de5f00961ef699752fbe4eba0)
- Change default colors (#523) | [4ac9b56](4ac9b567755be1045c8150b137499ea5016861e8)

### Localization

- **IT**: Minor edits in italian (#415) | [41584b4](41584b47f75ae315c7e0dd250baba0d84f94339f)
- **da**: Add DA language file | [a51d216](a51d2167d0211b08e46c83c9224e4a51c3dc4a71)
- **da**: Update da.json (#491) | [9895622](9895622cfa4714a57ac463bcec442d6850c6c4a0)
- **da**: Minor changes and spellchecking (#512) | [c831d33](c831d338732e666558ace810985641d7b0c8ce29)
- **da**: Fix typo in locale file | [65cb342](65cb342cb8d198834530e237860498e8d4e3c49c)
- **da**: Updated Danish translations (#527) | [649bbaa](649bbaa7dc6ad7804dd19db5351e979c7a50ef94)
- **de**: Update de translation (#446) | [d92543e](d92543e1c385c1434ac7dea21bfed87a156e042d)
- **de**: Remove all unused keys | [7b66065](7b66065e777f6ec25adccd25f5280b891d1dff6c)
- **de**: Fix missing entry | [83e10bd](83e10bde0cf705d03db51ddfa7980e01131f4dfa)
- **de**: Add temp too high/too low messages to locale file | [39dbebb](39dbebb2d207e12a5e8a64736c5982e6f454c544)
- **en**: Update en translation (#447) | [869423f](869423f4c689678d1be12237522b5b281b5e160e)
- **en**: Remove all unused keys | [1a6792b](1a6792b6b556c096c6df675153e02da7076ac781)
- **es**: Update spanish translation (#443) | [8a87d8a](8a87d8a144a88dcf68595f7158a91f1a08a30c55)
- **es**: Remove all unused keys | [85436a0](85436a0cd653e3db2b64114f561b4a7345a85ba6)
- **es**: Fix some missing translates (#461) | [0bbab21](0bbab2182f5672ddaecf772fe0f162f48d499ec8)
- **es**: Correcciones de la Beta6 (#492) | [c38716b](c38716ba2a2353b8b0977feb2f93cf8cf3ef1528)
- **es**: Traslation Spanish RC1 (#528) | [4610eb7](4610eb70bca160ba43f91cddd88d59f7a2bfa4f8)
- **fr**: Fix some typos | [fbc3afd](fbc3afd69ee5f3772f9e31d3b70519551a8b35de)
- **fr**: Update fr locale | [ed82856](ed82856140e50bd04525d715ca993d90727430bf)
- **fr**: Update beta2 fr translations | [5218b0b](5218b0baeaaa3dc033e0cd9bb70fc193a4886d29)
- **fr**: Remove all unused keys | [b6527b4](b6527b471ae93c4fc717ee9bcdff626549c48587)
- **fr**: Update FR language file | [b0e7e50](b0e7e503ed93e9f9f2d83709764e39a925920ad0)
- **fr**: Update FR translation | [11f97d6](11f97d62890352610af1404690ad06f958527ab2)
- **fr**: Update FR locale | [b7e94ba](b7e94ba25e6c15b91d46a2011a9551ccc937a5bb)
- **hu**: Update translation file (#454) | [06cb14d](06cb14db469bd9917d24a99737740757afd359ee)
- **hu**: Remove unused keys | [ea49345](ea493451380c41c3a35eda340382b1bbc0d7e3f9)
- **hu**: Hu updated for the latest eng local (#517) | [5ed63ed](5ed63ed27f3ce5cace77f24872d0a1199f99c753)
- **hu**: Hun update 20220110 as requested :) (#530) | [bd5723d](bd5723dda6da729d2cbc959043774b7db724828d)
- **hu**: 2022 01 12 update (#531) | [9da5c35](9da5c356f7c074de20953d34b03ce5acc1efacd3)
- **it**: IT Translation(beta) (#435) | [6912dc0](6912dc027eb21cb836665a04dbcd8b6a9a1aa4d2)
- **it**: Remove all unused keys | [1187216](1187216d5b905919afc16768674f6e3804d65568)
- **it**: Update translation file (#455) | [7005b87](7005b87870657e355b3684dccfa942b40ccdc5b6)
- **it**: Remove unused keys | [ffa05ee](ffa05ee1d56f9879576c709d11b5217662597c97)
- **it**: Update IT to beta6 (#483) | [e5b0ad2](e5b0ad292b7c02a72dcf91d25360390bd1064433)
- **nl**: NL translations for 2.1-beta (#453) | [04ead52](04ead521b0ed3618ce22c1eaa4b546f93b504ea7)
- **nl**: Remove unused keys | [a3a1288](a3a12882f89f41373e15e60179b7d91b9f08bd25)
- **nl**: Add last 2.1-beta strings (#499) | [da72a4e](da72a4e2720c1568d33f7f820fce4d65c11a68f6)
- **nl**: Update NL locale (#529) | [d94e9f1](d94e9f18f34e8e5106e2ca5aced09bd236c876e0)
- **ru**: Update translation file (#458) | [f172420](f1724206f60f6dd86a18f82d563cfcb599f2d19a)
- **ru**: Fix ru language file for the word "Flow" | [6c4bbdb](6c4bbdb5f9c97331d7b13048c21684f1c0e683f9)
- **ru**: Remove unused keys | [d1905f1](d1905f100aaded98fa1e637327806a909442b0e0)
- **ru**: Update RU v2.1 (#552) | [19496a1](19496a1f0ae49bf4588bec604fbb475d4a72cf4d)
- **zh**: Mandarin Translation for V2 beta (#444) | [123426c](123426c6ecbb5a5dc89a91e92591307e3133c898)
- **zh**: Fix syntax error in zh.json | [881ebbd](881ebbd49aa762a28eeec9e9ecc327c391ede4ee)
- **zh**: Remove all unused keys | [69eb419](69eb41923d5c08906401b1c1d48b1eab1a8bf35f)
- **zh**: Remove unused keys | [a54813a](a54813a1671b1c5dc6c1d4a21dcb94c6398717e6)
- **zh-tw**: Add chinese traditional (#418) | [79b42aa](79b42aa588de3fce7d69815af426cbec680ad36c)
- **zh-tw**: Remove all unused keys | [61bb2dc](61bb2dcac1d422ab8c32e6cb1acc0b8c70acf64b)
- **zh-tw**: Remove unused keys | [95a13c9](95a13c9c44abc4cac1b6d703d5eba4669d2834d3)
- Update de translation (#482) | [d16f0e0](d16f0e0fdf35437154b7c2fbffccb808933adb1d)
- Add KlipperStop to translate list | [f404895](f4048951268b6c8240948619dc0778ae6df3da7b)
- Fix missing entry | [88ecdcc](88ecdcc3c6a06cdf1bb4beac2fe12cd8e13c24ce)
- Add "Temp too high", "Temp too low" output to i18n in ToolsPanel | [94f6051](94f60516c1a76f844c4d08cc395a9b1653c05ed6)
- Fix keys in top corner menu | [3ab0a59](3ab0a5952ac5b59781420ab98bd2ce8d1e03ee86)

### Documentation

- Fix typo in CONTRIBUTING.md | [4ea2721](4ea2721b75d8fe35bb7928e6bef7eb36f6aa7e7f)
- Major docs update by tomlawesome (#358) | [13233ca](13233ca87875c4839518485371cd3bd46958e75e)
- Remove sudo for editing printer.cfg | [ea67e9f](ea67e9fa38213edfd74165cbb08a9304e5522864)
- Fix order of first-boot.md | [39fd77d](39fd77d0659eebc8ddfb332adf695d556992b9ed)
- Update manual setup/update (#368) | [89bc5d6](89bc5d6e7dc4239031d72b2c57f799c3b71f5bb0)
- Add Rat Rig community theme by Raabi91 | [2f81bf3](2f81bf390fd36798da89577a23a8b34b877bcc09)
- Add FAQ with some klipper warnings | [3984a40](3984a40fd90c84d414d4bbcc058858e4cf20a498)
- Pre-flight fix | [310e034](310e0342c162dc9cb67d7cf26d3e2f178939f673)
- Update moonraker dependencies | [e3f1532](e3f15325c1616b1a492092a1671acf7d42d65cc2)
- Add 'command format mismatch' to faq (#406) | [4c681d5](4c681d5de1bd5fa79aa902dbfe16c13724b0fa6a)
- Update mainsailOS urls | [ceb4ff3](ceb4ff395c30546b900b00f01f5dbfaad1a5994e)
- Updated all meteyou/mainsail urls to mainsail-crew/mainsail | [09e92ca](09e92caa430caee8c2dc62a1236f5ff7d48c0f17)
- Change default value of PRINT_START macro | [470a00c](470a00c28855928b1bee8779a0a78f88cbcac45f)
- Add "NTC 100K beta 3950" note | [bc5731e](bc5731e0bfb12691d7a9802940440e2b9cfb5fa0)
- Fix pre-flight | [d190657](d1906572215169400440b6213dec1b8309f61a55)
- Fix layout | [f0e3a0a](f0e3a0a77a6bbcb41abf8fd91601ec3960984531)
- Removed duplicate entry | [f6f7fce](f6f7fce424874d3754dcc193a69b68fce51d7adc)
- Fix link to pre-flight | [91f2b2f](91f2b2fa059bcb495933ec4e97e6b8137d72cf28)
- Add youtube videos for themes & thumbnails | [253ff49](253ff4900c5c0362f798bd75598befde7f345ec3)
- Fix thumbnail toc | [003586c](003586cb7afe317acaa845e9f27b42104ce41fe8)
- Remove description for legacy slicers | [53d8522](53d85223e8ab6e4dccbd7b0996936af64f921c23)
- Thumbnails - replace prusaslicer screenshot | [a33d26f](a33d26f17a2f2e3bdb9185312165f5e4525b6d6f)
- Add new community theme "Cryd" | [3bb52a5](3bb52a566ece64b77cb0046bc26d1c4cd97e8c9d)
- Fix theme | [5286be3](5286be32b111ee16c43bddc56bbb41f1f478ce22)
- Update Home Page and Setup Guides (#478) | [a339cab](a339cabc7d0b79298ef8b0105aa39d01fe6be2e3)
- Update First Boot docs (#506) | [7b3781e](7b3781ebaf026dc81baabd208c4f4e67ce3d9c8b)
- First boot - fix info box | [058688d](058688d47080391a98e9c04a7deccfc8ef30444c)
- Themes / changed name to cryd-s | [887da67](887da6745a537c8b7cc236d297e476bf2a80072d)
- Add redirect dor configuration | [f535ccf](f535ccf49375eaf36af2de7961778aebf77682eb)
- Update Quicktips (#518) | [be2efac](be2efac9fdfb218f0577ed003d9bb8255d516cb1)
- Update screenshot to v2.1.0 | [9c70a0c](9c70a0cafac1c446541c6a324f589eceaa1d0e72)

### Other

- **build**: Lint errors (#381) | [1e10e34](1e10e34449c7e5fd75640a7e263f3856ab48ade7)
- **deps**: Bump nokogiri from 1.12.3 to 1.12.5 in /docs (#363) | [af6b45b](af6b45bd9299aeb52edcd57f4e6d8df43e529788)
- Merge master in develop | [5dbffdb](5dbffdb1675ccdfc84211ab53cd0519ace9b2f97)
- Update gcodeviewer to v2.1.10 | [61232df](61232dfd95a93bb34bcde55a1c80476a2d2154e8)
- Update gcodeviewer to v2.1.11 | [65acd0f](65acd0f190054e4ebed37ddd1783b77f0a0738fe)
- Change tracking button | [10a8672](10a867227f9744d6550cc31a09cc0435f385b3dc)
- Update gcodeviewer to v2.1.13 | [32310ba](32310bad29982c8a1e8027020e1a10a2ecd5bc2c)
- Add CODE_OF_CONDUCT.md | [31327e5](31327e581d9441ef36ae9a1157502e38e534e189)
- Move CODE_OF_CONDUCT.md to .github/ | [9d2ba3b](9d2ba3b022c70feed4146c86d556abe3b735c655)
- Add CONTRIBUTING.md | [5b3e662](5b3e662062e50c3426fe50af3a1787cb999724c1)
- Fix types from last commits | [5f784aa](5f784aa4f563dcedc78567db24b5856e4c345f21)
- Update perfect scrollbar package in npm | [bad3a84](bad3a842e82604a7a106878574bdb453cca19b13)
- Update vuetify package | [0cf0311](0cf0311c54d06cb7f3ddc6a1b725194e016f2e30)
- Add overlayscrollbars to package.json | [e68bc01](e68bc016b60b2520b8c942f7f3ad96f68f9a880e)
- Update vuetify package (#456) | [3bfeb46](3bfeb4613ca1e01d176cb559ea9a3e5e00ad930b)
- Update echarts packages | [5b33db4](5b33db421d1af4e066f3c91e1f763825000a2fd8)
- Update gcode-viewer to v2.1.17 | [9df182f](9df182f44a114c51df2fe31cbc6484c553f8aad2)
- Update package-lock.json | [28a6f5a](28a6f5a8134222a6bc0f37bb1d99d5f2a7a4b433)

## [2.0.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.0.1) - 2021-09-08
### Features

- **console**: Autofocus input field after click on a command | [44c43a6](44c43a6fb5cad777b7ebd889d408547aa2142cfe)
- Gcodeviewer (#322) | [673fd9f](673fd9f8798fbb9325c40a49547551ae5bc1c695)

### Documentation

- Update screenshot to v2.0.0 | [b8c93bd](b8c93bdb0f15bef589c1122ca8c427838b792563)
- Multi webcam documentation (#343) | [3e4c73e](3e4c73e381907896c63ae27b4ea406f7eaacf020)

### Other

- **editor**: Update gcodeviewer | [c0a1bdd](c0a1bdd1d6b42ab897badddcf8dd38cbcde9ea2a)
- **eslint**: Config and fix eslint rules (#340) | [f1094e9](f1094e9c29ab78ae5f6208ab309510565759eef6)
- **gcodeviewr**: Convert to TS | [2f88def](2f88def03aa2ab2015caadd64a95a2001c23ee00)
- **gcodeviewr**: Fix some types | [586977c](586977cc8957e2f9d605761f3ea393f86f9a199e)
- **type**: Fix type for build | [855959a](855959a1f9b5246c48c9a5605a90b6e2aac2064f)
- Fix eslint rules and update from develop | [fb0bc97](fb0bc9755edc85ddce41945f3d04dd215fab8788)
- Increment version number to V2.0.1 | [4d38b01](4d38b019beb619660a9b1c46b4c06345ee8cca11)

## [2.0.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.0.0) - 2021-08-26
### Features

- **editor**: Add JSON syntax highlighting | [00caf8a](00caf8a655bc3ceccf4362d71fabeb92ec71ac1c)
- Add SVG support for sidebar & main background | [9f2a541](9f2a54100b2c43f8c4a7f5f370e63029cdc37dc8)
- Feature: restart webcamd by webcam*.txt files
feature: display root path logs in config files

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [dff099c](dff099c5aa84aba452a26d3d230f00940be1d3df)
- Add logfile paths to "connection failed" dialog | [cc01035](cc010354ca62c2617abc03d8b60d2e8931e7a1ef)
- Store file list (gcode files & config files) sortBy in moonraker DB | [776f358](776f35889bf197128de05d6ceb6d7092284a2053)
- Update not connecting dialogs with better descriptions | [1529261](1529261f6ab6ea59774b9335007f662f7bf3365e)
- Display moonraker warnings on the dashboard | [037db5f](037db5f14abbe7c4f8cd71af1885fa31f7cc1f89)
- Show all available services (moonraker) in TopCornerMenu to restart the service | [d8de425](d8de425d69b447e780ce30e00fcde27d3cc78ed6)
- Add mooncord to "save & restart" function of the config file editor | [844363f](844363f004830b80822dcb4bb4c1e1ac5c9df5c6)
- Add dynamic root paths to config files | [3e219e2](3e219e24ace3423effe2ddb04213669961a56a1c)
- Dynamic max of machine limits | [75246d5](75246d58d1c04edff6b3e6c2c57c8d698840ff56)
- Display status of QGL & z_Tilt status in control panel | [13537ce](13537cef35f4143ddb0a7c3f787e3efb3612e490)
- Hide klipper_mcu service in topcornermenu | [2308d70](2308d70d5cb997cec735797a05c1c0dc4761c204)
- Hide klipper_mcu service in topcornermenu (fix if empty) | [f887d4e](f887d4ee058e467426680553325820af8f93cda8)
- Add message to include mainsail.cfg in printer.cfg | [ed7b8c4](ed7b8c4b2488c1a5e58972b68d10ccbc0f791435)
- Change to motion_report with fallback to toolhead position in status panel | [7a55cad](7a55cad11d3f8bb608cf35e6deed52345c20075d)
- Show gcode thumbnail in full height on focus | [2d743ea](2d743eaa376a5ce4587bc323e64f2547d2d22ae8)
- Add support for save gcode offset to endstop/probe | [370c104](370c104f561a7787aa72508ed8aaa5ff364bad8e)
- Sortable dashboard panels (#319) | [50dbc46](50dbc468e883e3cce0f3b094bb3f1a5b6523f2dc)
- Add logo favicon and progress favicon in logo color | [4cb6848](4cb68488b768fe2a00fd14ef80687e839455fb5c)
- Set current viewport as default when open settings > dashboard | [f4a3de1](f4a3de15ca8750ec879b519e42f20a0916eae8d7)
- Disable heightmap panels when klipper is not ready | [102d429](102d429a400f4e6976c11ee39133695e6db16818)
- Linux like console & customize console height (#321) | [96f8a68](96f8a684487c2c0d5de7f58733d0589819b127b9)
- Add welcome message in empty console | [7c5f613](7c5f613f5a165f5cb35d6955417dc4f20215b432)
- Hide heaters, temperature_fans and temperature_sensors with _ as first letter in the name | [da28b87](da28b87ae144308f7d115a5e83d16eb894a0824b)
- Add canvas to tool color picker | [1519178](15191784b3d93a6021e2876f436bcdc9cf3e717a)

### Localization

- **fr**: Remove unused keys | [c7b70d2](c7b70d2cf40b8d1e763c160389b3c4cae886ce45)
- **fr**: Fixed last missing translations | [b6703c8](b6703c84f103f9fedcff1d0569b516e6b93535ed)
- **fr**: Fix one type in settings console tab | [3c7f9ae](3c7f9ae7ba963a42bd2d52c82a6445397910f061)
- **hu**: Update hu json (#333) | [be0d143](be0d1433cd38022f91ce364cddb503db387711b0)
- **hu**: Fix last words | [61c2f84](61c2f8426d2e7418cbae6c0117c416e9b72e8b13)
- **it**: Remove unused keys | [9057248](90572482ce21d9a7c226c7174b46bc9fe3a9cc56)
- **it**: Add translation | [6e63324](6e633241877694ea5bad55aa3ebccd7e3c8adcf9)
- **nl**: Remove unused keys | [bcb541f](bcb541f470bc2f30e1f6cde0441855baf13e5db9)
- **nl**: Fixed last missing translations | [d5218ca](d5218ca059b24badde010ea9b9d2b4bd18e4455a)
- **zh**: Update chinese trans (#332) | [c41ea7a](c41ea7aebc29700ac0446f74922e3fad696e0f93)
- Update francais | [390a3ef](390a3ef571602abe02726dfb3b93129589698964)
- Last fr fixes | [bfa4e25](bfa4e2524c9fc23128ebaecd0668e5b58ed62f5a)

### Documentation

- Add .svg as valid background extension (#285) | [e10fd11](e10fd11acd8b9faf9a3ac3fff485471cae9bc36c)
- Add home and temp check to PAUSE and RESUME (#288) | [cc292f0](cc292f090e558884c2dc3f4eed6a54b177165527)
- Add voron toolhead and cyperpunk communtiy themes and a few improvements of how screenshots get loaded. (#298) | [f929610](f929610bade58ebe4b3340a1072527423d306502)
- Fix typo | [cb874c1](cb874c1918f47f79441bd80decaa272fe8bae40f)
- Added nvm node install for standalone dev env (#325) | [65d23b3](65d23b3ded7d33495a6e11107b9410e2540baf43)

### Other

- **App**: Fix build warnings | [0f13d2e](0f13d2efc1c28ad4ef0d885a5e0f0e068461d3cd)
- **build**: Change sass version as workaround for vuetify sass warnings | [be065e8](be065e88f8366d61fa58f09c6fa3d667b6333632)
- **docs**: Update gem packages | [b8428c4](b8428c498e03e894ea33ab07803c14c1763fba1f)
- **github**: Add build workflow for test builds | [d39e6b5](d39e6b587c64a28569a504fbbbf50e8c24c6055b)
- **github**: Add build workflow for test builds | [54d3484](54d3484d027aa6f43bf3c92f4ba53806be901601)
- Increment version number | [94d445c](94d445c9fe03454893fe53d70518dc213bb7eb0a)
- Increment version number to 2.0.0-rc.2 | [9dbde14](9dbde140d840a64c5ee742238efda8ef63a5f995)
- Increment version number to 2.1.0-alpha | [ff0c58a](ff0c58a901072a93035906c06aafd39ad4a9aafb)
- Fix some eslint warnings | [eb1e1d4](eb1e1d4f5c1c09aba320834d86af1f717c2d9d9c)
- Increment version number to V2.0.0 | [5a37e67](5a37e67420b71a45b249517ebdeba7d1bed25312)

## [1.6.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.6.0) - 2021-05-18
### Features

- Delete directory with content in g-code files | [025921e](025921e84a8f9a8c74aefd08921ab0b1ecad6ae7)
- Delete directory with content in config files panel | [3df44b0](3df44b05e27a875cb326717256db3f9c1949d4ab)
- Feature: limit requested_speed wiht current max_velocity
cleanup StatusPanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [d578c91](d578c9105c59358dc5b2cb493ffa56f597225775)
- Display printername in SelectPrinterDialog.vue | [365ed2c](365ed2cda7809bb4332904dac2a429bc9cd2e42a)
- Display filament weight metadata in gcode-files list | [5e09f52](5e09f52a791aee9b90e1481928c4bbcf71ea7975)
- Store webcam settings in printer farm | [8a66899](8a6689983765a35d6298467160fb31dc8cb3397e)
- Multiple custom console filters | [b49c574](b49c57405cf61e7513a6b3922f60f3c4115fd63d)
- Rename directory in ConfigFilesPanel.vue | [f6679ef](f6679effd99320ffa8f57fd89e87889ee3a9ca22)
- Add FR to i18n | [abb19a4](abb19a4ac99c184902d9af8d2d67d954a9cd14cb)
- Add filament_motion_sensors | [1919aa6](1919aa6921c56464bbf33c9d62e2ff026ff1632d)
- Add UV4L-MJPEG webcam support | [97c06c3](97c06c30611b7105c31cfa7a00fee8644e3ff369)

### Documentation

- A simple recommendation for remote access (#277) | [a0a3aa7](a0a3aa79ac894bee65b3c6941b75c1b09987ec56)
- Stylesheets & escaping gcode (#279) | [598a7fe](598a7fe94fac96ecd7f112e7000517c86c7e6d59)

## [1.5.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.5.0) - 2021-04-13
### Features

- Add probe to endstop status panel | [40293a2](40293a22d1b76806e8455b27db69635ecc2fe596)
- Add option to display ZOffsetPanel in Standby (fix #230) | [fafd105](fafd10555d7178973447f881bc0995f9ea1b7bd6)
- Add restart webcamd button in top corner menu, when webcam is enabled in sidebar or dashboard | [aa80372](aa803727affe321c27a3820ce3ec82139f8a4805)
- Show/hide printed files in gcode files | [d7125e0](d7125e0f8a03abc016bc5defb2d7b364a734463d)
- Add tooltip with object height on layer counter | [2617946](261794630d58c18d07943af7a2a9f9f66bf2e2d6)
- Add ETA to page title | [d643e63](d643e630174040310acadb40217303719738bd2c)
- Add ETA to page title | [cd6edc3](cd6edc33ea9ed55535b1e45e7f95b043f1539cc4)
- New editor (#243) | [51dda65](51dda65a6e1032298d77e87229f3f5b991edc5f5)
- Add days to ETA (status panel + tab title) | [b2055ed](b2055ed87998db506b4d7285955e6c55eb2a9095)
- Add ip cam to webcams | [cae2bfd](cae2bfd2cbb5a342f40548940521ce7327b83f51)
- Add recovery function to update manager | [f1eca15](f1eca15c2d97fad80f4156a5f7536a1e8816aee9)
- Add debug mode to display ram usage | [5a8a42c](5a8a42cfdd4aaff1a2bf1d90f5cd50316e3bcab2)
- Feature: grid view for multi webcam
feature: lazy loading for adaptive mjpegstreamer webcam

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [88afe07](88afe071e1313e46c3dc14ab69bcf7ca949b0598)
- Add webcam support to printer farm | [c17951b](c17951b53d3de733161076e379e9f83a4cd64ab9)
- Add M117 output to status panel in standby mode | [b2a953f](b2a953f79a6efdf041f3057c53a453df507535a8)
- Add "Busy"-State, if the printer is in "standby" and execute some commands | [336c82a](336c82ad558cdd45ea20eeb0cf6e965eceeef4b6)
- Redesign status panel | [3da9dd2](3da9dd22b09334c44a36116244fe10c0acee4733)
- Send an api e-stop instead of M112 gcode | [fe05d5c](fe05d5c489b613cdac7738c29ea9c5ad538d4aaf)
- Display full version number of up-to-date components in the update manager | [84130f2](84130f2891a564148ffcb6089f414b9cd20e736d)
- Add state avg to heaters and temperature_fans in ToolsPanel.vue | [86d45b8](86d45b850716389d3ce4bcfd66fe99f4c16613d7)

### Documentation

- Fix theme list | [133bd55](133bd5598b44484ed68df2949724015063e1968b)
- Add Localization to development docs | [8af31e5](8af31e5f366660783d759ede5eb1ec8a8f6bb60a)
- Fix localization guide | [bab3680](bab3680bc061bb7ff0df5fc0b3bc36d0c43d18cc)
- Add credits (#263) | [263b2d2](263b2d245ce76545278501fa0a74d4e9b9f13e05)

## [1.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.4.0) - 2021-03-09
### Features

- Add tacho value to miscellaneous fans and temperature_fans | [3c7dc54](3c7dc54beac38f9e5b39d245337c1785271c37cf)
- Display bed_mesh variance and make profile name clickable | [ab6e0c0](ab6e0c07dc96f4fe667a69b592e73fa1b9ad14d5)
- Display power/speed axis in tempchart only with a enabled dataset | [1854c04](1854c04d7a0560415673edb65bf22c20d1afb17d)
- Add info icon to clickable update logs | [2bf8f8e](2bf8f8e8e2d939c567c7dcd1a375d0a555098c64)
- Add .nc to valid gcode extensions | [fed5956](fed595650033cc03397eb79a2b65a0858c691835)
- Add option to enable cancel_print button permanently | [0825d85](0825d8500095ac59db6385ff7b9cad4481a1d88b)

## [1.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.3.0) - 2021-02-27
### Features

- Feature: customizeable tempchart length (moonraker: temperature_store_size)
bugfix: autoscale chart (ignore hidden series)

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [7e48b08](7e48b08f8118aeffdc589e16dd2567296595658d)
- Add configable chart rendering intervals | [2db574e](2db574effd22d545b40d5c74a2e35a0148f1a020)
- Save last setting of ExtruderPanel.vue in .mainsail.json | [389c162](389c16287863044c8d4bdbe6b97da2b88a3fa8c8)
- Commit dialog for upgradeable components | [f2ea6c0](f2ea6c039f42f6df3fb91a020b13203ff348a611)

### Documentation

- Update manager config in manual setup | [5f06da4](5f06da45cfcd34c32eec977122e833e7265e8bbc)
- Add custom.css example | [aaf50a4](aaf50a403df74f6b5255a314955deaa111353642)
- Custom.css slight reformat | [2634b37](2634b37755abe48d183925a1524c36591a3247ab)
- Theme warning fix | [85bd527](85bd5279f55857892e6e74eaccaac1e6388d42a7)
- Add different message styles | [80ded1b](80ded1b9ffbdbec8f2ebbd835396bb1e07e87a77)

## [1.2.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.2.0) - 2021-02-09
### Features

- Disable power devices with attribute "locked_while_printing" in moonraker while printing | [aeb6ae1](aeb6ae1ec97ef3c0899a857937d74f9f70ee5068)
- Process notify_klippy_shutdown from moonraker | [42071ae](42071ae4228871cdcb4dc92f784d690714812aab)
- Feature: add update notification
feature: display branch if not master in UpdatePanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [8db3725](8db37259e1b09b834300d8f516152131f8b4ec3b)
- Add disk usage to gcode-files | [4110874](411087434c89af5f881df1682e500ae316a04abf)
- Add preheat function in gcode files context menu | [eb123ff](eb123ffc016c7a02018999d5c3c234368842aceb)
- Add customize feedrate for ControlPanel.vue (fix #49) | [88ac7a5](88ac7a5caec3d56cc0e3ce19df3b9aee4ae01548)
- Add customize feedrate & feed distances to ExtruderPanel.vue (fix #158) | [3749b76](3749b76162bb078bc16460f3b15b4ef0e1aad520)
- Hide additional sensors | [fff66f0](fff66f0c3b1c67826b771184c3980d598b826e22)
- Hide additional sensors in temp list | [91014a7](91014a734931d4521f6349cbb97efeaaf5ce54c1)

## [1.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.1.0) - 2021-01-31
### Features

- Add autoscale tempchart | [8a85877](8a8587786addd1718a58cee26031866f5a9d2f40)
- Save chart settings in mainsail.json | [4003166](400316600080c66aa6c92ed5f82bb69daec8efe9)
- Feature: add zoom in tempchart
feature: add combine tooltip in tempchart

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [4a58f0c](4a58f0c3e2049b8391dfaf0ae61076b6a10b45a1)
- Add combobox for target temp with preset values | [35955d4](35955d48999d97440a951277599011bf5ec4e48b)
- Add hover marker in tempchart | [9090c60](9090c600382a97a0a2acc1d83725ae9131b526aa)
- Add additional sensor support in temperature panel (bme280...) | [f958027](f95802767197613a05c6ea49eb83c8c2280ee052)

## [1.0.1](https://github.com/mainsail-crew/mainsail/releases/tag/v1.0.1) - 2021-01-24
### Features

- **refresh-webcam**: Refresh webcam view on focus | [45198d7](45198d7d93c0c6894c432319c52aef6e8084a295)
- Add registered_directories in server init process | [35013e7](35013e755cfdfa114861c200f0300c19913e4b12)
- Restart moonraker if you click SAVE & RESTART of moonraker.conf | [659504f](659504f77ecac18a43a7790bc352f93daf91392d)
- Redesign MoonrakerFailedPluginsPanel.vue and MinSettingsPanel.vue | [25221ca](25221ca6cb9474927ae99636828999c4802f0cc3)

## [1.0.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.0.0) - 2021-01-19
### Features

- Add farm mode | [5831e43](5831e43fba34fb2318cf70335683bdd6a0292d26)
- Add moonraker update notifications | [13859d3](13859d3832f250382b43ac3f7bf8a3cfd8f8da8e)
- Moonraker failed_plugin output on dashboard | [b6d20f2](b6d20f20ee5863c310cd642b2092734c4b3053df)
- Add gcodeStore types (respond, command) | [c8cff6d](c8cff6d3d874a8bd609a43a5d5b999555cef9d50)
- Feature: hide mainsail in the update manager in remoteMode
bugfix: fixed padding bottom of the close button in the UpdateDialog.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [747722e](747722ec2c7a1c7902b595a3ed98d6df832def01)
- Feature: show klipper & moonraker branch on hover
feature: disable update buttons during a print

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [2b08e34](2b08e34ba762ef26259c6bcf15d68fda5a507175)
- Add detached state in update manager | [e3607c8](e3607c8f3dd3b049d821abb2ad4b0c17d19ac67f)
- Add output_pin to PeripheriePanel.vue (fan panel before) | [02f9f9a](02f9f9a1d46d1c335c7a846190e3e1ebcf325c78)
- Add clear print stats button in complete state | [93c952c](93c952cabbe08a1ce96892c10c0e19885effdcc4)
- Display reprint & clear print button in print_state error | [31b4d4c](31b4d4cb3d606360d7dfcaff284c20446cb4ab05)
- Feature: add requested speed to StatusPanel.vue during print
feature: add ETA to StatusPanel.vue
feature: add current & max layer to StatusPanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [b38b052](b38b052004bd5c959c53df1e174801a50ba370ee)
- Feature: add klipper config references link in editor
feature: add save & restart button in editor

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [7164dd7](7164dd7c3cfc9067f8a7aac8c389f25f804dad9a)
- Close top corner menu after all functions except power devices | [354f6e9](354f6e9250b27601a4ac40d5b519db80f395b144)
- Upload & start button in topbar | [4579129](4579129a4f551fd9db931da4aec250e288fea06d)
- Add preheat & cooldown function in ToolsPanel.vue | [c599922](c5999221bcacf26efc8484472fc7d907cff74810)
- Add HomeAll (G28) button in Heightmap.vue | [fe24639](fe246393ea652c21afa4c1cf7db0fa8c9511a732)
- Add custom gcode to presets | [7cda0f7](7cda0f7058692833a62007061523d1dca857d706)
- Convert heater, fan & sensor names | [d767f50](d767f50bbbb03a3719e9820d543c6fbfad4d4a43)

## [0.4.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.4.1) - 2020-12-31
### Features

- Add log during a update | [a8ea45d](a8ea45d53c41622791517556cf03a02da6a3fe6d)
- Add customizing sidebar logo | [983c5c9](983c5c9bdac51b5adb8ec002d6415e174047740f)
- Add customizing favicons | [07072ce](07072ce2a12280b457c9177c9f7aa243f69e0e35)
- Gcode files fileupload progress | [99f963d](99f963df26af04ba65cd1451e9be7538303a2c22)
- Feature: add multi file upload in gcode-files & config-files
feature: add upload status in config-files

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [e44e3bc](e44e3bc540e8b48353437e7b6252af3b4bba6302)

## [0.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.4.0) - 2020-12-27
### Features

- Console Dashboard -> input field | [1b632c2](1b632c2ccabbdd97f5398e71a436aeecd8de7620)
- Customizable sidebar background | [c192cc2](c192cc2f2d78b9387bb5f12e3875614aa685ba92)
- Hide hidden files in config files | [53049b7](53049b79a6db9f9f1373d19c0c3c5c4ae2e315d4)
- Custom sidebar background image & custom css | [ac0f570](ac0f570ec2c6bdc2520898e268d9531ffcffb132)
- Update of the heightmap | [7200cfa](7200cfac68db972d919b731c647b6e097c2afbd0)
- Move power switches to top corner navi | [57ca568](57ca568bbe1b11e6c1a6cbc0ab5faee12be60e05)
- Variable max temp from temp chart | [ea932e8](ea932e85f0b7cdc56e8f8cb00960b3199c8c7683)
- Display PWM value in heater list | [664ed54](664ed54cd024acbbbd35502336246c96afe7bed0)
- Tool panel > temperature_sensor > tooltip on mouseover (min/max) | [131a917](131a91717129bb69f751b4a99520aa775b4b4949)
- Disable save_config during a print | [c3b442c](c3b442c43fb531e80d31e2297a819573703b361f)
- Colorize console output & input | [15cb423](15cb4232e7838d5474f074a056dfe6f5e81e2e9a)
- Update manager for klipper, moonraker, mainsail & os packages | [339dda6](339dda6455e4d66e0c59b139c267e5ea6351e30d)
- Hide temperature output in console and add custom filters | [3c217e1](3c217e1161e093df90f8467067e932a428d44f2a)
- Restart services (moonraker, klipper) | [583aa2b](583aa2b64b0d275750f967a38293a444339683b3)
- Update manager -> add loading to sync button | [5697792](569779250453d180df069de2c906ab42771ad703)

## [0.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.3.0) - 2020-11-28
### Features

- Show/hide columns in G-Code-Files | [616f84e](616f84edbe7e94d00b646eb891fe8d3217c2757a)
- Show klippy state panel in settings > machine & rename SystemPanel.vue to LogfilesPanel.vue. | [f6687a9](f6687a944d741332513bbe51948dcefde2665680)
- Missing config panel on Dashboard.vue | [ce6843c](ce6843cf49760e8766ded85467bbf6dbcf0b7b7a)
- Debug .env.development.local.example for moonraker connection | [6da293b](6da293b49465d18a4bc70a79045bb071d45a465d)
- Feature: new estimate time calculation
move getters to printer/getters

Signed-off-by: meteyou <meteyou@gmail.com> | [e9179e5](e9179e5bcdf9799263a53bacac3e43eccdd07e01)
- Save countPerPage from gcode files & config files in gui.json | [ebaab63](ebaab6324daa37da7c28f399b67048febbb7bb4d)
- Update PowerControlPanel.vue > new moonraker version of power plugin | [f26aff2](f26aff20859cabad4dd83be96b23778ce430e3e0)
- Dynamic temperature-sensor icons + header minimize from temperature panel | [8f363ec](8f363ec1c1447a8965d9a170793a0b34b9cd14c7)
- Redesign panel headers | [cb60251](cb602518f078bf0d90c09452f8014487b7b5b35f)

## [0.2.6](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.6) - 2020-10-27
### Features

- Modify dashboard console for more message space | [91f2e9b](91f2e9b6d8199ebc3d1df120bffcbe02a501828b)

## [0.2.5](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.5) - 2020-10-24
### Features

- Feature: rework the StatusPanel.vue
feature: add Sys Commands to the topbar

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [f35cf70](f35cf70301f119e39d53b0649ff6a02dd6da2f41)

## [0.2.3](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.3) - 2020-10-15
### Features

- Add "edit file" in context menu of configfiles | [5cbed10](5cbed10d441a78dc2a6a36218534cd5610d0a6a3)
- Allows flipping the webcam horizontally and vertically | [b0b2583](b0b25839caa3ae99a83383cec7d1a320285a79ff)
- Add slicer version in g-codes files | [76a93cc](76a93ccb45c16c5e4933f8185ebb1466ca312db7)
- Ensures app bar doesn't scroll off page | [8aef278](8aef278a0339869a308c13bb9533a6515e36dbc0)
- Feature: SAVE_CONFIG button, if klipper needs a "SAVE_CONFIG"
bugfix: temp chart bug after loosing connection (fix #82)
bugfix: clear mainsail store after klipper restart
bugfix: heater min/max temp input field

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [0977cb3](0977cb39c6b340e456a9483174557d8735cda114)
- Read version from package.json | [b273901](b27390133a5744f002696bb16c2487b964535f4b)

### Refactor

- Docs move upstreams and common vars to independent conf | [257b792](257b792aee9c2f29a6a04ab4a2730702b6f56c59)

## [0.2.2](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.2) - 2020-09-03
### Features

- Switch to meta data notifiy | [8b8f3cf](8b8f3cf939fedba5389f3f103412c31d6a87ebd9)

## [0.2.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.1) - 2020-09-01
### Features

- Show gcode thumbnail in StatusPanel.vue while printing | [ad6ae11](ad6ae1128bd3d76702bd85d6ed865816443b958f)

## [0.1.3](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.3) - 2020-08-14
### Features

- Feature: add config editor
bugfix: new file named "e" after upload in root directory

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [29d5b81](29d5b81b470f0f54bc98bfd051658d3a48df91ba)

## [0.1.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.1) - 2020-08-01
### Features

- Fine babystepping (0.01 steps) | [37f1ffb](37f1ffb04b2da6c2a1bfcd1f63119610b42a791b)
- Feature: add Z_TILT in ControlPanel.vue
feature: replace "_" in macro names in ControlPanel.vue

Signed-off-by: Stefan Dej <meteyou@gmail.com> | [75d6cce](75d6cce540441dc5aa5a73b3db8b5af4f1f6a262)
- Rename "Host restart" to "Host reboot" | [6766a26](6766a266e80c2b2f330644c13df6b853a0a8976d)

## [0.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.0) - 2020-07-26
### Features

- If Filament used > 1000mm -> convert to m | [b4ee662](b4ee662a4f280886961f17d3db507972d4a2247a)
- Babystepping, switch between idle interface & printing interface, first tests with PS thumbnails | [1e61749](1e617491755ca9af19afe884ab679fe3b119b247)
- Show temperature_probe on dashboard | [5795fe4](5795fe45d133771e78e3dc9e12344e0350969068)
- Feature: file manager -> show/browse directories
feature: file manager -> grab metadata per page
feature: file manager -> search in directory | [c71bc47](c71bc47ab81c461073b126647607efab8719aa76)
- Feature: file manager -> create/remove directores
feature: file manager -> show thumbnails (list + printstart) | [44a381c](44a381c243e1241d0f9568129e241b32904a8f80)
- Feature: rename files & directories in g-code files
bugfix: message display on dashboard | [98a7292](98a7292b7b5a9d789cef57a5d6f3b4172372022d)
- Feature: move files in filemanager
bugfix: update endstop status mutations | [2636311](2636311cc1d9daa593581ea555cad12c00838dbf)
- Update package.json | [458a6e8](458a6e859217ecd8d20b458ff0e1fe023e6cb733)
- Warning tool input if temp too high or too low | [be7abdf](be7abdf2542523d02331f174502b93121be7e682)

## [0.0.12](https://github.com/mainsail-crew/mainsail/releases/tag/v0.0.12) - 2020-05-11
### Features

- Temperature_sensor min/max temp by hover | [86595ab](86595ab70b69a1b8c8d2e5a6d6c4cfb706c584fe)
- Select value by focus heater input field | [9e52664](9e5266425c6f3fa5cbc6c320ff31381c0b172ae8)

