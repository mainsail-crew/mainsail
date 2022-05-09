<template>
    <v-container>
        <v-row>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Velocity').toString()"
                    param="VELOCITY"
                    :target="velocity"
                    :default-value="defaultVelocity"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"
                    @submit="sendCmd"></number-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.SquareCornerVelocity').toString()"
                    param="SQUARE_CORNER_VELOCITY"
                    :target="squareCornerVelocity"
                    :default-value="defaultSquareCornerVelocity"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :step="0.1"
                    :min="0.1"
                    :max="null"
                    :dec="1"
                    unit="mm/s"
                    @submit="sendCmd"></number-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Acceleration').toString()"
                    param="ACCEL"
                    :target="accel"
                    :default-value="defaultAccel"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="100"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s²"
                    @submit="sendCmd"></number-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.MaxAccelToDecel').toString()"
                    param="ACCEL_TO_DECEL"
                    :target="accelToDecel"
                    :default-value="defaultAccelToDecel"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="100"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s²"
                    @submit="sendCmd"></number-input>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import NumberInput from '@/components/inputs/NumberInput.vue'

@Component({
    components: { Panel, NumberInput },
})
export default class MotionSettings extends Mixins(BaseMixin) {
    get velocity(): number {
        return Math.trunc(this.$store.state.printer?.toolhead?.max_velocity ?? 300)
    }

    get accel(): number {
        return Math.trunc(this.$store.state.printer?.toolhead?.max_accel ?? 3000)
    }

    get accelToDecel(): number {
        return Math.trunc(this.$store.state.printer?.toolhead?.max_accel_to_decel ?? this.accel / 2)
    }

    get squareCornerVelocity(): number {
        return Math.floor((this.$store.state.printer?.toolhead?.square_corner_velocity ?? 8) * 10) / 10
    }

    get defaultVelocity(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_velocity ?? 300)
    }

    get defaultAccel(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_accel ?? 3000)
    }

    get defaultAccelToDecel(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_accel_to_decel ?? 1500)
    }

    get defaultSquareCornerVelocity(): number {
        return (
            Math.floor((this.$store.state.printer?.configfile?.settings?.printer?.square_corner_velocity ?? 8) * 10) /
            10
        )
    }

    @Debounce(500)
    sendCmd(params: { name: string; value: number }): void {
        const gcode = `SET_VELOCITY_LIMIT ${params.name}=${params.value}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
