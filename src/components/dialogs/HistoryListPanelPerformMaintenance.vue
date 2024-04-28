<template>
    <v-dialog :value="show" :max-width="400" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.PerformMaintenance')"
            :icon="mdiNotebook"
            card-class="history-perform-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" outlined hide-details="auto" :label="$t('History.AddANote')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" text color="primary" @click="perform">{{ performButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebook } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenanceHistoryEntry from '@/components/dialogs/HistoryListPanelDetailMaintenanceHistoryEntry.vue'

@Component({
    components: { Panel, HistoryListPanelDetailMaintenanceHistoryEntry },
})
export default class HistoryListPanelPerformMaintenance extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiNotebook = mdiNotebook

    @Prop({ type: Boolean, default: false }) readonly show!: boolean
    @Prop({ type: Object, default: false }) readonly item!: GuiMaintenanceStateEntry

    note: string = ''

    get showPerformButton() {
        if (this.item.end_time) return false

        return this.item.reminder?.type ?? false
    }

    get performButtonText() {
        if (this.item.reminder?.type === 'repeat') return this.$t('History.PerformedAndReschedule')

        return this.$t('History.Performed')
    }

    closeDialog() {
        this.$emit('close')
    }

    perform() {
        this.$store.dispatch('gui/maintenance/perform', { id: this.item.id, note: this.note })
        this.$emit('close-both')
    }

    @Watch('show')
    onShowChanged(show: boolean) {
        if (show) this.note = ''
    }
}
</script>
