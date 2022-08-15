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
        <v-alert dense text type="warning" elevation="2" class="mx-auto mt-6" max-width="500" :icon="mdiLockOutline">
            {{ $t('Files.GcodesRootDirectoryDoesntExists') }}
        </v-alert>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesPanel from '@/components/panels/GcodefilesPanel.vue'
import JobqueuePanel from '@/components/panels/JobqueuePanel.vue'
import { mdiLockOutline } from '@mdi/js'

@Component({
    components: { JobqueuePanel, GcodefilesPanel },
})
export default class PageFiles extends Mixins(BaseMixin) {
    mdiLockOutline = mdiLockOutline

    get queued_jobs() {
        return this.$store.state.server.jobQueue.queued_jobs ?? []
    }

    get showJobQueue() {
        return this.moonrakerComponents.includes('job_queue') && this.queued_jobs.length
    }
}
</script>
