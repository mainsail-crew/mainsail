<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <panel :title="titleText" :icon="mdiConnection" card-class="the-connection-dialog" :margin-bottom="false">
            <v-card-text v-if="connectingFailed" class="pt-5">
                <connection-status :moonraker="false" />
                <p class="text-center mt-3 mb-0">
                    {{ $t('ConnectionDialog.CannotConnectTo', { host: formatHostname }) }}
                </p>
                <p v-if="connectionFailedMessage" class="text-center mt-1 text-error">
                    {{ $t('ConnectionDialog.ErrorMessage', { message: connectionFailedMessage }) }}
                </p>
                <template v-if="counter > 2">
                    <v-divider class="my-3" />
                    <p>{{ $t('ConnectionDialog.CheckMoonrakerLog') }}</p>
                    <ul>
                        <li>~/printer_data/logs/moonraker.log</li>
                    </ul>
                    <v-divider class="mt-4 mb-5" />
                </template>
                <div class="text-center mt-3">
                    <v-btn v-if="helpButtonUrl" class="text-disabled mr-3" :href="helpButtonUrl" target="_blank">
                        <v-icon left>{{ mdiHelp }}</v-icon>
                        {{ $t('ConnectionDialog.Help') }}
                    </v-btn>
                    <v-btn class="text-primary" @click="reconnect">{{ $t('ConnectionDialog.TryAgain') }}</v-btn>
                </div>
            </v-card-text>
            <v-card-text v-else class="pt-5">
                <v-progress-linear :color="progressBarColor" indeterminate />
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import { useSocket } from '@/composables/useSocket'
import ConnectionStatus from '@/components/ui/ConnectionStatus.vue'
import { mdiConnection, mdiHelp } from '@mdi/js'

const store = useStore()
const { t } = useI18n()
const { guiIsReady } = useBase()
const { progressBarColor } = useTheme()
const socket = useSocket()

const counter = ref(0)

const hostname = computed(() => store.state.socket.hostname)
const port = computed(() => store.state.socket.port)
const path = computed(() => store.state.socket.path)

const formatHostname = computed(() =>
    parseInt(port.value) !== 80 && port.value !== ''
        ? hostname.value + ':' + port.value + path.value
        : hostname.value + path.value
)

const isConnecting = computed(() => store.state.socket.isConnecting)
const connectingFailed = computed(() => store.state.socket.connectingFailed)
const showDialog = computed(() => true)

const titleText = computed(() => {
    if (connectingFailed.value) return t('ConnectionDialog.Failed', { host: formatHostname.value })
    if (isConnecting.value) return t('ConnectionDialog.Connecting', { host: formatHostname.value })
    if (!guiIsReady.value) return t('ConnectionDialog.Initializing')
    return formatHostname.value
})

const connectionFailedMessage = computed(() => store.state.socket.connectionFailedMessage ?? null)

const helpButtonUrl = computed(() => {
    if (!store.state.socket.connectionFailedMessage) return null
    return `https://docs.mainsail.xyz/faq/mainsail_errors/connection-${connectionFailedMessage.value?.toLowerCase()}`
})

function reconnect() {
    counter.value++
    store.dispatch('socket/setData', { connectingFailed: false })
    socket.connect()
}
</script>
