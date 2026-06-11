<template>
    <div>
        <panel
            v-if="enableUpdateManager"
            :title="$t('Machine.UpdatePanel.UpdateManager')"
            :icon="mdiUpdate"
            card-class="machine-update-panel"
            :collapsible="true">
            <template #buttons>
                <v-tooltip top>
                    <template #activator="{ props }">
                        <v-btn
                            icon
                            tile
                            color="primary"
                            :ripple="true"
                            :loading="loadings.includes('loadingBtnSyncUpdateManager')"
                            :disabled="['printing', 'paused'].includes(printer_state)"
                            v-bind="props"
                            @click="btnSync">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Machine.UpdatePanel.CheckForUpdates') }}</span>
                </v-tooltip>
            </template>
            <v-card-text class="px-0 py-0 update-manager-list">
                <template v-if="checkInitState">
                    <template v-for="(module, index) in modules" :key="module.name">
                        <v-divider v-if="index" class="my-0" />
                        <update-panel-entry :repo="module.data" />
                    </template>
                    <template v-if="existsSystemModul">
                        <v-divider v-if="modules.length" class="my-0" />
                        <update-panel-entry-system />
                    </template>
                    <template v-if="showUpdateAll">
                        <v-divider class="mb-0 mt-2 border-top-2" />
                        <update-panel-entry-all />
                    </template>
                </template>
                <template v-else>
                    <v-row class="mt-0 mb-0">
                        <v-col class="px-6">
                            <v-alert class="mb-0" text dense type="info" border="start">
                                {{ $t('Machine.UpdatePanel.InitUpdateManager') }}
                            </v-alert>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
        </panel>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import UpdatePanelEntry from '@/components/panels/Machine/UpdatePanel/Entry.vue'
import UpdatePanelEntrySystem from '@/components/panels/Machine/UpdatePanel/EntrySystem.vue'
import UpdatePanelEntryAll from '@/components/panels/Machine/UpdatePanel/EntryAll.vue'
import { mdiRefresh, mdiInformation, mdiCloseThick, mdiUpdate } from '@mdi/js'
import { ServerUpdateManagerStateGuiList } from '@/store/server/updateManager/types'
import semver from 'semver'

const { loadings, printer_state } = useBase()
const store = useStore()
const socket = useSocket()


const enableUpdateManager = computed(() =>
    store.state.server.components.includes('update_manager')
)

const modules = computed(() =>
    store.getters['server/updateManager/getUpdateManagerList'] ?? []
)

const existsSystemModul = computed(() =>
    'system' in store.state.server.updateManager
)

const systemPackagesCount = computed(() =>
    store.state.server.updateManager?.system?.package_count ?? 0
)

const checkInitState = computed(() => {
    const initModules = modules.value.filter(
        (module: ServerUpdateManagerStateGuiList) => module.data.remote_version !== '?'
    )
    return initModules.length > 0
})

const showUpdateAll = computed(() => {
    let count = 0
    modules.value.forEach((module: ServerUpdateManagerStateGuiList) => {
        if (module.type === 'git' && module.data?.commits_behind?.length) {
            count++
            return
        }
        if (
            module.type === 'web' &&
            semver.valid(module.data?.remote_version, { loose: true }) &&
            semver.valid(module.data?.version, { loose: true }) &&
            semver.gt(module.data?.remote_version, module.data?.version, { loose: true })
        ) {
            count++
            return
        }
    })
    if (systemPackagesCount.value > 0) count++
    return count > 1
})

function btnSync() {
    socket.emit(
        'machine.update.status',
        { refresh: true },
        { action: 'server/updateManager/onUpdateStatus', loading: 'loadingBtnSyncUpdateManager' }
    )
}
</script>

<style scoped>
:deep(.update-manager-list) > div:last-child > div.row {
    padding-bottom: 0 !important;
}
</style>
