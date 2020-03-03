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
                    <tr @contextmenu="showContextMenu($event, item)">
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
                <v-list-item>
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> Download
                </v-list-item>
                <v-list-item @click="removeFile">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import axios from 'axios';

    export default {
        data () {
            return {
                sortBy: 'modified',
                sortDesc: true,
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

                    axios.post('http://'+window.location.host+'/printer/files/upload',
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
                window.console.log(this.contextMenu.item);
                window.console.log("remove");

                axios.delete(
                    'http://'+window.location.host+'/printer/files/'+this.contextMenu.item.filename
                ).then(() => {
                    window.console.log('success');
                }).catch(() => {
                    window.console.log('fail');
                });
            },
        }
    }
</script>