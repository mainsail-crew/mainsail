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
                            :title="$t('Buttons.Delete')"
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
                            <b class="mr-1">{{ $t('Timelapse.CurrentPath') }}:</b>
                            <path-navigation
                                :path="currentPathForNavigation"
                                :base-directory-label="`/${rootDirectory}`"
                                :on-segment-click="clickPathNavGoToDirectory" />
                        </span>
                        <v-spacer></v-spacer>
                        <template v-if="disk_usage !== null">
                            <v-tooltip top>
                                <template #activator="{ props }">
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
                :sort-by="sortBy"
                @update:sort-by="setSortBy"
                :sort-desc="sortDesc"
                @update:sort-desc="setSortDesc"
                :items-per-page="countPerPage"
                @update:items-per-page="setCountPerPage"
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
                <template #items>
                    <td v-for="header in headers" :key="header.value">{{ header.text }}</td>
                </template>

                <template #no-data>
                    <div class="text-center font-italic">{{ $t('Timelapse.Empty') }}</div>
                </template>

                <template v-if="currentPath !== rootDirectory" #body.prepend>
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
                        v-longpress:600="{ handler: showContextMenu, args: [item] }"
                        class="file-list-cursor user-select-none"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)">
                        <td class="file-list__select-td pr-0">
                            <v-checkbox
                                v-ripple
                                :model-value="isSelected"
                                density="compact"
                                hide-details
                                class="pa-0 mr-0"
                                @click.stop="select(!isSelected)"></v-checkbox>
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
                                    location="top"
                                    content-class="tooltip__content-opacity1">
                                    <template #activator="{ props }">
                                        <vue-load-image>
                                            <template #image>
                                                <img
                                                    :src="getThumbnail(item)"
                                                    :alt="item.filename"
                                                    width="32"
                                                    v-bind="props" />
                                            </template>
                                            <template #preloader>
                                                <v-progress-circular indeterminate color="primary" />
                                            </template>
                                            <template #error>
                                                <v-icon>{{ mdiFile }}</v-icon>
                                            </template>
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
                    class="text-error"
                    @click="deleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    class="text-error"
                    @click="deleteDirectory(contextMenu.item)">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <panel
                :title="$t('Timelapse.RenameFile')"
                card-class="gcode-files-rename-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" tile @click="dialogRenameFile.show = false" />
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
                    <v-btn color="" variant="text" @click="dialogRenameFile.show = false">{{ $t('Buttons.Cancel') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameFileAction">
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
                    <v-btn :icon="mdiCloseThick" tile @click="dialogCreateDirectory.show = false" />
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
                    <v-btn color="" variant="text" @click="dialogCreateDirectory.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="createDirectoryAction">
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
                    <v-btn :icon="mdiCloseThick" tile @click="dialogRenameDirectory.show = false" />
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
                    <v-btn color="" variant="text" @click="dialogRenameDirectory.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameDirectoryAction">
                        {{ $t('Timelapse.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <confirmation-dialog
            v-model="dialogDeleteDirectory.show"
            :title="$t('Timelapse.DeleteDirectory')"
            :text="$t('Timelapse.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteDirectoryAction" />
        <v-dialog v-model="boolVideoDialog" :max-width="700">
            <panel
                :title="$t('Timelapse.Video')"
                :icon="mdiFileVideo"
                card-class="timelapse-video-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" tile @click="boolVideoDialog = false" />
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
                                    variant="text"
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
        <confirmation-dialog
            v-model="deleteDialog"
            :title="$t('Timelapse.Delete')"
            :text="$t('Timelapse.DeleteSingleFileQuestion', { name: contextMenu.item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="removeFile" />

        <!-- CONFIRM DELETE MULTIPLE FILES DIALOG -->
        <confirmation-dialog
            v-model="deleteSelectedDialog"
            :title="$t('Timelapse.Delete')"
            :text="deleteSelectedDialogText"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteSelectedFiles" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import type { LongpressEvent } from '@/directives/longpress'
import { escapePath, formatFilesize, sortFiles } from '@/plugins/helpers'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import PathNavigation from '@/components/ui/PathNavigation.vue'
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
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import type { FocusableRef } from '@/types/vuetify'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

const { loadings, apiUrl, formatDateTime } = useBase()
const store = useStore()
const socket = useSocket()

const inputFieldRenameFile = ref<FocusableRef | undefined>()
const inputFieldCreateDirectory = ref<FocusableRef | undefined>()
const inputFieldRenameDirectory = ref<FocusableRef | undefined>()

const search = ref('')
const boolVideoDialog = ref(false)
const videoDialogFilename = ref('')

const dialogCreateDirectory = reactive({
    show: false,
    name: '',
})

const contextMenu = reactive({
    shown: false,
    isDirectory: false,
    x: 0,
    y: 0,
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const dialogRenameFile = reactive<dialogRenameObject>({
    show: false,
    newName: '',
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const dialogRenameDirectory = reactive<dialogRenameObject>({
    show: false,
    newName: '',
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const dialogDeleteDirectory = reactive<dialogRenameObject>({
    show: false,
    newName: '',
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const deleteDialog = ref(false)
const deleteSelectedDialog = ref(false)

const isInvalidName = ref(true)
const nameInputRules = [
    (value: string) => !!value || 'Invalid name - cannot be empty',
    (value: string) => !existsFilename(value) || 'Invalid name - already exists',
]

const rootDirectory = 'timelapse'

function existsFilename(name: string) {
    return files.value.findIndex((file) => file.filename === name) >= 0
}

const headers = computed(() => [
    { text: '', value: '', align: 'left', configable: false, visible: true, sortable: false },
    { text: 'Name', value: 'filename', align: 'left', configable: false, visible: true },
    { text: 'Filesize', value: 'size', align: 'right', configable: true, visible: true },
    {
        text: 'Last Modified',
        value: 'modified',
        align: 'right',
        configable: true,
        visible: true,
    },
])

const directory = computed(() => store.getters['files/getDirectory'](currentPath.value))

const disk_usage = computed(() => directory.value?.disk_usage ?? { used: 0, free: 0, total: 0 })

const directoryPermissions = computed(() => directory.value?.permissions ?? 'r')

const files = computed(() => [...(directory.value?.childrens ?? [])])

const sortBy = computed(() => store.state.gui.view.timelapse.sortBy ?? 'modified')

function setSortBy(newVal: string) {
    if (newVal === undefined) newVal = 'modified'
    store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortBy', value: newVal })
}

const sortDesc = computed(() => store.state.gui.view.timelapse.sortDesc ?? true)

function setSortDesc(newVal: boolean) {
    if (newVal === undefined) newVal = false
    store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortDesc', value: newVal })
}

const countPerPage = computed(() => store.state.gui.view.timelapse?.countPerPage ?? 10)

function setCountPerPage(newVal: number) {
    store.dispatch('gui/saveSetting', { name: 'view.timelapse.countPerPage', value: newVal })
}

const displayFiles = computed(() =>
    files.value?.filter((file) => {
        if (file.isDirectory) return true
        return file.filename.endsWith('mp4') || file.filename.endsWith('zip')
    }) ?? []
)

const currentPath = computed(() => store.state.gui.view.timelapse.currentPath)

const currentPathForNavigation = computed(() => {
    if (currentPath.value === rootDirectory) return ''
    return currentPath.value.substring(rootDirectory.length)
})

function setCurrentPath(newVal: string) {
    store.dispatch('gui/saveSetting', { name: 'view.timelapse.currentPath', value: newVal })
}

const selectedFiles = computed(() => store.state.gui.view.timelapse.selectedFiles ?? [])

const deleteSelectedDialogText = computed(() => {
    if (selectedFiles.value.length === 1) {
        return `Delete single file: ${selectedFiles.value[0].filename}`
    }
    return `Delete ${selectedFiles.value.length} selected files?`
})

function createDirectory() {
    dialogCreateDirectory.name = ''
    dialogCreateDirectory.show = true
    setTimeout(() => {
        inputFieldCreateDirectory.value?.focus()
    }, 200)
}

function createDirectoryAction() {
    dialogCreateDirectory.show = false
    socket.emit(
        'server.files.post_directory',
        {
            path: currentPath.value + '/' + dialogCreateDirectory.name,
        },
        { action: 'files/getCreateDir' }
    )
}

function refreshFileList() {
    socket.emit('server.files.get_directory', { path: currentPath.value }, { action: 'files/getDirectory' })
}

function advancedSearch(value: string | number, searchText: string) {
    return (
        value != null &&
        searchText != null &&
        typeof value === 'string' &&
        value.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1
    )
}

function getThumbnail(item: FileStateFile) {
    const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
    const preview = files.value?.find((file) => file.filename === filename + '.jpg')
    if (preview) {
        return `${apiUrl.value}/server/files/${escapePath(currentPath.value)}/${escapePath(
            preview.filename
        )}?timestamp=${preview.modified.getTime()}`
    }
    return ''
}

function clickRow(item: FileStateFile, force = false) {
    if (!contextMenu.shown || force) {
        if (force) contextMenu.shown = false
        if (item.isDirectory) {
            const newPath = currentPath.value + '/' + item.filename
            setCurrentPath(newPath)
            store.dispatch('gui/saveSetting', { name: 'view.timelapse.currentPath', value: newPath })
        } else if (item.filename.endsWith('zip')) {
            downloadFile(item.filename)
        } else if (item.filename.endsWith('mp4')) {
            videoDialogFilename.value = escapePath(`${currentPath.value}/${item.filename}`)
            boolVideoDialog.value = true
        }
    }
}

function clickRowGoBack() {
    const newPath = currentPath.value.slice(0, currentPath.value.lastIndexOf('/'))
    setCurrentPath(newPath)
    store.dispatch('gui/saveSetting', { name: 'view.timelapse.currentPath', value: newPath })
}

function clickPathNavGoToDirectory(segment: { location: string }) {
    const newPath = `${rootDirectory}${segment.location}`
    setCurrentPath(newPath)
    store.dispatch('gui/saveSetting', { name: 'view.timelapse.currentPath', value: newPath })
}

function showContextMenu(e: MouseEvent | LongpressEvent, item: FileStateFile) {
    if (!contextMenu.shown) {
        e?.preventDefault()
        contextMenu.shown = true
        contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
        contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
        contextMenu.item = item
        nextTick(() => {
            contextMenu.shown = true
        })
    }
}

function existsFramesZip(item: FileStateFile) {
    const posLastPoint = item.filename.lastIndexOf('.')
    const zipFilename = item.filename.slice(0, posLastPoint) + '.zip'
    return files.value.findIndex((file) => file.filename === zipFilename) !== -1
}

function downloadFile(filename: string) {
    const path = currentPath.value + '/' + filename
    const href = apiUrl.value + '/server/files/' + escapePath(path)
    window.open(href)
}

async function downloadSelectedFiles() {
    const items: string[] = []

    const addElementToItems = async (absolutPath: string, directoryArr: FileStateFile[]) => {
        for (const file of directoryArr) {
            const filePath = `${absolutPath}/${file.filename}`
            if (file.isDirectory && file.childrens) {
                await addElementToItems(filePath, file.childrens)
                continue
            }
            items.push(filePath)
            if (file.filename.endsWith('.mp4')) {
                const indexLastPoint = file.filename.lastIndexOf('.')
                const filenameWithoutExtension = file.filename.slice(0, indexLastPoint)
                const filenameJpg = `${filenameWithoutExtension}.jpg`
                if (files.value.some((f: FileStateFile) => f.filename === filenameJpg)) {
                    items.push(`${absolutPath}/${filenameJpg}`)
                }
            }
        }
    }

    await addElementToItems(currentPath.value, selectedFiles.value)
    const date = new Date()
    const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`

    socket.emit(
        'server.files.zip',
        { items, dest: `timelapse/timelapse-${timestamp}.zip` },
        { action: 'files/downloadZip', loading: 'timelapseDownloadZip' }
    )

    store.dispatch('gui/saveSetting', { name: 'view.timelapse.selectedFiles', value: [] })
}

function renameFile(item: FileStateFile) {
    const posLastPoint = item.filename.lastIndexOf('.')
    dialogRenameFile.newName = item.filename.slice(0, posLastPoint)
    dialogRenameFile.item = item
    dialogRenameFile.show = true
    setTimeout(() => {
        inputFieldRenameFile.value?.focus()
    }, 200)
}

function renameFileAction() {
    const posLastPoint = dialogRenameFile.item.filename.lastIndexOf('.')
    const oldNameWithoutExtension = dialogRenameFile.item.filename.slice(0, posLastPoint)
    const fileExtension = dialogRenameFile.item.filename.split('.').pop()

    dialogRenameFile.show = false

    socket.emit(
        'server.files.move',
        {
            source: `${currentPath.value}/${dialogRenameFile.item.filename}`,
            dest: `${currentPath.value}/${dialogRenameFile.newName}.${fileExtension}`,
        },
        { action: 'files/getMove' }
    )

    if (fileExtension !== 'mp4') return

    const fileJpg = files.value.find((file) => file.filename === `${oldNameWithoutExtension}.jpg`)

    if (fileJpg) {
        socket.emit('server.files.move', {
            source: `${currentPath.value}/${oldNameWithoutExtension}.jpg`,
            dest: `${currentPath.value}/${dialogRenameFile.newName}.jpg`,
        })
    }
}

function renameDirectory(item: FileStateFile) {
    dialogRenameDirectory.item = item
    dialogRenameDirectory.newName = item.filename
    dialogRenameDirectory.show = true
    setTimeout(() => {
        inputFieldRenameDirectory.value?.focus()
    }, 200)
}

function renameDirectoryAction() {
    dialogRenameDirectory.show = false
    socket.emit(
        'server.files.move',
        {
            source: currentPath.value + '/' + dialogRenameDirectory.item.filename,
            dest: currentPath.value + '/' + dialogRenameDirectory.newName,
        },
        { action: 'files/getMove' }
    )
}

function removeFile() {
    const filename = contextMenu.item.filename.slice(0, contextMenu.item.filename.lastIndexOf('.'))
    const fileExtension = contextMenu.item.filename.split('.').pop()

    socket.emit(
        'server.files.delete_file',
        { path: currentPath.value + '/' + contextMenu.item.filename },
        { action: 'files/getDeleteFile' }
    )

    if (fileExtension !== 'mp4') return

    const previewFilename = filename + '.jpg'
    const previewExists = files.value.findIndex((file) => file.filename === previewFilename) !== -1

    if (previewExists)
        socket.emit(
            'server.files.delete_file',
            { path: currentPath.value + '/' + previewFilename },
            { action: 'files/getDeleteFile' }
        )
}

function deleteDirectory(item: FileStateFile) {
    dialogDeleteDirectory.item = item
    dialogDeleteDirectory.show = true
}

function deleteDirectoryAction() {
    socket.emit(
        'server.files.delete_directory',
        { path: currentPath.value + '/' + contextMenu.item.filename, force: true },
        { action: 'files/getDeleteDir' }
    )
}

function deleteSelectedFiles() {
    selectedFiles.value.forEach((item: FileStateGcodefile) => {
        if (item.isDirectory) {
            socket.emit(
                'server.files.delete_directory',
                { path: currentPath.value + '/' + item.filename, force: true },
                { action: 'files/getDeleteDir' }
            )
        } else {
            const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
            const fileExtension = item.filename.split('.').pop()

            socket.emit(
                'server.files.delete_file',
                { path: currentPath.value + '/' + item.filename },
                { action: 'files/getDeleteFile' }
            )

            if (fileExtension !== 'mp4') return

            const previewFilename = filename + '.jpg'
            const previewExists = files.value.findIndex((file) => file.filename === previewFilename) !== -1

            if (previewExists)
                socket.emit(
                    'server.files.delete_file',
                    { path: currentPath.value + '/' + previewFilename },
                    { action: 'files/getDeleteFile' }
                )
        }
    })

    store.dispatch('gui/saveSetting', { name: 'view.timelapse.selectedFiles', value: [] })
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
