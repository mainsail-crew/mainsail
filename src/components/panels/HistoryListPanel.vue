<template>
    <div>
        <panel
            icon="mdi-file-document-multiple-outline"
            :title="$t('History.PrintHistory')"
            card-class="history-list-panel"
        >
            <v-card-text>
                <v-row>
                    <v-col class="col-4 d-flex align-center">

                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            :label="$t('History.Search')"
                            single-line
                            outlined
                            clearable
                            hide-details
                            dense
                        ></v-text-field>
                    </v-col>
                    <v-col class="offset-4 col-4 d-flex align-center justify-end">
                        <v-btn :title="$t('History.TitleRefreshHistory')" class="px-2 minwidth-0 ml-3" @click="refreshHistory"><v-icon>mdi-refresh</v-icon></v-btn>
                        <v-menu :offset-y="true" :close-on-content-click="false" title="Setup current list">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="px-2 minwidth-0 ml-3" :title="$t('History.TitleSettings')" v-bind="attrs" v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
                            </template>
                            <v-list>
                                <template v-if="allPrintStatusArray.length">
                                    <v-list-item class="minHeight36" v-for="status of allPrintStatusArray" v-bind:key="status.key">
                                        <v-checkbox class="mt-0" hide-details :input-value="status.showInTable" @change="changeStatusVisible(status)" :label="$t('History.ShowStatusName', { name: status.name, count: status.value })"></v-checkbox>
                                    </v-list-item>
                                    <v-divider></v-divider>
                                </template>
                                <v-list-item class="minHeight36" v-for="header of configHeaders" v-bind:key="header.key">
                                    <v-checkbox class="mt-0" hide-details v-model="header.visible" @change="changeColumnVisible(header.value)" :label="header.text"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                :items="jobs"
                class="files-table"
                :headers="filteredHeaders"
                :options="options"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('History.Jobs'),
                    itemsPerPageAllText: $t('History.AllJobs'),
                    itemsPerPageOptions: [10,25,50,100,-1]
                }"
                item-key="name"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0">

                <template slot="items" slot-scope="props">
                    <td v-for="header in filteredHeaders" v-bind:key="header.text">{{ props.item[header.value] }}</td>
                </template>

                <template #no-data>
                    <div class="text-center">{{ $t('History.Empty') }}</div>
                </template>

                <template #item="{ index, item }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        :class="'file-list-cursor user-select-none '+(item.exists ? '' : 'text--disabled')"
                    >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <template v-if="!item.exists">
                                <v-icon class="text--disabled">mdi-file-cancel</v-icon>
                            </template>
                            <template v-else-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" v-bind="attrs" v-on="on"  />
                                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                            <v-icon slot="error">mdi-file</v-icon>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="getBigThumbnail(item)" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else-if="getSmallThumbnail(item)">
                                <vue-load-image>
                                    <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" />
                                    <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                    <v-icon slot="error">mdi-file</v-icon>
                                </vue-load-image>
                            </template>
                            <template v-else>
                                <v-icon>mdi-file</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-center">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <v-icon small :color="getStatusColor(item.status)" :disabled="!item.exists">{{ getStatusIcon(item.status) }}</v-icon>
                                    </span>
                                </template>
                                <span>{{ item.status.replace(/_/g, " ") }}</span>
                            </v-tooltip>
                        </td>
                        <td v-for="col in tableFields" v-bind:key="col.value" :class="col.outputType !== 'date' ? 'text-no-wrap' : ''">
                            {{ outputValue(col, item) }}
                        </td>
                        <td class=" " v-if="headers.find(header => header.value === 'slicer').visible">
                            {{ 'slicer' in item.metadata && item.metadata.slicer ? item.metadata.slicer : '--' }}
                            <small v-if="'slicer_version' in item.metadata && item.metadata.slicer_version"><br />{{ item.metadata.slicer_version }}</small>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item)">
                    <v-icon class="mr-1">mdi-text-box-search</v-icon> {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item @click="startPrint(contextMenu.item)" v-if="contextMenu.item.exists" :disabled="printerIsPrinting || !klipperReadyForGui">
                    <v-icon class="mr-1">mdi-printer</v-icon> {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item @click="deleteJob(contextMenu.item)">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="detailsDialog.boolShow" :max-width="600" persistent @keydown.esc="detailsDialog.boolShow = false">
            <panel :title="$t('History.JobDetails')" icon="mdi-update" card-class="history-detail-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="detailsDialog.boolShow = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="px-0">
                    <overlay-scrollbars style="height: 350px;" class="px-6">
                        <v-row>
                            <v-col>{{ $t('History.Filename') }}</v-col>
                            <v-col class="text-right">{{ detailsDialog.item.filename }}</v-col>
                        </v-row>
                        <template v-if="'metadata' in detailsDialog.item && 'size' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.Filesize') }}</v-col>
                                <v-col class="text-right">{{ formatFilesize(detailsDialog.item.metadata.size) }}</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'modified' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.LastModified') }}</v-col>
                                <v-col class="text-right">{{ formatDate(detailsDialog.item.metadata.modified) }}</v-col>
                            </v-row>
                        </template>
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.Status') }}</v-col>
                            <v-col class="text-right">{{ detailsDialog.item.status }}</v-col>
                        </v-row>
                        <v-divider class="my-3"></v-divider>
                        <v-row>
                            <v-col>{{ $t('History.StartTime') }}</v-col>
                            <v-col class="text-right">{{ formatDate(detailsDialog.item.start_time) }}</v-col>
                        </v-row>
                        <template v-if="'end_time' in detailsDialog.item && detailsDialog.item.end_time > 0">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.EndTime') }}</v-col>
                                <v-col class="text-right">{{ formatDate(detailsDialog.item.end_time) }}</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'estimated_time' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.EstimatedTime') }}</v-col>
                                <v-col class="text-right">{{ formatPrintTime(detailsDialog.item.metadata.estimated_time) }}</v-col>
                            </v-row>
                        </template>
                        <template v-if="detailsDialog.item.print_duration > 0">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.PrintDuration') }}</v-col>
                                <v-col class="text-right">{{ formatPrintTime(detailsDialog.item.print_duration) }}</v-col>
                            </v-row>
                        </template>
                        <template v-if="detailsDialog.item.total_duration > 0">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.TotalDuration') }}</v-col>
                                <v-col class="text-right">{{ formatPrintTime(detailsDialog.item.total_duration) }}</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'filament_total' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.EstimatedFilamentWeight') }}</v-col>
                                <v-col class="text-right">{{ Math.round(detailsDialog.item.metadata.filament_weight_total*100)/100 }} g</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'filament_total' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.EstimatedFilament') }}</v-col>
                                <v-col class="text-right">{{ Math.round(detailsDialog.item.metadata.filament_total) }} mm</v-col>
                            </v-row>
                        </template>
                        <template v-if="detailsDialog.item.filament_used > 0">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.FilamentUsed') }}</v-col>
                                <v-col class="text-right">{{ Math.round(detailsDialog.item.filament_used) }} mm</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'first_layer_extr_temp' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.FirstLayerExtTemp') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.first_layer_extr_temp }} °C</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'first_layer_bed_temp' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.FirstLayerBedTemp') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.first_layer_bed_temp }} °C</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'first_layer_height' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.FirstLayerHeight') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.first_layer_height }} mm</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'layer_height' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.LayerHeight') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.layer_height }} mm</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'object_height' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.ObjectHeight') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.object_height }} mm</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'slicer' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.Slicer') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.slicer }}</v-col>
                            </v-row>
                        </template>
                        <template v-if="'metadata' in detailsDialog.item && 'slicer_version' in detailsDialog.item.metadata">
                            <v-divider class="my-3"></v-divider>
                            <v-row>
                                <v-col>{{ $t('History.SlicerVersion') }}</v-col>
                                <v-col class="text-right">{{ detailsDialog.item.metadata.slicer_version }}</v-col>
                            </v-row>
                        </template>
                    </overlay-scrollbars>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">


import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {ServerHistoryStateJob} from '@/store/server/history/types'
import {caseInsensitiveSort, formatFilesize} from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import {thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin} from '@/store/variables'
@Component({
    components: {Panel}
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    private boolAllData = false
    private search = ''
    private sortBy = 'start_time'
    private sortDesc = true
    private selected = []
    private hideHeaderColums = []
    private options = { }
    private contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {}
    }
    private detailsDialog = {
        item: {},
        boolShow: false,
    }

    get jobs() {
        return this.$store.getters['server/history/getFilterdJobList'] ?? []
    }

    get headers() {
        const headers = [ {
            text: '',
            value: '',
            align: 'left',
            configable: false,
            visible: true,
            filterable: false
        }, {
            text: this.$t('History.Filename'),
            value: 'filename',
            align: 'left',
            configable: false,
            visible: true
        }, {
            text: '',
            value: 'status',
            align: 'left',
            configable: false,
            visible: true,
            filterable: false
        }, {
            text: this.$t('History.Filesize'),
            value: 'size',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'filesize'
        }, {
            text: this.$t('History.LastModified'),
            value: 'modified',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'date'
        }, {
            text: this.$t('History.StartTime'),
            value: 'start_time',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'date'
        }, {
            text: this.$t('History.EndTime'),
            value: 'end_time',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'date'
        }, {
            text: this.$t('History.EstimatedTime'),
            value: 'estimated_time',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'time'
        }, {
            text: this.$t('History.PrintTime'),
            value: 'print_duration',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'time'
        }, {
            text: this.$t('History.TotalTime'),
            value: 'total_duration',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'time'
        }, {
            text: this.$t('History.FilamentCalc'),
            value: 'filament_total',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'length'
        }, {
            text: this.$t('History.FilamentUsed'),
            value: 'filament_used',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'length'
        }, {
            text: this.$t('History.FirstLayerExtTemp'),
            value: 'first_layer_extr_temp',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'temp'
        }, {
            text: this.$t('History.FirstLayerBedTemp'),
            value: 'first_layer_bed_temp',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'temp'
        }, {
            text: this.$t('History.FirstLayerHeight'),
            value: 'first_layer_height',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'length'
        }, {
            text: this.$t('History.LayerHeight'),
            value: 'layer_height',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'length'
        }, {
            text: this.$t('History.ObjectHeight'),
            value: 'object_height',
            align: 'left',
            configable: true,
            visible: true,
            outputType: 'length'
        }, {
            text: this.$t('History.Slicer'),
            value: 'slicer',
            align: 'left',
            configable: true,
            visible: true
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
        return this.filteredHeaders.filter((col: any) => !['filename', 'status', 'slicer'].includes(col.value) && col.value !== '')
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
        this.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
    }

    formatDate(date: number) {
        const tmp2 = new Date(date*1000)

        return tmp2.toLocaleString().replace(',', '')
    }

    formatPrintTime(totalSeconds: number) {
        if (totalSeconds) {
            let output = ''

            const days = Math.floor(totalSeconds / (3600 * 24))
            if (days) {
                totalSeconds %= (3600 * 24)
                output += days+'d'
            }

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output += ' '+hours+'h'

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output += ' '+minutes+'m'

            const seconds = totalSeconds % 60
            if (seconds) output += ' '+seconds.toFixed(0)+'s'

            return output
        }

        return '--'
    }
    
    clickRow(item: ServerHistoryStateJob) {
        this.detailsDialog.item = item
        this.detailsDialog.boolShow = true
    }
    
    showContextMenu (e: any, item: ServerHistoryStateJob) {
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
            items.sort(function(a, b) {
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
        return value != null &&
            search != null &&
            value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
    }

    getSmallThumbnail(item: ServerHistoryStateJob) {
        if (
            'metadata' in item &&
            'thumbnails' in item.metadata &&
            item.metadata.thumbnails.length
        ) {
            const thumbnail = item.metadata.thumbnails.find((thumb: any) =>
                thumb.width >= thumbnailSmallMin && thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin && thumb.height <= thumbnailSmallMax
            )

            let relative_url = ''
            if (item.filename.lastIndexOf('/') !== -1) {
                relative_url = item.filename.substr(0, item.filename.lastIndexOf('/')+1)
            }

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${this.apiUrl}/server/files/gcodes/${encodeURI(relative_url+thumbnail.relative_path)}?timestamp=${item.metadata.modified}`
            }
        }

        return false
    }

    getBigThumbnail(item: ServerHistoryStateJob) {
        if (
            'metadata' in item &&
            'thumbnails' in item.metadata &&
            item.metadata.thumbnails.length
        ) {
            const thumbnail = item.metadata.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            let relative_url = ''
            if (item.filename.lastIndexOf('/') !== -1) {
                relative_url = item.filename.substr(0, item.filename.lastIndexOf('/')+1)
            }

            if (thumbnail && 'relative_path' in thumbnail)
                return `${this.apiUrl}/server/files/gcodes/${encodeURI(relative_url+thumbnail.relative_path)}?timestamp=${item.metadata.modified}`
        }

        return false
    }

    getThumbnailWidth(item: ServerHistoryStateJob) {
        if (this.getBigThumbnail(item)) {
            const thumbnail = item.metadata.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail) return thumbnail.width
        }

        return 400
    }

    changeColumnVisible(name: string) {
        if (this.headers.filter(header => header.value === name).length) {
            let value = this.headers.filter(header => header.value === name)[0].visible

            this.$store.dispatch('gui/setHistoryColumns', {name: name, value: value})
        }
    }

    changeStatusVisible(status: any) {
        if (status.showInTable) this.$store.dispatch('gui/hideStatusInHistoryList', status.name)
        else this.$store.dispatch('gui/showStatusInHistoryList', status.name)
    }

    startPrint(item: ServerHistoryStateJob) {
        if (item.exists) this.$socket.emit('printer.print.start', { filename: item.filename }, { action: 'switchToDashboard' })
    }

    deleteJob(item: ServerHistoryStateJob) {
        this.$socket.emit('server.history.delete_job', { uid: item.job_id }, { action: 'server/history/getDeletedJobs' })
    }

    getStatusIcon(status: string) {
        return this.$store.getters['server/history/getPrintStatusChipIcon'](status)
    }

    getStatusColor(status: string) {
        return this.$store.getters['server/history/getPrintStatusChipColor'](status)
    }

    outputValue(col: any, item: any) {
        let value = col.value in item ? item[col.value] : null
        if (value === null) value = col.value in item.metadata ? item.metadata[col.value] : null

        if (value > 0) {
            switch(col.outputType) {
            case 'filesize':
                return formatFilesize(value)

            case 'date':
                return this.formatDate(value)

            case 'time':
                return this.formatPrintTime(value)

            case 'temp':
                return value.toFixed()+' °C'

            case 'length':
                if (value > 1000) return (value / 1000).toFixed(2)+' m'

                return value.toFixed(2)+' mm'

            default:
                return value
            }
        } else return '--'
    }
}
</script>
