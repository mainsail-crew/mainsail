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
        <v-card class="fileupload-card" @dragover="dragOver" @dragleave="dragLeave" @drop.prevent.stop="dragDrop">
            <v-card-title>
                G-Code Files
                <v-spacer></v-spacer>
                <v-btn :loading="loadingRefresh" @click="refreshFileList"><v-icon class="mr-1">mdi-refresh</v-icon> Refresh</v-btn>
                <input type="file" ref="fileUpload" style="display: none" @change="uploadFile" />
                <v-btn color="primary ml-4 " v-if="!is_printing" :loading="loadingUpload" @click="clickUploadButton"><v-icon>mdi-upload</v-icon>Upload</v-btn>
            </v-card-title>
            <v-data-table
                    :headers="headers"
                    :options="options"
                    :custom-sort="sort"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :items="files"
                    :items-per-page="countPerPage"
                    item-key="date"
                    class="files-table"
            >
                <template #no-data>
                    <div class="text-center">empty</div>
                </template>

                <template #item="{ item }">
                    <tr @contextmenu="showContextMenu($event, item)" @click="dialog.show = true, dialog.filename = item.filename" class="file-list-cursor">
                        <td class=" ">
                            {{ item.filename }}
                        </td>
                        <td class="text-no-wrap text-right">
                            {{ formatFilesize(item.size) }}
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
                            {{ item.filament_used ? item.filament_used.toFixed()+' mm' : '--' }}
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
                <v-list-item @click="downloadFile">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> Download
                </v-list-item>
                <v-list-item @click="removeFile">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialog.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Start Job</v-card-title>
                <v-card-text>Do you want to start {{ dialog.filename }}?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="dialog.show = false">No</v-btn>
                    <v-btn color="green darken-1" text @click="startPrint(dialog.filename)">Yes</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import axios from 'axios';
    import { hostname } from '../store/variables';

    export default {
        data () {
            return {
                sortBy: 'modified',
                sortDesc: true,
                dialog: {
                    show: false,
                    filename: ""
                },
                headers: [
                    {
                        text: 'Name',
                        value: 'filename',
                    },
                    {
                        text: 'Filesize',
                        value: 'size',
                        align: 'right',
                    },
                    {
                        text: 'Last modified',
                        value: 'modified',
                        align: 'right',
                    },
                    {
                        text: 'Object Height',
                        value: 'object_height',
                        align: 'right',
                    },
                    {
                        text: 'Layer Height',
                        value: 'layer_height',
                        align: 'right',
                    },
                    {
                        text: 'Filament Usage',
                        value: 'filament_used',
                        align: 'right',
                    },
                    {
                        text: 'Print Time',
                        value: 'estimated_time',
                        align: 'right',
                    },
                    {
                        text: 'Generated by',
                        value: 'slicer',
                        align: 'right',
                    },
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
                hostname: hostname,
                dropzone: {
                    visibility: 'hidden',
                    opacity: 0,
                }
            }
        },
        computed: {
            ...mapState({
                files: state => state.files,
                loadingUpload: state => state.socket.loadingGcodeUpload,
                loadingRefresh: state => state.socket.loadingGcodeRefresh,
                countPerPage: state => state.gui.gcodefiles.countPerPage,
            }),
            ...mapGetters([
                'is_printing'
            ])
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
                formData.append('file', file);
                this.$store.commit('setLoadingGcodeUpload', true);

                axios.post('http://' + hostname + '/printer/files/upload',
                    formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                ).then((result) => {
                    this.$store.commit('setLoadingGcodeUpload', false);
                    toast.success("Upload of "+result.data.result+" successful!", {
                        icon: 'fa-check'
                    });
                })
                .catch(() => {
                    this.$store.commit('setLoadingGcodeUpload', false);
                    toast.error("Cannot upload the file!", {
                        icon: 'fa-exclamation-triangle'
                    });
                });
            },
            clickUploadButton: function() {
                this.$refs.fileUpload.click();
            },
            refreshFileList: function() {
                this.$store.commit('setLoadingGcodeRefresh', true);
                this.$socket.sendObj('get_printer_files', {}, 'getFileList');
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

                    let hours = Math.floor(totalSeconds / 3600);
                    totalSeconds %= 3600;
                    if (hours) output += hours+"h";
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
                let link = document.createElement("a");
                link.download = name;
                link.href = 'http://' + hostname + '/printer/files/' + this.contextMenu.item.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            removeFile() {
                axios.delete(
                    'http://'+hostname+'/printer/files/'+this.contextMenu.item.filename
                ).then(() => {
                    this.$toast(this.contextMenu.item.filename+" successfully deleted.", {
                        icon: 'fa-trash'
                    });
                }).catch(() => {
                    this.$toast.error("Error! Cannot delete file.", {
                        icon: 'fa-warning'
                    });
                });
            },
            startPrint(filename = "") {
                this.dialog.show = false;
                this.$socket.sendObj('post_printer_print_start', { filename: filename }, 'switchToDashboard');
            },
            dragOver(e) {
                e.preventDefault();
                e.stopPropagation();

                this.dropzone.visibility = 'visible';
                this.dropzone.opacity = 1;
            },
            dragLeave(e) {
                e.preventDefault();
                e.stopPropagation();

                this.dropzone.visibility = 'hidden';
                this.dropzone.opacity = 0;
            },
            async dragDrop(e) {
                e.preventDefault();

                this.dropzone.visibility = 'hidden';
                this.dropzone.opacity = 0;

                if (!this.is_printing && e.dataTransfer.files.length) {
                    await this.doUploadFile(e.dataTransfer.files[0]);
                }
            },
            sort(items, sortBy, sortDesc) {
                sortBy = sortBy.length ? sortBy[0] : 'name';
                sortDesc = sortDesc[0];

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
                if (sortDesc) {
                    items.reverse();
                }

                // Then make sure directories come first
                items.sort((a, b) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? -1 : 1));
                return items;
            },
        }
    }
</script>