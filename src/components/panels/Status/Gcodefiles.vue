<template>
    <v-card ref="filesGcodeCard" class="filesGcodeCard" flat>
        <v-data-table
            :items="gcodeFiles"
            hide-default-footer
            class="dashboard-gcodes-table"
            sort-by="time_added"
            mobile-breakpoint="0"
            @current-items="setFirst">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.EmptyGcodes') }}</div>
            </template>

            <template #item="{ item }">
                <tr
                    :key="item.filename"
                    v-longpress:600="(e) => showContextMenu(e, item)"
                    class="cursor-pointer"
                    @contextmenu="showContextMenu($event, item)"
                    @click="showDialog(item)">
                    <td class="pr-0 text-center" style="width: 32px">
                        <template v-if="item.small_thumbnail">
                            <v-tooltip top content-class="tooltip__content-opacity1" :disabled="!item.big_thumbnail">
                                <template #activator="{ on, attrs }">
                                    <vue-load-image class="d-flex">
                                        <img
                                            slot="image"
                                            :src="item.small_thumbnail"
                                            :alt="item.filename"
                                            width="32"
                                            height="32"
                                            v-bind="attrs"
                                            v-on="on" />
                                        <div slot="preloader">
                                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                        </div>
                                        <div slot="error">
                                            <v-icon>{{ mdiFile }}</v-icon>
                                        </div>
                                    </vue-load-image>
                                </template>
                                <span><img :src="item.big_thumbnail" :alt="item.filename" width="250" /></span>
                            </v-tooltip>
                        </template>
                        <template v-else>
                            <v-icon>{{ mdiFile }}</v-icon>
                        </template>
                    </td>
                    <td class="pr-2">
                        <div class="d-block text-truncate" :style="styleContentTdWidth">{{ item.filename }}</div>
                        <div v-if="existMetadata(item)">
                            <small>{{ getDescription(item) }}</small>
                        </div>
                    </td>
                    <td>
                        <v-tooltip v-if="item.last_status" top>
                            <template #activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                    <v-icon small :color="getStatusColor(item.last_status)">
                                        {{ getStatusIcon(item.last_status) }}
                                    </v-icon>
                                </span>
                            </template>
                            <span>{{ item.last_status.replace(/_/g, ' ') }}</span>
                        </v-tooltip>
                    </td>
                </tr>
            </template>
        </v-data-table>
        <resize-observer @notify="handleResize" />
        <start-print-dialog
            :bool="showDialogBool"
            :file="dialogFile"
            :current-path="currentPath"
            @closeDialog="closeDialog"></start-print-dialog>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item :disabled="printerIsPrinting || !klipperReadyForGui" @click="showDialog(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('Files.PrintStart') }}
                </v-list-item>
                <v-list-item v-if="moonrakerComponents.includes('job_queue')" @click="addToQueue(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="moonrakerComponents.includes('job_queue')"
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
                <v-list-item @click="view3D(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiVideo3d }}</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item @click="downloadFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Files.Download') }}
                </v-list-item>
                <v-list-item @click="editFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogRenameFile.show" :max-width="400">
            <panel
                :title="$t('Files.RenameFile')"
                card-class="dashboard-files-rename-file-dialog"
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
                        :label="$t('Files.Name')"
                        required
                        @keyup.enter="renameFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogRenameFile.show = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFileAction">{{ $t('Files.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE FILE DIALOG -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <panel :title="$t('Files.Delete')" card-class="gcode-files-delete-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">
                        {{ $t('Files.DeleteSingleFileQuestion', { name: filename }) }}
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
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { FileStateGcodefile } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import {
    mdiChevronDown,
    mdiChevronUp,
    mdiFile,
    mdiPlay,
    mdiPlaylistPlus,
    mdiFire,
    mdiVideo3d,
    mdiCloudDownload,
    mdiFileDocumentEditOutline,
    mdiRenameBox,
    mdiDelete,
    mdiCloseThick,
} from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateGcodefile
}

interface dialogAddBatchToQueue {
    show: boolean
    count: number
    item: FileStateGcodefile
}

@Component({
    components: {
        Panel,
        StartPrintDialog,
    },
})
export default class StatusPanelGcodefiles extends Mixins(BaseMixin, ControlMixin) {
    mdiChevronDown = mdiChevronDown
    mdiChevronUp = mdiChevronUp
    mdiFile = mdiFile
    mdiPlay = mdiPlay
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiFire = mdiFire
    mdiVideo3d = mdiVideo3d
    mdiCloudDownload = mdiCloudDownload
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiRenameBox = mdiRenameBox
    mdiDelete = mdiDelete
    mdiCloseThick = mdiCloseThick

    private deleteDialog = false
    private showDialogBool = false
    private dialogFile: FileStateGcodefile = {
        isDirectory: false,
        filename: '',
        modified: new Date(),
        permissions: '',
        small_thumbnail: null,
        big_thumbnail: null,
        big_thumbnail_width: null,
        count_printed: 0,
        last_end_time: null,
        last_filament_used: null,
        last_print_duration: null,
        last_status: null,
        last_start_time: null,
        last_total_duration: null,
        preheat_gcode: null,
    }
    private currentPath = ''
    private contentTdWidth = 100

    declare $refs: {
        filesGcodeCard: any
        inputFieldRenameFile: HTMLInputElement
    }

    private contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: { ...this.dialogFile },
    }

    private dialogRenameFile: dialogRenameObject = {
        show: false,
        newName: '',
        item: { ...this.dialogFile },
    }

    private dialogAddBatchToQueue: dialogAddBatchToQueue = {
        show: false,
        count: 1,
        item: { ...this.contextMenu.item },
    }

    private countInputRules = [
        (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
        (value: string) => parseInt(value) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
    ]

    get gcodeFiles() {
        let gcodes = this.$store.getters['files/getAllGcodes'] ?? []
        gcodes = gcodes
            .slice()
            .sort((a: FileStateGcodefile, b: FileStateGcodefile) => {
                return b.modified.getTime() - a.modified.getTime()
            })
            .slice(0, 5)

        const requestItems = gcodes.filter(
            (file: FileStateGcodefile) => !file.metadataRequested && !file.metadataPulled
        )
        requestItems.forEach((file: FileStateGcodefile) => {
            this.$store.dispatch('files/requestMetadata', {
                filename: 'gcodes/' + file.filename,
            })
        })

        return gcodes
    }

    get filename() {
        const filename = this.contextMenu.item.filename.split('/')
        return filename[filename.length - 1]
    }

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
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

    getDescription(item: FileStateGcodefile) {
        let output = ''

        output += this.$t('Panels.StatusPanel.Filament') + ': '
        if (item.filament_total || item.filament_weight_total) {
            if (item.filament_total) output += item.filament_total.toFixed() + ' mm'
            if (item.filament_total && item.filament_weight_total) output += ' / '
            if (item.filament_weight_total) output += item.filament_weight_total.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Panels.StatusPanel.PrintTime') + ': '
        if (item.estimated_time) output += this.formatPrintTime(item.estimated_time)
        else output += '--'

        return output
    }

    existMetadata(item: FileStateGcodefile) {
        return item?.metadataPulled
    }

    setFirst(currItems: any) {
        // first check that actually exists values
        if (currItems.length) {
            // toggle all to false
            currItems.forEach((x: any) => (x.isFirst = false))
            // just set first to true
            currItems[0].isFirst = true
        }
    }

    formatPrintTime(totalSeconds: number) {
        if (totalSeconds) {
            let output = ''

            const days = Math.floor(totalSeconds / (3600 * 24))
            if (days) {
                totalSeconds %= 3600 * 24
                output += days + 'd'
            }

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output += ' ' + hours + 'h'

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output += ' ' + minutes + 'm'

            const seconds = totalSeconds % 60
            if (seconds) output += ' ' + seconds.toFixed(0) + 's'

            return output
        }

        return '--'
    }

    getStatusIcon(status: string) {
        return this.$store.getters['server/history/getPrintStatusIcon'](status)
    }

    getStatusColor(status: string) {
        return this.$store.getters['server/history/getPrintStatusIconColor'](status)
    }

    showDialog(file: FileStateGcodefile) {
        this.currentPath =
            file.filename.lastIndexOf('/') >= 0 ? '/' + file.filename.slice(0, file.filename.lastIndexOf('/')) : ''
        this.dialogFile = { ...file }
        if (file.filename.lastIndexOf('/') >= 0) {
            this.dialogFile.filename = file.filename.slice(file.filename.lastIndexOf('/') + 1)
        }
        this.showDialogBool = true
    }

    closeDialog() {
        this.showDialogBool = false
    }

    addToQueue(item: FileStateGcodefile) {
        this.$store.dispatch('server/jobQueue/addToQueue', [item.filename])
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

    view3D(item: FileStateGcodefile) {
        this.$router.push({ path: '/viewer', query: { filename: 'gcodes/' + item.filename } })
    }

    downloadFile(item: FileStateGcodefile) {
        const href = this.apiUrl + '/server/files/gcodes/' + encodeURI(item.filename)

        window.open(href)
    }

    editFile(item: FileStateGcodefile) {
        const pos = item.filename.lastIndexOf('/')
        const path = pos > 0 ? item.filename.slice(0, pos + 1) : ''
        const filename = pos > 0 ? item.filename.slice(pos + 1) : item.filename

        this.$store.dispatch('editor/openFile', {
            root: 'gcodes',
            path,
            filename,
            size: item.size,
            permissions: item.permissions,
        })
    }

    renameFile(item: FileStateGcodefile) {
        this.dialogRenameFile.item = item
        const pos = item.filename.lastIndexOf('/')
        this.dialogRenameFile.newName = pos > 0 ? item.filename.slice(pos + 1) : item.filename
        this.dialogRenameFile.show = true

        setTimeout(() => {
            this.$refs.inputFieldRenameFile?.focus()
        }, 200)
    }

    renameFileAction() {
        this.dialogRenameFile.show = false
        const pos = this.dialogRenameFile.item.filename.lastIndexOf('/')
        const path = pos > 0 ? this.dialogRenameFile.item.filename.slice(0, pos + 1) : ''

        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes/' + this.dialogRenameFile.item.filename,
                dest: 'gcodes/' + path + this.dialogRenameFile.newName,
            },
            { action: 'files/getMove' }
        )
    }

    removeFile() {
        this.$socket.emit(
            'server.files.delete_file',
            { path: 'gcodes/' + this.contextMenu.item.filename },
            { action: 'files/getDeleteFile' }
        )

        this.deleteDialog = false
    }

    mounted() {
        setTimeout(() => {
            this.calcContentTdWidth()
        }, 200)
    }

    calcContentTdWidth() {
        this.contentTdWidth = this.$refs.filesGcodeCard?.$el?.clientWidth - 48 - 48 - 32
    }

    handleResize() {
        this.$nextTick(() => {
            this.calcContentTdWidth()
        })
    }
}
</script>

<style scoped>
.filesGcodeCard {
    position: relative;
}

._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}
</style>
