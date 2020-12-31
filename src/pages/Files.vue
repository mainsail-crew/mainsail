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
                G-Code Files
                <v-spacer class="d-none d-sm-block"></v-spacer>
                <input type="file" ref="fileUpload" accept=".gcode" style="display: none" multiple @change="uploadFile" />
                <v-item-group class="v-btn-toggle my-5 my-sm-0 col-12 col-sm-auto px-0 py-0" name="controllers">
                    <v-btn @click="clickUploadButton" title="Upload new Gcode" class="primary flex-grow-1" :loading="loadings.includes('gcodeUpload')"><v-icon>mdi-upload</v-icon></v-btn>
                    <v-btn @click="createDirectory" title="Create new Directory" class="flex-grow-1"><v-icon>mdi-folder-plus</v-icon></v-btn>
                    <v-btn @click="refreshFileList" title="Refresh current Directory" class="flex-grow-1"><v-icon>mdi-refresh</v-icon></v-btn>
                    <v-menu :offset-y="true" :close-on-content-click="false" title="Setup current list">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="flex-grow-1" v-bind="attrs" v-on="on"><v-icon class="">mdi-cog</v-icon></v-btn>
                        </template>
                        <v-list>
                            <v-list-item class="minHeight36">
                                <v-checkbox class="mt-0" hide-details v-model="showHiddenFiles" label="Hidden files"></v-checkbox>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item class="minHeight36" v-for="header of configHeaders" v-bind:key="header.key">
                                <v-checkbox class="mt-0" hide-details v-model="header.visible" @change="changeMetadataVisible(header.value)" :label="header.text"></v-checkbox>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-item-group>
            </v-card-title>
            <v-card-subtitle>Current path: {{ this.currentPath !== 'gcodes' ? "/"+this.currentPath.substring(7) : "/" }}</v-card-subtitle>
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
                :items="files"
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
                mobile-breakpoint="0"
                @pagination="refreshMetadata">

                <template slot="items" slot-scope="props">
                  <td v-for="header in filteredHeaders" v-bind:key="header.text">{{ props.item[header.value] }}</td>
                </template>

                <template #no-data>
                    <div class="text-center">empty</div>
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
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor"
                        draggable="true"
                        @drag="dragFile($event, item)"
                        @dragend="dragendFile($event)"
                        @dragover="dragOverFilelist($event, item)" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, item)"
                        :data-name="item.filename"
                        >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <v-icon v-if="item.isDirectory">mdi-folder</v-icon>
                            <v-icon v-if="!item.isDirectory && !(item.thumbnails && item.thumbnails.length > 0)">mdi-file</v-icon>
                            <img v-if="!item.isDirectory && item.thumbnails && item.thumbnails.length > 0" :src="'data:image/gif;base64,'+(item.thumbnails.length ? item.thumbnails[0].data : '--')"  />
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.filter(header => header.value === 'size')[0].visible">{{ item.isDirectory ? '--' : formatFilesize(item.size) }}</td>
                        <td class="text-right" v-if="headers.filter(header => header.value === 'modified')[0].visible">{{ formatDate(item.modified) }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.filter(header => header.value === 'object_height')[0].visible">{{ item.object_height ? item.object_height.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.filter(header => header.value === 'layer_height')[0].visible">{{ item.layer_height ? item.layer_height.toFixed(2)+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.filter(header => header.value === 'filament_total')[0].visible">{{ item.filament_total ? item.filament_total.toFixed()+' mm' : '--' }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.filter(header => header.value === 'estimated_time')[0].visible">{{ formatPrintTime(item.estimated_time) }}</td>
                        <td class="text-no-wrap text-right" v-if="headers.filter(header => header.value === 'slicer')[0].visible">{{ item.slicer ? item.slicer : '--' }}<br /><small v-if="item.slicer_version">{{ item.slicer_version}}</small></td>
                    </tr>
                </template>
            </v-data-table>
            <div class="dragzone" :style="'visibility: '+dropzone.visibility+'; opacity: '+dropzone.hidden">
                <div class="textnode">Drop files to add gcode.</div>
            </div>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item)" :disabled="is_printing" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-play</v-icon> Print start
                </v-list-item>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> Download
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> Rename
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> Rename
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
                <v-list-item @click="deleteDirectoryAction" v-if="contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogPrintFile.show" max-width="400">
            <v-card>
                <v-img
                    contain
                    v-if="dialogPrintFile.item.thumbnails && dialogPrintFile.item.thumbnails.find(element => element.width === 300 || element.width === 400)"
                    :src="'data:image/gif;base64,'+(dialogPrintFile.item.thumbnails ? dialogPrintFile.item.thumbnails.find(element => element.width === 300 || element.width === 400).data : '')"
                    :height="(dialogPrintFile.item.thumbnails ? dialogPrintFile.item.thumbnails.find(element => element.width === 400 || element.width === 300).height : '')+'px'"
                ></v-img>
                <v-card-title class="headline">Start Job</v-card-title>
                <v-card-text>Do you want to start {{ dialogPrintFile.item.filename }}?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="dialogPrintFile.show = false">No</v-btn>
                    <v-btn color="green darken-1" text @click="startPrint(dialogPrintFile.item.filename)">Yes</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">New Directory</v-card-title>
                <v-card-text>
                    Please enter a new directory name:
                    <v-text-field label="Name" :rules="input_rules" @keypress.enter="createDirectoryAction" required v-model="dialogCreateDirectory.name"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Rename File</v-card-title>
                <v-card-text>
                    <v-text-field label="Name" required v-model="dialogRenameFile.newName" ref="inputFieldNewName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">rename</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Rename Directory</v-card-title>
                <v-card-text>
                    <v-text-field label="Name" required v-model="dialogRenameDirectory.newName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">rename</v-btn>
                </v-card-actions>
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
            <span v-if="uploadSnackbar.max > 1" class="mr-1">({{ uploadSnackbar.number }}/{{ uploadSnackbar.max }})</span><strong>Uploading {{ uploadSnackbar.filename }}</strong><br />
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

    export default {
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
                headers: [
                    { text: '',               value: '',                align: 'left',  configable: false,  visible: true, filterable: false },
                    { text: 'Name',           value: 'filename',        align: 'left',  configable: false,  visible: true },
                    { text: 'Filesize',       value: 'size',            align: 'right', configable: true,   visible: true },
                    { text: 'Last modified',  value: 'modified',        align: 'right', configable: true,   visible: true },
                    { text: 'Object Height',  value: 'object_height',   align: 'right', configable: true,   visible: true },
                    { text: 'Layer Height',   value: 'layer_height',    align: 'right', configable: true,   visible: true },
                    { text: 'Filament Usage', value: 'filament_total',  align: 'right', configable: true,   visible: true },
                    { text: 'Print Time',     value: 'estimated_time',  align: 'right', configable: true,   visible: true },
                    { text: 'Slicer',         value: 'slicer',          align: 'right', configable: true,   visible: true },
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
                }
            }
        },
        computed: {
            ...mapState({
                filetree: state => state.files.filetree,
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
                loadings: state => state.socket.loadings,

                displayMetadata: state => state.gui.gcodefiles.showMetadata,
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
            showHiddenFiles: {
                get: function() {
                    return this.$store.state.gui.gcodefiles.showHiddenFiles
                },
                set: function(newVal) {
                    return this.$store.dispatch("gui/setSettings", { gcodefiles: { showHiddenFiles: newVal } })
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
        },
        created() {
            this.loadPath()
        },
        mounted() {
            this.hideMetadataColums.forEach((key) => {
                let headerElement = this.headers.find(element => element.value === key)
                if (headerElement) headerElement.visible = false
            })
        },
        methods: {
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
                e.preventDefault()
                this.contextMenu.shown = true
                this.contextMenu.x = e.clientX
                this.contextMenu.y = e.clientY
                this.contextMenu.item = item
                this.$nextTick(() => { this.contextMenu.shown = true })
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
            clickRow: function(item) {
                if (!item.isDirectory) {
                    this.dialogPrintFile.show = true;
                    this.dialogPrintFile.item = item;
                } else {
                    this.currentPath += "/"+item.filename;
                    this.loadPath();
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
            },
            startPrint(filename = "") {
                filename = (this.currentPath+"/"+filename).substring(7);
                this.dialogPrintFile.show = false;
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

                    if (!this.is_printing && e.dataTransfer.files.length) {
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
        },
        watch: {
            filetree: {
                deep: true,
                handler(newVal) {
                    let dirArray = this.currentPath.split("/");
                    this.files = findDirectory(newVal, dirArray);

                    if (!this.showHiddenFiles) {
                        this.files = this.files.filter(file => file.filename !== "thumbs" && file.filename.substr(0, 1) !== ".");
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
            hideMetadataColums: function(newVal) {
                newVal.forEach((key) => {
                    let headerElement = this.headers.find(element => element.value === key)
                    if (headerElement) headerElement.visible = false
                })
            }
            /*headers: {
                deep: true,
                handler(newVal) {
                    window.console.log(newVal)
                    newVal.forEach((element) => {
                        if (element.visible && this.hideMetadataColums.includes(element.value)) this.hideMetadataColums.splice(this.hideMetadataColums.indexOf(element.value), 1)
                        else if (!element.visible && !this.hideMetadataColums.includes(element.value)) this.hideMetadataColums.push(element.value)
                    })
                }
            }*/
        }
    }
</script>
