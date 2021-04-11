<style>
    .v-data-table .v-data-table-header__icon {
        margin-left: 7px;
    }

    .v-data-table th {
        white-space: nowrap;
    }

    .v-data-table .file-list-cursor:hover {
        cursor: pointer;
    }

    .fileupload-card {
        position: relative;
    }

    .dragzone {
        display: table;
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 9999999999;
        background-color: rgba(0, 0, 0, 0.5);
        transition: visibility 175ms, opacity 175ms;
        font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
    }

    .dragzone:before {
        display: block;
        content: ' ';
        position: absolute;
        top: 15px; right: 15px; bottom: 15px; left: 15px;
        border: 3px dashed white;
        border-radius: 15px;
    }

    .dragzone .textnode {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        transition: font-size 175ms;
    }

    .minHeight36 {
        min-height: 36px;
    }
</style>

<template>
    <div>
        <v-card class="fileupload-card my-3" @dragover="dragOverUpload" @dragleave="dragLeaveUpload" @drop.prevent.stop="dragDropUpload">
            <v-card-title>
                {{ $t("Files.GCodeFiles")}}
                <v-spacer class="d-none d-sm-block"></v-spacer>
                <input type="file" ref="fileUpload" :accept="validGcodeExtensions.join(', ')" style="display: none" multiple @change="uploadFile" />
                <v-item-group class="v-btn-toggle my-5 my-sm-0 col-12 col-sm-auto px-0 py-0" name="controllers">
                    <v-btn @click="clickUploadButton" :title="$t('Files.UploadNewGcode')" class="primary flex-grow-1" :loading="loadings.includes('gcodeUpload')"><v-icon>mdi-upload</v-icon></v-btn>
                    <v-btn @click="createDirectory" :title="$t('Files.CreateNewDirectory')" class="flex-grow-1"><v-icon>mdi-folder-plus</v-icon></v-btn>
                    <v-btn @click="refreshFileList" :title="$t('Files.RefreshCurrentDirectory')" class="flex-grow-1"><v-icon>mdi-refresh</v-icon></v-btn>
                    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="flex-grow-1" v-bind="attrs" v-on="on"><v-icon class="">mdi-cog</v-icon></v-btn>
                        </template>
                        <v-list>
                            <v-list-item class="minHeight36">
                                <v-checkbox class="mt-0" hide-details v-model="showHiddenFiles" :label="$t('Files.HiddenFiles')"></v-checkbox>
                            </v-list-item>
                            <v-list-item class="minHeight36">
                                <v-checkbox class="mt-0" hide-details v-model="showPrintedFiles" :label="$t('Files.PrintedFiles')"></v-checkbox>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item class="minHeight36" v-for="header of configHeaders" v-bind:key="header.key">
                                <v-checkbox class="mt-0" hide-details v-model="header.visible" @change="changeMetadataVisible(header.value)" :label="header.text"></v-checkbox>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-item-group>
            </v-card-title>
            <v-card-subtitle>
                {{ $t("Files.CurrentPath") }}: {{  this.currentPath !== 'gcodes' ? "/"+this.currentPath.substring(7) : "/" }}<br />
                <div v-if="this.disk_usage !== null">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <span v-bind="attrs" v-on="on">{{ $t('Files.FreeDisk') }}: {{ formatFilesize(disk_usage.free) }}</span>
                        </template>
                        <span>
                            {{ $t('Files.Used') }}: {{ formatFilesize(this.disk_usage.used) }}<br />
                            {{ $t('Files.Free') }}: {{ formatFilesize(this.disk_usage.free) }}<br />
                            {{ $t('Files.Total') }}: {{ formatFilesize(this.disk_usage.total) }}
                        </span>
                    </v-tooltip>
                </div>
            </v-card-subtitle>
            <v-card-text>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  :label="$t('Files.Search')"
                  single-line
                  hide-details
                ></v-text-field>
            </v-card-text>
            <v-data-table
                :items="files"
                class="files-table"
                :headers="filteredHeaders"
                :options="options"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Files.Files'),
                    itemsPerPageAllText: $t('Files.AllFiles'),
                    itemsPerPageOptions: [10,25,50,100,-1]
                }"
                item-key="name"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                @pagination="refreshMetadata">

                <template slot="items">
                    <td v-for="header in filteredHeaders" v-bind:key="header.value">{{ header.text }}</td>
                </template>

                <template #no-data>
                    <div class="text-center">{{ $t('Files.Empty') }}</div>
                </template>

                <template slot="body.prepend" v-if="(currentPath !== 'gcodes')">
                    <tr
                        class="file-list-cursor"
                        @click="clickRowGoBack"
                        @dragover="dragOverFilelist($event, {isDirectory: true, filename: '..'})" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, {isDirectory: true, filename: '..'})"
                        >
                        <td class="pr-0 text-center" style="width: 32px;"><v-icon>mdi-folder-upload</v-icon></td>
                        <td class=" " colspan="8">..</td>
                    </tr>
                </template>

                <template #item="{ item }">
                    <tr
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor user-select-none"
                        draggable="true"
                        @drag="dragFile($event, item)"
                        @dragend="dragendFile($event)"
                        @dragover="dragOverFilelist($event, item)" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, item)"
                        :data-name="item.filename"
                        >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <template v-if="item.isDirectory">
                                <v-icon>mdi-folder</v-icon>
                            </template>
                            <template v-else>
                                <template v-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                                    <v-tooltip v-if="!item.isDirectory && getSmallThumbnail(item) && getBigThumbnail(item)" top>
                                        <template v-slot:activator="{ on, attrs }">
                                            <vue-load-image>
                                                <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" v-bind="attrs" v-on="on" />
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
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-center">
                            <v-tooltip top  v-if="getJobStatus(item)">
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <v-icon small :color="getStatusColor(getJobStatus(item))">{{ getStatusIcon(getJobStatus(item)) }}</v-icon>
                                    </span>
                                </template>
                                <span>{{ getJobStatus(item).replaceAll("_", " ") }}</span>
                            </v-tooltip>
                        </td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'size').visible">{{ item.isDirectory ? '--' : formatFilesize(item.size) }}</td>
                        <td class="text-right" v-if="headers.find(header => header.value === 'modified').visible">{{ formatDate(item.modified) }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'object_height').visible">{{ item.object_height ? item.object_height.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'layer_height').visible">{{ item.layer_height ? item.layer_height.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'filament_total').visible">{{ item.filament_total ? item.filament_total.toFixed()+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'estimated_time').visible">{{ formatPrintTime(item.estimated_time) }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.find(header => header.value === 'slicer').visible">{{ item.slicer ? item.slicer : '--' }}<br /><small v-if="item.slicer_version">{{ item.slicer_version}}</small></td>
                    </tr>
                </template>
            </v-data-table>
            <div class="dragzone" :style="'visibility: '+dropzone.visibility+'; opacity: '+dropzone.hidden">
                <div class="textnode">{{ $t('Files.DropFilesToAddGcode')}}</div>
            </div>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item, true)" :disabled="is_printing" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-play</v-icon> {{ $t('Files.PrintStart')}}
                </v-list-item>
                <v-list-item
                    @click="preheat"
                    v-if="
                        'first_layer_extr_temp' in contextMenu.item &&
                        contextMenu.item.first_layer_extr_temp > 0 &&
                        'first_layer_bed_temp' in contextMenu.item &&
                        contextMenu.item.first_layer_bed_temp > 0
                    "
                    :disabled="['error', 'printing', 'paused'].includes(printer_state)"
                    >
                    <v-icon class="mr-1">mdi-fire</v-icon> {{ $t('Files.Preheat')}}
                </v-list-item>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> {{ $t('Files.Download')}}
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Files.Rename')}}
                </v-list-item>
                <v-list-item @click="editFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-pencil</v-icon> {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Files.Rename')}}
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Files.Delete')}}
                </v-list-item>
                <v-list-item @click="deleteDirectoryAction" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Files.Delete')}}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogPrintFile.show" :max-width="getThumbnailWidth(dialogPrintFile.item)">
            <v-card>
                <v-img
                    contain
                    v-if="getBigThumbnail(dialogPrintFile.item)"
                    :src="getBigThumbnail(dialogPrintFile.item)"
                ></v-img>
                <v-card-title class="headline">{{ $t('Files.StartJob') }}</v-card-title>
                <v-card-text>{{ $t('Files.DoYouWantToStart') + dialogPrintFile.item.filename }}?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="dialogPrintFile.show = false">{{ $t('Files.No')}}</v-btn>
                    <v-btn color="green darken-1" text @click="startPrint(dialogPrintFile.item.filename)">{{$t('Files.Yes')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Files.NewDirectory') }}</v-card-title>
                <v-card-text>
                   {{ $t('Files.PleaseEnterANewDirectoryName') }}
                    <v-text-field label="Name" :rules="input_rules" @keypress.enter="createDirectoryAction" required v-model="dialogCreateDirectory.name"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">{{ $t('Files.Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Files.RenameFile')}}</v-card-title>
                <v-card-text>
                    <v-text-field :label="$t('Files.Name')" required v-model="dialogRenameFile.newName" ref="inputFieldNewName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Files.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Files.RenameDirectory') }}</v-card-title>
                <v-card-text>
                    <v-text-field label="Name" required v-model="dialogRenameDirectory.newName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">{{ $t('Files.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar
            :timeout="-1"
            :value="true"
            fixed
            centered
            bottom
            dark
            v-model="editor.showLoader"
        >
          <div>
            Downloading<br />
            <strong>{{ editor.item.filename }}</strong>
          </div>
          <span v-if="editor.progress.total > 1" class="mr-1">({{ formatFilesize(editor.progress.loaded) }}/{{ formatFilesize(editor.progress.total) }})</span>
          {{ Math.round(100 * editor.progress.loaded / editor.progress.total) }} % @ {{ editor.progress.speed }}/s<br />
          <v-progress-linear class="mt-2" :value="100 * editor.progress.loaded / editor.progress.total"></v-progress-linear>
          <template v-slot:action="{ attrs }">
            <v-btn
                color="red"
                text
                v-bind="attrs"
                @click="cancelDownload(); editor.showLoader = false"
                style="min-width: auto;"
            >
              <v-icon class="0">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
        <v-dialog v-model="editor.show" fullscreen :transition="null" @close="closeEditor()">
            <v-card class="fill-height">
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="closeEditor()">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ editor.item.filename }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-menu
                            transition="slide-y-transition"
                            :close-on-content-click="false"
                            offset-y
                            bottom
                            left
                        >
                            <template #activator="{ on, attrs }">
                                <v-btn
                                    dark
                                    icon
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>mdi-cog</v-icon>
                                </v-btn>
                            </template>
                            <v-list dense>
                                <v-list-item class="minheight30">
                                    <v-checkbox v-model="editorMinimap" :label="$t('Editor.Minimap')"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-btn dark text @click="saveFile">
                            <v-icon small class="mr-1">mdi-content-save</v-icon>
                            <span class="d-none d-sm-inline">{{ $t('Files.SaveClose') }}</span>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <div v-if="editor.init" id="editor" class="mainsail-editor"></div>
            </v-card>
        </v-dialog>
        <v-snackbar
            :timeout="-1"
            :value="true"
            fixed
            right
            bottom
            dark
            v-model="uploadSnackbar.status"
        >
            <span v-if="uploadSnackbar.max > 1" class="mr-1">({{ uploadSnackbar.number }}/{{ uploadSnackbar.max }})</span><strong>{{ $t("Files.Uploading") + uploadSnackbar.filename }}</strong><br />
            {{ Math.round(uploadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(uploadSnackbar.speed)) }}/s<br />
            <v-progress-linear class="mt-2" :value="uploadSnackbar.percent"></v-progress-linear>
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="red"
                    text
                    v-bind="attrs"
                    @click="cancelUpload"
                    style="min-width: auto;"
                >
                    <v-icon class="0">mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import axios from 'axios'
    import { findDirectory } from "@/plugins/helpers"
    import { validGcodeExtensions } from "@/store/variables"
    import VueLoadImage from "vue-load-image"

    import * as monaco from "monaco-editor";

    export default {
        name: "files",
        components: {
            'vue-load-image': VueLoadImage
        },
        data () {
            return {
                search: '',
                sortBy: 'modified',
                sortDesc: true,
                selected: [],
                hideHeaderColums: [],
                dialogPrintFile: {
                    show: false,
                    item: {}
                },
                dialogCreateDirectory: {
                    show: false,
                    name: ""
                },
                dialogRenameFile: {
                    show: false,
                    newName: "",
                    item: {}
                },
                dialogRenameDirectory: {
                    show: false,
                    newName: "",
                    item: {}
                },
                editor: {
                    show: false,
                    showLoader: false,
                    token: null,
                    init: false,
                    progress: {
                        total: 0,
                        loaded: 0,
                        speed: "",
                        lastTimestamp: 0
                    },
                    options: {
                        language: 'gcode',
                        readOnly: false,
                        theme: 'dark-converted',
                        contextmenu: false,
                        automaticLayout: true,
                    },
                    item: {
                        filename: "",
                    },
                    sourcecode: "",
                    monaco: null
                },
                headers: [
                    { text: '',                             value: '',                align: 'left',  configable: false,  visible: true, filterable: false },
                    { text: this.$t('Files.Name'),          value: 'filename',        align: 'left',  configable: false,  visible: true },
                    { text: '',                             value: 'status',          align: 'left',  configable: false,  visible: true },
                    { text: this.$t('Files.Filesize'),      value: 'size',            align: 'right', configable: true,   visible: true },
                    { text: this.$t('Files.LastModified'),  value: 'modified',        align: 'right', configable: true,   visible: true },
                    { text: this.$t('Files.ObjectHeight'),  value: 'object_height',   align: 'right', configable: true,   visible: true },
                    { text: this.$t('Files.LayerHeight'),   value: 'layer_height',    align: 'right', configable: true,   visible: true },
                    { text: this.$t('Files.FilamentUsage'), value: 'filament_total',  align: 'right', configable: true,   visible: true },
                    { text: this.$t('Files.PrintTime'),     value: 'estimated_time',  align: 'right', configable: true,   visible: true },
                    { text: this.$t('Files.Slicer'),        value: 'slicer',          align: 'right', configable: true,   visible: true },
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
                dropzone: {
                    visibility: 'hidden',
                    opacity: 0,
                },
                files: [],
                currentPath: 'gcodes',
                draggingFile: {
                    status: false,
                    item: {}
                },
                input_rules: [
                    value => value.indexOf(" ") === -1 || 'Name contain spaces!'
                ],
                uploadSnackbar: {
                    status: false,
                    filename: "",
                    percent: 0,
                    speed: 0,
                    total: 0,
                    number: 0,
                    max: 0,
                    cancelTokenSource: "",
                    lastProgress: {
                        time: 0,
                        loaded: 0
                    }
                },
                validGcodeExtensions: validGcodeExtensions
            }
        },
        computed: {
            ...mapState({
                filetree: state => state.files.filetree,
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
                loadings: state => state.socket.loadings,
                printer_state: state => state.printer.print_stats.state,

                displayMetadata: state => state.gui.gcodefiles.showMetadata,
            }),
            ...mapGetters( {
                is_printing: "is_printing",
                getStatusIcon: "server/history/getPrintStatusChipIcon",
                getStatusColor: "server/history/getPrintStatusChipColor",
            }),
            configHeaders() {
                return this.headers.filter(header => header.configable === true)
            },
            filteredHeaders() {
                return this.headers.filter(header => header.visible === true)
            },
            editorMinimap: {
                get() {
                    return this.$store.state.gui.editor.minimap;
                },
                set(val) {
                    return this.$store.dispatch("gui/setSettings", { editor: { minimap: val } })
                }
            },
            editorOptions() {
              return {
                  ...this.editor.options,
                  minimap: {
                      enabled: this.editorMinimap
                  }
              };
            },
            showHiddenFiles: {
                get: function() {
                    return this.$store.state.gui.gcodefiles.showHiddenFiles
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { gcodefiles: { showHiddenFiles: newVal } })
                }
            },
            showPrintedFiles: {
                get: function() {
                    return this.$store.state.gui.gcodefiles.showPrintedFiles
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { gcodefiles: { showPrintedFiles: newVal } })
                }
            },
            countPerPage: {
                get: function() {
                    return this.$store.state.gui.gcodefiles.countPerPage
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { gcodefiles: { countPerPage: newVal } })
                }
            },
            hideMetadataColums: {
                get: function() {
                    return this.$store.state.gui.gcodefiles.hideMetadataColums
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { gcodefiles: { hideMetadataColums: newVal } })
                }
            },
            disk_usage: {
                get: function() {
                    return this.$store.getters["files/getDiskUsage"](this.currentPath)
                }
            },
            basicUrl: {
                get: function() {
                    return this.$store.getters["socket/getUrl"]
                }
            }
        },
        created() {
            this.loadPath()
        },
        mounted() {
            this.hideMetadataColums.forEach((key) => {
                let headerElement = this.headers.find(element => element.value === key)
                if (headerElement) headerElement.visible = false
            });
        },
        methods: {
            /**
             *
             * @param {monaco} editor
             */
            /*injectLanguage(editor) {
                if (!editor.languages.getLanguages().find(l => l.id === 'gcode')) {
                    inject(editor);
                }
            },
            async editorWillMount(monaco) {
              if (!monaco.languages?.getLanguages().find(l => l.id === 'gcode')) {
                await liftOff(monaco);
              }
            },*/
            closeEditor() {
                this.editor.show = false;
                this.editor.init = false;
                this.editor.monaco = null;
                this.editor.sourcecode = "";
                this.editor.file = null;
            },
            async uploadFile() {
                if (this.$refs.fileUpload.files.length) {
                    this.$store.commit('socket/addLoading', { name: 'gcodeUpload' })
                    let successFiles = []
                    this.uploadSnackbar.number = 0
                    this.uploadSnackbar.max = this.$refs.fileUpload.files.length
                    for (const file of this.$refs.fileUpload.files) {
                        this.uploadSnackbar.number++
                        const result = await this.doUploadFile(file)
                        successFiles.push(result)
                    }

                    this.$store.commit('socket/removeLoading', { name: 'gcodeUpload' })
                    for(const file of successFiles) {
                        this.$toast.success("Upload of "+file+" successful!")
                    }

                    this.$refs.fileUpload.value = ''
                }
            },
            doUploadFile: function(file) {
                let toast = this.$toast
                let formData = new FormData()
                let filename = file.name.replace(" ", "_")

                this.uploadSnackbar.filename = filename
                this.uploadSnackbar.status = true
                this.uploadSnackbar.percent = 0
                this.uploadSnackbar.speed = 0
                this.uploadSnackbar.lastProgress.loaded = 0
                this.uploadSnackbar.lastProgress.time = 0

                formData.append('file', file, (this.currentPath+"/"+filename).substring(7))

                return new Promise(resolve => {
                    this.uploadSnackbar.cancelTokenSource = axios.CancelToken.source();
                    axios.post('//' + this.hostname + ':' + this.port + '/server/files/upload',
                        formData, {
                            cancelToken: this.uploadSnackbar.cancelTokenSource.token,
                            headers: { 'Content-Type': 'multipart/form-data' },
                            onUploadProgress: (progressEvent) => {
                                this.uploadSnackbar.percent = (progressEvent.loaded * 100) / progressEvent.total
                                if (this.uploadSnackbar.lastProgress.time) {
                                    const time = progressEvent.timeStamp - this.uploadSnackbar.lastProgress.time
                                    const data = progressEvent.loaded - this.uploadSnackbar.lastProgress.loaded

                                    if (time) this.uploadSnackbar.speed = data / (time / 1000)
                                }

                                this.uploadSnackbar.lastProgress.time = progressEvent.timeStamp
                                this.uploadSnackbar.lastProgress.loaded = progressEvent.loaded
                                this.uploadSnackbar.total = progressEvent.total
                            }
                        }
                    ).then((result) => {
                        this.uploadSnackbar.status = false
                        resolve(result.data.result)
                    }).catch(() => {
                        this.uploadSnackbar.status = false
                        this.$store.commit('socket/removeLoading', { name: 'gcodeUpload' })
                        toast.error("Cannot upload the file!")
                    })
                })
            },
            clickUploadButton: function() {
                this.$refs.fileUpload.click()
            },
            cancelUpload: function() {
                this.uploadSnackbar.cancelTokenSource.cancel()
                this.uploadSnackbar.status = false
            },
            refreshFileList: function() {
                this.$socket.sendObj('server.files.get_directory', { path: this.currentPath }, 'files/getDirectory')
            },
            formatDate(date) {
                let tmp2 = new Date(date)

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
            preheat() {
                if (
                    'first_layer_extr_temp' in this.contextMenu.item &&
                    'first_layer_bed_temp' in this.contextMenu.item &&
                    !['error', 'printing', 'paused'].includes(this.printer_state)
                ) {
                    let gcode = ""
                    if (this.contextMenu.item.first_layer_extr_temp > 0) {
                        gcode = "M104 S"+this.contextMenu.item.first_layer_extr_temp
                        this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
                      this.$socket.sendObj('printer.gcode.script', { script: gcode })
                    }

                    if (this.contextMenu.item.first_layer_bed_temp > 0) {
                        gcode = "M140 S"+this.contextMenu.item.first_layer_bed_temp
                        this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
                      this.$socket.sendObj('printer.gcode.script', { script: gcode })
                    }
                }
            },
            downloadFile() {
                let filename = (this.currentPath+"/"+this.contextMenu.item.filename);
                let link = document.createElement("a");
                link.download = name;
                link.href = '//' + this.hostname + ':' + this.port + '/server/files/' + encodeURI(filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            cancelDownload() {
              if (this.editor.token) {
                  this.editor.token.cancel();
              }
            },/*
            getLoadedString() {
                const units = [' B', ' kB', ' MB', ' GB'];
                let unitSelectTotal = 0;
                let unitSelectLoaded = 0;
                let total = this.editor.progress.total;
                while (total > 1024) {
                    if (unitSelectTotal + 1 >= units.length) {
                        break;
                    }
                    total /= 1024;
                    ++unitSelectTotal;
                }

                let loaded = this.editor.progress.loaded;
                while (loaded > 1000) {
                    if (unitSelectLoaded + 1 >= units.length) {
                        break;
                    }
                    loaded /= 1000;
                    ++unitSelectLoaded;
                }

                return `${loaded.toFixed(2)}${units[unitSelectLoaded]} / ${total.toFixed(2)}${units[unitSelectTotal]}`;
            },*/
            editFile(item) {
                this.editor.showLoader = true;
                this.editor.sourcecode = "";
                this.editor.item = item;
                this.editor.init = false;
                let filename = (this.currentPath+"/"+item.filename);
                let url = '//' + this.hostname + ':' + this.port + '/server/files/' + encodeURI(filename) + `?${Date.now()}`;
                if (this.editor.token) {
                    this.editor.token.cancel();
                }
                this.editor.progress.total = item.size;
                this.editor.token = axios.CancelToken.source();
                axios.get(url, {
                    cancelToken: this.editor.token.token,
                    onDownloadProgress: progressEvent => {
                        const diffData = progressEvent.loaded - this.editor.progress.loaded;
                        const diffTime = progressEvent.timeStamp - this.editor.progress.lastTimestamp;
                        let speed = (diffData / diffTime);
                        const unit = ['kB', 'MB', 'GB'];
                        let unitSelect = 0;
                        while (speed > 1024) {
                            speed /= 1024.0;
                            unitSelect = Math.min(2, unitSelect + 1);
                        }
                        this.editor.progress.speed = speed.toFixed(2) + unit[unitSelect];

                        this.editor.progress.loaded = progressEvent.loaded;
                        this.editor.progress.lastTimestamp = progressEvent.timeStamp;
                    }
                })  .then(res => res.data)
                    .then(file => {
                        this.editor.sourcecode = file;
                        this.editor.show = true;
                        this.editor.init = true;
                        this.editor.showLoader = false;
                        this.editor.options.readOnly = false;
                    })
                    .finally(() => {
                        setTimeout(() => {
                            this.editor.token = null;
                            this.editor.progress.total = 0;
                            this.editor.progress.loaded = 0;
                            this.editor.progress.lastTimestamp = 0;
                            this.editor.progress.speed = "";
                        }, 100);
                    });
            },
            async saveFile() {
                let file = new File([this.editor.sourcecode], encodeURI(this.editor.item.filename));

                await this.doUploadFile(file);

                this.editor.show = false;
                this.editor.init = false;
                this.editor.monaco = null;
                this.editor.sourcecode = "";
                this.editor.file = null;
            },
            renameFile(item) {
                this.dialogRenameFile.item = item;
                this.dialogRenameFile.newName = item.filename;
                this.dialogRenameFile.show = true;
            },
            renameFileAction() {
                this.dialogRenameFile.show = false;
                this.$socket.sendObj('server.files.move', {
                    source: this.currentPath+"/"+this.dialogRenameFile.item.filename,
                    dest: this.currentPath+"/"+this.dialogRenameFile.newName
                }, 'files/getMove');
            },
            renameDirectory(item) {
                this.dialogRenameDirectory.item = item;
                this.dialogRenameDirectory.newName = item.filename;
                this.dialogRenameDirectory.show = true;
            },
            renameDirectoryAction() {
                this.dialogRenameDirectory.show = false;
                this.$socket.sendObj('server.files.move', {
                    source: this.currentPath+"/"+this.dialogRenameDirectory.item.filename,
                    dest: this.currentPath+"/"+this.dialogRenameDirectory.newName
                }, 'files/getMove');
            },
            removeFile() {
                this.$socket.sendObj('server.files.delete_file', { path: this.currentPath+"/"+this.contextMenu.item.filename }, 'files/getDeleteFile');
            },
            createDirectory: function() {
                this.dialogCreateDirectory.name = "";
                this.dialogCreateDirectory.show = true;
            },
            createDirectoryAction: function() {
                if (this.dialogCreateDirectory.name.length && this.dialogCreateDirectory.name.indexOf(" ") === -1) {
                    this.dialogCreateDirectory.show = false;
                    this.$socket.sendObj('server.files.post_directory', { path: this.currentPath+"/"+this.dialogCreateDirectory.name }, 'files/getCreateDir');
                }
            },
            deleteDirectoryAction: function() {
                this.$socket.sendObj('server.files.delete_directory', { path: this.currentPath+"/"+this.contextMenu.item.filename }, 'files/getDeleteDir');
            },
            clickRow(item, force = false) {
                if (!this.contextMenu.shown || force) {
                    if (force) {
                        this.contextMenu.shown = false;
                    }
                    if (!item.isDirectory) {
                        this.dialogPrintFile.show = true;
                        this.dialogPrintFile.item = item;
                    } else {
                        this.currentPath += "/" + item.filename;
                        this.loadPath();
                    }
                }
            },
            clickRowGoBack: function() {
                this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf("/"));
            },
            loadPath: function() {
                this.$socket.sendObj('server.files.get_directory', { path: this.currentPath }, 'files/getDirectory');
                let dirArray = this.currentPath.split("/");
                this.files = findDirectory(this.filetree, dirArray);
                if (!this.showHiddenFiles) {
                    this.files = this.files.filter(file => file.filename !== "thumbs" && file.filename.substr(0, 1) !== ".");
                }
                if (!this.showPrintedFiles) {
                    this.files = this.files.filter(file => this.$store.getters["server/history/getPrintStatus"]({
                        filename: (this.currentPath+"/"+file.filename).substr(7),
                        modified: new Date(file.modified).getTime()
                    }) !== 'completed')
                }
            },
            startPrint(filename = "") {
                filename = (this.currentPath+"/"+filename).substring(7)
                this.dialogPrintFile.show = false
                this.$socket.sendObj('printer.print.start', { filename: filename }, 'switchToDashboard');
            },
            dragOverUpload(e) {
                if (!this.draggingFile.status) {
                    e.preventDefault();
                    e.stopPropagation();

                    this.dropzone.visibility = 'visible';
                    this.dropzone.opacity = 1;
                }
            },
            dragLeaveUpload(e) {
                if (!this.draggingFile.status) {
                    e.preventDefault();
                    e.stopPropagation();

                    this.dropzone.visibility = 'hidden';
                    this.dropzone.opacity = 0;
                }
            },
            async dragDropUpload(e) {
                if (!this.draggingFile.status) {
                    e.preventDefault();

                    this.dropzone.visibility = 'hidden';
                    this.dropzone.opacity = 0;

                    if (e.dataTransfer.files.length) {
                        await this.doUploadFile(e.dataTransfer.files[0]);
                    }
                }
            },
            dragFile(e, item) {
                e.preventDefault();
                this.draggingFile.status = true;
                this.draggingFile.item = item;
            },
            dragendFile(e) {
                e.preventDefault();
                this.draggingFile.status = false;
                this.draggingFile.item = { };
            },
            dragOverFilelist(e, row) {
                if (this.draggingFile.status) {
                    e.preventDefault();
                    //e.stopPropagation();

                    if (row.isDirectory) {
                        e.target.parentElement.style.backgroundColor = '#43A04720';
                    }
                }
            },
            dragLeaveFilelist(e) {
                if (this.draggingFile.status) {
                    e.preventDefault();
                    e.stopPropagation();

                    e.target.parentElement.style.backgroundColor = 'transparent';
                }
            },
            async dragDropFilelist(e, row) {
                if (this.draggingFile.status) {
                    e.preventDefault();
                    e.target.parentElement.style.backgroundColor = 'transparent';

                    let dest = "";
                    if (row.filename === '..') {
                      dest = this.currentPath.substring(0, this.currentPath.lastIndexOf("/") + 1)+this.draggingFile.item.filename;
                    } else dest = this.currentPath+"/"+row.filename+"/"+this.draggingFile.item.filename;

                    this.$socket.sendObj('server.files.move', {
                        source: this.currentPath+"/"+this.draggingFile.item.filename,
                        dest: dest
                    }, 'files/getMove');
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
                    if (sortDesc) items.reverse();

                    // Then make sure directories come first
                    items.sort((a, b) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? -1 : 1));
                }
                return items;
            },
            refreshMetadata: function(data) {
                let items = this.sortFiles(this.files, [this.sortBy], [this.sortDesc]);
                for (let i = data.pageStart; i < data.pageStop; i++) {
                    if (items[i] && !items[i].isDirectory && !items[i].metadataPulled) {
                        let filename = (this.currentPath+"/"+items[i].filename).substring(7);
                        this.$socket.sendObj("server.files.metadata", { filename: filename }, "files/getMetadata");
                    }
                }

            },
            advancedSearch: function(value, search) {
                return value != null &&
                    search != null &&
                    typeof value === 'string' &&
                    value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
            },
            changeMetadataVisible: function(name) {
                if (this.headers.filter(header => header.value === name).length) {
                    let value = this.headers.filter(header => header.value === name)[0].visible;

                    this.$store.dispatch("gui/setGcodefilesMetadata", {name: name, value: value});
                }
            },
            getSmallThumbnail(item) {
                if (
                    'thumbnails' in item &&
                    item.thumbnails !== undefined &&
                    item.thumbnails.length
                ) {
                    const thumbnail = item.thumbnails.find(thumb =>
                        thumb.width >= 32 && thumb.width <= 64 &&
                        thumb.height >= 32 && thumb.height <= 64
                    )

                    if (thumbnail && 'relative_path' in thumbnail) return this.basicUrl+"/server/files/"+this.currentPath+"/"+thumbnail.relative_path
                }

                return ""
            },
            getBigThumbnail(item) {
                if (
                    'thumbnails' in item &&
                    item.thumbnails !== undefined &&
                    item.thumbnails.length) {
                    const thumbnail = item.thumbnails.find(thumb => thumb.width >= 300 && thumb.width <= 400)

                    if (thumbnail && 'relative_path' in thumbnail) return this.basicUrl+"/server/files/"+this.currentPath+"/"+thumbnail.relative_path
                }

                return ""
            },
            getThumbnailWidth(item) {
                if (this.getBigThumbnail(item)) {
                    const thumbnail = item.thumbnails.find(thumb => thumb.width >= 300 && thumb.width <= 400)

                    if (thumbnail) return thumbnail.width
                }

                return 400
            },
            getJobStatus(item) {
                return this.$store.getters["server/history/getPrintStatus"]({
                    filename: (this.currentPath+"/"+item.filename).substr(7),
                    modified: new Date(item.modified).getTime()
                })
            },
        },
        watch: {
            'editor.init'(val) {
                if (val) {
                    setTimeout(() => {
                        this.editor.monaco = monaco.editor.create(document.getElementById('editor'), {
                            ...(this.editorOptions || this.editor.options),
                            value: this.editor.sourcecode
                        });
                        this.editor.monaco.onDidChangeModelContent(() => {
                            this.editor.sourcecode = this.editor.monaco.getModel().getValue();
                        });
                    }, 10);
                }
            },
            editorOptions: {
              deep: true,
              handler(val) {
                this.editor.monaco?.updateOptions(val);
              }
            },
            filetree: {
                deep: true,
                handler(newVal) {
                    let dirArray = this.currentPath.split("/");
                    this.files = findDirectory(newVal, dirArray);

                    if (!this.showHiddenFiles) {
                        this.files = this.files.filter(file => file.filename !== "thumbs" && file.filename.substr(0, 1) !== ".");
                    }

                    if (!this.showPrintedFiles) {
                        this.files = this.files.filter(file => this.$store.getters["server/history/getPrintStatus"]({
                            filename: (this.currentPath+"/"+file.filename).substr(7),
                            modified: new Date(file.modified).getTime()
                        }) !== 'completed')
                    }
                }
            },
            currentPath: {
                handler(newVal) {
                    let dirArray = newVal.split("/");
                    this.files = findDirectory(this.filetree, dirArray);

                    if (!this.showHiddenFiles) {
                        this.files = this.files.filter(file => file.filename !== "thumbs" && file.filename.substr(0, 1) !== ".");
                    }

                    if (!this.showPrintedFiles) {
                        this.files = this.files.filter(file => this.$store.getters["server/history/getPrintStatus"]({
                            filename: (this.currentPath+"/"+file.filename).substr(7),
                            modified: new Date(file.modified).getTime()
                        }) !== 'completed')
                    }
                }
            },
            displayMetadata: {
                deep: true,
                handler(newVal) {
                    if (newVal !== undefined && typeof(newVal) === 'object') {
                        Object.entries(newVal).forEach(value => {
                            if (this.headers.filter(header => header.value === value[0]).length) {
                                this.headers.filter(header => header.value === value[0])[0].visible = value[1];
                            }
                        })
                    }
                }
            },
            showHiddenFiles: function() {
                this.loadPath();
            },
            showPrintedFiles: function() {
                this.loadPath();
            },
            hideMetadataColums: function(newVal) {
                newVal.forEach((key) => {
                    let headerElement = this.headers.find(element => element.value === key)
                    if (headerElement) headerElement.visible = false
                })
            }
        }
    }
</script>
