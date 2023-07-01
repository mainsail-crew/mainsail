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
            <v-card-text class="px-0 py-0">
                <template v-for="(module, index) in modules">
                    <v-divider v-if="index" :key="'divider_' + module.name" class="my-0" />
                    <update-panel-entry :key="module.name" :repo="module.data" />
                </template>
                <template v-if="showUpdateAll">
                    <v-divider class="mb-0 mt-2 border-top-2"></v-divider>
                    <v-row class="pt-3">
                        <v-col class="text-center">
                            <v-btn
                                text
                                color="primary"
                                small
                                :disabled="['printing', 'paused'].includes(printer_state)"
                                @click="updateAll">
                                <v-icon left>{{ mdiProgressUpload }}</v-icon>
                                {{ $t('Machine.UpdatePanel.UpdateAll') }}
                            </v-btn>
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
import { mdiRefresh, mdiInformation, mdiProgressUpload, mdiCloseThick, mdiUpdate } from '@mdi/js'

@Component({
    components: { Panel, UpdatePanelEntry },
})
export default class UpdatePanel extends Mixins(BaseMixin) {
    mdiRefresh = mdiRefresh
    mdiInformation = mdiInformation
    mdiProgressUpload = mdiProgressUpload
    mdiCloseThick = mdiCloseThick
    mdiUpdate = mdiUpdate

    get enableUpdateManager() {
        return this.$store.state.server.components.includes('update_manager')
    }

    get modules() {
        return this.$store.getters['server/updateManager/getUpdateManagerList'] ?? []
    }

    get showUpdateAll() {
        /*let updateableModuls = 0

        Object.keys(this.updateableSoftwares).forEach((modulename) => {
            const module = this.updateableSoftwares[modulename]
            if (
                'version' in module &&
                'remote_version' in module &&
                semver.valid(module.remote_version) &&
                semver.valid(module.version) &&
                semver.gt(module.remote_version, module.version)
            )
                updateableModuls++
        })

        if (this.version_info?.system?.package_count > 0) updateableModuls++
        return updateableModuls > 1*/

        return false
    }

    btnSync() {
        this.$socket.emit(
            'machine.update.status',
            { refresh: true },
            { action: 'server/updateManager/onUpdateStatus', loading: 'loadingBtnSyncUpdateManager' }
        )
    }

    updateAll() {
        this.$socket.emit('machine.update.full', {})
    }
}
</script>
