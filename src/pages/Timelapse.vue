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
<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import TimelapseFilesPanel from '@/components/panels/Timelapse/TimelapseFilesPanel.vue'
import TimelapseStatusPanel from '@/components/panels/Timelapse/TimelapseStatusPanel.vue'

const { } = useBase()
</script>
