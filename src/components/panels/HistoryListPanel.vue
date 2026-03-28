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

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {
    HistoryListPanelCol,
    HistoryListRowJob,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import { caseInsensitiveSort, formatFilesize } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiCloseThick,
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
import HistoryMixin from '@/components/mixins/history'
import HistoryStatsMixin from '@/components/mixins/historyStats'

export type HistoryListPanelRow = HistoryListRowJob | HistoryListRowMaintenance

@Component({
    components: {
        ConfirmationDialog,
        HistoryListEntryMaintenance,
        HistoryListPanelAddMaintenance,
        HistoryListEntryJob,
        HistoryListPanelDetailsDialog,
        Panel,
    },
})
export default class HistoryListPanel extends Mixins(BaseMixin, HistoryMixin, HistoryStatsMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCog = mdiCog
    mdiDatabaseArrowDownOutline = mdiDatabaseArrowDownOutline
    mdiDatabaseExportOutline = mdiDatabaseExportOutline
    mdiDelete = mdiDelete
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiMagnify = mdiMagnify
    mdiNotebookPlus = mdiNotebookPlus

    formatFilesize = formatFilesize

    search = ''
    sortBy = 'start_time'
    sortDesc = true

    addMaintenanceDialog = false
    deleteSelectedDialog = false

    get allLoaded() {
        return this.$store.state.server.history.all_loaded ?? false
    }

    get maintenanceEntries() {
        return this.$store.getters['gui/maintenance/getEntries'] ?? []
    }

    get entries() {
        let entries: HistoryListPanelRow[] = []

        if (this.showPrintJobs) {
            entries = [...this.jobs].map((job) => {
                return { ...job, type: 'job', select_id: `job_${job.job_id}` }
            })
        }

        if (this.sortBy !== 'start_time') return entries

        if (this.showMaintenanceEntries) {
            entries = [
                ...entries,
                ...this.maintenanceEntries.map((entry: GuiMaintenanceStateEntry) => {
                    return { ...entry, type: 'maintenance', select_id: `maintenance_${entry.id}` }
                }),
            ]
        }

        return entries
    }

    get headers() {
        const headers: HistoryListPanelCol[] = [
            {
                text: '',
                value: '',
                align: 'left',
                configable: false,
                visible: true,
                filterable: false,
            },
            {
                text: this.$t('History.Filename').toString() as string,
                value: 'filename',
                align: 'left',
                configable: false,
                visible: true,
            },
            {
                text: '',
                value: 'status',
                align: 'left',
                configable: false,
                visible: true,
                filterable: false,
            },
            {
                text: this.$t('History.Filesize').toString() as string,
                value: 'size',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'filesize',
            },
            {
                text: this.$t('History.LastModified').toString() as string,
                value: 'modified',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'date',
            },
            {
                text: this.$t('History.StartTime').toString() as string,
                value: 'start_time',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'date',
            },
            {
                text: this.$t('History.EndTime').toString() as string,
                value: 'end_time',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'date',
            },
            {
                text: this.$t('History.EstimatedTime').toString() as string,
                value: 'estimated_time',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'time',
            },
            {
                text: this.$t('History.PrintTime').toString() as string,
                value: 'print_duration',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'time',
            },
            {
                text: this.$t('History.TotalTime').toString() as string,
                value: 'total_duration',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'time',
            },
            {
                text: this.$t('History.FilamentCalc').toString() as string,
                value: 'filament_total',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.FilamentUsed').toString() as string,
                value: 'filament_used',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.FirstLayerExtTemp').toString() as string,
                value: 'first_layer_extr_temp',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'temp',
            },
            {
                text: this.$t('History.FirstLayerBedTemp').toString() as string,
                value: 'first_layer_bed_temp',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'temp',
            },
            {
                text: this.$t('History.FirstLayerHeight').toString() as string,
                value: 'first_layer_height',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.LayerHeight').toString() as string,
                value: 'layer_height',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.ObjectHeight').toString() as string,
                value: 'object_height',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.Slicer').toString() as string,
                value: 'slicer',
                align: 'left',
                configable: true,
                visible: true,
            },
        ]

        this.moonrakerHistoryFields.forEach((sensor) => {
            headers.push({
                text: sensor.desc,
                value: sensor.name,
                align: 'left',
                configable: true,
                visible: false,
            })
        })

        headers.forEach((header) => {
            if (header.visible && this.hideColums.includes(header.value)) {
                header.visible = false
            } else if (!header.visible && !this.hideColums.includes(header.value)) {
                header.visible = true
            }
        })

        return headers
    }

    get tableFields(): HistoryListPanelCol[] {
        return this.filteredHeaders.filter(
            (col: HistoryListPanelCol) => !['filename', 'status'].includes(col.value) && col.value !== ''
        )
    }

    get configHeaders(): HistoryListPanelCol[] {
        return this.headers.filter((header: HistoryListPanelCol) => header.configable)
    }

    get filteredHeaders(): HistoryListPanelCol[] {
        return this.headers.filter((header: HistoryListPanelCol) => header.visible)
    }

    get allPrintStatusArray(): ServerHistoryStateAllPrintStatusEntry[] {
        const statuses = this.$store.getters['server/history/getAllPrintStatusArray'] ?? []

        return caseInsensitiveSort(statuses as ServerHistoryStateAllPrintStatusEntry[], 'name')
    }

    get countPerPage() {
        return this.$store.state.gui.view.history.countPerPage ?? 10
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.countPerPage', value: newVal })
    }

    get hideColums() {
        return this.$store.state.gui.view.history.hideColums ?? []
    }

    set hideColums(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.hideColums', value: newVal })
    }

    get showMaintenanceEntries() {
        return this.$store.state.gui.view.history.showMaintenanceEntries
    }

    set showMaintenanceEntries(newVal) {
        this.$store.dispatch('gui/saveSetting', {
            name: 'view.history.showMaintenanceEntries',
            value: newVal,
        })
    }

    get showPrintJobs() {
        return this.$store.state.gui.view.history.showPrintJobs
    }

    set showPrintJobs(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.showPrintJobs', value: newVal })
    }

    get selectedJobsTable(): HistoryListPanelRow[] {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    set selectedJobsTable(newVal: HistoryListPanelRow[]) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.selectedJobs', value: newVal })
    }

    refreshHistory() {
        this.$store.dispatch('socket/addLoading', { name: 'historyLoadAll' })

        this.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
    }

    sortFiles(items: HistoryListPanelRow[], sortBy: string[], sortDesc: boolean[]) {
        const sortByClean = (sortBy.length ? sortBy[0] : 'filename') as keyof HistoryListPanelRow
        const sortDescClean = sortDesc[0]

        if (items === undefined) return []

        // Sort by index
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

        // Deal with descending order
        if (sortDescClean) items.reverse()

        return items
    }

    advancedSearch(value: string, search: string) {
        return value != null && search != null && value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
    }

    changeColumnVisible(name: string) {
        if (this.headers.filter((header) => header.value === name).length) {
            const value = this.headers.filter((header) => header.value === name)[0].visible

            this.$store.dispatch('gui/setHistoryColumns', { name: name, value: value })
        }
    }

    changeStatusVisible(status: ServerHistoryStateAllPrintStatusEntry) {
        this.$store.dispatch('gui/toggleStatusInHistoryList', status.name)
    }

    exportHistory() {
        const checkString = parseFloat('1.23').toLocaleString(this.browserLocale)
        const decimalSeparator = checkString.indexOf(',') >= 0 ? ',' : '.'
        const csvSeperator = decimalSeparator === ',' ? ';' : ','

        const content: string[][] = []
        const row: string[] = []

        row.push('filename')
        row.push('type')
        row.push('status')

        this.tableFields.forEach((col) => {
            if (col.value.startsWith('history_field_')) {
                const sensorName = col.value.replace('history_field_', '')
                row.push(sensorName)
                return
            }

            row.push(col.value)
        })

        content.push(row)

        let jobs = [...this.entries]
        if (this.selectedJobsTable.length) {
            jobs = [...this.selectedJobsTable]
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
                    row.push(maintenance.end_time !== null ? 'performed' : 'open') // status

                    // add empty fields for the tableFields
                    this.tableFields
                        .filter((header) => header.value !== 'slicer')
                        .forEach((header) => {
                            if (header.value === 'start_time') {
                                row.push(this.formatDateTime(maintenance.start_time * 1000))
                                return
                            }

                            if (header.value === 'end_time' && maintenance.end_time !== null) {
                                row.push(this.formatDateTime(maintenance.end_time * 1000))
                                return
                            }

                            if (header.value === 'print_duration' && maintenance.end_printtime !== null) {
                                const value = maintenance.end_printtime - maintenance.start_printtime
                                row.push(value.toLocaleString(this.browserLocale, { useGrouping: false }))
                                return
                            }

                            if (header.value === 'filament_used' && maintenance.end_filament !== null) {
                                const value = maintenance.end_filament - maintenance.start_filament
                                row.push(value.toLocaleString(this.browserLocale, { useGrouping: false }))
                                return
                            }

                            row.push('')
                        })

                    // add empty slicer field
                    if (this.tableFields.find((header) => header.value === 'slicer')?.visible) {
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

                this.tableFields.forEach((col) => {
                    row.push(this.outputValue(col, job, csvSeperator))
                })

                content.push(row)
            })
        }

        // escape fields with the csvSeperator in the content
        // prettier-ignore
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

    outputValue(col: HistoryListPanelCol, job: ServerHistoryStateJob, csvSeperator: string | null = null) {
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
                value = sensor.value?.toLocaleString(this.browserLocale, { useGrouping: false }) ?? 0
            }
        }

        if (value === null) return '--'

        if (typeof value === 'string') {
            if (csvSeperator !== null && value?.includes(csvSeperator)) value = `"${value}"`

            return value
        }

        switch (col.outputType) {
            case 'date':
                return this.formatDateTime(value * 1000)

            case 'time':
                return value?.toFixed() ?? ''

            default:
                return value?.toLocaleString(this.browserLocale, { useGrouping: false }) ?? 0
        }
    }

    get deleteSelectedQuestion(): string {
        if (this.selectedJobsTable.length === 1) return this.$t('History.DeleteSingleJobQuestion').toString()

        return this.$t('History.DeleteSelectedQuestion', { count: this.selectedJobsTable.length }).toString()
    }

    deleteSelectedJobs() {
        this.selectedJobsTable.forEach((item: HistoryListPanelRow) => {
            if (item.type === 'maintenance') {
                this.$store.dispatch('gui/maintenance/delete', item.id)
                return
            }

            // break if job_id is not present
            if (!('job_id' in item)) return

            this.$socket.emit(
                'server.history.delete_job',
                { uid: item.job_id },
                { action: 'server/history/getDeletedJobs' }
            )
        })

        this.selectedJobsTable = []
    }
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
