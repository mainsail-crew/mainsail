<template>
    <v-dialog :value="show" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.AddMaintenance')"
            :icon="mdiNotebookPlus"
            card-class="history-note-dialog"
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
                        <settings-row :title="$t('History.AddReminder')">
                            <v-switch v-model="reminder" hide-details class="mt-0" />
                        </settings-row>
                    </v-col>
                </v-row>
                <template v-if="reminder">
                    <v-row>
                        <v-col>
                            <settings-row :title="$t('History.Repeat')">
                                <v-switch v-model="reminderRepeat" hide-details class="mt-0" />
                            </settings-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <settings-row
                                :title="$t('History.FilamentBasedReminder')"
                                :sub-title="$t('History.FilamentBasedReminderDescription')">
                                <v-checkbox v-model="reminderFilament" hide-details class="mt-0" />
                                <v-text-field
                                    v-model="reminderFilamentValue"
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
                                :title="$t('History.PrinttimeBasedReminder')"
                                :sub-title="$t('History.PrinttimeBasedReminderDescription')">
                                <v-checkbox v-model="reminderPrinttime" hide-details class="mt-0" />
                                <v-text-field
                                    v-model="reminderPrinttimeValue"
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
                                :title="$t('History.DateBasedReminder')"
                                :sub-title="$t('History.DateBasedReminderDescription')">
                                <v-checkbox v-model="reminderDate" hide-details class="mt-0" />
                                <v-text-field
                                    v-model="reminderDateValue"
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
                <v-btn color="primary" text @click="save">{{ $t('History.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebookPlus } from '@mdi/js'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class HistoryListPanelAddMaintenance extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiNotebookPlus = mdiNotebookPlus

    @Prop({ type: Boolean, default: false }) readonly show!: boolean

    name: string = ''
    note: string = ''
    reminder: boolean = false
    reminderRepeat: boolean = false

    reminderFilament: boolean = false
    reminderFilamentValue: number = 0

    reminderPrinttime: boolean = false
    reminderPrinttimeValue: number = 0

    reminderDate: boolean = false
    reminderDateValue: number = 0

    nameInputRules = [(value: string) => !!value || this.$t('History.InvalidNameEmpty')]

    get totalFilamentUsed() {
        return this.$store.state.server.history.job_totals?.total_filament_used ?? 0
    }

    get totalPrinttime() {
        return this.$store.state.server.history.job_totals?.total_print_time ?? 0
    }

    closeDialog() {
        this.$emit('close')
    }

    save() {
        let reminderFilamentTrigger: number | null = null
        if (this.reminderFilament) {
            reminderFilamentTrigger = this.totalFilamentUsed + this.reminderFilamentValue * 100
        }

        let reminderPrinttimeTrigger: number | null = null
        if (this.reminderPrinttime) {
            reminderPrinttimeTrigger = this.totalPrinttime + this.reminderPrinttimeValue * 60 * 60
        }

        const date = new Date()
        let reminderDateTrigger: number | null = null
        if (this.reminderDate) {
            reminderDateTrigger = date.getTime() + this.reminderDateValue * 24 * 60 * 60 * 1000
        }

        this.$store.dispatch('gui/maintenance/store', {
            entry: {
                name: this.name,
                note: this.note,
                // divided by 1000 to get seconds, because history entries are also in seconds
                start_time: date.getTime() / 1000,
                end_time: null,
                start_filament: this.totalFilamentUsed,
                start_total_print_time: this.totalPrinttime,

                reminder: {
                    bool: this.reminder,
                    repeat: this.reminderRepeat,

                    filament: {
                        bool: this.reminderFilament,
                        trigger: reminderFilamentTrigger,
                        end: null,
                    },

                    printtime: {
                        bool: this.reminderPrinttime,
                        trigger: reminderPrinttimeTrigger,
                        end: null,
                    },

                    date: {
                        bool: this.reminderDate,
                        trigger: reminderDateTrigger,
                        end: null,
                    },
                },
            },
        })

        this.closeDialog()
    }

    resetValues() {
        this.name = ''
        this.note = ''
        this.reminder = false
        this.reminderRepeat = false
        this.reminderFilament = false
        this.reminderFilamentValue = 0
        this.reminderPrinttime = false
        this.reminderPrinttimeValue = 0
        this.reminderDate = false
        this.reminderDateValue = 0
    }

    @Watch('show')
    onShowChanged() {
        if (this.show) this.resetValues()
    }
}
</script>
