<template>
    <panel
        v-if="klipperReadyForGui && ['standby', 'paused', 'complete', 'cancelled', 'error'].includes(printer_state)"
        :icon="mdiGamepad"
        :title="$t('Panels.ControlPanel.Headline').toString()"
        :collapsible="true"
        card-class="control-panel">
        <v-container>
            <control-panel-cross-control v-if="controlStyle === 'cross'"></control-panel-cross-control>
            <control-panel-circle-control v-else-if="controlStyle === 'circle'"></control-panel-circle-control>
            <control-panel-bars-control v-else></control-panel-bars-control>
        </v-container>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ControlPanelCrossControl from '@/components/panels/ControlPanelCrossControl.vue'
import ControlPanelBarsControl from '@/components/panels/ControlPanelBarsControl.vue'
import ControlPanelCircleControl from '@/components/panels/ControlPanelCircleControl.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiGamepad } from '@mdi/js'
@Component({
    components: {
        Panel,
        ControlPanelCircleControl,
        ControlPanelBarsControl,
        ControlPanelCrossControl,
    },
})
export default class ControlPanel extends Mixins(BaseMixin) {
    mdiGamepad = mdiGamepad

    get controlStyle() {
        return this.$store.state.gui.control.style ?? 'bars'
    }
}
</script>
