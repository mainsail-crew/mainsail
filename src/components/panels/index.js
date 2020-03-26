import Vue from 'vue'

import StatusPanel from './StatusPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import TempchartPanel from './TempchartPanel.vue'
import ControlPanel from "./ControlPanel";
import Peripherie from "./PeripheriePanel";
import MacrosPanel from "./MacrosPanel";

Vue.component('status-panel', StatusPanel);
Vue.component('tools-panel', ToolsPanel);
Vue.component('tempchart-panel', TempchartPanel);
Vue.component('control-panel', ControlPanel);
Vue.component('peripherie-panel', Peripherie);
Vue.component('macros-panel', MacrosPanel);

export default {
    StatusPanel,
}