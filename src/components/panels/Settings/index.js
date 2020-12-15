import Vue from 'vue'

import GeneralPanel from './GeneralPanel'
import WebcamPanel from './WebcamPanel'
import ScalePanel from './ScalePanel'
import DashboardPanel from "./DashboardPanel";
import MacrosPanel from "./MacrosPanel";
import EndstopPanel from "./EndstopPanel";
import LimitsPanel from "./LimitsPanel";
import ConfigFilesPanel from "./ConfigFilesPanel";
import RunoutPanel from "./RunoutPanel";
import LogfilesPanel from "./LogfilesPanel";
import PreheatPanel from "./PreheatPanel";
import ModuleUrlPanel from "./ModuleUrlPanel";
import NeopixelCenterPanel from "./NeopixelCenterPanel";

Vue.component('settings-general-panel', GeneralPanel);
Vue.component('settings-webcam-panel', WebcamPanel);
Vue.component('settings-scale-panel', ScalePanel);
Vue.component('settings-dashboard-panel', DashboardPanel);
Vue.component('settings-macros-panel', MacrosPanel);
Vue.component('settings-endstop-panel', EndstopPanel);
Vue.component('settings-limits-panel', LimitsPanel);
Vue.component('settings-runout-panel', RunoutPanel);
Vue.component('settings-logfiles-panel', LogfilesPanel);
Vue.component('settings-preheat-panel',PreheatPanel)
Vue.component('settings-config-files-panel', ConfigFilesPanel);
Vue.component('settings-module-url', ModuleUrlPanel);
Vue.component('settings-neopixelcenter', NeopixelCenterPanel);

export default {

}