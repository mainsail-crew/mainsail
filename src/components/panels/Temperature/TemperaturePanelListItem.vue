<template>
    <tr v-longpress:600="openContextMenu" @contextmenu.prevent="openContextMenu($event)">
        <td class="icon">
            <v-icon :color="iconColor" :class="iconClass" tabindex="-1" @click="openEditDialog">
                {{ icon }}
            </v-icon>
        </td>
        <td class="name">
            <span class="cursor-pointer" @click="openEditDialog">{{ formatName }}</span>
        </td>
        <td v-if="!isResponsiveMobile" class="state">
            <v-tooltip v-if="state !== null" top>
                <template #activator="{ props }">
                    <div v-bind="props">{{ formatState }}</div>
                </template>
                <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ avgState }} %</span>
            </v-tooltip>
        </td>
        <td class="current">
            <v-tooltip top :disabled="!(measured_min_temp !== null || measured_max_temp !== null)">
                <template #activator="{ props }">
                    <span style="cursor: default" v-bind="props">
                        {{ formatTemperature }}
                    </span>
                </template>
                <span>
                    {{ $t('Panels.TemperaturePanel.Max') }}: {{ measured_max_temp }}°C
                    <br />
                    {{ $t('Panels.TemperaturePanel.Min') }}: {{ measured_min_temp }}°C
                </span>
            </v-tooltip>
            <div v-if="rpm !== null">
                <small :class="rpmClass">{{ rpm }} RPM</small>
            </div>
            <temperature-panel-list-item-additional-sensor
                v-if="additionalSensorName"
                :object-name="objectName"
                :additional-object-name="additionalSensorName" />
        </td>
        <td class="target">
            <temperature-input
                v-if="command !== null"
                :name="name"
                :target="target"
                :presets="presets"
                :min_temp="min_temp"
                :max_temp="max_temp"
                :command="command"
                :input-digits="inputDigits"
                :attribute-name="commandAttributeName" />
        </td>
        <temperature-panel-list-item-edit
            v-model="showEditDialog"
            :object-name="objectName"
            :name="name"
            :format-name="formatName"
            :additional-sensor-name="additionalSensorName"
            :icon="icon"
            :color="color" />
        <v-menu v-model="showContextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item v-if="isHeater" :disabled="!isHeaterActive" @click="turnOffHeater">
                    <v-icon left>{{ mdiSnowflake }}</v-icon>
                    {{ $t('Panels.TemperaturePanel.TurnHeaterOff') }}
                </v-list-item>
                <v-list-item @click="openEditDialog">
                    <v-icon left>{{ mdiCog }}</v-icon>
                    {{ $t('Panels.TemperaturePanel.Settings') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </tr>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import type { LongpressEvent } from '@/directives/longpress'
import { convertName } from '@/plugins/helpers'
import {
    mdiCog,
    mdiFan,
    mdiFire,
    mdiMemory,
    mdiPrinter3dNozzle,
    mdiPrinter3dNozzleAlert,
    mdiRadiator,
    mdiRadiatorDisabled,
    mdiSnowflake,
    mdiThermometer,
} from '@mdi/js'
import { additionalSensors, opacityHeaterActive, opacityHeaterInactive } from '@/store/variables'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

const props = defineProps<{
    objectName: string
    isResponsiveMobile: boolean
    inputDigits?: number
}>()

const store = useStore()
const socket = useSocket()

const mdiCog = mdiCog
const mdiSnowflake = mdiSnowflake

const showEditDialog = ref(false)
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

const printerObject = computed(() => {
    if (!(props.objectName in store.state.printer)) return {}
    return store.state.printer[props.objectName]
})

const printerObjectSettings = computed(() => {
    const lowerCaseObjectName = props.objectName.toLowerCase()
    if (!(lowerCaseObjectName in (store.state.printer?.configfile?.settings ?? {}))) return {}
    return store.state.printer?.configfile?.settings[lowerCaseObjectName]
})

const name = computed(() => {
    const splits = props.objectName.split(' ')
    if (splits.length === 1) return props.objectName
    return splits[1]
})

const formatName = computed(() => convertName(name.value))

const icon = computed(() => {
    if (props.objectName.startsWith('extruder')) {
        if (printerObject.value.can_extrude ?? false) return mdiPrinter3dNozzle
        return mdiPrinter3dNozzleAlert
    }
    if (props.objectName === 'heater_bed') {
        if (
            (temperature.value !== null && temperature.value > 50) ||
            (target.value && temperature.value && temperature.value > target.value - 5)
        )
            return mdiRadiator
        return mdiRadiatorDisabled
    }
    if (props.objectName.startsWith('heater_generic')) return mdiFire
    if (props.objectName.startsWith('tmc')) return mdiMemory
    if (isFan.value) return mdiFan
    return mdiThermometer
})

const color = computed(() =>
    store.getters['printer/tempHistory/getDatasetColor'](props.objectName) ?? '#FFFFFF'
)

const iconColor = computed(() => {
    if (target.value === null || target.value > 0) return `${color.value}${opacityHeaterActive}`
    return `${color.value}${opacityHeaterInactive}`
})

const iconClass = computed(() => {
    const classes: string[] = ['_no-focus-style', 'cursor-pointer']
    if (isFan.value) {
        const disableFanAnimation = store.state.gui?.uiSettings.disableFanAnimation ?? false
        if (!disableFanAnimation && (state.value ?? 0) > 0) classes.push('icon-rotate')
    }
    return classes
})

const isFan = computed(() => props.objectName.startsWith('temperature_fan'))

const state = computed<number | null>(() =>
    printerObject.value.power ?? printerObject.value.speed ?? null
)

const formatState = computed(() => {
    if (state.value === null) return null
    if (target.value === 0 && state.value === 0) return 'off'
    return `${Math.round(state.value * 100)} %`
})

const avgPower = computed(() => store.getters['printer/tempHistory/getAvgPower'](name.value) ?? 0)
const avgSpeed = computed(() => store.getters['printer/tempHistory/getAvgSpeed'](name.value) ?? 0)

const avgState = computed(() => {
    if ('power' in printerObject.value) return Math.round(avgPower.value)
    if ('speed' in printerObject.value) return Math.round(avgSpeed.value)
    return null
})

const temperature = computed<number | null>(() => printerObject.value?.temperature ?? null)

const formatTemperature = computed(() =>
    `${temperature.value?.toFixed(1) ?? '--'}°C`
)

const min_temp = computed(() => parseInt(printerObjectSettings.value.min_temp ?? 0))
const max_temp = computed(() => parseInt(printerObjectSettings.value.max_temp ?? 0))

const measured_min_temp = computed(() => printerObject.value?.measured_min_temp?.toFixed(1) ?? null)
const measured_max_temp = computed(() => printerObject.value?.measured_max_temp?.toFixed(1) ?? null)

const target = computed(() => printerObject.value?.target ?? null)

const additionalSensorName = computed(() => {
    if (props.objectName === 'z_thermal_adjust') return 'z_thermal_adjust'
    const sensorName = additionalSensors.find((sensorName) => {
        const objName = `${sensorName} ${name.value}`
        if (objName in store.state.printer) return true
    })
    if (!sensorName) return null
    return `${sensorName} ${name.value}`
})

const rpm = computed(() => {
    const rpmVal = printerObject.value.rpm ?? null
    if (rpmVal === null) return null
    return parseInt(printerObject.value.rpm)
})

const rpmClass = computed(() => {
    if (rpm.value === 0 && (printerObject.value.speed ?? 0) > 0) return 'red--text'
    return ''
})

const presets = computed(() =>
    store.getters['gui/presets/getPresetsFromHeater']({ name: props.objectName }) ?? []
)

const command = computed(() => {
    if (props.objectName.startsWith('temperature_fan')) return 'SET_TEMPERATURE_FAN_TARGET'
    if (props.objectName.startsWith('extruder') || props.objectName.startsWith('heater_'))
        return 'SET_HEATER_TEMPERATURE'
    return null
})

const commandAttributeName = computed(() => {
    if (command.value === 'SET_HEATER_TEMPERATURE') return 'HEATER'
    if (command.value === 'SET_TEMPERATURE_FAN_TARGET') return 'TEMPERATURE_FAN'
    return ''
})

const availableHeaters = computed(() => store.state.printer.heaters?.available_heaters ?? [])

const isHeater = computed(() => availableHeaters.value.includes(props.objectName))

const isHeaterActive = computed(() => target.value > 0)

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})

function openContextMenu(event: MouseEvent | LongpressEvent) {
    EventBus.$emit(CLOSE_CONTEXT_MENU)
    showContextMenu.value = true
    contextMenuX.value = event?.clientX || event?.pageX || window.screenX / 2
    contextMenuY.value = event?.clientY || event?.pageY || window.screenY / 2
}

function closeContextMenu() {
    showContextMenu.value = false
}

function openEditDialog() {
    closeContextMenu()
    showEditDialog.value = true
}

function turnOffHeater() {
    const gcode = `SET_HEATER_TEMPERATURE HEATER=${name.value} TARGET=0`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode })
}
</script>

<style scoped>
:deep(.v-icon)._no-focus-style:focus::after {
    opacity: 0 !important;
}

:deep(.cursor-pointer) {
    cursor: pointer;
}
</style>
