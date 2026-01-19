<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <panel :title="titleText" :icon="mdiConnection" card-class="the-connection-dialog" :margin-bottom="false">
            <v-card-text v-if="connectingFailed || initializationError" class="pt-5">
                <connection-status :moonraker="false" />
                <p class="text-center mt-3 mb-0">{{ errorMessageNeutral }}</p>
                <p v-if="errorMessageRed" class="text-center mt-1 red--text">{{ errorMessageRed }}</p>
                <template v-if="counter > 2">
                    <v-divider class="my-3" />
                    <p>{{ $t('ConnectionDialog.CheckMoonrakerLog') }}</p>
                    <ul>
                        <li>~/printer_data/logs/moonraker.log</li>
                    </ul>
                    <v-divider class="mt-4 mb-5" />
                </template>
                <div class="text-center mt-3">
                    <v-btn v-if="helpButtonUrl" class="text--disabled mr-3" :href="helpButtonUrl" target="_blank">
                        <v-icon left>{{ mdiHelp }}</v-icon>
                        {{ $t('ConnectionDialog.Help') }}
                    </v-btn>
                    <v-btn class="primary--text" @click="reconnect">{{ $t('ConnectionDialog.TryAgain') }}</v-btn>
                </div>
            </v-card-text>
            <v-card-text v-else class="pt-5">
                <v-progress-linear
                    :color="progressBarColor"
                    :indeterminate="initializationProgress === null"
                    :value="initializationProgress ?? 0" />
                <p v-if="initializationStepText" class="text-center mt-3 mb-0 text--secondary">
                    {{ initializationStepText }}
                </p>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

import ThemeMixin from '@/components/mixins/theme'
import ConnectionStatus from '@/components/ui/ConnectionStatus.vue'
import { mdiConnection, mdiHelp } from '@mdi/js'

@Component({
    components: {
        ConnectionStatus,
    },
})
export default class TheConnectingDialog extends Mixins(BaseMixin, ThemeMixin) {
    mdiConnection = mdiConnection
    mdiHelp = mdiHelp

    counter = 0

    get hostname() {
        return this.$store.state.socket.hostname
    }

    get port() {
        return this.$store.state.socket.port
    }

    get path() {
        return this.$store.state.socket.path
    }

    get formatHostname() {
        return parseInt(this.port) !== 80 && this.port !== ''
            ? this.hostname + ':' + this.port + this.path
            : this.hostname + this.path
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

    get initializationProgress(): number | null {
        return this.$store.state.socket.initializationProgress
    }

    get initializationError(): string | null {
        return this.$store.state.socket.initializationError
    }

    get initializationStepText(): string | null {
        return this.$store.state.socket.initializationStep
    }

    get titleText() {
        if (this.connectingFailed || this.initializationError)
            return this.$t('ConnectionDialog.Failed', { host: this.formatHostname })
        if (this.isConnecting) return this.$t('ConnectionDialog.Connecting', { host: this.formatHostname })
        if (!this.guiIsReady) return this.$t('ConnectionDialog.Initializing')

        return this.formatHostname
    }

    get connectionFailedMessage() {
        return this.$store.state.socket.connectionFailedMessage ?? null
    }

    get errorMessageNeutral() {
        if (this.initializationError) return this.$t('ConnectionDialog.InitializationFailed')

        return this.$t('ConnectionDialog.CannotConnectTo', { host: this.formatHostname })
    }

    get errorMessageRed() {
        if (this.initializationError)
            return this.$t('ConnectionDialog.ErrorMessage', { message: this.initializationError })

        if (this.connectionFailedMessage)
            return this.$t('ConnectionDialog.ErrorMessage', { message: this.connectionFailedMessage })

        return null
    }

    get helpButtonUrl() {
        if (!this.$store.state.socket.connectionFailedMessage && !this.initializationError) return null

        const message = this.initializationError ?? this.connectionFailedMessage
        return `https://docs.mainsail.xyz/faq/mainsail_errors/connection-${message?.toLowerCase()}`
    }

    reconnect() {
        this.counter++
        this.$store.dispatch('socket/setData', { connectingFailed: false })
        this.$store.dispatch('socket/resetInitialization')
        this.$socket.connect()
    }
}
</script>
