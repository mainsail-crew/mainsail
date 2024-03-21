<template>
    <v-dialog :value="show" :max-width="500" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.Maintenance')"
            :icon="mdiNotebook"
            card-class="history-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
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
                <v-divider class="mt-3" />
                <v-card-text class="pb-0">
                    <template v-if="item.reminder">
                        <v-row v-if="restFilamentText">
                            <v-col>
                                <v-icon small class="mr-1">{{ mdiAdjust }}</v-icon>
                                {{ $t('History.FilamentBasedReminder') }}
                            </v-col>
                            <v-col :class="restFilamentClass">{{ restFilamentText }}</v-col>
                        </v-row>
                        <v-row v-if="restPrinttimeText">
                            <v-col>
                                <v-icon small class="mr-1">{{ mdiAlarm }}</v-icon>
                                {{ $t('History.PrinttimeBasedReminder') }}
                            </v-col>
                            <v-col :class="restPrinttimeClass">{{ restPrinttimeText }}</v-col>
                        </v-row>
                        <v-row v-if="restDaysText">
                            <v-col>
                                <v-icon small class="mr-1">{{ mdiCalendar }}</v-icon>
                                {{ $t('History.DateBasedReminder') }}
                            </v-col>
                            <v-col :class="restDaysClass">{{ restDaysText }}</v-col>
                        </v-row>
                    </template>
                </v-card-text>
                <v-divider class="mt-3 mb-0" />
                <v-card-text class="pt-0 mb-0 pb-0">
                    <v-timeline align-top dense>
                        <history-list-panel-detail-maintenance-history-entry
                            v-for="entry in history"
                            :key="entry.id"
                            :item="entry" />
                    </v-timeline>
                </v-card-text>
                <v-divider class="mt-3 mb-0" />
                <v-card-text class="pt-0 mb-0 pb-0">
                    <v-simple-table>
                        <thead>
                            <tr>
                                <th class="text-left">Date</th>
                                <th v-if="restFilamentText" class="text-center">{{ restFilamentText }}</th>
                                <th v-if="restPrinttimeText" class="text-center">{{ restPrinttimeText }}</th>
                                <th v-if="restDaysText" class="text-center">{{ restDaysText }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <history-list-panel-detail-maintenance-history-tr
                                v-for="entry in history"
                                :key="entry.id"
                                :item="entry" />
                        </tbody>
                    </v-simple-table>
                </v-card-text>
            </overlay-scrollbars>
            <v-divider class="mt-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" text color="primary" @click="perform">{{ performButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick, mdiNotebook } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenanceHistoryEntry from '@/components/dialogs/HistoryListPanelDetailMaintenanceHistoryEntry.vue'
import HistoryListPanelDetailMaintenanceHistoryTr from '@/components/dialogs/HistoryListPanelDetailMaintenanceHistoryTr.vue'

@Component({
    components: { Panel, HistoryListPanelDetailMaintenanceHistoryEntry, HistoryListPanelDetailMaintenanceHistoryTr },
})
export default class HistoryListPanelDetailMaintenance extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiAlarm = mdiAlarm
    mdiCalendar = mdiCalendar
    mdiCloseThick = mdiCloseThick
    mdiNotebook = mdiNotebook

    @Prop({ type: Boolean, default: false }) readonly show!: boolean
    @Prop({ type: Object, default: false }) readonly item!: GuiMaintenanceStateEntry

    get date() {
        return this.formatDateTime(this.item.start_time * 1000, false)
    }

    get note() {
        return this.item.note.replaceAll('\n', '<br>')
    }

    get restFilament() {
        const start = this.item?.start_filament ?? 0
        const end = this.item.end_filament ?? 0
        const current = this.$store.state.server.history.job_totals?.total_filament_used ?? 0

        // calc filament since start
        // if end is not null, calc used filament until end
        let used = current - start
        if (end) used = end - start

        // convert to m
        used /= 1000

        return used
    }

    get restFilamentText() {
        if (!this.item.reminder.filament.bool) return false

        const value = this.item.reminder.filament?.value ?? 0

        return `${this.restFilament.toFixed(0)} / ${value} m`
    }

    get restFilamentClass() {
        const output = ['text-right']

        if (!this.item.reminder.filament.bool) return output

        const value = this.item.reminder.filament?.value ?? 0
        if (this.restFilament > value) return [...output, 'error--text']

        return output
    }

    get restPrinttime() {
        const start = this.item.start_printtime ?? 0
        const end = this.item.end_printtime ?? 0
        const current = this.$store.state.server.history.job_totals?.total_print_time ?? 0

        // calc filament since start
        // if end is not null, calc used filament until end
        let used = current - start
        if (end) used = end - start

        // convert to h
        used /= 3600

        return used
    }

    get restPrinttimeText() {
        if (!this.item.reminder.printtime.bool) return false

        const value = this.item.reminder.printtime?.value ?? 0

        return `${this.restPrinttime.toFixed(1)} / ${value} h`
    }

    get restPrinttimeClass() {
        const output = ['text-right']

        if (!this.item.reminder.printtime.bool) return output

        const value = this.item.reminder.printtime?.value ?? 0
        if (this.restPrinttime > value) return [...output, 'error--text']

        return output
    }

    get restDays() {
        const start = this.item.start_time ?? 0
        const end = this.item.end_time ?? 0
        const current = new Date().getTime() / 1000

        // calc days since start
        // if end is not null, calc used days until end
        let used = current - start
        if (end) used = end - start

        return used / (60 * 60 * 24)
    }

    get restDaysText() {
        if (!this.item.reminder.date.bool) return false

        const value = this.item.reminder.date?.value ?? 0

        return `${this.restDays.toFixed(0)} / ${value} days`
    }

    get restDaysClass() {
        const output = ['text-right']

        if (!this.item.reminder.date.bool) return output

        const value = this.item.reminder.date?.value ?? 0
        if (this.restDays > value) return [...output, 'error--text']

        return output
    }

    get showPerformButton() {
        if (this.item.end_time) return false

        return this.item.reminder?.type ?? false
    }

    get performButtonText() {
        if (this.item.reminder?.type === 'repeat') return this.$t('History.PerformedAndReschedule')

        return this.$t('History.Performed')
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

        window.console.log(array)

        return array
    }

    closeDialog() {
        this.$emit('close')
    }

    perform() {
        this.$store.dispatch('gui/maintenance/perform', { id: this.item.id })
    }
}
</script>
