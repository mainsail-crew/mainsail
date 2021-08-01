<template>
    <v-card class="mb-6" v-if="klipperReadyForGui">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-speedometer</v-icon>{{ $t('Machine.LimitsPanel.MachineLimits')}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <v-row>
                <v-col class="col-6">
                    <machine-limits-input
                        :label="$t('Machine.LimitsPanel.Velocity')"
                        :target="current_velocity"
                        :max="max_velocity"
                        :default-value="max_velocity"
                        unit="mm/s"
                        attribute-name="VELOCITY"
                    ></machine-limits-input>
                </v-col>
                <v-col class="col-6">
                    <machine-limits-input
                        :label="$t('Machine.LimitsPanel.SquareCornerVelocity')"
                        :target="current_square_corner_velocity"
                        :max="max_square_corner_velocity"
                        :default-value="max_square_corner_velocity"
                        unit="mm/s"
                        attribute-name="SQUARE_CORNER_VELOCITY"
                    ></machine-limits-input>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="col-6">
                    <machine-limits-input
                        :label="$t('Machine.LimitsPanel.Acceleration')"
                        :target="current_accel"
                        :max="max_accel"
                        :default-value="max_accel"
                        unit="mm/s²"
                        attribute-name="ACCEL"
                    ></machine-limits-input>
                </v-col>
                <v-col class="col-6">
                    <machine-limits-input
                        :label="$t('Machine.LimitsPanel.Deceleration')"
                        :target="current_accel_to_decel"
                        :max="max_accel_to_decel"
                        :default-value="max_accel_to_decel"
                        unit="mm/s²"
                        attribute-name="ACCEL_TO_DECEL"
                    ></machine-limits-input>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>


import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base.ts'
import ToolSlider from '@/components/inputs/ToolSlider'
import MachineLimitsInput from '@/components/inputs/MachineLimitsInput'
@Component({
    components: {MachineLimitsInput, ToolSlider}
})
export default class LimitsPanel extends Mixins(BaseMixin) {
    
    get current_velocity() {
        return this.$store.state.printer?.toolhead?.max_velocity ?? 300
    }
    get current_accel() {
        return this.$store.state.printer?.toolhead?.max_accel ?? 3000
    }
    get current_accel_to_decel() {
        return this.$store.state.printer?.toolhead?.max_accel_to_decel ?? 1500
    }
    get current_square_corner_velocity() {
        return this.$store.state.printer?.toolhead?.square_corner_velocity ?? 8
    }
    
    get max_velocity() {
        return this.$store.state.printer?.configfile?.settings?.printer?.max_velocity ?? 300
    }
    get max_accel() {
        return this.$store.state.printer?.configfile?.settings?.printer?.max_accel ?? 3000
    }
    get max_accel_to_decel() {
        return this.$store.state.printer?.configfile?.settings?.printer?.max_accel_to_decel ?? 1500
    }
    get max_square_corner_velocity() {
        return this.$store.state.printer?.configfile?.settings?.printer?.square_corner_velocity ?? 8
    }
}
</script>
