<template>
    <tr
        :key="item.id"
        v-longpress:600="(e) => showContextMenu(e)"
        :class="cssClasses"
        @contextmenu="showContextMenu($event)"
        @click="detailsDialogBool = true">
        <td class="pr-0">
            <v-simple-checkbox v-ripple :value="isSelected" class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <v-icon color="primary">{{ icon }}</v-icon>
        </td>
        <td>{{ item.name }}</td>
        <td class="text-right text-no-wrap">
            <v-tooltip v-if="reminder !== null" top>
                <template #activator="{ on, attrs }">
                    <v-icon small color="primary" v-bind="attrs" v-on="on">
                        {{ alarmIcon }}
                    </v-icon>
                </template>
                <div>
                    <div v-if="restTextFilament">
                        <v-icon small class="mr-1">{{ mdiAdjust }}</v-icon>
                        {{ restTextFilament }}
                    </div>
                    <div v-if="restTextPrinttime">
                        <v-icon small class="mr-1">{{ mdiAlarm }}</v-icon>
                        {{ restTextPrinttime }}
                    </div>
                    <div v-if="restTextDays">
                        <v-icon small class="mr-1">{{ mdiCalendar }}</v-icon>
                        {{ restTextDays }}
                    </div>
                </div>
            </v-tooltip>
        </td>
        <td class="text-left text-no-wrap">
            {{ formatDateTime(item.start_time * 1000, false) }}
        </td>
        <td :colspan="tableFields.length - 1" />
        <v-menu v-model="contextMenuBool" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item @click="detailsDialogBool = true">
                    <v-icon class="mr-1">{{ mdiTextBoxSearch }}</v-icon>
                    {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteEntry">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <history-list-panel-detail-maintenance
            :show="detailsDialogBool"
            :item="item"
            @close="detailsDialogBool = false" />
    </tr>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import {
    mdiAdjust,
    mdiAlarm,
    mdiAlarmMultiple,
    mdiCalendar,
    mdiDelete,
    mdiNotebook,
    mdiNotebookCheck,
    mdiTextBoxSearch,
} from '@mdi/js'
import { HistoryListPanelCol } from '@/components/panels/HistoryListPanel.vue'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenance from '@/components/dialogs/HistoryListPanelDetailMaintenance.vue'

@Component({
    components: { HistoryListPanelDetailMaintenance, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiAlarm = mdiAlarm
    mdiCalendar = mdiCalendar
    mdiDelete = mdiDelete
    mdiTextBoxSearch = mdiTextBoxSearch

    detailsDialogBool = false

    contextMenuBool = false
    contextMenuX = 0
    contextMenuY = 0

    @Prop({ type: Object, required: true }) readonly item!: GuiMaintenanceStateEntry
    @Prop({ type: Array, required: true }) readonly tableFields!: HistoryListPanelCol[]
    @Prop({ type: Boolean, required: true }) readonly isSelected!: boolean

    get cssClasses() {
        let output = ['file-list-cursor', 'user-select-none']

        return output
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

    get restTextFilament() {
        if (!this.item.reminder.filament.bool) return false

        const value = this.item.reminder.filament?.value ?? 0

        return `${this.restFilament.toFixed(0)} / ${value} m`
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

    get restTextPrinttime() {
        if (!this.item.reminder.printtime.bool) return false

        const value = this.item.reminder.printtime?.value ?? 0

        return `${this.restPrinttime.toFixed(1)} / ${value} h`
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

    get restTextDays() {
        if (!this.item.reminder.date.bool) return false

        const value = this.item.reminder.date?.value ?? 0

        return `${this.restDays.toFixed(0)} / ${value} days`
    }

    get reminder() {
        return this.item.reminder?.type ?? null
    }

    get alarmIcon() {
        if (this.reminder === 'repeat') return mdiAlarmMultiple

        return mdiAlarm
    }

    get icon() {
        if (this.item.end_time !== null) return mdiNotebookCheck

        return mdiNotebook
    }

    select(newVal: boolean) {
        this.$emit('select', newVal)
    }

    showContextMenu(e: any) {
        e?.preventDefault()
        if (this.contextMenuBool) return

        this.contextMenuBool = true
        this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

        this.$nextTick(() => {
            this.contextMenuBool = true
        })
    }

    deleteEntry() {
        this.$store.dispatch('gui/maintenance/delete', this.item.id)
    }
}
</script>
