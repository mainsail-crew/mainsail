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
</style>

<template>
    <div>
      <v-card class="fileupload-card" @dragover="dragOverUpload" @dragleave="dragLeaveUpload" @drop.prevent.stop="dragDropUpload">
        <v-card-title>
          G-Code Files
          <v-spacer></v-spacer>
          <v-btn :loading="loadingMakeDirectory" @click="createDirectory"><v-icon class="mr-1">mdi-folder-plus</v-icon> new Directory</v-btn>
          <v-btn color="primary ml-4" :loading="loadingGcodeRefresh" @click="refreshFileList"><v-icon class="mr-1">mdi-refresh</v-icon> Refresh</v-btn>
          <input type="file" ref="fileUpload" style="display: none" @change="uploadFile" />
          <v-btn color="primary ml-4 " :loading="loadingGcodeUpload" @click="clickUploadButton"><v-icon>mdi-upload</v-icon>Upload</v-btn>
        </v-card-title>
        <v-card-subtitle>
          Current path: {{ this.currentPath !== 'gcodes' ? "/"+this.currentPath.substring(7) : "/" }}
        </v-card-subtitle>
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
            :headers="headers"
            :options="options"
            :custom-sort="sortFiles"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :items-per-page="countPerPage"
            item-key="name"
            :search="search"
            :custom-filter="advancedSearch"
            @pagination="refreshMetadata">

          <template #no-data>
            <div class="text-center">empty</div>
          </template>

          <template v-slot:body.prepend>
            <tr
                v-if="(currentPath !== 'gcodes')"
                class="file-list-cursor"
                @click="clickRowGoBack"
                @dragover="dragOverFilelist($event, {isDirectory: true, filename: '..'})" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, {isDirectory: true, filename: '..'})"
            >
              <td class=" ">
                <v-icon>mdi-folder-upload</v-icon>
              </td>
              <td class=" " colspan="8">
                ..
              </td>
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
              <td class=" ">
                <v-icon v-if="item.isDirectory">mdi-folder</v-icon>
                <v-icon v-if="!item.isDirectory && !(item.thumbnails && item.thumbnails.length > 0)">mdi-file</v-icon>
                <img v-if="!item.isDirectory && item.thumbnails && item.thumbnails.length > 0" :src="'data:image/gif;base64,'+(item.thumbnails.length ? item.thumbnails[0].data : '--')"  />
              </td>
              <td class=" ">
                {{ item.filename }}
              </td>
              <td class="text-no-wrap text-right">
                {{ item.isDirectory ? '--' : formatFilesize(item.size) }}
              </td>
              <td class="text-right">
                {{ formatDate(item.modified) }}
              </td>
              <td class="text-no-wrap text-right">
                {{ item.object_height ? item.object_height.toFixed(2)+' mm' : '--' }}
              </td>
              <td class="text-no-wrap text-right">
                {{ item.layer_height ? item.layer_height.toFixed(2)+' mm' : '--' }}
              </td>
              <td class="text-no-wrap text-right">
                {{ item.filament_total ? item.filament_total.toFixed()+' mm' : '--' }}
              </td>
              <td class="text-no-wrap text-right">
                {{ formatPrintTime(item.estimated_time) }}
              </td>
              <td class="text-no-wrap text-right">
                {{ item.slicer ? item.slicer : '--' }}
              </td>
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
                    v-if="dialogPrintFile.item.thumbnails && dialogPrintFile.item.thumbnails.find(element => element.width === 400)"
                    :src="'data:image/gif;base64,'+(dialogPrintFile.item.thumbnails ? dialogPrintFile.item.thumbnails.find(element => element.width === 400).data : '')"
                    :height="(dialogPrintFile.item.thumbnails ? dialogPrintFile.item.thumbnails.find(element => element.width === 400).height : '')+'px'"
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
                    <v-text-field label="Name" required v-model="dialogRenameFile.newName"></v-text-field>
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
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import axios from 'axios';
    import { findDirectory } from "../plugins/helpers";
    /*import Vue from "vue";*/

    export default {
        data () {
            return {
                search: '',
                sortBy: 'modified',
                sortDesc: true,
                selected: [],
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
                    { text: '', value: '', },
                    { text: 'Name', value: 'filename', },
                    { text: 'Filesize', value: 'size', align: 'right', },
                    { text: 'Last modified', value: 'modified', align: 'right', },
                    { text: 'Object Height', value: 'object_height', align: 'right', },
                    { text: 'Layer Height', value: 'layer_height', align: 'right', },
                    { text: 'Filament Usage', value: 'filament_total', align: 'right', },
                    { text: 'Print Time', value: 'estimated_time', align: 'right', },
                    { text: 'Generated by', value: 'slicer', align: 'right', },
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
                loadingGcodeUpload: false,
                loadingGcodeRefresh: false,
                loadingMakeDirectory: false,
                draggingFile: {
                    status: false,
                    item: {}
                },
                input_rules: [
                    value => value.indexOf(" ") === -1 || 'Name contain spaces!'
                ]
            }
        },
        computed: {
            ...mapState({
                filetree: state => state.filetree,
                countPerPage: state => state.gui.gcodefiles.countPerPage,
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
                loadings: state => state.loadings,
            }),
            ...mapGetters([
                'is_printing'
            ])
        },
        created() {
            /*let dirArray = this.currentPath.split("/");
            this.files = findDirectory(this.filetree, dirArray);*/
            this.loadPath();
        },
        methods: {
            uploadFile: function() {
                if (this.$refs.fileUpload.files.length) {
                    this.doUploadFile(this.$refs.fileUpload.files[0]);
                }
            },
            doUploadFile: function(file) {
                let toast = this.$toast;
                let formData = new FormData();
                let filename = file.name.replace(" ", "_");

                formData.append('file', file, (this.currentPath+"/"+filename).substring(7));
                this.$store.commit('setLoading', { name: 'loadingGcodeUpload' });

                axios.post('http://' + this.hostname + ':' + this.port + '/server/files/upload',
                    formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                ).then((result) => {
                    this.$store.commit('removeLoading', { name: 'loadingGcodeUpload' });
                    toast.success("Upload of "+result.data.result+" successful!");
                })
                .catch(() => {
                    this.$store.commit('removeLoading', { name: 'loadingGcodeUpload' });
                    toast.error("Cannot upload the file!");
                });
            },
            clickUploadButton: function() {
                this.$refs.fileUpload.click();
            },
            refreshFileList: function() {
                this.$store.commit('setLoading', { name: 'loadingGcodeRefresh' });
                this.$socket.sendObj('server.files.get_directory', { path: this.currentPath }, 'getDirectory');
            },
            formatDate(date) {
                let tmp2 = new Date(date);

                return tmp2.toLocaleString().replace(',', '');
            },
            formatFilesize(fileSizeInBytes) {
                let i = -1;
                let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
                do {
                    fileSizeInBytes = fileSizeInBytes / 1024;
                    i++;
                } while (fileSizeInBytes > 1024);

                return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
            },
            formatPrintTime(totalSeconds) {
                if (totalSeconds) {
                    let output = "";

                    let days = Math.floor(totalSeconds / (3600 * 24));
                    if (days) {
                        totalSeconds %= (3600 * 24);
                        output += days+"d";
                    }

                    let hours = Math.floor(totalSeconds / 3600);
                    totalSeconds %= 3600;
                    if (hours) output += " "+hours+"h";

                    let minutes = Math.floor(totalSeconds / 60);
                    if (minutes) output += " "+minutes+"m";

                    let seconds = totalSeconds % 60;
                    if (seconds) output += " "+seconds.toFixed(0)+"s";

                    return output;
                }

                return '--';
            },
            showContextMenu (e, item) {
                e.preventDefault();
                this.contextMenu.shown = true;
                this.contextMenu.x = e.clientX;
                this.contextMenu.y = e.clientY;
                this.contextMenu.item = item;
                this.$nextTick(() => {
                    this.contextMenu.shown = true
                });
            },
            downloadFile() {
                let filename = (this.currentPath+"/"+this.contextMenu.item.filename);
                let link = document.createElement("a");
                link.download = name;
                link.href = 'http://' + this.hostname + ':' + this.port + '/server/files/' + filename;
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
                }, 'getPostFileMove');
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
                }, 'getPostFileMove');
            },
            removeFile() {
                let filename = (this.currentPath+"/"+this.contextMenu.item.filename);
                axios.delete(
                    'http://'+ this.hostname + ':' + this.port +'/server/files/'+filename
                ).then((result) => {
                    this.$toast.success(result.data.result+" successfully deleted.");
                }).catch(() => {
                    this.$toast.error("Error! Cannot delete file.");
                });
            },
            createDirectory: function() {
                this.dialogCreateDirectory.name = "";
                this.dialogCreateDirectory.show = true;
            },
            createDirectoryAction: function() {
                if (this.dialogCreateDirectory.name.length && this.dialogCreateDirectory.name.indexOf(" ") === -1) {
                    this.dialogCreateDirectory.show = false;
                    this.$socket.sendObj('server.files.post_directory', { path: this.currentPath+"/"+this.dialogCreateDirectory.name }, 'getPostDirectory');
                }
            },
            deleteDirectoryAction: function() {
                this.$socket.sendObj('server.files.delete_directory', { path: this.currentPath+"/"+this.contextMenu.item.filename }, 'getDeleteDirectory');
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
                this.$socket.sendObj('server.files.get_directory', { path: this.currentPath }, 'getDirectory');
                let dirArray = this.currentPath.split("/");
                this.files = findDirectory(this.filetree, dirArray);
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
                    }, 'getPostFileMove');
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
                        this.$socket.sendObj("server.files.metadata", { filename: filename }, "getMetadata");
                    }
                }

            },
            advancedSearch: function(value, search) {
                return value != null &&
                    search != null &&
                    typeof value === 'string' &&
                    value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
            }
        },
        watch: {
            filetree: {
                deep: true,
                handler(newVal) {
                    let dirArray = this.currentPath.split("/");
                    this.files = findDirectory(newVal, dirArray);
                }
            },
            currentPath: {
                handler(newVal) {
                    let dirArray = newVal.split("/");
                    this.files = findDirectory(this.filetree, dirArray);
                }
            },
            loadings: function(loadings) {
                this.loadingGcodeRefresh = loadings.includes('loadingGcodeRefresh');
                this.loadingGcodeUpload = loadings.includes('loadingGcodeUpload');
            }
        }
    }
</script>