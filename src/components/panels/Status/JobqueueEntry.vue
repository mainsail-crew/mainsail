<template>
    <v-row
        v-longpress:600="(e) => openContextMenu(e)"
        class="jobqueue-list-entry d-flex flex-row flex-nowrap cursor-pointer"
        @contextmenu="openContextMenu($event)">
        <v-col v-if="showHandle" class="col-auto d-flex flex-column justify-center pr-0 py-0">
            <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
        </v-col>
        <v-col class="col-auto d-flex flex-column justify-center pr-0 py-0">
            <v-tooltip
                v-if="smallThumbnail"
                top
                :disabled="!bigThumbnail"
                content-class="tooltip__content-opacity1"
                :color="bigThumbnailTooltipColor">
                <template #activator="{ on, attrs }">
                    <vue-load-image>
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
                <strong v-if="job.combinedIds?.length">{{ job.combinedIds.length + 1 }}x</strong>
                {{ job.filename }}
            </div>
            <small v-if="description" class="text-truncate">{{ description }}</small>
        </v-col>
        <v-col
            v-if="showPrintButton && !printerIsPrinting"
            class="col-auto d-flex flex-column justify-center pa-0 pr-1">
            <v-btn icon color="success" class="minwidth-0" @click="startJobqueue">
                <v-icon>{{ mdiPlay }}</v-icon>
            </v-btn>
        </v-col>
        <v-menu v-model="showContextMenu" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item @click="printJob">
                    <v-icon class="mr-1">{{ mdiPlay }}</v-icon>
                    {{ $t('JobQueue.StartPrint') }}
                </v-list-item>
                <v-list-item @click="showChangeCountDialog = true">
                    <v-icon class="mr-1">{{ mdiCounter }}</v-icon>
                    {{ $t('JobQueue.ChangeCount') }}
                </v-list-item>
                <v-list-item @click="removeFromJobqueue">
                    <v-icon class="mr-1">{{ mdiPlaylistRemove }}</v-icon>
                    {{ $t('JobQueue.RemoveFromQueue') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <jobqueue-entry-change-count-dialog
            :show="showChangeCountDialog"
            :job="job"
            @close="showChangeCountDialog = false" />
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiCloseThick, mdiCounter, mdiDragVertical, mdiFile, mdiPlay, mdiPlaylistRemove } from '@mdi/js'
import { defaultBigThumbnailBackground } from '@/store/variables'
@Component
export default class StatusPanelJobqueueEntry extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCounter = mdiCounter
    mdiDragVertical = mdiDragVertical
    mdiFile = mdiFile
    mdiPlay = mdiPlay
    mdiPlaylistRemove = mdiPlaylistRemove

    @Prop({ type: Object, required: true }) job!: ServerJobQueueStateJob
    @Prop({ type: Boolean, default: false }) showPrintButton!: boolean
    @Prop({ type: Boolean, default: false }) showHandle!: boolean

    showContextMenu = false
    contextMenuX = 0
    contextMenuY = 0

    showChangeCountDialog = false

    get smallThumbnail() {
        return this.$store.getters['server/jobQueue/getSmallThumbnail'](this.job)
    }

    get bigThumbnail() {
        return this.$store.getters['server/jobQueue/getBigThumbnail'](this.job)
    }

    get description() {
        if (!this.job?.metadata?.metadataPulled) return false

        const filamentArray = []
        let filament = '--'
        if (this.filamentLength) filamentArray.push(this.filamentLength)
        if (this.filamentWeight) filamentArray.push(this.filamentWeight)
        if (filamentArray.length) filament = filamentArray.join(' / ')

        let time = '--'
        if (this.estimatedTime) time = this.estimatedTime

        return `${this.$t('Panels.StatusPanel.Filament')}: ${filament}, ${this.$t(
            'Panels.StatusPanel.PrintTime'
        )}: ${time}`
    }

    get filamentLength() {
        const length = this.job.metadata?.filament_total ?? 0
        if (length === 0) return null

        if (length >= 1000) return (length / 1000).toFixed(1) + ' m'

        return length.toFixed(0) + ' mm'
    }

    get filamentWeight() {
        const weight = this.job.metadata?.filament_weight_total ?? 0
        if (weight === 0) return null

        if (weight >= 1000) return (length / 1000).toFixed(1) + ' kg'

        return weight.toFixed(0) + ' g'
    }

    get estimatedTime() {
        let totalSeconds = this.job.metadata?.estimated_time ?? 0
        if (totalSeconds == 0) return '--'

        const output = []

        const days = Math.floor(totalSeconds / (3600 * 24))
        if (days) {
            totalSeconds %= 3600 * 24
            output.push(days + 'd')
        }

        const hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        if (hours) output.push(hours + 'h')

        const minutes = Math.floor(totalSeconds / 60)
        if (minutes) output.push(minutes + 'm')

        // skip seconds if there are hours
        if (hours > 0) return output.join(' ')

        const seconds = totalSeconds % 60
        if (seconds) output.push(seconds.toFixed(0) + 's')

        return output.join(' ')
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

    printJob() {
        this.$store.dispatch('server/jobQueue/startByJobId', this.job.job_id)
    }

    startJobqueue() {
        this.$store.dispatch('server/jobQueue/start')
    }

    removeFromJobqueue() {
        const ids = [...(this.job.combinedIds ?? []), this.job.job_id]

        this.$store.dispatch('server/jobQueue/deleteFromQueue', ids)
    }
}
</script>
