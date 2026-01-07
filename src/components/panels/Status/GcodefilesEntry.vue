<template>
    <tr
        v-longpress:600="(e) => showContextMenu(e)"
        class="cursor-pointer"
        @contextmenu="showContextMenu($event)"
        @click="showPrintDialog = true">
        <td class="pr-0 text-center" style="width: 32px">
            <gcodefiles-thumbnail :item="item" />
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
                <v-list-item @click="openRenameFileDialog">
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
        <add-batch-to-queue-dialog v-model="showAddBatchToQueueDialog" :filename="filename" />
        <gcodefiles-rename-file-dialog v-model="showRenameFileDialog" :item="item" />
        <confirmation-dialog
            v-model="showDeleteDialog"
            :title="$t('Files.Delete')"
            :text="$t('Files.DeleteSingleFileQuestion', { name: filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="removeFile" />
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
    mdiPlay,
    mdiPlaylistPlus,
    mdiFire,
    mdiVideo3d,
    mdiCloudDownload,
    mdiFileDocumentEditOutline,
    mdiRenameBox,
    mdiDelete,
} from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { convertPrintStatusIcon, convertPrintStatusIconColor, escapePath, formatPrintTime } from '@/plugins/helpers'
import GcodefilesThumbnail from '@/components/panels/Gcodefiles/GcodefilesThumbnail.vue'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

@Component({
    components: {
        GcodefilesThumbnail,
        Panel,
        StartPrintDialog,
        AddBatchToQueueDialog,
        ConfirmationDialog,
    },
})
export default class StatusPanelGcodefilesEntry extends Mixins(BaseMixin, ControlMixin) {
    mdiPlay = mdiPlay
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiFire = mdiFire
    mdiVideo3d = mdiVideo3d
    mdiCloudDownload = mdiCloudDownload
    mdiFileDocumentEditOutline = mdiFileDocumentEditOutline
    mdiRenameBox = mdiRenameBox
    mdiDelete = mdiDelete

    @Prop({ type: Object, required: true }) item!: FileStateGcodefile
    @Prop({ type: Number, required: true }) contentTdWidth!: number

    currentPath = ''

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
        return convertPrintStatusIcon(this.item.last_status ?? '')
    }

    get statusColor() {
        return convertPrintStatusIconColor(this.item.last_status ?? '')
    }

    get filename() {
        return this.item.filename.slice(this.item.filename.lastIndexOf('/') + 1)
    }

    showContextMenu(e: any) {
        e?.preventDefault()
        EventBus.$emit(CLOSE_CONTEXT_MENU)

        this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

        this.contextMenuShow = true
    }

    closeContextMenu() {
        this.contextMenuShow = false
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

    openRenameFileDialog() {
        this.renameFileNewName = this.filename
        this.showRenameFileDialog = true
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
    }

    mounted() {
        EventBus.$on(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    }

    beforeDestroy() {
        EventBus.$off(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    }
}
</script>
