<style scoped>

</style>

<template>
    <div>
        <panel :title="$t('Machine.ConfigFilesPanel.ConfigFiles')" card-class="machine-configfiles-panel" icon="mdi-information">
            <v-card-text>
                <v-row>
                    <v-col class="col-12 col-lg pr-lg-0">
                        <v-select
                            v-model="root"
                            :items="registeredDirectories"
                            label="Root"
                            outlined
                            hide-details
                            dense
                            @change="changeRoot"
                            attach
                        ></v-select>
                    </v-col>
                    <v-col class="col col-lg-auto pl-lg-0 text-right">
                        <input type="file" ref="fileUpload" style="display: none" multiple @change="uploadFile" />
                        <v-btn
                            v-for="button in filteredToolbarButtons"
                            v-bind:key="button.loadingName"
                            class="px-2 minwidth-0 ml-3"
                            @click="button.click"
                            :loading="button.loadingName !== null && loadings.includes(button.loadingName)"
                        >
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon v-bind="attrs" v-on="on">{{ button.icon }}</v-icon>
                                </template>
                                <span>{{ button.text }}</span>
                            </v-tooltip>
                        </v-btn>
                        <v-menu offset-y left :title="$t('Machine.ConfigFilesPanel.SetupCurrentList')" attach>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
                            </template>
                            <v-list>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="showHiddenFiles" :label="$t('Machine.ConfigFilesPanel.HiddenFiles')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox class="mt-0" hide-details v-model="hideBackupFiles" :label="$t('Machine.ConfigFilesPanel.HideBackupFiles')"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span><b>{{ $t('Machine.ConfigFilesPanel.CurrentPath') }}:</b> {{ this.absolutePath }}</span>
                        <v-spacer></v-spacer>
                        <template v-if="disk_usage !== null">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <b>{{ $t('Machine.ConfigFilesPanel.FreeDisk') }}:</b> {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Machine.ConfigFilesPanel.Used') }}: {{ formatFilesize(disk_usage.used) }}<br />
                                    {{ $t('Machine.ConfigFilesPanel.Free') }}: {{ formatFilesize(disk_usage.free) }}<br />
                                    {{ $t('Machine.ConfigFilesPanel.Total') }}: {{ formatFilesize(disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
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
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow(contextMenu.item, true)" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-file-document-edit-outline</v-icon> {{ contextMenu.item.permissions.includes('w') ? $t('Machine.ConfigFilesPanel.EditFile') : $t('Machine.ConfigFilesPanel.ShowFile') }}
                </v-list-item>
                <v-list-item @click="downloadFile" v-if="!contextMenu.item.isDirectory">
                    <v-icon class="mr-1">mdi-cloud-download</v-icon> {{ $t('Machine.ConfigFilesPanel.Download') }}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)" v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Machine.ConfigFilesPanel.Rename') }}
                </v-list-item>
                <v-list-item @click="renameDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon class="mr-1">mdi-rename-box</v-icon> {{ $t('Machine.ConfigFilesPanel.Rename') }}
                </v-list-item>
                <v-list-item @click="removeFile" v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Machine.ConfigFilesPanel.Delete') }}
                </v-list-item>
                <v-list-item @click="deleteDirectory(contextMenu.item)" v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('Machine.ConfigFilesPanel.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogImage.show" hide-overlay fullscreen @keydown.esc="dialogImage.show = false; dialogImage.item.url = null; dialogImage.item.svg = null;" class="fill-height">
            <panel :title="dialogImage.item.name" card-class="maschine-configfiles-imageviewer-dialog" style="position: relative;">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogImage.show = false; dialogImage.item.url = null; dialogImage.item.svg = null;">
                        <v-icon>mdi-close-thick</v-icon>
                    </v-btn>
                </template>
                <div class="d-flex justify-center" style="max-height: calc(var(--app-height) - 64px); overflow: auto;">
                    <img v-if="dialogImage.item.url" :src="dialogImage.item.url" style="max-height: 100%; width: auto;" alt="image" />
                    <div v-else-if="dialogImage.item.svg" class="fill-width" v-html="dialogImage.item.svg"></div>
                </div>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateFile.show" max-width="400">
            <panel :title="$t('Machine.ConfigFilesPanel.CreateFile')" card-class="maschine-configfiles-create-file-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogCreateFile.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        v-model="dialogCreateFile.name"
                        ref="inputDialogCreateFileName"
                        @keyup.enter="createFileAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateFile.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createFileAction">{{ $t('Machine.ConfigFilesPanel.Create') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <panel :title="$t('Machine.ConfigFilesPanel.RenameFile')" card-class="maschine-configfiles-rename-file-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRenameFile.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        v-model="dialogRenameFile.newName"
                        ref="inputDialogRenameFileName"
                        @keyup.enter="renameFileAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Machine.ConfigFilesPanel.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <panel :title="$t('Machine.ConfigFilesPanel.CreateDirectory')" card-class="maschine-configfiles-create-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogCreateDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        v-model="dialogCreateDirectory.name"
                        ref="inputDialogCreateDirectoryName"
                        @keyup.enter="createDirectoryAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="createDirectoryAction">{{ $t('Machine.ConfigFilesPanel.Create') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel :title="$t('Machine.ConfigFilesPanel.RenameDirectory')" card-class="maschine-configfiles-rename-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogRenameDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        v-model="dialogRenameDirectory.newName"
                        ref="inputDialogRenameDirectoryName"
                        @keyup.enter="renameDirectoryAction"
                        required
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameDirectoryAction">{{ $t('Machine.ConfigFilesPanel.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <panel :title="$t('Machine.ConfigFilesPanel.DeleteDirectory')" card-class="maschine-configfiles-delete-directory-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="dialogDeleteDirectory.show = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('Machine.ConfigFilesPanel.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename } )}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">{{ $t('Machine.ConfigFilesPanel.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Machine.ConfigFilesPanel.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
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
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {formatDate, formatFilesize, sortFiles} from '@/plugins/helpers'
import {FileStateFile} from '@/store/files/types'
import axios from 'axios'
import Panel from '@/components/ui/Panel.vue'
import {hiddenRootDirectories} from '@/store/variables'

interface contextMenu {
    shown: boolean
    isDirectory: boolean
    touchTimer: number | null
    x: number
    y: number
    item: FileStateFile
}


interface dialogImageObject {
    show: boolean
    item: {
        name: string | null,
        url: string | null,
        svg: string | null
    }
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

@Component({
    components: {Panel}
})
export default class ConfigFilesPanel extends Mixins(BaseMixin) {
    sortFiles = sortFiles
    formatFilesize = formatFilesize
    formatDate = formatDate

    $refs!: {
        fileUpload: HTMLInputElement,
        inputDialogCreateFileName: HTMLInputElement,
        inputDialogRenameFileName: HTMLInputElement,
        inputDialogCreateDirectoryName: HTMLInputElement,
        inputDialogRenameDirectoryName: HTMLInputElement,
    }

    private selected = []
    private options = { }
    private currentPage = 1
    private contextMenu: contextMenu = {
        shown: false,
        isDirectory: false,
        touchTimer: null,
        x: 0,
        y: 0,
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }
    private dialogImage: dialogImageObject = {
        show: false,
        item: {
            name: null,
            url: null,
            svg: null
        }
    }
    private dialogCreateFile = {
        show: false,
        name: '',
    }
    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }
    private dialogCreateDirectory = {
        show: false,
        name: '',
    }
    private dialogRenameDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }
    private dialogDeleteDirectory: dialogDeleteObject = {
        show: false,
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }
    private uploadSnackbar: uploadSnackbar = {
        status: false,
        filename: '',
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
            filename: '',
            permissions: '',
            modified: new Date()
        }
    }

    get toolbarButtons() {
        return [
            {
                text: this.$t('Machine.ConfigFilesPanel.UploadFile'),
                color: 'grey darken-3',
                icon: 'mdi-file-upload',
                loadingName: null,
                onlyWriteable: true,
                click: this.uploadFileButton
            }, {
                text: this.$t('Machine.ConfigFilesPanel.CreateFile'),
                color: 'grey darken-3',
                icon: 'mdi-file-plus',
                loadingName: null,
                onlyWriteable: true,
                click: this.createFile
            }, {
                text: this.$t('Machine.ConfigFilesPanel.CreateDirectory'),
                color: 'grey darken-3',
                icon: 'mdi-folder-plus',
                loadingName: null,
                onlyWriteable: true,
                click: this.createDirecotry
            }, {
                text: this.$t('Machine.ConfigFilesPanel.RefreshDirectory'),
                color: 'grey darken-3',
                icon: 'mdi-refresh',
                loadingName: null,
                onlyWriteable: false,
                click: this.refreshFileList
            },
        ]
    }

    get filteredToolbarButtons() {
        return this.toolbarButtons.filter((button) => {
            return (this.directoryPermissions.includes('w') && button.onlyWriteable) || !button.onlyWriteable
        })
    }

    get absolutePath() {
        let path = '/'+this.root
        if (this.currentPath) path += this.currentPath

        return path
    }

    get directory() {
        return this.$store.getters['files/getDirectory'](this.absolutePath)
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0}
    }

    get directoryPermissions() {
        return this.directory?.permissions ?? 'r'
    }

    get files() {
        let files = [...this.directory?.childrens ?? []]

        if (!this.showHiddenFiles) {
            files = files.filter(file => file.filename.substr(0, 1) !== '.')
        }

        if (this.hideBackupFiles) {
            const backupFileMatcher = /.*\/?printer-\d{8}_\d{6}\.cfg$/
            files = files.filter(file => !file.filename.match(backupFileMatcher))
        }

        return files
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
        return this.$store.state.gui.view.configfiles.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.countPerPage', value: newVal })
    }

    get showHiddenFiles() {
        return this.$store.state.gui.view.configfiles.showHiddenFiles
    }

    set showHiddenFiles(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.showHiddenFiles', value: newVal })
    }

    get hideBackupFiles() {
        return this.$store.state.gui.view.configfiles.hideBackupFiles
    }

    set hideBackupFiles(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.hideBackupFiles', value: newVal })
    }

    get sortBy() {
        return this.$store.state.gui.view.configfiles.sortBy
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'filename'

        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.configfiles.sortDesc
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'view.configfiles.sortDesc', value: newVal })
    }

    get registeredDirectories() {
        return this.$store.state.server.registered_directories.filter((dir: string) => !hiddenRootDirectories.includes(dir)).sort()
    }

    get root() {
        return this.$store.state.gui.view.configfiles.rootPath
    }

    set root(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.configfiles.rootPath', value: newVal })
    }

    get currentPath() {
        return this.$store.state.gui.view.configfiles.currentPath
    }

    set currentPath(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.configfiles.currentPath', value: newVal })
    }

    refreshFileList() {
        this.$socket.emit('server.files.get_directory', { path: this.absolutePath.substring(1) }, { action: 'files/getDirectory' })
    }

    changeRoot() {
        this.currentPath = ''
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (!item.isDirectory) {
                if (['png', 'jpeg', 'jpg', 'gif', 'bmp', 'tif', 'svg'].includes(item.filename.split('.').pop()?.toLowerCase() ?? '')) {
                    const url = `${this.apiUrl}/server/files${this.absolutePath}/${item.filename}?t=${Date.now()}`
                    this.dialogImage.item.name = item.filename
                    if (['svg'].includes(item.filename.split('.').pop()?.toLowerCase() ?? '')) {
                        fetch(url)
                            .then(res => res.text())
                            .then(svg => {
                                this.dialogImage.show = true
                                this.dialogImage.item.svg = svg
                            })
                    } else {
                        this.dialogImage.show = true
                        this.dialogImage.item.url = url
                    }
                } else {
                    this.$store.dispatch('editor/openFile', {
                        root: this.root,
                        path: this.currentPath,
                        filename: item.filename,
                        size: item.size,
                        permissions: item.permissions
                    })
                }
            } else {
                this.currentPath += '/' + item.filename
                this.currentPage = 1
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf('/'))
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
        const filename = (this.absolutePath+'/'+this.contextMenu.item.filename)
        const href = `${this.apiUrl}/server/files${encodeURI(filename)}`
        window.open(href)
    }

    createDirecotry() {
        this.dialogCreateDirectory.name = ''
        this.dialogCreateDirectory.show = true

        setTimeout(() => {
            this.$refs.inputDialogCreateDirectoryName?.focus()
        }, 200)
    }

    createDirectoryAction() {
        this.dialogCreateDirectory.show = false

        this.$socket.emit('server.files.post_directory', {
            path: this.absolutePath.substring(1)+'/'+this.dialogCreateDirectory.name
        }, { action: 'files/getCreateDir' })
    }

    renameDirectory(item: FileStateFile) {
        this.dialogRenameDirectory.item = item
        this.dialogRenameDirectory.newName = item.filename
        this.dialogRenameDirectory.show = true

        setTimeout(() => {
            this.$refs.inputDialogRenameDirectoryName?.focus()
        }, 200)
    }

    renameDirectoryAction() {
        this.dialogRenameDirectory.show = false
        this.$socket.emit('server.files.move', {
            source: (this.absolutePath+'/'+this.dialogRenameDirectory.item.filename).slice(1),
            dest: (this.absolutePath+'/'+this.dialogRenameDirectory.newName).slice(1)
        }, { action: 'files/getMove' })
    }

    deleteDirectory(item: FileStateFile) {
        this.dialogDeleteDirectory.item = item
        this.dialogDeleteDirectory.show = true
    }

    deleteDirectoryAction() {
        this.dialogDeleteDirectory.show = false
        this.$socket.emit('server.files.delete_directory', { path: this.absolutePath+'/'+this.dialogDeleteDirectory.item.filename, force: true }, { action: 'files/getDeleteDir' })
    }

    createFile() {
        this.dialogCreateFile.name = ''
        this.dialogCreateFile.show = true

        setTimeout(() => {
            this.$refs.inputDialogCreateFileName?.focus()
        }, 200)
    }

    createFileAction() {
        const file = new File([''], this.dialogCreateFile.name)

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
            this.dialogCreateFile.name = ''
        }).catch(() => {
            window.console.error('Error create file: '+this.dialogCreateFile.name)
        })
    }

    renameFile(item: FileStateFile) {
        this.dialogRenameFile.item = item
        this.dialogRenameFile.newName = item.filename
        this.dialogRenameFile.show = true

        setTimeout(() => {
            this.$refs.inputDialogRenameFileName?.focus()
        }, 200)
    }

    renameFileAction() {
        this.dialogRenameFile.show = false
        this.$socket.emit('server.files.move', {
            source: (this.absolutePath+'/'+this.dialogRenameFile.item.filename).slice(1),
            dest: (this.absolutePath+'/'+this.dialogRenameFile.newName).slice(1),
        }, { action: 'files/getMove' })
    }

    removeFile() {
        this.$socket.emit('server.files.delete_file', { path: this.absolutePath+'/'+this.contextMenu.item.filename }, { action: 'files/getDeleteFile' })
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
                this.$toast.success('Upload of '+file+' successful!')
            }

            this.$refs.fileUpload.value = ''
        }
    }

    doUploadFile(file: File) {
        let toast = this.$toast
        let formData = new FormData()
        let filename = file.name.replace(' ', '_')

        this.uploadSnackbar.filename = filename
        this.uploadSnackbar.status = true
        this.uploadSnackbar.percent = 0
        this.uploadSnackbar.speed = 0
        this.uploadSnackbar.lastProgress.loaded = 0
        this.uploadSnackbar.lastProgress.time = 0

        formData.append('root', this.root)
        formData.append('file', file, this.currentPath+'/'+filename)
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
                const filename = result.data.item.path.substr(result.data.item.path.indexOf('/')+1)
                this.uploadSnackbar.status = false
                resolve(filename)
            }).catch(() => {
                this.uploadSnackbar.status = false
                this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
                toast.error('Cannot upload the file!')
            })
        })
    }

    cancelUpload() {
        this.uploadSnackbar.cancelTokenSource.cancel()
        this.uploadSnackbar.status = false
    }

    dragFile(e: Event, item: FileStateFile) {
        e.preventDefault()
        this.draggingFile.status = true
        this.draggingFile.item = item
    }

    dragendFile(e: Event) {
        e.preventDefault()
        this.draggingFile.status = false
        this.draggingFile.item = {
            isDirectory: false,
            filename: '',
            permissions: '',
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

            let dest = ''
            if (row.filename === '..') {
                dest = this.absolutePath.slice(1, this.absolutePath.lastIndexOf('/')+1)+this.draggingFile.item.filename
            } else dest = this.absolutePath+'/'+row.filename+'/'+this.draggingFile.item.filename

            this.$socket.emit('server.files.move', {
                source: this.absolutePath.slice(1)+'/'+this.draggingFile.item.filename,
                dest: dest
            }, { action: 'files/getMove' })
        }
    }
}
</script>
