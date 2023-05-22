<template>
    <div>
        <v-btn class="px-2 minwidth-0 ml-3" @click="openDialog">
            <v-icon>{{ mdiNotebookPlus }}</v-icon>
        </v-btn>
        <v-dialog v-model="show" :max-width="600" persistent @keydown.esc="closeDialog">
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
                    <v-btn color="" text @click="closeDialog">{{ $t('History.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="save">{{ $t('History.Save') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
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

    private show: boolean = false

    private name: string = ''
    private note: string = ''
    private reminder: boolean = false
    private reminderRepeat: boolean = false

    private reminderFilament: boolean = false
    private reminderFilamentValue: number = 0

    private reminderPrinttime: boolean = false
    private reminderPrinttimeValue: number = 0

    private reminderDate: boolean = false
    private reminderDateValue: number = 0

    private nameInputRules = [(value: string) => !!value || this.$t('History.InvalidNameEmpty')]

    get totalFilamentUsed() {
        return this.$store.state.server.history.job_totals?.total_filament_used ?? 0
    }

    get totalPrinttime() {
        return this.$store.state.server.history.job_totals?.total_print_time ?? 0
    }

    openDialog() {
        this.show = true
    }

    closeDialog() {
        this.show = false
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
                start_time: date.getTime(),
                end_time: null,

                reminder: this.reminder,
                reminderRepeat: this.reminderRepeat,

                reminderFilament: this.reminderFilament,
                reminderFilamentStart: this.totalFilamentUsed,
                reminderFilamentTrigger: reminderFilamentTrigger,
                reminderFilamentEnd: null,

                reminderPrinttime: this.reminderPrinttime,
                reminderPrinttimeStart: this.totalPrinttime,
                reminderPrinttimeTrigger: reminderPrinttimeTrigger,
                reminderPrinttimeEnd: null,

                reminderDate: this.reminderDate,
                reminderDateTrigger: reminderDateTrigger,
            },
        })
    }
}
</script>
