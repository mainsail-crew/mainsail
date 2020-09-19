<style>
    .my-editor {
        background: #2d2d2d;
        color: #ccc;
        font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 5px;
    }

    .prism-editor__textarea:focus {
        outline: none;
    }

    .config-editor-overlay div.v-card {
        position: relative;
    }

    .config-editor-overlay div.v-card header {
        position: sticky;
        top: 0;
        width: 100%;
        z-index: 1;
    }
</style>

<template>
    <div>
        <v-card>
            <v-card-title>
                Config Files
                <v-spacer></v-spacer>
                <v-btn color=" ml-4" v-if="currentPath !== '' && currentPath !== '/config_examples'" @click="createFile"><v-icon>mdi-file-plus</v-icon></v-btn>
                <v-btn color=" ml-4" v-if="currentPath !== '' && currentPath !== '/config_examples'" @click="createFolder"><v-icon>mdi-folder-plus</v-icon></v-btn>
                <v-btn color="primary ml-4" :loading="loadingConfigRefresh" @click="refreshFileList"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-card-title>
            <v-card-subtitle>Current path: {{ this.currentPath === "" ? "/" : this.currentPath }}</v-card-subtitle>
            <v-data-table
                :items="files"
                class="files-table"
                :headers="headers"
                :options="options"
                :page.sync="currentPage"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page="countPerPage"
                item-key="name">

                <template #no-data>
                    <div class="text-center">empty</div>
                </template>

                <template v-slot:body.prepend>
                    <tr
                        v-if="(currentPath !== '')"
                        class="file-list-cursor"
                        @click="clickRowGoBack">
                        <td class=" "><v-icon>mdi-folder-upload</v-icon></td>
                        <td class=" " colspan="8">..</td>
                    </tr>
                </template>

                <template #item="{ item }">
                    <tr
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor"
                        :data-name="item.filename">
                        <td class=" ">
                            <v-icon v-if="item.isDirectory">mdi-folder</v-icon>
                            <v-icon v-if="!item.isDirectory">mdi-file</v-icon>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-no-wrap text-right">{{ item.isDirectory ? '--' : formatFilesize(item.size) }}</td>
                        <td class="text-right">{{ formatDate(item.modified) }}</td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-file-document-edit-outline</v-icon> Edit file
                </v-list-item>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> Download
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory && currentPath !== '/config_examples'">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> Rename
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory && currentPath !== '/config_examples'">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
                <v-list-item @click="deleteDirectoryAction" v-if="contextMenu.item.isDirectory && currentPath !== '' && currentPath !== '/config_examples'">
                    <v-icon class="mr-1">mdi-delete</v-icon> Delete
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="editor.showLoader" hide-overlay persistent width="300" >
            <v-card color="primary" dark >
                <v-card-text>
                    Please stand by
                    <v-progress-linear indeterminate color="white" class="mb-0" ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="editor.show" fullscreen hide-overlay transition="dialog-bottom-transition" content-class="config-editor-overlay">
            <v-card d-flex>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="editor.show = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ editor.item.filename }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark text @click="saveFile" v-if="currentPath !== '/config_examples'">Save</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <prism-editor class="my-editor" v-model="editor.sourcecode" :readonly="editor.readonly" :highlight="highlighter" line-numbers></prism-editor>
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
        <v-dialog v-model="dialogCreateFile.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Create File</v-card-title>
                <v-card-text>
                    <v-text-field label="Name" required v-model="dialogCreateFile.name"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateFile.show = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="createFileAction">create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCreateFolder.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Create Folder</v-card-title>
                <v-card-text>
                    <v-text-field label="Name" required v-model="dialogCreateFolder.name"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateFolder.show = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="createFolderAction">create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import {findDirectory} from "@/plugins/helpers";

    import { PrismEditor } from 'vue-prism-editor';
    import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

    // import highlighting library (you can use any library you want just return html string)
    import { highlight, languages } from 'prismjs/components/prism-core';
    import 'prismjs/components/prism-editorconfig';
    import 'prismjs/components/prism-ini';
    import 'prismjs/themes/prism-okaidia.css';
    import axios from "axios"; // import syntax highlighting styles

    export default {
        components: {
            PrismEditor,
        },
        data: function() {
            return {
                sortBy: 'filename',
                sortDesc: false,
                selected: [],
                headers: [
                    { text: '', value: '', },
                    { text: 'Name', value: 'filename', },
                    { text: 'Filesize', value: 'size', align: 'right', },
                    { text: 'Last modified', value: 'modified', align: 'right', },
                ],
                options: {
                },
                currentPage: 1,
                files: [],
                currentPath: '',
                loadingConfigRefresh: false,
                editor: {
                    show: false,
                    showLoader: false,
                    readonly: false,
                    item: {
                        filename: "",
                    },
                    sourcecode: ''
                },
                contextMenu: {
                    shown: false,
                    isDirectory: false,
                    touchTimer: undefined,
                    x: 0,
                    y: 0,
                    item: {}
                },
                dialogRenameFile: {
                    show: false,
                    newName: "",
                    item: {}
                },
                dialogCreateFile: {
                    show: false,
                    name: "",
                },
                dialogCreateFolder: {
                    show: false,
                    name: "",
                },
            }
        },
        computed: {
            ...mapState({
                config_examples: state => state.filetree.config_examples,
                config: state => state.filetree.config,
                filetree: state => state.filetree,
                countPerPage: state => state.gui.settings.configfiles.countPerPage,
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
            })
        },
        created() {
            this.loadPath();
        },
        methods: {
            highlighter(code) {
                //return highlight(code, languages.editorconfig); //returns html
                return highlight(code, languages.ini); //returns html
            },
            refreshFileList: function() {
                window.console.log(this.currentPath.substring(1));
                this.$store.commit('setLoading', { name: 'loadingConfigRefresh' });

                if (this.currentPath === "") {
                    this.$socket.sendObj('server.files.get_directory', { path: 'config' }, 'getDirectory');
                    this.$socket.sendObj('server.files.get_directory', { path: 'config_examples' }, 'getDirectory');
                } else this.$socket.sendObj('server.files.get_directory', { path: this.currentPath.substring(1) }, 'getDirectory');
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
            loadPath: function() {
                let dirArray = this.currentPath.substring(1).split("/");

                this.files = findDirectory(this.filetree, dirArray);
                if (dirArray.length === 1 && this.currentPath === "") {
                    this.files = this.files.filter(element => element.filename !== "gcodes");
                }
            },
            clickRow: function(item) {
                if (!item.isDirectory) {
                    this.editor.showLoader = true;
                    this.editor.sourcecode = "";
                    this.editor.item = item;

                    let url = '//'+this.hostname+':'+this.port+'/server/files'+this.currentPath+'/'+item.filename+'?time='+Date.now();
                    fetch(url, { cache: "no-cache" }).then(res => res.text()).then(file => {
                        this.editor.sourcecode = file;
                        this.editor.show = true;
                        this.editor.showLoader = false;
                        this.editor.readonly = false;
                        if (this.currentPath === '/config_examples') this.editor.readonly = true;
                    });

                } else {
                    this.currentPath += "/"+item.filename;
                    this.currentPage = 1;
                }
            },
            clickRowGoBack: function() {
                this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf("/"));
            },
            saveFile: function() {
                let file = new File([this.editor.sourcecode], this.editor.item.filename);

                let formData = new FormData();
                formData.append('file', file);
                formData.append('root', 'config');
                if(this.currentPath.length > 7) formData.append('path', this.currentPath.substring(8));

                axios.post('//' + this.hostname + ':' + this.port + '/server/files/upload',
                    formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                ).then(() => {
                    this.$toast.success("File '"+this.editor.item.filename+"' successfully saved.");
                    this.editor.show = false;
                    this.editor.sourcecode = "";
                }).catch(() => {
                    this.$toast.error("Error save "+this.editor.item.filename);
                });
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
                link.href = '//' + this.hostname + ':' + this.port + '/server/files/' + filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            createFolder() {
                this.dialogCreateFolder.name = "";
                this.dialogCreateFolder.show = true;
            },
            createFolderAction() {
                this.dialogCreateFolder.show = false;

                this.$socket.sendObj('server.files.post_directory', {
                    path: this.currentPath.substring(1)+"/"+this.dialogCreateFolder.name
                }, 'getPostDirectory');
            },
            createFile() {
                this.dialogCreateFile.name = "";
                this.dialogCreateFile.show = true;
            },
            createFileAction() {
                let file = new File([""], this.dialogCreateFile.name);

                let formData = new FormData();
                formData.append('file', file);
                formData.append('root', 'config');
                if(this.currentPath.length > 7) formData.append('path', this.currentPath.substring(8));

                axios.post('//' + this.hostname + ':' + this.port + '/server/files/upload',
                    formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                ).then(() => {
                    this.dialogCreateFile.show = false;
                    this.dialogCreateFile.name = "";
                }).catch(() => {
                    window.console.error("Error save "+this.editor.item.filename);
                });
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
            removeFile() {
                let filename = (this.currentPath+"/"+this.contextMenu.item.filename);
                axios.delete(
                    '//'+ this.hostname + ':' + this.port +'/server/files/'+filename
                ).then((result) => {
                    this.$toast.success(result.data.result+" successfully deleted.");
                }).catch(() => {
                    this.$toast.error("Error! Cannot delete file.");
                });
            },
            deleteDirectoryAction: function() {
                this.$socket.sendObj('server.files.delete_directory', { path: this.currentPath+"/"+this.contextMenu.item.filename }, 'getDeleteDirectory');
            },
        },
        watch: {
            config: {
                deep: true,
                handler() {
                    this.loadPath();
                }
            },
            config_examples: {
                deep: true,
                handler() {
                    this.loadPath();
                }
            },
            currentPath: {
                handler() {
                    this.loadPath();
                }
            },
        }
    }
</script>
