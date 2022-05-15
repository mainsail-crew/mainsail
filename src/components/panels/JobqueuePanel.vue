<template>
    <div>
        <panel ref="jobqueuePanel" :icon="mdiTrayFull" :title="$t('JobQueue.JobQueue')" card-class="jobqueue-panel">
            <template #buttons>
                <v-btn
                    v-if="queueState === 'paused'"
                    color="success"
                    :loading="loadings.includes('startJobqueue')"
                    icon
                    tile
                    :disabled="!klipperReadyForGui"
                    @click="startJobqueue">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">{{ mdiPlay }}</v-icon>
                        </template>
                        <span>{{ $t('JobQueue.Start') }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn
                    v-if="['ready', 'loading'].includes(queueState)"
                    color="warning"
                    :loading="loadings.includes('pauseJobqueue')"
                    icon
                    tile
                    @click="pauseJobqueue">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">{{ mdiPause }}</v-icon>
                        </template>
                        <span>{{ $t('JobQueue.Pause') }}</span>
                    </v-tooltip>
                </v-btn>
            </template>
            <v-data-table
                :items="jobs"
                class="jobqueue-table"
                sort-by="time_added"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('JobQueue.Jobs'),
                    itemsPerPageAllText: $t('JobQueue.AllJobs'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                mobile-breakpoint="0">
                <template #no-data>
                    <div class="text-center">{{ $t('JobQueue.Empty') }}</div>
                </template>

                <template #item="{ item }">
                    <tr
                        :key="item.job_id"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        class="file-list-cursor user-select-none"
                        @contextmenu="showContextMenu($event, item)">
                        <td class="pr-0 text-center" style="width: 32px">
                            <template v-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                                <v-tooltip
                                    v-if="!item.isDirectory && getSmallThumbnail(item) && getBigThumbnail(item)"
                                    top
                                    content-class="tooltip__content-opacity1">
                                    <template #activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img
                                                slot="image"
                                                :src="getSmallThumbnail(item)"
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
                                    <span><img :src="getBigThumbnail(item)" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else-if="getSmallThumbnail(item)">
                                <vue-load-image>
                                    <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" />
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
                        <td class=" ">
                            <div class="d-block text-truncate" :style="styleContentTdWidth">{{ item.filename }}</div>
                            <small v-if="existMetadata(item)">{{ getDescription(item) }}</small>
                        </td>
                    </tr>
                </template>
            </v-data-table>
            <resize-observer @notify="handleResize" />
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="deleteJob(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistRemove }}</v-icon>
                    {{ $t('JobQueue.RemoveFromQueue') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { formatFilesize, formatPrintTime } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiPlay, mdiPause, mdiFile, mdiPlaylistRemove, mdiTrayFull } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'
@Component({
    components: { Panel },
})
export default class JobqueuePanel extends Mixins(BaseMixin) {
    mdiPlay = mdiPlay
    mdiPause = mdiPause
    mdiFile = mdiFile
    mdiPlaylistRemove = mdiPlaylistRemove
    mdiTrayFull = mdiTrayFull

    formatFilesize = formatFilesize

    private contentTdWidth = 100
    private contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {},
    }

    declare $refs: {
        jobqueuePanel: any
    }

    get jobs() {
        return this.$store.getters['server/jobQueue/getJobs']
    }

    get queueState() {
        return this.$store.state.server.jobQueue.queue_state ?? ''
    }

    get countPerPage() {
        return this.$store.state.gui.view.jobqueue.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.jobqueue.countPerPage', value: newVal })
    }

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
    }

    showContextMenu(e: any, item: ServerHistoryStateJob) {
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

    deleteJob(item: ServerJobQueueStateJob) {
        this.$store.dispatch('server/jobQueue/deleteFromQueue', [item.job_id])
    }

    startJobqueue() {
        this.$store.dispatch('server/jobQueue/start')
    }

    pauseJobqueue() {
        this.$store.dispatch('server/jobQueue/pause')
    }

    getSmallThumbnail(item: ServerJobQueueStateJob) {
        return this.$store.getters['server/jobQueue/getSmallThumbnail'](item)
    }

    getBigThumbnail(item: ServerJobQueueStateJob) {
        return this.$store.getters['server/jobQueue/getBigThumbnail'](item)
    }

    getDescription(item: ServerJobQueueStateJob) {
        let output = ''

        output += this.$t('Files.Filament') + ': '
        if (item.metadata?.filament_total || item.metadata.filament_weight_total) {
            if (item.metadata?.filament_total) output += item.metadata.filament_total.toFixed() + ' mm'
            if (item.metadata?.filament_total && item.metadata.filament_weight_total) output += ' / '
            if (item.metadata?.filament_weight_total) output += item.metadata.filament_weight_total.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Files.PrintTime') + ': '
        if (item.metadata?.estimated_time) output += formatPrintTime(item.metadata.estimated_time)
        else output += '--'

        return output
    }

    existMetadata(item: ServerJobQueueStateJob) {
        return item?.metadata?.metadataPulled
    }

    mounted() {
        this.calcContentTdWidth()
    }

    calcContentTdWidth() {
        this.contentTdWidth = this.$refs.jobqueuePanel?.$el?.clientWidth - 48 - 32
    }

    @Debounce(200)
    handleResize() {
        this.$nextTick(() => {
            this.calcContentTdWidth()
        })
    }
}
</script>

<style>
.jobqueue-panel {
    position: relative;
}
</style>
