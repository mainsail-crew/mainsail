<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-speedometer</v-icon>{{ $t('Settings.LimitsPanel.MachineLimits')}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <tool-slider :label="$t('Settings.LimitsPanel.Velocity')" unit="mm/s" :target="current_velocity" :max="max_velocity" :default-value="max_velocity" command="SET_VELOCITY_LIMIT" attribute-name="VELOCITY=" ></tool-slider>
        <v-divider></v-divider>
        <tool-slider :label="$t('Settings.LimitsPanel.Acceleration')" unit="mm/s²" :target="current_accel" :max="max_accel" :default-value="max_accel" command="SET_VELOCITY_LIMIT" attribute-name="ACCEL=" ></tool-slider>
        <v-divider></v-divider>
        <tool-slider :label="$t('Settings.LimitsPanel.Deceleration')" unit="mm/s²" :target="current_accel_to_decel" :max="max_accel_to_decel" :default-value="max_accel_to_decel" command="SET_VELOCITY_LIMIT" attribute-name="ACCEL_TO_DECEL=" ></tool-slider>
        <v-divider></v-divider>
        <tool-slider :label="$t('Settings.LimitsPanel.SquareCornerVelocity')" unit="mm/s" :target="current_square_corner_velocity" :max="max_square_corner_velocity" :default-value="max_square_corner_velocity" command="SET_VELOCITY_LIMIT" attribute-name="SQUARE_CORNER_VELOCITY=" ></tool-slider>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import ToolSlider from '../../../inputs/ToolSlider'

    export default {
        components: {
            ToolSlider
        },
        data: function() {
            return {
            }
        },
        computed: {
            ...mapState({
                current_velocity: state => state.printer.toolhead.max_velocity,
                current_accel: state => state.printer.toolhead.max_accel,
                current_accel_to_decel: state => state.printer.toolhead.max_accel_to_decel,
                current_square_corner_velocity: state => state.printer.toolhead.square_corner_velocity,
                config: state => state.printer.configfile.settings,
                max_velocity: state => state.printer.configfile.settings.printer.max_velocity || 0,
                max_accel: state => state.printer.configfile.settings.printer.max_accel || 0,
                max_accel_to_decel: state => state.printer.configfile.settings.printer.max_accel_to_decel || 0,
                max_square_corner_velocity: state => state.printer.configfile.settings.printer.square_corner_velocity || 0,
            }),
        },
        watch: {

        }
    }
</script>
