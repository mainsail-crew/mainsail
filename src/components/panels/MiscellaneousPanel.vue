<style scoped>

</style>

<template>
    <v-card class="mb-6" v-if="klipperReadyForGui && (miscellaneous.length || filamentSensors.length)">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-dip-switch</v-icon>{{ $t("Panels.MiscellaneousPanel.Headline") }}</span>
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
            <filament-sensor
                :name="sensor.name"
                :enabled="sensor.enabled"
                :filament_detected="sensor.filament_detected"
            ></filament-sensor>
        </div>
    </v-card>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import MiscellaneousSlider from "@/components/inputs/MiscellaneousSlider.vue";
import ToolSlider from "@/components/inputs/ToolSlider.vue";
import FilamentSensor from "@/components/inputs/FilamentSensor.vue";
@Component({
    components: {FilamentSensor, MiscellaneousSlider}
})
export default class MiscellaneousPanel extends Mixins(BaseMixin) {
    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }
}
</script>
