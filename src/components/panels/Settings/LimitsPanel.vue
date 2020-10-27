<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-exclamation-thick</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Machine Limits</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-row class="px-6" >
                <v-col sm-12>
                    <toolSlider label="VELOCITY" v-bind:target="current_velocity" v-bind:max="max_velocity" command="SET_VELOCITY_LIMIT" attribute-name="VELOCITY=" ></toolSlider>
                    <toolSlider label="ACCEL" v-bind:target="current_accel" v-bind:max="max_accel" command="SET_VELOCITY_LIMIT" attribute-name="ACCEL=" ></toolSlider>
                    <toolSlider label="DECEL" v-bind:target="current_accel_to_decel" v-bind:max="max_accel_to_decel" command="SET_VELOCITY_LIMIT" attribute-name="ACCEL_TO_DECEL=" ></toolSlider>
                    <toolSlider label="SCV" v-bind:target="current_square_corner_velocity" v-bind:max="max_square_corner_velocity" command="SET_VELOCITY_LIMIT" attribute-name="SQUARE_CORNER_VELOCITY=" ></toolSlider>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import toolSlider from '../../../inputs/ToolSlider'

    export default {
        components: {
            toolSlider
        },
        data: function() {
            return {
                max_velocity: 200,
                max_accel: 5000,
                max_accel_to_decel: 2500,
                max_square_corner_velocity: 10,
            }
        },
        computed: {
            ...mapState({
                current_velocity: state => state.printer.toolhead.max_velocity,
                current_accel: state => state.printer.toolhead.max_accel,
                current_accel_to_decel: state => state.printer.toolhead.max_accel_to_decel,
                current_square_corner_velocity: state => state.printer.toolhead.square_corner_velocity,
                config: state => state.printer.configfile.config,
            })
        },
        methods: {

        },
        watch: {
            config: function(value) {
                if (value.printer) {
                    this.max_velocity = parseInt(value.printer.max_velocity);
                    this.max_accel = parseInt(value.printer.max_accel);
                    this.max_accel_to_decel = parseInt(value.printer.max_accel_to_decel) || this.max_accel / 2;
                    this.max_square_corner_velocity = parseInt(value.printer.square_corner_velocity);
                }
            }
        }
    }
</script>
