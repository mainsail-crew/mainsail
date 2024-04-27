<template>
    <v-dialog :value="show" max-width="400">
        <panel :title="$t('History.Delete')" card-class="history-delete-selected-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <p class="mb-0">{{ question }}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="" text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                <v-btn color="error" text @click="deleteSelectedJobs">{{ $t('History.Delete') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import { HistoryListPanelRow } from '@/components/panels/HistoryListPanel.vue'

@Component({
    components: { Panel },
})
export default class HistoryListPanelDeleteSelectedDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) readonly show!: boolean

    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    set selectedJobs(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.history.selectedJobs', value: newVal })
    }

    get question() {
        if (this.selectedJobs.length === 1) return this.$t('History.DeleteSingleJobQuestion')

        return this.$t('History.DeleteSelectedQuestion', { count: this.selectedJobs.length })
    }

    closeDialog() {
        this.$emit('close')
    }

    deleteSelectedJobs() {
        this.selectedJobs.forEach((item: HistoryListPanelRow) => {
            if (item.type === 'maintenance') {
                this.$store.dispatch('gui/maintenance/delete', item.id)
                return
            }

            // break if job_id is not present
            if (!('job_id' in item)) return

            this.$socket.emit(
                'server.history.delete_job',
                { uid: item.job_id },
                { action: 'server/history/getDeletedJobs' }
            )
        })

        this.selectedJobs = []
        this.closeDialog()
    }
}
</script>
