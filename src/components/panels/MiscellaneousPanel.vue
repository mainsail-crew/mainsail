<style scoped></style>

<template>
    <panel
        v-if="showMiscellaneousPanel"
        :icon="mdiDipSwitch"
        :title="$t('Panels.MiscellaneousPanel.Headline')"
        :collapsible="true"
        card-class="miscellaneous-panel">
        <div v-for="(object, index) of miscellaneous" :key="index">
            <v-divider v-if="index" />
            <miscellaneous-slider
                :name="object.name"
                :type="object.type"
                :target="object.power"
                :rpm="object.rpm"
                :controllable="object.controllable"
                :pwm="object.pwm"
                :off_below="object.off_below"
                :max="object.max_power"
                :multi="parseInt(object.scale)" />
        </div>
        <div v-for="(light, index) of lights" :key="'light_' + light.name">
            <v-divider v-if="index || miscellaneous.length" />
            <miscellaneous-slider
                v-if="light.type === 'led' && light.colorOrder.length === 1"
                :name="light.name"
                type="led"
                :rpm="null"
                :controllable="true"
                :pwm="true"
                :target="light.singleChannelTarget"
                :color-order="light.colorOrder" />
            <miscellaneous-light v-else :object="light" :root="true" />
        </div>
        <div v-for="(sensor, index) of filamentSensors" :key="'sensor_' + index">
            <v-divider v-if="index || miscellaneous.length || lights.length" />
            <filament-sensor
                :name="sensor.name"
                :enabled="sensor.enabled"
                :filament_detected="sensor.filament_detected" />
        </div>
        <div v-for="(sensor, index) of moonrakerSensors" :key="'moonraker_sensor_' + index">
            <v-divider v-if="index || miscellaneous.length || lights.length || filamentSensors.length" />
            <moonraker-sensor :name="sensor" />
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MiscellaneousSlider from '@/components/inputs/MiscellaneousSlider.vue'
import MiscellaneousLight from '@/components/inputs/MiscellaneousLight.vue'
import FilamentSensor from '@/components/inputs/FilamentSensor.vue'
import MoonrakerSensor from '@/components/panels/Miscellaneous/MoonrakerSensor.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiDipSwitch } from '@mdi/js'
@Component({
    components: { Panel, FilamentSensor, MiscellaneousSlider, MiscellaneousLight, MoonrakerSensor },
})
export default class MiscellaneousPanel extends Mixins(BaseMixin) {
    mdiDipSwitch = mdiDipSwitch

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }

    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }

    get lights() {
        return this.$store.getters['printer/getLights'] ?? []
    }

    get moonrakerSensors() {
        return this.$store.getters['server/sensor/getSensors'] ?? []
    }

    get showMiscellaneousPanel() {
        return (
            this.klipperReadyForGui && (this.miscellaneous.length || this.filamentSensors.length || this.lights.length)
        )
    }
}
</script>
