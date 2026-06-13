<template>
    <v-list-item class="minHeight30 pr-2">
        <template #title>
            <v-tooltip location="left">
                <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">{{ name }}</span>
                </template>
                <span>{{ state }} ({{ subState }})</span>
            </v-tooltip>
        </template>
        <template #append>
            <div class="my-0 d-flex flex-row" style="min-width: auto">
 <v-btn v-if="state === 'inactive'" icon size="small" @click="clickStart">
                    <v-icon size="small">{{ mdiPlay }}</v-icon>
                </v-btn>
 <v-btn v-else icon size="small" @click="clickRestart">
                    <v-icon size="small">{{ mdiRestart }}</v-icon>
                </v-btn>
 <v-btn icon size="small" :disabled="disableStopButton" :style="styleStopButton" @click="clickStop">
                    <v-icon size="small">{{ mdiStop }}</v-icon>
                </v-btn>
            </div>
        </template>
        <confirmation-dialog
            v-model="showRestartDialog"
            :title="dialogRestartTitle"
            :text="dialogRestartDescription"
            :action-button-text="$t('App.TopCornerMenu.Restart')"
            @action="serviceRestart" />
        <confirmation-dialog
            v-model="showStopDialog"
            :title="dialogStopTitle"
            :text="dialogStopDescription"
            :action-button-text="$t('App.TopCornerMenu.Stop')"
            @action="serviceStop" />
    </v-list-item>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import { useServices } from '@/composables/useServices'
import { mdiPlay, mdiRestart, mdiStop } from '@mdi/js'
import { capitalize } from '@/plugins/helpers'

const props = defineProps({
    service: { type: String, required: true },
})

const emit = defineEmits<{
    (e: 'close-menu'): void
}>()

const store = useStore()
const { t } = useI18n()
const { printerIsPrinting } = useBase()
const socket = useSocket()
const { hideOtherInstances, klipperInstance, moonrakerInstance } = useServices()

const showRestartDialog = ref(false)
const showStopDialog = ref(false)

const service_states = computed(() => store.state.server.system_info?.service_state ?? {})

const name = computed(() => {
    if (hideOtherInstances.value && props.service === klipperInstance.value) return 'Klipper'
    if (hideOtherInstances.value && props.service === moonrakerInstance.value) return 'Moonraker'
    return capitalize(props.service)
})

const state = computed(() => {
    if (props.service in service_states.value) return service_states.value[props.service].active_state
    return null
})

const subState = computed(() => {
    if (props.service in service_states.value) return service_states.value[props.service].sub_state
    return null
})

const dialogRestartTitle = computed(() => {
    if (props.service === klipperInstance.value)
        return t('App.TopCornerMenu.ConfirmationDialog.Title.KlipperRestart')
    return t('App.TopCornerMenu.ConfirmationDialog.Title.ServiceRestart')
})

const dialogStopTitle = computed(() => t('App.TopCornerMenu.ConfirmationDialog.Title.ServiceStop'))

const dialogRestartDescription = computed(() => {
    if (props.service === klipperInstance.value)
        return t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperRestart')
    return t('App.TopCornerMenu.ConfirmationDialog.Description.ServiceRestart')
})

const dialogStopDescription = computed(() => {
    if (props.service === klipperInstance.value)
        return t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperStop')
    return t('App.TopCornerMenu.ConfirmationDialog.Description.ServiceStop')
})

const disableStopButton = computed(() => state.value === 'inactive' || props.service === moonrakerInstance.value)

const styleStopButton = computed(() =>
    props.service === moonrakerInstance.value ? 'visibility: hidden;' : ''
)

function clickStart() {
    socket.emit('machine.services.start', { service: props.service })
    closeMenu()
}

function clickRestart() {
    if (printerIsPrinting.value) {
        showRestartDialog.value = true
        return
    }
    serviceRestart()
}

function clickStop() {
    if (printerIsPrinting.value) {
        showStopDialog.value = true
        return
    }
    serviceStop()
}

function serviceRestart() {
    socket.emit('machine.services.restart', { service: props.service })
    closeMenu()
}

function serviceStop() {
    socket.emit('machine.services.stop', { service: props.service })
    closeMenu()
}

function closeMenu() {
    emit('close-menu')
}
</script>
