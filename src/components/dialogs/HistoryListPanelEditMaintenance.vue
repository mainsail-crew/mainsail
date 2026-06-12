<template>
    <v-dialog v-model="showDialog" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.EditMaintenance')"
            :icon="mdiNotebook"
            card-class="history-edit-maintenance-dialog"
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
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick, mdiNotebook } from '@mdi/js'
import type { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

const store = useStore()
const { t } = useI18n()

const props = defineProps({
    modelValue: { type: Boolean },
    item: { type: Object as () => GuiMaintenanceStateEntry, required: true },
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
    // Remove type from item, this is not needed and comes from the history list
    const item = { ...props.item } as GuiMaintenanceStateEntry & { type?: string }
    delete (item as GuiMaintenanceStateEntry & { type?: string }).type

    item.name = name.value
    item.note = note.value
    item.reminder = {
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
    }

    store.dispatch('gui/maintenance/update', item)

    closeDialog()
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal || !props.item) return

    name.value = props.item.name
    note.value = props.item.note
    reminder.value = props.item.reminder?.type ?? null
    reminderFilament.value = props.item.reminder?.filament.bool ?? false
    reminderFilamentValue.value = props.item.reminder?.filament.value ?? 0
    reminderPrinttime.value = props.item.reminder?.printtime.bool ?? false
    reminderPrinttimeValue.value = props.item.reminder?.printtime.value ?? 0
    reminderDate.value = props.item.reminder?.date.bool ?? false
    reminderDateValue.value = props.item.reminder?.date.value ?? 0
})
</script>
