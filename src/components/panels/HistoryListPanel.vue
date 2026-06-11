<template>
    <panel :icon="mdiFileDocumentMultipleOutline" :title="$t('History.PrintHistory')" card-class="history-list-panel">
        <v-card-text>
            <v-row>
                <v-col class="col-4 d-flex align-center">
                    <v-text-field
                        v-model="search"
                        :append-icon="mdiMagnify"
                        :label="$t('History.Search')"
                        single-line
                        outlined
                        clearable
                        hide-details
                        dense />
                </v-col>
                <v-col class="offset-4 col-4 d-flex align-center justify-end">
                    <v-tooltip v-if="selectedJobsTable.length" top>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                color="error"
                                class="px-2 minwidth-0 ml-3"
                                v-bind="attrs"
                                v-on="on"
                                @click="deleteSelectedDialog = true">
                                <v-icon>{{ mdiDelete }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Buttons.Delete') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                class="px-2 minwidth-0 ml-3"
                                v-bind="attrs"
                                v-on="on"
                                @click="addMaintenanceDialog = true">
                                <v-icon>{{ mdiNotebookPlus }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('History.AddMaintenance') }}</span>
                    </v-tooltip>
                    <v-tooltip v-if="!allLoaded" top>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                :loading="loadings.includes('historyLoadAll')"
                                class="px-2 minwidth-0 ml-3"
                                v-bind="attrs"
                                v-on="on"
                                @click="refreshHistory">
                                <v-icon>{{ mdiDatabaseArrowDownOutline }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('History.LoadCompleteHistory') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on" @click="exportHistory">
                                <v-icon>{{ mdiDatabaseExportOutline }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('History.TitleExportHistory') }}</span>
                    </v-tooltip>
                    <v-menu :offset-y="true" :close-on-content-click="false">
                        <template #activator="{ on, attrs }">
                            <v-tooltip top>
                                <template #activator="{ on: onToolTip }">
                                    <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="{ ...on, ...onToolTip }">
                                        <v-icon>{{ mdiCog }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('History.Settings') }}</span>
                            </v-tooltip>
                        </template>
                        <v-list>
                            <v-list-item class="minHeight36">
                                <v-checkbox
                                    class="mt-0"
                                    hide-details
                                    :input-value="showMaintenanceEntries"
                                    :label="$t('History.MaintenanceEntries')"
                                    @change="showMaintenanceEntries = !showMaintenanceEntries" />
                            </v-list-item>
                            <v-list-item class="minHeight36">
                                <v-checkbox
                                    class="mt-0"
                                    hide-details
                                    :input-value="showPrintJobs"
                                    :label="$t('History.PrintJobs')"
                                    @change="showPrintJobs = !showPrintJobs" />
                            </v-list-item>
                            <v-divider />
                            <template v-if="printStatusArray.length">
                                <v-list-item v-for="status of printStatusArray" :key="status.name" class="minHeight36">
                                    <v-checkbox
                                        class="mt-0"
                                        hide-details
                                        :input-value="status.showInTable"
                                        :label="`${status.displayName} (${status.value})`"
                                        @change="changeStatusVisible(status)" />
                                </v-list-item>
                                <v-divider />
                            </template>
                            <v-list-item
                                v-for="(header, index) of configHeaders"
                                :key="'history-list-panel-header-option-' + index"
                                class="minHeight36">
                                <v-checkbox
                                    v-model="header.visible"
                                    class="mt-0"
                                    hide-details
                                    :label="header.text"
                                    @change="changeColumnVisible(header.value)" />
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-col>
            </v-row>
        </v-card-text>
        <v-divider class="mb-3" />
        <v-data-table
            v-model="selectedJobsTable"
            :items="entries"
            class="history-jobs-table"
            :headers="filteredHeaders"
            :custom-sort="sortFiles"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :items-per-page.sync="countPerPage"
            :footer-props="{
                itemsPerPageText: $t('History.Jobs'),
                itemsPerPageAllText: $t('History.AllJobs'),
                itemsPerPageOptions: [10, 25, 50, 100, -1],
            }"
            item-key="select_id"
            :search="search"
            :custom-filter="advancedSearch"
            mobile-breakpoint="0"
            show-select>
            <template #no-data>
                <div class="text-center">{{ $t('History.Empty') }}</div>
            </template>

            <template #item="{ item, isSelected, select }">
                <history-list-entry-job
                    v-if="item.type === 'job'"
                    :key="item.select_id"
                    :is-selected="isSelected"
                    :item="item"
                    :table-fields="tableFields"
                    @select="select" />
                <history-list-entry-maintenance
                    v-else-if="item.type === 'maintenance'"
                    :key="item.select_id"
                    :is-selected="isSelected"
                    :item="item"
                    :table-fields="tableFields"
                    @select="select" />
            </template>
        </v-data-table>
        <confirmation-dialog
            v-model="deleteSelectedDialog"
            :title="$t('History.Delete')"
            :text="deleteSelectedQuestion"
            :action-button-text="$t('Buttons.Delete')"
            :icon="mdiDelete"
            @action="deleteSelectedJobs" />
        <history-list-panel-add-maintenance v-model="addMaintenanceDialog" />
    </panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import { useHistory } from '@/composables/useHistory'
import { useHistoryStats } from '@/composables/useHistoryStats'
import {
    HistoryListPanelCol,
    HistoryListRowJob,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import { caseInsensitiveSort, formatFilesize } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiCog,
    mdiDatabaseArrowDownOutline,
    mdiDatabaseExportOutline,
    mdiDelete,
    mdiFileDocumentMultipleOutline,
    mdiMagnify,
    mdiNotebookPlus,
} from '@mdi/js'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import HistoryListEntryJob from '@/components/panels/History/HistoryListEntryJob.vue'
import HistoryListPanelAddMaintenance from '@/components/dialogs/HistoryListPanelAddMaintenance.vue'
import { GuiMaintenanceStateEntry, HistoryListRowMaintenance } from '@/store/gui/maintenance/types'
import HistoryListEntryMaintenance from '@/components/panels/History/HistoryListEntryMaintenance.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

export type HistoryListPanelRow = HistoryListRowJob | HistoryListRowMaintenance

const { loadings } = useBase()
const socket = useSocket()
const { jobs, selectedJobs, moonrakerHistoryFields } = useHistory()
const { printStatusArray } = useHistoryStats('jobs')

const { t } = useI18n()

const store = useStore()

const search = ref('')
const sortBy = ref('start_time')
const sortDesc = ref(true)

const addMaintenanceDialog = ref(false)
const deleteSelectedDialog = ref(false)

const allLoaded = computed(() =>
    store.state.server.history.all_loaded ?? false
)

const maintenanceEntries = computed(() =>
    store.getters['gui/maintenance/getEntries'] ?? []
)

const entries = computed<HistoryListPanelRow[]>(() => {
    let entries: HistoryListPanelRow[] = []

    if (showPrintJobs.value) {
        entries = [...jobs.value].map((job) => {
            return { ...job, type: 'job', select_id: `job_${job.job_id}` }
        })
    }

    if (sortBy.value !== 'start_time') return entries

    if (showMaintenanceEntries.value) {
        entries = [
            ...entries,
            ...maintenanceEntries.value.map((entry: GuiMaintenanceStateEntry) => {
                return { ...entry, type: 'maintenance', select_id: `maintenance_${entry.id}` }
            }),
        ]
    }

    return entries
})

const headers = computed<HistoryListPanelCol[]>(() => {
    const result: HistoryListPanelCol[] = [
        { text: '', value: '', align: 'left', configable: false, visible: true, filterable: false },
        { text: t('History.Filename').toString(), value: 'filename', align: 'left', configable: false, visible: true },
        { text: '', value: 'status', align: 'left', configable: false, visible: true, filterable: false },
        { text: t('History.Filesize').toString(), value: 'size', align: 'left', configable: true, visible: true, outputType: 'filesize' },
        { text: t('History.LastModified').toString(), value: 'modified', align: 'left', configable: true, visible: true, outputType: 'date' },
        { text: t('History.StartTime').toString(), value: 'start_time', align: 'left', configable: true, visible: true, outputType: 'date' },
        { text: t('History.EndTime').toString(), value: 'end_time', align: 'left', configable: true, visible: true, outputType: 'date' },
        { text: t('History.EstimatedTime').toString(), value: 'estimated_time', align: 'left', configable: true, visible: true, outputType: 'time' },
        { text: t('History.PrintTime').toString(), value: 'print_duration', align: 'left', configable: true, visible: true, outputType: 'time' },
        { text: t('History.TotalTime').toString(), value: 'total_duration', align: 'left', configable: true, visible: true, outputType: 'time' },
        { text: t('History.FilamentCalc').toString(), value: 'filament_total', align: 'left', configable: true, visible: true, outputType: 'length' },
        { text: t('History.FilamentUsed').toString(), value: 'filament_used', align: 'left', configable: true, visible: true, outputType: 'length' },
        { text: t('History.FirstLayerExtTemp').toString(), value: 'first_layer_extr_temp', align: 'left', configable: true, visible: true, outputType: 'temp' },
        { text: t('History.FirstLayerBedTemp').toString(), value: 'first_layer_bed_temp', align: 'left', configable: true, visible: true, outputType: 'temp' },
        { text: t('History.FirstLayerHeight').toString(), value: 'first_layer_height', align: 'left', configable: true, visible: true, outputType: 'length' },
        { text: t('History.LayerHeight').toString(), value: 'layer_height', align: 'left', configable: true, visible: true, outputType: 'length' },
        { text: t('History.ObjectHeight').toString(), value: 'object_height', align: 'left', configable: true, visible: true, outputType: 'length' },
        { text: t('History.Slicer').toString(), value: 'slicer', align: 'left', configable: true, visible: true },
    ]

    moonrakerHistoryFields.value.forEach((sensor) => {
        result.push({
            text: sensor.desc,
            value: sensor.name,
            align: 'left',
            configable: true,
            visible: false,
        })
    })

    result.forEach((header) => {
        if (header.visible && hideColums.value.includes(header.value)) {
            header.visible = false
        } else if (!header.visible && !hideColums.value.includes(header.value)) {
            header.visible = true
        }
    })

    return result
})

const tableFields = computed<HistoryListPanelCol[]>(() =>
    filteredHeaders.value.filter(
        (col: HistoryListPanelCol) => !['filename', 'status'].includes(col.value) && col.value !== ''
    )
)

const configHeaders = computed<HistoryListPanelCol[]>(() =>
    headers.value.filter((header: HistoryListPanelCol) => header.configable)
)

const filteredHeaders = computed<HistoryListPanelCol[]>(() =>
    headers.value.filter((header: HistoryListPanelCol) => header.visible)
)

const allPrintStatusArray = computed<ServerHistoryStateAllPrintStatusEntry[]>(() => {
    const statuses = store.getters['server/history/getAllPrintStatusArray'] ?? []
    return caseInsensitiveSort(statuses as ServerHistoryStateAllPrintStatusEntry[], 'name')
})

const countPerPage = computed({
    get: () => store.state.gui.view.history.countPerPage ?? 10,
    set: (newVal: number) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.countPerPage', value: newVal })
    }
})

const hideColums = computed({
    get: () => store.state.gui.view.history.hideColums ?? [],
    set: (newVal: string[]) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.hideColums', value: newVal })
    }
})

const showMaintenanceEntries = computed({
    get: () => store.state.gui.view.history.showMaintenanceEntries,
    set: (newVal: boolean) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.showMaintenanceEntries', value: newVal })
    }
})

const showPrintJobs = computed({
    get: () => store.state.gui.view.history.showPrintJobs,
    set: (newVal: boolean) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.showPrintJobs', value: newVal })
    }
})

const selectedJobsTable = computed<HistoryListPanelRow[]>({
    get: () => store.state.gui.view.history.selectedJobs ?? [],
    set: (newVal: HistoryListPanelRow[]) => {
        store.dispatch('gui/saveSetting', { name: 'view.history.selectedJobs', value: newVal })
    }
})

function refreshHistory() {
    store.dispatch('socket/addLoading', { name: 'historyLoadAll' })
    socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
}

function sortFiles(items: HistoryListPanelRow[], sortBy: string[], sortDesc: boolean[]) {
    const sortByClean = (sortBy.length ? sortBy[0] : 'filename') as keyof HistoryListPanelRow
    const sortDescClean = sortDesc[0]

    if (items === undefined) return []

    items.sort((a: HistoryListPanelRow, b: HistoryListPanelRow) => {
        const valueA = a[sortByClean]
        const valueB = b[sortByClean]

        if (valueA === valueB) return 0
        if (valueA === null || valueA === undefined) return -1
        if (valueB === null || valueB === undefined) return 1

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueA.localeCompare(valueB, undefined, { sensitivity: 'base' })
        }

        if (Array.isArray(valueA) && Array.isArray(valueB)) {
            const reducedA = valueA.reduce((sum: number, current: number) => sum + current, 0)
            const reducedB = valueB.reduce((sum: number, current: number) => sum + current, 0)
            return reducedA - reducedB
        }

        if (typeof valueA === 'number' && typeof valueB === 'number') return valueA - valueB

        return 0
    })

    if (sortDescClean) items.reverse()

    return items
}

function advancedSearch(value: string, search: string) {
    return value != null && search != null && value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
}

function changeColumnVisible(name: string) {
    if (headers.value.filter((header) => header.value === name).length) {
        const value = headers.value.filter((header) => header.value === name)[0].visible

        store.dispatch('gui/setHistoryColumns', { name: name, value: value })
    }
}

function changeStatusVisible(status: ServerHistoryStateAllPrintStatusEntry) {
    store.dispatch('gui/toggleStatusInHistoryList', status.name)
}

function exportHistory() {
    const checkString = parseFloat('1.23').toLocaleString(navigator.language)
    const decimalSeparator = checkString.indexOf(',') >= 0 ? ',' : '.'
    const csvSeperator = decimalSeparator === ',' ? ';' : ','

    const content: string[][] = []
    const row: string[] = []

    row.push('filename')
    row.push('type')
    row.push('status')

    tableFields.value.forEach((col) => {
        if (col.value.startsWith('history_field_')) {
            const sensorName = col.value.replace('history_field_', '')
            row.push(sensorName)
            return
        }

        row.push(col.value)
    })

    content.push(row)

    let jobs = [...entries.value]
    if (selectedJobsTable.value.length) {
        jobs = [...selectedJobsTable.value]
    }

    if (jobs.length) {
        jobs.sort((a, b) => {
            return b.start_time - a.start_time
        }).forEach((entry: HistoryListPanelRow) => {
            const row: string[] = []
            const type = entry.type ?? 'job'

            if (type === 'maintenance') {
                const maintenance = entry as HistoryListRowMaintenance
                row.push(maintenance.name)
                row.push('maintenance')
                row.push(maintenance.end_time !== null ? 'performed' : 'open')

                tableFields.value
                    .filter((header) => header.value !== 'slicer')
                    .forEach((header) => {
                        if (header.value === 'start_time') {
                            row.push(formatDateTime(maintenance.start_time * 1000))
                            return
                        }

                        if (header.value === 'end_time' && maintenance.end_time !== null) {
                            row.push(formatDateTime(maintenance.end_time * 1000))
                            return
                        }

                        if (header.value === 'print_duration' && maintenance.end_printtime !== null) {
                            const value = maintenance.end_printtime - maintenance.start_printtime
                            row.push(value.toLocaleString(navigator.language, { useGrouping: false }))
                            return
                        }

                        if (header.value === 'filament_used' && maintenance.end_filament !== null) {
                            const value = maintenance.end_filament - maintenance.start_filament
                            row.push(value.toLocaleString(navigator.language, { useGrouping: false }))
                            return
                        }

                        row.push('')
                    })

                if (tableFields.value.find((header) => header.value === 'slicer')?.visible) {
                    row.push('')
                }

                content.push(row)
                return
            }

            const job = entry as ServerHistoryStateJob
            let filename = job.filename
            if (filename.includes(csvSeperator)) filename = '"' + filename + '"'
            row.push(filename)
            row.push('job')
            row.push(job.status)

            tableFields.value.forEach((col) => {
                row.push(outputValue(col, job, csvSeperator))
            })

            content.push(row)
        })
    }

    const csvContent =
        'data:text/csv;charset=utf-8,' +
        content.map((entry) =>
            entry.map((field) => (field?.indexOf(csvSeperator) === -1 ? field : `"${field}"`)).join(csvSeperator)
        ).join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', 'print_history.csv')
    document.body.appendChild(link)

    link.click()
    link.remove()
}

function outputValue(col: HistoryListPanelCol, job: ServerHistoryStateJob, csvSeperator: string | null = null) {
    const key = col.value
    let value: string | number | null = null
    if (key in job) {
        const raw = job[key as keyof ServerHistoryStateJob]
        if (typeof raw === 'string' || typeof raw === 'number') value = raw
    } else if (key in job.metadata) {
        const raw = job.metadata[key]
        if (typeof raw === 'string' || typeof raw === 'number') value = raw
    }
    if (key === 'slicer' && 'slicer_version' in job.metadata) value += ` ${job.metadata.slicer_version}`

    if (key.startsWith('history_field_')) {
        const sensorName = key.replace('history_field_', '')
        const sensor = job.auxiliary_data?.find((sensor) => sensor.name === sensorName)

        value = sensor?.value?.toString() ?? null
        if (sensor && !Array.isArray(sensor.value)) {
            value = sensor.value?.toLocaleString(navigator.language, { useGrouping: false }) ?? 0
        }
    }

    if (value === null) return '--'

    if (typeof value === 'string') {
        if (csvSeperator !== null && value?.includes(csvSeperator)) value = `"${value}"`
        return value
    }

    switch (col.outputType) {
        case 'date':
            return formatDateTime(value * 1000)
        case 'time':
            return value?.toFixed() ?? ''
        default:
            return value?.toLocaleString(navigator.language, { useGrouping: false }) ?? 0
    }
}

const deleteSelectedQuestion = computed<string>(() => {
    if (selectedJobsTable.value.length === 1) return t('History.DeleteSingleJobQuestion').toString()
    return t('History.DeleteSelectedQuestion', { count: selectedJobsTable.value.length }).toString()
})

function deleteSelectedJobs() {
    selectedJobsTable.value.forEach((item: HistoryListPanelRow) => {
        if (item.type === 'maintenance') {
            store.dispatch('gui/maintenance/delete', item.id)
            return
        }

        if (!('job_id' in item)) return

        socket.emit(
            'server.history.delete_job',
            { uid: item.job_id },
            { action: 'server/history/getDeletedJobs' }
        )
    })

    selectedJobsTable.value = []
}

function formatDateTime(value: number): string {
    const date = new Date(value)
    return date.toLocaleString(navigator.language)
}
</script>

<style scoped>
.history-jobs-table ::v-deep th {
    white-space: nowrap;
}

.history-jobs-table ::v-deep th.text-start {
    padding-right: 0 !important;
}
</style>
