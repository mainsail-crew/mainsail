<template>
    <v-card class="filesJobqueue" flat>
        <template v-if="jobs.length">
            <v-row class="mx-0 mt-0 pb-3">
                <v-col class="jobqueue-list">
                    <jobqueue-entry
                        v-for="(job, index) in jobsTable"
                        :key="job.job_id"
                        :job="job"
                        :show-handle="false"
                        :show-print-button="index === 0" />
                    <jobqueue-entry-rest v-if="jobsRest.length" :jobs="jobsRest" />
                </v-col>
            </v-row>
        </template>
        <div v-else>
            <p class="body-2 my-3 text-center text--disabled">{{ $t('Panels.StatusPanel.EmptyJobqueue') }}</p>
        </div>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import JobqueueEntry from '@/components/panels/Status/JobqueueEntry.vue'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
@Component({
    components: { JobqueueEntry },
})
export default class StatusPanelJobqueue extends Mixins(BaseMixin) {
    get jobs(): ServerJobQueueStateJob[] {
        return this.$store.getters['server/jobQueue/jobs']
    }

    get maxLength() {
        if (this.jobs.length > 5) return 4

        return 5
    }

    get jobsTable() {
        return this.jobs.slice(0, this.maxLength)
    }

    get jobsRest() {
        return this.jobs.slice(this.maxLength)
    }

    async startJobqueue() {
        try {
            await this.$store.dispatch('server/jobQueue/start')
        } catch (e) {
            window.console.error('[StatusPanelJobqueue] Failed to start the job queue', e)
        }
    }
}
</script>

<style scoped>
.jobqueue-list .jobqueue-list-entry + .jobqueue-list-entry {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.theme--light .jobqueue-list > .jobqueue-list-entry + .jobqueue-list-entry {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
