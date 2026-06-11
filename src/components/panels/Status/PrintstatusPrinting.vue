<style scoped></style>

<template>
    <v-card-text class="pa-0">
        <v-container class="py-0">
            <v-row class="text-center py-5" align="center">
                <v-col class="col-3 pa-0">
                    <template v-if="live_velocity !== null">
                        <v-tooltip top>
                            <template #activator="{ on, attrs }">
                                <div v-bind="attrs" v-on="on">
                                    <strong>{{ $t('Panels.StatusPanel.Speed') }}</strong>
                                    <br />
                                    <span class="text-no-wrap">{{ live_velocity }} mm/s</span>
                                </div>
                            </template>
                            <span>{{ $t('Panels.StatusPanel.Requested') }}: {{ requested_speed + ' mm/s' }}</span>
                        </v-tooltip>
                    </template>
                    <template v-else>
                        <strong>{{ $t('Panels.StatusPanel.Speed') }}</strong>
                        <br />
                        <span class="text-no-wrap">{{ requested_speed }} mm/s</span>
                    </template>
                </v-col>
                <v-col class="col-3 pa-0">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <div v-bind="attrs" v-on="on">
                                <strong>{{ $t('Panels.StatusPanel.Flow') }}</strong>
                                <br />
                                <span class="d-block text-center text-no-wrap">
                                    {{ live_flow + ' mm&sup3;/s' }}
                                </span>
                            </div>
                        </template>
                        <span>{{ $t('Panels.StatusPanel.Max') }}: {{ outputMaxFlow }}</span>
                    </v-tooltip>
                </v-col>
                <v-col class="col-3 pa-0">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <div v-bind="attrs" v-on="on">
                                <strong>{{ outputFilamentTitle }}</strong>
                                <br />
                                <span class="d-block text-center text-no-wrap">
                                    {{ outputFilamentUsed }}
                                </span>
                            </div>
                        </template>
                        <span v-if="'filament_total' in current_file">
                            {{ (filament_used / 1000).toFixed(2) }} /
                            {{ (current_file.filament_total / 1000).toFixed(2) }} m =
                            {{ ((100 / current_file.filament_total) * filament_used).toFixed(0) }} %
                        </span>
                    </v-tooltip>
                </v-col>
                <v-col class="col-3 pa-0 text-center">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <div v-bind="attrs" class="text-center" v-on="on">
                                <strong>{{ $t('Panels.StatusPanel.Layer') }}</strong>
                                <br />
                                <span class="text-no-wrap">{{ current_layer }} of {{ max_layers }}</span>
                            </div>
                        </template>
                        <span v-if="'object_height' in current_file && current_file.object_height > 0">
                            {{ $t('Panels.StatusPanel.ObjectHeight') }}: {{ current_file.object_height }} mm
                        </span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </v-container>
        <v-divider class="my-0"></v-divider>
        <v-container class="py-0">
            <v-row class="text-center pt-5 pb-2 mb-0" align="center">
                <v-col class="col-3 pa-0">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <div v-bind="attrs" class="text-center" v-on="on">
                                <strong>{{ $t('Panels.StatusPanel.Estimate') }}</strong>
                                <br />
                                <span class="text-no-wrap">
                                    {{ estimated_time_avg ? formatDuration(estimated_time_avg) : '--' }}
                                </span>
                            </div>
                        </template>
                        <div class="text-right">
                            {{ $t('Panels.StatusPanel.File') }}:
                            {{ estimated_time_file ? formatDuration(estimated_time_file) : '--' }}
                            <br />
                            {{ $t('Panels.StatusPanel.Filament') }}:
                            {{ estimated_time_filament ? formatDuration(estimated_time_filament) : '--' }}
                        </div>
                    </v-tooltip>
                </v-col>
                <v-col class="col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Slicer') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ estimated_time_slicer ? formatDuration(estimated_time_slicer) : '--' }}
                    </span>
                </v-col>
                <v-col class="col-3 pa-0">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <div v-bind="attrs" class="text-center" v-on="on">
                                <strong>{{ $t('Panels.StatusPanel.Total') }}</strong>
                                <br />
                                <span class="text-no-wrap">
                                    {{ print_time_total ? formatDuration(print_time_total) : '--' }}
                                </span>
                            </div>
                        </template>
                        <div class="text-right">
                            {{ $t('Panels.StatusPanel.Print') }}:
                            {{ print_time ? formatDuration(print_time) : '--' }}
                            <br />
                            {{ $t('Panels.StatusPanel.Difference') }}:
                            {{ print_time && print_time_total ? formatDuration(print_time_total - print_time) : '--' }}
                        </div>
                    </v-tooltip>
                </v-col>
                <v-col class="col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.ETA') }}</strong>
                    <br />
                    <span class="text-no-wrap">{{ eta }}</span>
                </v-col>
            </v-row>
        </v-container>
    </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

let maxFlow = 0

const current_file = computed(() => store.state.printer.current_file ?? {})
const live_velocity = computed(() => Math.abs(store.state.printer.motion_report?.live_velocity?.toFixed(0)) ?? null)

const live_extruder_velocity = computed(() => {
    const val = store.state.printer.motion_report?.live_extruder_velocity ?? null
    if (val === null) return null
    return val > 0 ? val : 0
})

const live_flow = computed(() => {
    if (live_extruder_velocity.value === null) return null
    const filamentCrossSection = Math.pow(filament_diameter.value / 2, 2) * Math.PI
    const currentFlow = filamentCrossSection * live_extruder_velocity.value
    if (currentFlow && maxFlow < currentFlow) maxFlow = currentFlow
    return currentFlow?.toFixed(1)
})

const outputMaxFlow = computed(() => maxFlow ? maxFlow.toFixed(1) + ' mm³/s' : '--')

const requested_speed = computed(() => {
    const requestedSpeed = store.state.printer.gcode_move?.speed ?? 0
    const speedFactor = store.state.printer.gcode_move?.speed_factor ?? 0
    const maxVelocity = store.state.printer.toolhead?.max_velocity ?? 0
    const speed = (requestedSpeed / 60) * speedFactor
    if (speed > maxVelocity) return maxVelocity
    return speed.toFixed(0)
})

const max_layers = computed(() => store.getters['printer/getPrintMaxLayers'] ?? 0)
const current_layer = computed(() => store.getters['printer/getPrintCurrentLayer'] ?? 0)

const estimated_time_file = computed(() => store.getters['printer/getEstimatedTimeFile'])
const estimated_time_filament = computed(() => store.getters['printer/getEstimatedTimeFilament'])
const estimated_time_slicer = computed(() => store.getters['printer/getEstimatedTimeSlicer'])
const estimated_time_avg = computed(() => store.getters['printer/getEstimatedTimeAvg'])
const eta = computed(() => store.getters['printer/getEstimatedTimeETAFormat'])

const filament_diameter = computed(() => store.state.printer.configfile?.settings?.extruder?.filament_diameter ?? 1.75)

const print_time = computed(() => store.state.printer.print_stats?.print_duration ?? 0)
const print_time_total = computed(() => store.state.printer.print_stats?.total_duration ?? 0)
const filament_used = computed(() => store.state.printer.print_stats?.filament_used ?? 0)

const outputFilamentTitle = computed(() => 'Filament')

const outputFilamentUsed = computed(() =>
    filament_used.value >= 1000
        ? (filament_used.value / 1000).toFixed(2) + ' m'
        : filament_used.value.toFixed(2) + ' mm'
)

function formatDuration(seconds: number) {
    const prefix = seconds < 0 ? '-' : ''
    let absSeconds = Math.abs(seconds)
    const h = Math.floor(absSeconds / 3600)
    absSeconds %= 3600
    const m = ('0' + Math.floor(absSeconds / 60)).slice(-2)
    const s = ('0' + Math.floor(absSeconds % 60)).slice(-2)
    return prefix + h + ':' + m + ':' + s
}
</script>
