import Vue from 'vue'

import StatusPanel from './StatusPanel.vue'
import KlippyStatePanel from './KlippyStatePanel.vue'
import MinSettingsPanel from './MinSettingsPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import ControlPanel from "./ControlPanel";
import ExtruderPanel from "./ExtruderPanel";
import ZOffsetPanel from "./ZOffsetPanel";
import Peripherie from "./PeripheriePanel";
import WebcamPanel from "./WebcamPanel";
import MiniconsolePanel from "./MiniconsolePanel";
import Settings from "./Settings/";
import PowerControlPanel from "./PowerControlPanel.vue";

Vue.component('status-panel', StatusPanel);
Vue.component('klippy-state-panel', KlippyStatePanel);
Vue.component('min-settings-panel', MinSettingsPanel);
Vue.component('tools-panel', ToolsPanel);
Vue.component('control-panel', ControlPanel);
Vue.component('extruder-panel', ExtruderPanel);
Vue.component('zoffset-panel', ZOffsetPanel);
Vue.component('peripherie-panel', Peripherie);
Vue.component('webcam-panel', WebcamPanel);
Vue.component('miniconsole-panel', MiniconsolePanel);
Vue.component('power-control-panel', PowerControlPanel);

export default {
    Settings
}