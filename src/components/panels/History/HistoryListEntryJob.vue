<template>
    <tr
        :key="item.job_id"
        v-longpress:600="(e) => showContextMenu(e)"
        :class="cssClasses"
        @contextmenu="showContextMenu($event)"
        @click="detailsDialogBool = true">
        <td class="pr-0">
            <v-simple-checkbox v-ripple :value="isSelected" class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <template v-if="!item.exists">
                <v-icon class="text--disabled">{{ mdiFileCancel }}</v-icon>
            </template>
            <template v-else-if="smallThumbnail && bigThumbnail">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <vue-load-image>
                            <img
                                slot="image"
                                :alt="item.filename"
                                :src="smallThumbnail"
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
                    <span><img :alt="item.filename" :src="bigThumbnail" width="250" /></span>
                </v-tooltip>
            </template>
            <template v-else-if="smallThumbnail">
                <vue-load-image>
                    <img slot="image" :alt="item.filename" :src="smallThumbnail" width="32" height="32" />
                    <div slot="preloader">
                        <v-progress-circular indeterminate color="primary" />
                    </div>
                    <div slot="error">
                        <v-icon>{{ mdiFile }}</v-icon>
                    </div>
                </vue-load-image>
            </template>
            <template v-else>
                <v-icon>{{ mdiFile }}</v-icon>
            </template>
        </td>
        <td>{{ item.filename }}</td>
        <td class="text-right text-no-wrap">
            <template v-if="'note' in item && item.note">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <v-icon small class="mr-2" v-bind="attrs" v-on="on">
                            {{ mdiNoteTextOutline }}
                        </v-icon>
                    </template>
                    <span v-html="item.note.replaceAll('\n', '<br />')" />
                </v-tooltip>
            </template>
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon small :color="statusColor" :disabled="!item.exists">
                            {{ statusIcon }}
                        </v-icon>
                    </span>
                </template>
                <span>{{ statusName }}</span>
            </v-tooltip>
        </td>
        <td v-for="col in tableFields" :key="col.value" class="text-no-wrap" v-html="outputValue(col, item)" />
        <!-- Context menu -->
        <v-menu v-model="contextMenuBool" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item @click="detailsDialogBool = true">
                    <v-icon class="mr-1">{{ mdiTextBoxSearch }}</v-icon>
                    {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item v-if="item.note" @click="editNote">
                    <v-icon class="mr-1">{{ mdiNoteEditOutline }}</v-icon>
                    {{ $t('History.EditNote') }}
                </v-list-item>
                <v-list-item v-else @click="createNote">
                    <v-icon class="mr-1">{{ mdiNotePlusOutline }}</v-icon>
                    {{ $t('History.AddNote') }}
                </v-list-item>
                <v-list-item
                    v-if="item.exists"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrint">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item v-if="item.exists && isJobQueueAvailable" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="item.exists && isJobQueueAvailable" @click="addBatchToQueueDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteJob">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <!-- details dialog -->
        <history-list-panel-details-dialog
            :show="detailsDialogBool"
            :job="item"
            @close-dialog="detailsDialogBool = false" />
        <!-- create/edit note dialog -->
        <history-list-panel-note-dialog
            :show="noteDialogBool"
            :type="noteDialogType"
            :job="item"
            @close-dialog="noteDialogBool = false" />
        <!-- add to queue dialog -->
        <add-batch-to-queue-dialog
            :is-visible="addBatchToQueueDialogBool"
            :show-toast="true"
            :filename="item.filename"
            @close="addBatchToQueueDialogBool = false" />
    </tr>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateFileThumbnail } from '@/store/files/types'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import {
    mdiCloseThick,
    mdiDelete,
    mdiFile,
    mdiFileCancel,
    mdiNoteEditOutline,
    mdiNotePlusOutline,
    mdiNoteTextOutline,
    mdiPlaylistPlus,
    mdiPrinter,
    mdiTextBoxSearch,
} from '@mdi/js'
import { escapePath, formatFilesize, formatPrintTime } from '@/plugins/helpers'
import { HistoryListPanelCol } from '@/components/panels/HistoryListPanel.vue'
import HistoryListPanelNoteDialog from '@/components/dialogs/HistoryListPanelNoteDialog.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'

@Component({
    components: { AddBatchToQueueDialog, HistoryListPanelNoteDialog, HistoryListPanelDetailsDialog, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiDelete = mdiDelete
    mdiFile = mdiFile
    mdiFileCancel = mdiFileCancel
    mdiNoteEditOutline = mdiNoteEditOutline
    mdiNotePlusOutline = mdiNotePlusOutline
    mdiNoteTextOutline = mdiNoteTextOutline
    mdiPrinter = mdiPrinter
    mdiTextBoxSearch = mdiTextBoxSearch
    mdiPlaylistPlus = mdiPlaylistPlus

    detailsDialogBool = false

    contextMenuBool = false
    contextMenuX = 0
    contextMenuY = 0

    noteDialogBool = false
    noteDialogType: 'create' | 'edit' = 'create'

    addBatchToQueueDialogBool = false

    @Prop({ type: Object, required: true }) readonly item!: ServerHistoryStateJob
    @Prop({ type: Array, required: true }) readonly tableFields!: HistoryListPanelCol[]
    @Prop({ type: Boolean, required: true }) readonly isSelected!: boolean

    get smallThumbnail() {
        if ((this.item.metadata?.thumbnails?.length ?? 0) < 1) return false

        const thumbnail = this.item.metadata?.thumbnails?.find(
            (thumb) =>
                thumb.width >= thumbnailSmallMin &&
                thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin &&
                thumb.height <= thumbnailSmallMax
        )

        return thumbnail ? this.createThumbnailUrl(thumbnail) : false
    }

    get bigThumbnail() {
        if ((this.item.metadata?.thumbnails?.length ?? 0) < 1) return false

        const thumbnail = this.item.metadata?.thumbnails?.find((thumb) => thumb.width >= thumbnailBigMin)

        return thumbnail ? this.createThumbnailUrl(thumbnail) : false
    }

    get statusIcon() {
        return this.$store.getters['server/history/getPrintStatusIcon'](this.item.status)
    }

    get statusColor() {
        return this.$store.getters['server/history/getPrintStatusIconColor'](this.item.status)
    }

    get statusName() {
        // check if translation exists
        if (!this.$t(`History.StatusValues.${this.item.status}`, 'en')) return this.item.status.replace(/_/g, ' ')

        return this.$t(`History.StatusValues.${this.item.status}`)
    }

    get cssClasses() {
        let output = ['file-list-cursor', 'user-select-none']

        if (!this.item.exists) output.push('text--disabled')

        return output
    }

    get isJobQueueAvailable() {
        return this.moonrakerComponents.includes('job_queue')
    }

    select(newVal: boolean) {
        this.$emit('select', newVal)
    }

    showContextMenu(e: any) {
        e?.preventDefault()
        if (this.contextMenuBool) return

        this.contextMenuBool = true
        this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

        this.$nextTick(() => {
            this.contextMenuBool = true
        })
    }

    startPrint() {
        if (!this.item.exists) return

        this.$socket.emit('printer.print.start', { filename: this.item.filename }, { action: 'switchToDashboard' })
    }

    createNote() {
        this.noteDialogType = 'create'
        this.noteDialogBool = true
    }

    editNote() {
        this.noteDialogType = 'edit'
        this.noteDialogBool = true
    }

    addToQueue() {
        this.$store.dispatch('server/jobQueue/addToQueue', [this.item.filename])
        this.$toast.info(this.$t('History.AddToQueueSuccessful', { filename: this.item.filename }).toString())
    }

    deleteJob() {
        this.$socket.emit(
            'server.history.delete_job',
            { uid: this.item.job_id },
            { action: 'server/history/getDeletedJobs' }
        )
    }

    outputValue(col: HistoryListPanelCol, item: ServerHistoryStateJob) {
        //@ts-ignore
        let value = col.value in item ? item[col.value] : null
        if (value === null) value = col.value in item.metadata ? item.metadata[col.value] : null
        if (col.value.startsWith('history_field_')) {
            const fieldName = col.value.replace('history_field_', '')
            const field = item.auxiliary_data?.find((field: any) => field.name === fieldName)
            if (field && !Array.isArray(field.value)) return `${Math.round(field.value * 1000) / 1000} ${field.units}`
        }
        if (value === null) return '--'

        if (col.value === 'slicer') value += '<br />' + item.metadata.slicer_version

        switch (col.outputType) {
            case 'filesize':
                return formatFilesize(value)

            case 'date':
                return this.formatDateTime(value * 1000)

            case 'time':
                return formatPrintTime(value, false)

            case 'temp':
                return value?.toFixed() + ' °C'

            case 'length':
                if (value > 1000) return (value / 1000).toFixed(2) + ' m'

                return value?.toFixed(2) + ' mm'

            default:
                return value
        }
    }

    createThumbnailUrl(thumbnail: FileStateFileThumbnail) {
        let relative_url = ''
        if (this.item.filename.lastIndexOf('/') !== -1) {
            relative_url = this.item.filename.substring(0, this.item.filename.lastIndexOf('/') + 1)
        }

        return `${this.apiUrl}/server/files/gcodes/${escapePath(relative_url + thumbnail.relative_path)}?timestamp=${
            this.item.metadata.modified
        }`
    }
}
</script>
