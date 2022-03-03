<style scoped></style>

<template>
    <v-row>
        <v-col class="col-12 col-md-8 pt-0 pt-md-3" :order="$vuetify.breakpoint.mdAndUp ? '' : '2'">
            <timelapse-files-panel></timelapse-files-panel>
        </v-col>
        <v-col class="col-12 col-md-4" :order="$vuetify.breakpoint.mdAndUp ? '' : '1'">
            <timelapse-status-panel></timelapse-status-panel>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TimelapseFilesPanel from '@/components/panels/Timelapse/TimelapseFilesPanel.vue'
import TimelapseStatusPanel from '@/components/panels/Timelapse/TimelapseStatusPanel.vue'
@Component({
    components: { TimelapseStatusPanel, TimelapseFilesPanel },
})
export default class PageTimelapse extends Mixins(BaseMixin) {}
</script>
