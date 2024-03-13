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
                            <div>Word of the Day</div>
                            <p class="text-h4 text--primary">{{ item.name }}</p>
                            <div v-if="note" class="text--primary" v-html="note" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-divider class="my-3" />
                <v-card-text class="pb-0">
                    <template v-if="item.reminder">
                        <v-row v-if="restTextFilament">
                            <v-col>
                                <v-icon small class="mr-1">{{ mdiAdjust }}</v-icon>
                                {{ $t('History.FilamentBasedReminder') }}
                            </v-col>
                            <v-col class="text-right">{{ restTextFilament }}</v-col>
                        </v-row>
                        <v-row v-if="restTextPrinttime">
                            <v-col>
                                <v-icon small class="mr-1">{{ mdiAlarm }}</v-icon>
                                {{ $t('History.PrinttimeBasedReminder') }}
                            </v-col>
                            <v-col class="text-right">{{ restTextPrinttime }}</v-col>
                        </v-row>
                        <v-row v-if="restTextDays">
                            <v-col>
                                <v-icon small class="mr-1">{{ mdiCalendar }}</v-icon>
                                {{ $t('History.DateBasedReminder') }}
                            </v-col>
                            <v-col class="text-right">{{ restTextDays }}</v-col>
                        </v-row>
                    </template>
                </v-card-text>
            </overlay-scrollbars>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick, mdiNotebook } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

@Component({
    components: { Panel },
})
export default class HistoryListPanelDetailMaintenance extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiAlarm = mdiAlarm
    mdiCalendar = mdiCalendar
    mdiCloseThick = mdiCloseThick
    mdiNotebook = mdiNotebook

    @Prop({ type: Boolean, default: false }) readonly show!: boolean
    @Prop({ type: Object, default: false }) readonly item!: GuiMaintenanceStateEntry

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

    closeDialog() {
        this.$emit('close')
    }
}
</script>
