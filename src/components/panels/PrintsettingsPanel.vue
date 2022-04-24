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
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import { mdiPrinter3d, mdiSpeedometer } from '@mdi/js'

@Component({
    components: {
        Panel,
        ToolSlider,
    },
})
export default class PrintsettingsPanel extends Mixins(BaseMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiSpeedometer = mdiSpeedometer

    get speed_factor() {
        return this.$store.state.printer?.gcode_move?.speed_factor ?? 1
    }
}
</script>
