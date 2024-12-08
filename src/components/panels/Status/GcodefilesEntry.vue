<template>
    <tr
        v-longpress:600="(e) => showContextMenu(e)"
        class="cursor-pointer"
        @contextmenu="showContextMenu($event)"
        @click="showPrintDialog = true">
        <td class="pr-0 text-center" style="width: 32px">
            <template v-if="item.small_thumbnail">
                <v-tooltip
                    top
                    content-class="tooltip__content-opacity1"
                    :disabled="!item.big_thumbnail"
                    :color="bigThumbnailTooltipColor">
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
                                <v-progress-circular indeterminate color="primary" />
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
            <small v-if="existsMetadata">{{ description }}</small>
        </td>
        <td>
            <v-tooltip v-if="item.last_status" top>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon small :color="statusColor">{{ statusIcon }}</v-icon>
                    </span>
                </template>
                <span>{{ item.last_status.replace(/_/g, ' ') }}</span>
            </v-tooltip>
        </td>
        <v-menu v-model="contextMenuShow" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item :disabled="printerIsPrinting || !klipperReadyForGui" @click="showPrintDialog = true">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('Files.PrintStart') }}
                </v-list-item>
                <v-list-item v-if="moonrakerComponents.includes('job_queue')" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="moonrakerComponents.includes('job_queue')" @click="showAddBatchToQueueDialog = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item
                    v-if="item.preheat_gcode !== null"
                    :disabled="['error', 'printing', 'paused'].includes(printer_state)"
                    @click="doSend(item.preheat_gcode)">
                    <v-icon class="mr-1">{{ mdiFire }}</v-icon>
                    {{ $t('Files.Preheat') }}
                </v-list-item>
                <v-list-item @click="view3D">
                    <v-icon class="mr-1">{{ mdiVideo3d }}</v-icon>
                    {{ $t('Files.View3D') }}
                </v-list-item>
                <v-list-item @click="downloadFile">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Files.Download') }}
                </v-list-item>
                <v-list-item @click="editFile">
                    <v-icon class="mr-1">{{ mdiFileDocumentEditOutline }}</v-icon>
                    {{ $t('Files.EditFile') }}
                </v-list-item>
                <v-list-item @click="showRenameFileDialog = true">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item class="red--text" @click="showDeleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <start-print-dialog
            :bool="showPrintDialog"
            :file="item"
            current-path=""
            @closeDialog="showPrintDialog = false" />
        <add-batch-to-queue-dialog
            :is-visible="showAddBatchToQueueDialog"
            :filename="filename"
            @close="showAddBatchToQueueDialog = false" />
        <v-dialog v-model="showRenameFileDialog" :max-width="400">
            <panel
                :title="$t('Files.RenameFile')"
                card-class="dashboard-files-rename-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="showRenameFileDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldRenameFile"
                        v-model="renameFileNewName"
                        :label="$t('Files.Name')"
                        required
                        @keyup.enter="renameFile" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="showRenameFileDialog = false">{{ $t('Files.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="renameFile">{{ $t('Files.Rename') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="showDeleteDialog" max-width="400">
            <panel :title="$t('Files.Delete')" card-class="gcode-files-delete-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="showDeleteDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <p class="mb-0">{{ $t('Files.DeleteSingleFileQuestion', { name: filename }) }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="showDeleteDialog = false">
                        {{ $t('Files.Cancel') }}
                    </v-btn>
                    <v-btn color="error" text @click="removeFile">
                        {{ $t('Files.Delete') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { FileStateGcodefile } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import {
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
import { defaultBigThumbnailBackground } from '@/store/variables'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'
import { escapePath, formatPrintTime } from '@/plugins/helpers'

@Component({
    components: {
        Panel,
        StartPrintDialog,
        AddBatchToQueueDialog,
    },
})
export default class StatusPanelGcodefilesEntry extends Mixins(BaseMixin, ControlMixin) {
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

    @Prop({ type: Object, required: true }) item!: FileStateGcodefile
    @Prop({ type: Number, required: true }) contentTdWidth!: number

    currentPath = ''

    declare $refs: {
        inputFieldRenameFile: HTMLInputElement
    }

    contextMenuShow = false
    contextMenuX = 0
    contextMenuY = 0

    showPrintDialog = false
    showAddBatchToQueueDialog = false
    showRenameFileDialog = false
    renameFileNewName = ''

    showDeleteDialog = false

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
    }

    get bigThumbnailBackground() {
        return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
    }

    get bigThumbnailTooltipColor() {
        if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
            return undefined
        }

        return this.bigThumbnailBackground
    }

    get existsMetadata() {
        return this.item?.metadataPulled ?? false
    }

    get description() {
        const output = []

        let filament = '--'
        if (this.item.filament_total || this.item.filament_weight_total) {
            filament = ''
            if (this.item.filament_total && this.item.filament_total > 1000)
                filament += `${(this.item.filament_total / 1000).toFixed(2)} m`
            else if (this.item.filament_total) filament += `${this.item.filament_total.toFixed(0)} mm`

            if (this.item.filament_total && this.item.filament_weight_total) filament += ' / '

            if (this.item.filament_weight_total) filament += this.item.filament_weight_total.toFixed(0) + ' g'
        }
        output.push(`${this.$t('Panels.StatusPanel.Filament')}: ${filament}`)

        const printTime = this.item.estimated_time ? formatPrintTime(this.item.estimated_time) : '--'
        output.push(`${this.$t('Panels.StatusPanel.PrintTime')}: ${printTime}`)

        return output.join(', ')
    }

    get statusIcon() {
        return this.$store.getters['server/history/getPrintStatusIcon'](this.item.last_status)
    }

    get statusColor() {
        return this.$store.getters['server/history/getPrintStatusIconColor'](this.item.last_status)
    }

    get pathOfFile() {
        return this.item.filename.lastIndexOf('/') >= 0
            ? '/' + this.item.filename.slice(0, this.item.filename.lastIndexOf('/'))
            : ''
    }

    get filename() {
        return this.item.filename.slice(this.item.filename.lastIndexOf('/') + 1)
    }

    showContextMenu(e: any) {
        if (this.contextMenuShow) return

        e?.preventDefault()
        this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

        this.$nextTick(() => {
            this.contextMenuShow = true
        })
    }

    addToQueue() {
        this.$store.dispatch('server/jobQueue/addToQueue', [this.item.filename])
    }

    view3D() {
        this.$router.push({ path: '/viewer', query: { filename: 'gcodes/' + this.item.filename } })
    }

    downloadFile() {
        const href = this.apiUrl + '/server/files/gcodes/' + escapePath(this.item.filename)

        window.open(href)
    }

    renameFile() {
        this.showRenameFileDialog = false

        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes/' + this.item.filename,
                dest: 'gcodes/' + this.pathOfFile + this.renameFileNewName,
            },
            { action: 'files/getMove' }
        )
    }

    editFile() {
        const pos = this.item.filename.lastIndexOf('/')
        const path = pos > 0 ? this.item.filename.slice(0, pos + 1) : ''
        const filename = pos > 0 ? this.item.filename.slice(pos + 1) : this.item.filename

        this.$store.dispatch('editor/openFile', {
            root: 'gcodes',
            path,
            filename,
            size: this.item.size,
            permissions: this.item.permissions,
        })
    }

    removeFile() {
        this.$socket.emit(
            'server.files.delete_file',
            { path: 'gcodes/' + this.item.filename },
            { action: 'files/getDeleteFile' }
        )

        this.showDeleteDialog = false
    }

    mounted() {
        this.renameFileNewName = this.filename
    }
}
</script>

<style scoped>
.filesGcodeCard {
    position: relative;
}
</style>
