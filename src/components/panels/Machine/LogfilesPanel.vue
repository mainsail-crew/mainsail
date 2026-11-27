<template>
    <panel
        :title="$t('Machine.LogfilesPanel.Logfiles')"
        :icon="mdiFileDocumentEdit"
        card-class="machine-logfiles-panel"
        :collapsible="true">
        <template #buttons>
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <v-btn
                        icon
                        tile
                        color="primary"
                        :ripple="true"
                        :disabled="['printing', 'paused'].includes(printer_state)"
                        v-bind="attrs"
                        v-on="on"
                        @click="showRolloverDialog = true">
                        <v-icon>{{ mdiFileSyncOutline }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('Machine.LogfilesPanel.Rollover') }}</span>
            </v-tooltip>
        </template>
        <v-card-text class="logfiles-grid pa-3">
            <logfiles-panel-generic-log v-for="logfile in logfiles" :key="logfile" :name="logfile" />
        </v-card-text>
        <logfiles-panel-rollover-dialog v-model="showRolloverDialog" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiFileDocumentEdit, mdiFileSyncOutline } from '@mdi/js'
import { genericLogfiles } from '@/store/variables'
import LogfilesPanelGenericLog from '@/components/panels/Machine/LogfilesPanel/LogfilesPanelGenericLog.vue'
import { FileStateFile } from '@/store/files/types'

const LOGS_ROOT = 'logs'

@Component({
    components: { LogfilesPanelGenericLog, Panel },
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiFileDocumentEdit = mdiFileDocumentEdit
    mdiFileSyncOutline = mdiFileSyncOutline

    showRolloverDialog = false

    get existsLogsRoot(): boolean {
        return (this.$store.state.server.registered_directories ?? []).includes(LOGS_ROOT)
    }

    get filesInLogRoot(): FileStateFile[] {
        return this.$store.getters['files/getDirectory'](LOGS_ROOT)?.items ?? []
    }

    get logfiles() {
        const logfiles = ['klippy', 'moonraker']

        genericLogfiles.forEach((logfile: string) => {
            const existsLogfile = this.filesInLogRoot.some((file) => file.filename === `${logfile}.log`)
            if (!existsLogfile) return

            logfiles.push(logfile)
        })

        return logfiles
    }

    @Watch('existsLogsRoot', { immediate: true })
    existsLogsRootChanged(newVal: boolean) {
        if (!newVal) return

        this.$store.dispatch('files/loadDirectory', LOGS_ROOT)
    }
}
</script>

<style scoped>
.logfiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}
</style>
