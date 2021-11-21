<template>
    <v-row>
        <v-col :class="showJobQueue ? 'col-8' : 'col-12'">
            <gcodefiles-panel></gcodefiles-panel>
        </v-col>
        <v-col v-if="showJobQueue" class="col-4">
            <jobqueue-panel></jobqueue-panel>
        </v-col>
    </v-row>

</template>
<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesPanel from '@/components/panels/GcodefilesPanel.vue'
import JobqueuePanel from '@/components/panels/JobqueuePanel.vue'

@Component({
    components: {JobqueuePanel, GcodefilesPanel}
})
export default class PageFiles extends Mixins(BaseMixin) {
    get queued_jobs() {
        return this.$store.state.server.jobQueue.queued_jobs ?? []
    }

    get showJobQueue() {
        return (this.moonrakerComponents.includes('job_queue') && this.queued_jobs.length)
    }
}
</script>
