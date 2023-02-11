<template>
    <div>
        <panel
            ref="jobqueuePanel"
            :icon="mdiTrayFull"
            :title="$t('JobQueue.JobQueue').toString()"
            card-class="jobqueue-panel">
            <template #buttons>
                <v-btn
                    v-if="queueState === 'paused'"
                    color="success"
                    :loading="loadings.includes('startJobqueue')"
                    icon
                    tile
                    :disabled="!klipperReadyForGui"
                    @click="startJobqueue">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">{{ mdiPlay }}</v-icon>
                        </template>
                        <span>{{ $t('JobQueue.Start') }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn
                    v-if="['ready', 'loading'].includes(queueState)"
                    color="warning"
                    :loading="loadings.includes('pauseJobqueue')"
                    icon
                    tile
                    @click="pauseJobqueue">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">{{ mdiPause }}</v-icon>
                        </template>
                        <span>{{ $t('JobQueue.Pause') }}</span>
                    </v-tooltip>
                </v-btn>
            </template>
            <v-data-table
                :items="jobs"
                class="jobqueue-table"
                sort-by="time_added"
                :items-per-page.sync="countPerPage"
                :footer-props="{
                    itemsPerPageText: $t('JobQueue.Jobs'),
                    itemsPerPageAllText: $t('JobQueue.AllJobs'),
                    itemsPerPageOptions: [10, 25, 50, 100, -1],
                }"
                mobile-breakpoint="0">
                <template #no-data>
                    <div class="text-center">{{ $t('JobQueue.Empty') }}</div>
                </template>

                <template #item="{ item }">
                    <jobqueue-entry :key="item.job_id" :item="item" :content-td-width="contentTdWidth" />
                </template>
            </v-data-table>
            <resize-observer @notify="handleResize" />
        </panel>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiPlay, mdiPause, mdiTrayFull } from '@mdi/js'
import JobqueueEntry from '@/components/panels/Status/JobqueueEntry.vue'
@Component({
    components: { JobqueueEntry, Panel },
})
export default class JobqueuePanel extends Mixins(BaseMixin) {
    mdiPlay = mdiPlay
    mdiPause = mdiPause
    mdiTrayFull = mdiTrayFull

    private contentTdWidth = 100

    declare $refs: {
        jobqueuePanel: any
    }

    get jobs() {
        return this.$store.getters['server/jobQueue/getJobs']
    }

    get queueState() {
        return this.$store.state.server.jobQueue.queue_state ?? ''
    }

    get countPerPage() {
        return this.$store.state.gui.view.jobqueue.countPerPage
    }

    set countPerPage(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.jobqueue.countPerPage', value: newVal })
    }

    startJobqueue() {
        this.$store.dispatch('server/jobQueue/start')
    }

    pauseJobqueue() {
        this.$store.dispatch('server/jobQueue/pause')
    }

    mounted() {
        this.calcContentTdWidth()
    }

    calcContentTdWidth() {
        this.contentTdWidth = this.$refs.jobqueuePanel?.$el?.clientWidth - 48 - 32
    }

    handleResize() {
        this.$nextTick(() => {
            this.calcContentTdWidth()
        })
    }
}
</script>

<style scoped>
.jobqueue-panel {
    position: relative;
}
</style>
