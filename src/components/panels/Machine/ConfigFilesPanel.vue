<template>
    <div>
        <panel
            :title="$t('Machine.ConfigFilesPanel.ConfigFiles')"
            card-class="machine-configfiles-panel"
            :icon="mdiInformation"
            :collapsible="true">
            <v-card-text>
                <v-row>
                    <v-col class="col-12 col-lg pr-lg-0">
                        <v-select
                            v-model="root"
                            class="machine-configfiles-panel__root-select"
                            :items="registeredDirectoriesSelectItems"
                            :label="$t('Machine.ConfigFilesPanel.Root')"
                            outlined
                            hide-details
                            dense
                            attach=".machine-configfiles-panel__root-select"
                            @change="changeRoot"></v-select>
                    </v-col>
                    <v-col class="col col-lg-auto pl-lg-0 text-right">
                        <input ref="fileUpload" type="file" style="display: none" multiple @change="uploadFile" />
                        <v-btn
                            v-for="button in filteredToolbarButtons"
                            :key="button.loadingName"
                            class="px-2 minwidth-0 ml-3"
                            :color="button.color"
                            :loading="button.loadingName !== null && loadings.includes(button.loadingName)"
                            @click="button.click">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <v-icon v-bind="attrs" v-on="on">{{ button.icon }}</v-icon>
                                </template>
                                <span>{{ button.text }}</span>
                            </v-tooltip>
                        </v-btn>
                        <v-menu offset-y left :title="$t('Machine.ConfigFilesPanel.SetupCurrentList')">
                            <template #activator="{ on, attrs }">
                                <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on">
                                    <v-icon class="machine-configfiles-panel__settings-icon">{{ mdiCog }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item class="minHeight36">
                                    <v-checkbox
                                        v-model="showHiddenFiles"
                                        class="mt-0"
                                        hide-details
                                        :label="$t('Machine.ConfigFilesPanel.HiddenFiles')"></v-checkbox>
                                </v-list-item>
                                <v-list-item class="minHeight36">
                                    <v-checkbox
                                        v-model="hideBackupFiles"
                                        class="mt-0"
                                        hide-details
                                        :label="$t('Machine.ConfigFilesPanel.HideBackupFiles')"></v-checkbox>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span>
                            <b class="mr-1">{{ $t('Machine.ConfigFilesPanel.CurrentPath') }}:</b>
                            <path-navigation
                                :path="currentPath"
                                :base-directory-label="`/${root}`"
                                :on-segment-click="clickPathNavGoToDirectory" />
                        </span>
                        <v-spacer></v-spacer>
                        <template v-if="disk_usage !== null && !showMissingConfigRootWarning">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
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
            <v-divider></v-divider>
            <v-data-table
                v-if="!showMissingConfigRootWarning"
                v-model="selectedFiles"
                :items="files"
                class="files-table"
                :headers="headers"
                :page.sync="currentPage"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Machine.ConfigFilesPanel.Files'),
                    itemsPerPageAllText: $t('Machine.ConfigFilesPanel.AllFiles'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                mobile-breakpoint="0"
                item-key="filename"
                show-select>
                <template #no-data>
                    <div class="text-center">{{ $t('Machine.ConfigFilesPanel.Empty') }}</div>
                </template>

                <template v-if="currentPath !== ''" slot="body.prepend">
                    <tr
                        class="file-list-cursor"
                        @click="clickRowGoBack"
                        @dragover="dragOverFilelist($event, { isDirectory: true, filename: '..' })"
                        @dragleave="dragLeaveFilelist"
                        @drop.prevent.stop="dragDropFilelist($event, { isDirectory: true, filename: '..' })">
                        <td class="file-list__select-td pr-0">
                            <v-simple-checkbox v-ripple disabled class="pa-0 mr-0"></v-simple-checkbox>
                        </td>
                        <td class="px-0 text-center" style="width: 32px">
                            <v-icon>{{ mdiFolderUpload }}</v-icon>
                        </td>
                        <td class=" " colspan="4">..</td>
                    </tr>
                </template>

                <template #item="{ index, item, isSelected, select }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
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
                        <td class="file-list__select-td pr-0">
                            <v-simple-checkbox
                                v-ripple
                                :value="isSelected"
                                class="pa-0 mr-0"
                                @click.stop="select(!isSelected)"></v-simple-checkbox>
                        </td>
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
                    <v-col class="col-12 col-lg pr-lg-0">
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
                    class="red--text"
                    @click="deleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Machine.ConfigFilesPanel.Delete') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    class="red--text"
                    @click="deleteDirectory(contextMenu.item)">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Machine.ConfigFilesPanel.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog
            v-model="dialogImage.show"
            hide-overlay
            fullscreen
            class="fill-height"
            @keydown.esc="
                dialogImage.show = false
                dialogImage.item.url = null
                dialogImage.item.svg = null
            ">
            <panel
                :title="dialogImage.item.name ?? ''"
                card-class="maschine-configfiles-imageviewer-dialog"
                style="position: relative">
                <template #buttons>
                    <v-btn
                        icon
                        tile
                        @click="
                            dialogImage.show = false
                            dialogImage.item.url = null
                            dialogImage.item.svg = null
                        ">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <div class="d-flex justify-center" style="max-height: calc(var(--app-height) - 64px); overflow: auto">
                    <img
                        v-if="dialogImage.item.url"
                        :src="dialogImage.item.url"
                        style="max-height: 100%; width: auto; object-fit: contain"
                        alt="image" />
                    <div v-else-if="dialogImage.item.svg" class="fill-width" v-html="dialogImage.item.svg"></div>
                </div>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateFile.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.CreateFile')"
                card-class="maschine-configfiles-create-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogCreateFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogCreateFileName"
                        v-model="dialogCreateFile.name"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="createFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateFile.show = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="createFileAction">
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
                    <v-btn icon tile @click="dialogRenameFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogRenameFileName"
                        v-model="dialogRenameFile.newName"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="renameFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameFileAction">
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
                    <v-btn icon tile @click="dialogDuplicateFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialoDuplicateFileName"
                        v-model="dialogDuplicateFile.newName"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="duplicateFileAction" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" text @click="dialogDuplicateFile.show = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="duplicateFileAction">
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
                    <v-btn icon tile @click="dialogCreateDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogCreateDirectoryName"
                        v-model="dialogCreateDirectory.name"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="createDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="createDirectoryAction">
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
                    <v-btn icon tile @click="dialogRenameDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputDialogRenameDirectoryName"
                        v-model="dialogRenameDirectory.newName"
                        :label="$t('Machine.ConfigFilesPanel.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="renameDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameDirectoryAction">
                        {{ $t('Machine.ConfigFilesPanel.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.DeleteDirectory')"
                card-class="maschine-configfiles-delete-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogDeleteDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{
                            $t('Machine.ConfigFilesPanel.DeleteDirectoryQuestion', {
                                name: dialogDeleteDirectory.item.filename,
                            })
                        }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">
                        {{ $t('Machine.ConfigFilesPanel.Delete') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE SINGLE FILE DIALOG -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.Delete')"
                card-class="maschine-configfiles-delete-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{
                            $t('Machine.ConfigFilesPanel.DeleteSingleFileQuestion', { name: contextMenu.item.filename })
                        }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteDialog = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="removeFile">
                        {{ $t('Machine.ConfigFilesPanel.Delete') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE MULTIPLE FILES DIALOG -->
        <v-dialog v-model="deleteSelectedDialog" max-width="400">
            <panel
                :title="$t('Machine.ConfigFilesPanel.Delete')"
                card-class="maschine-configfiles-delete-selected-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteSelectedDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p v-if="selectedFiles.length === 1" class="mb-0">
                        {{
                            $t('Machine.ConfigFilesPanel.DeleteSingleFileQuestion', { name: selectedFiles[0].filename })
                        }}
                    </p>
                    <p v-else class="mb-0">
                        {{ $t('Machine.ConfigFilesPanel.DeleteSelectedQuestion', { count: selectedFiles.length }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteSelectedDialog = false">
                        {{ $t('Machine.ConfigFilesPanel.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="deleteSelectedFiles">
                        {{ $t('Machine.ConfigFilesPanel.Delete') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <v-snackbar v-model="uploadSnackbar.status" :timeout="-1" :value="true" fixed right bottom>
            <span v-if="uploadSnackbar.max > 1" class="mr-1">
                ({{ uploadSnackbar.number }}/{{ uploadSnackbar.max }})
            </span>
            <strong>{{ $t('Machine.ConfigFilesPanel.Uploading') }} {{ uploadSnackbar.filename }}</strong>
            <br />
            {{ Math.round(uploadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(uploadSnackbar.speed)) }}/s
            <br />
            <v-progress-linear class="mt-2" :value="uploadSnackbar.percent"></v-progress-linear>
            <template #action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" style="min-width: auto" @click="cancelUpload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ThemeMixin from '@/components/mixins/theme'
import { formatFilesize, sortFiles } from '@/plugins/helpers'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import axios from 'axios'
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
    cancelTokenSource: any
}

interface draggingFile {
    item: FileStateFile
}

@Component({
    components: { Panel, PathNavigation },
})
export default class ConfigFilesPanel extends Mixins(BaseMixin, ThemeMixin) {
    mdiInformation = mdiInformation
    mdiClose = mdiClose
    mdiCog = mdiCog
    mdiFolder = mdiFolder
    mdiFolderUpload = mdiFolderUpload
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiFile = mdiFile
    mdiCloudDownload = mdiCloudDownload
    mdiRenameBox = mdiRenameBox
    mdiDelete = mdiDelete
    mdiCloseThick = mdiCloseThick
    mdiLockOutline = mdiLockOutline
    mdiContentCopy = mdiContentCopy

    sortFiles = sortFiles
    formatFilesize = formatFilesize

    declare $refs: {
        fileUpload: HTMLInputElement
        inputDialogCreateFileName: HTMLInputElement
        inputDialogRenameFileName: HTMLInputElement
        inputDialogDuplicateFileName: HTMLInputElement
        inputDialogCreateDirectoryName: HTMLInputElement
        inputDialogRenameDirectoryName: HTMLInputElement
    }

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
            modified: new Date(),
        },
    }
    private dialogImage: dialogImageObject = {
        show: false,
        item: {
            name: null,
            url: null,
            svg: null,
        },
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
            modified: new Date(),
        },
    }
    private dialogDuplicateFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        },
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
            modified: new Date(),
        },
    }
    private dialogDeleteDirectory: dialogDeleteObject = {
        show: false,
        item: {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        },
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
    }
    private draggingFile: draggingFile = {
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

    get blockFileUpload() {
        return this.$store.state.gui.view.blockFileUpload ?? false
    }

    set blockFileUpload(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.blockFileUpload', value: newVal })
    }

    get toolbarButtons() {
        return [
            {
                text: this.$t('Machine.ConfigFilesPanel.Download'),
                color: 'primary',
                icon: mdiCloudDownload,
                loadingName: 'configDownloadZip',
                onlyWriteable: false,
                condition: this.selectedFiles.length > 0,
                click: () => {
                    this.downloadSelectedFiles()
                },
            },
            {
                text: this.$t('Machine.ConfigFilesPanel.Delete'),
                color: 'error',
                icon: mdiDelete,
                loadingName: null,
                onlyWriteable: true,
                condition: this.selectedFiles.length > 0,
                click: () => {
                    this.deleteSelectedDialog = true
                },
            },
            {
                text: this.$t('Machine.ConfigFilesPanel.UploadFile'),
                color: this.machineButtonCol,
                icon: mdiFileUpload,
                loadingName: null,
                onlyWriteable: true,
                condition: true,
                click: this.uploadFileButton,
            },
            {
                text: this.$t('Machine.ConfigFilesPanel.CreateFile'),
                color: this.machineButtonCol,
                icon: mdiFilePlus,
                loadingName: null,
                onlyWriteable: true,
                condition: true,
                click: this.createFile,
            },
            {
                text: this.$t('Machine.ConfigFilesPanel.CreateDirectory'),
                color: this.machineButtonCol,
                icon: mdiFolderPlus,
                loadingName: null,
                onlyWriteable: true,
                condition: true,
                click: this.createDirectory,
            },
            {
                text: this.$t('Machine.ConfigFilesPanel.RefreshDirectory'),
                color: this.machineButtonCol,
                icon: mdiRefresh,
                loadingName: null,
                onlyWriteable: false,
                condition: true,
                click: this.refreshFileList,
            },
        ].filter((rule: any) => rule.condition)
    }

    get filteredToolbarButtons() {
        return this.toolbarButtons.filter((button) => {
            return (this.directoryPermissions.includes('w') && button.onlyWriteable) || !button.onlyWriteable
        })
    }

    get absolutePath() {
        let path = '/' + this.root
        if (this.currentPath) path += this.currentPath

        return path
    }

    get directory() {
        return this.$store.getters['files/getDirectory'](this.absolutePath)
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0 }
    }

    get directoryPermissions() {
        return this.directory?.permissions ?? 'r'
    }

    get files() {
        let files = [...(this.directory?.childrens ?? [])]

        if (!this.showHiddenFiles) {
            files = files.filter((file) => file.filename.slice(0, 1) !== '.')
        }

        if (this.hideBackupFiles) {
            const klipperBackupFileMatcher = /^printer-\d{8}_\d{6}\.cfg$/
            const crowsnestBackupFileMatcher = /^crowsnest\.conf\.\d{4}-\d{2}-\d{2}-\d{4}$/

            files = files.filter(
                (file) =>
                    !file.filename.match(klipperBackupFileMatcher) &&
                    !file.filename.match(crowsnestBackupFileMatcher) &&
                    !file.filename.endsWith('.bkp')
            )
        }

        return files
    }

    get headers() {
        return [
            { text: '', value: '', sortable: false },
            { text: this.$t('Machine.ConfigFilesPanel.Name'), value: 'filename' },
            { text: this.$t('Machine.ConfigFilesPanel.Filesize'), value: 'size', align: 'right' },
            { text: this.$t('Machine.ConfigFilesPanel.LastModified'), value: 'modified', align: 'right' },
        ]
    }

    get selectedFiles() {
        return this.$store.state.gui.view.configfiles.selectedFiles ?? []
    }

    set selectedFiles(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.configfiles.selectedFiles', value: newVal })
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
        return this.$store.state.server.registered_directories ?? []
    }

    get existConfigRoot() {
        return this.registeredDirectories.findIndex((root: string) => root === 'config') !== -1
    }

    get showMissingConfigRootWarning() {
        return (
            this.absolutePath.startsWith('/config') &&
            !this.absolutePath.startsWith('/config_example') &&
            !this.existConfigRoot
        )
    }

    get registeredDirectoriesSelectItems() {
        const items = this.registeredDirectories.filter((dir: string) => !hiddenRootDirectories.includes(dir)).sort()
        if (!this.existConfigRoot) items.push('config')

        return items
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
        this.selectedFiles = []

        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.configfiles.currentPath', value: newVal })
    }

    refreshFileList() {
        this.$socket.emit(
            'server.files.get_directory',
            { path: this.absolutePath.substring(1) },
            { action: 'files/getDirectory' }
        )
    }

    changeRoot() {
        this.currentPath = ''
    }

    clickRow(item: FileStateFile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (!item.isDirectory) {
                if (
                    ['png', 'jpeg', 'jpg', 'gif', 'bmp', 'tif', 'svg'].includes(
                        item.filename.split('.').pop()?.toLowerCase() ?? ''
                    )
                ) {
                    const url = `${this.apiUrl}/server/files${this.absolutePath}/${item.filename}?t=${Date.now()}`
                    this.dialogImage.item.name = item.filename
                    if (['svg'].includes(item.filename.split('.').pop()?.toLowerCase() ?? '')) {
                        fetch(url)
                            .then((res) => res.text())
                            .then((svg) => {
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
                        permissions: item.permissions,
                    })
                }
            } else {
                this.currentPath += '/' + item.filename
                this.currentPage = 1
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.slice(0, this.currentPath.lastIndexOf('/'))
    }

    clickPathNavGoToDirectory(segment: { location: string }) {
        this.currentPath = segment.location
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

    downloadFile() {
        const filename = this.absolutePath + '/' + this.contextMenu.item.filename
        const href = `${this.apiUrl}/server/files${encodeURI(filename)}`
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
            }
        }

        await addElementToItems(this.absolutePath, this.selectedFiles)

        const date = new Date()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        const timestamp = `${date.getFullYear()}${month}${day}-${hours}${minutes}${seconds}`

        this.$socket.emit(
            'server.files.zip',
            { items, dest: `config/${this.root}-${timestamp}.zip` },
            { action: 'files/downloadZip', loading: 'configDownloadZip' }
        )

        this.selectedFiles = []
    }

    createDirectory() {
        this.dialogCreateDirectory.name = ''
        this.dialogCreateDirectory.show = true

        setTimeout(() => {
            this.$refs.inputDialogCreateDirectoryName?.focus()
        }, 200)
    }

    createDirectoryAction() {
        this.dialogCreateDirectory.show = false

        this.$socket.emit(
            'server.files.post_directory',
            {
                path: this.absolutePath.substring(1) + '/' + this.dialogCreateDirectory.name,
            },
            { action: 'files/getCreateDir' }
        )
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
        this.$socket.emit(
            'server.files.move',
            {
                source: (this.absolutePath + '/' + this.dialogRenameDirectory.item.filename).slice(1),
                dest: (this.absolutePath + '/' + this.dialogRenameDirectory.newName).slice(1),
            },
            { action: 'files/getMove' }
        )
    }

    deleteDirectory(item: FileStateFile) {
        this.dialogDeleteDirectory.item = item
        this.dialogDeleteDirectory.show = true
    }

    deleteDirectoryAction() {
        this.dialogDeleteDirectory.show = false
        this.$socket.emit(
            'server.files.delete_directory',
            { path: this.absolutePath + '/' + this.dialogDeleteDirectory.item.filename, force: true },
            { action: 'files/getDeleteDir' }
        )
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
        if (this.currentPath.length) formData.append('path', this.currentPath.slice(1))

        axios
            .post(this.apiUrl + '/server/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then(() => {
                this.$toast.success(
                    this.$t('Files.SuccessfullyCreated', { filename: this.dialogCreateFile.name }).toString()
                )
                this.dialogCreateFile.show = false
                this.dialogCreateFile.name = ''
            })
            .catch(() => {
                window.console.error('Error create file: ' + this.dialogCreateFile.name)
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
        this.$socket.emit(
            'server.files.move',
            {
                source: (this.absolutePath + '/' + this.dialogRenameFile.item.filename).slice(1),
                dest: (this.absolutePath + '/' + this.dialogRenameFile.newName).slice(1),
            },
            { action: 'files/getMove' }
        )
    }

    duplicateFile(item: FileStateFile) {
        this.dialogDuplicateFile.item = item
        this.dialogDuplicateFile.newName = item.filename
        this.dialogDuplicateFile.show = true

        setTimeout(() => {
            this.$refs.inputDialogDuplicateFileName?.focus()
        }, 200)
    }

    duplicateFileAction() {
        this.dialogDuplicateFile.show = false
        this.$socket.emit('server.files.copy', {
            source: (this.absolutePath + '/' + this.dialogDuplicateFile.item.filename).slice(1),
            dest: (this.absolutePath + '/' + this.dialogDuplicateFile.newName).slice(1),
        })
    }

    removeFile() {
        this.$socket.emit(
            'server.files.delete_file',
            { path: this.absolutePath + '/' + this.contextMenu.item.filename },
            { action: 'files/getDeleteFile' }
        )

        this.deleteDialog = false
    }

    deleteSelectedFiles() {
        this.selectedFiles.forEach((item: FileStateGcodefile) => {
            if (item.isDirectory) {
                this.$socket.emit(
                    'server.files.delete_directory',
                    { path: this.absolutePath + '/' + item.filename, force: true },
                    { action: 'files/getDeleteDir' }
                )
            } else {
                this.$socket.emit(
                    'server.files.delete_file',
                    { path: this.absolutePath + '/' + item.filename },
                    { action: 'files/getDeleteFile' }
                )
            }
        })

        this.selectedFiles = []
        this.deleteSelectedDialog = false
    }

    uploadFileButton() {
        this.$refs.fileUpload.click()
    }

    async uploadFile() {
        if (this.$refs.fileUpload.files?.length) {
            const files = [...this.$refs.fileUpload.files]
            this.$refs.fileUpload.value = ''

            await this.$store.dispatch('socket/addLoading', { name: 'configFileUpload' })
            await this.$store.dispatch('files/uploadSetCurrentNumber', 0)
            await this.$store.dispatch('files/uploadSetMaxNumber', this.$refs.fileUpload.files.length)

            for (const file of files) {
                await this.$store.dispatch('files/uploadIncrementCurrentNumber')
                const path = this.currentPath.slice(0, 1) === '/' ? this.currentPath.slice(1) : this.currentPath
                const result = await this.$store.dispatch('files/uploadFile', {
                    file,
                    path,
                    root: 'config',
                })

                if (result !== false)
                    this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: result }).toString())
            }

            await this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
        }
    }

    cancelUpload() {
        this.uploadSnackbar.cancelTokenSource.cancel()
        this.uploadSnackbar.status = false
    }

    dragFile(e: Event, item: FileStateFile) {
        e.preventDefault()
        this.blockFileUpload = true
        this.draggingFile.item = item
    }

    dragendFile(e: Event) {
        e.preventDefault()
        this.blockFileUpload = false
        this.draggingFile.item = {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
        }
    }

    dragOverFilelist(e: any, row: any) {
        if (this.blockFileUpload) {
            e.preventDefault()
            //e.stopPropagation()

            if (row.isDirectory) e.target.parentElement.style.backgroundColor = '#43A04720'
        }
    }

    dragLeaveFilelist(e: any) {
        if (this.blockFileUpload) {
            e.preventDefault()
            e.stopPropagation()

            e.target.parentElement.style.backgroundColor = 'transparent'
        }
    }

    async dragDropFilelist(e: any, row: any) {
        if (this.blockFileUpload) {
            e.preventDefault()
            e.target.parentElement.style.backgroundColor = 'transparent'

            let dest: string
            if (row.filename === '..') {
                dest =
                    this.absolutePath.slice(1, this.absolutePath.lastIndexOf('/') + 1) + this.draggingFile.item.filename
            } else dest = this.absolutePath + '/' + row.filename + '/' + this.draggingFile.item.filename

            this.$socket.emit(
                'server.files.move',
                {
                    source: this.absolutePath.slice(1) + '/' + this.draggingFile.item.filename,
                    dest: dest,
                },
                { action: 'files/getMove' }
            )
        }
    }
}
</script>
