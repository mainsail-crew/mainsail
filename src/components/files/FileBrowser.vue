<template>
    <div class="file-browser">
        <v-card-text>
            <v-row>
                <v-col class="col-12 col-md d-flex align-center">
                    <slot name="toolbar-prepend" />
                    <v-text-field
                        v-if="search !== null"
                        :value="search"
                        :append-icon="mdiMagnify"
                        :label="$t('Files.Search')"
                        single-line
                        outlined
                        clearable
                        hide-details
                        dense
                        class="file-browser__search"
                        @input="updateSearch" />
                </v-col>
                <v-col class="col-12 col-md-auto d-flex align-center justify-end">
                    <v-btn
                        v-if="selected.length"
                        :title="$t('Files.Download')"
                        color="primary"
                        class="px-2 minwidth-0 ml-3"
                        :loading="isDownloadingZip"
                        @click="downloadSelected">
                        <v-icon>{{ mdiCloudDownload }}</v-icon>
                    </v-btn>
                    <template v-if="isWritable">
                        <v-btn
                            v-if="selected.length"
                            :title="$t('Files.Delete')"
                            color="error"
                            class="px-2 minwidth-0 ml-3"
                            @click="openDeleteDialog(selected)">
                            <v-icon>{{ mdiDelete }}</v-icon>
                        </v-btn>
                        <template v-if="uploadAccept !== null">
                            <input
                                ref="fileUpload"
                                type="file"
                                :accept="uploadAccept.join(', ')"
                                class="d-none"
                                multiple
                                @change="uploadFiles" />
                            <v-btn
                                :title="$t('Files.UploadFile')"
                                class="px-2 minwidth-0 ml-3"
                                :loading="isUploading"
                                @click="fileUpload.click()">
                                <v-icon>{{ mdiUpload }}</v-icon>
                            </v-btn>
                        </template>
                        <v-btn
                            v-if="canCreateFile"
                            :title="$t('Files.CreateFile')"
                            class="px-2 minwidth-0 ml-3"
                            @click="openNameDialog('createFile')">
                            <v-icon>{{ mdiFilePlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            :title="$t('Files.CreateNewDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="openNameDialog('createDirectory')">
                            <v-icon>{{ mdiFolderPlus }}</v-icon>
                        </v-btn>
                    </template>
                    <v-btn :title="$t('Files.RefreshCurrentDirectory')" class="px-2 minwidth-0 ml-3" @click="refresh">
                        <v-icon>{{ mdiRefresh }}</v-icon>
                    </v-btn>
                    <slot name="toolbar-append" />
                </v-col>
            </v-row>
            <v-row v-if="rootExists">
                <v-col class="col-12 py-2 d-flex align-center">
                    <span>
                        <b class="mr-1">{{ $t('Files.CurrentPath') }}:</b>
                        <path-navigation
                            :path="navigationPath"
                            :base-directory-label="`/${root}`"
                            :on-segment-click="clickPathSegment" />
                    </span>
                    <v-spacer />
                    <v-tooltip v-if="diskUsage" top>
                        <template #activator="{ on, attrs }">
                            <span v-bind="attrs" v-on="on">
                                <b>{{ $t('Files.FreeDisk') }}:</b>
                                {{ formatFilesize(diskUsage.free) }}
                            </span>
                        </template>
                        <span>
                            {{ $t('Files.Used') }}: {{ formatFilesize(diskUsage.used) }}
                            <br />
                            {{ $t('Files.Free') }}: {{ formatFilesize(diskUsage.free) }}
                            <br />
                            {{ $t('Files.Total') }}: {{ formatFilesize(diskUsage.total) }}
                        </span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </v-card-text>
        <template v-if="rootExists">
            <v-divider class="mb-3" />
            <v-data-table
                :value="selected"
                :items="items"
                class="file-browser__table"
                :headers="headers"
                :page.sync="page"
                :custom-sort="sortFiles"
                :sort-by="sortBy"
                :sort-desc="sortDesc"
                :items-per-page="itemsPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Files.Files'),
                    itemsPerPageAllText: $t('Files.AllFiles'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                item-key="filename"
                :search="search ?? ''"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                show-select
                @input="updateSelected"
                @update:sort-by="updateSortBy"
                @update:sort-desc="updateSortDesc"
                @update:items-per-page="updateItemsPerPage">
                <template #no-data>
                    <div class="text-center">
                        <slot name="no-data">{{ $t('Files.Empty') }}</slot>
                    </div>
                </template>

                <template v-if="currentPath !== ''" #body.prepend>
                    <tr
                        :class="rowClasses(PARENT_DIRECTORY)"
                        @click="navigate(parentPath)"
                        @dragover.prevent="dropTarget = PARENT_DIRECTORY"
                        @dragleave="dropTarget = null"
                        @drop.prevent="onDrop($event, null)">
                        <td class="file-list__select-td pr-0">
                            <v-simple-checkbox v-ripple disabled class="pa-0 mr-0" />
                        </td>
                        <td class="px-0 text-center" style="width: 32px">
                            <v-icon>{{ mdiFolderUpload }}</v-icon>
                        </td>
                        <td :colspan="headers.length">..</td>
                    </tr>
                </template>

                <template #item="{ item, isSelected, select }">
                    <tr
                        :key="item.filename"
                        v-longpress:600="{ handler: openContextMenu, args: [item] }"
                        :class="rowClasses(item.filename)"
                        draggable="true"
                        @click="clickRow(item)"
                        @contextmenu="openContextMenu($event, item)"
                        @dragstart="onDragStart($event, item)"
                        @dragover="onDragOver($event, item)"
                        @dragleave="dropTarget = null"
                        @drop="onDrop($event, item)">
                        <td class="file-list__select-td pr-0">
                            <v-simple-checkbox
                                v-ripple
                                :value="isSelected"
                                class="pa-0 mr-0"
                                @click.stop="select(!isSelected)" />
                        </td>
                        <td class="px-0 text-center" style="width: 32px">
                            <slot name="item.icon" :item="item">
                                <v-icon>{{ item.isDirectory ? mdiFolder : mdiFile }}</v-icon>
                            </slot>
                        </td>
                        <td>{{ item.filename }}</td>
                        <slot name="item.columns" :item="item">
                            <td class="text-no-wrap text-right">
                                {{ item.isDirectory ? '--' : formatFilesize(item.size) }}
                            </td>
                            <td class="text-no-wrap text-right">{{ formatDateTime(item.modified.getTime()) }}</td>
                        </slot>
                    </tr>
                </template>
            </v-data-table>
        </template>
        <slot v-else name="root-missing" />

        <v-menu v-model="contextMenu.show" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list v-if="contextMenu.item">
                <template v-if="!contextMenu.item.isDirectory">
                    <slot name="context-menu" :item="contextMenu.item" />
                    <v-list-item @click="downloadFile(contextMenu.item)">
                        <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                        {{ $t('Files.Download') }}
                    </v-list-item>
                </template>
                <v-list-item v-if="canWrite(contextMenu.item)" @click="openNameDialog('rename', contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item
                    v-if="canDuplicate && isWritable && !contextMenu.item.isDirectory"
                    @click="openNameDialog('duplicate', contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiContentCopy }}</v-icon>
                    {{ $t('Files.Duplicate') }}
                </v-list-item>
                <v-list-item
                    v-if="canWrite(contextMenu.item)"
                    class="red--text"
                    @click="openDeleteDialog([contextMenu.item])">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>

        <files-name-dialog
            v-model="nameDialog.show"
            :mode="nameDialog.mode"
            :directory="directoryPath"
            :item="nameDialog.item"
            :keep-extension="keepExtension"
            :related-files="relatedFiles" />
        <files-delete-dialog
            v-model="deleteDialog.show"
            :directory="directoryPath"
            :items="deleteDialog.items"
            :related-files="relatedFiles"
            @deleted="onDeleted" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import type { LongpressEvent } from '@/directives/longpress'
import BaseMixin from '@/components/mixins/base'
import FilesDeleteDialog from '@/components/dialogs/files/FilesDeleteDialog.vue'
import FilesNameDialog from '@/components/dialogs/files/FilesNameDialog.vue'
import PathNavigation from '@/components/ui/PathNavigation.vue'
import { escapePath, formatFilesize, generateTimestamp, sortFiles } from '@/plugins/helpers'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import { getUploadLoadingName, joinPath, normalizePath, splitPath } from '@/store/files/helpers'
import { FileStateDirectoryListing, FileStateFile, FileUploadItem } from '@/store/files/types'
import type { FileBrowserColumn, FileRelatedFilesGetter, FilesNameDialogMode } from '@/components/files/types'
import {
    mdiCloudDownload,
    mdiContentCopy,
    mdiDelete,
    mdiFile,
    mdiFilePlus,
    mdiFolder,
    mdiFolderPlus,
    mdiFolderUpload,
    mdiMagnify,
    mdiRefresh,
    mdiRenameBox,
    mdiUpload,
} from '@mdi/js'

/** Drop target name of the row to the parent directory */
const PARENT_DIRECTORY = '..'
const DRAG_DATA_TYPE = 'filename'

/**
 * File browser for a root of Moonraker's file manager. It shows the toolbar, the current path, the
 * table of the current directory and handles all common file operations: navigation, upload, download,
 * create, rename, duplicate, delete and moving files by drag & drop.
 *
 * Panels provide the items, so they can add metadata and filter them, and can extend the browser with slots.
 */
@Component({
    components: { FilesDeleteDialog, FilesNameDialog, PathNavigation },
})
export default class FileBrowser extends Mixins(BaseMixin) {
    mdiCloudDownload = mdiCloudDownload
    mdiContentCopy = mdiContentCopy
    mdiDelete = mdiDelete
    mdiFile = mdiFile
    mdiFilePlus = mdiFilePlus
    mdiFolder = mdiFolder
    mdiFolderPlus = mdiFolderPlus
    mdiFolderUpload = mdiFolderUpload
    mdiMagnify = mdiMagnify
    mdiRefresh = mdiRefresh
    mdiRenameBox = mdiRenameBox
    mdiUpload = mdiUpload

    PARENT_DIRECTORY = PARENT_DIRECTORY
    formatFilesize = formatFilesize
    sortFiles = sortFiles

    @Prop({ type: String, required: true }) readonly root!: string
    /** Current directory relative to the root (.sync) */
    @Prop({ type: String, default: '' }) readonly path!: string
    /** Items of the current directory, the panel can filter them or add metadata */
    @Prop({ type: Array, required: true }) readonly items!: FileStateFile[]
    /** Selected items (.sync) */
    @Prop({ type: Array, default: () => [] }) readonly selected!: FileStateFile[]
    /** Columns after the name column. Default: size and last modified */
    @Prop({ type: Array, default: null }) readonly columns!: FileBrowserColumn[] | null
    @Prop({ type: String, default: 'filename' }) readonly sortBy!: string
    @Prop({ type: Boolean, default: false }) readonly sortDesc!: boolean
    @Prop({ type: Number, default: 10 }) readonly itemsPerPage!: number
    /** Search term (.sync). The search field is hidden with null */
    @Prop({ type: String, default: null }) readonly search!: string | null
    /** Accepted file types of the upload. The upload is hidden with null, an empty list accepts all files */
    @Prop({ type: Array, default: null }) readonly uploadAccept!: string[] | null
    @Prop({ type: Boolean, default: false }) readonly canCreateFile!: boolean
    @Prop({ type: Boolean, default: true }) readonly canDuplicate!: boolean
    /** Only the name before the extension can be changed when renaming a file */
    @Prop({ type: Boolean, default: false }) readonly keepExtension!: boolean
    /** Files that are renamed, deleted and downloaded together with a file */
    @Prop({ type: Function, default: null }) readonly relatedFiles!: FileRelatedFilesGetter | null
    /** Writable root in which the zip archives of downloads are created */
    @Prop({ type: String, default: 'config' }) readonly zipRoot!: string
    @Ref() readonly fileUpload!: HTMLInputElement

    page = 1
    isDownloadingZip = false
    dropTarget: string | null = null
    contextMenu: { show: boolean; x: number; y: number; item: FileStateFile | null } = {
        show: false,
        x: 0,
        y: 0,
        item: null,
    }
    nameDialog: { show: boolean; mode: FilesNameDialogMode; item: FileStateFile | null } = {
        show: false,
        mode: 'createDirectory',
        item: null,
    }
    deleteDialog: { show: boolean; items: FileStateFile[] } = { show: false, items: [] }

    get rootExists(): boolean {
        const registeredDirectories: string[] = this.$store.state.server.registered_directories ?? []

        return registeredDirectories.includes(this.root)
    }

    get currentPath() {
        return normalizePath(this.path)
    }

    get parentPath() {
        return splitPath(this.currentPath).dir
    }

    /** Current directory including the root */
    get directoryPath() {
        return joinPath(this.root, this.currentPath)
    }

    get navigationPath() {
        return this.currentPath ? `/${this.currentPath}` : ''
    }

    get directory(): FileStateDirectoryListing | null {
        return this.$store.getters['files/getDirectory'](this.directoryPath)
    }

    get diskUsage() {
        return this.directory?.disk_usage ?? null
    }

    get isWritable() {
        return this.directory?.permissions.includes('w') ?? false
    }

    get isUploading() {
        return this.loadings.includes(getUploadLoadingName(this.root))
    }

    get headers() {
        const columns: FileBrowserColumn[] = this.columns ?? [
            { text: this.$t('Files.Filesize').toString(), value: 'size', align: 'end' },
            { text: this.$t('Files.LastModified').toString(), value: 'modified', align: 'end' },
        ]

        return [
            { text: '', value: '', sortable: false },
            { text: this.$t('Files.Name').toString(), value: 'filename' },
            ...columns,
        ]
    }

    /** The directory is loaded when it is opened, as soon as the root is registered */
    get directoryToLoad(): string | null {
        return this.rootExists ? this.directoryPath : null
    }

    @Watch('directoryToLoad', { immediate: true })
    directoryToLoadChanged(path: string | null) {
        if (path === null) return

        this.$store.dispatch('files/openDirectory', path)
    }

    mounted() {
        EventBus.$on(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    }

    beforeDestroy() {
        EventBus.$off(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    }

    updateSearch(value: string | null) {
        this.$emit('update:search', value ?? '')
    }

    updateSelected(value: FileStateFile[]) {
        this.$emit('update:selected', value)
    }

    updateSortBy(value: string | string[] | undefined) {
        const sortBy = Array.isArray(value) ? value[0] : value
        this.$emit('update:sortBy', sortBy ?? 'filename')
    }

    updateSortDesc(value: boolean | boolean[] | undefined) {
        const sortDesc = Array.isArray(value) ? value[0] : value
        this.$emit('update:sortDesc', sortDesc ?? false)
    }

    updateItemsPerPage(value: number) {
        this.$emit('update:itemsPerPage', value)
    }

    navigate(path: string) {
        // the selection only belongs to the current directory
        this.updateSelected([])
        this.page = 1
        this.$emit('update:path', normalizePath(path))
    }

    clickPathSegment(segment: { location: string }) {
        this.navigate(segment.location)
    }

    clickRow(item: FileStateFile) {
        if (item.isDirectory) {
            this.navigate(joinPath(this.currentPath, item.filename))
            return
        }

        this.$emit('click:file', item)
    }

    refresh() {
        this.$store.dispatch('files/reloadDirectory', this.directoryPath)
    }

    rowClasses(name: string) {
        return {
            'file-list-cursor': true,
            'user-select-none': true,
            'file-browser__drop-target': this.dropTarget === name,
        }
    }

    canWrite(item: FileStateFile) {
        return item.permissions.includes('w')
    }

    openContextMenu(e: MouseEvent | LongpressEvent, item: FileStateFile) {
        e?.preventDefault()
        EventBus.$emit(CLOSE_CONTEXT_MENU)

        this.contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
        this.contextMenu.item = item
        this.contextMenu.show = true
    }

    closeContextMenu() {
        this.contextMenu.show = false
    }

    openNameDialog(mode: FilesNameDialogMode, item: FileStateFile | null = null) {
        this.nameDialog.mode = mode
        this.nameDialog.item = item
        this.nameDialog.show = true
    }

    openDeleteDialog(items: FileStateFile[]) {
        this.deleteDialog.items = [...items]
        this.deleteDialog.show = true
    }

    onDeleted(deleted: FileStateFile[]) {
        const names = deleted.map((item) => item.filename)
        this.updateSelected(this.selected.filter((item) => !names.includes(item.filename)))
    }

    getRelatedFiles(filename: string): string[] {
        if (!this.relatedFiles) return []

        return this.relatedFiles(filename).filter((related) =>
            this.$store.getters['files/pathExists'](joinPath(this.directoryPath, related))
        )
    }

    downloadFile(item: FileStateFile) {
        window.open(`${this.apiUrl}/server/files/${escapePath(joinPath(this.directoryPath, item.filename))}`)
    }

    async downloadSelected() {
        if (this.selected.length === 1 && !this.selected[0].isDirectory) {
            this.downloadFile(this.selected[0])
            this.updateSelected([])
            return
        }

        const toPath = (name: string) => joinPath(this.directoryPath, name)
        const directories = this.selected.filter((item) => item.isDirectory).map((item) => item.filename)
        const files = this.selected
            .filter((item) => !item.isDirectory)
            .flatMap((item) => [item.filename, ...this.getRelatedFiles(item.filename)])

        this.isDownloadingZip = true
        await this.$store.dispatch('files/downloadZip', {
            files: [...new Set(files)].map(toPath),
            directories: directories.map(toPath),
            dest: `${this.zipRoot}/${this.root}-${generateTimestamp()}.zip`,
        })
        this.isDownloadingZip = false

        this.updateSelected([])
    }

    async uploadFiles() {
        const files: FileUploadItem[] = [...(this.fileUpload.files ?? [])].map((file) => ({
            file,
            root: this.root,
            path: this.currentPath,
        }))
        this.fileUpload.value = ''

        await this.$store.dispatch('files/uploadFiles', { files, loading: getUploadLoadingName(this.root) })
    }

    onDragStart(e: DragEvent, item: FileStateFile) {
        e.dataTransfer?.setData(DRAG_DATA_TYPE, item.filename)
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
    }

    onDragOver(e: DragEvent, item: FileStateFile) {
        // only directories accept dropped files
        if (!item.isDirectory) return

        e.preventDefault()
        this.dropTarget = item.filename
    }

    /**
     * Moves the dragged file into a directory, or into the parent directory without a target.
     * Related files are moved along, e.g. the thumbnail of a timelapse video.
     */
    async onDrop(e: DragEvent, target: FileStateFile | null) {
        e.preventDefault()
        this.dropTarget = null

        const filename = e.dataTransfer?.getData(DRAG_DATA_TYPE)
        if (!filename || filename === target?.filename) return

        const sourceDirectory = this.directoryPath
        const destDirectory = target ? joinPath(sourceDirectory, target.filename) : joinPath(this.root, this.parentPath)
        // read before the move, because the store removes the file afterwards
        const isFile = this.$store.getters['files/getFile'](joinPath(sourceDirectory, filename)) !== null
        const relatedFiles = isFile ? this.getRelatedFiles(filename) : []

        const success = await this.$store.dispatch('files/move', {
            source: joinPath(sourceDirectory, filename),
            dest: joinPath(destDirectory, filename),
        })
        if (!success) return

        await Promise.all(
            relatedFiles.map((related) =>
                this.$store.dispatch('files/move', {
                    source: joinPath(sourceDirectory, related),
                    dest: joinPath(destDirectory, related),
                    silent: true,
                })
            )
        )
    }

    advancedSearch(value: unknown, search: string | null) {
        if (search === null || typeof value !== 'string') return false

        const lowerValue = value.toLowerCase()
        return search
            .toLowerCase()
            .split(' ')
            .every((word) => lowerValue.includes(word))
    }
}
</script>

<style scoped>
.file-browser__search {
    max-width: 300px;
}

.file-browser__table ::v-deep .v-data-table-header__icon {
    margin-left: 7px;
}

.file-browser__table ::v-deep .v-data-table-header th {
    white-space: nowrap;
}

.file-browser__table ::v-deep .v-data-table-header th:first-child {
    padding-right: 0;
}

.file-browser__table ::v-deep .file-list-cursor:hover {
    cursor: pointer;
}

.file-browser__drop-target {
    background-color: #43a04720;
}
</style>
