<template>
    <v-card v-if="klipperState !== 'ready'" class="mb-6">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-alert-circle</v-icon>{{ $t('Panels.KlippyStatePanel.KlippyState')}}: {{ klipperState }}</span>
            </v-toolbar-title>
        </v-toolbar>
        <template v-if="klippyIsConnected">
            <v-card-text class="py-1">
                <pre style="white-space: pre-wrap;">{{ klippy_message }}</pre>
            </v-card-text>
            <v-divider class="mt-2"></v-divider>
            <v-card-actions class="py-4 px-5">
                <v-btn small @click="restart" color="error" class=""><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.Restart') }}</v-btn>
                <v-btn small @click="firmwareRestart" class="ml-4" color="error"><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}</v-btn>
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
    </v-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import {Mixins, Watch} from "vue-property-decorator";
import BaseMixin from "../mixins/base";
import ConnectionStatus from "../ui/ConnectionStatus.vue";

@Component({
    components: {ConnectionStatus}
})
export default class KlippyStatePanel extends Mixins(BaseMixin) {
    private timer: number | null = null


    get klippy_message() {
        return this.$store.state.server.klippy_message ?? ""
    }

    restart() {
        this.$store.commit('socket/addLoading', { name: 'restart' });
        this.$socket.emit('printer.restart', { }, 'socket/removeLoading', { name: 'restart' });
    }

    firmwareRestart() {
        this.$store.commit('socket/addLoading', { name: 'firmwareRestart' });
        this.$socket.emit('printer.firmware_restart', { }, 'socket/removeLoading', { name: 'firmwareRestart' });
    }

    requestKlippyState() {
        this.$socket.emit('printer.info', {}, 'printer/getInfo')
    }

    @Watch('klipperState')
    klipperStateChanged(newVal: string) {
        if (newVal === "ready") {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
        } else if (this.timer === null) {
            this.timer = setInterval(() => {
                this.requestKlippyState()
            }, 2000)
        }
    }
}
</script>