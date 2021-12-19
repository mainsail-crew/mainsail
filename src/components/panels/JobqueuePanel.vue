<template>
    <div>
        <panel
            icon="mdi-tray-full"
            :title="$t('JobQueue.JobQueue')"
            card-class="jobqueue-panel"
        >
            <template v-slot:buttons>
                <v-btn
                    color="success"
                    @click="startJobqueue"
                    :loading="loadings.includes('startJobqueue')"
                    icon
                    tile
                    v-if="queueState === 'paused'"
                    :disabled="!klipperReadyForGui"
                >
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">mdi-play</v-icon>
                        </template>
                        <span>{{ $t('JobQueue.Start') }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn
                    color="warning"
                    @click="pauseJobqueue"
                    :loading="loadings.includes('pauseJobqueue')"
                    icon
                    tile
                    v-if="['ready', 'loading'].includes(queueState)"
                >
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">mdi-pause</v-icon>
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
                    itemsPerPageOptions: [10,25,50,100,-1]
                }"
                mobile-breakpoint="0">

                <template #no-data>
                    <div class="text-center">{{ $t('JobQueue.Empty') }}</div>
                </template>

                <template #item="{ index, item }">
                    <tr
                        :key="item.job_id"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        @contextmenu="showContextMenu($event, item)"
                        class="file-list-cursor user-select-none"
                    >
                        <td class="pr-0 text-center" style="width: 32px;">
                            <template v-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                                <v-tooltip v-if="!item.isDirectory && getSmallThumbnail(item) && getBigThumbnail(item)" top content-class="tooltip__content-opacity1">
                                    <template v-slot:activator="{ on, attrs }">
                                        <vue-load-image>
                                            <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" v-bind="attrs" v-on="on" />
                                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                            <v-icon slot="error">mdi-file</v-icon>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="getBigThumbnail(item)" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else-if="getSmallThumbnail(item)">
                                <vue-load-image>
                                    <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" />
                                    <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                    <v-icon slot="error">mdi-file</v-icon>
                                </vue-load-image>
                            </template>
                            <template v-else>
                                <v-icon>mdi-file</v-icon>
                            </template>
                        </td>
                        <td class=" ">
                            {{ item.filename }}
                            <template v-if="existMetadata(item)">
                                <br />
                                <small>{{ getDescription(item) }}</small>
                            </template>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="deleteJob(contextMenu.item)">
                    <v-icon class="mr-1">mdi-delete</v-icon> {{ $t('JobQueue.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {ServerHistoryStateJob} from '@/store/server/history/types'
import {formatFilesize, formatPrintTime} from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import {ServerJobQueueStateJob} from '@/store/server/jobQueue/types'
import {thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin} from '@/store/variables'
@Component({
    components: {Panel}
})
export default class JobqueuePanel extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    private contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {}
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

    refreshHistory() {
        this.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
    }

    formatPrintTime(totalSeconds: number) {
        if (totalSeconds) {
            let output = ''

            const days = Math.floor(totalSeconds / (3600 * 24))
            if (days) {
                totalSeconds %= (3600 * 24)
                output += days+'d'
            }

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output += ' '+hours+'h'

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output += ' '+minutes+'m'

            const seconds = totalSeconds % 60
            if (seconds) output += ' '+seconds.toFixed(0)+'s'

            return output
        }

        return '--'
    }
    
    showContextMenu (e: any, item: ServerHistoryStateJob) {
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
        if (item?.metadata?.thumbnails?.length) {
            const thumbnail = item?.metadata?.thumbnails.find((thumb: any) =>
                thumb.width >= thumbnailSmallMin && thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin && thumb.height <= thumbnailSmallMax
            )
            const path = item.filename.lastIndexOf('/') !== -1 ? 'gcodes/'+item.filename.slice(0, item.filename.lastIndexOf('/')) : 'gcodes'

            if (thumbnail && 'relative_path' in thumbnail) return this.apiUrl+'/server/files/'+path+'/'+encodeURI(thumbnail.relative_path)+'?timestamp='+item.metadata?.modified.getTime()
        }

        return ''
    }

    getBigThumbnail(item: ServerJobQueueStateJob) {
        if (item?.metadata?.thumbnails?.length) {
            const thumbnail = item?.metadata?.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)
            const path = item.filename.lastIndexOf('/') !== -1 ? 'gcodes/'+item.filename.slice(0, item.filename.lastIndexOf('/')) : 'gcodes'

            if (thumbnail && 'relative_path' in thumbnail) return this.apiUrl+'/server/files/'+path+'/'+encodeURI(thumbnail.relative_path)+'?timestamp='+item.metadata?.modified.getTime()
        }

        return ''
    }

    getDescription(item: ServerJobQueueStateJob) {
        let output = ''

        output += this.$t('Files.Filament')+': '
        if (item.metadata?.filament_total || item.metadata.filament_weight_total) {
            if (item.metadata?.filament_total) output += item.metadata.filament_total.toFixed()+' mm'
            if (item.metadata?.filament_total && item.metadata.filament_weight_total) output += ' / '
            if (item.metadata?.filament_weight_total) output += item.metadata.filament_weight_total.toFixed(2)+' g'
        } else output += '--'

        output += ', '+this.$t('Files.PrintTime')+': '
        if (item.metadata?.estimated_time) output += formatPrintTime(item.metadata.estimated_time)
        else output += '--'

        return output
    }

    existMetadata(item: ServerJobQueueStateJob) {
        return item?.metadata?.metadataPulled
    }
}
</script>
