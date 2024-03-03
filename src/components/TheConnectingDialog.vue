<style scoped></style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <v-card>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon left>{{ mdiConnection }}</v-icon>
                        {{ titleText }}
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text v-if="connectingFailed" class="pt-5">
                <connection-status :moonraker="false"></connection-status>
                <p class="text-center mt-3">{{ $t('ConnectionDialog.CannotConnectTo', { host: formatHostname }) }}</p>
                <template v-if="counter > 2">
                    <v-divider class="my-3"></v-divider>
                    <p>{{ $t('ConnectionDialog.CheckMoonrakerLog') }}</p>
                    <ul>
                        <li>~/klipper_logs/moonraker.log</li>
                        <li>/tmp/moonraker.log</li>
                    </ul>
                    <v-divider class="mt-4 mb-5"></v-divider>
                </template>
                <div class="text-center">
                    <v-btn class="primary--text" @click="reconnect">{{ $t('ConnectionDialog.TryAgain') }}</v-btn>
                </div>
            </v-card-text>
            <v-card-text v-else class="pt-5">
                <v-progress-linear :color="progressBarColor" indeterminate></v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

import ThemeMixin from '@/components/mixins/theme'
import ConnectionStatus from '@/components/ui/ConnectionStatus.vue'
import { mdiConnection } from '@mdi/js'

@Component({
    components: {
        ConnectionStatus,
    },
})
export default class TheConnectingDialog extends Mixins(BaseMixin, ThemeMixin) {
    mdiConnection = mdiConnection

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
        return parseInt(this.port) !== 80 && this.port !== '' ? this.hostname + ':' + this.port : this.hostname
    }

    get isConnecting() {
        return this.$store.state.socket.isConnecting
    }

    get connectingFailed() {
        return this.$store.state.socket.connectingFailed
    }

    get showDialog() {
        return true
    }

    get titleText() {
        if (this.connectingFailed) return this.$t('ConnectionDialog.Failed', { host: this.formatHostname })
        if (this.isConnecting) return this.$t('ConnectionDialog.Connecting', { host: this.formatHostname })
        if (!this.guiIsReady) return this.$t('ConnectionDialog.Initializing')

        return this.formatHostname
    }

    reconnect() {
        this.counter++
        this.$store.dispatch('socket/setData', { connectingFailed: false })
        this.$socket.connect()
    }
}
</script>
