<template>
    <tr
        :key="item.id"
        v-longpress:600="showContextMenu"
        class="file-list-cursor user-select-none"
        @contextmenu="showContextMenu($event)"
        @click="detailsDialogBool = true">
        <td class="pr-0">
            <v-checkbox v-ripple :model-value="isSelected" density="compact" hide-details class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <v-icon color="primary">{{ icon }}</v-icon>
        </td>
        <td>{{ item.name }}</td>
        <td class="text-right text-no-wrap">
            <v-tooltip v-if="reminder !== null" top>
                <template #activator="{ props: activatorProps }">
                    <v-icon size="small" color="primary" v-bind="activatorProps">
                        {{ alarmIcon }}
                    </v-icon>
                </template>
                <div>
                    <div v-if="restTextFilament">
                        <v-icon size="small" class="mr-1">{{ mdiAdjust }}</v-icon>
                        {{ restTextFilament }}
                    </div>
                    <div v-if="restTextPrinttime">
                        <v-icon size="small" class="mr-1">{{ mdiAlarm }}</v-icon>
                        {{ restTextPrinttime }}
                    </div>
                    <div v-if="restTextDays">
                        <v-icon size="small" class="mr-1">{{ mdiCalendar }}</v-icon>
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
                <v-list-item class="text-error" @click="deleteEntry">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <history-list-panel-detail-maintenance v-model="detailsDialogBool" :item="item" />
    </tr>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import type { LongpressEvent } from '@/directives/longpress'
import Panel from '@/components/ui/Panel.vue'
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
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import { HistoryListPanelCol } from '@/store/server/history/types'
import type { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenance from '@/components/dialogs/HistoryListPanelDetailMaintenance.vue'

const emit = defineEmits<{
    select: [value: boolean]
}>()

const props = defineProps<{
    item: GuiMaintenanceStateEntry
    tableFields: HistoryListPanelCol[]
    isSelected: boolean
}>()

const { formatDateTime } = useBase()
const store = useStore()

const detailsDialogBool = ref(false)
const contextMenuBool = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

const restFilament = computed(() => {
    const start = props.item?.start_filament ?? 0
    const end = props.item.end_filament ?? 0
    const current = store.state.server.history.job_totals?.total_filament_used ?? 0
    let used = current - start
    if (end) used = end - start
    used /= 1000
    return used
})

const restTextFilament = computed(() => {
    if (!props.item.reminder.filament.bool) return false
    const value = props.item.reminder.filament?.value ?? 0
    return `${restFilament.value.toFixed(0)} / ${value} m`
})

const restPrinttime = computed(() => {
    const start = props.item.start_printtime ?? 0
    const end = props.item.end_printtime ?? 0
    const current = store.state.server.history.job_totals?.total_print_time ?? 0
    let used = current - start
    if (end) used = end - start
    used /= 3600
    return used
})

const restTextPrinttime = computed(() => {
    if (!props.item.reminder.printtime.bool) return false
    const value = props.item.reminder.printtime?.value ?? 0
    return `${restPrinttime.value.toFixed(1)} / ${value} h`
})

const restDays = computed(() => {
    const start = props.item.start_time ?? 0
    const end = props.item.end_time ?? 0
    const current = new Date().getTime() / 1000
    let used = current - start
    if (end) used = end - start
    return used / (60 * 60 * 24)
})

const restTextDays = computed(() => {
    if (!props.item.reminder.date.bool) return false
    const value = props.item.reminder.date?.value ?? 0
    return `${restDays.value.toFixed(0)} / ${value} days`
})

const reminder = computed(() => props.item.reminder?.type ?? null)
const alarmIcon = computed(() => reminder.value === 'repeat' ? mdiAlarmMultiple : mdiAlarm)
const icon = computed(() => props.item.end_time !== null ? mdiNotebookCheck : mdiNotebook)

function select(newVal: boolean) {
    emit('select', newVal)
}

function showContextMenu(e: MouseEvent | LongpressEvent) {
    e?.preventDefault()
    EventBus.$emit(CLOSE_CONTEXT_MENU)
    contextMenuX.value = e?.clientX || e?.pageX || window.screenX / 2
    contextMenuY.value = e?.clientY || e?.pageY || window.screenY / 2
    contextMenuBool.value = true
}

function closeContextMenu() {
    contextMenuBool.value = false
}

function deleteEntry() {
    store.dispatch('gui/maintenance/delete', props.item.id)
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
</script>
