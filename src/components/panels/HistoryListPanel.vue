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
                    <template v-if="selectedJobs.length">
                        <v-btn
                            :title="$t('History.Delete')"
                            color="error"
                            class="px-2 minwidth-0 ml-3"
                            @click="showDeleteSelectedDialog = true">
                            <v-icon>{{ mdiDelete }}</v-icon>
                        </v-btn>
                    </template>
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
                    <history-list-panel-export-csv :headers="headers" :table-fields="tableFields" />
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
                            <v-list-item v-for="header of configHeaders" :key="header.value" class="minHeight36">
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
            :items="jobs"
            class="history-jobs-table"
            :headers="filteredHeaders"
            :options="options"
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
                <history-list-row
                    :key="`${index} ${item.filename}`"
                    :job="item"
                    :is-selected="isSelected"
                    :table-fields="tableFields"
                    :exists-slicer-col="existsSlicerCol"
                    @select="select" />
            </template>
        </v-data-table>
        <history-delete-selected-jobs-dialog
            :show="showDeleteSelectedDialog"
            :selected-jobs="selectedJobs"
            @clear-selected-jobs="clearSelectedJobs"
            @close="showDeleteSelectedDialog = false" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { caseInsensitiveSort, formatFilesize } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiCloseThick,
    mdiCog,
    mdiDatabaseArrowDownOutline,
    mdiDelete,
    mdiFileDocumentMultipleOutline,
    mdiMagnify,
} from '@mdi/js'
import HistoryListRow from '@/components/panels/History/HistoryListRow.vue'
import { TranslateResult } from 'vue-i18n'
import HistoryDeleteSelectedJobsDialog from '@/components/dialogs/HistoryDeleteSelectedJobsDialog.vue'
import HistoryListPanelExportCsv from '@/components/panels/History/HistoryListPanelExportCsv.vue'

export interface HistoryListHeadertype {
    text: string | TranslateResult
    value: string
    align: string
    configable: boolean
    visible: boolean
    outputType?: string
    filterable?: boolean
}

@Component({
    components: { HistoryListPanelExportCsv, HistoryDeleteSelectedJobsDialog, HistoryListRow, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiDatabaseArrowDownOutline = mdiDatabaseArrowDownOutline
    mdiCog = mdiCog
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiMagnify = mdiMagnify
    mdiCloseThick = mdiCloseThick

    formatFilesize = formatFilesize

    search = ''
    sortBy = 'start_time'
    sortDesc = true
    options = {}

    showDeleteSelectedDialog = false

    get allLoaded() {
        return this.$store.state.server.history.all_loaded ?? false
    }

    get jobs() {
        return this.$store.getters['server/history/getFilteredJobList'] ?? []
    }

    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    set selectedJobs(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.history.selectedJobs', value: newVal })
    }

    get headers() {
        const headers: HistoryListHeadertype[] = [
            {
                text: '',
                value: '',
                align: 'left',
                configable: false,
                visible: true,
                filterable: false,
            },
            {
                text: this.$t('History.Filename'),
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
                text: this.$t('History.Filesize'),
                value: 'size',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'filesize',
            },
            {
                text: this.$t('History.LastModified'),
                value: 'modified',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'date',
            },
            {
                text: this.$t('History.StartTime'),
                value: 'start_time',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'date',
            },
            {
                text: this.$t('History.EndTime'),
                value: 'end_time',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'date',
            },
            {
                text: this.$t('History.EstimatedTime'),
                value: 'estimated_time',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'time',
            },
            {
                text: this.$t('History.PrintTime'),
                value: 'print_duration',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'time',
            },
            {
                text: this.$t('History.TotalTime'),
                value: 'total_duration',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'time',
            },
            {
                text: this.$t('History.FilamentCalc'),
                value: 'filament_total',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.FilamentUsed'),
                value: 'filament_used',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.FirstLayerExtTemp'),
                value: 'first_layer_extr_temp',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'temp',
            },
            {
                text: this.$t('History.FirstLayerBedTemp'),
                value: 'first_layer_bed_temp',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'temp',
            },
            {
                text: this.$t('History.FirstLayerHeight'),
                value: 'first_layer_height',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.LayerHeight'),
                value: 'layer_height',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.ObjectHeight'),
                value: 'object_height',
                align: 'left',
                configable: true,
                visible: true,
                outputType: 'length',
            },
            {
                text: this.$t('History.Slicer'),
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
            (col: HistoryListHeadertype) => !['filename', 'status', 'slicer'].includes(col.value) && col.value !== ''
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

    get existsSlicerCol() {
        return this.headers.find((header) => header.value === 'slicer')?.visible ?? false
    }

    refreshHistory() {
        this.$store.dispatch('socket/addLoading', { name: 'historyLoadAll' })

        this.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
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
        if (status.showInTable) this.$store.dispatch('gui/hideStatusInHistoryList', status.name)
        else this.$store.dispatch('gui/showStatusInHistoryList', status.name)
    }

    clearSelectedJobs() {
        this.selectedJobs = []
    }
}
</script>

<style scoped>
::v-deep .history-jobs-table th {
    white-space: nowrap;
}

::v-deep .history-jobs-table th.text-start {
    padding-right: 0 !important;
}
</style>
