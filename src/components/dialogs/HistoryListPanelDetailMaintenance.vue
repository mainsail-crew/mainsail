<template>
    <v-dialog :value="show" :max-width="500" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.Maintenance')"
            :icon="mdiNotebook"
            card-class="history-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showEditDialog = true">
                    <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <overlay-scrollbars style="height: 350px">
                <v-card-text class="pb-0">
                    <v-row>
                        <v-col>
                            <div>{{ date }}</div>
                            <p class="text-h4 text--primary">{{ item.name }}</p>
                            <div v-if="note" class="text--primary" v-html="note" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-divider class="mt-3 mb-0" />
                <v-card-text class="pt-0 mb-0 pb-0">
                    <v-timeline align-top dense>
                        <v-timeline-item class="pb-1" small>
                            <strong>{{ outputFirstPointOfHistory }}</strong>
                        </v-timeline-item>
                        <history-list-panel-detail-maintenance-history-entry
                            v-for="entry in history"
                            :key="entry.id"
                            :item="entry"
                            :current="entry.id === item.id"
                            :last="entry.id === history[history.length - 1].id" />
                    </v-timeline>
                </v-card-text>
            </overlay-scrollbars>
            <v-divider class="mt-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" text color="primary" @click="showPerformDialog = true">
                    {{ $t('History.Perform') }}
                </v-btn>
            </v-card-actions>
        </panel>
        <history-list-panel-perform-maintenance
            :show="showPerformDialog"
            :item="item"
            @close="showPerformDialog = false"
            @close-both="closePerform" />
        <history-list-panel-edit-maintenance :show="showEditDialog" :item="item" @close="showEditDialog = false" />
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebook, mdiPencil } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenanceHistoryEntry from '@/components/dialogs/HistoryListPanelDetailMaintenanceHistoryEntry.vue'
import HistoryListPanelPerformMaintenance from '@/components/dialogs/HistoryListPanelPerformMaintenance.vue'

@Component({
    components: { HistoryListPanelPerformMaintenance, Panel, HistoryListPanelDetailMaintenanceHistoryEntry },
})
export default class HistoryListPanelDetailMaintenance extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiNotebook = mdiNotebook
    mdiPencil = mdiPencil

    @Prop({ type: Boolean, default: false }) readonly show!: boolean
    @Prop({ type: Object, default: false }) readonly item!: GuiMaintenanceStateEntry

    showEditDialog = false
    showPerformDialog = false

    get date() {
        return this.formatDateTime(this.item.start_time * 1000, false)
    }

    get note() {
        return this.item.note.replaceAll('\n', '<br>')
    }

    get showPerformButton() {
        if (this.item.end_time) return false

        return this.item.reminder?.type ?? false
    }

    get allEntries() {
        return this.$store.getters['gui/maintenance/getEntries'] ?? []
    }

    get history() {
        const array = []

        let latest_entry_id = this.item.id
        while (latest_entry_id) {
            const entry = this.allEntries.find((entry: GuiMaintenanceStateEntry) => entry.id === latest_entry_id)
            if (!entry) break
            array.push(entry)
            latest_entry_id = entry.last_entry
        }

        return array
    }

    get outputFirstPointOfHistory() {
        if (this.item.reminder.type === null) return this.$t('History.EntrySince')
        if (this.item.end_time === null) return this.$t('History.EntryNextPerform')

        return this.$t('History.EntryPerformedAt', { date: this.formatDateTime(this.item.end_time * 1000) })
    }

    closeDialog() {
        this.$emit('close')
    }

    closePerform() {
        this.showPerformDialog = false
        this.closeDialog()
    }
}
</script>
