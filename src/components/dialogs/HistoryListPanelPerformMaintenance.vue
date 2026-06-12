<template>
    <v-dialog v-model="showDialog" :max-width="400" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.PerformMaintenance')"
            :icon="mdiNotebook"
            card-class="history-perform-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" variant="outlined" hide-details="auto" :label="$t('History.AddANote')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" variant="text" color="primary" @click="perform">{{ performButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebook } from '@mdi/js'
import type { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

const store = useStore()
const { t } = useI18n()

const props = defineProps({
    modelValue: { type: Boolean },
    item: { type: Object as () => GuiMaintenanceStateEntry, default: () => ({}) as GuiMaintenanceStateEntry },
})
const emit = defineEmits(['update:modelValue', 'close-details-dialog'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const note = ref('')

const showPerformButton = computed(() => {
    if (props.item.end_time) return false

    return props.item.reminder?.type ?? false
})

const performButtonText = computed(() => {
    if (props.item.reminder?.type === 'repeat') return t('History.PerformedAndReschedule')

    return t('History.Performed')
})

function closeDialog() {
    showDialog.value = false
}

function perform() {
    store.dispatch('gui/maintenance/perform', { id: props.item.id, note: note.value })
    emit('close-details-dialog')
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    note.value = ''
})
</script>
