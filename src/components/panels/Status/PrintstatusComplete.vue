<style scoped></style>

<template>
    <v-card-text class="pa-0">
        <v-container class="py-0">
            <v-row class="text-center pt-5 pb-2 mb-0" align="center">
                <v-col class="v-col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Filament') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ outputFilamentUsed }}
                    </span>
                </v-col>
                <v-col class="v-col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Slicer') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ 'estimated_time' in current_file ? formatTime(current_file.estimated_time) : '--' }}
                    </span>
                </v-col>
                <v-col class="v-col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Print') }}</strong>
                    <br />
                    <span class="text-no-wrap">{{ print_time ? formatTime(print_time) : '--' }}</span>
                </v-col>
                <v-col class="v-col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Total') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ print_time_total ? formatTime(print_time_total) : '--' }}
                    </span>
                </v-col>
            </v-row>
        </v-container>
    </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const current_file = computed(() => store.state.printer.current_file ?? {})
const filament_used = computed(() => store.state.printer.print_stats?.filament_used ?? 0)
const print_time = computed(() => store.state.printer.print_stats?.print_duration ?? 0)
const print_time_total = computed(() => store.state.printer.print_stats?.total_duration ?? 0)

const outputFilamentUsed = computed(() =>
    filament_used.value >= 1000
        ? (filament_used.value / 1000).toFixed(2) + ' m'
        : filament_used.value.toFixed(2) + ' mm'
)

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    seconds %= 3600
    const m = ('0' + Math.floor(seconds / 60)).slice(-2)
    const s = ('0' + (seconds % 60).toFixed(0)).slice(-2)
    return h + ':' + m + ':' + s
}
</script>
