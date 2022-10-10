<template>
    <div v-if="klipperState !== 'ready' && socketIsConnected">
        <v-container v-if="klippyIsConnected" class="pa-0 pb-6">
            <v-alert :color="messageType" dense text border="left" class="mb-0">
                <!-- KLIPPER MESSAGE TITLE -->
                <p class="font-weight-medium">
                    <v-icon :color="messageType">{{ iconType }}</v-icon>
                    <!-- TODO: needs localization -->
                    Klipper reports: {{ klipperState.toUpperCase() }}
                </p>
                <!-- KLIPPER MESSAGE -->
                <div v-if="klippy_message !== null">
                    <pre style="white-space: pre-wrap">{{ klippy_message.trim() }}</pre>
                    <!-- RESTART BUTTONS -->
                    <v-divider class="mt-2 pb-3"></v-divider>
                    <div class="d-flex justify-center">
                        <v-btn small :class="`${messageType}--text ml-2`" @click="restart">
                            <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.Restart') }}
                        </v-btn>
                        <v-btn small :class="`${messageType}--text ml-4`" @click="firmwareRestart">
                            <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}
                        </v-btn>
                    </div>
                </div>
                <!-- LOADER -->
                <v-card-text v-else class="text-center py-3">
                    <v-progress-circular indeterminate :color="messageType"></v-progress-circular>
                </v-card-text>
            </v-alert>
        </v-container>
        <!-- DISCONNECTED INFOGRAPHIC -->
        <v-container v-if="klipperState === 'disconnected'" class="pa-0">
            <v-alert dense text border="left">
                <p>
                    <v-icon>{{ iconType }}</v-icon>
                    <!-- TODO: needs localization -->
                    Moonraker reports: {{ klipperState.toUpperCase() }}
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
import { mdiRestart, mdiMessageOutline, mdiAlertOutline, mdiRocketLaunch, mdiConnection, mdiPrinter3d } from '@mdi/js'

@Component({
    components: { Panel, ConnectionStatus },
})
export default class KlippyStatePanel extends Mixins(BaseMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiRestart = mdiRestart

    get klippy_message() {
        console.log(this.klipperState)
        console.log(this.$store.state.server.klippy_message)
        return this.$store.state.server.klippy_message ?? null
    }

    get messageType() {
        let type

        if (this.klipperState === 'startup') type = 'info'
        if (this.klipperState === 'shutdown') type = 'warning'
        if (this.klipperState === 'error') type = 'error'

        return type
    }

    get iconType() {
        if (this.klipperState === 'startup') return mdiRocketLaunch
        if (this.klipperState === 'shutdown') return mdiAlertOutline
        if (this.klipperState === 'error') return mdiAlertOutline
        if (this.klipperState === 'disconnected') return mdiConnection

        return mdiMessageOutline
    }

    restart() {
        this.$socket.emit('printer.restart', {}, { loading: 'restart' })
    }

    firmwareRestart() {
        this.$socket.emit('printer.firmware_restart', {}, { loading: 'firmwareRestart' })
    }
}
</script>
