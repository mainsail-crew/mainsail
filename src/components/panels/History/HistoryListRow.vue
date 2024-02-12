<template>
    <tr
        v-longpress:600="(e) => showContextMenu(e)"
        :class="trClasses"
        @contextmenu="showContextMenu($event)"
        @click="clickRow">
        <td class="pr-0">
            <v-simple-checkbox v-ripple :value="isSelected" class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <v-icon v-if="!job.exists" class="text--disabled">{{ mdiFileCancel }}</v-icon>
            <v-tooltip v-else-if="smallThumbnail" top :disabled="!bigThumbnail">
                <template #activator="{ on, attrs }">
                    <vue-load-image>
                        <img
                            slot="image"
                            :src="smallThumbnail"
                            width="32"
                            height="32"
                            :alt="job.filename"
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
                <span><img :src="bigThumbnail" width="250" :alt="job.filename" /></span>
            </v-tooltip>
            <v-icon v-else>{{ mdiFile }}</v-icon>
        </td>
        <td>{{ job.filename }}</td>
        <td class="text-right text-no-wrap">
            <template v-if="job.note ?? false">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <v-icon small class="mr-2" v-bind="attrs" v-on="on">
                            {{ mdiNotebook }}
                        </v-icon>
                    </template>
                    <span v-html="job.note.replaceAll('\n', '<br />')" />
                </v-tooltip>
            </template>
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon small :color="statusColor" :disabled="!job.exists">{{ statusIcon }}</v-icon>
                    </span>
                </template>
                <span>{{ statusText }}</span>
            </v-tooltip>
        </td>
        <history-list-row-cell v-for="col in tableFields" :key="col.value" :job="job" :col="col" />
        <td v-if="existsSlicerCol" class=" ">
            {{ job.metadata?.slicer ?? '--' }}
            <small v-if="job.metadata?.slicer_version ?? false">
                <br />
                {{ job.metadata?.slicer_version }}
            </small>
        </td>
        <v-menu v-model="contextMenuShown" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item @click="clickRow">
                    <v-icon class="mr-1">{{ mdiTextBoxSearch }}</v-icon>
                    {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item v-if="job.note ?? false" @click="showNoteDialog = true">
                    <v-icon class="mr-1">{{ mdiNotebookEdit }}</v-icon>
                    {{ $t('History.EditNote') }}
                </v-list-item>
                <v-list-item v-else @click="showNoteDialog = true">
                    <v-icon class="mr-1">{{ mdiNotebookPlus }}</v-icon>
                    {{ $t('History.AddNote') }}
                </v-list-item>
                <v-list-item v-if="job.exists" :disabled="printerIsPrinting || !klipperReadyForGui" @click="startPrint">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item class="red--text" @click="showDeleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <history-details-dialog :show="showDetailsDialog" :job="job" @close="showDetailsDialog = false" />
        <history-note-dialog :show="showNoteDialog" :job="job" @close="showNoteDialog = false" />
        <history-delete-job-dialog :show="showDeleteDialog" :job="job" @close="showDeleteDialog = false" />
    </tr>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { HistoryListHeadertype } from '@/components/panels/HistoryListPanel.vue'
import {
    mdiDelete,
    mdiFile,
    mdiFileCancel,
    mdiNotebook,
    mdiNotebookEdit,
    mdiNotebookPlus,
    mdiPrinter,
    mdiTextBoxSearch,
} from '@mdi/js'
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import HistoryListRowCell from '@/components/panels/History/HistoryListRowCell.vue'
import HistoryDetailsDialog from '@/components/dialogs/HistoryDetailsDialog.vue'

@Component({
    components: { HistoryDetailsDialog, HistoryListRowCell },
})
export default class HistoryListRow extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiFile = mdiFile
    mdiFileCancel = mdiFileCancel
    mdiNotebook = mdiNotebook
    mdiNotebookEdit = mdiNotebookEdit
    mdiNotebookPlus = mdiNotebookPlus
    mdiPrinter = mdiPrinter
    mdiTextBoxSearch = mdiTextBoxSearch

    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJob
    @Prop({ type: Array, required: true }) tableFields!: HistoryListHeadertype[]
    @Prop({ type: Boolean, required: true }) isSelected!: boolean
    @Prop({ type: Boolean, required: true }) existsSlicerCol!: boolean

    contextMenuShown = false
    contextMenuX = 0
    contextMenuY = 0

    showDetailsDialog = false
    showDeleteDialog = false
    showNoteDialog = false

    get trClasses() {
        return {
            'file-list-cursor': true,
            'user-select-none': true,
            'text--disabled': !this.job.exists,
        }
    }

    get thumbnails() {
        return this.job.metadata?.thumbnails ?? []
    }

    get smallThumbnail() {
        const thumbnail = this.thumbnails.find(
            (thumb: any) =>
                thumb.width >= thumbnailSmallMin &&
                thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin &&
                thumb.height <= thumbnailSmallMax
        )
        if (!thumbnail) return false

        let relative_url = ''
        if (this.job.filename.lastIndexOf('/') !== -1) {
            relative_url = this.job.filename.substring(0, this.job.filename.lastIndexOf('/') + 1)
        }

        return `${this.apiUrl}/server/files/gcodes/${encodeURI(relative_url + thumbnail.relative_path)}?timestamp=${this
            .job.metadata?.modified}`
    }

    get bigThumbnail() {
        const thumbnail = this.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)
        if (!thumbnail) return false

        let relative_url = ''
        if (this.job.filename.lastIndexOf('/') !== -1) {
            relative_url = this.job.filename.substring(0, this.job.filename.lastIndexOf('/') + 1)
        }

        return `${this.apiUrl}/server/files/gcodes/${encodeURI(relative_url + thumbnail.relative_path)}?timestamp=${this
            .job.metadata?.modified}`
    }

    get statusColor() {
        return this.$store.getters['server/history/getPrintStatusIconColor'](this.job.status)
    }

    get statusIcon() {
        return this.$store.getters['server/history/getPrintStatusIcon'](this.job.status)
    }

    get statusText() {
        // If the translation exists, use it
        if (this.$te(`History.StatusValues.${this.job.status}`, 'en')) {
            return this.$t(`History.StatusValues.${this.job.status}`)
        }

        // fallback uses the status name
        return this.job.status.replace(/_/g, ' ')
    }

    showContextMenu(e: MouseEvent) {
        if (!this.contextMenuShown) {
            e?.preventDefault()
            this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
            this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

            this.$nextTick(() => {
                this.contextMenuShown = true
            })
        }
    }

    select(value: boolean) {
        this.$emit('select', value)
    }

    clickRow() {
        this.showDetailsDialog = true
    }

    startPrint() {
        if (!this.job.exists) return

        this.$socket.emit('printer.print.start', { filename: this.job.filename }, { action: 'switchToDashboard' })
    }
}
</script>
