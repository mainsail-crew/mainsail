<template>
    <panel
        v-if="klipperState !== 'ready' && socketIsConnected"
        :icon="mdiAlertCircle"
        :title="$t('Panels.KlippyStatePanel.KlippyState') + ': ' + klipperState"
        card-class="klippy-state-panel">
        <div>
            <template v-if="klippyIsConnected">
                <!-- KLIPPER MESSAGES -->
                <v-container v-if="klippy_message !== null" class="py-1 mt-2">
                    <v-alert :color="messageType" dense text border="left" class="mb-0">
                        <p v-if="klipperState === 'error'" class="font-weight-bold">
                            <v-icon :color="messageType">{{ iconType }}</v-icon>
                            Klipper reports an error:
                        </p>
                        <p v-else-if="klipperState === 'shutdown'" class="font-weight-medium">
                            <v-icon :color="messageType">{{ iconType }}</v-icon>
                            Klipper reports a shutdown:
                        </p>
                        <p v-else-if="klipperState === 'startup'">
                            <v-icon :color="messageType">{{ iconType }}</v-icon>
                            Klipper is starting up:
                        </p>
                        <p v-else>
                            <v-icon :color="messageType">{{ iconType }}</v-icon>
                            Klipper reports:
                        </p>
                        <pre style="white-space: pre-wrap">{{ klippy_message }}</pre>
                    </v-alert>
                </v-container>
                <!-- LOADER -->
                <v-card-text v-else class="text-center py-3">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-card-text>
                <!-- RESTART BUTTONS -->
                <v-card-actions class="justify-start">
                    <v-btn small :class="`${messageType}--text ml-2`" @click="restart">
                        <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                        {{ $t('Panels.KlippyStatePanel.Restart') }}
                    </v-btn>
                    <v-btn small :class="`${messageType}--text ml-4`" @click="firmwareRestart">
                        <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                        {{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}
                    </v-btn>
                </v-card-actions>
            </template>
            <!-- DISCONNECTED INFOGRAPHIC -->
            <template v-else>
                <v-container class="pt-5 pb-1">
                    <v-alert dense text border="left">
                        <p>
                            <v-icon>{{ iconType }}</v-icon>
                            Moonraker reports a disconnection:
                        </p>
                        <connection-status :moonraker="true" :klipper="false"></connection-status>
                        <p class="mt-2 mb-0 text-center">{{ $t('Panels.KlippyStatePanel.MoonrakerCannotConnect') }}</p>
                        <p class="mb-0 text-center">{{ $t('Panels.KlippyStatePanel.KlipperCheck') }}</p>
                    </v-alert>
                </v-container>
            </template>
        </div>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ConnectionStatus from '../ui/ConnectionStatus.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiAlertCircle, mdiRestart, mdiMessageOutline, mdiAlertOutline, mdiRocketLaunch, mdiConnection } from '@mdi/js'

@Component({
    components: { Panel, ConnectionStatus },
})
export default class KlippyStatePanel extends Mixins(BaseMixin) {
    mdiAlertCircle = mdiAlertCircle
    mdiRestart = mdiRestart

    get klippy_message() {
        console.log(this.klipperState)
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
