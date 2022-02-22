<!-- THIS FILE IS UPDATED AUTOMATICALLY, ANY CHANGES WILL BE OVERRIDDEN -->
# Changelog
All notable changes to Mainsail will be documented in this file.

## [2.1.2](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.2) - 2022-02-14
### Release

- Release v2.1.2 (#639) | [ebf7486](ebf74860f4d3119802590c6f6cffeb82e7af5a45)

## [2.1.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.1) - 2022-01-28
### Bug Fixes

- Read nozzle_diameter from klipper config in gcodeviewer (#558) | [8eb67ae](8eb67ae2b66c3960770ae45236f5107cbbefad4e)
- Default color mode in gcodeviewer was wrong (#559) | [1e54c92](1e54c92b000e33e41dfc5bf6f4a7f1df33d43063)
- Farm printer switch and display klippy connection errors (#563) | [1de95b1](1de95b12ecdc6eab0f45fea5141542a75c38c0a6)
- Delete remote printers dont work (#564) | [7fc5e29](7fc5e298ad63a36af2396c73b4f1bebfc999e4d4)
- Input field and spinner bug (fixes #551) (#555) | [75aad8b](75aad8b88015e92c3f9dc443a177240dcd15b4c3)
- Hide second notification in timelapse > remove mp4 (#572) | [0db74e9](0db74e9e378c6ab58abb407cbfda24c671581342)
- Polling klippy error messages (#571) | [d856b73](d856b73cd116e75b0c026bd2315c9720560dd22e)

### Documentation

- Additions to the readme/index for 2.1 (#543) | [b476419](b4764194b0e73e21b35cd254b52d2a4fb140ab33)
- Review Themes  Chapter in Documentation (#486) | [702981e](702981e32423bf84de22f8337d9bdf6a6dc45bdd)
- Fix macro link | [a3ad590](a3ad590d4b40dae279b64c553a06d2984cb8c2b1)
- Update prepare themes page with review feedback (#554) | [69bb61a](69bb61a30d4aca175e2e634826f5f8a455e7ff94)
- Fix some broken links (#580) | [ed45815](ed45815d3bb185a8829bfb333a8160fb74a7b2d8)

### Localization

- **da**: Danish - minor updates, missing tags and removed "deceleration" (#578) | [0f0180b](0f0180bc50063ff80e41eddf02f64827ddd9e0a8)
- **it**: IT translation update (#553) | [d569483](d5694835d0ea6954d1f64fe071455cc2400b84ef)
- **pl**: Polish translation (#581) | [b944af5](b944af54486ee36ac58e4469d0b64ebc3e957739)
- **pl**: Fix polish translation (#589) | [a121e56](a121e560859c862f36538c19930fb632519182aa)
- **pl**: Additional fix for polish language (#592) | [1c4127a](1c4127acf2f9b9774511d55d3b12d413c71eef1c)
- **zh**: Update zh.json (#557) | [b743467](b743467bca643e66642bdbec69d6c8942d624d08)

## [2.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.1.0) - 2022-01-19
### Bug Fixes

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

## [2.0.1](https://github.com/mainsail-crew/mainsail/releases/tag/v2.0.1) - 2021-09-08
### Documentation

- Update screenshot to v2.0.0 | [b8c93bd](b8c93bdb0f15bef589c1122ca8c427838b792563)
- Multi webcam documentation (#343) | [3e4c73e](3e4c73e381907896c63ae27b4ea406f7eaacf020)

### Features

- **console**: Autofocus input field after click on a command | [44c43a6](44c43a6fb5cad777b7ebd889d408547aa2142cfe)
- Gcodeviewer (#322) | [673fd9f](673fd9f8798fbb9325c40a49547551ae5bc1c695)

## [2.0.0](https://github.com/mainsail-crew/mainsail/releases/tag/v2.0.0) - 2021-08-26
### Documentation

- Add .svg as valid background extension (#285) | [e10fd11](e10fd11acd8b9faf9a3ac3fff485471cae9bc36c)
- Add home and temp check to PAUSE and RESUME (#288) | [cc292f0](cc292f090e558884c2dc3f4eed6a54b177165527)
- Add voron toolhead and cyperpunk communtiy themes and a few improvements of how screenshots get loaded. (#298) | [f929610](f929610bade58ebe4b3340a1072527423d306502)
- Fix typo | [cb874c1](cb874c1918f47f79441bd80decaa272fe8bae40f)
- Added nvm node install for standalone dev env (#325) | [65d23b3](65d23b3ded7d33495a6e11107b9410e2540baf43)

### Features

- **editor**: Add JSON syntax highlighting | [00caf8a](00caf8a655bc3ceccf4362d71fabeb92ec71ac1c)
- Add SVG support for sidebar & main background | [9f2a541](9f2a54100b2c43f8c4a7f5f370e63029cdc37dc8)
- Restart webcamd by webcam*.txt files | [dff099c](dff099c5aa84aba452a26d3d230f00940be1d3df)
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

## [1.6.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.6.0) - 2021-05-18
### Documentation

- A simple recommendation for remote access (#277) | [a0a3aa7](a0a3aa79ac894bee65b3c6941b75c1b09987ec56)
- Stylesheets & escaping gcode (#279) | [598a7fe](598a7fe94fac96ecd7f112e7000517c86c7e6d59)

### Features

- Delete directory with content in g-code files | [025921e](025921e84a8f9a8c74aefd08921ab0b1ecad6ae7)
- Delete directory with content in config files panel | [3df44b0](3df44b05e27a875cb326717256db3f9c1949d4ab)
- Limit requested_speed wiht current max_velocity | [d578c91](d578c9105c59358dc5b2cb493ffa56f597225775)
- Display printername in SelectPrinterDialog.vue | [365ed2c](365ed2cda7809bb4332904dac2a429bc9cd2e42a)
- Display filament weight metadata in gcode-files list | [5e09f52](5e09f52a791aee9b90e1481928c4bbcf71ea7975)
- Store webcam settings in printer farm | [8a66899](8a6689983765a35d6298467160fb31dc8cb3397e)
- Multiple custom console filters | [b49c574](b49c57405cf61e7513a6b3922f60f3c4115fd63d)
- Rename directory in ConfigFilesPanel.vue | [f6679ef](f6679effd99320ffa8f57fd89e87889ee3a9ca22)
- Add FR to i18n | [abb19a4](abb19a4ac99c184902d9af8d2d67d954a9cd14cb)
- Add filament_motion_sensors | [1919aa6](1919aa6921c56464bbf33c9d62e2ff026ff1632d)
- Add UV4L-MJPEG webcam support | [97c06c3](97c06c30611b7105c31cfa7a00fee8644e3ff369)

## [1.5.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.5.0) - 2021-04-13
### Documentation

- Fix theme list | [133bd55](133bd5598b44484ed68df2949724015063e1968b)
- Add Localization to development docs | [8af31e5](8af31e5f366660783d759ede5eb1ec8a8f6bb60a)
- Fix localization guide | [bab3680](bab3680bc061bb7ff0df5fc0b3bc36d0c43d18cc)
- Add credits (#263) | [263b2d2](263b2d245ce76545278501fa0a74d4e9b9f13e05)

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
- Grid view for multi webcam | [88afe07](88afe071e1313e46c3dc14ab69bcf7ca949b0598)
- Add webcam support to printer farm | [c17951b](c17951b53d3de733161076e379e9f83a4cd64ab9)
- Add M117 output to status panel in standby mode | [b2a953f](b2a953f79a6efdf041f3057c53a453df507535a8)
- Add "Busy"-State, if the printer is in "standby" and execute some commands | [336c82a](336c82ad558cdd45ea20eeb0cf6e965eceeef4b6)
- Redesign status panel | [3da9dd2](3da9dd22b09334c44a36116244fe10c0acee4733)
- Send an api e-stop instead of M112 gcode | [fe05d5c](fe05d5c489b613cdac7738c29ea9c5ad538d4aaf)
- Display full version number of up-to-date components in the update manager | [84130f2](84130f2891a564148ffcb6089f414b9cd20e736d)
- Add state avg to heaters and temperature_fans in ToolsPanel.vue | [86d45b8](86d45b850716389d3ce4bcfd66fe99f4c16613d7)

## [1.4.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.4.0) - 2021-03-09
### Features

- Add tacho value to miscellaneous fans and temperature_fans | [3c7dc54](3c7dc54beac38f9e5b39d245337c1785271c37cf)
- Display bed_mesh variance and make profile name clickable | [ab6e0c0](ab6e0c07dc96f4fe667a69b592e73fa1b9ad14d5)
- Display power/speed axis in tempchart only with a enabled dataset | [1854c04](1854c04d7a0560415673edb65bf22c20d1afb17d)
- Add info icon to clickable update logs | [2bf8f8e](2bf8f8e8e2d939c567c7dcd1a375d0a555098c64)
- Add .nc to valid gcode extensions | [fed5956](fed595650033cc03397eb79a2b65a0858c691835)
- Add option to enable cancel_print button permanently | [0825d85](0825d8500095ac59db6385ff7b9cad4481a1d88b)

## [1.3.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.3.0) - 2021-02-27
### Documentation

- Update manager config in manual setup | [5f06da4](5f06da45cfcd34c32eec977122e833e7265e8bbc)
- Add custom.css example | [aaf50a4](aaf50a403df74f6b5255a314955deaa111353642)
- Custom.css slight reformat | [2634b37](2634b37755abe48d183925a1524c36591a3247ab)
- Theme warning fix | [85bd527](85bd5279f55857892e6e74eaccaac1e6388d42a7)
- Add different message styles | [80ded1b](80ded1b9ffbdbec8f2ebbd835396bb1e07e87a77)

### Features

- Customizeable tempchart length (moonraker: temperature_store_size) | [7e48b08](7e48b08f8118aeffdc589e16dd2567296595658d)
- Add configable chart rendering intervals | [2db574e](2db574effd22d545b40d5c74a2e35a0148f1a020)
- Save last setting of ExtruderPanel.vue in .mainsail.json | [389c162](389c16287863044c8d4bdbe6b97da2b88a3fa8c8)
- Commit dialog for upgradeable components | [f2ea6c0](f2ea6c039f42f6df3fb91a020b13203ff348a611)

## [1.2.0](https://github.com/mainsail-crew/mainsail/releases/tag/v1.2.0) - 2021-02-09
### Features

- Disable power devices with attribute "locked_while_printing" in moonraker while printing | [aeb6ae1](aeb6ae1ec97ef3c0899a857937d74f9f70ee5068)
- Process notify_klippy_shutdown from moonraker | [42071ae](42071ae4228871cdcb4dc92f784d690714812aab)
- Add update notification | [8db3725](8db37259e1b09b834300d8f516152131f8b4ec3b)
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
- Add zoom in tempchart | [4a58f0c](4a58f0c3e2049b8391dfaf0ae61076b6a10b45a1)
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
- Hide mainsail in the update manager in remoteMode | [747722e](747722ec2c7a1c7902b595a3ed98d6df832def01)
- Show klipper & moonraker branch on hover | [2b08e34](2b08e34ba762ef26259c6bcf15d68fda5a507175)
- Add detached state in update manager | [e3607c8](e3607c8f3dd3b049d821abb2ad4b0c17d19ac67f)
- Add output_pin to PeripheriePanel.vue (fan panel before) | [02f9f9a](02f9f9a1d46d1c335c7a846190e3e1ebcf325c78)
- Add clear print stats button in complete state | [93c952c](93c952cabbe08a1ce96892c10c0e19885effdcc4)
- Display reprint & clear print button in print_state error | [31b4d4c](31b4d4cb3d606360d7dfcaff284c20446cb4ab05)
- Add requested speed to StatusPanel.vue during print | [b38b052](b38b052004bd5c959c53df1e174801a50ba370ee)
- Add klipper config references link in editor | [7164dd7](7164dd7c3cfc9067f8a7aac8c389f25f804dad9a)
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
- Add multi file upload in gcode-files & config-files | [e44e3bc](e44e3bc540e8b48353437e7b6252af3b4bba6302)

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
- New estimate time calculation | [e9179e5](e9179e5bcdf9799263a53bacac3e43eccdd07e01)
- Save countPerPage from gcode files & config files in gui.json | [ebaab63](ebaab6324daa37da7c28f399b67048febbb7bb4d)
- Update PowerControlPanel.vue > new moonraker version of power plugin | [f26aff2](f26aff20859cabad4dd83be96b23778ce430e3e0)
- Dynamic temperature-sensor icons + header minimize from temperature panel | [8f363ec](8f363ec1c1447a8965d9a170793a0b34b9cd14c7)
- Redesign panel headers | [cb60251](cb602518f078bf0d90c09452f8014487b7b5b35f)

## [0.2.6](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.6) - 2020-10-27
### Features

- Modify dashboard console for more message space | [91f2e9b](91f2e9b6d8199ebc3d1df120bffcbe02a501828b)

## [0.2.5](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.5) - 2020-10-24
### Features

- Rework the StatusPanel.vue | [f35cf70](f35cf70301f119e39d53b0649ff6a02dd6da2f41)

## [0.2.3](https://github.com/mainsail-crew/mainsail/releases/tag/v0.2.3) - 2020-10-15
### Features

- Add "edit file" in context menu of configfiles | [5cbed10](5cbed10d441a78dc2a6a36218534cd5610d0a6a3)
- Allows flipping the webcam horizontally and vertically | [b0b2583](b0b25839caa3ae99a83383cec7d1a320285a79ff)
- Add slicer version in g-codes files | [76a93cc](76a93ccb45c16c5e4933f8185ebb1466ca312db7)
- Ensures app bar doesn't scroll off page | [8aef278](8aef278a0339869a308c13bb9533a6515e36dbc0)
- SAVE_CONFIG button, if klipper needs a "SAVE_CONFIG" | [0977cb3](0977cb39c6b340e456a9483174557d8735cda114)
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

- Add config editor | [29d5b81](29d5b81b470f0f54bc98bfd051658d3a48df91ba)

## [0.1.1](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.1) - 2020-08-01
### Features

- Fine babystepping (0.01 steps) | [37f1ffb](37f1ffb04b2da6c2a1bfcd1f63119610b42a791b)
- Add Z_TILT in ControlPanel.vue | [75d6cce](75d6cce540441dc5aa5a73b3db8b5af4f1f6a262)
- Rename "Host restart" to "Host reboot" | [6766a26](6766a266e80c2b2f330644c13df6b853a0a8976d)

## [0.1.0](https://github.com/mainsail-crew/mainsail/releases/tag/v0.1.0) - 2020-07-26
### Features

- If Filament used > 1000mm -> convert to m | [b4ee662](b4ee662a4f280886961f17d3db507972d4a2247a)
- Babystepping, switch between idle interface & printing interface, first tests with PS thumbnails | [1e61749](1e617491755ca9af19afe884ab679fe3b119b247)
- Show temperature_probe on dashboard | [5795fe4](5795fe45d133771e78e3dc9e12344e0350969068)
- File manager -> show/browse directories | [c71bc47](c71bc47ab81c461073b126647607efab8719aa76)
- File manager -> create/remove directores | [44a381c](44a381c243e1241d0f9568129e241b32904a8f80)
- Rename files & directories in g-code files | [98a7292](98a7292b7b5a9d789cef57a5d6f3b4172372022d)
- Move files in filemanager | [2636311](2636311cc1d9daa593581ea555cad12c00838dbf)
- Update package.json | [458a6e8](458a6e859217ecd8d20b458ff0e1fe023e6cb733)
- Warning tool input if temp too high or too low | [be7abdf](be7abdf2542523d02331f174502b93121be7e682)

## [0.0.12](https://github.com/mainsail-crew/mainsail/releases/tag/v0.0.12) - 2020-05-11
### Features

- Temperature_sensor min/max temp by hover | [86595ab](86595ab70b69a1b8c8d2e5a6d6c4cfb706c584fe)
- Select value by focus heater input field | [9e52664](9e5266425c6f3fa5cbc6c320ff31381c0b172ae8)

