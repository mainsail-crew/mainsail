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
        <logfiles-panel-rollover-dialog v-model="showRolloverDialog" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { mdiFileDocumentEdit, mdiFileSyncOutline } from '@mdi/js'
import { genericLogfiles } from '@/store/variables'
import LogfilesPanelGenericLog from '@/components/panels/Machine/LogfilesPanel/LogfilesPanelGenericLog.vue'

const { loadings, printer_state } = useBase()

const mdiFileDocumentEdit = mdiFileDocumentEdit
const mdiFileSyncOutline = mdiFileSyncOutline

const showRolloverDialog = ref(false)
</script>
