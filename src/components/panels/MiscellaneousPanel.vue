<style scoped></style>

<template>
    <panel
        v-if="klipperReadyForGui && (miscellaneous.length || filamentSensors.length || weightScale.length)"
        :icon="mdiDipSwitch"
        :title="$t('Panels.MiscellaneousPanel.Headline')"
        :collapsible="true"
        card-class="miscellaneous-panel">
        <div v-for="(object, index) of miscellaneous" :key="index">
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
                :multi="parseInt(object.scale)"></miscellaneous-slider>
        </div>
        <div v-for="(sensor, index) of filamentSensors" :key="'sensor_' + index">
            <v-divider v-if="index || miscellaneous.length"></v-divider>
            <filament-sensor
                :name="sensor.name"
                :enabled="sensor.enabled"
                :filament_detected="sensor.filament_detected"></filament-sensor>
        </div>
        <div v-for="(sensor, index) of weightScales" :key="'sensor_' + index">
            <v-divider v-if="index"></v-divider>
            <weight-scale :name="sensor.name" :calibrated="sensor.calibrated" :weight="sensor.weight"></weight-scale>
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MiscellaneousSlider from '@/components/inputs/MiscellaneousSlider.vue'
import FilamentSensor from '@/components/inputs/FilamentSensor.vue'
import WeightScale from '@/components/inputs/WeightScale.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiDipSwitch } from '@mdi/js'
@Component({
    components: { Panel, FilamentSensor, MiscellaneousSlider },
})
export default class MiscellaneousPanel extends Mixins(BaseMixin) {
    mdiDipSwitch = mdiDipSwitch

    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }

    get weightScales() {
        return this.$store.getters['printer/getWeightScales'] ?? []
    }
}
</script>
