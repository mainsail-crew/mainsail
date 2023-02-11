<template>
    <v-card ref="filesJobqueue" class="filesJobqueue" flat>
        <v-data-table
            :items="jobsTable"
            hide-default-footer
            class="dashboard-jobqueue-table"
            sort-by="time_added"
            mobile-breakpoint="0"
            @current-items="setFirst">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.EmptyJobqueue') }}</div>
            </template>

            <template #item="{ item }">
                <tr
                    :key="item.job_id"
                    v-longpress:600="(e) => showContextMenu(e, item)"
                    class="cursor-pointer"
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
                                        <div slot="preloader">
                                            <v-progress-circular indeterminate color="primary" />
                                        </div>
                                        <div slot="error">
                                            <v-icon>{{ mdiFile }}</v-icon>
                                        </div>
                                    </vue-load-image>
                                </template>
                                <span><img :src="getBigThumbnail(item)" width="250" /></span>
                            </v-tooltip>
                        </template>
                        <template v-else-if="getSmallThumbnail(item)">
                            <vue-load-image>
                                <img slot="image" :src="getSmallThumbnail(item)" width="32" height="32" />
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
                    <td class="pr-2">
                        <template v-if="item.isFirst && !printerIsPrinting">
                            <v-btn icon color="success" class="float-right minwidth-0 mt-1" @click="startJobqueue">
                                <v-icon>{{ mdiPlay }}</v-icon>
                            </v-btn>
                        </template>
                        <div class="d-block text-truncate" :style="styleContentTdWidth">
                            <strong v-if="item.combinedIds.length">{{ item.combinedIds.length + 1 }}x</strong>
                            {{ item.filename }}
                        </div>
                        <small v-if="existMetadata(item)">{{ getDescription(item) }}</small>
                    </td>
                </tr>
            </template>
            <template v-if="jobs.length > jobsTable.length" #body.append>
                <tr>
                    <td class="pr-0 text-center" style="width: 32px">
                        <v-icon>{{ mdiFileMultiple }}</v-icon>
                    </td>
                    <td class="pr-2">
                        {{
                            $tc('Panels.StatusPanel.JobqueueMoreFiles', jobs.length - jobsTable.length, {
                                count: jobs.length - jobsTable.length,
                            })
                        }}
                        <br />
                        <small>{{ descriptionRestJobs }}</small>
                    </td>
                </tr>
            </template>
        </v-data-table>
        <resize-observer @notify="handleResize" />
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="removeFromJobqueue(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistRemove }}</v-icon>
                    {{ $t('JobQueue.RemoveFromQueue') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiFile, mdiPlay, mdiFileMultiple, mdiPlaylistRemove } from '@mdi/js'
@Component({
    components: {},
})
export default class StatusPanelJobqueue extends Mixins(BaseMixin) {
    mdiFile = mdiFile
    mdiPlay = mdiPlay
    mdiFileMultiple = mdiFileMultiple
    mdiPlaylistRemove = mdiPlaylistRemove

    private contentTdWidth = 100
    private contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {},
    }

    declare $refs: {
        filesJobqueue: any
    }

    get jobs() {
        return this.$store.getters['server/jobQueue/getJobs'] ?? []
    }

    get jobsTable() {
        return this.jobs.slice(0, 5)
    }

    get jobsRest() {
        return this.jobs.slice(5)
    }

    get descriptionRestJobs() {
        let filamentLength = 0
        let filamentWeight = 0
        let printTime = 0

        this.jobsRest.forEach((item: ServerJobQueueStateJob) => {
            const count = (item.combinedIds?.length ?? 0) + 1

            if (item.metadata?.filament_total) filamentLength += item.metadata?.filament_total * count
            if (item.metadata?.filament_weight_total) filamentWeight += item.metadata?.filament_weight_total * count
            if (item.metadata?.estimated_time) printTime = item.metadata.estimated_time * count
        })

        let output = ''

        output += this.$t('Files.Filament') + ': '
        if (filamentLength || filamentWeight) {
            if (filamentLength) output += filamentLength.toFixed() + ' mm'
            if (filamentLength && filamentWeight) output += ' / '
            if (filamentWeight) output += filamentWeight.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Files.PrintTime') + ': '
        if (printTime) output += this.formatPrintTime(printTime)
        else output += '--'

        return output
    }

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
    }

    getSmallThumbnail(item: ServerJobQueueStateJob) {
        return this.$store.getters['server/jobQueue/getSmallThumbnail'](item)
    }

    getBigThumbnail(item: ServerJobQueueStateJob) {
        return this.$store.getters['server/jobQueue/getBigThumbnail'](item)
    }

    getDescription(item: ServerJobQueueStateJob) {
        let output = ''

        output += this.$t('Panels.StatusPanel.Filament') + ': '
        if (item.metadata?.filament_total || item.metadata.filament_weight_total) {
            if (item.metadata?.filament_total) output += item.metadata.filament_total.toFixed() + ' mm'
            if (item.metadata?.filament_total && item.metadata.filament_weight_total) output += ' / '
            if (item.metadata?.filament_weight_total) output += item.metadata.filament_weight_total.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Panels.StatusPanel.PrintTime') + ': '
        if (item.metadata?.estimated_time) output += this.formatPrintTime(item.metadata.estimated_time)
        else output += '--'

        return output
    }

    existMetadata(item: ServerJobQueueStateJob) {
        return item?.metadata?.metadataPulled
    }

    setFirst(currItems: ServerJobQueueStateJob[]) {
        // first check that actually exists values
        if (currItems.length) {
            // toggle all to false
            currItems.forEach((x: ServerJobQueueStateJob) => (x.isFirst = false))
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

    showContextMenu(e: any, item: ServerJobQueueStateJob) {
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

    startJobqueue() {
        this.$store.dispatch('server/jobQueue/start')
    }

    removeFromJobqueue(item: ServerJobQueueStateJob) {
        const ids = [...(item.combinedIds ?? [])]
        ids.push(item.job_id)

        this.$store.dispatch('server/jobQueue/deleteFromQueue', ids)
    }

    mounted() {
        setTimeout(() => {
            this.calcContentTdWidth()
        }, 200)
    }

    calcContentTdWidth() {
        this.contentTdWidth = this.$refs.filesJobqueue?.$el?.clientWidth - 48 - 48 - 32
    }

    handleResize() {
        this.$nextTick(() => {
            this.calcContentTdWidth()
        })
    }
}
</script>

<style lang="scss" scoped>
.filesJobqueue {
    position: relative;
}
</style>
