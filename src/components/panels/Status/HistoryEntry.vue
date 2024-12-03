<template>
    <v-row
        v-longpress:600="(e) => openContextMenu(e)"
        class="history-list-entry d-flex flex-row flex-nowrap cursor-pointer"
        @contextmenu="openContextMenu($event)">
        <v-col class="col-auto d-flex flex-column justify-center pr-0 py-0">
            <v-tooltip
                v-if="smallThumbnail"
                top
                :disabled="!bigThumbnail"
                content-class="tooltip__content-opacity1"
                :color="bigThumbnailTooltipColor">
                <template #activator="{ on, attrs }">
                    <vue-load-image class="text-center width-32">
                        <img
                            slot="image"
                            :src="smallThumbnail"
                            :width="32"
                            :height="32"
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
                <span><img :src="bigThumbnail" :width="250" :alt="job.filename" /></span>
            </v-tooltip>
            <v-icon v-else>{{ mdiFile }}</v-icon>
        </v-col>
        <v-col class="py-1" style="min-width: 0; font-size: 0.875em">
            <div class="text-truncate">
                <strong v-if="job.count > 1">{{ job.count }}x</strong>
                {{ job.filename }}
            </div>
            <small v-if="description" class="text-truncate">{{ description }}</small>
        </v-col>
        <v-col class="col-auto d-flex flex-column justify-center pa-0 pr-3">
            <v-tooltip top>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-icon small :color="statusColor" :disabled="!job.exists">
                            {{ statusIcon }}
                        </v-icon>
                    </span>
                </template>
                <span>{{ statusName }}</span>
            </v-tooltip>
        </v-col>
        <v-menu v-model="showContextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item v-if="job.exists" :disabled="printerIsPrinting || !klipperReadyForGui" @click="startPrint">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item v-if="job.exists && isJobQueueAvailable" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="job.exists && isJobQueueAvailable" @click="addBatchToQueueDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteJob">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <add-batch-to-queue-dialog
            :is-visible="addBatchToQueueDialogBool"
            :show-toast="true"
            :filename="job.filename"
            @close="addBatchToQueueDialogBool = false" />
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiDelete, mdiFile, mdiPlaylistPlus, mdiPrinter } from '@mdi/js'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { ServerHistoryStateJobWithCount } from '@/store/server/history/types'
import { FileStateFileThumbnail } from '@/store/files/types'
import { escapePath, formatPrintTime } from '@/plugins/helpers'
@Component
export default class StatusPanelHistoryEntry extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiDelete = mdiDelete
    mdiFile = mdiFile
    mdiPlaylistPlus = mdiPlaylistPlus
    mdiPrinter = mdiPrinter

    @Prop({ type: Object, required: true }) job!: ServerHistoryStateJobWithCount

    showContextMenu = false
    contextMenuX = 0
    contextMenuY = 0

    addBatchToQueueDialogBool = false

    get smallThumbnail() {
        if ((this.job.metadata?.thumbnails?.length ?? 0) < 1) return false

        const thumbnail = this.job.metadata?.thumbnails?.find(
            (thumb) =>
                thumb.width >= thumbnailSmallMin &&
                thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin &&
                thumb.height <= thumbnailSmallMax
        )

        return thumbnail ? this.createThumbnailUrl(thumbnail) : false
    }

    get bigThumbnail() {
        if ((this.job.metadata?.thumbnails?.length ?? 0) < 1) return false

        const thumbnail = this.job.metadata?.thumbnails?.find((thumb) => thumb.width >= thumbnailBigMin)

        return thumbnail ? this.createThumbnailUrl(thumbnail) : false
    }

    get statusIcon() {
        return this.$store.getters['server/history/getPrintStatusIcon'](this.job.status)
    }

    get statusColor() {
        return this.$store.getters['server/history/getPrintStatusIconColor'](this.job.status)
    }

    get statusName() {
        // check if translation exists
        if (!this.$t(`History.StatusValues.${this.job.status}`, 'en')) return this.job.status.replace(/_/g, ' ')

        return this.$t(`History.StatusValues.${this.job.status}`)
    }

    get description() {
        const outputArray = []

        const filamentArray = []
        let filament = '--'
        if (this.filamentLength) filamentArray.push(this.filamentLength)
        if (this.filamentWeight) filamentArray.push(this.filamentWeight)
        if (filamentArray.length) filament = filamentArray.join(' / ')
        outputArray.push(`${this.$t('Panels.StatusPanel.Filament')}: ${filament}`)

        if (this.estimatedTime !== '--')
            outputArray.push(`${this.$t('Panels.StatusPanel.PrintTime')}: ${this.estimatedTime}`)
        else if (this.totalTime) outputArray.push(`${this.$t('Panels.StatusPanel.TotalTime')}: ${this.totalTime}`)

        return outputArray.join(', ')
    }

    get filamentLength() {
        const length = this.job.filament_used
        if (length === 0) return null

        if (length >= 1000) return (length / 1000).toFixed(1) + ' m'

        return length.toFixed(0) + ' mm'
    }

    get filamentWeight() {
        const metadataFilamentLength = this.job.metadata?.filament_total ?? 0
        const metadataFilamentWeight = this.job.metadata?.filament_weight_total ?? 0
        if (metadataFilamentLength === 0 || metadataFilamentWeight === 0) return null

        const specificWeight = metadataFilamentWeight / metadataFilamentLength

        const weight = this.job.filament_used * specificWeight
        if (weight === 0) return null

        if (weight >= 1000) return (length / 1000).toFixed(1) + ' kg'

        return weight.toFixed(0) + ' g'
    }

    get estimatedTime() {
        let totalSeconds = this.job.print_duration ?? 0
        if (totalSeconds == 0) return '--'

        return formatPrintTime(totalSeconds)
    }

    get totalTime() {
        let totalSeconds: number = this.job.total_duration ?? 0
        if (totalSeconds === 0) return null

        return formatPrintTime(totalSeconds)
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

    get isJobQueueAvailable() {
        return this.moonrakerComponents.includes('job_queue')
    }

    openContextMenu(e: any) {
        e?.preventDefault()

        if (this.showContextMenu) {
            this.showContextMenu = false
            return
        }

        this.showContextMenu = true
        this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2
    }

    startPrint() {
        if (!this.job.exists) return

        this.$socket.emit('printer.print.start', { filename: this.job.filename })
    }

    addToQueue() {
        this.$store.dispatch('server/jobQueue/addToQueue', [this.job.filename])
        this.$toast.info(this.$t('History.AddToQueueSuccessful', { filename: this.job.filename }).toString())
    }

    deleteJob() {
        this.$socket.emit(
            'server.history.delete_job',
            { uid: this.job.job_id },
            { action: 'server/history/getDeletedJobs' }
        )
    }

    createThumbnailUrl(thumbnail: FileStateFileThumbnail) {
        let relative_url = ''
        if (this.job.filename.lastIndexOf('/') !== -1) {
            relative_url = this.job.filename.substring(0, this.job.filename.lastIndexOf('/') + 1)
        }

        return `${this.apiUrl}/server/files/gcodes/${escapePath(relative_url + thumbnail.relative_path)}?timestamp=${
            this.job.metadata.modified
        }`
    }
}
</script>

<style scoped>
.width-32 {
    width: 32px;
}
</style>
