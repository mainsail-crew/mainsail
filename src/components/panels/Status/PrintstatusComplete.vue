<style scoped></style>

<template>
    <v-card-text class="pa-0">
        <v-container class="py-0">
            <v-row class="text-center pt-5 pb-2 mb-0" align="center">
                <v-col class="col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Filament') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ outputFilamentUsed }}
                    </span>
                </v-col>
                <v-col class="col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Slicer') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ 'estimated_time' in current_file ? formatTime(current_file.estimated_time) : '--' }}
                    </span>
                </v-col>
                <v-col class="col-3 pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Print') }}</strong>
                    <br />
                    <span class="text-no-wrap">{{ print_time ? formatTime(print_time) : '--' }}</span>
                </v-col>
                <v-col class="col-3 pa-0">
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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({
    components: {},
})
export default class StatusPanelPrintstatusComplete extends Mixins(BaseMixin) {
    get current_file() {
        return this.$store.state.printer.current_file ?? {}
    }

    get filament_used() {
        return this.$store.state.printer.print_stats?.filament_used ?? 0
    }

    get outputFilamentUsed() {
        return this.filament_used >= 1000
            ? (this.filament_used / 1000).toFixed(2) + ' m'
            : this.filament_used.toFixed(2) + ' mm'
    }

    get print_time() {
        return this.$store.state.printer.print_stats?.print_duration ?? 0
    }

    get print_time_total() {
        return this.$store.state.printer.print_stats?.total_duration ?? 0
    }

    formatTime(seconds: number) {
        let h = Math.floor(seconds / 3600)
        seconds %= 3600
        let m = ('0' + Math.floor(seconds / 60)).slice(-2)
        let s = ('0' + (seconds % 60).toFixed(0)).slice(-2)

        return h + ':' + m + ':' + s
    }
}
</script>
