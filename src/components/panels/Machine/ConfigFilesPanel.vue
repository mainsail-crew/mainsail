<style scoped>
    /*.my-editor {
        background: #2d2d2d;
        color: #ccc;
        font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 5px;
    }

    .config-editor-overlay div.v-card {
        position: relative;
    }

    .config-editor-overlay div.v-card header {
        position: sticky;
        top: 0;
        width: 100%;
        z-index: 1;
    }*/
</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading align-baseline"><v-icon left>mdi-information</v-icon>{{ $t('Machine.ConfigFilesPanel.ConfigFiles') }}</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <input type="file" ref="fileUpload" style="display: none" multiple @change="uploadFile" />
                <v-item-group class="v-btn-toggle" name="controllers">
                    <template >
                        <v-btn
                            v-for="button in filteredToolbarButtons"
                            v-bind:key="button.loadingName"
                            class="px-2 minwidth-0"
                            :color="button.color"
                            @click="button.click"
                            :loading="button.loadingName !== null && loadings.includes(button.loadingName)"
                            small
                        >
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon v-bind="attrs" v-on="on" small>{{ button.icon }}</v-icon>
                                </template>
                                <span>{{ button.text }}</span>
                            </v-tooltip>
                        </v-btn>
                    </template>
                    <v-menu :offset-y="true" :title="$t('Machine.ConfigFilesPanel.SetupCurrentList')">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="px-2 minwidth-0" color="grey darken-3" v-bind="attrs" v-on="on" small><v-icon small>mdi-cog</v-icon></v-btn>
                        </template>
                        <v-list>
                            <v-list-item class="minHeight36">
                                <v-checkbox class="mt-0" hide-details v-model="showHiddenFiles" :label="$t('Machine.ConfigFilesPanel.HiddenFiles')"></v-checkbox>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-item-group>
            </v-toolbar>
            <v-card-text>
                <v-row>
                    <v-col class="col-7 align-center d-flex">
                        <span><b>{{ $t('Machine.ConfigFilesPanel.CurrentPath') }}:</b><br />{{ this.absolutePath }}</span>
                    </v-col>
                    <v-col class="col-5">
                        <v-select
                            v-model="root"
                            :items="registeredDirectories"
                            label="Root"
                            outlined
                            hide-details
                            dense
                            @change="changeRoot"
                        ></v-select>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-data-table
                :items="files"
                class="files-table"
                :headers="headers"
                :options="options"
                :page.sync="currentPage"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText:  $t('Machine.ConfigFilesPanel.Files'),
                    itemsPerPageAllText: $t('Machine.ConfigFilesPanel.AllFiles'),
                    itemsPerPageOptions: [10,25,50,100,-1]
                }"
                mobile-breakpoint="0"
                item-key="name">

                <template #no-data>
                    <div class="text-center">{{ $t('Machine.ConfigFilesPanel.Empty')  }}</div>
                </template>

                <template slot="body.prepend" v-if="(currentPath !== '')">
                   <tr
                        class="file-list-cursor"
                        @click="clickRowGoBack"
                        @dragover="dragOverFilelist($event, {isDirectory: true, filename: '..'})"
                        @dragleave="dragLeaveFilelist"
                        @drop.prevent.stop="dragDropFilelist($event, {isDirectory: true, filename: '..'})"
                   >
                        <td class="pr-0 text-center" style="width: 32px;"><v-icon>mdi-folder-upload</v-icon></td>
                        <td class=" " colspan="4">..</td>
                    </tr>
                </template>

                <template #item="{ index, item }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        class="file-list-cursor user-select-none"
                        :data-name="item.filename"
                        draggable="true"
                        @drag="dragFile($event, item)"
                        @dragend="dragendFile($event)"
                        @dragover="dragOverFilelist($event, item)" @dragleave="dragLeaveFilelist" @drop.prevent.stop="dragDropFilelist($event, item)"
                    >
                        <td class="pr-0 text-center" style="width: 32px;">
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
                <v-list-item @click="clickRow(contextMenu.item, true)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-file-document-edit-outline</v-icon> {{ isDirWriteable ? $t('Machine.ConfigFilesPanel.EditFile') : $t('Machine.ConfigFilesPanel.ShowFile')  }}
                </v-list-item>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> {{ $t('Machine.ConfigFilesPanel.Download') }}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory && isDirWriteable">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Machine.ConfigFilesPanel.Rename') }}
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory && isDirWriteable">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Machine.ConfigFilesPanel.Rename') }}
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory && isDirWriteable">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Machine.ConfigFilesPanel.Delete') }}
                </v-list-item>
                <v-list-item @click="deleteDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory && isDirWriteable">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Machine.ConfigFilesPanel.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
<!--            <v-dialog v-model="editor.showLoader" hide-overlay persistent width="300">
            <v-card color="primary" dark >
                <v-card-text>
                    {{ $t('Machine.ConfigFilesPanel.PleaseStandBy') }}
                    <v-progress-linear indeterminate color="white" class="mb-0" ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>-->
<!--            <v-dialog v-model="image.show" hide-overlay fullscreen @keydown.esc="image.show = false; image.url = null; image.svg = null;" class="fill-height">
          <v-card style="position: relative;">
            <v-toolbar dark color="primary">
              <v-btn icon dark @click="image.show = false; image.url = null; image.svg = null;">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <div class="d-flex justify-center" style="max-height: calc(100vh - 64px); overflow: auto;">
              <img v-if="image.url" :src="image.url" style="max-height: 100%; width: auto;" alt="image" />
              <svg v-else-if="image.svg" v-html="image.svg"></svg>
            </div>
          </v-card>
        </v-dialog>-->
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Machine.ConfigFilesPanel.RenameFile') }}</v-card-title>
                <v-card-text>
                    <v-text-field  :label="$t('Machine.ConfigFilesPanel.Name')" required v-model="dialogRenameFile.newName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Machine.ConfigFilesPanel.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCreateFile.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Machine.ConfigFilesPanel.CreateFile') }}</v-card-title>
                <v-card-text>
                    <v-text-field  :label="$t('Machine.ConfigFilesPanel.Name')" required v-model="dialogCreateFile.name"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateFile.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createFileAction">{{ $t('Machine.ConfigFilesPanel.Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Machine.ConfigFilesPanel.CreateDirectory') }}</v-card-title>
                <v-card-text>
                    <v-text-field :label="$t('Machine.ConfigFilesPanel.Name')" required v-model="dialogCreateDirectory.name"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">{{ $t('Machine.ConfigFilesPanel.Create') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Machine.ConfigFilesPanel.RenameDirectory') }}</v-card-title>
                <v-card-text>
                    <v-text-field  :label="$t('Machine.ConfigFilesPanel.Name')" required v-model="dialogRenameDirectory.newName"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">{{ $t('Machine.ConfigFilesPanel.Rename') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('Machine.ConfigFilesPanel.DeleteDirectory') }}</v-card-title>
                <v-card-text>
                    <p class="mb-0">{{ $t('Machine.ConfigFilesPanel.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename } )}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Machine.ConfigFilesPanel.Delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="uploadSnackbar.status" :timeout="-1" :value="true" fixed right bottom dark>
            <span v-if="uploadSnackbar.max > 1" class="mr-1">({{ uploadSnackbar.number }}/{{ uploadSnackbar.max }})</span><strong>{{ $t('Machine.ConfigFilesPanel.Uploading') }} {{ uploadSnackbar.filename }}</strong><br />
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
<!--        <v-dialog fullscreen :transition="null" v-model="editor.show" @keydown.esc="closeEditor()">
            <v-card d-flex class="fill-height">
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
                        <v-btn dark text href="https://www.klipper3d.org/Config_Reference.html" v-if="restartServiceName === 'klipper'" target="_blank" class="d-none d-md-flex"><v-icon small class="mr-1">mdi-help</v-icon>{{ $t('Machine.ConfigFilesPanel.ConfigReference') }}</v-btn>
                        <template v-if="isDirWriteable">
                            <v-divider white vertical class="d-none d-md-flex"></v-divider>
                            <v-btn dark text @click="saveFile(false)" ><v-icon small class="mr-1">mdi-content-save</v-icon><span class="d-none d-sm-inline">{{ $t('Machine.ConfigFilesPanel.SaveClose') }}</span></v-btn>
                        </template>
                        <template v-if="restartServiceName != null">
                            <v-divider white vertical class="d-none d-sm-flex"></v-divider>
                            <v-btn dark text @click="saveFile(true)" class="d-none d-sm-flex"><v-icon small class="mr-1">mdi-restart</v-icon>{{ $t('Machine.ConfigFilesPanel.SaveRestart') }}</v-btn>
                        </template>
                    </v-toolbar-items>
                </v-toolbar>
                <div v-if="editor.init" id="editor" class="mainsail-editor" style="height: 92%; width: 100%; overflow: hidden;"></div>
            </v-card>
        </v-dialog>-->
    </div>
</template>

<script lang="ts">

import {Component, Mixins, Watch} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import {readOnlyRoots} from "@/store/variables";
import {findDirectory, formatDate, formatFilesize, sortFiles} from "@/plugins/helpers";
import {FileStateFile} from "@/store/files/types";
import axios from "axios";

interface contextMenu {
    shown: boolean
    isDirectory: boolean
    touchTimer: number | null
    x: number
    y: number
    item: FileStateFile
}

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

interface dialogDeleteObject {
    show: boolean
    item: FileStateFile
}

interface uploadSnackbar {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    number: number
    max: number
    cancelTokenSource: any
    lastProgress: {
        time: number
        loaded: number
    }
}

interface draggingFile {
    status: boolean
    item: FileStateFile
}

@Component
export default class ConfigFilesPanel extends Mixins(BaseMixin) {
    sortFiles = sortFiles
    formatFilesize = formatFilesize
    formatDate = formatDate

    $refs!: {
        fileUpload: HTMLInputElement,
    }

    private selected = []
    private options = { }
    private currentPage = 1
    private files: FileStateFile[] = []
    private currentPath = ''
    private root = 'config'
    private contextMenu: contextMenu = {
        shown: false,
        isDirectory: false,
        touchTimer: null,
        x: 0,
        y: 0,
        item: {
            isDirectory: false,
            filename: '',
            modified: new Date()
        }
    }
    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: "",
        item: {
            isDirectory: false,
            filename: '',
            modified: new Date()
        }
    }
    private dialogCreateFile = {
        show: false,
        name: "",
    }
    private dialogCreateDirectory = {
        show: false,
        name: "",
    }
    private dialogRenameDirectory: dialogRenameObject = {
        show: false,
        newName: "",
        item: {
            isDirectory: false,
            filename: '',
            modified: new Date()
        }
    }
    private dialogDeleteDirectory: dialogDeleteObject = {
        show: false,
        item: {
            isDirectory: false,
            filename: '',
            modified: new Date()
        }
    }
    private uploadSnackbar: uploadSnackbar = {
        status: false,
        filename: "",
        percent: 0,
        speed: 0,
        total: 0,
        number: 0,
        max: 0,
        cancelTokenSource: {},
        lastProgress: {
            time: 0,
            loaded: 0
        }
    }
    private draggingFile: draggingFile = {
        status: false,
        item: {
            isDirectory: false,
            filename: "",
            modified: new Date()
        }
    }

    get toolbarButtons() {
        return [
            {
                text: this.$t("Machine.ConfigFilesPanel.UploadFile"),
                color: "grey darken-3",
                icon: "mdi-file-upload",
                loadingName: null,
                onlyWriteable: true,
                click: this.uploadFileButton
            }, {
                text: this.$t("Machine.ConfigFilesPanel.CreateFile"),
                color: "grey darken-3",
                icon: "mdi-file-plus",
                loadingName: null,
                onlyWriteable: true,
                click: this.createFile
            }, {
                text: this.$t("Machine.ConfigFilesPanel.CreateDirectory"),
                color: "grey darken-3",
                icon: "mdi-folder-plus",
                loadingName: null,
                onlyWriteable: true,
                click: this.createDirecotry
            }, {
                text: this.$t("Machine.ConfigFilesPanel.RefreshDirectory"),
                color: "grey darken-3",
                icon: "mdi-refresh",
                loadingName: null,
                onlyWriteable: false,
                click: this.refreshFileList
            },
        ]
    }

    get filteredToolbarButtons() {
        return this.toolbarButtons.filter((button) => {
            return (this.isDirWriteable && button.onlyWriteable) || !button.onlyWriteable
        })
    }

    get filetree() {
        return this.$store.state.files.filetree
    }

    get headers() {
        return [
            { text: '', value: '', },
            { text: this.$t('Machine.ConfigFilesPanel.Name'), value: 'filename', },
            { text: this.$t('Machine.ConfigFilesPanel.Filesize'), value: 'size', align: 'right', },
            { text: this.$t('Machine.ConfigFilesPanel.LastModified'), value: 'modified', align: 'right', },
        ]
    }

    get countPerPage() {
        return this.$store.state.gui.settings.configfiles.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'settings.configfiles.countPerPage', value: newVal })
    }

    get showHiddenFiles() {
        return this.$store.state.gui.settings.configfiles.showHiddenFiles
    }

    set showHiddenFiles(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'settings.configfiles.showHiddenFiles', value: newVal })
    }

    get sortBy() {
        return this.$store.state.gui.settings.configfiles.sortBy
    }

    set sortBy(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'settings.configfiles.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.settings.configfiles.sortDesc
    }

    set sortDesc(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'settings.configfiles.sortDesc', value: newVal })
    }

    get registeredDirectories() {
        return this.$store.state.server.registered_directories.filter((dir: string) => dir !== 'gcodes').sort()
    }

    get availableServices() {
        return this.$store.state.server.system_info.available_services
    }

    get restartServiceName() {
        if (!this.isDirWriteable) return null
        if (['printing', 'paused'].includes(this.printer_state)) return null

        //todo for editor
        /*if (this.editor.item.filename === "moonraker.conf")
            return "moonraker"
        else if (this.editor.item.filename.startsWith("webcam") && this.editor.item.filename.endsWith(".txt"))
            return "webcamd"
        else if (this.editor.item.filename.startsWith("mooncord") && this.editor.item.filename.endsWith(".json"))
            return "mooncord"
        else if (this.editor.item.filename.endsWith(".cfg"))
            return "klipper"*/

        return null
    }

    get absolutePath() {
        let path = "/"+this.root
        if (this.currentPath) path += this.currentPath

        return path
    }

    get isDirWriteable() {
        return !readOnlyRoots.includes(this.root)
    }

    refreshFileList() {
        this.$socket.emit('server.files.get_directory', { path: this.absolutePath.substring(1) }, 'files/getDirectory')
    }

    changeRoot() {
        this.currentPath = ""
        this.loadPath()
    }

    loadPath() {
        let dirArray = this.absolutePath.substring(1).split("/")
        this.files = findDirectory(this.filetree, dirArray) ?? []

        if (!this.showHiddenFiles) {
            this.files = this.files.filter(file => file.filename.substr(0, 1) !== ".");
        }
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (!item.isDirectory) {
                // todo editor open
                /*const ext = item.filename.split('.')?.pop()?.toLowerCase();
                if(['svg'].includes(ext)) {
                    let url = '//' + this.hostname + ':' + this.port + '/server/files' + this.absolutePath + '/' + item.filename + '?time=' + Date.now();
                    fetch(url)
                        .then(res => res.text())
                        .then(svg => {
                            this.image.show = true;
                            this.image.svg = svg;
                        });
                } else if(['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'].includes(ext)) {
                    let url = '//' + this.hostname + ':' + this.port + '/server/files' + this.absolutePath + '/' + item.filename + '?time=' + Date.now();
                    this.image.show = true;
                    this.image.url = url;
                } else {
                    /!*const query = '/server/files' + this.currentPath + '/' + item.filename;
                    this.$router.push({
                        name: 'edit-file', query: {
                            path: query
                        }
                    });*!/
                    this.editor.showLoader = true;
                    this.editor.sourcecode = "";
                    this.editor.item = item;

                    let url = '//' + this.hostname + ':' + this.port + '/server/files' + this.absolutePath + '/' + item.filename + '?time=' + Date.now()

                    fetch(url, {cache: "no-cache"}).then(res => res.text()).then(file => {
                        this.editor.sourcecode = file;
                        this.editor.options.language = LANGUAGE_MAP[ext] ?? ext.toString();

                        this.editor.show = true;
                        this.editor.init = true;
                        this.$nextTick(() => {
                            this.editor.showLoader = false;
                            this.editor.options.readOnly = false;
                            if (!this.isDirWriteable) this.editor.options.readOnly = true;
                        });
                    });
                }*/
            } else {
                this.currentPath += "/" + item.filename;
                this.currentPage = 1;
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf("/"))
    }

    showContextMenu (e: any, item: FileStateFile) {
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

    downloadFile() {
        const filename = (this.absolutePath+"/"+this.contextMenu.item.filename)
        const href = this.apiUrl + '/server/files' + filename
        window.open(href)
    }

    createDirecotry() {
        this.dialogCreateDirectory.name = ""
        this.dialogCreateDirectory.show = true
    }

    createDirectoryAction() {
        this.dialogCreateDirectory.show = false;

        this.$socket.emit('server.files.post_directory', {
            path: this.absolutePath.substring(1)+"/"+this.dialogCreateDirectory.name
        }, 'files/getCreateDir')
    }

    renameDirectory(item: FileStateFile) {
        this.dialogRenameDirectory.item = item;
        this.dialogRenameDirectory.newName = item.filename;
        this.dialogRenameDirectory.show = true;
    }

    renameDirectoryAction() {
        this.dialogRenameDirectory.show = false;
        this.$socket.emit('server.files.move', {
            source: this.absolutePath+"/"+this.dialogRenameDirectory.item.filename,
            dest: this.absolutePath+"/"+this.dialogRenameDirectory.newName
        }, 'files/getMove');
    }

    deleteDirectory(item: FileStateFile) {
        this.dialogDeleteDirectory.item = item
        this.dialogDeleteDirectory.show = true
    }

    deleteDirectoryAction() {
        this.dialogDeleteDirectory.show = false
        this.$socket.emit('server.files.delete_directory', { path: this.absolutePath+"/"+this.dialogDeleteDirectory.item.filename, force: true }, 'files/getDeleteDir')
    }

    createFile() {
        this.dialogCreateFile.name = ""
        this.dialogCreateFile.show = true
    }

    createFileAction() {
        const file = new File([""], this.dialogCreateFile.name)

        let formData = new FormData()
        formData.append('file', file)
        formData.append('root', this.root)
        if(this.currentPath.length) formData.append('path', this.currentPath.slice(1))

        axios.post(this.apiUrl + '/server/files/upload',
            formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        ).then(() => {
            this.$toast.success(this.$t('Files.SuccessfullyCreated', { filename: this.dialogCreateFile.name }).toString())
            this.dialogCreateFile.show = false
            this.dialogCreateFile.name = ""
        }).catch(() => {
            window.console.error("Error create file: "+this.dialogCreateFile.name)
        })
    }

    renameFile(item: FileStateFile) {
        this.dialogRenameFile.item = item
        this.dialogRenameFile.newName = item.filename
        this.dialogRenameFile.show = true
    }

    renameFileAction() {
        this.dialogRenameFile.show = false
        this.$socket.emit('server.files.move', {
            source: this.absolutePath+"/"+this.dialogRenameFile.item.filename,
            dest: this.absolutePath+"/"+this.dialogRenameFile.newName
        }, 'files/getMove')
    }

    removeFile() {
        this.$socket.emit('server.files.delete_file', { path: this.absolutePath+"/"+this.contextMenu.item.filename }, 'files/getDeleteFile')
    }

    uploadFileButton() {
        this.$refs.fileUpload.click()
    }

    async uploadFile() {
        if (this.$refs.fileUpload.files?.length) {
            this.$store.dispatch('socket/addLoading', { name: 'configFileUpload' })
            let successFiles = []
            this.uploadSnackbar.number = 0
            this.uploadSnackbar.max = this.$refs.fileUpload.files.length
            for (const file of this.$refs.fileUpload.files) {
                this.uploadSnackbar.number++
                const result = await this.doUploadFile(file)
                successFiles.push(result)
            }

            this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
            for(const file of successFiles) {
                this.$toast.success("Upload of "+file+" successful!")
            }

            this.$refs.fileUpload.value = ''
        }
    }

    doUploadFile(file: File) {
        let toast = this.$toast;
        let formData = new FormData();
        let filename = file.name.replace(" ", "_");

        this.uploadSnackbar.filename = filename
        this.uploadSnackbar.status = true
        this.uploadSnackbar.percent = 0
        this.uploadSnackbar.speed = 0
        this.uploadSnackbar.lastProgress.loaded = 0
        this.uploadSnackbar.lastProgress.time = 0

        formData.append('root', this.root)
        formData.append('file', file, this.currentPath+"/"+filename)
        this.$store.dispatch('socket/addLoading', { name: 'configFileUpload' })

        return new Promise(resolve => {
            this.uploadSnackbar.cancelTokenSource = axios.CancelToken.source()
            axios.post(this.apiUrl + '/server/files/upload',
                formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    cancelToken: this.uploadSnackbar.cancelTokenSource.token,
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
                const filename = result.data.item.path.substr(result.data.item.path.indexOf("/")+1)
                this.uploadSnackbar.status = false
                resolve(filename)
            }).catch(() => {
                this.uploadSnackbar.status = false
                this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
                toast.error("Cannot upload the file!")
            })
        })
    }

    cancelUpload() {
        this.uploadSnackbar.cancelTokenSource.cancel()
        this.uploadSnackbar.status = false
    }

    dragFile(e: Event, item: FileStateFile) {
        e.preventDefault();
        this.draggingFile.status = true;
        this.draggingFile.item = item;
    }

    dragendFile(e: Event) {
        e.preventDefault();
        this.draggingFile.status = false
        this.draggingFile.item = {
            isDirectory: false,
            filename: "",
            modified: new Date()
        }
    }

    dragOverFilelist(e: any, row: any) {
        if (this.draggingFile.status) {
            e.preventDefault()
            //e.stopPropagation()

            if (row.isDirectory) e.target.parentElement.style.backgroundColor = '#43A04720'
        }
    }

    dragLeaveFilelist(e: any) {
        if (this.draggingFile.status) {
            e.preventDefault()
            e.stopPropagation()

            e.target.parentElement.style.backgroundColor = 'transparent'
        }
    }

    async dragDropFilelist(e: any, row: any) {
        if (this.draggingFile.status) {
            e.preventDefault()
            e.target.parentElement.style.backgroundColor = 'transparent'

            let dest = "";
            if (row.filename === '..') {
                dest = this.absolutePath.slice(1, this.absolutePath.lastIndexOf("/")+1)+this.draggingFile.item.filename
            } else dest = this.absolutePath+"/"+row.filename+"/"+this.draggingFile.item.filename

            this.$socket.emit('server.files.move', {
                source: this.absolutePath.slice(1)+"/"+this.draggingFile.item.filename,
                dest: dest
            }, 'files/getMove')
        }
    }

    created() { this.loadPath() }

    @Watch('filetree', { deep: true })
    filetreeChanged() { this.loadPath() }

    @Watch('currentPath')
    currentPathChanged() { this.loadPath() }

    @Watch('showHiddenFiles')
    showHiddenFilesChanged() { this.loadPath() }
}


/*import {mapState} from 'vuex'
import {findDirectory} from "@/plugins/helpers.ts"
import {readOnlyRoots} from "@/store/variables.ts"
import axios from "axios"
import * as monaco from 'monaco-editor'
import {LANGUAGE_MAP, liftOff} from "@/plugins/monaco"

export default {
        data: function() {
            return {
                image: {
                  show: false,
                  url: null,
                  svg: null
                },
                editor: {
                    /!*show: false,
                    showLoader: false,
                    readonly: false,
                    init: false,
                    item: {
                        filename: "",
                    },
                    sourcecode: ''*!/
                    show: false,
                    showLoader: false,
                    readonly: false,
                    token: null,
                    init: false,
                    progress: {
                        total: 0,
                        loaded: 0,
                        speed: "",
                        lastTimestamp: 0
                    },
                    options: {
                        contextmenu: false,
                        automaticLayout: true,
                        readOnly: false,
                        language: 'klipper-config',
                        theme: 'dark-converted'
                    },
                    item: {
                        filename: "",
                    },
                    sourcecode: "",
                    monaco: null
                },

            }
        },
        computed: {
            editorOptions() {
                return {
                    ...this.editor.options,
                    minimap: {
                        enabled: this.editorMinimap
                    }
                };
            },
            editorMinimap: {
                get() {
                    return this.$store.state.gui.editor.minimap;
                },
                set(val) {
                    return this.$store.dispatch("gui/setSettings", { editor: { minimap: val } })
                }
            },

        },
        methods: {
            closeEditor() {
                this.editor.show = false;
                this.editor.init = false;
                this.editor.monaco = null;
                this.editor.sourcecode = "";
                this.editor.file = null;
            },
            async editorWillMount(monaco) {
                if (!monaco.languages?.getLanguages().find(l => l.id === 'klipper-config')) {
                    await liftOff(monaco);
                }
            },
            highlighter(code) {
                //return highlight(code, languages.ini); //returns html
                return code;
            },


            saveFile(boolRestart = false) {
                let file = new File([this.editor.sourcecode], this.editor.item.filename);

                let formData = new FormData();
                formData.append('file', file);
                formData.append('root', this.root);
                if(this.currentPath.length) formData.append('path', this.currentPath);

                axios.post('//' + this.hostname + ':' + this.port + '/server/files/upload',
                    formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                ).then(() => {
                    this.$toast.success("File '"+this.editor.item.filename+"' successfully saved.");

                    this.closeEditor();

                    if (boolRestart && this.restartServiceName !== "klipper") {
                        this.$socket.sendObj('machine.services.restart', { service: this.restartServiceName })
                    } else if (boolRestart) {
                        this.$store.commit('server/addEvent', { message: "FIRMWARE_RESTART", type: 'command' })
                        this.$socket.sendObj('printer.gcode.script', { script: "FIRMWARE_RESTART" })
                    }
                }).catch(() => {
                    this.$toast.error("Error save "+this.editor.item.filename);
                });
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

        }
    }*/
</script>
