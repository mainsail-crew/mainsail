<template>
    <panel
        v-if="klipperReadyForGui && ['standby', 'paused', 'complete', 'cancelled', 'error'].includes(printer_state)"
        :icon="mdiGamepad"
        :title="$t('Panels.ToolheadControlPanel.Headline').toString()"
        :collapsible="true"
        card-class="control-panel">
        <v-container>
            <cross-control v-if="controlStyle === 'cross'"></cross-control>
            <circle-control v-else-if="controlStyle === 'circle'"></circle-control>
            <bars-control v-else></bars-control>
        </v-container>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import CrossControl from '@/components/panels/ToolheadControls/CrossControl.vue'
import BarsControl from '@/components/panels/ToolheadControls/BarsControl.vue'
import CircleControl from '@/components/panels/ToolheadControls/CircleControl.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiGamepad } from '@mdi/js'
@Component({
    components: {
        Panel,
        CircleControl,
        BarsControl,
        CrossControl,
    },
})
export default class ToolheadControlPanel extends Mixins(BaseMixin) {
    mdiGamepad = mdiGamepad

    get controlStyle() {
        return this.$store.state.gui.control.style ?? 'bars'
    }
}
</script>
