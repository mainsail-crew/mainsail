<style scoped></style>

<template>
    <div>
        <v-row>
            <v-col cols="12">
                <webcam-panel current-page="page" />
            </v-col>
        </v-row>
    </div>
</template>
<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'

const { } = useBase()
</script>
