<template>
    <tr
        :key="item.job_id"
        v-longpress:600="(e) => showContextMenu(e, item)"
        :class="'file-list-cursor user-select-none ' + (item.exists ? '' : 'text--disabled')"
        @contextmenu="showContextMenu($event, item)"
        @click="clickRow(item)">
        <td class="pr-0">
            <v-simple-checkbox v-ripple :value="isSelected" class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <template v-if="!item.exists">
                <v-icon class="text--disabled">{{ mdiFile }}-cancel</v-icon>
            </template>
            <template v-else-if="smallThumbnail && bigThumbnail">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <vue-load-image>
                            <img slot="image" :src="smallThumbnail" width="32" height="32" v-bind="attrs" v-on="on" />
                            <v-progress-circular slot="preloader" indeterminate color="primary" />
                            <v-icon slot="error">{{ mdiFile }}</v-icon>
                        </vue-load-image>
                    </template>
                    <span><img :src="bigThumbnail" width="250" /></span>
                </v-tooltip>
            </template>
            <template v-else-if="smallThumbnail">
                <vue-load-image>
                    <img slot="image" :src="smallThumbnail" width="32" height="32" />
                    <v-progress-circular slot="preloader" indeterminate color="primary" />
                    <v-icon slot="error">{{ mdiFile }}</v-icon>
                </vue-load-image>
            </template>
            <template v-else>
                <v-icon>{{ mdiFile }}</v-icon>
            </template>
        </td>
        <td class=" ">{{ item.filename }}</td>
        <td class="text-right text-no-wrap">
            <template v-if="'note' in item && item.note">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <v-icon small class="mr-2" v-bind="attrs" v-on="on">
                            {{ mdiNotebook }}
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
        <td v-for="col in tableFields" :key="col.value" class="text-no-wrap">
            {{ outputValue(col, item) }}
        </td>
        <td v-if="headers.find((header) => header.value === 'slicer')?.visible" class=" ">
            {{ 'slicer' in item.metadata && item.metadata.slicer ? item.metadata.slicer : '--' }}
            <small v-if="'slicer_version' in item.metadata && item.metadata.slicer_version">
                <br />
                {{ item.metadata.slicer_version }}
            </small>
        </td>
    </tr>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { mdiFile, mdiNotebook } from '@mdi/js'

@Component({
    components: { HistoryListPanelDetailsDialog, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiFile = mdiFile
    mdiNotebook = mdiNotebook

    @Prop({ type: Object, required: true }) readonly item!: ServerHistoryStateJob
    @Prop({ type: Array, required: true }) readonly headers!: ServerHistoryStateJob
    @Prop({ type: Array, required: true }) readonly tableFields!: Array

    mounted() {
        window.console.log(this.item)
    }

    get smallThumbnail() {
        if (this.item.metadata?.thumbnails?.length) {
            const thumbnail = this.item.metadata?.thumbnails?.find(
                (thumb: any) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )

            let relative_url = ''
            if (this.item.filename.lastIndexOf('/') !== -1) {
                relative_url = this.item.filename.substring(0, this.item.filename.lastIndexOf('/'))
            }

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${this.apiUrl}/server/files/gcodes/${encodeURI(
                    relative_url + thumbnail.relative_path
                )}?timestamp=${this.item.metadata.modified}`
            }
        }

        return false
    }

    get bigThumbnail() {
        if (this.item.metadata?.thumbnails?.length) {
            const thumbnail = this.item.metadata?.thumbnails?.find((thumb: any) => thumb.width >= thumbnailBigMin)

            let relative_url = ''
            if (this.item.filename.lastIndexOf('/') !== -1) {
                relative_url = this.item.filename.substr(0, this.item.filename.lastIndexOf('/') + 1)
            }

            if (thumbnail && 'relative_path' in thumbnail)
                return `${this.apiUrl}/server/files/gcodes/${encodeURI(
                    relative_url + thumbnail.relative_path
                )}?timestamp=${this.item.metadata.modified}`
        }

        return false
    }

    get thumbnailWidth() {
        if (this.bigThumbnail) {
            const thumbnail = this.item.metadata?.thumbnails?.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail) return thumbnail.width
        }

        return 400
    }

    get statusIcon() {
        return this.$store.getters['server/history/getPrintStatusIcon'](this.item.status)
    }

    get statusColor() {
        return this.$store.getters['server/history/getPrintStatusIconColor'](this.item.status)
    }

    get statusName() {
        return this.$t(`History.StatusValues.${this.item.status}`, 'en')
            ? this.$t(`History.StatusValues.${this.item.status}`)
            : this.item.status.replace(/_/g, ' ')
    }
}
</script>
