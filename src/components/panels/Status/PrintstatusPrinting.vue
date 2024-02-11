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
                                <strong>{{ $t('Panels.StatusPanel.Filament') }}</strong>
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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelFilesJobqueue from '@/components/panels/Status/Jobqueue.vue'
import StatusPanelFilesGcodes from '@/components/panels/Status/Gcodefiles.vue'

@Component({
    components: {
        StatusPanelFilesJobqueue,
        StatusPanelFilesGcodes,
    },
})
export default class StatusPanelPrintstatusPrinting extends Mixins(BaseMixin) {
    private maxFlow: number = 0

    get current_file() {
        return this.$store.state.printer.current_file ?? {}
    }

    get live_velocity() {
        return Math.abs(this.$store.state.printer.motion_report?.live_velocity?.toFixed(0)) ?? null
    }

    get live_extruder_velocity() {
        const live_extruder_velocity = this.$store.state.printer.motion_report?.live_extruder_velocity ?? null
        if (live_extruder_velocity === null) return null

        return live_extruder_velocity > 0 ? live_extruder_velocity : 0
    }

    get live_flow() {
        if (this.live_extruder_velocity === null) return null

        const filamentCrossSection = Math.pow(this.filament_diameter / 2, 2) * Math.PI
        const currentFlow = filamentCrossSection * this.live_extruder_velocity

        if (currentFlow && this.maxFlow < currentFlow) this.maxFlow = currentFlow

        return currentFlow?.toFixed(1)
    }

    get outputMaxFlow() {
        return this.maxFlow ? this.maxFlow.toFixed(1) + ' mm³/s' : '--'
    }

    get requested_speed() {
        const requested_speed = this.$store.state.printer.gcode_move?.speed ?? 0
        const speed_factor = this.$store.state.printer.gcode_move?.speed_factor ?? 0
        const max_velocity = this.$store.state.printer.toolhead?.max_velocity ?? 0

        const speed = (requested_speed / 60) * speed_factor
        if (speed > max_velocity) return max_velocity

        return speed.toFixed(0)
    }

    get max_layers() {
        return this.$store.getters['printer/getPrintMaxLayers'] ?? 0
    }

    get current_layer() {
        return this.$store.getters['printer/getPrintCurrentLayer'] ?? 0
    }

    get estimated_time_file() {
        return this.$store.getters['printer/getEstimatedTimeFile']
    }

    get estimated_time_filament() {
        return this.$store.getters['printer/getEstimatedTimeFilament']
    }

    get estimated_time_slicer() {
        return this.$store.getters['printer/getEstimatedTimeSlicer']
    }

    get estimated_time_avg() {
        return this.$store.getters['printer/getEstimatedTimeAvg']
    }

    get eta() {
        return this.$store.getters['printer/getEstimatedTimeETAFormat']
    }

    get filament_diameter() {
        return this.$store.state.printer.configfile?.settings?.extruder?.filament_diameter ?? 1.75
    }

    get print_time() {
        return this.$store.state.printer.print_stats?.print_duration ?? 0
    }

    get print_time_total() {
        return this.$store.state.printer.print_stats?.total_duration ?? 0
    }

    get filament_used() {
        return this.$store.state.printer.print_stats?.filament_used ?? 0
    }

    get outputFilamentUsed() {
        return this.filament_used >= 1000
            ? (this.filament_used / 1000).toFixed(2) + ' m'
            : this.filament_used.toFixed(2) + ' mm'
    }

    formatDuration(seconds: number) {
        let prefix = seconds < 0 ? '-' : ''
        let absSeconds = Math.abs(seconds)

        let h = Math.floor(absSeconds / 3600)
        absSeconds %= 3600
        let m = ('0' + Math.floor(absSeconds / 60)).slice(-2)
        let s = ('0' + (absSeconds % 60).toFixed(0)).slice(-2)

        return prefix + h + ':' + m + ':' + s
    }
}
</script>
