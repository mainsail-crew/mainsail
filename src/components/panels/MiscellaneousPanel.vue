<style scoped>
    .icon-rotate {
        animation-name: spin;
        animation-duration: 1000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        } to {
              transform: rotate(-360deg);
          }
    }
</style>

<template>
    <div v-if="klipperState === 'ready'">
        <v-card class="mb-6" v-if="['printing', 'paused'].includes(printer_state) || true">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon class="mdi mdi-printer-3d" left></v-icon>{{ $t("Panels.MiscellaneousPanel.PrintSettings") }}</span>
                </v-toolbar-title>
            </v-toolbar>
            <tool-slider :label="$t('Panels.MiscellaneousPanel.SpeedFactor')" :target="speed_factor" :max="200" :multi="100" :step="5" :dynamic-range="true" command="M220" attribute-name="S" ></tool-slider>
            <template v-if="existsExtruder">
                <v-divider></v-divider>
                <tool-slider :label="$t('Panels.MiscellaneousPanel.ExtrusionFactor')" :target="extrude_factor" :max="200" :multi="100" :step="1" command="M221" attribute-name="S" ></tool-slider>
            </template>
        </v-card>
        <v-card class="mb-6" v-if="miscellaneous.length || filamentSensors.length">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-dip-switch</v-icon>{{ $t("Panels.MiscellaneousPanel.Miscellaneous") }}</span>
                </v-toolbar-title>
            </v-toolbar>
            <div v-for="(object, index) of miscellaneous" v-bind:key="index">
                <v-divider v-if="index"></v-divider>
                <miscellaneous-slider
                    :name="object.name"
                    :type="object.type"
                    :target="object.power"
                    :rpm="object.rpm"
                    :controllable="object.controllable"
                    :pwm="object.pwm"
                    :off_below="object.off_below"
                    :max="object.max_power"
                    :multi="parseInt(object.scale)"
                ></miscellaneous-slider>
            </div>
            <div v-for="(sensor, index) of filamentSensors" v-bind:key="'sensor_'+index">
                <v-divider v-if="index || miscellaneous.length"></v-divider>
                <FilamentSensor
                    :name="sensor.name"
                    :enabled="sensor.enabled"
                    :filament_detected="sensor.filament_detected"
                ></FilamentSensor>
            </div>
        </v-card>
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import MiscellaneousSlider from "@/components/inputs/MiscellaneousSlider.vue";
import ToolSlider from "@/components/inputs/ToolSlider.vue";
import FilamentSensor from "@/components/inputs/FilamentSensor.vue";
@Component({
    components: {FilamentSensor, ToolSlider, MiscellaneousSlider}
})
export default class MiscellaneousPanel extends Mixins(BaseMixin) {

    get extrude_factor() {
        return this.$store.state.printer?.gcode_move?.extrude_factor ?? 1
    }

    get speed_factor() {
        return this.$store.state.printer?.gcode_move?.speed_factor ?? 1
    }

    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }

    get existsExtruder() {
        return 'extruder' in this.$store.state.printer
    }
}
</script>
