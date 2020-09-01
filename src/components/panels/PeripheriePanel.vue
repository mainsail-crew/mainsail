<style>
    .icon-rotate {
        animation-name: spin;
        animation-duration: 1000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        } to {
              transform: rotate(-360deg);
          }
    }
</style>

<template>
    <div>
        <v-card v-if="fan">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon :class="fan.speed > 0 ? 'mdi mdi-fan icon-rotate' : 'mdi mdi-fan'" left></v-icon>Tool Fan</span>
                </v-toolbar-title>
            </v-toolbar>

            <v-card-text class="pb-0">
                <tool-slider :target="fan.speed" :multi="100" command="M106" attribute-name="S" :attribute-scale="2.55" ></tool-slider>
            </v-card-text>
        </v-card>
        <v-card class="mt-6" v-if="['printing', 'paused'].includes(printer_state)">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon class="mdi mdi-timer" left></v-icon>Speed Factor</span>
                </v-toolbar-title>
            </v-toolbar>

            <v-card-text class="pb-0">
                <tool-slider :target="speed_factor" :max="200" :multi="100" command="M220" attribute-name="S" ></tool-slider>
            </v-card-text>
        </v-card>
        <v-card class="mt-6" v-if="['printing', 'paused'].includes(printer_state)">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon class="mdi mdi-texture" left></v-icon>Extrusion Factor</span>
                </v-toolbar-title>
            </v-toolbar>

            <v-card-text class="pb-0">
                <tool-slider :target="extrude_factor" :max="200" :multi="100" command="M221" attribute-name="S" ></tool-slider>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import {mapGetters, mapState} from 'vuex'
    import ToolSlider from '../../inputs/ToolSlider'

    export default {
        components: {
            ToolSlider
        },
        data () {
            return {

            }
        },
        computed: {
            ...mapState({
                extrude_factor: state => state.printer.gcode_move.extrude_factor,
                speed_factor: state => state.printer.gcode_move.speed_factor,
                printer_state: state => state.printer.print_stats.state,
            }),
            ...mapGetters([
                'fan',
                'is_printing'
            ])
        },
        methods: {

        },
        mounted () {

        },
        watch: {

        }
    }
</script>