<template>
    <v-card class="history" flat>
        <template v-if="jobsCombined.length">
            <v-row class="mx-0 mt-0 pb-3">
                <v-col class="history-list">
                    <status-panel-history-entry v-for="job in jobsCombined" :key="job.job_id" :job="job" />
                </v-col>
            </v-row>
        </template>
        <div v-else>
            <p class="body-2 my-3 text-center text--disabled">{{ $t('Panels.StatusPanel.EmptyHistory') }}</p>
        </div>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelHistoryEntry from '@/components/panels/Status/HistoryEntry.vue'
import { ServerHistoryStateJob, ServerHistoryStateJobWithCount } from '@/store/server/history/types'

@Component({
    components: { StatusPanelHistoryEntry },
})
export default class StatusPanelHistory extends Mixins(BaseMixin) {
    get jobs(): ServerHistoryStateJob[] {
        return this.$store.state.server.history.jobs ?? []
    }

    get maxLength() {
        return this.$store.state.gui.uiSettings.dashboardHistoryLimit ?? 5
    }

    get jobsCombined() {
        const jobs: ServerHistoryStateJobWithCount[] = []

        for (const job of this.jobs) {
            if (jobs.length === 0) {
                jobs.push({ ...job, count: 1 })
                continue
            }

            const lastJob = jobs[jobs.length - 1]
            const lastJobUuid = lastJob.metadata.uuid ?? null
            const jobUuid = job.metadata.uuid ?? null
            if (lastJobUuid === jobUuid && lastJob.status === job.status) {
                lastJob.filament_used += job.filament_used
                lastJob.print_duration += job.print_duration
                lastJob.total_duration += job.total_duration
                lastJob.count += 1
                continue
            }

            if (jobs.length >= this.maxLength) break

            jobs.push({ ...job, count: 1 })
        }

        return jobs
    }

    startJobqueue() {
        this.$store.dispatch('server/jobQueue/start')
    }
}
</script>

<style scoped>
.history-list .history-list-entry + .history-list-entry {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.theme--light .history-list > .history-list-entry + .history-list-entry {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
