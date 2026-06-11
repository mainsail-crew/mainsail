<template>
    <div>
        <v-row>
            <v-col>
                <history-statistics-panel />
            </v-col>
        </v-row>
        <v-row class="mt-0">
            <v-col>
                <history-list-panel />
            </v-col>
        </v-row>
    </div>
</template>
<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import HistoryListPanel from '@/components/panels/HistoryListPanel.vue'
import HistoryStatisticsPanel from '@/components/panels/HistoryStatisticsPanel.vue'

const { } = useBase()
</script>
