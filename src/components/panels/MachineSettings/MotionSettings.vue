<template>
    <v-card-text>
        <v-row>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Velocity').toString()"
                    param="velocity"
                    @submit="sendCmd"
                    @target-changed="updateValue"
                    :target="current_velocity"
                    :default-value="max_velocity"
                    :output-error-msg="true"
                    :hasSpinner="true"
                    :spinnerFactor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"></number-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.SquareCornerVelocity').toString()"
                    param="squareCornerVelocity"
                    @submit="sendCmd"
                    @target-changed="updateValue"
                    :target="current_square_corner_velocity"
                    :default-value="max_square_corner_velocity"
                    :output-error-msg="true"
                    :hasSpinner="true"
                    :step="0.1"
                    :min="0.1"
                    :max="null"
                    :dec="1"
                    unit="mm/s"></number-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Acceleration').toString()"
                    param="acceleration"
                    @submit="sendCmd"
                    @target-changed="updateValue"
                    :target="current_accel"
                    :default-value="max_accel"
                    :output-error-msg="true"
                    :hasSpinner="true"
                    :spinnerFactor="100"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s²"></number-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.MaxAccelToDecel').toString()"
                    param="accelToDecel"
                    @submit="sendCmd"
                    @target-changed="updateValue"
                    :target="current_accel_to_decel"
                    :default-value="max_accel_to_decel"
                    :output-error-msg="true"
                    :hasSpinner="true"
                    :spinnerFactor="100"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s²"></number-input>
            </v-col>
        </v-row>
    </v-card-text>
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
    private declare velocity: number
    private declare acceleration: number
    private declare accelToDecel: number
    private declare squareCornerVelocity: number

    get current_velocity(): number {
        this.velocity = Math.trunc(this.$store.state.printer?.toolhead?.max_velocity ?? 300)
        return this.velocity
    }

    get current_accel(): number {
        this.acceleration = Math.trunc(this.$store.state.printer?.toolhead?.max_accel ?? 3000)
        return this.acceleration
    }

    get current_accel_to_decel(): number {
        this.accelToDecel = Math.trunc(this.$store.state.printer?.toolhead?.max_accel_to_decel ?? 1500)
        return this.accelToDecel
    }

    get current_square_corner_velocity(): number {
        this.squareCornerVelocity =
            Math.floor((this.$store.state.printer?.toolhead?.square_corner_velocity ?? 8) * 10) / 10
        return this.squareCornerVelocity
    }

    get max_velocity(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_velocity ?? 300)
    }

    get max_accel(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_accel ?? 3000)
    }

    get max_accel_to_decel(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_accel_to_decel ?? 1500)
    }

    get max_square_corner_velocity(): number {
        return (
            Math.floor((this.$store.state.printer?.configfile?.settings?.printer?.square_corner_velocity ?? 8) * 10) /
            10
        )
    }

    updateValue(param: string, newVal: number) {
        const params = ['velocity', 'acceleration', 'accelToDecel', 'squareCornerVelocity']
        if (!params.includes(param)) return

        switch (param) {
            case 'velocity':
                this.velocity = newVal
                break
            case 'acceleration':
                this.acceleration = newVal
                break
            case 'accelToDecel':
                this.accelToDecel = newVal
                break
            case 'squareCornerVelocity':
                this.squareCornerVelocity = newVal
                break
        }
    }

    @Debounce(500)
    sendCmd(): void {
        let gcode = `SET_VELOCITY_LIMIT`
        gcode += ` VELOCITY=${this.velocity}`
        gcode += ` ACCEL=${this.acceleration}`
        gcode += ` ACCEL_TO_DECEL=${this.accelToDecel}`
        gcode += ` SQUARE_CORNER_VELOCITY=${this.squareCornerVelocity}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
