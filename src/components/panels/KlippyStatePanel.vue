<template>
    <panel
        v-if="klipperState !== 'ready' && socketIsConnected"
        icon="mdi-alert-circle"
        :title="$t('Panels.KlippyStatePanel.KlippyState')+': '+klipperState"
        card-class="klippy-state-panel"
    >
        <template v-if="klippyIsConnected">
            <v-card-text class="py-1 mt-2" v-if="klippy_message !== null">
                <pre style="white-space: pre-wrap;">{{ klippy_message }}</pre>
            </v-card-text>
            <v-card-text v-else class="text-center py-3">
                <v-progress-circular
                    indeterminate
                    color="primary"
                ></v-progress-circular>
            </v-card-text>
            <v-divider class="mt-2"></v-divider>
            <v-card-actions class="justify-start">
                <v-btn small @click="restart" class="ml-2 error--text"><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.Restart') }}</v-btn>
                <v-btn small @click="firmwareRestart" class="ml-4 error--text"><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}</v-btn>
            </v-card-actions>
        </template>
        <template v-else>
            <v-card-text class="pt-5 pb-1">
                <connection-status :moonraker="true" :klipper="false"></connection-status>
                <p class="mt-2 mb-0 text-center">{{ $t('Panels.KlippyStatePanel.MoonrakerCannotConnect') }}</p>
                <v-divider class="my-2"></v-divider>
                <p class="mt-2">{{ $t('Panels.KlippyStatePanel.KlipperCheck') }}</p>
            </v-card-text>
        </template>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ConnectionStatus from '../ui/ConnectionStatus.vue'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {Panel, ConnectionStatus}
})
export default class KlippyStatePanel extends Mixins(BaseMixin) {
    //private timer: number | null = null

    get klippy_message() {
        return this.$store.state.server.klippy_message ?? null
    }

    restart() {
        this.$socket.emit('printer.restart', { }, { loading: 'restart' })
    }

    firmwareRestart() {
        this.$socket.emit('printer.firmware_restart', { }, { loading: 'firmwareRestart' })
    }

    /*requestKlippyState() {
        this.$socket.emit('printer.info', {}, { action: 'printer/getInfo' })
    }

    @Watch('klipperState')
    klipperStateChanged(newVal: string) {
        if (['ready', 'disconnected'].includes(newVal)) {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
        } else if (this.timer === null) {
            this.timer = setInterval(() => {
                this.requestKlippyState()
            }, 2000)
        }
    }*/
}
</script>