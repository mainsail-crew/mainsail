<style lang="scss" scoped></style>

<template>
    <v-card ref="filesGcodeCard" flat>
        <v-data-table
            :items="gcodeFiles"
            hide-default-footer
            class="dashboard-gcodes-table"
            sort-by="time_added"
            mobile-breakpoint="0"
            @current-items="setFirst">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.Files.EmptyGcodes') }}</div>
            </template>

            <template #item="{ item }">
                <tr :key="item.filename" class="cursor-pointer" @click="showDialog(item)">
                    <td class="pr-0 text-center" style="width: 32px">
                        <template v-if="getSmallThumbnail(item) && getBigThumbnail(item)">
                            <v-tooltip
                                v-if="!item.isDirectory && getSmallThumbnail(item) && getBigThumbnail(item)"
                                top
                                content-class="tooltip__content-opacity1">
                                <template #activator="{ on, attrs }">
                                    <vue-load-image class="d-flex">
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
                    <td class="pr-2">
                        <div class="d-block text-truncate" :style="styleContentTdWidth">{{ item.filename }}</div>
                        <div v-if="existMetadata(item)">
                            <small>{{ getDescription(item) }}</small>
                        </div>
                    </td>
                    <td>
                        <v-tooltip v-if="getJobStatus(item)" top>
                            <template #activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">
                                    <v-icon small :color="getStatusColor(getJobStatus(item))">
                                        {{ getStatusIcon(getJobStatus(item)) }}
                                    </v-icon>
                                </span>
                            </template>
                            <span>{{ getJobStatus(item).replace(/_/g, ' ') }}</span>
                        </v-tooltip>
                    </td>
                </tr>
            </template>
        </v-data-table>
        <start-print-dialog
            :bool="showDialogBool"
            :file="dialogFile"
            :current-path="currentPath"
            @closeDialog="closeDialog"></start-print-dialog>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiFile } from '@mdi/js'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'

@Component({
    components: {
        StartPrintDialog,
    },
})
export default class StatusPanelFilesGcodes extends Mixins(BaseMixin) {
    mdiFile = mdiFile

    private showDialogBool = false
    private dialogFile: FileStateGcodefile = {
        isDirectory: false,
        filename: '',
        modified: new Date(),
        permissions: '',
        small_thumbnail: null,
        big_thumbnail: null,
        big_thumbnail_width: null,
        count_printed: 0,
        last_end_time: null,
        last_filament_used: null,
        last_print_duration: null,
        last_status: null,
        last_start_time: null,
        last_total_duration: null,
    }
    private currentPath = ''
    private contentTdWidth = 100

    declare $refs: {
        filesGcodeCard: any
    }

    get gcodeFiles() {
        let gcodes = this.$store.getters['files/getAllGcodes'] ?? []
        gcodes = gcodes
            .slice()
            .sort((a: FileStateGcodefile, b: FileStateGcodefile) => {
                return b.modified.getTime() - a.modified.getTime()
            })
            .slice(0, 5)

        const requestItems = gcodes.filter((file: FileStateFile) => !file.metadataRequested && !file.metadataPulled)
        requestItems.forEach((file: FileStateGcodefile) => {
            this.$store.dispatch('files/requestMetadata', {
                filename: 'gcodes/' + file.filename,
            })
        })

        return gcodes
    }

    get styleContentTdWidth() {
        return `width: ${this.contentTdWidth}px;`
    }

    getSmallThumbnail(item: ServerJobQueueStateJob) {
        const tmp = { ...item }
        const currentPath =
            item.filename.lastIndexOf('/') >= 0
                ? 'gcodes/' + item.filename.slice(0, item.filename.lastIndexOf('/'))
                : 'gcodes'
        tmp.filename = item.filename.slice(item.filename.lastIndexOf('/'))

        return this.$store.getters['files/getSmallThumbnail'](item, currentPath)
    }

    getBigThumbnail(item: ServerJobQueueStateJob) {
        const tmp = { ...item }
        const currentPath =
            item.filename.lastIndexOf('/') >= 0
                ? 'gcodes/' + item.filename.slice(0, item.filename.lastIndexOf('/'))
                : 'gcodes'
        tmp.filename = item.filename.slice(item.filename.lastIndexOf('/'))

        return this.$store.getters['files/getBigThumbnail'](item, currentPath)
    }

    getDescription(item: FileStateGcodefile) {
        let output = ''

        output += this.$t('Panels.StatusPanel.Files.Filament') + ': '
        if (item.filament_total || item.filament_weight_total) {
            if (item.filament_total) output += item.filament_total.toFixed() + ' mm'
            if (item.filament_total && item.filament_weight_total) output += ' / '
            if (item.filament_weight_total) output += item.filament_weight_total.toFixed(2) + ' g'
        } else output += '--'

        output += ', ' + this.$t('Panels.StatusPanel.Files.PrintTime') + ': '
        if (item.estimated_time) output += this.formatPrintTime(item.estimated_time)
        else output += '--'

        return output
    }

    existMetadata(item: FileStateGcodefile) {
        return item?.metadataPulled
    }

    setFirst(currItems: any) {
        // first check that actually exists values
        if (currItems.length) {
            // toggle all to false
            currItems.forEach((x: any) => (x.isFirst = false))
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

    getJobStatus(item: FileStateGcodefile) {
        return item.last_status
    }

    getStatusIcon(status: string) {
        return this.$store.getters['server/history/getPrintStatusIcon'](status)
    }

    getStatusColor(status: string) {
        return this.$store.getters['server/history/getPrintStatusIconColor'](status)
    }

    showDialog(file: FileStateGcodefile) {
        this.currentPath =
            file.filename.lastIndexOf('/') >= 0
                ? 'gcodes/' + file.filename.slice(0, file.filename.lastIndexOf('/'))
                : 'gcodes'
        this.dialogFile = { ...file }
        if (file.filename.lastIndexOf('/') >= 0) {
            this.dialogFile.filename = file.filename.slice(file.filename.lastIndexOf('/') + 1)
        }
        this.showDialogBool = true
    }

    closeDialog() {
        this.showDialogBool = false
    }

    mounted() {
        window.addEventListener('resize', this.eventListenerResize)
        this.eventListenerResize()
    }

    destroyed() {
        window.removeEventListener('resize', this.eventListenerResize)
    }

    eventListenerResize() {
        this.contentTdWidth = this.$refs.filesGcodeCard?.$el?.clientWidth - 48 - 48 - 32
    }
}
</script>
