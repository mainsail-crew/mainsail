<style scoped>

</style>

<template>
    <v-row>
        <v-col class="col-8">
            <timelapse-files-panel></timelapse-files-panel>
        </v-col>
        <v-col class="col-4">
            <timelapse-status-panel></timelapse-status-panel>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TimelapseFilesPanel from '@/components/panels/Timelapse/TimelapseFilesPanel.vue'
import TimelapseStatusPanel from '@/components/panels/Timelapse/TimelapseStatusPanel.vue'
@Component({
    components: {TimelapseStatusPanel, TimelapseFilesPanel}
})
export default class PageTimelapse extends Mixins(BaseMixin) {

}
</script>
