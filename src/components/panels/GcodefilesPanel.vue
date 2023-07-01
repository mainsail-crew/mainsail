<template>
    <div>
        <panel :title="$t('Files.GCodeFiles')" :icon="mdiFileDocumentMultipleOutline" card-class="gcode-files-panel">
            <v-card-text>
                <v-row>
                    <v-col class="col-12 d-flex align-center">
                        <v-text-field
                            v-model="search"
                            :append-icon="mdiMagnify"
                            :label="$t('Files.Search')"
                            single-line
                            outlined
                            clearable
                            hide-details
                            dense
                            style="max-width: 300px"></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn
                            v-if="selectedFiles.length"
                            :title="$t('Files.Download')"
                            color="primary"
                            class="px-2 minwidth-0 ml-3"
                            :loading="loadings.includes('gcodeDownloadZip')"
                            @click="downloadSelectedFiles">
                            <v-icon>{{ mdiCloudDownload }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="selectedFiles.length"
                            :title="$t('Files.Delete')"
                            color="error"
                            class="px-2 minwidth-0 ml-3"
                            @click="deleteSelectedDialog = true">
                            <v-icon>{{ mdiDelete }}</v-icon>
                        </v-btn>
                        <input
                            ref="fileUpload"
                            type="file"
                            :accept="gcodeInputFileAccept.join(', ')"
                            style="display: none"
                            multiple
                            @change="uploadFile" />
                        <v-btn
                            :title="$t('Files.UploadNewGcode')"
                            class="primary--text px-2 minwidth-0 ml-3"
                            :loading="loadings.includes('gcodeUpload')"
                            @click="clickUploadButton">
                            <v-icon>{{ mdiUpload }}</v-icon>
                        </v-btn>
                        <v-btn
                            :title="$t('Files.CreateNewDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="createDirectory">
                            <v-icon>{{ mdiFolderPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            :title="$t('Files.RefreshCurrentDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="refreshFileList">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                        <v-menu offset-y left :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
                            <template #activator="{ on, attrs }">
                                <v-btn class="px-2 minwidth-0 ml-3" v-bind="attrs" v-on="on">
                                    <v-icon>{{ mdiCog }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item class="minHeight36" link>
                                    <v-row>
                                        <v-col class="pr-0">
                                            {{ $t('Files.HiddenFiles') }}
                                        </v-col>
                                        <v-col class="col-auto pl-0">
                                            <v-icon
                                                v-if="showHiddenFiles"
                                                color="primary"
                                                @click.stop="showHiddenFiles = false">
                                                {{ mdiCheckboxMarked }}
                                            </v-icon>
                                            <v-icon v-else color="grey lighten-1" @click.stop="showHiddenFiles = true">
                                                {{ mdiCheckboxBlankOutline }}
                                            </v-icon>
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                                <v-list-item class="minHeight36" link>
                                    <v-row>
                                        <v-col class="pr-0">
                                            {{ $t('Files.PrintedFiles') }}
                                        </v-col>
                                        <v-col class="col-auto pl-0">
                                            <v-icon
                                                v-if="showPrintedFiles"
                                                color="primary"
                                                @click.stop="showPrintedFiles = false">
                                                {{ mdiCheckboxMarked }}
                                            </v-icon>
                                            <v-icon v-else color="grey lighten-1" @click.stop="showPrintedFiles = true">
                                                {{ mdiCheckboxBlankOutline }}
                                            </v-icon>
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                                <v-divider></v-divider>
                                <draggable
                                    v-model="configurableHeaders"
                                    handle=".handle"
                                    class="v-list-item-group"
                                    ghost-class="ghost"
                                    group="gcodeFilesColumnOrder">
                                    <v-list-item
                                        v-for="header of configurableHeaders"
                                        :key="header.value"
                                        class="minHeight36">
                                        <v-row>
                                            <v-col class="col-auto pr-0">
                                                <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                                            </v-col>
                                            <v-col>
                                                {{ header.text }}
                                            </v-col>
                                            <v-col class="col-auto pl-0">
                                                <v-icon
                                                    v-if="!header.visible"
                                                    color="grey lighten-1"
                                                    @click.stop="changeMetadataVisible(header.value, true)">
                                                    {{ mdiCheckboxBlankOutline }}
                                                </v-icon>
                                                <v-icon
                                                    v-else
                                                    color="primary"
                                                    @click.stop="changeMetadataVisible(header.value, false)">
                                                    {{ mdiCheckboxMarked }}
                                                </v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                </draggable>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col class="col-12 py-2 d-flex align-center">
                        <span>
                            <b>{{ $t('Files.CurrentPath') }}:</b>
                            {{ currentPath || '/' }}
                        </span>
                        <v-spacer></v-spacer>
                        <template v-if="disk_usage !== null">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <b>{{ $t('Files.FreeDisk') }}:</b>
                                        {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Files.Used') }}: {{ formatFilesize(disk_usage.used) }}
                                    <br />
                                    {{ $t('Files.Free') }}: {{ formatFilesize(disk_usage.free) }}
                                    <br />
                                    {{ $t('Files.Total') }}: {{ formatFilesize(disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                v-model="selectedFiles"
                :items="files"
                class="files-table"
                :headers="filteredHeaders"
                :custom-sort="sortFiles"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('Files.Files'),
                    itemsPerPageAllText: $t('Files.AllFiles'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                item-key="filename"
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                show-select
                @current-items="refreshMetadata">
                <template #no-data>
                    <div class="text-center">{{ $t('Files.Empty') }}</div>
                </template>

                <template v-if="currentPath !== ''" #body.prepend>
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
                        <td class=" " :colspan="filteredHeaders.length">..</td>
                    </tr>
                </template>

                <template #item="{ index, item, isSelected, select }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        class="file-list-cursor user-select-none"
                        draggable="true"
                        :data-name="item.filename"
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
                            <template v-if="item.isDirectory">
                                <v-icon>{{ mdiFolder }}</v-icon>
                            </template>
                            <template v-else-if="item.small_thumbnail">
                                <v-tooltip
                                    top
                                    content-class="tooltip__content-opacity1"
                                    :disabled="!item.big_thumbnail">
                                    <template #activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img
                                                slot="image"
                                                :src="item.small_thumbnail"
                                                width="32"
                                                height="32"
                                                :alt="item.filename"
                                                v-bind="attrs"
                                                v-on="on" />
                                            <div slot="preloader">
                                                <v-progress-circular
                                                    indeterminate
                                                    color="primary"></v-progress-circular>
                                            </div>
                                            <div slot="error">
                                                <v-icon>{{ mdiFile }}</v-icon>
                                            </div>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="item.big_thumbnail" width="250" :alt="item.filename" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td class="text-right text-no-wrap">
                            <v-tooltip v-if="item.last_status" top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <span
                                            v-if="item.count_printed > 0"
                                            :class="`file-list__count_printed ${getStatusTextColor(item.last_status)}`">
                                            {{ item.count_printed }}
                                        </span>
                                        <v-icon small :color="getStatusColor(item.last_status)">
                                            {{ getStatusIcon(item.last_status) }}
                                        </v-icon>
                                    </span>
                                </template>
                                <span>{{ item.last_status.replace(/_/g, ' ') }}</span>
                            </v-tooltip>
                        </td>
                        <td
                            v-for="col in tableColumns"
                            :key="col.value"
                            :class="col.outputType !== 'date' ? 'text-no-wrap' : ''">
                            {{ outputValue(col, item) }}
                            <template v-if="col.value === 'slicer'">
                                <br />
                                <small v-if="item.slicer_version">{{ item.slicer_version }}</small>
                            </template>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <start-print-dialog
            :bool="dialogPrintFile.show"
            :file="dialogPrintFile.item"
            :current-path="currentPath"
            @closeDialog="closeStartPrint"></start-print-dialog>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory"
                    :disabled="printerIsPrinting || !klipperReadyForGui || !isGcodeFile(contextMenu.item)"
                    @click="clickRow(contextMenu.item, true)">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('Files.PrintStart') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && moonrakerComponents.includes('job_queue')"
                    :disabled="!isGcodeFile(contextMenu.item)"
                    @click="addToQueue(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && moonrakerComponents.includes('job_queue')"
                    :disabled="!isGcodeFile(contextMenu.item)"
                    @click="openAddBatchToQueueDialog(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.preheat_gcode !== null"
                    :disabled="['error', 'printing', 'paused'].includes(printer_state)"
                    @click="doSend(contextMenu.item.preheat_gcode)">
                    <v-icon class="mr-1">{{ mdiFire }}</v-icon>
                    {{ $t('Files.Preheat') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory"
                    :disabled="!isGcodeFile(contextMenu.item)"
                    @click="view3D(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiVideo3d }}</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory"
                    :disabled="!isGcodeFile(contextMenu.item)"
                    @click="scanMeta(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiMagnify }}</v-icon>
                    {{ $t('Files.ScanMeta') }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="downloadFile">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Files.Download') }}
                </v-list-item>
                <v-list-item v-if="contextMenu.item.isDirectory" @click="renameDirectory(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="editFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="renameFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="duplicateFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiContentCopy }}</v-icon>
                    {{ $t('Files.Duplicate') }}
                </v-list-item>
                <v-list-item v-if="!contextMenu.item.isDirectory" class="red--text" @click="deleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory"
                    class="red--text"
                    @click="deleteDirectory(contextMenu.item)">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogCreateDirectory.show" :max-width="400">
            <panel
                :title="$t('Files.NewDirectory')"
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
                        :label="$t('Files.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keypress.enter="createDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogCreateDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="createDirectoryAction">
                        {{ $t('Files.Create') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameFile.show" :max-width="400">
            <panel :title="$t('Files.RenameFile')" card-class="gcode-files-rename-file-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogRenameFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldRenameFile"
                        v-model="dialogRenameFile.newName"
                        :label="$t('Files.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="renameFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameFileAction">
                        {{ $t('Files.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDuplicateFile.show" :max-width="400">
            <panel
                :title="$t('Files.DuplicateFile')"
                card-class="gcode-files-duplicate-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogDuplicateFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldDuplicateFile"
                        v-model="dialogDuplicateFile.newName"
                        :label="$t('Files.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="duplicateFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDuplicateFile.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="duplicateFileAction">
                        {{ $t('Files.Duplicate') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel
                :title="$t('Files.RenameDirectory')"
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
                        :label="$t('Files.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="renameDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" text @click="renameDirectoryAction">
                        {{ $t('Files.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogDeleteDirectory.show" max-width="400">
            <panel
                :title="$t('Files.DeleteDirectory')"
                card-class="gcode-files-delete-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogDeleteDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{ $t('Files.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDeleteDirectory.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteDirectoryAction">{{ $t('Files.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE SINGLE FILE DIALOG -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <panel :title="$t('Files.Delete')" card-class="gcode-files-delete-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{ $t('Files.DeleteSingleFileQuestion', { name: contextMenu.item.filename }) }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteDialog = false">
                        {{ $t('Files.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="removeFile">
                        {{ $t('Files.Delete') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE MULTIPLE FILES DIALOG -->
        <v-dialog v-model="deleteSelectedDialog" max-width="400">
            <panel :title="$t('Files.Delete')" card-class="gcode-files-delete-selected-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteSelectedDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p v-if="selectedFiles.length === 1" class="mb-0">
                        {{ $t('Files.DeleteSingleFileQuestion', { name: selectedFiles[0].filename }) }}
                    </p>
                    <p v-else class="mb-0">{{ $t('Files.DeleteSelectedQuestion', { count: selectedFiles.length }) }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteSelectedDialog = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteSelectedFiles">{{ $t('Files.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogAddBatchToQueue.show" max-width="400">
            <panel
                :title="$t('Files.AddToQueue')"
                card-class="gcode-files-add-to-queue-dialog"
                :icon="mdiPlaylistPlus"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogAddBatchToQueue.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>

                <v-card-text>
                    <v-text-field
                        ref="inputFieldAddToQueueCount"
                        v-model="dialogAddBatchToQueue.count"
                        :label="$t('Files.Count')"
                        required
                        hide-spin-buttons
                        type="number"
                        :rules="countInputRules"
                        @keyup.enter="addBatchToQueueAction">
                        <template #append-outer>
                            <div class="_spin_button_group">
                                <v-btn class="mt-n3" icon plain small @click="dialogAddBatchToQueue.count++">
                                    <v-icon>{{ mdiChevronUp }}</v-icon>
                                </v-btn>
                                <v-btn
                                    :disabled="dialogAddBatchToQueue.count <= 1"
                                    class="mb-n3"
                                    icon
                                    plain
                                    small
                                    @click="dialogAddBatchToQueue.count--">
                                    <v-icon>{{ mdiChevronDown }}</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogAddBatchToQueue.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="addBatchToQueueAction">{{ $t('Files.AddToQueue') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { validGcodeExtensions } from '@/store/variables'
import { formatFilesize, formatPrintTime, sortFiles } from '@/plugins/helpers'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import draggable from 'vuedraggable'
import {
    mdiChevronDown,
    mdiChevronUp,
    mdiDragVertical,
    mdiCheckboxBlankOutline,
    mdiCheckboxMarked,
    mdiCloseThick,
    mdiCloudDownload,
    mdiCog,
    mdiDelete,
    mdiFile,
    mdiFileDocumentMultipleOutline,
    mdiFire,
    mdiFolder,
    mdiFolderPlus,
    mdiFolderUpload,
    mdiMagnify,
    mdiPlay,
    mdiPlaylistPlus,
    mdiRefresh,
    mdiRenameBox,
    mdiUpload,
    mdiVideo3d,
    mdiFileDocumentEditOutline,
    mdiContentCopy,
} from '@mdi/js'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import ControlMixin from '@/components/mixins/control'

interface contextMenu {
    shown: boolean
    isDirectory: boolean
    touchTimer?: number | null
    x: number
    y: number
    item: FileStateGcodefile
}

interface draggingFile {
    item: FileStateGcodefile
}

interface dialogPrintFile {
    show: boolean
    item: FileStateGcodefile
}

interface dialogAddBatchToQueue {
    show: boolean
    count: number
    item: FileStateGcodefile
}

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateGcodefile
}

interface tableColumnSetting {
    text: string
    value: string
    visible: boolean
    sortable?: boolean
    class?: string
    pos?: number
    outputType?: 'string' | 'date' | 'length' | 'weight' | 'filesize' | 'temp' | 'time'
}

@Component({
    components: { StartPrintDialog, Panel, SettingsRow, draggable },
})
export default class GcodefilesPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiChevronDown = mdiChevronDown
    mdiChevronUp = mdiChevronUp
    mdiContentCopy = mdiContentCopy
    mdiFile = mdiFile
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiMagnify = mdiMagnify
    mdiUpload = mdiUpload
    mdiFolderPlus = mdiFolderPlus
    mdiRefresh = mdiRefresh
    mdiCog = mdiCog
    mdiFolderUpload = mdiFolderUpload
    mdiFolder = mdiFolder
    mdiPlay = mdiPlay
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiFire = mdiFire
    mdiVideo3d = mdiVideo3d
    mdiCloudDownload = mdiCloudDownload
    mdiRenameBox = mdiRenameBox
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiDelete = mdiDelete
    mdiCloseThick = mdiCloseThick
    mdiCheckboxBlankOutline = mdiCheckboxBlankOutline
    mdiCheckboxMarked = mdiCheckboxMarked
    mdiDragVertical = mdiDragVertical

    formatFilesize = formatFilesize
    formatPrintTime = formatPrintTime
    sortFiles = sortFiles

    declare $refs: {
        fileUpload: HTMLInputElement
        inputFieldRenameFile: HTMLInputElement
        inputFieldDuplicateFile: HTMLInputElement
        inputFieldCreateDirectory: HTMLInputElement
        inputFieldRenameDirectory: HTMLInputElement
    }

    private search = ''

    private dialogCreateDirectory = {
        show: false,
        name: '',
    }

    private contextMenu: contextMenu = {
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
            preheat_gcode: null,
            small_thumbnail: null,
            big_thumbnail: null,
            big_thumbnail_width: null,
            count_printed: 0,
            last_filament_used: null,
            last_start_time: null,
            last_end_time: null,
            last_print_duration: null,
            last_status: null,
            last_total_duration: null,
        },
    }

    private draggingFile: draggingFile = {
        item: { ...this.contextMenu.item },
    }

    private dialogPrintFile: dialogPrintFile = {
        show: false,
        item: { ...this.contextMenu.item },
    }

    private dialogAddBatchToQueue: dialogAddBatchToQueue = {
        show: false,
        count: 1,
        item: { ...this.contextMenu.item },
    }

    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: { ...this.contextMenu.item },
    }

    private dialogDuplicateFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: { ...this.contextMenu.item },
    }

    private dialogRenameDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: { ...this.contextMenu.item },
    }

    private dialogDeleteDirectory: dialogRenameObject = {
        show: false,
        newName: '',
        item: { ...this.contextMenu.item },
    }

    private deleteDialog = false
    private deleteSelectedDialog = false

    private isInvalidName = true
    private nameInputRules = [
        (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
        (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
    ]
    private countInputRules = [
        (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
        (value: string) => parseInt(value) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
    ]

    existsFilename(name: string) {
        return this.files.findIndex((file: FileStateFile) => file.filename === name) >= 0
    }

    get gcodeInputFileAccept() {
        if (this.isIOS) return []

        return validGcodeExtensions
    }

    get currentPath() {
        const path = this.$store.state.gui.view.gcodefiles.currentPath
        if (path === 'gcodes') return ''

        return path
    }

    set currentPath(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.gcodefiles.currentPath', value: newVal })
    }

    get selectedFiles() {
        return this.$store.state.gui.view.gcodefiles.selectedFiles ?? []
    }

    set selectedFiles(newVal) {
        this.$store.dispatch('gui/saveSettingWithoutUpload', { name: 'view.gcodefiles.selectedFiles', value: newVal })
    }

    get fixedHeaders(): tableColumnSetting[] {
        return [
            { text: '', value: '', visible: true, sortable: false },
            {
                text: this.$t('Files.Name').toString(),
                value: 'filename',
                visible: true,
                class: 'text-no-wrap',
            },
            { text: '', value: 'status', visible: true, class: 'text-no-wrap', sortable: false },
        ]
    }

    get configurableHeaders() {
        const headers: tableColumnSetting[] = [
            {
                text: this.$t('Files.Filesize').toString(),
                value: 'size',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'filesize',
            },
            {
                text: this.$t('Files.LastModified').toString(),
                value: 'modified',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'date',
            },
            {
                text: this.$t('Files.ObjectHeight').toString(),
                value: 'object_height',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'length',
            },
            {
                text: this.$t('Files.LayerHeight').toString(),
                value: 'layer_height',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'length',
            },
            {
                text: this.$t('Files.NozzleDiameter').toString(),
                value: 'nozzle_diameter',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'length',
            },
            {
                text: this.$t('Files.ExtruderTemp').toString(),
                value: 'first_layer_extr_temp',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'temp',
            },
            {
                text: this.$t('Files.BedTemp').toString(),
                value: 'first_layer_bed_temp',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'temp',
            },
            {
                text: this.$t('Files.ChamberTemp').toString(),
                value: 'chamber_temp',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'temp',
            },
            {
                text: this.$t('Files.FilamentName').toString(),
                value: 'filament_name',
                visible: true,
                class: 'text-no-wrap',
            },
            {
                text: this.$t('Files.FilamentType').toString(),
                value: 'filament_type',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'string',
            },
            {
                text: this.$t('Files.FilamentUsage').toString(),
                value: 'filament_total',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'length',
            },
            {
                text: this.$t('Files.FilamentWeight').toString(),
                value: 'filament_weight_total',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'weight',
            },
            {
                text: this.$t('Files.PrintTime').toString(),
                value: 'estimated_time',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'time',
            },
            {
                text: this.$t('Files.LastStartTime').toString(),
                value: 'last_start_time',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'date',
            },
            {
                text: this.$t('Files.LastEndTime').toString(),
                value: 'last_end_time',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'date',
            },
            {
                text: this.$t('Files.LastPrintDuration').toString(),
                value: 'last_print_duration',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'time',
            },
            {
                text: this.$t('Files.LastTotalDuration').toString(),
                value: 'last_total_duration',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'time',
            },
            {
                text: this.$t('Files.LastFilamentUsed').toString(),
                value: 'last_filament_used',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'length',
            },
            {
                text: this.$t('Files.Slicer').toString(),
                value: 'slicer',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'string',
            },
        ]

        let unknownPos = 0
        headers.forEach((header) => {
            header.visible = !this.hideMetadataColumns.includes(header.value)

            let pos = this.orderMetadataColumns?.findIndex((value: string) => value === header.value)
            if (pos === -1) {
                unknownPos++
                pos = this.orderMetadataColumns.length + unknownPos
            }
            header.pos = pos
        })

        return headers.sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0))
    }

    set configurableHeaders(newVal) {
        const orderArray: string[] = []
        newVal.forEach((row: tableColumnSetting) => orderArray.push(row.value))

        this.orderMetadataColumns = orderArray
    }

    get headers() {
        return [...this.fixedHeaders, ...this.configurableHeaders]
    }

    get tableColumns() {
        return this.configurableHeaders.filter((column) => column.visible)
    }

    get directory() {
        return this.$store.getters['files/getDirectory']('gcodes' + this.currentPath)
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0 }
    }

    get files() {
        return this.$store.getters['files/getGcodeFiles'](this.currentPath, this.showHiddenFiles, this.showPrintedFiles)
    }

    get filteredHeaders() {
        return this.headers.filter((header) => header.visible)
    }

    get orderMetadataColumns() {
        return this.$store.state.gui.view.gcodefiles.orderMetadataColumns ?? []
    }

    set orderMetadataColumns(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.orderMetadataColumns', value: newVal })
    }

    get hideMetadataColumns() {
        return this.$store.state.gui.view.gcodefiles.hideMetadataColumns ?? []
    }

    set hideMetadataColumns(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.hideMetadataColumns', value: newVal })
    }

    get showHiddenFiles() {
        return this.$store.state.gui.view.gcodefiles.showHiddenFiles
    }

    set showHiddenFiles(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showHiddenFiles', value: newVal })
    }

    get showPrintedFiles() {
        return this.$store.state.gui.view.gcodefiles.showPrintedFiles
    }

    set showPrintedFiles(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showPrintedFiles', value: newVal })
    }

    get sortBy() {
        return this.$store.state.gui.view.gcodefiles.sortBy
    }

    set sortBy(newVal) {
        if (newVal === undefined) newVal = 'modified'

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.gcodefiles.sortDesc
    }

    set sortDesc(newVal) {
        if (newVal === undefined) newVal = false

        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortDesc', value: newVal })
    }

    get countPerPage() {
        return this.$store.state.gui.view.gcodefiles.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.countPerPage', value: newVal })
    }

    getStatusIcon(status: string | null) {
        return this.$store.getters['server/history/getPrintStatusIcon'](status)
    }

    getStatusTextColor(status: string | null) {
        return this.$store.getters['server/history/getPrintStatusTextColor'](status)
    }

    getStatusColor(status: string | null) {
        return this.$store.getters['server/history/getPrintStatusIconColor'](status)
    }

    dragOverFilelist(e: any, row: any) {
        e.preventDefault()

        if (row.isDirectory) e.target.parentElement.style.backgroundColor = '#43A04720'
    }

    dragLeaveFilelist(e: any) {
        e.preventDefault()
        e.stopPropagation()

        e.target.parentElement.style.backgroundColor = 'transparent'
    }

    async dragDropFilelist(e: any, row: any) {
        e.preventDefault()
        e.target.parentElement.style.backgroundColor = 'transparent'

        let dest: string
        if (row.filename === '..') {
            dest =
                this.currentPath.substring(0, this.currentPath.lastIndexOf('/') + 1) + this.draggingFile.item.filename
        } else dest = this.currentPath + '/' + row.filename + '/' + this.draggingFile.item.filename

        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes' + this.currentPath + '/' + this.draggingFile.item.filename,
                dest: 'gcodes' + dest,
            },
            { action: 'files/getMove' }
        )
    }

    async uploadFile() {
        if (this.$refs.fileUpload.files?.length) {
            const files = [...this.$refs.fileUpload.files]
            this.$refs.fileUpload.value = ''

            await this.$store.dispatch('socket/addLoading', { name: 'gcodeUpload' })
            await this.$store.dispatch('files/uploadSetCurrentNumber', 0)
            await this.$store.dispatch('files/uploadSetMaxNumber', this.$refs.fileUpload.files.length)
            for (const file of files) {
                await this.$store.dispatch('files/uploadIncrementCurrentNumber')
                const path = this.currentPath.slice(0, 1) === '/' ? this.currentPath.slice(1) : this.currentPath
                const result = await this.$store.dispatch('files/uploadFile', {
                    file,
                    path,
                    root: 'gcodes',
                })

                if (result !== false)
                    this.$toast.success(this.$t('Files.SuccessfullyUploaded', { filename: result }).toString())
            }

            await this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
        }
    }

    clickUploadButton() {
        this.$refs.fileUpload.click()
    }

    createDirectory() {
        this.dialogCreateDirectory.name = ''
        this.dialogCreateDirectory.show = true

        setTimeout(() => {
            this.$refs.inputFieldCreateDirectory?.focus()
        }, 200)
    }

    createDirectoryAction() {
        if (this.dialogCreateDirectory.name.length) {
            this.dialogCreateDirectory.show = false
            this.$socket.emit(
                'server.files.post_directory',
                { path: 'gcodes' + this.currentPath + '/' + this.dialogCreateDirectory.name },
                { action: 'files/getCreateDir' }
            )
        }
    }

    refreshFileList() {
        this.$socket.emit(
            'server.files.get_directory',
            { path: 'gcodes' + this.currentPath },
            { action: 'files/getDirectory' }
        )
    }

    advancedSearch(value: any, search: string | null) {
        if (search === null) return false
        if (typeof value !== 'string') return false

        value = value.toString().toLowerCase()
        const searchSplits = search.toLowerCase().split(' ')
        for (const searchWord of searchSplits) {
            if (!value.includes(searchWord)) return false
        }

        return true
    }

    refreshMetadata(data: FileStateGcodefile[]) {
        const items = data.filter((file) => !file.isDirectory && !file.metadataRequested && !file.metadataPulled)
        items.forEach((file: FileStateGcodefile) => {
            this.$store.dispatch('files/requestMetadata', {
                filename: 'gcodes' + this.currentPath + '/' + file.filename,
            })
        })
    }

    clickRow(item: FileStateGcodefile, force = false) {
        if (!this.contextMenu.shown || force) {
            if (force) this.contextMenu.shown = false

            if (item.isDirectory) {
                this.currentPath += '/' + item.filename
            } else if (!['error', 'printing', 'paused'].includes(this.printer_state) && this.isGcodeFile(item)) {
                this.dialogPrintFile.show = true
                this.dialogPrintFile.item = item
            }
        }
    }

    clickRowGoBack() {
        this.currentPath = this.currentPath.slice(0, this.currentPath.lastIndexOf('/'))
    }

    async addToQueue(item: FileStateGcodefile) {
        let filename = [this.currentPath, item.filename].join('/')
        if (filename.startsWith('/')) filename = filename.slice(1)

        await this.$store.dispatch('server/jobQueue/addToQueue', [filename])
    }

    openAddBatchToQueueDialog(item: FileStateGcodefile) {
        this.dialogAddBatchToQueue.show = true
        this.dialogAddBatchToQueue.count = 1
        this.dialogAddBatchToQueue.item = item
    }

    async addBatchToQueueAction() {
        let filename = [this.currentPath, this.dialogAddBatchToQueue.item.filename].join('/')
        if (filename.startsWith('/')) filename = filename.slice(1)

        const array: string[] = []
        for (let i = 0; i < this.dialogAddBatchToQueue.count; i++) {
            array.push(filename)
        }

        await this.$store.dispatch('server/jobQueue/addToQueue', array)

        this.dialogAddBatchToQueue.show = false
    }

    changeMetadataVisible(name: string, value: boolean) {
        this.$store.dispatch('gui/setGcodefilesMetadata', { name: name, value: value })
    }

    showContextMenu(e: any, item: FileStateGcodefile) {
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

    editFile(item: FileStateGcodefile) {
        this.$store.dispatch('editor/openFile', {
            root: 'gcodes',
            path: this.currentPath,
            filename: item.filename,
            size: item.size,
            permissions: item.permissions,
        })
    }

    downloadFile() {
        const filename = this.currentPath + '/' + this.contextMenu.item.filename
        const href = this.apiUrl + '/server/files/gcodes' + encodeURI(filename)

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

        await addElementToItems('gcodes/' + this.currentPath, this.selectedFiles)
        const date = new Date()
        const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDay()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`

        this.$socket.emit(
            'server.files.zip',
            { items, dest: `config/gcodes-${timestamp}.zip` },
            { action: 'files/downloadZip', loading: 'gcodeDownloadZip' }
        )

        this.selectedFiles = []
    }

    renameFile(item: FileStateGcodefile) {
        this.dialogRenameFile.item = item
        this.dialogRenameFile.newName = item.filename
        this.dialogRenameFile.show = true

        setTimeout(() => {
            this.$refs.inputFieldRenameFile?.focus()
        }, 200)
    }

    renameFileAction() {
        this.dialogRenameFile.show = false
        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes' + this.currentPath + '/' + this.dialogRenameFile.item.filename,
                dest: 'gcodes' + this.currentPath + '/' + this.dialogRenameFile.newName,
            },
            { action: 'files/getMove' }
        )
    }

    duplicateFile(item: FileStateGcodefile) {
        this.dialogDuplicateFile.item = item
        this.dialogDuplicateFile.newName = item.filename
        this.dialogDuplicateFile.show = true

        setTimeout(() => {
            this.$refs.inputFieldDuplicateFile?.focus()
        }, 200)
    }

    duplicateFileAction() {
        this.dialogDuplicateFile.show = false
        this.$socket.emit('server.files.copy', {
            source: 'gcodes' + this.currentPath + '/' + this.dialogDuplicateFile.item.filename,
            dest: 'gcodes' + this.currentPath + '/' + this.dialogDuplicateFile.newName,
        })
    }

    renameDirectory(item: FileStateGcodefile) {
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
                source: 'gcodes' + this.currentPath + '/' + this.dialogRenameDirectory.item.filename,
                dest: 'gcodes' + this.currentPath + '/' + this.dialogRenameDirectory.newName,
            },
            { action: 'files/getMove' }
        )
    }

    removeFile() {
        this.$socket.emit(
            'server.files.delete_file',
            { path: 'gcodes' + this.currentPath + '/' + this.contextMenu.item.filename },
            { action: 'files/getDeleteFile' }
        )

        this.deleteDialog = false
    }

    deleteDirectory(item: FileStateGcodefile) {
        this.dialogDeleteDirectory.item = item
        this.dialogDeleteDirectory.show = true
    }

    deleteDirectoryAction() {
        this.dialogDeleteDirectory.show = false
        this.$socket.emit(
            'server.files.delete_directory',
            { path: 'gcodes' + this.currentPath + '/' + this.contextMenu.item.filename, force: true },
            { action: 'files/getDeleteDir' }
        )
    }

    closeStartPrint() {
        this.dialogPrintFile.show = false
    }

    dragFile(e: Event, item: FileStateGcodefile) {
        e.preventDefault()
        this.draggingFile.item = item
    }

    dragendFile(e: Event) {
        e.preventDefault()
        this.draggingFile.item = {
            isDirectory: false,
            filename: '',
            permissions: '',
            modified: new Date(),
            count_printed: 0,
            preheat_gcode: null,
            small_thumbnail: null,
            big_thumbnail: null,
            big_thumbnail_width: null,
            last_filament_used: null,
            last_start_time: null,
            last_end_time: null,
            last_print_duration: null,
            last_status: null,
            last_total_duration: null,
        }
    }

    @Watch('hideMetadataColums')
    hideMetadataColumsCanged(newVal: string[]) {
        newVal.forEach((key) => {
            let headerElement = this.headers.find((element) => element.value === key)
            if (headerElement) headerElement.visible = false
        })
    }

    isGcodeFile(file: FileStateFile) {
        const format = file.filename.slice(file.filename.lastIndexOf('.'))

        return validGcodeExtensions.includes(format)
    }

    view3D(item: FileStateFile) {
        this.$router.push({ path: '/viewer', query: { filename: 'gcodes' + this.currentPath + '/' + item.filename } })
    }

    scanMeta(item: FileStateFile) {
        this.$store.dispatch('files/scanMetadata', {
            filename: 'gcodes' + this.currentPath + '/' + item.filename,
        })
    }

    deleteSelectedFiles() {
        this.selectedFiles.forEach((item: FileStateGcodefile) => {
            if (item.isDirectory) {
                this.$socket.emit(
                    'server.files.delete_directory',
                    { path: 'gcodes' + this.currentPath + '/' + item.filename, force: true },
                    { action: 'files/getDeleteDir' }
                )
            } else {
                this.$socket.emit(
                    'server.files.delete_file',
                    { path: 'gcodes' + this.currentPath + '/' + item.filename },
                    { action: 'files/getDeleteFile' }
                )
            }
        })

        this.selectedFiles = []
        this.deleteSelectedDialog = false
    }

    outputValue(col: any, item: FileStateGcodefile) {
        const value = col.value in item ? item[col.value] : null

        if (value !== null) {
            switch (col.outputType) {
                case 'filesize':
                    return formatFilesize(value)

                case 'date':
                    return this.formatDateTime(value)

                case 'time':
                    return this.formatPrintTime(value)

                case 'temp':
                    return value.toFixed() + ' °C'

                case 'length':
                    if (value > 1000) return (value / 1000).toFixed(2) + ' m'

                    return value.toFixed(2) + ' mm'

                case 'weight':
                    return value.toFixed(2) + ' g'

                default:
                    return value
            }
        } else return '--'
    }
}
</script>

<style scoped>
._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}
</style>

<style>
/*noinspection CssUnusedSymbol*/
.files-table .v-data-table-header__icon {
    margin-left: 7px;
}

.files-table .file-list-cursor:hover {
    cursor: pointer;
}

/*noinspection CssUnusedSymbol*/
.file-list--select-td {
    width: 20px;
}

/*noinspection CssUnusedSymbol*/
.files-table th.text-start {
    padding-right: 0 !important;
}

/*noinspection CssUnusedSymbol*/
.v-chip.minimum-chip {
    padding: 0;
    min-width: 24px;
}

/*noinspection CssUnusedSymbol*/
.v-chip.minimum-chip .v-chip__content {
    margin: 0 auto;
}

/*noinspection CssUnusedSymbol*/
.file-list__count_printed {
    position: relative;
    top: 1px;
}

.handle {
    cursor: move;
}
</style>
