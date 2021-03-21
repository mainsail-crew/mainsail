<template>
    <div>
        <v-card>
            <v-card-title>
                Print History
                <v-spacer class="d-none d-sm-block"></v-spacer>
                <v-item-group class="v-btn-toggle my-5 my-sm-0 col-12 col-sm-auto px-0 py-0" name="controllers">
                    <v-btn title="Refresh History" class="flex-grow-1" @click="refreshHistory"><v-icon>mdi-refresh</v-icon></v-btn>
                    <v-menu :offset-y="true" :close-on-content-click="false" title="Setup current list">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="flex-grow-1" v-bind="attrs" v-on="on"><v-icon class="">mdi-cog</v-icon></v-btn>
                        </template>
                        <v-list>
                            <v-list-item class="minHeight36" v-for="header of configHeaders" v-bind:key="header.key">
                                <v-checkbox class="mt-0" hide-details v-model="header.visible" @change="changeColumnVisible(header.value)" :label="header.text"></v-checkbox>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-item-group>
            </v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-text>
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
                    itemsPerPageText: 'Files'
                }"
                item-key="name"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0">

                <template slot="items" slot-scope="props">
                    <td v-for="header in filteredHeaders" v-bind:key="header.text">{{ props.item[header.value] }}</td>
                </template>

                <template #no-data>
                    <div class="text-center">empty</div>
                </template>

                <template #item="{ item }">
                    <tr
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor user-select-none"
                    >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <template v-if="getSmallThumbnail(item) && getBigThumbnail(item)">
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
                                <v-icon >{{ item.exists ? "mdi-file" : "mdi-file-cancel" }}</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class=" ">
                            <v-chip :color="getIconColor(item.status)" small>{{ item.status.replaceAll("_", " ") }}</v-chip>
                        </td>
                        <td class=" " v-if="headers.find(header => header.value === 'size').visible">{{ 'size' in item.metadata && item.metadata.size ? formatFilesize(item.metadata.size) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'modified').visible">{{ 'modified' in item.metadata && item.metadata.modified ? formatDate(item.metadata.modified) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'start_time').visible">{{ item.start_time > 0 ? formatDate(item.start_time) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'end_time').visible">{{ item.end_time > 0 ? formatDate(item.end_time) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'estimated_time').visible">{{ 'estimated_time' in item.metadata && item.metadata.estimated_time ? formatPrintTime(item.metadata.estimated_time) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'print_duration').visible">{{ item.print_duration > 0 ? formatPrintTime(item.print_duration) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'total_duration').visible">{{ item.total_duration > 0 ? formatPrintTime(item.total_duration) : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'filament_total').visible">{{ 'filament_total' in item.metadata && item.metadata.filament_total ? item.metadata.filament_total+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'filament_used').visible">{{ item.filament_used ? item.filament_used.toFixed()+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'first_layer_extr_temp').visible">{{ 'first_layer_extr_temp' in item.metadata && item.metadata.first_layer_extr_temp ? item.metadata.first_layer_extr_temp+' °C' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'first_layer_bed_temp').visible">{{ 'first_layer_bed_temp' in item.metadata && item.metadata.first_layer_bed_temp ? item.metadata.first_layer_bed_temp+' °C' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'first_layer_height').visible">{{ 'first_layer_height' in item.metadata && item.metadata.first_layer_height ? item.metadata.first_layer_height+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'layer_height').visible">{{ 'layer_height' in item.metadata && item.metadata.layer_height ? item.metadata.layer_height+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'object_height').visible">{{ 'object_height' in item.metadata && item.metadata.object_height ? item.metadata.object_height+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.find(header => header.value === 'slicer').visible">
                            {{ 'slicer' in item.metadata && item.metadata.slicer ? item.metadata.slicer : '--' }}
                            <small v-if="'slicer_version' in item.metadata && item.metadata.slicer_version"><br />{{ item.metadata.slicer_version }}</small>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item)">
                    <v-icon class="mr-1">mdi-text-box-search</v-icon> Details
                </v-list-item>
                <v-list-item @click="startPrint(contextMenu.item)" v-if="contextMenu.item.exists" :disabled="is_printing">
                    <v-icon class="mr-1">mdi-printer</v-icon> Reprint
                </v-list-item>
                <v-list-item @click="deleteJob(contextMenu.item)" :disabled="contextMenu.item.status === 'in_progress'">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="detailsDialog.boolShow" :max-width="600" :max-height="500">
            <v-card dark>
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-update</v-icon>Job Details</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" color="grey darken-3" @click="detailsDialog.boolShow = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-5">
                    <v-simple-table
                        style="
                            height: 350px;
                            max-height: 350px;
                            overflow-y: auto;
                        ">
                        <tbody>
                            <tr>
                                <td>Filename</td>
                                <td class="text-right">{{ detailsDialog.item.filename }}</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'size' in detailsDialog.item.metadata">
                                <td>Filesize</td>
                                <td class="text-right">{{ formatFilesize(detailsDialog.item.metadata.size) }}</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'modified' in detailsDialog.item.metadata">
                                <td>Last Modified</td>
                                <td class="text-right">{{ formatDate(detailsDialog.item.metadata.modified) }}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td class="text-right">{{ detailsDialog.item.status }}</td>
                            </tr>
                            <tr>
                                <td>Start Time</td>
                                <td class="text-right">{{ formatDate(detailsDialog.item.start_time) }}</td>
                            </tr>
                            <tr>
                                <td>End Time</td>
                                <td class="text-right">{{ formatDate(detailsDialog.item.end_time) }}</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'estimated_time' in detailsDialog.item.metadata">
                                <td>Estimated Time</td>
                                <td class="text-right">{{ formatPrintTime(detailsDialog.item.metadata.estimated_time) }}</td>
                            </tr>
                            <tr v-if="detailsDialog.item.print_duration > 0">
                                <td>Print Duration</td>
                                <td class="text-right">{{ formatPrintTime(detailsDialog.item.print_duration) }}</td>
                            </tr>
                            <tr v-if="detailsDialog.item.total_duration > 0">
                                <td>Total Duration</td>
                                <td class="text-right">{{ formatPrintTime(detailsDialog.item.total_duration) }}</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'filament_total' in detailsDialog.item.metadata">
                                <td>Estimated Filament</td>
                                <td class="text-right">{{ Math.round(detailsDialog.item.metadata.filament_total) }} mm</td>
                            </tr>
                            <tr v-if="detailsDialog.item.filament_used > 0">
                                <td>Filament Used</td>
                                <td class="text-right">{{ Math.round(detailsDialog.item.filament_used) }} mm</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'first_layer_extr_temp' in detailsDialog.item.metadata">
                                <td>First Layer Ext. Temp.</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.first_layer_extr_temp }} °C</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'first_layer_bed_temp' in detailsDialog.item.metadata">
                                <td>First Layer Bed Temp.</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.first_layer_bed_temp }} °C</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'first_layer_height' in detailsDialog.item.metadata">
                                <td>First Layer Height</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.first_layer_height }} mm</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'layer_height' in detailsDialog.item.metadata">
                                <td>Layer Height</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.layer_height }} mm</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'object_height' in detailsDialog.item.metadata">
                                <td>Object Height</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.object_height }} mm</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'slicer' in detailsDialog.item.metadata">
                                <td>Slicer</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.slicer }}</td>
                            </tr>
                            <tr v-if="'metadata' in detailsDialog.item && 'slicer_version' in detailsDialog.item.metadata">
                                <td>Slicer Version</td>
                                <td class="text-right">{{ detailsDialog.item.metadata.slicer_version }}</td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import VueLoadImage from 'vue-load-image'

    export default {
        components: {
            'vue-load-image': VueLoadImage
        },
        data() {
            return {
                search: '',
                sortBy: 'start_time',
                sortDesc: true,
                selected: [],
                hideHeaderColums: [],
                headers: [
                    { text: '',               value: '',                align: 'left',  configable: false,  visible: true, filterable: false },
                    { text: 'Name',           value: 'filename',        align: 'left',  configable: false,  visible: true },
                    { text: 'Status',         value: 'status',          align: 'left',  configable: false,  visible: true },
                    { text: 'Filesize',       value: 'size',            align: 'left',  configable: true,   visible: false },
                    { text: 'Last modified',  value: 'modified',        align: 'left',  configable: true,  visible: false },
                    { text: 'Start Time',     value: 'start_time',      align: 'left',  configable: true,  visible: true },
                    { text: 'End Time',       value: 'end_time',        align: 'left',  configable: true,  visible: false },
                    { text: 'Estimated Time', value: 'estimated_time',  align: 'left',  configable: true,  visible: true },
                    { text: 'Print Time',     value: 'print_duration',  align: 'left', configable: true,  visible: true },
                    { text: 'Total Time',     value: 'total_duration',  align: 'left', configable: true,  visible: false },
                    { text: 'Filament Calc',  value: 'filament_total',  align: 'left', configable: true,  visible: false },
                    { text: 'Filament Used',  value: 'filament_used',   align: 'left', configable: true,  visible: true },
                    { text: 'Ext. Temp.',     value: 'first_layer_extr_temp',   align: 'left', configable: true,  visible: false },
                    { text: 'Bed Temp.',      value: 'first_layer_bed_temp',   align: 'left', configable: true,  visible: false },
                    { text: 'First Layer Height', value: 'first_layer_height',   align: 'left', configable: true,  visible: false },
                    { text: 'Layer Height',   value: 'layer_height',    align: 'left', configable: true,  visible: false },
                    { text: 'Object Height',  value: 'object_height',   align: 'left', configable: true,  visible: false },
                    { text: 'Slicer',         value: 'slicer',          align: 'left', configable: true,  visible: true },
                ],
                options: {

                },
                contextMenu: {
                    shown: false,
                    touchTimer: undefined,
                    x: 0,
                    y: 0,
                    item: {}
                },
                detailsDialog: {
                    item: {},
                    boolShow: false,
                }
            }
        },
        computed: {
            ...mapState({
                jobs: state => state.server.history.jobs,
            }),
            ...mapGetters([
                'is_printing'
            ]),
            configHeaders() {
                return this.headers.filter(header => header.configable === true)
            },
            filteredHeaders() {
                return this.headers.filter(header => header.visible === true)
            },
            baseUrl: {
                get: function() {
                    return this.$store.getters["socket/getUrl"]
                }
            },
            countPerPage: {
                get: function() {
                    return this.$store.state.gui.history.countPerPage
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { history: { countPerPage: newVal } })
                }
            },
            hideColums: {
                get: function() {
                    return this.$store.state.gui.history.hideColums
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { history: { hideColums: newVal } })
                }
            },
        },
        mounted() {
            this.hideColums.forEach((key) => {
                let headerElement = this.headers.find(element => element.value === key)
                if (headerElement) headerElement.visible = false
            })
        },
        methods: {
            getIcon(status) {
                switch(status) {
                    case 'in_progress': return 'mdi-cogs'
                    case 'completed': return 'mdi-check-circle'
                    case 'cancelled': return 'mdi-close-circle'

                    default: return 'mdi-progress-question'
                }
            },
            getIconColor(status) {
                switch(status) {
                    case 'in_progress': return 'blue-grey darken-1'
                    case 'completed': return 'green'
                    case 'cancelled': return 'red'

                    default: return 'orange'
                }
            },
            refreshHistory: function() {
                this.$socket.sendObj('server.history.list', {}, 'server/history/getHistory')
            },
            formatDate(date) {
                let tmp2 = new Date(date*1000)

                return tmp2.toLocaleString().replace(',', '')
            },
            formatFilesize(fileSizeInBytes) {
                let i = -1
                let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
                do {
                    fileSizeInBytes = fileSizeInBytes / 1024
                    i++
                } while (fileSizeInBytes > 1024)

                return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
            },
            formatPrintTime(totalSeconds) {
                if (totalSeconds) {
                    let output = ""

                    let days = Math.floor(totalSeconds / (3600 * 24))
                    if (days) {
                        totalSeconds %= (3600 * 24)
                        output += days+"d"
                    }

                    let hours = Math.floor(totalSeconds / 3600)
                    totalSeconds %= 3600
                    if (hours) output += " "+hours+"h"

                    let minutes = Math.floor(totalSeconds / 60)
                    if (minutes) output += " "+minutes+"m"

                    let seconds = totalSeconds % 60
                    if (seconds) output += " "+seconds.toFixed(0)+"s"

                    return output
                }

                return '--'
            },
            clickRow(item) {
                this.detailsDialog.item = item
                this.detailsDialog.boolShow = true
            },
            showContextMenu (e, item) {
                if (!this.contextMenu.shown) {
                    e?.preventDefault();
                    this.contextMenu.shown = true
                    this.contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2;
                    this.contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2;
                    this.contextMenu.item = item
                    this.$nextTick(() => {
                        this.contextMenu.shown = true
                    })
                }
            },
            sortFiles(items, sortBy, sortDesc) {
                sortBy = sortBy.length ? sortBy[0] : 'filename';
                sortDesc = sortDesc[0];

                if (items !== undefined) {
                    // Sort by index
                    items.sort(function(a, b) {
                        if (a[sortBy] === b[sortBy]) {
                            return 0;
                        }
                        if (a[sortBy] === null || a[sortBy] === undefined) {
                            return -1;
                        }
                        if (b[sortBy] === null || b[sortBy] === undefined) {
                            return 1;
                        }
                        if (a[sortBy].constructor === String && b[sortBy].constructor === String) {
                            return a[sortBy].localeCompare(b[sortBy], undefined, { sensivity: 'base' });
                        }
                        if (a[sortBy] instanceof Array && b[sortBy] instanceof Array) {
                            const reducedA = a[sortBy].length ? a.filament.reduce((a, b) => a + b) : 0;
                            const reducedB = b[sortBy].length ? b.filament.reduce((a, b) => a + b) : 0;
                            return reducedA - reducedB;
                        }
                        return a[sortBy] - b[sortBy];
                    });

                    // Deal with descending order
                    if (sortDesc) items.reverse()
                }
                return items;
            },
            advancedSearch: function(value, search) {
                return value != null &&
                    search != null &&
                    typeof value === 'string' &&
                    value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
            },
            changeColumnVisible: function(name) {
                if (this.headers.filter(header => header.value === name).length) {
                    let value = this.headers.filter(header => header.value === name)[0].visible;

                    this.$store.dispatch("gui/setHistoryColumns", {name: name, value: value});
                }
            },
            startPrint(item) {
                if (item.exists) this.$socket.sendObj('printer.print.start', { filename: item.filename }, 'switchToDashboard')
            },
            deleteJob(item) {
                this.$socket.sendObj('server.history.delete_job', { uid: item.job_id }, 'server/history/getDeletedJobs')
            },
            getSmallThumbnail(item) {
                if (
                    'metadata' in item &&
                    'thumbnails' in item.metadata &&
                    item.metadata.thumbnails.length
                ) {
                    const thumbnail = item.metadata.thumbnails.find(thumb =>
                        thumb.width >= 32 && thumb.width <= 64 &&
                        thumb.height >= 32 && thumb.height <= 64
                    )

                    if (thumbnail && 'relative_path' in thumbnail) return this.baseUrl+"/server/files/gcodes/"+thumbnail.relative_path
                }

                return false
            },
            getBigThumbnail(item) {
                if (
                    'metadata' in item &&
                    'thumbnails' in item.metadata &&
                    item.metadata.thumbnails.length
                ) {
                    const thumbnail = item.metadata.thumbnails.find(thumb => thumb.width >= 300 && thumb.width <= 400)

                    if (thumbnail && 'relative_path' in thumbnail) return this.baseUrl+"/server/files/gcodes/"+thumbnail.relative_path
                }

                return false
            },
            getThumbnailWidth(item) {
                if (this.getBigThumbnail(item)) {
                    const thumbnail = item.metadata.thumbnails.find(thumb => thumb.width >= 300 && thumb.width <= 400)

                    if (thumbnail) return thumbnail.width
                }

                return 400
            },
        },
        watch: {
            hideColums: function(newVal) {
                newVal.forEach((key) => {
                    let headerElement = this.headers.find(element => element.value === key)
                    if (headerElement) headerElement.visible = false
                })
            }
        }
    }
</script>