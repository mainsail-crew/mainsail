<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiEngine"
        :title="$t('Panels.MachineSettingsPanel.Headline')"
        :collapsible="true"
        card-class="machine-settings-panel">
        <responsive
            :breakpoints="{
                small: (el) => el.width < 375,
                medium: (el) => el.width >= 375,
            }">
            <template #default="{ el }">
                <v-card-text class="pt-5">
                    <v-row>
                        <v-col :class="{ 'col-12': el.is.small, 'col-6': el.is.medium }">
                            <number-input
                                :label="$t('Panels.MachineSettingsPanel.MotionSettings.Velocity')"
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
                                @submit="sendCmd" />
                        </v-col>
                        <v-col :class="{ 'col-12': el.is.small, 'col-6': el.is.medium }">
                            <number-input
                                :label="$t('Panels.MachineSettingsPanel.MotionSettings.SquareCornerVelocity')"
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
                                @submit="sendCmd" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col :class="{ 'col-12': el.is.small, 'col-6': el.is.medium }">
                            <number-input
                                :label="$t('Panels.MachineSettingsPanel.MotionSettings.Acceleration')"
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
                                @submit="sendCmd" />
                        </v-col>
                        <v-col :class="{ 'col-12': el.is.small, 'col-6': el.is.medium }">
                            <number-input
                                v-if="minimumCruiseRatio === null"
                                :label="$t('Panels.MachineSettingsPanel.MotionSettings.MaxAccelToDecel')"
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
                                @submit="sendCmd" />
                            <number-input
                                v-else
                                :label="$t('Panels.MachineSettingsPanel.MotionSettings.MinimumCruiseRatio')"
                                param="MINIMUM_CRUISE_RATIO"
                                :target="minimumCruiseRatio"
                                :default-value="defaultMinimumCruiseRatio"
                                :output-error-msg="true"
                                :has-spinner="true"
                                :spinner-factor="5"
                                :step="1"
                                :min="0"
                                :max="99"
                                :dec="0"
                                unit="%"
                                @submit="sendCruiseRatioCmd" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </template>
        </responsive>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiEngine } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'
import NumberInput from '@/components/inputs/NumberInput.vue'
import Responsive from '@/components/ui/Responsive.vue'

@Component({
    components: {
        NumberInput,
        Panel,
        Responsive,
    },
})
export default class MachineSettingsPanel extends Mixins(BaseMixin) {
    mdiEngine = mdiEngine

    get toolhead() {
        return this.$store.state.printer?.toolhead ?? {}
    }

    get configPrinter() {
        return this.$store.state.printer?.configfile?.settings?.printer ?? {}
    }

    get velocity(): number {
        return Math.trunc(this.toolhead.max_velocity ?? 300)
    }

    get accel(): number {
        return Math.trunc(this.toolhead.max_accel ?? 3000)
    }

    get accelToDecel(): number {
        return Math.trunc(this.toolhead.max_accel_to_decel ?? this.accel / 2)
    }

    get minimumCruiseRatio(): number | null {
        const value = this.toolhead.minimum_cruise_ratio ?? null

        if (value === null) return null

        return Math.round(value * 100)
    }

    get squareCornerVelocity(): number {
        return Math.floor((this.toolhead.square_corner_velocity ?? 8) * 10) / 10
    }

    get defaultVelocity(): number {
        return Math.trunc(this.configPrinter.max_velocity ?? 300)
    }

    get defaultAccel(): number {
        return Math.trunc(this.configPrinter.max_accel ?? 3000)
    }

    get defaultAccelToDecel(): number {
        return Math.trunc(this.configPrinter.max_accel_to_decel ?? 1500)
    }

    get defaultMinimumCruiseRatio(): number {
        const value = this.configPrinter.minimum_cruise_ratio ?? 0.5

        return Math.round(value * 100)
    }

    get defaultSquareCornerVelocity(): number {
        const value = this.configPrinter.square_corner_velocity ?? 8

        return Math.floor(value * 10) / 10
    }

    sendCruiseRatioCmd(params: { name: string; value: number }): void {
        params.value = params.value / 100

        this.sendCmd(params)
    }

    @Debounce(500)
    sendCmd(params: { name: string; value: number }): void {
        const gcode = `SET_VELOCITY_LIMIT ${params.name}=${params.value}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
