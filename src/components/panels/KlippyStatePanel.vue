<template>
    <div v-if="klipperState !== 'ready' && socketIsConnected">
        <v-alert v-if="klippyIsConnected" :color="messageType.color" dense text border="left" class="mb-0 mb-6">
            <!-- KLIPPER MESSAGE TITLE -->
            <p class="font-weight-medium d-flex align-center">
                <v-icon :color="messageType.color" class="pr-2">{{ messageType.icon }}</v-icon>
                {{ serviceReportsKlipper }}
            </p>
            <!-- KLIPPER MESSAGE -->
            <div v-if="klippy_message !== null">
                <pre style="white-space: pre-wrap">{{ klippy_message.trim() }}</pre>
                <v-divider class="mt-2 pb-3" />
                <v-row>
                    <!-- RESTART BUTTONS -->
                    <v-col>
                        <v-btn small outlined text :class="buttonClasses" @click="restart">
                            <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.Restart') }}
                        </v-btn>
                        <v-btn small outlined text :class="buttonClasses" @click="firmwareRestart">
                            <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}
                        </v-btn>
                    </v-col>
                    <!-- LOG DOWNLOAD BUTTONS -->
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
            <!-- LOADER -->
            <v-card-text v-else class="text-center py-3">
                <v-progress-circular indeterminate :color="messageType.color" />
            </v-card-text>
        </v-alert>
        <!-- Power OFF panel -->
        <v-alert v-else-if="isPrinterPowerOff" dense text border="left" class="mb-6">
            <p class="font-weight-medium d-flex align-center">
                <v-icon class="pr-2">{{ messageType.icon }}</v-icon>
                {{ $t('Panels.KlippyStatePanel.PrinterSwitchedOff') }}
            </p>
            <p>{{ $t('Panels.KlippyStatePanel.PrinterSwitchedOffDescription') }}</p>
            <v-row>
                <v-col class="text-center">
                    <v-btn small outlined text :class="`${messageType.color}--text my-1`" @click="powerOn">
                        <v-icon class="mr-sm-2">{{ mdiPower }}</v-icon>
                        {{ $t('Panels.KlippyStatePanel.PowerOn') }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-alert>
        <!-- DISCONNECTED INFOGRAPHIC -->
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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
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

@Component({
    components: { Panel, ConnectionStatus },
})
export default class KlippyStatePanel extends Mixins(BaseMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiRestart = mdiRestart
    mdiDownload = mdiDownload
    mdiPower = mdiPower

    get klippy_message(): string | null {
        return this.$store.state.server.klippy_message ?? null
    }

    get messageType(): { color: string; icon: string } {
        switch (this.klipperState) {
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
    }

    get buttonClasses() {
        return [this.messageType.color + '--text', 'my-1', 'w-100']
    }

    get serviceReportsKlipper() {
        return `${this.$t('Panels.KlippyStatePanel.ServiceReports', {
            service: 'Klipper',
        })}: ${this.klipperState.toUpperCase()}`
    }

    get serviceReportsMoonraker() {
        return `${this.$t('Panels.KlippyStatePanel.ServiceReports', {
            service: 'Moonraker',
        })}: ${this.klipperState.toUpperCase()}`
    }

    restart() {
        this.$socket.emit('printer.restart', {}, { loading: 'restart' })
    }

    firmwareRestart() {
        this.$socket.emit('printer.firmware_restart', {}, { loading: 'firmwareRestart' })
    }

    downloadLog(event: any) {
        event.preventDefault()
        let href = ''
        if ('href' in event.target.attributes) href = event.target.attributes.href.value
        if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value

        window.open(href)
    }

    powerOn() {
        this.$socket.emit(
            'machine.device_power.post_device',
            {
                device: this.printerPowerDevice,
                action: 'on',
            },
            { action: 'server/power/responseToggle' }
        )
    }
}
</script>
