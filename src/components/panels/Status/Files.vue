<style lang="scss" scoped></style>

<template>
    <div>
        <v-tabs v-model="tabs" fixed-tabs dark>
            <v-tab value="files">{{ $t('Panels.StatusPanel.Files.Files') }}</v-tab>
            <v-tab value="jobqueue">{{ $t('Panels.StatusPanel.Files.Jobqueue', { count: jobsCount }) }}</v-tab>
        </v-tabs>
        <v-divider class="my-0"></v-divider>
        <v-tabs-items v-model="tabs">
            <v-tab-item>
                <status-panel-files-gcodes></status-panel-files-gcodes>
            </v-tab-item>
            <v-tab-item>
                <status-panel-files-jobqueue></status-panel-files-jobqueue>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelFilesJobqueue from '@/components/panels/Status/FilesJobqueue.vue'
import StatusPanelFilesGcodes from '@/components/panels/Status/FilesGcodes.vue'
@Component({
    components: {
        StatusPanelFilesJobqueue,
        StatusPanelFilesGcodes,
    },
})
export default class StatusPanelFiles extends Mixins(BaseMixin) {
    private tabs = 'files'

    get jobs() {
        return this.$store.getters['server/jobQueue/getJobs']
    }

    get jobsCount() {
        return this.jobs?.length ?? 0
    }
}
</script>
