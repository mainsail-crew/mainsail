<template>
    <v-row>
        <v-col :class="{ 'col-6': !isSmall, 'col-12': isSmall }">
            <number-input
                :label="$t('Panels.ExtruderControlPanel.PressureAdvanceSettings.Advance')"
                param="ADVANCE"
                :target="pressureAdvance"
                :default-value="defaultPressureAdvance"
                :extruder="extruder"
                :output-error-msg="true"
                :has-spinner="true"
                :min="0"
                :max="null"
                :step="0.001"
                :dec="3"
                unit="s"
                @submit="sendCmd" />
        </v-col>
        <v-col :class="{ 'col-6': !isSmall, 'col-12': isSmall }">
            <number-input
                :label="$t('Panels.ExtruderControlPanel.PressureAdvanceSettings.SmoothTime')"
                param="SMOOTH_TIME"
                :target="smoothTime"
                :default-value="defaultSmoothTime"
                :extruder="extruder"
                :output-error-msg="true"
                :has-spinner="true"
                :spinner-factor="10"
                :min="0"
                :max="0.2"
                :step="0.001"
                :dec="3"
                unit="s"
                @submit="sendCmd" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import NumberInput from '@/components/inputs/NumberInput.vue'
import Responsive from '@/components/ui/Responsive.vue'

const PRECISION = 1000
const DEFAULT_SMOOTH_TIME = 0.04

@Component({
    components: { NumberInput, Responsive },
})
export default class PressureAdvanceSettings extends Mixins(BaseMixin) {
    @Prop({ default: false }) readonly isSmall!: boolean
    @Prop({ required: true }) readonly extruder!: string

    get extruderObject() {
        return this.$store.state.printer?.[this.extruder] ?? undefined
    }

    get extruderSettings() {
        const settings = this.$store.state.printer.configfile?.settings ?? {}

        return settings[this.extruder] ?? undefined
    }

    get pressureAdvance(): number {
        return this.roundToThreeDecimals(this.extruderObject?.pressure_advance ?? 0)
    }

    get smoothTime() {
        return this.roundToThreeDecimals(this.extruderObject?.smooth_time ?? DEFAULT_SMOOTH_TIME)
    }

    get defaultPressureAdvance() {
        return this.roundToThreeDecimals(this.extruderSettings?.pressure_advance ?? 0)
    }

    get defaultSmoothTime() {
        return this.roundToThreeDecimals(
            this.extruderSettings?.pressure_advance_smooth_time ??
                this.extruderSettings?.smooth_time ??
                DEFAULT_SMOOTH_TIME
        )
    }

    private roundToThreeDecimals(value: number): number {
        return Math.floor(value * PRECISION) / PRECISION
    }

    @Debounce(500)
    sendCmd(params: { name: string; value: number }) {
        const extruder = this.extruder.startsWith('extruder_stepper ')
            ? this.extruder.substring('extruder_stepper '.length)
            : this.extruder

        const gcode = `SET_PRESSURE_ADVANCE EXTRUDER=${extruder} ${params.name}=${params.value}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
