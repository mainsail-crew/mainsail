<template>
    <v-card ref="filesJobqueue" class="filesJobqueue" flat>
        <v-data-table
            :items="jobsTable"
            hide-default-footer
            class="dashboard-jobqueue-table"
            sort-by="time_added"
            mobile-breakpoint="0">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.EmptyJobqueue') }}</div>
            </template>

            <template #item="{ item, index }">
                <jobqueue-entry
                    :key="item.job_id"
                    :item="item"
                    :is-first="index === 0"
                    :content-td-width="contentTdWidth" />
            </template>
            <template v-if="jobsRest.length" #body.append>
                <tr>
                    <td class="pr-0 text-center" style="width: 32px">
                        <v-icon>{{ mdiFileMultiple }}</v-icon>
                    </td>
                    <td class="pr-2">
                        {{
                            $tc('Panels.StatusPanel.JobqueueMoreFiles', restJobsLength, {
                                count: restJobsLength,
                            })
                        }}
                        <br />
                        <small>{{ descriptionRestJobs }}</small>
                    </td>
                </tr>
            </template>
        </v-data-table>
        <resize-observer @notify="handleResize" />
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiFileMultiple } from '@mdi/js'
import JobqueueEntry from '@/components/panels/Status/JobqueueEntry.vue'
@Component({
    components: { JobqueueEntry },
})
export default class StatusPanelJobqueue extends Mixins(BaseMixin) {
    mdiFileMultiple = mdiFileMultiple

    private contentTdWidth = 100

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

    get restJobsLength() {
        let count = 0

        this.jobsRest.forEach((item: ServerJobQueueStateJob) => {
            count += (item.combinedIds?.length ?? 0) + 1
        })

        return count
    }

    get descriptionRestJobs() {
        let filamentLength = 0
        let filamentWeight = 0
        let printTime = 0

        this.jobsRest.forEach((item: ServerJobQueueStateJob) => {
            const count = (item.combinedIds?.length ?? 0) + 1

            if (item.metadata?.filament_total) filamentLength += item.metadata?.filament_total * count
            if (item.metadata?.filament_weight_total) filamentWeight += item.metadata?.filament_weight_total * count
            if (item.metadata?.estimated_time) printTime += item.metadata.estimated_time * count
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

    startJobqueue() {
        this.$store.dispatch('server/jobQueue/start')
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

<style scoped>
.filesJobqueue {
    position: relative;
}
</style>
