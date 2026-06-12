<template>
    <v-dialog v-model="showDialog" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.AddMaintenance')"
            :icon="mdiNotebookPlus"
            card-class="history-add-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
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
                        <v-textarea v-model="note" variant="outlined" hide-details="auto" :label="$t('History.Note')" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <settings-row :title="$t('History.Reminder')">
                            <v-select
                                v-model="reminder"
                                :items="reminderItems"
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
                                <v-checkbox v-model="reminderFilament" hide-details class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderFilamentValue"
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
                                <v-checkbox v-model="reminderPrinttime" hide-details class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderPrinttimeValue"
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
                                <v-checkbox v-model="reminderDate" hide-details class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderDateValue"
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
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" variant="text" :disabled="!isValid" @click="save">{{ $t('Buttons.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick, mdiNotebookPlus } from '@mdi/js'

const store = useStore()
const { t } = useI18n()

const props = defineProps({
    modelValue: { type: Boolean },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const name = ref('')
const note = ref('')
const reminder = ref<'one-time' | 'repeat' | null>(null)

const reminderFilament = ref(false)
const reminderFilamentValue = ref(0)

const reminderPrinttime = ref(false)
const reminderPrinttimeValue = ref(0)

const reminderDate = ref(false)
const reminderDateValue = ref(0)

const nameInputRules = [(value: string) => !!value || t('History.InvalidNameEmpty')]

const reminderItems = computed(() => [
    {
        text: t('History.NoReminder').toString(),
        value: null,
    },
    {
        text: t('History.OneTime').toString(),
        value: 'one-time',
    },
    {
        text: t('History.Repeat').toString(),
        value: 'repeat',
    },
])

const totalFilamentUsed = computed(() => store.state.server.history.job_totals?.total_filament_used ?? 0)

const totalPrinttime = computed(() => store.state.server.history.job_totals?.total_print_time ?? 0)

const isValid = computed(() => {
    if (name.value === '') return false

    if (reminder.value !== null) {
        if (!reminderFilament.value && !reminderPrinttime.value && !reminderDate.value) return false

        if (reminderFilament.value && reminderFilamentValue.value <= 0) return false
        if (reminderPrinttime.value && reminderPrinttimeValue.value <= 0) return false
        if (reminderDate.value && reminderDateValue.value <= 0) return false
    }

    return true
})

function closeDialog() {
    showDialog.value = false
}

function save() {
    const date = new Date()
    store.dispatch('gui/maintenance/store', {
        entry: {
            name: name.value,
            note: note.value,
            // divided by 1000 to get seconds, because history entries are also in seconds
            start_time: date.getTime() / 1000,
            end_time: null,
            start_filament: totalFilamentUsed.value,
            end_filament: null,
            start_printtime: totalPrinttime.value,
            end_printtime: null,

            reminder: {
                type: reminder.value,

                filament: {
                    bool: reminderFilament.value,
                    value: reminderFilamentValue.value,
                },

                printtime: {
                    bool: reminderPrinttime.value,
                    value: reminderPrinttimeValue.value,
                },

                date: {
                    bool: reminderDate.value,
                    value: reminderDateValue.value,
                },
            },
        },
    })

    closeDialog()
}

function resetValues() {
    name.value = ''
    note.value = ''
    reminder.value = null
    reminderFilament.value = false
    reminderFilamentValue.value = 0
    reminderPrinttime.value = false
    reminderPrinttimeValue.value = 0
    reminderDate.value = false
    reminderDateValue.value = 0
}

watch(showDialog, () => {
    if (showDialog.value) resetValues()
})
</script>
