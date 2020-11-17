<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-exclamation-thick</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Machine Limits</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="mt-2"></v-divider>
        <tool-slider label="Velocity" unit="mm/s" :target="current_velocity" :max="max_velocity" command="SET_VELOCITY_LIMIT" attribute-name="VELOCITY=" ></tool-slider>
        <v-divider></v-divider>
        <tool-slider label="Acceleration" unit="mm/s²" :target="current_accel" :max="max_accel" command="SET_VELOCITY_LIMIT" attribute-name="ACCEL=" ></tool-slider>
        <v-divider></v-divider>
        <tool-slider label="Deceleration" unit="mm/s²" :target="current_accel_to_decel" :max="max_accel_to_decel" command="SET_VELOCITY_LIMIT" attribute-name="ACCEL_TO_DECEL=" ></tool-slider>
        <v-divider></v-divider>
        <tool-slider label="Square corner velocity" unit="mm/s" :target="current_square_corner_velocity" :max="max_square_corner_velocity" command="SET_VELOCITY_LIMIT" attribute-name="SQUARE_CORNER_VELOCITY=" ></tool-slider>
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
                config: state => state.printer.configfile.config,
                max_velocity: state => parseInt(state.printer.configfile.config.printer.max_velocity) || 0,
                max_accel: state => parseInt(state.printer.configfile.config.printer.max_accel) || 0,
                max_accel_to_decel: state => parseInt(state.printer.configfile.config.printer.max_accel_to_decel) || parseInt(state.printer.configfile.config.printer.max_accel) / 2,
                max_square_corner_velocity: state => parseInt(state.printer.configfile.config.printer.square_corner_velocity) || 5,
            }),
        },
        watch: {

        }
    }
</script>
