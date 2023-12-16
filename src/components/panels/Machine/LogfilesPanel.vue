<template>
    <div>
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
                            :loading="loadings.includes('loadingBtnRolloverLogs')"
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
            <v-card-text :class="'text-center text-lg-left'">
                <v-row class="pt-3">
                    <logfiles-panel-generic-log v-for="logfile in genericLogfiles" :key="logfile" :name="logfile" />
                </v-row>
            </v-card-text>
        </panel>
        <logfiles-panel-rollover-dialog :show="showRolloverDialog" @close-dialog="showRolloverDialog = false" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiFileDocumentEdit, mdiFileSyncOutline } from '@mdi/js'
import { genericLogfiles } from '@/store/variables'
import LogfilesPanelGenericLog from '@/components/panels/Machine/LogfilesPanel/LogfilesPanelGenericLog.vue'
@Component({
    components: { LogfilesPanelGenericLog, Panel },
})
export default class LogfilesPanel extends Mixins(BaseMixin) {
    mdiFileDocumentEdit = mdiFileDocumentEdit
    mdiFileSyncOutline = mdiFileSyncOutline

    genericLogfiles = genericLogfiles

    showRolloverDialog = false
}
</script>
