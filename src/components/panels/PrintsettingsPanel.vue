<style scoped>

</style>

<template>
    <v-card class="mb-6" v-if="klipperReadyForGui && ['printing', 'paused'].includes(printer_state)">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon class="mdi mdi-printer-3d" left></v-icon>{{ $t("Panels.PrintsettingsPanel.Headline") }}</span>
            </v-toolbar-title>
        </v-toolbar>
        <tool-slider :label="$t('Panels.PrintsettingsPanel.SpeedFactor')" :target="speed_factor" :max="200" :multi="100" :step="5" :dynamic-range="true" command="M220" attribute-name="S" ></tool-slider>
        <template v-if="existsExtruder">
            <v-divider></v-divider>
            <tool-slider :label="$t('Panels.PrintsettingsPanel.ExtrusionFactor')" :target="extrude_factor" :max="200" :multi="100" :step="1" command="M221" attribute-name="S" ></tool-slider>
        </template>
    </v-card>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import ToolSlider from "@/components/inputs/ToolSlider.vue";
@Component({
    components: {ToolSlider}
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
