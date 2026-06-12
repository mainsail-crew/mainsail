<template>
    <div>
        <panel
            :title="$t('Machine.ConfigFilesPanel.ConfigFiles')"
            card-class="machine-configfiles-panel"
            :icon="mdiInformation"
            :collapsible="true">
            <v-card-text>
                <v-row>
                    <v-col class="v-col-12 v-col-lg pr-lg-0">
                        <v-select
                            v-model="root"
                            class="machine-configfiles-panel__root-select"
                            :items="registeredDirectoriesSelectItems"
                            :label="$t('Machine.ConfigFilesPanel.Root')"
                            variant="outlined"
                            hide-details
                            density="compact"
                            attach=".machine-configfiles-panel__root-select"
                            @change="changeRoot" />
                    </v-col>
                    <v-col class="v-col v-col-lg-auto pl-lg-0 text-right">
                        <input ref="fileUpload" type="file" style="display: none" multiple @change="uploadFile" />
                        <v-btn
                            v-for="button in filteredToolbarButtons"
                            :key="button.loadingName"
                            class="machine-configfiles-panel__tool-btn ml-3"
                            :color="button.color"
                            variant="text"
                            density="comfortable"
                            :loading="button.loadingName !== null && loadings.includes(button.loadingName)"
                            @click="button.click">
                            <v-tooltip top>
                                <template #activator="{ props: activatorProps }">
                                    <v-icon v-bind="activatorProps">{{ button.icon }}</v-icon>
                                </template>
                                <span>{{ button.text }}</span>
                            </v-tooltip>
                        </v-btn>
                        <v-menu offset-y left :title="$t('Machine.ConfigFilesPanel.SetupCurrentList')">
                            <template #activator="{ props: activatorProps }">
                                <v-btn class="machine-configfiles-panel__tool-btn ml-3" variant="text" density="comfortable" v-bind="activatorProps">
                                    <v-icon class="machine-configfiles-panel__settings-icon">{{ mdiCog }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item class="minHeight36">
                                    <v-checkbox
                                        v-model="showHiddenFiles"
                                        class="mt-0"
                                        hide-details
                                        :label="$t('Machine.ConfigFilesPanel.HiddenFiles')" />
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox
                                        v-model="hideBackupFiles"
                                        class="mt-0"
                                        hide-details
                                        :label="$t('Machine.ConfigFilesPanel.HideBackupFiles')" />
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="v-col-12 py-2 d-flex align-center flex-wrap">
                        <span class="d-flex align-center flex-wrap">
                            <b class="mr-1">{{ $t('Machine.ConfigFilesPanel.CurrentPath') }}:</b>
                            <path-navigation
                                :path="currentPath"
                                :base-directory-label="`/${root}`"
                                :on-segment-click="clickPathNavGoToDirectory" />
                        </span>
                        <v-spacer />
                        <template v-if="disk_usage !== null && !showMissingConfigRootWarning">
                            <v-tooltip top>
                                <template #activator="{ props: activatorProps }">
                                    <span v-bind="activatorProps">
                                        <b>{{ $t('Machine.ConfigFilesPanel.FreeDisk') }}:</b>
                                        {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Machine.ConfigFilesPanel.Used') }}: {{ formatFilesize(disk_usage.used) }}
                                    <br />
                                    {{ $t('Machine.ConfigFilesPanel.Free') }}: {{ formatFilesize(disk_usage.free) }}
                                    <br />
                                    {{ $t('Machine.ConfigFilesPanel.Total') }}:
                                    {{ formatFilesize(disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
                <v-data-table
                    v-if="!showMissingConfigRootWarning"
                    v-model="selectedFiles"
                    :items="sortedFiles"
                    class="files-table"
                    :headers="headers"
                    v-model:page="currentPage"
                    disable-sort
                    v-model:items-per-page="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Machine.ConfigFilesPanel.Files'),
                    itemsPerPageAllText: $t('Machine.ConfigFilesPanel.AllFiles'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                mobile-breakpoint="0"
                    item-key="filename">
                <template #no-data>
                    <div class="text-center">{{ $t('Machine.ConfigFilesPanel.Empty') }}</div>
                </template>

                <template v-if="currentPath !== ''" v-slot:body.prepend>
                    <tr
                        class="file-list-cursor"
                        @click="clickRowGoBack"
                        @dragover="dragOverFilelist($event, { isDirectory: true, filename: '..' })"
                        @dragleave="dragLeaveFilelist"
                        @drop.prevent.stop="dragDropFilelist($event, { isDirectory: true, filename: '..' })">
                        <td class="px-0 text-center" style="width: 32px">
                            <v-icon>{{ mdiFolderUpload }}</v-icon>
                        </td>
                        <td class=" " colspan="3">..</td>
                    </tr>
                </template>

                <template #item="{ index, item }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="{ handler: showContextMenu, args: [item] }"
                        class="file-list-cursor user-select-none"
                        :data-name="item.filename"
                        draggable="true"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)"
                        @drag="dragFile($event, item)"
                        @dragend="dragendFile($event)"
                        @dragover="dragOverFilelist($event, item)"
                        @dragleave="dragLeaveFilelist"
                        @drop.prevent.stop="dragDropFilelist($event, item)">
                        <td class="px-0 text-center" style="width: 32px">
                            <v-icon v-if="item.isDirectory">{{ mdiFolder }}</v-icon>
                            <v-icon v-if="!item.isDirectory">{{ mdiFile }}</v-icon>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-no-wrap text-right">
                            {{ item.isDirectory ? '--' : formatFilesize(item.size) }}
                        </td>
                        <td class="text-right">{{ formatDateTime(item.modified) }}</td>
                    </tr>
                </template>
            </v-data-table>
            <v-card-text v-else>
                <v-row>
                    <v-col class="v-col-12 v-col-lg pr-lg-0">
                        <v-alert
                            dense
                            text
                            type="warning"
                            elevation="2"
                            class="mx-auto mt-6"
                            max-width="500"
                            :icon="mdiLockOutline">
                            {{ $t('Machine.ConfigFilesPanel.ConfigRootDirectoryDoesntExists') }}
                        </v-alert>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="clickRow(contextMenu.item, true)">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{
                        contextMenu.item.permissions.includes('w')
                            ? $t('Machine.ConfigFilesPanel.EditFile')
                            : $t('Machine.ConfigFilesPanel.ShowFile')
                    }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="downloadFile">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Machine.ConfigFilesPanel.Download') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    @click="renameFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Machine.ConfigFilesPanel.Rename') }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="duplicateFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiContentCopy }}</v-icon>
                    {{ $t('Machine.ConfigFilesPanel.Duplicate') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    @click="renameDirectory(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Machine.ConfigFilesPanel.Rename') }}
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
        <v-dialog
            v-model="dialogImage.show"
            hide-overlay
            fullscreen
            class="fill-height"
            @keydown.esc="closeDialogImage">
            <panel
                :title="dialogImage.item.name ?? ''"
                card-class="maschine-configfiles-imageviewer-dialog"
                style="position: relative">
                <template #buttons>
                    <v-btn
                        icon
                        rounded="0"
                        @click="closeDialogImage">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <div class="d-flex justify-center" style="max-height: calc(var(--app-height) - 64px); overflow: auto">
                    <img
                        v-if="dialogImage.item.url"
                        :src="dialogImage.item.url"
                        style="max-height: 100%; width: auto; max-width: 100%; object-fit: contain"
                        alt="image" />
                    <div v-else-if="dialogImage.item.svg" class="fill-width" v-html="dialogImage.item.svg" />
                </div>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateFile.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.CreateFile')"
                card-class="maschine-configfiles-create-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" rounded="0" @click="dialogCreateFile.show = false" />
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogCreateFileName"
                        v-model="dialogCreateFile.name"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="setIsInvalidName"
                        @keyup.enter="createFileAction" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" variant="text" @click="dialogCreateFile.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="createFileAction">
                        {{ $t('Machine.ConfigFilesPanel.Create') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.RenameFile')"
                card-class="maschine-configfiles-rename-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" rounded="0" @click="dialogRenameFile.show = false" />
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogRenameFileName"
                        v-model="dialogRenameFile.newName"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="setIsInvalidName"
                        @keyup.enter="renameFileAction" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" variant="text" @click="dialogRenameFile.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameFileAction">
                        {{ $t('Machine.ConfigFilesPanel.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDuplicateFile.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.DuplicateFile')"
                card-class="maschine-configfiles-duplicate-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" rounded="0" @click="dialogDuplicateFile.show = false" />
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogDuplicateFileName"
                        v-model="dialogDuplicateFile.newName"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="setIsInvalidName"
                        @keyup.enter="duplicateFileAction" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" variant="text" @click="dialogDuplicateFile.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="duplicateFileAction">
                        {{ $t('Machine.ConfigFilesPanel.Duplicate') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.CreateDirectory')"
                card-class="maschine-configfiles-create-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" rounded="0" @click="dialogCreateDirectory.show = false" />
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogCreateDirectoryName"
                        v-model="dialogCreateDirectory.name"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="setIsInvalidName"
                        @keyup.enter="createDirectoryAction" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" variant="text" @click="dialogCreateDirectory.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="createDirectoryAction">
                        {{ $t('Machine.ConfigFilesPanel.Create') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.RenameDirectory')"
                card-class="maschine-configfiles-rename-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" rounded="0" @click="dialogRenameDirectory.show = false" />
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogRenameDirectoryName"
                        v-model="dialogRenameDirectory.newName"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="setIsInvalidName"
                        @keyup.enter="renameDirectoryAction" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" variant="text" @click="dialogRenameDirectory.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameDirectoryAction">
                        {{ $t('Machine.ConfigFilesPanel.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <confirmation-dialog
            v-model="dialogDeleteDirectory.show"
            :title="$t('Machine.ConfigFilesPanel.DeleteDirectory')"
            :text="
                $t('Machine.ConfigFilesPanel.DeleteDirectoryQuestion', {
                    name: dialogDeleteDirectory.item.filename,
                })
            "
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteDirectoryAction" />
        <confirmation-dialog
            v-model="deleteDialog"
            :title="$t('Buttons.Delete')"
            :text="$t('Machine.ConfigFilesPanel.DeleteSingleFileQuestion', { name: contextMenu.item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="removeFile" />
        <confirmation-dialog
            v-model="deleteSelectedDialog"
            :title="$t('Buttons.Delete')"
            :text="deleteSelectedDialogText"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteSelectedFiles" />

        <v-snackbar v-model="uploadSnackbar.status" :timeout="-1" fixed right bottom>
            <span v-if="uploadSnackbar.max > 1" class="mr-1">
                ({{ uploadSnackbar.number }}/{{ uploadSnackbar.max }})
            </span>
            <strong>{{ $t('Machine.ConfigFilesPanel.Uploading') }} {{ uploadSnackbar.filename }}</strong>
            <br />
            {{ Math.round(uploadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(uploadSnackbar.speed)) }}/s
            <br />
            <v-progress-linear class="mt-2" :value="uploadSnackbar.percent" />
            <template #actions="{ props }">
                <v-btn color="red" variant="text" v-bind="props" style="min-width: auto" @click="cancelUpload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<style scoped>
.machine-configfiles-panel__tool-btn {
    min-width: 24px;
    width: 24px;
    height: 24px;
    padding: 0;
    box-shadow: none;
    background: transparent;
}

.machine-configfiles-panel__settings-icon {
    margin: 0;
}
</style>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import { useSocket } from '@/composables/useSocket'
import { useToast } from 'vue-toast-notification'
import { escapePath, formatFilesize, generateTimestamp, sortFiles } from '@/plugins/helpers'
import type { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import axios from 'axios'
import type { CancelTokenSource } from 'axios'
import Panel from '@/components/ui/Panel.vue'
import PathNavigation from '@/components/ui/PathNavigation.vue'
import { hiddenRootDirectories } from '@/store/variables'
import {
    mdiFilePlus,
    mdiFileUpload,
    mdiFolderPlus,
    mdiInformation,
    mdiRefresh,
    mdiClose,
    mdiCog,
    mdiFolder,
    mdiFolderUpload,
    mdiFile,
    mdiFileDocumentEditOutline,
    mdiCloudDownload,
    mdiRenameBox,
    mdiDelete,
    mdiCloseThick,
    mdiLockOutline,
    mdiContentCopy,
} from '@mdi/js'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import type { FocusableRef } from '@/types/vuetify'
import type { LongpressEvent } from '@/directives/longpress'

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
        name: string | null
        url: string | null
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
    cancelTokenSource: CancelTokenSource | null
}

interface draggingFile {
    item: FileStateFile
}

const store = useStore()
const { t } = useI18n()
const socket = useSocket()
const { apiUrl, isMobile, formatDateTime } = useBase()
const { machineButtonCol } = useTheme()
const toast = useToast()

const inputDialogCreateFileName = ref<FocusableRef | null>(null)
const inputDialogRenameFileName = ref<FocusableRef | null>(null)
const inputDialogDuplicateFileName = ref<FocusableRef | null>(null)
const inputDialogCreateDirectoryName = ref<FocusableRef | null>(null)
const inputDialogRenameDirectoryName = ref<FocusableRef | null>(null)
const fileUpload = ref<HTMLInputElement | null>(null)

const currentPage = ref(1)

const contextMenu = reactive<contextMenu>({
    shown: false,
    isDirectory: false,
    touchTimer: null,
    x: 0,
    y: 0,
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const dialogImage = reactive<dialogImageObject>({
    show: false,
    item: {
        name: null,
        url: null,
        svg: null,
    },
})

const dialogCreateFile = reactive({
    show: false,
    name: '',
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

const dialogDuplicateFile = reactive<dialogRenameObject>({
    show: false,
    newName: '',
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const dialogCreateDirectory = reactive({
    show: false,
    name: '',
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

const dialogDeleteDirectory = reactive<dialogDeleteObject>({
    show: false,
    item: {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    },
})

const uploadSnackbar = reactive<uploadSnackbar>({
    status: false,
    filename: '',
    percent: 0,
    speed: 0,
    total: 0,
    number: 0,
    max: 0,
    cancelTokenSource: null,
})

const draggingFile = reactive<draggingFile>({
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
    (value: string) => !!value || t('Files.InvalidNameEmpty'),
    (value: string) => !existsFilename(value) || t('Files.InvalidNameAlreadyExists'),
]

function existsFilename(name: string) {
    return files.value.findIndex((file) => file.filename === name) >= 0
}

const blockFileUpload = computed({
    get: () => store.state.gui.view.blockFileUpload ?? false,
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'view.blockFileUpload', value: newVal }),
})

const toolbarButtons = computed(() => [
    {
        text: t('Machine.ConfigFilesPanel.Download'),
        color: 'primary',
        icon: mdiCloudDownload,
        loadingName: 'configDownloadZip',
        onlyWriteable: false,
        condition: selectedFiles.value.length > 0,
        click: () => {
            downloadSelectedFiles()
        },
    },
    {
        text: t('Buttons.Delete'),
        color: 'error',
        icon: mdiDelete,
        loadingName: null,
        onlyWriteable: true,
        condition: selectedFiles.value.length > 0,
        click: () => {
            deleteSelectedDialog.value = true
        },
    },
    {
        text: t('Machine.ConfigFilesPanel.UploadFile'),
        color: machineButtonCol.value,
        icon: mdiFileUpload,
        loadingName: null,
        onlyWriteable: true,
        condition: true,
        click: uploadFileButton,
    },
    {
        text: t('Machine.ConfigFilesPanel.CreateFile'),
        color: machineButtonCol.value,
        icon: mdiFilePlus,
        loadingName: null,
        onlyWriteable: true,
        condition: true,
        click: createFile,
    },
    {
        text: t('Machine.ConfigFilesPanel.CreateDirectory'),
        color: machineButtonCol.value,
        icon: mdiFolderPlus,
        loadingName: null,
        onlyWriteable: true,
        condition: true,
        click: createDirectory,
    },
    {
        text: t('Machine.ConfigFilesPanel.RefreshDirectory'),
        color: machineButtonCol.value,
        icon: mdiRefresh,
        loadingName: null,
        onlyWriteable: false,
        condition: true,
        click: refreshFileList,
    },
].filter((rule) => rule.condition))

const filteredToolbarButtons = computed(() =>
    toolbarButtons.value.filter((button) => {
        return (directoryPermissions.value.includes('w') && button.onlyWriteable) || !button.onlyWriteable
    })
)

const absolutePath = computed(() => {
    let path = '/' + root.value
    if (currentPath.value) path += currentPath.value
    return path
})

const directory = computed(() => store.getters['files/getDirectory'](absolutePath.value))

const disk_usage = computed(() => directory.value?.disk_usage ?? { used: 0, free: 0, total: 0 })

const directoryPermissions = computed(() => directory.value?.permissions ?? 'r')

const files = computed(() => {
    let result = [...(directory.value?.childrens ?? [])]

    if (!showHiddenFiles.value) {
        result = result.filter((file) => file.filename.slice(0, 1) !== '.')
    }

    if (hideBackupFiles.value) {
        const klipperBackupFileMatcher = /^printer-\d{8}_\d{6}\.cfg$/
        const crowsnestBackupFileMatcher = /^crowsnest\.conf\.\d{4}-\d{2}-\d{2}-\d{4}$/

        result = result.filter(
            (file) =>
                !file.filename.match(klipperBackupFileMatcher) &&
                !file.filename.match(crowsnestBackupFileMatcher) &&
                !file.filename.endsWith('.bkp')
        )
    }

    return result
})

const sortedFiles = computed(() => sortFiles([...files.value], [sortBy.value], [sortDesc.value]))

const headers = computed(() => [
    { title: '', key: '', sortable: false },
    { title: t('Machine.ConfigFilesPanel.Name'), key: 'filename', sortable: false },
    { title: t('Machine.ConfigFilesPanel.Filesize'), key: 'size', align: 'end', sortable: false },
    { title: t('Machine.ConfigFilesPanel.LastModified'), key: 'modified', align: 'end', sortable: false },
])

const selectedFiles = computed({
    get: () => store.state.gui.view.configfiles.selectedFiles ?? [],
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'view.configfiles.selectedFiles', value: newVal }),
})

const countPerPage = computed({
    get: () => store.state.gui.view.configfiles.countPerPage,
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'view.configfiles.countPerPage', value: newVal }),
})

const showHiddenFiles = computed({
    get: () => store.state.gui.view.configfiles.showHiddenFiles,
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'view.configfiles.showHiddenFiles', value: newVal }),
})

const hideBackupFiles = computed({
    get: () => store.state.gui.view.configfiles.hideBackupFiles,
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'view.configfiles.hideBackupFiles', value: newVal }),
})

const sortBy = computed({
    get: () => store.state.gui.view.configfiles.sortBy,
    set: (newVal) => {
        if (newVal === undefined) newVal = 'filename'
        store.dispatch('gui/saveSetting', { name: 'view.configfiles.sortBy', value: newVal })
    },
})

const sortDesc = computed({
    get: () => store.state.gui.view.configfiles.sortDesc,
    set: (newVal) => {
        if (newVal === undefined) newVal = false
        store.dispatch('gui/saveSetting', { name: 'view.configfiles.sortDesc', value: newVal })
    },
})

const registeredDirectories = computed(() => store.state.server.registered_directories ?? [])

const existConfigRoot = computed(() => registeredDirectories.value.findIndex((root: string) => root === 'config') !== -1)

const showMissingConfigRootWarning = computed(() =>
    absolutePath.value.startsWith('/config') &&
    !absolutePath.value.startsWith('/config_example') &&
    !existConfigRoot.value
)

const registeredDirectoriesSelectItems = computed(() => {
    const items = registeredDirectories.value.filter((dir: string) => !hiddenRootDirectories.includes(dir)).sort()
    if (!existConfigRoot.value) items.push('config')
    return items
})

const root = computed({
    get: () => store.state.gui.view.configfiles.rootPath,
    set: (newVal) => store.dispatch('gui/saveSetting', { name: 'view.configfiles.rootPath', value: newVal }),
})

const currentPath = computed({
    get: () => store.state.gui.view.configfiles.currentPath,
    set: (newVal) => {
        selectedFiles.value = []
        store.dispatch('gui/saveSetting', { name: 'view.configfiles.currentPath', value: newVal })
    },
})

const deleteSelectedDialogText = computed(() => {
    if (selectedFiles.value.length === 1) {
        return t('Machine.ConfigFilesPanel.DeleteSingleFileQuestion', {
            name: selectedFiles.value[0].filename,
        })
    }

    return t('Machine.ConfigFilesPanel.DeleteSelectedQuestion', {
        count: selectedFiles.value.length,
    })
})

function refreshFileList() {
    socket.emit(
        'server.files.get_directory',
        { path: absolutePath.value.substring(1) },
        { action: 'files/getDirectory' }
    )
}

function changeRoot() {
    currentPath.value = ''
}

function clickRow(item: FileStateFile, force = false) {
    if (contextMenu.shown && !force) return
    if (force) contextMenu.shown = false

    if (item.isDirectory) {
        currentPath.value += '/' + item.filename
        currentPage.value = 1
        return
    }

    const extension = item.filename.split('.').pop()?.toLowerCase() ?? ''
    const url = `${apiUrl.value}/server/files${absolutePath.value}/${item.filename}?t=${Date.now()}`

    if (extension === 'svg') {
        fetch(url)
            .then((res) => res.text())
            .then((svg) => {
                dialogImage.show = true
                dialogImage.item.name = item.filename
                dialogImage.item.svg = svg
            })
        return
    }

    if (['png', 'jpeg', 'jpg', 'gif', 'bmp', 'tif'].includes(extension)) {
        dialogImage.show = true
        dialogImage.item.name = item.filename
        dialogImage.item.url = url
        return
    }

    store.dispatch('editor/openFile', {
        root: root.value,
        path: currentPath.value,
        filename: item.filename,
        size: item.size,
        permissions: item.permissions,
    })
}

function clickRowGoBack() {
    currentPath.value = currentPath.value.slice(0, currentPath.value.lastIndexOf('/'))
}

function clickPathNavGoToDirectory(segment: { location: string }) {
    currentPath.value = segment.location
}

function setIsInvalidName(bool: boolean) {
    isInvalidName.value = bool
}

function showContextMenu(e: MouseEvent | LongpressEvent, item: FileStateFile) {
    e?.preventDefault()
    contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
    contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
    contextMenu.item = item
    contextMenu.shown = true
}

function startDownloadFile(filename: string) {
    const filepath = `${absolutePath.value}/${filename}`
    const href = `${apiUrl.value}/server/files${escapePath(filepath)}`
    window.open(href)
}

function downloadFile() {
    startDownloadFile(contextMenu.item.filename)
    contextMenu.shown = false
}

async function downloadSelectedFiles() {
    if (selectedFiles.value.length === 1) {
        startDownloadFile(selectedFiles.value[0].filename)
        selectedFiles.value = []
        return
    }

    const items: string[] = []

    const addElementToItems = async (absolutPath: string, directory: FileStateFile[]) => {
        for (const file of directory) {
            const filePath = `${absolutPath}/${file.filename}`

            if (file.isDirectory && file.childrens) {
                await addElementToItems(filePath, file.childrens)
                continue
            }

            items.push(filePath)
        }
    }

    await addElementToItems(absolutePath.value, selectedFiles.value)

    socket.emit(
        'server.files.zip',
        { items, dest: `config/${root.value}-${generateTimestamp()}.zip` },
        { action: 'files/downloadZip', loading: 'configDownloadZip' }
    )

    selectedFiles.value = []
}

function createDirectory() {
    dialogCreateDirectory.name = ''
    dialogCreateDirectory.show = true

    setTimeout(() => {
        inputDialogCreateDirectoryName.value?.focus()
    }, 200)
}

function createDirectoryAction() {
    dialogCreateDirectory.show = false

    socket.emit(
        'server.files.post_directory',
        {
            path: absolutePath.value.substring(1) + '/' + dialogCreateDirectory.name,
        },
        { action: 'files/getCreateDir' }
    )
}

function renameDirectory(item: FileStateFile) {
    dialogRenameDirectory.item = item
    dialogRenameDirectory.newName = item.filename
    dialogRenameDirectory.show = true

    setTimeout(() => {
        inputDialogRenameDirectoryName.value?.focus()
    }, 200)
}

function renameDirectoryAction() {
    dialogRenameDirectory.show = false
    socket.emit(
        'server.files.move',
        {
            source: (absolutePath.value + '/' + dialogRenameDirectory.item.filename).slice(1),
            dest: (absolutePath.value + '/' + dialogRenameDirectory.newName).slice(1),
        },
        { action: 'files/getMove' }
    )
}

function deleteDirectory(item: FileStateFile) {
    dialogDeleteDirectory.item = item
    dialogDeleteDirectory.show = true
}

function deleteDirectoryAction() {
    socket.emit(
        'server.files.delete_directory',
        { path: absolutePath.value + '/' + dialogDeleteDirectory.item.filename, force: true },
        { action: 'files/getDeleteDir' }
    )
}

function createFile() {
    dialogCreateFile.name = ''
    dialogCreateFile.show = true

    setTimeout(() => {
        inputDialogCreateFileName.value?.focus()
    }, 200)
}

function createFileAction() {
    const file = new File([''], dialogCreateFile.name)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('root', root.value)
    if (currentPath.value.length) formData.append('path', currentPath.value.slice(1))

    axios
        .post(apiUrl.value + '/server/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(() => {
            toast.success(t('Files.SuccessfullyCreated', { filename: dialogCreateFile.name }))
            dialogCreateFile.show = false
            dialogCreateFile.name = ''
        })
        .catch(() => {
            window.console.error('Error create file: ' + dialogCreateFile.name)
        })
}

function renameFile(item: FileStateFile) {
    dialogRenameFile.item = item
    dialogRenameFile.newName = item.filename
    dialogRenameFile.show = true

    setTimeout(() => {
        inputDialogRenameFileName.value?.focus()
    }, 200)
}

function renameFileAction() {
    dialogRenameFile.show = false
    socket.emit(
        'server.files.move',
        {
            source: (absolutePath.value + '/' + dialogRenameFile.item.filename).slice(1),
            dest: (absolutePath.value + '/' + dialogRenameFile.newName).slice(1),
        },
        { action: 'files/getMove' }
    )
}

function duplicateFile(item: FileStateFile) {
    dialogDuplicateFile.item = item
    dialogDuplicateFile.newName = item.filename
    dialogDuplicateFile.show = true

    setTimeout(() => {
        inputDialogDuplicateFileName.value?.focus()
    }, 200)
}

function duplicateFileAction() {
    dialogDuplicateFile.show = false
    socket.emit('server.files.copy', {
        source: (absolutePath.value + '/' + dialogDuplicateFile.item.filename).slice(1),
        dest: (absolutePath.value + '/' + dialogDuplicateFile.newName).slice(1),
    })
}

function removeFile() {
    socket.emit(
        'server.files.delete_file',
        { path: absolutePath.value + '/' + contextMenu.item.filename },
        { action: 'files/getDeleteFile' }
    )
}

function deleteSelectedFiles() {
    selectedFiles.value.forEach((item: FileStateGcodefile) => {
        if (item.isDirectory) {
            socket.emit(
                'server.files.delete_directory',
                { path: absolutePath.value + '/' + item.filename, force: true },
                { action: 'files/getDeleteDir' }
            )
        } else {
            socket.emit(
                'server.files.delete_file',
                { path: absolutePath.value + '/' + item.filename },
                { action: 'files/getDeleteFile' }
            )
        }
    })

    selectedFiles.value = []
}

function uploadFileButton() {
    fileUpload.value?.click()
}

async function uploadFile() {
    const filesInput = fileUpload.value
    if (!filesInput) return
    const filesArray = [...(filesInput.files ?? [])]
    if (filesArray.length === 0) return

    filesInput.value = ''

    await store.dispatch('socket/addLoading', { name: 'configFileUpload' })
    await store.dispatch('files/uploadSetCurrentNumber', 0)
    await store.dispatch('files/uploadSetMaxNumber', filesArray.length)

    for (const file of filesArray) {
        await store.dispatch('files/uploadIncrementCurrentNumber')
        const path = currentPath.value.slice(0, 1) === '/' ? currentPath.value.slice(1) : currentPath.value
        const result = await store.dispatch('files/uploadFile', {
            file,
            path,
            root: 'config',
        })

        if (result !== false) {
            toast.success(t('Files.SuccessfullyUploaded', { filename: result }))
        }
    }

    await store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
}

function closeDialogImage() {
    dialogImage.show = false
    dialogImage.item.url = null
    dialogImage.item.svg = null
}

function cancelUpload() {
    uploadSnackbar.cancelTokenSource?.cancel()
    uploadSnackbar.status = false
}

function dragFile(e: Event, item: FileStateFile) {
    e.preventDefault()
    blockFileUpload.value = true
    draggingFile.item = item
}

function dragendFile(e: Event) {
    e.preventDefault()
    blockFileUpload.value = false
    draggingFile.item = {
        isDirectory: false,
        filename: '',
        permissions: '',
        modified: new Date(),
    }
}

function dragOverFilelist(e: DragEvent, row: FileStateFile) {
    if (!blockFileUpload.value) return
    e.preventDefault()

    const parentElement = (e.target as HTMLElement | null)?.parentElement
    if (row.isDirectory && parentElement) parentElement.style.backgroundColor = '#43A04720'
}

function dragLeaveFilelist(e: DragEvent) {
    if (!blockFileUpload.value) return
    e.preventDefault()
    e.stopPropagation()

    const parentElement = (e.target as HTMLElement | null)?.parentElement
    if (parentElement) parentElement.style.backgroundColor = 'transparent'
}

async function dragDropFilelist(e: DragEvent, row: FileStateFile) {
    if (!blockFileUpload.value) return
    e.preventDefault()
    const parentElement = (e.target as HTMLElement | null)?.parentElement
    if (parentElement) parentElement.style.backgroundColor = 'transparent'

    let dest = absolutePath.value + '/' + row.filename + '/' + draggingFile.item.filename
    if (row.filename === '..') {
        dest = absolutePath.value.slice(1, absolutePath.value.lastIndexOf('/') + 1) + draggingFile.item.filename
    }

    socket.emit(
        'server.files.move',
        {
            source: absolutePath.value.slice(1) + '/' + draggingFile.item.filename,
            dest: dest,
        },
        { action: 'files/getMove' }
    )
}
</script>
