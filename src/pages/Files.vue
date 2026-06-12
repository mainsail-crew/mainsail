<template>
    <v-row v-if="existGcodesRootDirectory">
        <v-col :class="showJobQueue ? 'col-12 col-md-8 pt-0 pt-md-3 order-1 order-md-0' : 'col-12'">
            <gcodefiles-panel></gcodefiles-panel>
        </v-col>
        <v-col v-if="showJobQueue" class="col-12 col-md-4 pb-0 pb-sm-3 order-0 order-md-1">
            <jobqueue-panel></jobqueue-panel>
        </v-col>
    </v-row>
    <v-row v-else>
        <v-alert density="compact" variant="text" color="warning" elevation="2" class="mx-auto mt-6" max-width="500" :icon="mdiLockOutline">
            {{ $t('Files.GcodesRootDirectoryDoesntExists') }}
        </v-alert>
    </v-row>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import GcodefilesPanel from '@/components/panels/GcodefilesPanel.vue'
import JobqueuePanel from '@/components/panels/JobqueuePanel.vue'
import { mdiLockOutline } from '@mdi/js'

const store = useStore()
const { existGcodesRootDirectory, moonrakerComponents } = useBase()

const queued_jobs = computed(() => store.state.server.jobQueue.queued_jobs ?? [])

const showJobQueue = computed(() => moonrakerComponents.value.includes('job_queue') && queued_jobs.value.length)
</script>
