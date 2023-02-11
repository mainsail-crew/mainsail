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
            <template v-if="isFirst && !printerIsPrinting">
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
                <v-list-item @click="openChangeCountDialog(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiCounter }}</v-icon>
                    {{ $t('JobQueue.ChangeCount') }}
                </v-list-item>
                <v-list-item @click="removeFromJobqueue(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPlaylistRemove }}</v-icon>
                    {{ $t('JobQueue.RemoveFromQueue') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogChangeCount.show" max-width="400">
            <panel
                :title="$t('JobQueue.ChangeCount').toString()"
                :icon="mdiCounter"
                card-class="jobqueue-change-count-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogChangeCount.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>

                <v-card-text>
                    <v-text-field
                        ref="inputFieldAddToQueueCount"
                        v-model="dialogChangeCount.count"
                        :label="$t('JobQueue.Count')"
                        required
                        :rules="countInputRules"
                        hide-spin-buttons
                        type="number"
                        @keyup.enter="changeCountAction">
                        <template #append-outer>
                            <div class="_spin_button_group">
                                <v-btn class="mt-n3" icon plain small @click="dialogChangeCount.count++">
                                    <v-icon>{{ mdiChevronUp }}</v-icon>
                                </v-btn>
                                <v-btn
                                    :disabled="dialogChangeCount.count <= 1"
                                    class="mb-n3"
                                    icon
                                    plain
                                    small
                                    @click="dialogChangeCount.count--">
                                    <v-icon>{{ mdiChevronDown }}</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="" text @click="dialogChangeCount.show = false">{{ $t('JobQueue.Cancel') }}</v-btn>
                    <v-btn color="primary" text @click="changeCountAction">{{ $t('JobQueue.ChangeCount') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiChevronDown, mdiChevronUp, mdiCloseThick, mdiCounter, mdiFile, mdiPlay, mdiPlaylistRemove } from '@mdi/js'
import NumberInput from '@/components/inputs/NumberInput.vue'
@Component({
    components: { NumberInput },
})
export default class StatusPanelJobqueueEntry extends Mixins(BaseMixin) {
    mdiChevronDown = mdiChevronDown
    mdiChevronUp = mdiChevronUp
    mdiCloseThick = mdiCloseThick
    mdiCounter = mdiCounter
    mdiFile = mdiFile
    mdiPlay = mdiPlay
    mdiPlaylistRemove = mdiPlaylistRemove

    @Prop({ type: Object, required: true }) declare item: ServerJobQueueStateJob
    @Prop({ type: Number, required: true }) declare contentTdWidth: number
    @Prop({ type: Boolean, default: false }) declare isFirst: boolean
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

    private dialogChangeCount: {
        show: boolean
        count: number
        item: ServerJobQueueStateJob | any
    } = {
        show: false,
        count: 1,
        item: {},
    }

    private countInputRules = [
        (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
        (value: string) => parseInt(value) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
    ]

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

    openChangeCountDialog(item: ServerJobQueueStateJob) {
        this.dialogChangeCount.show = true
        this.dialogChangeCount.count = (item.combinedIds?.length ?? 0) + 1
        this.dialogChangeCount.item = item
    }

    changeCountAction() {
        this.$store.dispatch('server/jobQueue/changeCount', {
            job_id: this.dialogChangeCount.item.job_id,
            count: this.dialogChangeCount.count,
        })
        this.dialogChangeCount.show = false
    }
}
</script>

<style lang="scss" scoped>
.filesJobqueue {
    position: relative;
}
._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}
</style>
