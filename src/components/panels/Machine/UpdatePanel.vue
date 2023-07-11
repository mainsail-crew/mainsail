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
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            tile
                            color="primary"
                            :ripple="true"
                            :loading="loadings.includes('loadingBtnSyncUpdateManager')"
                            :disabled="['printing', 'paused'].includes(printer_state)"
                            v-bind="attrs"
                            @click="btnSync"
                            v-on="on">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Machine.UpdatePanel.CheckForUpdates') }}</span>
                </v-tooltip>
            </template>
            <v-card-text class="px-0 py-0 update-manager-list">
                <template v-if="checkInitState">
                    <template v-for="(module, index) in modules">
                        <v-divider v-if="index" :key="'divider_' + module.name" class="my-0" />
                        <update-panel-entry :key="module.name" :repo="module.data" />
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
                            <v-alert class="mb-0" text dense type="info" border="left">
                                {{ $t('Machine.UpdatePanel.InitUpdateManager') }}
                            </v-alert>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
        </panel>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import UpdatePanelEntry from '@/components/panels/Machine/UpdatePanel/Entry.vue'
import UpdatePanelEntrySystem from '@/components/panels/Machine/UpdatePanel/EntrySystem.vue'
import UpdatePanelEntryAll from '@/components/panels/Machine/UpdatePanel/EntryAll.vue'
import { mdiRefresh, mdiInformation, mdiCloseThick, mdiUpdate } from '@mdi/js'
import { ServerUpdateManagerStateGuiList } from '@/store/server/updateManager/types'
import semver from 'semver'

@Component({
    components: { Panel, UpdatePanelEntry, UpdatePanelEntrySystem, UpdatePanelEntryAll },
})
export default class UpdatePanel extends Mixins(BaseMixin) {
    mdiRefresh = mdiRefresh
    mdiInformation = mdiInformation
    mdiCloseThick = mdiCloseThick
    mdiUpdate = mdiUpdate

    get enableUpdateManager() {
        return this.$store.state.server.components.includes('update_manager')
    }

    get modules() {
        return this.$store.getters['server/updateManager/getUpdateManagerList'] ?? []
    }

    get existsSystemModul() {
        return 'system' in this.$store.state.server.updateManager
    }

    get systemPackagesCount() {
        return this.$store.state.server.updateManager?.system?.package_count ?? 0
    }

    get checkInitState() {
        const initModules = this.modules.filter(
            (module: ServerUpdateManagerStateGuiList) => module.data.remote_version !== '?'
        )

        return initModules.length > 0
    }

    get showUpdateAll() {
        let count = 0

        this.modules.forEach((module: ServerUpdateManagerStateGuiList) => {
            // check git repos for updates
            if (module.type === 'git' && module.data?.commits_behind?.length) {
                count++
                return
            }

            // check client web for updates
            if (
                module.type === 'web' &&
                semver.valid(module.data?.remote_version) &&
                semver.valid(module.data?.version) &&
                semver.gt(module.data?.remote_version, module.data?.version)
            ) {
                count++
                return
            }
        })

        // check system packages for upgrades
        if (this.systemPackagesCount > 0) count++

        return count > 1
    }

    btnSync() {
        this.$socket.emit(
            'machine.update.status',
            { refresh: true },
            { action: 'server/updateManager/onUpdateStatus', loading: 'loadingBtnSyncUpdateManager' }
        )
    }
}
</script>

<style scoped>
::v-deep .update-manager-list > div:last-child > div.row {
    padding-bottom: 0 !important;
}
</style>
