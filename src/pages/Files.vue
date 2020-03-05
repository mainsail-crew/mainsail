<template>
    <div>
        <v-card>
            <v-card-title>
                G-Code Files
                <v-spacer></v-spacer>
                <v-btn :loading="loadingRefresh" @click="refreshFileList"><v-icon class="mr-1">mdi-refresh</v-icon> Refresh</v-btn>
                <input type="file" ref="fileUpload" style="display: none" @change="uploadFile" />
                <v-btn color="primary ml-4 " :loading="loadingUpload" @click="clickUploadButton"><v-icon>mdi-upload</v-icon>Upload</v-btn>
            </v-card-title>
            <v-data-table
                    :headers="headers"
                    :options="options"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :items="files"
                    item-key="date"
                    class="files-table"
            >
                <template #no-data>
                    <div class="text-center">empty</div>
                </template>

                <template #item="{ item }">
                    <tr @contextmenu="showContextMenu($event, item)" @click="dialog.show = true, dialog.filename = item.filename">
                        <td class=" ">
                            {{ item.filename }}
                        </td>
                        <td class=" ">
                            {{ formatFilesize(item.size) }}
                        </td>
                        <td class="text-end ">
                            {{ formatDate(item.modified) }}
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <!--<v-list-item>
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> Download
                </v-list-item>-->
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
    import { mapState } from 'vuex';
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
                        width: '50%'
                    },
                    {
                        text: 'Filesize',
                        value: 'size',
                    },
                    {
                        text: 'last modified',
                        value: 'modified',
                        align: 'end',
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
            }
        },
        computed: {
            ...mapState({
                files: state => state.files,
                loadingUpload: state => state.socket.loadingGcodeUpload,
                loadingRefresh: state => state.socket.loadingGcodeRefresh,
            })
        },
        methods: {
            uploadFile: function() {
                if (this.$refs.fileUpload.files.length) {
                    let toast = this.$toast;
                    let file = this.$refs.fileUpload.files[0];
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
                        toast.error("Cannot upload the file!", {
                            icon: 'fa-exclamation-triangle'
                        });
                    });
                }
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

                return tmp2.toLocaleString();
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
            }
        }
    }
</script>