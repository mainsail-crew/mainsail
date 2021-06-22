<template>
    <v-card class="mb-6" v-if="klipperReadyForGui">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-speedometer</v-icon>{{ $t('Machine.LimitsPanel.MachineLimits')}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <tool-slider
            :label="$t('Machine.LimitsPanel.Velocity')"
            unit="mm/s"
            :target="current_velocity"
            :max="max_velocity"
            :default-value="max_velocity"
            :step="50"
            :dynamic-range="true"
            command="SET_VELOCITY_LIMIT"
            attribute-name="VELOCITY="
        ></tool-slider>
        <v-divider></v-divider>
        <tool-slider
            :label="$t('Machine.LimitsPanel.Acceleration')"
            unit="mm/s²"
            :target="current_accel"
            :max="max_accel"
            :default-value="max_accel"
            :step="100"
            :dynamic-range="true"
            command="SET_VELOCITY_LIMIT"
            attribute-name="ACCEL="
        ></tool-slider>
        <v-divider></v-divider>
        <tool-slider
            :label="$t('Machine.LimitsPanel.Deceleration')"
            unit="mm/s²" :target="current_accel_to_decel"
            :max="max_accel_to_decel"
            :default-value="max_accel_to_decel"
            :step="100"
            :dynamic-range="true"
            command="SET_VELOCITY_LIMIT"
            attribute-name="ACCEL_TO_DECEL="
        ></tool-slider>
        <v-divider></v-divider>
        <tool-slider
            :label="$t('Machine.LimitsPanel.SquareCornerVelocity')"
            unit="mm/s"
            :target="current_square_corner_velocity"
            :max="max_square_corner_velocity"
            :default-value="max_square_corner_velocity"
            :step="1"
            :dynamic-range="true"
            command="SET_VELOCITY_LIMIT"
            attribute-name="SQUARE_CORNER_VELOCITY="
        ></tool-slider>
    </v-card>
</template>

<script>


import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base.ts'
import ToolSlider from '@/components/inputs/ToolSlider'
@Component({
    components: {ToolSlider}
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
