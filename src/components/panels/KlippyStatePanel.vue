<template>
    <div v-if="klipperState !== 'ready' && socketIsConnected">
        <v-container v-if="klippyIsConnected" class="pa-0 pb-6">
            <v-alert :color="messageType.color" dense text border="left" class="mb-0">
                <!-- KLIPPER MESSAGE TITLE -->
                <p class="font-weight-medium d-flex align-center">
                    <v-icon :color="messageType.color" class="pr-2">{{ messageType.icon }}</v-icon>
                    {{ $t('Panels.KlippyStatePanel.ServiceReports', { service: 'Klipper' }) }}:
                    {{ klipperState.toUpperCase() }}
                </p>
                <!-- KLIPPER MESSAGE -->
                <div v-if="klippy_message !== null">
                    <pre style="white-space: pre-wrap">{{ klippy_message.trim() }}</pre>
                    <v-divider class="mt-2 pb-3"></v-divider>
                    <v-row>
                        <!-- RESTART BUTTONS -->
                        <v-col>
                            <v-btn
                                small
                                :class="`${messageType.color}--text my-1`"
                                style="width: 100%"
                                @click="restart">
                                <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                                {{ $t('Panels.KlippyStatePanel.Restart') }}
                            </v-btn>
                            <v-btn
                                small
                                :class="`${messageType.color}--text my-1`"
                                style="width: 100%"
                                @click="firmwareRestart">
                                <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                                {{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}
                            </v-btn>
                        </v-col>
                        <!-- LOG DOWNLOAD BUTTONS -->
                        <v-col>
                            <v-btn
                                :href="apiUrl + '/server/files/klippy.log'"
                                small
                                :class="`${messageType.color}--text my-1`"
                                style="width: 100%"
                                @click="downloadLog">
                                <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                                Klipper Log
                            </v-btn>
                            <v-btn
                                :href="apiUrl + '/server/files/moonraker.log'"
                                small
                                :class="`${messageType.color}--text my-1`"
                                style="width: 100%"
                                @click="downloadLog">
                                <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                                Moonraker Log
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
                <!-- LOADER -->
                <v-card-text v-else class="text-center py-3">
                    <v-progress-circular indeterminate :color="messageType.color"></v-progress-circular>
                </v-card-text>
            </v-alert>
        </v-container>
        <!-- DISCONNECTED INFOGRAPHIC -->
        <v-container v-if="klipperState === 'disconnected'" class="pa-0">
            <v-alert dense text border="left">
                <p class="font-weight-medium d-flex align-center">
                    <v-icon class="pr-2">{{ messageType.icon }}</v-icon>
                    {{ $t('Panels.KlippyStatePanel.ServiceReports', { service: 'Moonraker' }) }}:
                    {{ klipperState.toUpperCase() }}
                </p>
                <connection-status :moonraker="true" :klipper="false"></connection-status>
                <p class="mt-2 mb-0 text-center">{{ $t('Panels.KlippyStatePanel.MoonrakerCannotConnect') }}</p>
                <p class="mb-0 text-center">{{ $t('Panels.KlippyStatePanel.KlipperCheck') }}</p>
            </v-alert>
        </v-container>
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
} from '@mdi/js'

@Component({
    components: { Panel, ConnectionStatus },
})
export default class KlippyStatePanel extends Mixins(BaseMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiRestart = mdiRestart
    mdiDownload = mdiDownload

    get klippy_message() {
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
}
</script>
