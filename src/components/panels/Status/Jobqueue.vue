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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import JobqueueEntry from '@/components/panels/Status/JobqueueEntry.vue'
import JobqueueEntryRest from '@/components/panels/Status/JobqueueEntryRest.vue'

const store = useStore()

const jobs = computed(() => store.getters['server/jobQueue/getJobs'] ?? [])

const maxLength = computed(() => jobs.value.length > 5 ? 4 : 5)

const jobsTable = computed(() => jobs.value.slice(0, maxLength.value))

const jobsRest = computed(() => jobs.value.slice(maxLength.value))

function startJobqueue() {
    store.dispatch('server/jobQueue/start')
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
