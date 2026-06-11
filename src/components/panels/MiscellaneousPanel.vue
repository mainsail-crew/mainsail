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
            <miscellaneous-light :type="light.type" :name="light.name" />
        </div>
        <div v-for="(sensor, index) of filamentSensors" :key="'sensor_' + index">
            <v-divider v-if="index || miscellaneous.length || lights.length" />
            <filament-sensor
                :type="sensor.type"
                :name="sensor.name"
                :enabled="sensor.enabled"
                :filament_detected="sensor.filament_detected"
                :filament_diameter="sensor.filament_diameter" />
        </div>
        <div v-for="(sensor, index) of miscellaneousSensors" :key="'miscellaneous_sensor_' + index">
            <v-divider v-if="index || miscellaneous.length || lights.length || filamentSensors.length" />
            <miscellaneous-sensor :name="sensor.name" :value="sensor.value" :unit="sensor.unit" />
        </div>
        <div v-for="(sensor, index) of moonrakerSensors" :key="'moonraker_sensor_' + index">
            <v-divider
                v-if="
                    index ||
                    miscellaneous.length ||
                    lights.length ||
                    filamentSensors.length ||
                    miscellaneousSensors.length
                " />
            <moonraker-sensor :name="sensor" />
        </div>
    </panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useMiscellaneous } from '@/composables/useMiscellaneous'
import MiscellaneousSlider from '@/components/inputs/MiscellaneousSlider.vue'
import FilamentSensor from '@/components/inputs/FilamentSensor.vue'
import MiscellaneousLight from '@/components/panels/Miscellaneous/MiscellaneousLight.vue'
import MiscellaneousSensor from '@/components/panels/Miscellaneous/MiscellaneousSensor.vue'
import MoonrakerSensor from '@/components/panels/Miscellaneous/MoonrakerSensor.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiDipSwitch } from '@mdi/js'

const { klipperReadyForGui } = useBase()
const { lights } = useMiscellaneous()

const store = useStore()

const filamentSensors = computed(() =>
    store.getters['printer/getFilamentSensors'] ?? []
)

const miscellaneous = computed(() =>
    store.getters['printer/getMiscellaneous'] ?? []
)

const miscellaneousSensors = computed(() =>
    store.getters['printer/getMiscellaneousSensors'] ?? []
)

const moonrakerSensors = computed(() =>
    store.getters['server/sensor/getSensors'] ?? []
)

const showMiscellaneousPanel = computed(() =>
    klipperReadyForGui.value && (
        miscellaneous.value.length ||
        filamentSensors.value.length ||
        lights.value.length
    )
)
</script>
