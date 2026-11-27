<template>
    <panel :title="$t('Files.GCodeFiles')" :icon="mdiFileDocumentMultipleOutline" card-class="gcode-files-panel">
        <file-browser
            root="gcodes"
            :path="currentPath"
            :items="files"
            :selected.sync="selectedFiles"
            :columns="columns"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :items-per-page.sync="countPerPage"
            :search.sync="search"
            :upload-accept="uploadAccept"
            @update:path="updatePath"
            @click:file="clickFile">
            <template #toolbar-append>
                <gcodefiles-panel-header-settings />
            </template>
            <template #item.icon="{ item }">
                <gcodefiles-thumbnail :item="item" />
            </template>
            <template #item.columns="{ item }">
                <td v-if="item.isDirectory" :colspan="columns.length" />
                <template v-else>
                    <gcodefiles-panel-table-row-file-status :item="item" />
                    <template v-for="col in tableColumns">
                        <gcodefiles-panel-table-row-file-metadata-slicer
                            v-if="col.value === 'slicer'"
                            :key="col.value"
                            :item="item" />
                        <gcodefiles-panel-table-row-file-metadata-filaments
                            v-else-if="col.value === 'filaments'"
                            :key="col.value"
                            :item="item" />
                        <gcodefiles-panel-table-row-file-metadata-filament-strings
                            v-else-if="col.value === 'filament_name' || col.value === 'filament_type'"
                            :key="col.value"
                            :item="item"
                            :column="col.value" />
                        <gcodefiles-panel-table-row-file-metadata v-else :key="col.value" :col="col" :item="item" />
                    </template>
                </template>
            </template>
            <template #context-menu="{ item }">
                <v-list-item :disabled="!canStartPrint" @click="openStartPrintDialog(item)">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('Files.PrintStart') }}
                </v-list-item>
                <template v-if="existsJobQueue">
                    <v-list-item @click="addToQueue(item)">
                        <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                        {{ $t('Files.AddToQueue') }}
                    </v-list-item>
                    <v-list-item @click="openAddBatchToQueueDialog(item)">
                        <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                        {{ $t('Files.AddBatchToQueue') }}
                    </v-list-item>
                </template>
                <v-list-item
                    v-if="item.preheat_gcode !== null"
                    :disabled="printerIsBusy"
                    @click="doSend(item.preheat_gcode)">
                    <v-icon class="mr-1">{{ mdiFire }}</v-icon>
                    {{ $t('Files.Preheat') }}
                </v-list-item>
                <v-list-item @click="view3D(item)">
                    <v-icon class="mr-1">{{ mdiVideo3d }}</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item @click="scanMetadata(item)">
                    <v-icon class="mr-1">{{ mdiMagnify }}</v-icon>
                    {{ $t('Files.ScanMeta') }}
                </v-list-item>
                <v-list-item @click="editFile(item)">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
            </template>
        </file-browser>
        <template v-if="activeFile">
            <start-print-dialog v-model="showStartPrintDialog" :file="activeFile" :current-path="currentPath" />
            <add-batch-to-queue-dialog v-model="showAddBatchToQueueDialog" :filename="activeFile.full_filename" />
        </template>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import FileBrowser from '@/components/files/FileBrowser.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import GcodefilesPanelHeaderSettings from '@/components/panels/Gcodefiles/GcodefilesPanelHeaderSettings.vue'
import GcodefilesThumbnail from '@/components/panels/Gcodefiles/GcodefilesThumbnail.vue'
import GcodefilesPanelTableRowFileMetadata from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFileMetadata.vue'
import GcodefilesPanelTableRowFileMetadataFilaments from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFileMetadataFilaments.vue'
import GcodefilesPanelTableRowFileMetadataFilamentStrings from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFileMetadataFilamentStrings.vue'
import GcodefilesPanelTableRowFileMetadataSlicer from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFileMetadataSlicer.vue'
import GcodefilesPanelTableRowFileStatus from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFileStatus.vue'
import { FileStateGcodefile } from '@/store/files/types'
import type { FileBrowserColumn } from '@/components/files/types'
import { validGcodeExtensions } from '@/store/variables'
import {
    mdiFileDocumentEditOutline,
    mdiFileDocumentMultipleOutline,
    mdiFire,
    mdiMagnify,
    mdiPlay,
    mdiPlaylistPlus,
    mdiVideo3d,
} from '@mdi/js'

@Component({
    components: {
        AddBatchToQueueDialog,
        FileBrowser,
        GcodefilesPanelHeaderSettings,
        GcodefilesPanelTableRowFileMetadata,
        GcodefilesPanelTableRowFileMetadataFilaments,
        GcodefilesPanelTableRowFileMetadataFilamentStrings,
        GcodefilesPanelTableRowFileMetadataSlicer,
        GcodefilesPanelTableRowFileStatus,
        GcodefilesThumbnail,
        StartPrintDialog,
    },
})
export default class GcodefilesPanel extends Mixins(BaseMixin, ControlMixin, GcodefilesMixin) {
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiFileDocumentMultipleOutline = mdiFileDocumentMultipleOutline
    mdiFire = mdiFire
    mdiMagnify = mdiMagnify
    mdiPlay = mdiPlay
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiVideo3d = mdiVideo3d

    /** Path (relative to the gcodes root) of the file of the start print and add batch to queue dialogs */
    activeFilePath: string | null = null
    showStartPrintDialog = false
    showAddBatchToQueueDialog = false

    get sortBy() {
        return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
    }

    set sortBy(newVal: string) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortBy', value: newVal })
    }

    get sortDesc() {
        return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
    }

    set sortDesc(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortDesc', value: newVal })
    }

    /** Looked up from the store, so the dialogs show metadata that is loaded while they are open */
    get activeFile(): FileStateGcodefile | null {
        if (this.activeFilePath === null) return null

        return this.$store.getters['files/getGcodeFile'](this.activeFilePath)
    }

    get countPerPage() {
        return this.$store.state.gui.view.gcodefiles.countPerPage ?? 10
    }

    set countPerPage(newVal: number) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.countPerPage', value: newVal })
    }

    get columns(): FileBrowserColumn[] {
        return [
            { text: '', value: 'status', sortable: false, class: 'text-no-wrap' },
            ...this.tableColumns.map((column) => ({ text: column.text, value: column.value, class: column.class })),
        ]
    }

    get uploadAccept() {
        // iOS doesn't recognize the gcode file types and would disable all files
        if (this.isIOS) return []

        return validGcodeExtensions
    }

    get existsJobQueue() {
        return this.moonrakerComponents.includes('job_queue')
    }

    get printerIsBusy() {
        return ['error', 'printing', 'paused'].includes(this.printer_state)
    }

    get canStartPrint() {
        return this.klipperReadyForGui && !this.printerIsBusy
    }

    updatePath(path: string) {
        this.currentPath = path ? `/${path}` : ''
    }

    clickFile(item: FileStateGcodefile) {
        if (this.printerIsBusy) return

        this.openStartPrintDialog(item)
    }

    openStartPrintDialog(item: FileStateGcodefile) {
        this.activeFilePath = item.full_filename
        // the dialog is created with the first file, so it has to be opened after it exists
        this.$nextTick(() => (this.showStartPrintDialog = true))
    }

    openAddBatchToQueueDialog(item: FileStateGcodefile) {
        this.activeFilePath = item.full_filename
        this.$nextTick(() => (this.showAddBatchToQueueDialog = true))
    }

    addToQueue(item: FileStateGcodefile) {
        this.$store.dispatch('server/jobQueue/addToQueue', [item.full_filename])
    }

    view3D(item: FileStateGcodefile) {
        this.$router.push({ path: '/viewer', query: { filename: `gcodes/${item.full_filename}` } })
    }

    scanMetadata(item: FileStateGcodefile) {
        this.$store.dispatch('files/scanMetadata', item.full_filename)
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
}
</script>
