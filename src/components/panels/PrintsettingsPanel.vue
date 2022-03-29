<style scoped></style>

<template>
    <panel
        v-if="klipperReadyForGui && ['printing', 'paused'].includes(printer_state)"
        :icon="mdiPrinter3d"
        :title="$t('Panels.PrintsettingsPanel.Headline').toString()"
        :collapsible="true"
        card-class="printsettings-panel">
        <tool-slider
            :label="$t('Panels.PrintsettingsPanel.SpeedFactor').toString()"
            :icon="mdiSpeedometer"
            :target="speed_factor"
            :min="1"
            :max="200"
            :multi="100"
            :step="5"
            :dynamic-range="true"
            :has-input-field="true"
            command="M220"
            attribute-name="S"></tool-slider>
        <template v-if="existsExtruder">
            <v-divider></v-divider>
            <tool-slider
                :label="$t('Panels.PrintsettingsPanel.ExtrusionFactor').toString()"
                :icon="mdiPrinter3dNozzleOutline"
                :target="extrude_factor"
                :min="1"
                :max="200"
                :multi="100"
                :step="1"
                :has-input-field="true"
                command="M221"
                attribute-name="S"></tool-slider>
        </template>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import { mdiPrinter3d, mdiPrinter3dNozzleOutline, mdiSpeedometer } from '@mdi/js'

@Component({
    components: {
        Panel,
        ToolSlider,
    },
})
export default class PrintsettingsPanel extends Mixins(BaseMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiSpeedometer = mdiSpeedometer
    mdiPrinter3dNozzleOutline = mdiPrinter3dNozzleOutline

    get extrude_factor() {
        return this.$store.state.printer?.gcode_move?.extrude_factor ?? 1
    }

    get speed_factor() {
        return this.$store.state.printer?.gcode_move?.speed_factor ?? 1
    }

    get existsExtruder() {
        return 'extruder' in this.$store.state.printer
    }
}
</script>
