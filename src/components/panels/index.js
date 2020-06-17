import Vue from 'vue'

import StatusPanel from './StatusPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import TempchartPanel from './TempchartPanel.vue'
import ControlPanel from "./ControlPanel";
import ExtruderPanel from "./ExtruderPanel";
import ZOffsetPanel from "./ZOffsetPanel";
import Peripherie from "./PeripheriePanel";
import WebcamPanel from "./WebcamPanel";
import MiniconsolePanel from "./MiniconsolePanel";
import Settings from "./Settings/";

Vue.component('status-panel', StatusPanel);
Vue.component('tools-panel', ToolsPanel);
Vue.component('tempchart-panel', TempchartPanel);
Vue.component('control-panel', ControlPanel);
Vue.component('extruder-panel', ExtruderPanel);
Vue.component('zoffset-panel', ZOffsetPanel);
Vue.component('peripherie-panel', Peripherie);
Vue.component('webcam-panel', WebcamPanel);
Vue.component('miniconsole-panel', MiniconsolePanel);

export default {
    Settings
}