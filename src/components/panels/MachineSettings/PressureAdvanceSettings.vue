<template>
    <v-card-text>
        <v-row>
            <v-col v-if="this.all_extruders.length > 1" class="col-12 col-xl-4">
                <div class="d-flex align-center">
                    <v-btn
                        v-if="this.selectedExtruder !== this.active_extruder"
                        @click="resetToActiveExtruder"
                        class="mr-2"
                        icon
                        plain>
                        <v-icon>mdi-restart</v-icon>
                    </v-btn>
                    <v-select
                        v-model="selectedExtruder"
                        :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.Extruder').toString()"
                        :items="all_extruders"
                        :value="active_extruder"
                        hide-details
                        outlined
                        dense></v-select>
                </div>
            </v-col>
            <v-col :class="this.all_extruders.length > 1 ? 'col-12 col-md-6 col-xl-4' : 'col-12 col-md-6'">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.Advance').toString()"
                    param="advance"
                    @submit="sendCmd"
                    @target-changed="updateValue"
                    :target="current_pressure_advance"
                    :default-value="default_pressure_advance"
                    :extruder="selectedExtruder"
                    :output-error-msg="true"
                    :hasSpinner="true"
                    :min="0"
                    :max="null"
                    :step="0.001"
                    :dec="3"
                    unit="mm/s"></number-input>
            </v-col>
            <v-col :class="this.all_extruders.length > 1 ? 'col-12 col-md-6 col-xl-4' : 'col-12 col-md-6'">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.SmoothTime').toString()"
                    param="smoothTime"
                    @submit="sendCmd"
                    @target-changed="updateValue"
                    :target="current_smooth_time"
                    :default-value="default_smooth_time"
                    :extruder="selectedExtruder"
                    :output-error-msg="true"
                    :hasSpinner="true"
                    :min="0"
                    :max="0.2"
                    :step="0.001"
                    :spinnerFactor="10"
                    :dec="3"
                    unit="s"></number-input>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import NumberInput from '@/components/inputs/NumberInput.vue'
import { Debounce } from 'vue-debounce-decorator'

@Component({
    components: { Panel, NumberInput },
})
export default class PressureAdvanceSettings extends Mixins(BaseMixin) {
    private extruders: string[] = []
    private selectedExtruder = ''

    private declare advance: number
    private declare smoothTime: number

    resetToActiveExtruder(): void {
        this.selectedExtruder = this.$store.state.printer.toolhead?.extruder
    }

    get all_extruders(): string[] {
        Object.keys(this.$store.state.printer).forEach((e) => {
            if (e.startsWith('extruder') && !this.extruders.includes(e)) this.extruders.push(e)
        })
        this.extruders.length === 1 ? this.resetToActiveExtruder() : {}

        return this.extruders
    }

    get active_extruder(): string {
        this.resetToActiveExtruder()
        return this.$store.state.printer.toolhead?.extruder
    }

    get current_pressure_advance(): number {
        this.advance =
            Math.floor((this.$store.state.printer?.[this.selectedExtruder]?.pressure_advance ?? 0) * 1000) / 1000
        return this.advance
    }

    get current_smooth_time(): number {
        this.smoothTime =
            Math.floor((this.$store.state.printer?.[this.selectedExtruder]?.smooth_time ?? 0.04) * 1000) / 1000
        return this.smoothTime
    }

    get default_pressure_advance(): number {
        return (
            Math.floor(
                (this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]?.pressure_advance ?? 0) * 1000
            ) / 1000
        )
    }

    get default_smooth_time(): number {
        return (
            Math.floor(
                (this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]
                    ?.pressure_advance_smooth_time ?? 0.04) * 1000
            ) / 1000
        )
    }

    updateValue(param: string, newVal: number) {
        const params = ['advance', 'smoothTime']
        if (!params.includes(param)) return

        switch (param) {
            case 'advance':
                this.advance = newVal
                break
            case 'smoothTime':
                this.smoothTime = newVal
                break
        }
    }

    @Debounce(500)
    sendCmd(): void {
        let gcode = `SET_PRESSURE_ADVANCE`
        gcode += ` EXTRUDER=${this.selectedExtruder}`
        gcode += ` ADVANCE=${this.advance}`
        gcode += ` SMOOTH_TIME=${this.smoothTime}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
