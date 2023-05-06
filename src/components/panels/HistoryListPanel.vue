<style>
.history-jobs-table th {
    white-space: nowrap;
}

.history-jobs-table th.text-start {
    padding-right: 0 !important;
}
</style>

<template>
    <div>
        <panel
            :icon="mdiFileDocumentMultipleOutline"
            :title="$t('History.PrintHistory').toString()"
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
                            dense></v-text-field>
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
                        <v-btn
                            :title="$t('History.TitleExportHistory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="exportHistory">
                            <v-icon>{{ mdiDatabaseExportOutline }}</v-icon>
                        </v-btn>
                        <v-btn
                            :title="$t('History.TitleRefreshHistory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="refreshHistory">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                        <v-menu :offset-y="true" :close-on-content-click="false" title="Setup current list">
                            <template #activator="{ on, attrs }">
                                <v-btn
                                    class="px-2 minwidth-0 ml-3"
                                    :title="$t('History.TitleSettings')"
                                    v-bind="attrs"
                                    v-on="on">
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
                                            @change="changeStatusVisible(status)"></v-checkbox>
                                    </v-list-item>
                                    <v-divider></v-divider>
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
                                        @change="changeColumnVisible(header.value)"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
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
                <template slot="no-data">
                    <div class="text-center">{{ $t('History.Empty') }}</div>
                </template>

                <template #item="{ index, item, isSelected, select }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        :class="'file-list-cursor user-select-none ' + (item.exists ? '' : 'text--disabled')"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)">
                        <td class="pr-0">
                            <v-simple-checkbox
                                v-ripple
                                :value="isSelected"
                                class="pa-0 mr-0"
                                @click.stop="select(!isSelected)"></v-simple-checkbox>
                        </td>
                        <td class="px-0 text-center" style="width: 32px">
                            <template v-if="!item.exists">
                                <v-icon class="text--disabled">{{ mdiFile }}-cancel</v-icon>
                            </template>
                            <template v-else-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                                <v-tooltip top>
                                    <template #activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img
                                                slot="image"
                                                :src="getSmallThumbnail(item)"
                                                width="32"
                                                height="32"
                                                v-bind="attrs"
                                                v-on="on" />
                                            <v-progress-circular
                                                slot="preloader"
                                                indeterminate
                                                color="primary"></v-progress-circular>
                                            <v-icon slot="error">{{ mdiFile }}</v-icon>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="getBigThumbnail(item)" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else-if="getSmallThumbnail(item)">
                                <vue-load-image>
                                    <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" />
                                    <v-progress-circular
                                        slot="preloader"
                                        indeterminate
                                        color="primary"></v-progress-circular>
                                    <v-icon slot="error">{{ mdiFile }}</v-icon>
                                </vue-load-image>
                            </template>
                            <template v-else>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-right text-no-wrap">
                            <template v-if="'note' in item && item.note">
                                <v-tooltip top>
                                    <template #activator="{ on, attrs }">
                                        <v-icon small class="mr-2" v-bind="attrs" v-on="on">
                                            {{ mdiNotebook }}
                                        </v-icon>
                                    </template>
                                    <span v-html="item.note.replaceAll('\n', '<br />')"></span>
                                </v-tooltip>
                            </template>
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <v-icon small :color="getStatusColor(item.status)" :disabled="!item.exists">
                                            {{ getStatusIcon(item.status) }}
                                        </v-icon>
                                    </span>
                                </template>
                                <span>
                                    {{
                                        $te(`History.StatusValues.${item.status}`, 'en')
                                            ? $t(`History.StatusValues.${item.status}`)
                                            : item.status.replace(/_/g, ' ')
                                    }}
                                </span>
                            </v-tooltip>
                        </td>
                        <td v-for="col in tableFields" :key="col.value" class="text-no-wrap">
                            {{ outputValue(col, item) }}
                        </td>
                        <td v-if="headers.find((header) => header.value === 'slicer')?.visible" class=" ">
                            {{ 'slicer' in item.metadata && item.metadata.slicer ? item.metadata.slicer : '--' }}
                            <small v-if="'slicer_version' in item.metadata && item.metadata.slicer_version">
                                <br />
                                {{ item.metadata.slicer_version }}
                            </small>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiTextBoxSearch }}</v-icon>
                    {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item
                    v-if="'note' in contextMenu.item && contextMenu.item.note"
                    @click="editNote(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiNotebookEdit }}</v-icon>
                    {{ $t('History.EditNote') }}
                </v-list-item>
                <v-list-item v-else @click="createNote(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiNotebookPlus }}</v-icon>
                    {{ $t('History.AddNote') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.exists"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrint(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteJob(contextMenu.item)">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <history-list-panel-details-dialog
            :show="detailsDialog.show"
            :job="detailsDialog.item"
            @close-dialog="detailsDialog.show = false" />
        <v-dialog v-model="deleteSelectedDialog" max-width="400">
            <panel
                :title="$t('History.Delete').toString()"
                card-class="history-delete-selected-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteSelectedDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('History.DeleteSelectedQuestion', { count: selectedJobs.length }) }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteSelectedDialog = false">{{ $t('History.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteSelectedJobs">{{ $t('History.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="noteDialog.boolShow" :max-width="600" persistent @keydown.esc="noteDialog.boolShow = false">
            <panel
                :title="
                    noteDialog.type === 'create'
                        ? $t('History.CreateNote').toString()
                        : $t('History.EditNote').toString()
                "
                :icon="noteDialog.type === 'create' ? mdiNotebookPlus : mdiNotebookEdit"
                card-class="history-note-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="noteDialog.boolShow = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pb-0">
                    <v-row>
                        <v-col>
                            <v-textarea
                                v-model="noteDialog.note"
                                outlined
                                hide-details
                                :label="$t('History.Note')"></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="noteDialog.boolShow = false">{{ $t('History.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="saveNote">{{ $t('History.Save') }}</v-btn>
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
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import {
    mdiDatabaseExportOutline,
    mdiDelete,
    mdiRefresh,
    mdiCog,
    mdiPrinter,
    mdiTextBoxSearch,
    mdiFile,
    mdiFileDocumentMultipleOutline,
    mdiMagnify,
    mdiCloseThick,
    mdiNotebookEdit,
    mdiNotebookPlus,
    mdiNotebook,
} from '@mdi/js'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
@Component({
    components: { HistoryListPanelDetailsDialog, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiDatabaseExportOutline = mdiDatabaseExportOutline
    mdiDelete = mdiDelete
    mdiRefresh = mdiRefresh
    mdiCog = mdiCog
    mdiPrinter = mdiPrinter
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiTextBoxSearch = mdiTextBoxSearch
    mdiFile = mdiFile
    mdiMagnify = mdiMagnify
    mdiCloseThick = mdiCloseThick
    mdiNotebookPlus = mdiNotebookPlus
    mdiNotebookEdit = mdiNotebookEdit
    mdiNotebook = mdiNotebook

    formatFilesize = formatFilesize

    private search = ''
    private sortBy = 'start_time'
    private sortDesc = true
    private options = {}
    private contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {} as ServerHistoryStateJob,
    }

    private detailsDialog = {
        item: {} as ServerHistoryStateJob,
        show: false,
    }

    private noteDialog: {
        item: ServerHistoryStateJob | null
        note: string
        boolShow: boolean
        type: 'create' | 'edit'
    } = {
        item: null,
        note: '',
        boolShow: false,
        type: 'create',
    }

    private deleteSelectedDialog = false

    get jobs() {
        return this.$store.getters['server/history/getFilterdJobList'] ?? []
    }

    get selectedJobs() {
        return this.$store.state.gui.view.history.selectedJobs ?? []
    }

    set selectedJobs(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.history.selectedJobs', value: newVal })
    }

    get headers() {
        const headers = [
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
            (col: any) => !['filename', 'status', 'slicer'].includes(col.value) && col.value !== ''
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

    get currentLanguage() {
        return this.$store.state.gui.general?.language ?? 'en'
    }

    refreshHistory() {
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

    clickRow(item: ServerHistoryStateJob) {
        this.detailsDialog.item = item
        this.detailsDialog.show = true
    }

    showContextMenu(e: any, item: ServerHistoryStateJob) {
        if (!this.contextMenu.shown) {
            e?.preventDefault()
            this.contextMenu.shown = true
            this.contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
            this.contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
            this.contextMenu.item = item
            this.$nextTick(() => {
                this.contextMenu.shown = true
            })
        }
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

    getSmallThumbnail(item: ServerHistoryStateJob) {
        if (item.metadata?.thumbnails?.length) {
            const thumbnail = item.metadata.thumbnails.find(
                (thumb: any) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )

            let relative_url = ''
            if (item.filename.lastIndexOf('/') !== -1) {
                relative_url = item.filename.substr(0, item.filename.lastIndexOf('/') + 1)
            }

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${this.apiUrl}/server/files/gcodes/${encodeURI(
                    relative_url + thumbnail.relative_path
                )}?timestamp=${item.metadata.modified}`
            }
        }

        return false
    }

    getBigThumbnail(item: ServerHistoryStateJob) {
        if (item.metadata?.thumbnails?.length) {
            const thumbnail = item.metadata?.thumbnails?.find((thumb: any) => thumb.width >= thumbnailBigMin)

            let relative_url = ''
            if (item.filename.lastIndexOf('/') !== -1) {
                relative_url = item.filename.substr(0, item.filename.lastIndexOf('/') + 1)
            }

            if (thumbnail && 'relative_path' in thumbnail)
                return `${this.apiUrl}/server/files/gcodes/${encodeURI(
                    relative_url + thumbnail.relative_path
                )}?timestamp=${item.metadata.modified}`
        }

        return false
    }

    getThumbnailWidth(item: ServerHistoryStateJob) {
        if (this.getBigThumbnail(item)) {
            const thumbnail = item.metadata?.thumbnails?.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail) return thumbnail.width
        }

        return 400
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

    startPrint(item: ServerHistoryStateJob) {
        if (item.exists)
            this.$socket.emit('printer.print.start', { filename: item.filename }, { action: 'switchToDashboard' })
    }

    deleteJob(item: ServerHistoryStateJob) {
        this.$socket.emit(
            'server.history.delete_job',
            { uid: item.job_id },
            { action: 'server/history/getDeletedJobs' }
        )
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
        const checkString = parseFloat('1.23').toLocaleString()
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
                    row.push(this.outputValue(col, job, false, csvSeperator))
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

        const csvContent = 'data:text/csv;charset=utf-8,' + content.map((e) => e.join(csvSeperator)).join('\n')
        const link = document.createElement('a')
        link.setAttribute('href', encodeURI(csvContent))
        link.setAttribute('download', 'print_history.csv')
        document.body.appendChild(link)

        link.click()
        link.remove()
    }

    getStatusIcon(status: string) {
        return this.$store.getters['server/history/getPrintStatusIcon'](status)
    }

    getStatusColor(status: string) {
        return this.$store.getters['server/history/getPrintStatusIconColor'](status)
    }

    outputValue(col: any, item: any, format: boolean = true, escapeChar: string | null = null) {
        let value = col.value in item ? item[col.value] : null
        if (value === null) value = col.value in item.metadata ? item.metadata[col.value] : null

        if (!format) {
            switch (col.outputType) {
                case 'date':
                    return this.formatDateTime(value * 1000)

                case 'time':
                    return value?.toFixed() ?? ''

                default:
                    switch (typeof value) {
                        case 'number':
                            return value?.toLocaleString(undefined, { useGrouping: false }) ?? 0

                        case 'string':
                            if (escapeChar !== null && value.includes(escapeChar)) value = '"' + value + '"'

                            return value

                        default:
                            return value
                    }
            }
        } else if (value > 0) {
            switch (col.outputType) {
                case 'filesize':
                    return formatFilesize(value)

                case 'date':
                    return this.formatDateTime(value * 1000)

                case 'time':
                    return this.formatPrintTime(value)

                case 'temp':
                    return value?.toFixed() + ' °C'

                case 'length':
                    if (value > 1000) return (value / 1000).toFixed(2) + ' m'

                    return value?.toFixed(2) + ' mm'

                default:
                    return value
            }
        } else return '--'
    }

    createNote(item: ServerHistoryStateJob) {
        this.noteDialog.item = item
        this.noteDialog.note = ''
        this.noteDialog.type = 'create'
        this.noteDialog.boolShow = true
    }

    editNote(item: ServerHistoryStateJob) {
        this.noteDialog.item = item
        this.noteDialog.note = item.note ?? ''
        this.noteDialog.type = 'edit'
        this.noteDialog.boolShow = true
    }

    saveNote() {
        this.$store.dispatch('server/history/saveHistoryNote', {
            job_id: this.noteDialog.item?.job_id,
            note: this.noteDialog.note,
        })

        this.noteDialog.boolShow = false
    }
}
</script>
