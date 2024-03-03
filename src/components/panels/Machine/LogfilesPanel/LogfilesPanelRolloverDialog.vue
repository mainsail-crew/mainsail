<template>
    <v-dialog :value="show" persistent width="400" :fullscreen="isMobile">
        <panel
            :title="$t('Machine.LogfilesPanel.Rollover')"
            card-class="machine_rollover_logfiles-dialog"
            :icon="mdiFileSyncOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p class="mb-0">{{ $t('Machine.LogfilesPanel.RolloverDescription') }}</p>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col>
                        <v-checkbox
                            v-for="log in rolloverLogfiles"
                            :key="log"
                            v-model="selectedRolloverLogs"
                            :label="capitalize(log)"
                            :value="log"
                            hide-details
                            class="mt-0" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">
                    {{ $t('Machine.LogfilesPanel.Cancel') }}
                </v-btn>
                <v-btn color="primary" text @click="btnRolloverLogs">
                    {{ $t('Machine.LogfilesPanel.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiFileSyncOutline } from '@mdi/js'
import { rolloverLogfiles } from '@/store/variables'
import { capitalize } from '@/plugins/helpers'
import LogfilesPanelGenericLog from '@/components/panels/Machine/LogfilesPanel/LogfilesPanelGenericLog.vue'
@Component({
    components: { LogfilesPanelGenericLog, Panel },
})
export default class LogfilesPanelRolloverDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiFileSyncOutline = mdiFileSyncOutline

    rolloverLogfiles = rolloverLogfiles
    capitalize = capitalize

    @Prop({ type: Boolean, default: false }) show!: boolean

    selectedRolloverLogs: string[] = []

    get loadingRolloverLogs() {
        return this.loadings.filter((log) => log.startsWith('rolloverLog_')).length > 0
    }

    @Watch('loadingRolloverLogs')
    loadingRolloverLogsChanged(newVal: boolean) {
        if (newVal) this.closeDialog()
    }

    btnRolloverLogs() {
        if (this.selectedRolloverLogs.length === 0) return

        this.selectedRolloverLogs.forEach((name) => {
            this.$socket.emit(
                'server.logs.rollover',
                { application: name },
                { loading: 'rolloverLog_' + name, action: 'files/rolloverLog' }
            )
        })

        this.selectedRolloverLogs = []
    }

    closeDialog() {
        this.$emit('close-dialog')
    }
}
</script>
