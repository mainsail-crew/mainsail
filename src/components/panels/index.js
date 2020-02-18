import Vue from 'vue'

import StatusPanel from './StatusPanel.vue'
import ToolsPanel from './ToolsPanel.vue'

Vue.component('status-panel', StatusPanel);
Vue.component('tools-panel', ToolsPanel);

export default {
    StatusPanel,
}