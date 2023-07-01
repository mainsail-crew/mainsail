<template>
    <div>
        <panel
            :title="$t('Timelapse.TimelapseFiles')"
            :icon="mdiFileDocumentMultipleOutline"
            card-class="timelapse-files-panel">
            <v-card-text>
                <v-row>
                    <v-col class="col-12 d-flex align-center">
                        <v-text-field
                            v-model="search"
                            :append-icon="mdiMagnify"
                            :label="$t('Timelapse.Search')"
                            single-line
                            outlined
                            clearable
                            hide-details
                            dense
                            style="max-width: 300px"></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn
                            v-if="selectedFiles.length"
                            :title="$t('Timelapse.Download')"
                            color="primary"
                            class="px-2 minwidth-0 ml-3"
                            :loading="loadings.includes('timelapseDownloadZip')"
                            @click="downloadSelectedFiles">
                            <v-icon>{{ mdiCloudDownload }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="selectedFiles.length"
                            :title="$t('Timelapse.Delete')"
                            color="error"
                            class="px-2 minwidth-0 ml-3"
                            @click="deleteSelectedDialog = true">
                            <v-icon>{{ mdiDelete }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="directoryPermissions.includes('w')"
                            :title="$t('Timelapse.CreateNewDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="createDirectory">
                            <v-icon>{{ mdiFolderPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            :title="$t('Timelapse.RefreshCurrentDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="refreshFileList">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span>
                            <b>{{ $t('Timelapse.CurrentPath') }}:</b>
                            {{ currentPath !== 'timelapse' ? '/' + currentPath.substring(10) : '/' }}
                        </span>
                        <v-spacer></v-spacer>
                        <template v-if="disk_usage !== null">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <b>{{ $t('Timelapse.FreeDisk') }}:</b>
                                        {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Timelapse.Used') }}: {{ formatFilesize(disk_usage.used) }}
                                    <br />
                                    {{ $t('Timelapse.Free') }}: {{ formatFilesize(disk_usage.free) }}
                                    <br />
                                    {{ $t('Timelapse.Total') }}: {{ formatFilesize(disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                v-model="selectedFiles"
                :items="displayFiles"
                class="files-table"
                :headers="headers"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Timelapse.Files'),
                    itemsPerPageAllText: $t('Timelapse.AllFiles'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                item-key="filename"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                show-select>
                <template slot="items">
                    <td v-for="header in headers" :key="header.value">{{ header.text }}</td>
                </template>

                <template #no-data>
                    <div class="text-center font-italic">{{ $t('Timelapse.Empty') }}</div>
                </template>

                <template v-if="currentPath !== 'timelapse'" slot="body.prepend">
                    <tr class="file-list-cursor" @click="clickRowGoBack">
                        <td class="pr-0 text-center" style="width: 32px">
                            <v-icon>{{ mdiFolderUpload }}</v-icon>
                        </td>
                        <td class=" " :colspan="headers.length">..</td>
                    </tr>
                </template>

                <template #item="{ index, item, isSelected, select }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        class="file-list-cursor user-select-none"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)">
                        <td class="file-list__select-td pr-0">
                            <v-simple-checkbox
                                v-ripple
                                :value="isSelected"
                                class="pa-0 mr-0"
                                @click.stop="select(!isSelected)"></v-simple-checkbox>
                        </td>
                        <td class="px-0 text-center" style="width: 32px">
                            <template v-if="item.isDirectory">
                                <v-icon width="32">{{ mdiFolder }}</v-icon>
                            </template>
                            <template v-else-if="item.filename.endsWith('zip')">
                                <v-icon width="32">{{ mdiFolderZipOutline }}</v-icon>
                            </template>
                            <template v-else-if="getThumbnail(item)">
                                <v-tooltip
                                    v-if="!item.isDirectory && getThumbnail(item)"
                                    top
                                    content-class="tooltip__content-opacity1">
                                    <template #activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img
                                                slot="image"
                                                :src="getThumbnail(item)"
                                                :alt="item.filename"
                                                width="32"
                                                v-bind="attrs"
                                                v-on="on" />
                                            <div slot="preloader">
                                                <v-progress-circular
                                                    slot="preloader"
                                                    indeterminate
                                                    color="primary"></v-progress-circular>
                                            </div>
                                            <div slot="error">
                                                <v-icon>{{ mdiFile }}</v-icon>
                                            </div>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="getThumbnail(item)" :alt="item.filename" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td
                            v-if="headers.find((header) => header.value === 'size').visible"
                            class="text-no-wrap text-right">
                            {{ item.isDirectory ? '--' : formatFilesize(item.size) }}
                        </td>
                        <td v-if="headers.find((header) => header.value === 'modified').visible" class="text-right">
                            {{ formatDateTime(item.modified) }}
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="downloadFile(contextMenu.item.filename)">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Timelapse.Download') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    @click="renameDirectory(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Timelapse.Rename') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    @click="renameFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Timelapse.Rename') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    class="red--text"
                    @click="deleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Timelapse.Delete') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    class="red--text"
                    @click="deleteDirectory(contextMenu.item)">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Timelapse.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <panel
                :title="$t('Timelapse.RenameFile')"
                card-class="gcode-files-rename-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogRenameFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldRenameFile"
                        v-model="dialogRenameFile.newName"
                        :label="$t('Timelapse.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keypress.enter="renameFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameFileAction">
                        {{ $t('Timelapse.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <panel
                :title="$t('Timelapse.NewDirectory')"
                card-class="gcode-files-new-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogCreateDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldCreateDirectory"
                        v-model="dialogCreateDirectory.name"
                        :label="$t('Timelapse.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keypress.enter="createDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">
                        {{ $t('Timelapse.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="createDirectoryAction">
                        {{ $t('Timelapse.Create') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel
                :title="$t('Timelapse.RenameDirectory')"
                card-class="gcode-files-rename-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogRenameDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldRenameDirectory"
                        v-model="dialogRenameDirectory.newName"
                        :label="$t('Timelapse.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="renameDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">
                        {{ $t('Timelapse.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameDirectoryAction">
                        {{ $t('Timelapse.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <panel
                :title="$t('Timelapse.DeleteDirectory')"
                card-class="gcode-files-delete-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogDeleteDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{ $t('Timelapse.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">
                        {{ $t('Timelapse.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Timelapse.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="boolVideoDialog" :max-width="700">
            <panel
                :title="$t('Timelapse.Video')"
                :icon="mdiFileVideo"
                card-class="timelapse-video-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="boolVideoDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="">
                    <v-row>
                        <v-col class="pb-0">
                            <video :src="apiUrl + '/server/files/' + videoDialogFilename" controls style="width: 100%">
                                Sorry, your browser doesn't support embedded videos, but don't worry, you can
                                <a :href="apiUrl + '/server/files/' + videoDialogFilename">download it</a>
                                and watch it with your favorite video player!
                            </video>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                text
                                color="primary"
                                :href="apiUrl + '/server/files/' + videoDialogFilename"
                                target="_blank">
                                {{ $t('Timelapse.Download') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE SINGLE FILE DIALOG -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <panel :title="$t('Timelapse.Delete')" card-class="timelapse-delete-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{ $t('Timelapse.DeleteSingleFileQuestion', { name: contextMenu.item.filename }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteDialog = false">
                        {{ $t('Timelapse.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="removeFile">
                        {{ $t('Timelapse.Delete') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE MULTIPLE FILES DIALOG -->
        <v-dialog v-model="deleteSelectedDialog" max-width="400">
            <panel :title="$t('Timelapse.Delete')" card-class="timelapse-delete-selected-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteSelectedDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p v-if="selectedFiles.length === 1" class="mb-0">
                        {{ $t('Timelapse.DeleteSingleFileQuestion', { name: selectedFiles[0].filename }) }}
                    </p>
                    <p v-else class="mb-0">
                        {{ $t('Timelapse.DeleteSelectedQuestion', { count: selectedFiles.length }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteSelectedDialog = false">{{ $t('Timelapse.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteSelectedFiles">{{ $t('Timelapse.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { formatFilesize, sortFiles } from '@/plugins/helpers'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiFolderPlus,
    mdiCloseThick,
    mdiFileDocumentMultipleOutline,
    mdiFileVideo,
    mdiFolder,
    mdiFolderUpload,
    mdiMagnify,
    mdiFile,
    mdiFolderZipOutline,
    mdiRefresh,
    mdiCloudDownload,
    mdiRenameBox,
    mdiDelete,
} from '@mdi/js'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

@Component({
    components: { Panel },
})
export default class TimelapseFilesPanel extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize
    sortFiles = sortFiles

    mdiFileVideo = mdiFileVideo
    mdiCloseThick = mdiCloseThick
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiMagnify = mdiMagnify
    mdiFolderPlus = mdiFolderPlus
    mdiRefresh = mdiRefresh
    mdiFolderUpload = mdiFolderUpload
    mdiFolder = mdiFolder
    mdiFolderZipOutline = mdiFolderZipOutline
    mdiFile = mdiFile
    mdiCloudDownload = mdiCloudDownload
    mdiRenameBox = mdiRenameBox
    mdiDelete = mdiDelete

    declare $refs: {
        inputFieldRenameFile: any
        inputFieldCreateDirectory: any
        inputFieldRenameDirectory: any
    }

    private search = ''
    private boolVideoDialog = false
    private videoDialogFilename = ''

    private dialogCreateDirectory = {
        show: false,
        name: '',
    }

    private contextMenu = {
        shown: false,
        isDirectory: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        },
    }

    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        },
    }

    private dialogRenameDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        },
    }

    private dialogDeleteDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        },
    }

    private deleteDialog = false
    private deleteSelectedDialog = false

    private isInvalidName = true
    private nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]

    existsFilename(name: string) {
        return this.files.findIndex((file) => file.filename === name) >= 0
    }

    get headers() {
        return [
            { text: '', value: '', align: 'left', configable: false, visible: true, sortable: false },
            { text: this.$t('Timelapse.Name'), value: 'filename', align: 'left', configable: false, visible: true },
            { text: this.$t('Timelapse.Filesize'), value: 'size', align: 'right', configable: true, visible: true },
            {
                text: this.$t('Timelapse.LastModified'),
                value: 'modified',
                align: 'right',
                configable: true,
                visible: true,
            },
        ]
    }

    get directory() {
        return this.$store.getters['files/getDirectory'](this.currentPath)
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0 }
    }

    get directoryPermissions() {
        return this.directory?.permissions ?? 'r'
    }

    get files() {
        return [...(this.directory?.childrens ?? [])]
    }

    get sortBy() {
        return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'modified'

        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortDesc', value: newVal })
    }

    get countPerPage() {
        return this.$store.state.gui.view.gcodefiles?.countPerPage ?? 10
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.countPerPage', value: newVal })
    }

    get displayFiles() {
        return (
            this.files?.filter((file) => {
                if (file.isDirectory) return true

                return file.filename.endsWith('mp4') || file.filename.endsWith('zip')
            }) ?? []
        )
    }

    get currentPath() {
        return this.$store.state.gui.view.timelapse.currentPath
    }

    set currentPath(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.timelapse.currentPath', value: newVal })
    }

    get selectedFiles() {
        return this.$store.state.gui.view.timelapse.selectedFiles ?? []
    }

    set selectedFiles(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.timelapse.selectedFiles', value: newVal })
    }

    createDirectory() {
        this.dialogCreateDirectory.name = ''
        this.dialogCreateDirectory.show = true

        setTimeout(() => {
            this.$refs.inputFieldCreateDirectory?.focus()
        }, 200)
    }

    createDirectoryAction() {
        this.dialogCreateDirectory.show = false

        this.$socket.emit(
            'server.files.post_directory',
            {
                path: this.currentPath + '/' + this.dialogCreateDirectory.name,
            },
            { action: 'files/getCreateDir' }
        )
    }

    refreshFileList() {
        this.$socket.emit('server.files.get_directory', { path: this.currentPath }, { action: 'files/getDirectory' })
    }

    advancedSearch(value: string | number, search: string) {
        return (
            value != null &&
            search != null &&
            typeof value === 'string' &&
            value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
        )
    }

    getThumbnail(item: FileStateFile) {
        const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
        const preview = this.files?.find((file) => file.filename === filename + '.jpg')
        if (preview) {
            return `${this.apiUrl}/server/files/${encodeURI(this.currentPath)}/${encodeURI(
                preview.filename
            )}?timestamp=${preview.modified.getTime()}`
        }

        return ''
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (item.isDirectory) this.currentPath += '/' + item.filename
            else if (item.filename.endsWith('zip')) {
                this.downloadFile(item.filename)
            } else if (item.filename.endsWith('mp4')) {
                this.videoDialogFilename = encodeURI(`${this.currentPath}/${item.filename}`)
                this.boolVideoDialog = true
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.slice(0, this.currentPath.lastIndexOf('/'))
    }

    showContextMenu(e: any, item: FileStateFile) {
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

    existsFramesZip(item: FileStateFile) {
        const posLastPoint = item.filename.lastIndexOf('.')
        const zipFilename = item.filename.slice(0, posLastPoint) + '.zip'

        return this.files.findIndex((file) => file.filename === zipFilename) !== -1
    }

    downloadFile(filename: string) {
        const path = this.currentPath + '/' + filename
        const href = this.apiUrl + '/server/files/' + encodeURI(path)

        window.open(href)
    }

    async downloadSelectedFiles() {
        let items: string[] = []

        const addElementToItems = async (absolutPath: string, directory: FileStateFile[]) => {
            for (const file of directory) {
                const filePath = `${absolutPath}/${file.filename}`

                if (file.isDirectory && file.childrens) {
                    await addElementToItems(filePath, file.childrens)

                    continue
                }

                items.push(filePath)

                if (file.filename.endsWith('.mp4')) {
                    const indexLastPoint = file.filename.lastIndexOf('.')
                    const filenameWithoutExtension = file.filename.slice(0, indexLastPoint)
                    const filenamePng = `${filenameWithoutExtension}.jpg`

                    if (this.files.indexOf((file: FileStateFile) => file.filename === filenamePng) !== -1) {
                        items.push(`${absolutPath}/${filenamePng}`)
                    }
                }
            }
        }

        await addElementToItems(this.currentPath, this.selectedFiles)
        const date = new Date()
        const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDay()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`

        this.$socket.emit(
            'server.files.zip',
            { items, dest: `timelapse/timelapse-${timestamp}.zip` },
            { action: 'files/downloadZip', loading: 'timelapseDownloadZip' }
        )

        this.selectedFiles = []
    }

    renameFile(item: FileStateFile) {
        const posLastPoint = item.filename.lastIndexOf('.')
        this.dialogRenameFile.newName = item.filename.slice(0, posLastPoint)

        this.dialogRenameFile.item = item
        this.dialogRenameFile.show = true

        setTimeout(() => {
            this.$refs.inputFieldRenameFile?.focus()
        }, 200)
    }

    renameFileAction() {
        const posLastPoint = this.dialogRenameFile.item.filename.lastIndexOf('.')
        const oldNameWithoutExtension = this.dialogRenameFile.item.filename.slice(0, posLastPoint)
        const fileExtension = this.dialogRenameFile.item.filename.split('.').pop()

        this.dialogRenameFile.show = false

        /**
         * rename the file regardless of its file-extension
         */
        this.$socket.emit(
            'server.files.move',
            {
                source: `${this.currentPath}/${this.dialogRenameFile.item.filename}`,
                dest: `${this.currentPath}/${this.dialogRenameFile.newName}.${fileExtension}`,
            },
            { action: 'files/getMove' }
        )

        if (fileExtension !== 'mp4') return

        /**
         * mp4 and jpg always require to have the same name as the
         * jpg is used as a mp4-thumbnail in the timelapse file-browser
         */
        const fileJpg = this.files.find((file) => file.filename === `${oldNameWithoutExtension}.jpg`)

        if (fileJpg) {
            this.$socket.emit('server.files.move', {
                source: `${this.currentPath}/${oldNameWithoutExtension}.jpg`,
                dest: `${this.currentPath}/${this.dialogRenameFile.newName}.jpg`,
            })
        }
    }

    renameDirectory(item: FileStateFile) {
        this.dialogRenameDirectory.item = item
        this.dialogRenameDirectory.newName = item.filename
        this.dialogRenameDirectory.show = true

        setTimeout(() => {
            this.$refs.inputFieldRenameDirectory?.focus()
        }, 200)
    }

    renameDirectoryAction() {
        this.dialogRenameDirectory.show = false
        this.$socket.emit(
            'server.files.move',
            {
                source: this.currentPath + '/' + this.dialogRenameDirectory.item.filename,
                dest: this.currentPath + '/' + this.dialogRenameDirectory.newName,
            },
            { action: 'files/getMove' }
        )
    }

    removeFile() {
        const filename = this.contextMenu.item.filename.slice(0, this.contextMenu.item.filename.lastIndexOf('.'))
        const fileExtension = this.contextMenu.item.filename.split('.').pop()

        /**
         * delete the file regardless of its file-extension
         */
        this.$socket.emit(
            'server.files.delete_file',
            { path: this.currentPath + '/' + this.contextMenu.item.filename },
            { action: 'files/getDeleteFile' }
        )

        if (fileExtension !== 'mp4') return

        /**
         * if file-extension is mp4, also delete its corresponding thumbnail jpg
         */
        const previewFilename = filename + '.jpg'
        const previewExists = this.files.findIndex((file) => file.filename === previewFilename) !== -1

        if (previewExists)
            this.$socket.emit(
                'server.files.delete_file',
                { path: this.currentPath + '/' + previewFilename },
                { action: 'files/getDeleteFile' }
            )

        this.deleteDialog = false
    }

    deleteDirectory(item: FileStateFile) {
        this.dialogDeleteDirectory.item = item
        this.dialogDeleteDirectory.show = true
    }

    deleteDirectoryAction() {
        this.dialogDeleteDirectory.show = false
        this.$socket.emit(
            'server.files.delete_directory',
            { path: this.currentPath + '/' + this.contextMenu.item.filename, force: true },
            { action: 'files/getDeleteDir' }
        )
    }

    deleteSelectedFiles() {
        this.selectedFiles.forEach((item: FileStateGcodefile) => {
            if (item.isDirectory) {
                this.$socket.emit(
                    'server.files.delete_directory',
                    { path: this.currentPath + '/' + item.filename, force: true },
                    { action: 'files/getDeleteDir' }
                )
            } else {
                const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
                const fileExtension = item.filename.split('.').pop()

                this.$socket.emit(
                    'server.files.delete_file',
                    { path: this.currentPath + '/' + item.filename },
                    { action: 'files/getDeleteFile' }
                )

                if (fileExtension !== 'mp4') return

                /**
                 * if file-extension is mp4, also delete its corresponding thumbnail jpg
                 */
                const previewFilename = filename + '.jpg'
                const previewExists = this.files.findIndex((file) => file.filename === previewFilename) !== -1

                if (previewExists)
                    this.$socket.emit(
                        'server.files.delete_file',
                        { path: this.currentPath + '/' + previewFilename },
                        { action: 'files/getDeleteFile' }
                    )
            }
        })

        this.selectedFiles = []
        this.deleteSelectedDialog = false
    }
}
</script>

<style scoped>
.v-data-table .v-data-table-header__icon {
    margin-left: 7px;
}

.v-data-table th {
    white-space: nowrap;
}

.v-data-table .file-list-cursor:hover {
    cursor: pointer;
}
</style>
