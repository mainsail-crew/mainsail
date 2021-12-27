<style lang="scss" scoped>
.btnHomeAxis {
    width: 36px;
    min-width: 36px !important;
}

.btnMinWidthAuto {
    min-width: auto !important;
}

.steps {
    width: 100%;
    > div {
        width: 100%;
        display: flex;
        > button {
            flex-grow: 1;
        }
    }
}
</style>

<template>
    <panel
        v-if="klipperReadyForGui && ['standby', 'paused', 'complete', 'cancelled', 'error'].includes(printer_state)"
        icon="mdi-gamepad"
        :title="$t('Panels.ControlPanel.Headline')"
        :collapsible="true"
        card-class="control-panel"
    >
        <v-container>
            <control-panel-cross-control v-if="controlStyle === 'cross'"></control-panel-cross-control>
            <control-panel-circle-control v-else-if="controlStyle === 'circle'"></control-panel-circle-control>
            <control-panel-bars-control v-else></control-panel-bars-control>
            <control-panel-extruder v-if="existsExtruder"></control-panel-extruder>
        </v-container>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ControlPanelExtruder from '@/components/panels/ControlPanelExtruder.vue'
import ControlPanelCrossControl from '@/components/panels/ControlPanelCrossControl.vue'
import ControlPanelBarsControl from '@/components/panels/ControlPanelBarsControl.vue'
import ControlPanelCircleControl from '@/components/panels/ControlPanelCircleControl.vue'
import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {
        Panel,
        ControlPanelCircleControl, ControlPanelBarsControl, ControlPanelCrossControl, ControlPanelExtruder}
})
export default class ControlPanel extends Mixins(BaseMixin) {
    get controlStyle() {
        return this.$store.state.gui.control.style ?? 'bars'
    }

    get existsExtruder() {
        return 'extruder' in this.$store.state.printer
    }

    get boolExtrudePossible() {
        return this.$store.getters['printer/getExtrudePossible']
    }
}
</script>
