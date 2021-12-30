<style scoped>

</style>

<template>
    <panel
        v-if="klipperReadyForGui && ['printing', 'paused'].includes(printer_state)"
        icon="mdi-printer-3d"
        :title="$t('Panels.PrintsettingsPanel.Headline')"
        :collapsible="true"
        card-class="printsettings-panel"
    >
        <tool-slider
            :label="$t('Panels.PrintsettingsPanel.SpeedFactor')"
            icon="mdi-speedometer"
            :target="speed_factor"
            :max="200"
            :multi="100"
            :step="5"
            :dynamic-range="true"
            command="M220"
            attribute-name="S">
        </tool-slider>
        <template v-if="existsExtruder">
            <v-divider></v-divider>
            <tool-slider
                :label="$t('Panels.PrintsettingsPanel.ExtrusionFactor')"
                icon="mdi-printer-3d-nozzle-outline"
                :target="extrude_factor"
                :max="200"
                :multi="100"
                :step="1"
                command="M221"
                attribute-name="S">
            </tool-slider>
        </template>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'

@Component({
    components: {
        Panel,
        ToolSlider
    }
})
export default class PrintsettingsPanel extends Mixins(BaseMixin) {

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
