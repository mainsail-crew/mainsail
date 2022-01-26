<style scoped>

</style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <v-card dark>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>
                        <template v-if="connectingFailed">{{ $t("ConnectionDialog.Failed", {'host': formatHostname}) }}</template>
                        <template v-else-if="isConnecting">{{ $t("ConnectionDialog.Connecting", {'host': formatHostname}) }}</template>
                        <template v-else>{{ formatHostname }}</template>
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pt-5" v-if="isConnecting">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-5" v-if="!isConnecting && connectingFailed">
                <connection-status :moonraker="false"></connection-status>
                <p class="text-center mt-3">{{ $t("ConnectionDialog.CannotConnectTo", {'host': formatHostname}) }}</p>
                <template v-if="counter > 2">
                    <v-divider class="my-3"></v-divider>
                    <p>{{ $t("ConnectionDialog.CheckMoonrakerLog") }}</p>
                    <ul>
                        <li>~/klipper_logs/moonraker.log</li>
                        <li>/tmp/moonraker.log</li>
                    </ul>
                    <v-divider class="mt-4 mb-5"></v-divider>
                </template>
                <div class="text-center">
                    <v-btn @click="reconnect" class="primary--text">{{ $t("ConnectionDialog.TryAgain") }}</v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ConnectionStatus from '@/components/ui/ConnectionStatus.vue'

@Component({
    components: {
        ConnectionStatus,
    }
})
export default class TheConnectingDialog extends Mixins(BaseMixin) {
    counter = 0

    get protocol() {
        return this.$store.state.socket.protocol
    }

    get hostname() {
        return this.$store.state.socket.hostname
    }

    get port() {
        return this.$store.state.socket.port
    }

    get formatHostname() {
        return parseInt(this.port) !== 80 && this.port !== '' ? this.hostname+':'+this.port : this.hostname
    }

    get isConnected() {
        return this.$store.state.socket.isConnected
    }

    get isConnecting() {
        return this.$store.state.socket.isConnecting
    }

    get connectingFailed() {
        return this.$store.state.socket.connectingFailed
    }

    get showDialog() {
        return !this.isConnected
    }

    reconnect() {
        this.counter++
        this.$store.dispatch('socket/setData', { connectingFailed: false })
        this.$socket.connect()
    }
}
</script>