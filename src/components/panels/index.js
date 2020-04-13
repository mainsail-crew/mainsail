import Vue from 'vue'

import StatusPanel from './StatusPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import TempchartPanel from './TempchartPanel.vue'
import ControlPanel from "./ControlPanel";
import Peripherie from "./PeripheriePanel";
import MacrosPanel from "./MacrosPanel";
import LimitsPanel from "./LimitsPanel";
import WebcamPanel from "./WebcamPanel";
import Settings from "./Settings/";

Vue.component('status-panel', StatusPanel);
Vue.component('tools-panel', ToolsPanel);
Vue.component('tempchart-panel', TempchartPanel);
Vue.component('control-panel', ControlPanel);
Vue.component('peripherie-panel', Peripherie);
Vue.component('macros-panel', MacrosPanel);
Vue.component('limits-panel', LimitsPanel);
Vue.component('webcam-panel', WebcamPanel);

export default {
    Settings
}