<template>
    <div>
        <panel
            :icon="mdiFileDocumentMultipleOutline"
            :title="$t('History.PrintHistory')"
            card-class="history-list-panel">
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
                        <template v-if="selectedJobs.length">
                            <v-btn
                                :title="$t('History.Delete')"
                                color="error"
                                class="px-2 minwidth-0 ml-3"
                                @click="deleteSelectedDialog = true">
                                <v-icon>{{ mdiDelete }}</v-icon>
                            </v-btn>
                        </template>
                        <history-list-panel-add-maintenance />
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
                                <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on">
                                    <v-icon>{{ mdiCog }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <template v-if="allPrintStatusArray.length">
                                    <v-list-item
                                        v-for="status of allPrintStatusArray"
                                        :key="status.key"
                                        class="minHeight36">
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
                v-model="selectedJobs"
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
                item-key="job_id"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                show-select>
                <template #no-data>
                    <div class="text-center">{{ $t('History.Empty') }}</div>
                </template>

                <template #item="{ index, item, isSelected, select }">
                    <history-list-entry-job
                        v-if="item.type === 'job'"
                        :key="`${index}_${item.job_id}`"
                        :is-selected="isSelected"
                        :item="item"
                        :table-fields="tableFields"
                        @select="select" />
                    <history-list-entry-maintenance
                        v-else-if="item.type === 'maintenance'"
                        :key="`${index}_${item.id}`"
                        :is-selected="isSelected"
                        :item="item"
                        :table-fields="tableFields"
                        @select="select" />
                </template>
            </v-data-table>
        </panel>
        <v-dialog v-model="deleteSelectedDialog" max-width="400">
            <panel :title="$t('History.Delete')" card-class="history-delete-selected-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteSelectedDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p v-if="selectedJobs.length === 1" class="mb-0">
                        {{ $t('History.DeleteSingleJobQuestion') }}
                    </p>
                    <p v-else class="mb-0">
                        {{ $t('History.DeleteSelectedQuestion', { count: selectedJobs.length }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" text @click="deleteSelectedDialog = false">{{ $t('History.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteSelectedJobs">{{ $t('History.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
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
} from '@mdi/js'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import HistoryListEntryJob from '@/components/panels/HistoryList/HistoryListEntryJob.vue'
import HistoryListPanelAddMaintenance from '@/components/dialogs/HistoryListPanelAddMaintenance.vue'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListEntryMaintenance from '@/components/panels/HistoryList/HistoryListEntryMaintenance.vue'

export interface HistoryListPanelRow {
    text: string
    value: string
    align: string
    configable: boolean
    visible: boolean
    filterable?: boolean
    outputType?: string
}

@Component({
    components: {
        HistoryListEntryMaintenance,
        HistoryListPanelAddMaintenance,
        HistoryListEntryJob,
        HistoryListPanelDetailsDialog,
        Panel,
    },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCog = mdiCog
    mdiDatabaseExportOutline = mdiDatabaseExportOutline
    mdiDelete = mdiDelete
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiMagnify = mdiMagnify
    mdiDatabaseArrowDownOutline = mdiDatabaseArrowDownOutline

    formatFilesize = formatFilesize

    search = ''
    sortBy = 'start_time'
    sortDesc = true

    deleteSelectedDialog = false

    get allLoaded() {
        return this.$store.state.server.history.all_loaded ?? false
    }

    get jobs() {
        return this.$store.getters['server/history/getFilterdJobList'] ?? []
    }

    get maintenanceEntries() {
        const entries = this.$store.getters['gui/maintenance/getEntries'] ?? []

        window.console.log('mEntries', entries)

        return entries
    }

    get entries() {
        let entries = [...this.jobs].map((job) => {
            return { ...job, type: 'job' }
        })

        entries = [
            ...entries,
            ...this.maintenanceEntries.map((entry: GuiMaintenanceStateEntry) => {
                return { ...entry, type: 'maintenance' }
            }),
        ]

        return entries
    }

    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    set selectedJobs(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.history.selectedJobs', value: newVal })
    }

    get headers() {
        const headers: HistoryListPanelRow[] = [
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

        headers.forEach((header) => {
            if (header.visible && this.hideColums.includes(header.value)) {
                header.visible = false
            } else if (!header.visible && !this.hideColums.includes(header.value)) {
                header.visible = true
            }
        })

        return headers
    }

    get tableFields() {
        return this.filteredHeaders.filter(
            (col: any) => !['filename', 'status'].includes(col.value) && col.value !== ''
        )
    }

    get configHeaders() {
        return this.headers.filter((header: any) => header.configable === true)
    }

    get filteredHeaders() {
        return this.headers.filter((header: any) => header.visible === true)
    }

    get allPrintStatusArray() {
        return caseInsensitiveSort(this.$store.getters['server/history/getAllPrintStatusArray'] ?? [], 'name')
    }

    get countPerPage() {
        return this.$store.state.gui.view.historycountPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.countPerPage', value: newVal })
    }

    get hideColums() {
        return this.$store.state.gui.view.history.hideColums
    }

    set hideColums(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.history.hideColums', value: newVal })
    }

    refreshHistory() {
        this.$store.dispatch('socket/addLoading', { name: 'historyLoadAll' })

        this.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
    }

    formatPrintTime(totalSeconds: number) {
        if (totalSeconds) {
            let output = ''

            const days = Math.floor(totalSeconds / (3600 * 24))
            if (days) {
                totalSeconds %= 3600 * 24
                output += days + 'd'
            }

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output += ' ' + hours + 'h'

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output += ' ' + minutes + 'm'

            const seconds = totalSeconds % 60
            if (seconds) output += ' ' + seconds.toFixed(0) + 's'

            return output
        }

        return '--'
    }

    sortFiles(items: any[], sortBy: string[], sortDesc: boolean[]) {
        const sortByClean = sortBy.length ? sortBy[0] : 'filename'
        const sortDescClean = sortDesc[0]

        if (items !== undefined) {
            // Sort by index
            items.sort(function (a, b) {
                if (a[sortByClean] === b[sortByClean]) return 0
                if (a[sortByClean] === null || a[sortByClean] === undefined) return -1
                if (b[sortByClean] === null || b[sortByClean] === undefined) return 1

                if (a[sortByClean].constructor === String && b[sortByClean].constructor === String) {
                    return a[sortByClean].localeCompare(b[sortByClean], undefined, { sensivity: 'base' })
                }

                if (a[sortByClean] instanceof Array && b[sortByClean] instanceof Array) {
                    const reducedA = a[sortByClean].length ? a.filament.reduce((a: any, b: any) => a + b) : 0
                    const reducedB = b[sortByClean].length ? b.filament.reduce((a: any, b: any) => a + b) : 0
                    return reducedA - reducedB
                }

                return a[sortByClean] - b[sortByClean]
            })

            // Deal with descending order
            if (sortDescClean) items.reverse()
        }

        return items
    }

    advancedSearch(value: string, search: string) {
        return value != null && search != null && value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
    }

    changeColumnVisible(name: string) {
        if (this.headers.filter((header) => header.value === name).length) {
            let value = this.headers.filter((header) => header.value === name)[0].visible

            this.$store.dispatch('gui/setHistoryColumns', { name: name, value: value })
        }
    }

    changeStatusVisible(status: any) {
        if (status.showInTable) {
            this.$store.dispatch('gui/hideStatusInHistoryList', status.name)
            return
        }

        this.$store.dispatch('gui/showStatusInHistoryList', status.name)
    }

    deleteSelectedJobs() {
        this.selectedJobs.forEach((item: ServerHistoryStateJob) => {
            this.$socket.emit(
                'server.history.delete_job',
                { uid: item.job_id },
                { action: 'server/history/getDeletedJobs' }
            )
        })

        this.selectedJobs = []
        this.deleteSelectedDialog = false
    }

    exportHistory() {
        const checkString = parseFloat('1.23').toLocaleString(this.browserLocale)
        const decimalSeparator = checkString.indexOf(',') >= 0 ? ',' : '.'
        const csvSeperator = decimalSeparator === ',' ? ';' : ','

        const content: string[][] = []
        const row: string[] = []

        row.push('filename')
        row.push('status')

        this.tableFields.forEach((col) => {
            row.push(col.value)
        })

        if (this.headers.find((header) => header.value === 'slicer')?.visible) {
            row.push('slicer')
        }

        content.push(row)

        let jobs = [...this.jobs]
        if (this.selectedJobs.length) {
            jobs = [...this.selectedJobs]
        }

        if (jobs.length) {
            jobs.forEach((job: ServerHistoryStateJob) => {
                const row: string[] = []

                let filename = job.filename
                if (filename.includes(csvSeperator)) filename = '"' + filename + '"'
                row.push(filename)
                row.push(job.status)

                this.tableFields.forEach((col) => {
                    row.push(this.outputValue(col, job, csvSeperator))
                })

                if (this.headers.find((header) => header.value === 'slicer')?.visible) {
                    let slicerString = 'slicer' in job.metadata && job.metadata.slicer ? job.metadata.slicer : '--'
                    if ('slicer_version' in job.metadata && job.metadata.slicer_version)
                        slicerString += ' ' + job.metadata.slicer_version
                    row.push(slicerString)
                }

                content.push(row)
            })
        }

        // escape fields with the csvSeperator in the content
        // prettier-ignore
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            content.map((entry) =>
                entry.map((field) => (field.indexOf(csvSeperator) === -1 ? field : `"${field}"`)).join(csvSeperator)
            ).join('\n')

        const link = document.createElement('a')
        link.setAttribute('href', encodeURI(csvContent))
        link.setAttribute('download', 'print_history.csv')
        document.body.appendChild(link)

        link.click()
        link.remove()
    }

    outputValue(col: HistoryListPanelRow, job: ServerHistoryStateJob, csvSeperator: string | null = null) {
        //@ts-ignore
        let value = col.value in job ? job[col.value] : null
        if (value === null) value = col.value in job.metadata ? job.metadata[col.value] : null

        switch (col.outputType) {
            case 'date':
                return this.formatDateTime(value * 1000)

            case 'time':
                return value?.toFixed() ?? ''

            default:
                switch (typeof value) {
                    case 'number':
                        return value?.toLocaleString(this.browserLocale, { useGrouping: false }) ?? 0

                    case 'string':
                        if (csvSeperator !== null && value.includes(csvSeperator)) value = '"' + value + '"'

                        return value

                    default:
                        return value
                }
        }
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
