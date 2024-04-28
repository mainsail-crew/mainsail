<template>
    <v-dialog :value="show" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.EditMaintenance')"
            :icon="mdiNotebook"
            card-class="history-edit-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="name"
                            :rules="nameInputRules"
                            :label="$t('History.Name')"
                            hide-details="auto"
                            outlined
                            dense />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" outlined hide-details="auto" :label="$t('History.Note')" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <settings-row :title="$t('History.Reminder')">
                            <v-select
                                v-model="reminder"
                                :items="reminderItems"
                                :disabled="item.end_time !== null"
                                outlined
                                dense
                                hide-details
                                class="mt-0" />
                        </settings-row>
                    </v-col>
                </v-row>
                <template v-if="reminder">
                    <v-row>
                        <v-col>
                            <settings-row
                                :icon="mdiAdjust"
                                :title="$t('History.FilamentBasedReminder')"
                                :sub-title="$t('History.FilamentBasedReminderDescription')">
                                <v-checkbox
                                    v-model="reminderFilament"
                                    :disabled="item.end_time !== null"
                                    hide-details
                                    class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderFilamentValue"
                                    :disabled="item.end_time !== null"
                                    hide-details="auto"
                                    type="number"
                                    class="mt-0"
                                    outlined
                                    dense
                                    :suffix="$t('History.Meter')" />
                            </settings-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <settings-row
                                :icon="mdiAlarm"
                                :title="$t('History.PrinttimeBasedReminder')"
                                :sub-title="$t('History.PrinttimeBasedReminderDescription')">
                                <v-checkbox
                                    v-model="reminderPrinttime"
                                    :disabled="item.end_time !== null"
                                    hide-details
                                    class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderPrinttimeValue"
                                    :disabled="item.end_time !== null"
                                    hide-details="auto"
                                    type="number"
                                    class="mt-0"
                                    outlined
                                    dense
                                    :suffix="$t('History.Hours')" />
                            </settings-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <settings-row
                                :icon="mdiCalendar"
                                :title="$t('History.DateBasedReminder')"
                                :sub-title="$t('History.DateBasedReminderDescription')">
                                <v-checkbox
                                    v-model="reminderDate"
                                    :disabled="item.end_time !== null"
                                    hide-details
                                    class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderDateValue"
                                    :disabled="item.end_time !== null"
                                    hide-details="auto"
                                    type="number"
                                    class="mt-0"
                                    outlined
                                    dense
                                    :suffix="$t('History.Days')" />
                            </settings-row>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                <v-btn color="primary" text :disabled="!isValid" @click="save">{{ $t('History.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick, mdiNotebook } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class HistoryListPanelAddMaintenance extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiAlarm = mdiAlarm
    mdiCalendar = mdiCalendar
    mdiCloseThick = mdiCloseThick
    mdiNotebook = mdiNotebook

    @Prop({ type: Boolean, default: false }) readonly show!: boolean
    @Prop({ type: Object, required: true }) readonly item!: GuiMaintenanceStateEntry

    name: string = ''
    note: string = ''
    reminder: 'one-time' | 'repeat' | null = null

    reminderFilament: boolean = false
    reminderFilamentValue: number = 0

    reminderPrinttime: boolean = false
    reminderPrinttimeValue: number = 0

    reminderDate: boolean = false
    reminderDateValue: number = 0

    nameInputRules = [(value: string) => !!value || this.$t('History.InvalidNameEmpty')]

    get reminderItems() {
        return [
            {
                text: this.$t('History.NoReminder').toString(),
                value: null,
            },
            {
                text: this.$t('History.OneTime').toString(),
                value: 'one-time',
            },
            {
                text: this.$t('History.Repeat').toString(),
                value: 'repeat',
            },
        ]
    }

    get totalFilamentUsed() {
        return this.$store.state.server.history.job_totals?.total_filament_used ?? 0
    }

    get totalPrinttime() {
        return this.$store.state.server.history.job_totals?.total_print_time ?? 0
    }

    get isValid() {
        if (this.name === '') return false

        if (this.reminder !== null) {
            if (!this.reminderFilament && !this.reminderPrinttime && !this.reminderDate) return false

            if (this.reminderFilament && this.reminderFilamentValue <= 0) return false
            if (this.reminderPrinttime && this.reminderPrinttimeValue <= 0) return false
            if (this.reminderDate && this.reminderDateValue <= 0) return false
        }

        return true
    }

    closeDialog() {
        this.$emit('close')
    }

    save() {
        const item = { ...this.item }
        // Remove type from item, this is not needed and comes from the history list
        // @ts-ignore
        if ('type' in item) delete item.type

        item.name = this.name
        item.note = this.note
        item.reminder = {
            type: this.reminder,
            filament: {
                bool: this.reminderFilament,
                value: this.reminderFilamentValue,
            },
            printtime: {
                bool: this.reminderPrinttime,
                value: this.reminderPrinttimeValue,
            },
            date: {
                bool: this.reminderDate,
                value: this.reminderDateValue,
            },
        }

        this.$store.dispatch('gui/maintenance/update', item)

        this.closeDialog()
    }

    @Watch('show')
    onShowChanged() {
        if (this.show) {
            this.name = this.item.name
            this.note = this.item.note
            this.reminder = this.item.reminder?.type ?? null
            this.reminderFilament = this.item.reminder?.filament.bool ?? false
            this.reminderFilamentValue = this.item.reminder?.filament.value ?? 0
            this.reminderPrinttime = this.item.reminder?.printtime.bool ?? false
            this.reminderPrinttimeValue = this.item.reminder?.printtime.value ?? 0
            this.reminderDate = this.item.reminder?.date.bool ?? false
            this.reminderDateValue = this.item.reminder?.date.value ?? 0
        }
    }
}
</script>
