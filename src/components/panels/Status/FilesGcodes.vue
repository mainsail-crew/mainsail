<style lang="scss" scoped></style>

<template>
    <v-card ref="filesGcodeCard" flat>
        <v-data-table
            :items="gcodeFiles"
            hide-default-footer
            class="dashboard-gcodes-table"
            sort-by="time_added"
            mobile-breakpoint="0"
            @current-items="setFirst">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.Files.EmptyGcodes') }}</div>
            </template>

            <template #item="{ item }">
                <tr
                    :key="item.filename"
                    v-longpress:600="(e) => showContextMenu(e, item)"
                    class="cursor-pointer"
                    @contextmenu="showContextMenu($event, item)"
                    @click="showDialog(item)">
                    <td class="pr-0 text-center" style="width: 32px">
                        <template v-if="item.small_thumbnail && item.big_thumbnail">
                            <v-tooltip top content-class="tooltip__content-opacity1">
                                <template #activator="{ on, attrs }">
                                    <vue-load-image class="d-flex">
                                        <img
                                            slot="image"
                                            :src="item.small_thumbnail"
                                            width="32"
                                            height="32"
                                            v-bind="attrs"
                                            v-on="on" />
                                        <v-progress-circular
                                            slot="preloader"
                                            indeterminate
                                            color="primary"></v-progress-circular>
                                        <v-icon slot="error">{{ mdiFile }}</v-icon>
                                    </vue-load-image>
                                </template>
                                <span><img :src="item.big_thumbnail" width="250" /></span>
                            </v-tooltip>
                        </template>
                        <template v-else-if="item.small_thumbnail">
                            <vue-load-image>
                                <img slot="image" :src="item.small_thumbnail" width="32" height="32" />
                                <v-progress-circular
                                    slot="preloader"
                                    indeterminate
                                    color="primary"></v-progress-circular>
                                <v-icon slot="error">{{ mdiFile }}</v-icon>
                            </vue-load-image>
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
                        <v-tooltip v-if="getJobStatus(item)" top>
                            <template #activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                    <v-icon small :color="getStatusColor(getJobStatus(item))">
                                        {{ getStatusIcon(getJobStatus(item)) }}
                                    </v-icon>
                                </span>
                            </template>
                            <span>{{ getJobStatus(item).replace(/_/g, ' ') }}</span>
                        </v-tooltip>
                    </td>
                </tr>
            </template>
        </v-data-table>
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
                    v-if="
                        'first_layer_extr_temp' in contextMenu.item &&
                        contextMenu.item.first_layer_extr_temp > 0 &&
                        'first_layer_bed_temp' in contextMenu.item &&
                        contextMenu.item.first_layer_bed_temp > 0
                    "
                    :disabled="['error', 'printing', 'paused'].includes(printer_state)"
                    @click="preheat(contextMenu.item)">
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
                    <v-icon class="mr-1">{{ mdiPencil }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="renameFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item class="red--text" @click="removeFile(contextMenu.item)">
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
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiFile } from '@mdi/js'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import {
    mdiPlay,
    mdiPlaylistPlus,
    mdiFire,
    mdiVideo3d,
    mdiCloudDownload,
    mdiPencil,
    mdiRenameBox,
    mdiDelete,
    mdiCloseThick,
} from '@mdi/js'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateGcodefile
}

@Component({
    components: {
        StartPrintDialog,
    },
})
export default class StatusPanelFilesGcodes extends Mixins(BaseMixin) {
    mdiFile = mdiFile
    mdiPlay = mdiPlay
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiFire = mdiFire
    mdiVideo3d = mdiVideo3d
    mdiCloudDownload = mdiCloudDownload
    mdiPencil = mdiPencil
    mdiRenameBox = mdiRenameBox
    mdiDelete = mdiDelete
    mdiCloseThick = mdiCloseThick

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
        item: {
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

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
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

    getDescription(item: FileStateGcodefile) {
        let output = ''

        output += this.$t('Panels.StatusPanel.Files.Filament') + ': '
        if (item.filament_total || item.filament_weight_total) {
            if (item.filament_total) output += item.filament_total.toFixed() + ' mm'
            if (item.filament_total && item.filament_weight_total) output += ' / '
            if (item.filament_weight_total) output += item.filament_weight_total.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Panels.StatusPanel.Files.PrintTime') + ': '
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

    getJobStatus(item: FileStateGcodefile) {
        return item.last_status
    }

    getStatusIcon(status: string) {
        return this.$store.getters['server/history/getPrintStatusIcon'](status)
    }

    getStatusColor(status: string) {
        return this.$store.getters['server/history/getPrintStatusIconColor'](status)
    }

    showDialog(file: FileStateGcodefile) {
        this.currentPath =
            file.filename.lastIndexOf('/') >= 0
                ? 'gcodes/' + file.filename.slice(0, file.filename.lastIndexOf('/'))
                : 'gcodes'
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

    preheat(item: FileStateGcodefile) {
        if (
            'first_layer_extr_temp' in item &&
            'first_layer_bed_temp' in item &&
            !['error', 'printing', 'paused'].includes(this.printer_state)
        ) {
            if (item.first_layer_extr_temp && item.first_layer_extr_temp > 0) {
                const gcode = 'M104 S' + item.first_layer_extr_temp
                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }

            if (item.first_layer_bed_temp && item.first_layer_bed_temp > 0) {
                const gcode = 'M140 S' + item.first_layer_bed_temp
                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }
        }
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

    removeFile(item: FileStateGcodefile) {
        this.$socket.emit(
            'server.files.delete_file',
            { path: 'gcodes/' + item.filename },
            { action: 'files/getDeleteFile' }
        )
    }

    mounted() {
        window.addEventListener('resize', this.eventListenerResize)
        this.eventListenerResize()
    }

    destroyed() {
        window.removeEventListener('resize', this.eventListenerResize)
    }

    eventListenerResize() {
        this.contentTdWidth = this.$refs.filesGcodeCard?.$el?.clientWidth - 48 - 48 - 32
    }
}
</script>
