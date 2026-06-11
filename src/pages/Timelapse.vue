<style scoped></style>

<template>
    <v-row>
        <v-col class="v-col-12 v-col-md-8 pt-0 pt-md-3" :order="mdAndUp ? '' : '2'">
            <timelapse-files-panel></timelapse-files-panel>
        </v-col>
        <v-col class="v-col-12 v-col-md-4" :order="mdAndUp ? '' : '1'">
            <timelapse-status-panel></timelapse-status-panel>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { useDisplay } from 'vuetify'
import TimelapseFilesPanel from '@/components/panels/Timelapse/TimelapseFilesPanel.vue'
import TimelapseStatusPanel from '@/components/panels/Timelapse/TimelapseStatusPanel.vue'

const { mdAndUp } = useDisplay()
</script>
