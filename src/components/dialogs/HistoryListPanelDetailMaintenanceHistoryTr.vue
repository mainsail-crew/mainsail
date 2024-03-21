<template>
    <tr>
        <td>{{ date }}</td>
        <td v-if="restFilamentText">{{ restFilamentText }}</td>
        <td v-if="restPrinttimeText">{{ restPrinttimeText }}</td>
        <td v-if="restDaysText">{{ restDaysText }}</td>
    </tr>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

@Component({
    components: { Panel },
})
export default class HistoryListPanelDetailMaintenanceHistoryTr extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiAlarm = mdiAlarm
    mdiCalendar = mdiCalendar
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Object, default: false }) readonly item!: GuiMaintenanceStateEntry

    get date() {
        return this.formatDate(this.item.start_time * 1000)
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

        return `${this.restFilament.toFixed(0)} m`
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

        return `${this.restPrinttime.toFixed(1)} h`
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

        return `${this.restDays.toFixed(0)} days`
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
