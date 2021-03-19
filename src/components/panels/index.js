import Vue from 'vue'

import StatusPanel from './StatusPanel.vue'
import KlippyStatePanel from './KlippyStatePanel.vue'
import MinSettingsPanel from './MinSettingsPanel.vue'
import MoonrakerFailedComponentsPanel from './MoonrakerFailedComponentsPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import ControlPanel from "./ControlPanel";
import ZOffsetPanel from "./ZOffsetPanel";
import Miscellaneous from "./MiscellaneousPanel";
import WebcamPanel from "./WebcamPanel";
import MiniconsolePanel from "./MiniconsolePanel";
import Settings from "./Settings/";
import PowerControlPanel from "./PowerControlPanel.vue";
import HistoryListPanel from "./HistoryListPanel.vue";

Vue.component('status-panel', StatusPanel);
Vue.component('klippy-state-panel', KlippyStatePanel);
Vue.component('min-settings-panel', MinSettingsPanel);
Vue.component('moonraker-failed-components-panel', MoonrakerFailedComponentsPanel);
Vue.component('tools-panel', ToolsPanel);
Vue.component('control-panel', ControlPanel);
Vue.component('zoffset-panel', ZOffsetPanel);
Vue.component('miscellaneous-panel', Miscellaneous);
Vue.component('webcam-panel', WebcamPanel);
Vue.component('miniconsole-panel', MiniconsolePanel);
Vue.component('power-control-panel', PowerControlPanel);
Vue.component('history-list-panel', HistoryListPanel);

export default {
    Settings
}