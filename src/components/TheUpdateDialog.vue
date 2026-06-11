<template>
    <v-dialog v-model="showDialog" persistent max-width="800" class="mx-0">
        <v-card :loading="!complete">
            <template #progress>
                <v-progress-linear color="primary" indeterminate></v-progress-linear>
            </template>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon left>{{ mdiUpdate }}</v-icon>
                        <template v-if="application.substr(0, 8) === 'recover_' && !complete">
                            {{ $t('App.UpdateDialog.Recovering', { software: application.substr(8) }) }}
                        </template>
                        <template v-else-if="application.substr(0, 8) === 'recover_'">
                            {{ $t('App.UpdateDialog.RecoveringDone', { software: application.substr(8) }) }}
                        </template>
                        <template v-else-if="!complete">
                            {{ $t('App.UpdateDialog.Updating', { software: application }) }}
                        </template>
                        <template v-else>
                            {{ $t('App.UpdateDialog.UpdatingDone', { software: application }) }}
                        </template>
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="px-3">
                <v-row>
                    <v-col class="py-6 px-0">
                        <OverlayScrollbarsComponent ref="updaterLogScroll" class="updaterLogScroll">
                            <table class="updaterLog">
                                <thead>
                                    <tr v-if="messages.length">
                                        <th>{{ $t('History.Time') }}</th>
                                        <th>{{ $t('History.Message') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="!messages.length">
                                        <td colspan="2" class="py-2">{{ $t('App.UpdateDialog.Empty') }}</td>
                                    </tr>
                                    <tr v-for="(item, index) in sortedMessages" :key="index">
                                        <td class="log-cell title-cell py-2">{{ formatTime(item.date) }}</td>
                                        <td class="log-cell content-cell pl-0 py-2" style="width: 100%">
                                            <span v-if="item.message" class="message" v-html="item.message"></span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </OverlayScrollbarsComponent>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="text-center pt-5">
                        <v-btn variant="text" :disabled="!complete" color="primary" @click="close">
                            {{ $t('Buttons.Close') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { ServerUpdateManagerStateMessages } from '@/store/server/updateManager/types'
import { mdiUpdate } from '@mdi/js'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const store = useStore()
const socket = useSocket()

const updaterLogScroll = ref<any>(null)

const showDialog = computed({
    get: () => application.value !== '',
    set: () => {},
})

const application = computed(() => store.state.server.updateManager.updateResponse.application ?? '')

const messages = computed<ServerUpdateManagerStateMessages[]>(() => store.state.server.updateManager.updateResponse.messages ?? [])

const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const complete = computed(() => store.state.server.updateManager.updateResponse.complete ?? true)

function formatTime(date: Date) {
    const hours = date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours()
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes()
    const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds().toString() : date.getSeconds()

    return hours + ':' + minutes + ':' + seconds
}

function close() {
    if (
        application.value !== null &&
        complete.value &&
        ['client', 'mainsail', 'full'].includes(application.value.toLowerCase())
    ) {
        window.location.reload()
        return
    }

    store.commit('server/updateManager/resetUpdateResponse')
    socket.emit(
        'machine.update.status',
        { refresh: false },
        { action: 'server/updateManager/onUpdateStatus' }
    )
}

watch(messages, () => {
    setTimeout(() => {
        updaterLogScroll.value?.osInstance()?.scroll({ y: '100%' })
    }, 50)
})
</script>

<style scoped>
.updaterLogScroll {
    height: 350px;
    max-height: 350px;
    overflow-x: hidden;
}

.updaterLog .title-cell {
    white-space: nowrap;
    vertical-align: top;
    width: 1%;
}

.updaterLog td, .updaterLog th {
    height: auto;
    padding: 4px 8px;
}
</style>
