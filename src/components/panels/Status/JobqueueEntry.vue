<template>
    <tr
        v-longpress:600="(e) => showContextMenu(e, item)"
        class="cursor-pointer"
        @contextmenu="showContextMenu($event, item)">
        <td class="pr-0 text-center" style="width: 32px">
            <template v-if="smallThumbnail && bigThumbnail">
                <v-tooltip v-if="smallThumbnail && bigThumbnail" top content-class="tooltip__content-opacity1">
                    <template #activator="{ on, attrs }">
                        <vue-load-image>
                            <img slot="image" :src="smallThumbnail" width="32" height="32" v-bind="attrs" v-on="on" />
                            <div slot="preloader">
                                <v-progress-circular indeterminate color="primary" />
                            </div>
                            <div slot="error">
                                <v-icon>{{ mdiFile }}</v-icon>
                            </div>
                        </vue-load-image>
                    </template>
                    <span><img :src="bigThumbnail" width="250" /></span>
                </v-tooltip>
            </template>
            <template v-else-if="smallThumbnail">
                <vue-load-image>
                    <img slot="image" :src="smallThumbnail" width="32" height="32" />
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
            <small v-if="item?.metadata?.metadataPulled">{{ description }}</small>
        </td>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="removeFromJobqueue(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistRemove }}</v-icon>
                    {{ $t('JobQueue.RemoveFromQueue') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiFile, mdiPlay, mdiPlaylistRemove } from '@mdi/js'
@Component({
    components: {},
})
export default class StatusPanelJobqueueEntry extends Mixins(BaseMixin) {
    mdiFile = mdiFile
    mdiPlay = mdiPlay
    mdiPlaylistRemove = mdiPlaylistRemove

    @Prop({ type: Object, required: true }) declare item: ServerJobQueueStateJob
    @Prop({ type: Number, required: true }) declare contentTdWidth: number
    private contextMenu: {
        shown: boolean
        x: number
        y: number
        item: ServerJobQueueStateJob | any
    } = {
        shown: false,
        x: 0,
        y: 0,
        item: {},
    }

    declare $refs: {
        filesJobqueue: any
    }

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
    }

    get smallThumbnail() {
        return this.$store.getters['server/jobQueue/getSmallThumbnail'](this.item)
    }

    get bigThumbnail() {
        return this.$store.getters['server/jobQueue/getBigThumbnail'](this.item)
    }

    get description() {
        let output = ''

        output += this.$t('Panels.StatusPanel.Filament') + ': '
        if (this.item.metadata?.filament_total || this.item.metadata.filament_weight_total) {
            if (this.item.metadata?.filament_total) output += this.item.metadata.filament_total.toFixed() + ' mm'
            if (this.item.metadata?.filament_total && this.item.metadata.filament_weight_total) output += ' / '
            if (this.item.metadata?.filament_weight_total)
                output += this.item.metadata.filament_weight_total.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Panels.StatusPanel.PrintTime') + ': '
        if (this.item.metadata?.estimated_time) output += this.formatPrintTime(this.item.metadata.estimated_time)
        else output += '--'

        return output
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
}
</script>

<style lang="scss" scoped>
.filesJobqueue {
    position: relative;
}
</style>
