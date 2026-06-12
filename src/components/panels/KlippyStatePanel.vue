<template>
    <div v-if="klipperState !== 'ready' && socketIsConnected">
        <v-alert v-if="klippyIsConnected" :color="messageType.color" dense text border="left" class="mb-0 mb-6">
            <p class="font-weight-medium d-flex align-center">
                <v-icon :color="messageType.color" class="pr-2">{{ messageType.icon }}</v-icon>
                {{ serviceReportsKlipper }}
            </p>
            <div v-if="klippy_message !== null">
                <pre style="white-space: pre-wrap">{{ klippy_message.trim() }}</pre>
                <v-divider class="mt-2 pb-3" />
                <v-row>
                    <v-col>
                        <v-btn small outlined variant="text" :class="buttonClasses" @click="restart">
                            <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.Restart') }}
                        </v-btn>
                        <v-btn small outlined variant="text" :class="buttonClasses" @click="firmwareRestart">
                            <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn
                            :href="apiUrl + '/server/files/klippy.log'"
                            small
                            outlined
                            text
                            :class="buttonClasses"
                            @click="downloadLog">
                            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.KlipperLog') }}
                        </v-btn>
                        <v-btn
                            :href="apiUrl + '/server/files/moonraker.log'"
                            small
                            outlined
                            text
                            :class="buttonClasses"
                            @click="downloadLog">
                            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.MoonrakerLog') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
            <v-card-text v-else class="text-center py-3">
                <v-progress-circular indeterminate :color="messageType.color" />
            </v-card-text>
        </v-alert>
        <v-alert v-else-if="isPrinterPowerOff" dense text border="left" class="mb-6">
            <p class="font-weight-medium d-flex align-center">
                <v-icon class="pr-2">{{ messageType.icon }}</v-icon>
                {{ $t('Panels.KlippyStatePanel.PrinterSwitchedOff') }}
            </p>
            <p>{{ $t('Panels.KlippyStatePanel.PrinterSwitchedOffDescription') }}</p>
            <v-row>
                <v-col class="text-center">
                    <v-btn small outlined variant="text" :class="`text-${messageType.color} my-1`" @click="powerOn">
                        <v-icon class="mr-sm-2">{{ mdiPower }}</v-icon>
                        {{ $t('Panels.KlippyStatePanel.PowerOn') }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-alert>
        <v-alert v-else-if="klipperState === 'disconnected'" dense text border="left" class="mb-6">
            <p class="font-weight-medium d-flex align-center">
                <v-icon class="pr-2">{{ messageType.icon }}</v-icon>
                {{ serviceReportsMoonraker }}
            </p>
            <connection-status :moonraker="true" :klipper="false" />
            <p class="mt-2 mb-0 text-center">{{ $t('Panels.KlippyStatePanel.MoonrakerCannotConnect') }}</p>
            <p class="mb-0 text-center">{{ $t('Panels.KlippyStatePanel.CheckKlippyAndUdsAddress') }}</p>
        </v-alert>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import ConnectionStatus from '../ui/ConnectionStatus.vue'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiRestart,
    mdiDownload,
    mdiMessageOutline,
    mdiAlertOutline,
    mdiRocketLaunch,
    mdiConnection,
    mdiPrinter3d,
    mdiPower,
} from '@mdi/js'

const { klipperState, socketIsConnected, klippyIsConnected, isPrinterPowerOff, printerPowerDevice, apiUrl } = useBase()

const store = useStore()
const socket = useSocket()

const klippy_message = computed<string | null>(() =>
    store.state.server.klippy_message ?? null
)

const messageType = computed<{ color: string; icon: string }>(() => {
    switch (klipperState.value) {
        case 'startup':
            return { color: 'info', icon: mdiRocketLaunch }
        case 'shutdown':
            return { color: 'warning', icon: mdiAlertOutline }
        case 'error':
            return { color: 'error', icon: mdiAlertOutline }
        case 'disconnected':
            return { color: '', icon: mdiConnection }
        default:
            return { color: '', icon: mdiMessageOutline }
    }
})

const buttonClasses = computed(() =>
    [messageType.value.color + '--text', 'my-1', 'w-100']
)

const serviceReportsKlipper = computed(() =>
    `${useI18n().t('Panels.KlippyStatePanel.ServiceReports', {
        service: 'Klipper',
    })}: ${klipperState.value.toUpperCase()}`
)

const serviceReportsMoonraker = computed(() =>
    `${useI18n().t('Panels.KlippyStatePanel.ServiceReports', {
        service: 'Moonraker',
    })}: ${klipperState.value.toUpperCase()}`
)

function restart() {
    socket.emit('printer.restart', {}, { loading: 'restart' })
}

function firmwareRestart() {
    socket.emit('printer.firmware_restart', {}, { loading: 'firmwareRestart' })
}

function downloadLog(event: MouseEvent) {
    event.preventDefault()

    const target = event.target as HTMLElement | null
    const href = target?.closest('a')?.href ?? ''
    if (href) window.open(href)
}

function powerOn() {
    socket.emit(
        'machine.device_power.post_device',
        {
            device: printerPowerDevice.value,
            action: 'on',
        },
        { action: 'server/power/responseToggle' }
    )
}
</script>
