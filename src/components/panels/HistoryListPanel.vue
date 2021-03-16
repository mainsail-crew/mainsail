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
                            <v-icon v-if="!(getSmallThumbnail(item))">mdi-file</v-icon>
                            <v-tooltip v-if="getSmallThumbnail(item) && getBigThumbnail(item)" top>
                                <template v-slot:activator="{ on, attrs }">
                                    <img :src="getSmallThumbnail(item)" width="32" height="32" v-bind="attrs" v-on="on"  />
                                </template>
                                <span><img :src="getBigThumbnail(item)" width="250" /></span>
                            </v-tooltip>
                            <img v-if="getSmallThumbnail(item) && !getBigThumbnail(item)" :src="getSmallThumbnail(item)" width="32" height="32" />
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class=" ">
                            <v-chip :color="getIconColor(item.status)" small>{{ item.status }}</v-chip>
                        </td>
                        <td class=" " v-if="headers.filter(header => header.value === 'size')[0].visible">{{ 'size' in item.metadata && item.metadata.size ? formatFilesize(item.metadata.size) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'modified')[0].visible">{{ 'modified' in item.metadata && item.metadata.modified ? formatDate(item.metadata.modified) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'start_time')[0].visible">{{ item.start_time > 0 ? formatDate(item.start_time) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'end_time')[0].visible">{{ item.end_time > 0 ? formatDate(item.end_time) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'estimated_time')[0].visible">{{ 'estimated_time' in item.metadata && item.metadata.estimated_time ? formatPrintTime(item.metadata.estimated_time) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'print_duration')[0].visible">{{ item.print_duration > 0 ? formatPrintTime(item.print_duration) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'total_duration')[0].visible">{{ item.total_duration > 0 ? formatPrintTime(item.total_duration) : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'filament_total')[0].visible">{{ 'filament_total' in item.metadata && item.metadata.filament_total ? item.metadata.filament_total+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'filament_used')[0].visible">{{ item.filament_used ? item.filament_used.toFixed()+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'first_layer_extr_temp')[0].visible">{{ 'first_layer_extr_temp' in item.metadata && item.metadata.first_layer_extr_temp ? item.metadata.first_layer_extr_temp+' °C' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'first_layer_bed_temp')[0].visible">{{ 'first_layer_bed_temp' in item.metadata && item.metadata.first_layer_bed_temp ? item.metadata.first_layer_bed_temp+' °C' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'first_layer_height')[0].visible">{{ 'first_layer_height' in item.metadata && item.metadata.first_layer_height ? item.metadata.first_layer_height+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'layer_height')[0].visible">{{ 'layer_height' in item.metadata && item.metadata.layer_height ? item.metadata.layer_height+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'object_height')[0].visible">{{ 'object_height' in item.metadata && item.metadata.object_height ? item.metadata.object_height+' mm' : '--' }}</td>
                        <td class=" " v-if="headers.filter(header => header.value === 'slicer')[0].visible">
                            {{ 'slicer' in item.metadata && item.metadata.slicer ? item.metadata.slicer : '--' }}
                            <small v-if="'slicer_version' in item.metadata && item.metadata.slicer_version"><br />{{ item.metadata.slicer_version }}</small>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item >
                    <v-icon class="mr-1">mdi-play</v-icon> Print start
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
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
                    isDirectory: false,
                    touchTimer: undefined,
                    x: 0,
                    y: 0,
                    item: {}
                },
            }
        },
        computed: {
            ...mapState({
                jobs: state => state.server.history.jobs,
            }),
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
            }
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