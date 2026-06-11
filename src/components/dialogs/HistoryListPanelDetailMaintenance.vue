<template>
    <v-dialog v-model="showDialog" :max-width="500" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.Maintenance')"
            :icon="mdiNotebook"
            card-class="history-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showEditDialog = true">
                    <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
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
                <v-divider class="mt-3 mb-0" />
                <v-card-text class="pt-0 mb-0 pb-0">
                    <v-timeline align-top dense>
                        <v-timeline-item class="pb-1" small>
                            <strong>{{ outputFirstPointOfHistory }}</strong>
                        </v-timeline-item>
                        <history-list-panel-detail-maintenance-history-entry
                            v-for="entry in history"
                            :key="entry.id"
                            :item="entry"
                            :current="entry.id === item.id"
                            :last="entry.id === history[history.length - 1].id" />
                    </v-timeline>
                </v-card-text>
            </overlay-scrollbars>
            <v-divider class="mt-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" text color="primary" @click="showPerformDialog = true">
                    {{ $t('History.Perform') }}
                </v-btn>
            </v-card-actions>
        </panel>
        <history-list-panel-perform-maintenance
            v-model="showPerformDialog"
            :item="item"
            @close-details-dialog="closeDialog" />
        <history-list-panel-edit-maintenance v-model="showEditDialog" :item="item" />
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebook, mdiPencil } from '@mdi/js'
import type { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenanceHistoryEntry from '@/components/dialogs/HistoryListPanelDetailMaintenanceHistoryEntry.vue'
import HistoryListPanelPerformMaintenance from '@/components/dialogs/HistoryListPanelPerformMaintenance.vue'
import HistoryListPanelEditMaintenance from '@/components/dialogs/HistoryListPanelEditMaintenance.vue'

const store = useStore()
const { t } = useI18n()
const { formatDateTime } = useBase()

const props = defineProps({
    modelValue: { type: Boolean },
    item: { type: Object as () => GuiMaintenanceStateEntry, default: () => ({}) as GuiMaintenanceStateEntry },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const showEditDialog = ref(false)
const showPerformDialog = ref(false)

const date = computed(() => formatDateTime(props.item.start_time * 1000, false))

const note = computed(() => props.item.note.replaceAll('\n', '<br>'))

const showPerformButton = computed(() => {
    if (props.item.end_time) return false

    return props.item.reminder?.type ?? false
})

const allEntries = computed(() => store.getters['gui/maintenance/getEntries'] ?? [])

const history = computed(() => {
    const array = []

    let latest_entry_id = props.item.id
    while (latest_entry_id) {
        const entry = allEntries.value.find((entry: GuiMaintenanceStateEntry) => entry.id === latest_entry_id)
        if (!entry) break
        array.push(entry)
        latest_entry_id = entry.last_entry
    }

    return array
})

const outputFirstPointOfHistory = computed(() => {
    if (props.item.reminder.type === null) return t('History.EntrySince')
    if (props.item.end_time === null) return t('History.EntryNextPerform')

    return t('History.EntryPerformedAt', { date: formatDateTime(props.item.end_time * 1000) })
})

function closeDialog() {
    showDialog.value = false
}
</script>
