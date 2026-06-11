<template>
    <responsive
        :breakpoints="{
            mobile: (el) => el.width <= 395,
        }">
        <template #default="{ el }">
            <v-table class="temperature-panel-table">
                <thead>
                    <tr>
                        <th class="icon">&nbsp;</th>
                        <th class="name">{{ $t('Panels.TemperaturePanel.Name') }}</th>
                        <th v-if="!el.is.mobile" class="state">
                            {{ $t('Panels.TemperaturePanel.State') }}
                        </th>
                        <th class="current">
                            {{ $t('Panels.TemperaturePanel.Current') }}
                        </th>
                        <th class="target">
                            {{ $t('Panels.TemperaturePanel.Target') }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <temperature-panel-list-item
                        v-for="objectName in heaterObjects"
                        :key="objectName"
                        :object-name="objectName"
                        :input-digits="inputFieldDigits"
                        :is-responsive-mobile="el.is.mobile ?? false" />
                    <temperature-panel-list-item-nevermore
                        v-for="objectName in nevermoreObjects"
                        :key="objectName"
                        :object-name="objectName"
                        :is-responsive-mobile="el.is.mobile ?? false" />
                    <temperature-panel-list-item
                        v-for="objectName in temperature_sensors"
                        :key="objectName"
                        :object-name="objectName"
                        :is-responsive-mobile="el.is.mobile ?? false" />
                    <template v-if="!hideMonitors">
                        <temperature-panel-list-item
                            v-for="objectName in monitors"
                            :key="objectName"
                            :object-name="objectName"
                            :is-responsive-mobile="el.is.mobile ?? false" />
                    </template>
                </tbody>
            </v-table>
        </template>
    </responsive>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import Responsive from '@/components/ui/Responsive.vue'

const store = useStore()

const available_heaters = computed(() => store.state.printer?.heaters?.available_heaters ?? [])
const available_sensors = computed(() => store.state.printer?.heaters?.available_sensors ?? [])
const available_monitors = computed(() => store.state.printer?.heaters?.available_monitors ?? [])

const settings = computed(() => store.state.printer?.configfile?.settings ?? {})

const hideMcuHostSensors = computed(() => store.state.gui.view.tempchart.hideMcuHostSensors ?? false)
const hideMonitors = computed(() => store.state.gui.view.tempchart.hideMonitors ?? false)

const temperature_fans = computed(() =>
    available_sensors.value
        .filter((name: string) => name.startsWith('temperature_fan') && !name.startsWith('temperature_fan _'))
        .sort(sortObjectName)
)

const monitors = computed(() => available_monitors.value.sort(sortObjectName))

const filteredHeaters = computed(() => filterNamesAndSort(available_heaters.value))

const available_nevermores = computed(() =>
    Object.keys(store.state.printer).filter((name) => name.startsWith('nevermore'))
)

const nevermoreObjects = computed(() => filterNamesAndSort(available_nevermores.value))

const temperature_sensors = computed(() =>
    filterNamesAndSort(available_sensors.value).filter((fullName: string) => {
        if (available_heaters.value.includes(fullName)) return false
        if (temperature_fans.value.includes(fullName)) return false
        if (hideMcuHostSensors.value && checkMcuHostSensor(fullName)) return false
        return true
    })
)

const heaterObjects = computed(() => [...filteredHeaters.value, ...temperature_fans.value])

const maxTemperatureSetting = computed(() =>
    heaterObjects.value.reduce((maxTemp, heaterObject) => {
        const settingObject = settings.value[heaterObject.toLowerCase()] ?? {}
        const maxTempSetting = Number(settingObject.max_temp ?? 0)
        return Math.max(maxTemp, maxTempSetting)
    }, 0)
)

const inputFieldDigits = computed(() => {
    const MIN_INPUT_DIGITS = 3
    const digits = maxTemperatureSetting.value.toString().length
    return Math.max(MIN_INPUT_DIGITS, digits)
})

function checkMcuHostSensor(fullName: string) {
    const settingsObject = settings.value[fullName.toLowerCase()] ?? {}
    const sensor_type = settingsObject.sensor_type ?? ''
    return ['temperature_mcu', 'temperature_host'].includes(sensor_type)
}

function filterNamesAndSort(fullNames: string[]) {
    return fullNames.filter(isVisibleName).sort(sortObjectName)
}

function isVisibleName(fullName: string) {
    return !shortName(fullName).startsWith('_')
}

function sortObjectName(a: string, b: string) {
    const nameA = shortName(a).toUpperCase()
    const nameB = shortName(b).toUpperCase()
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0
}

function shortName(fullName: string) {
    const splits = fullName.split(' ')
    return splits.length == 1 ? splits[0] : splits[1]
}
</script>

<style scoped>
.temperature-panel-table th,
.temperature-panel-table :deep(td) {
    padding-top: 5px !important;
    padding-bottom: 5px !important;
    height: auto !important;
}

.temperature-panel-table :deep(tr):hover {
    background: none !important;
}

.temperature-panel-table :deep(.icon) {
    width: 24px;
    padding-right: 0 !important;
    text-align: center;
}

.temperature-panel-table :deep(.state) {
    width: 100px;
    text-align: right !important;
}

.temperature-panel-table :deep(.current) {
    width: 100px;
    text-align: right !important;
}

.temperature-panel-table :deep(.target) {
    width: 1px;
    white-space: nowrap;
}
</style>
