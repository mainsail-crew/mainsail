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
        <v-card class="mt-6" v-if="['printing', 'paused'].includes(printer_state)">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon class="mdi mdi-printer-3d" left></v-icon>Print Settings</span>
                </v-toolbar-title>
            </v-toolbar>
            <tool-slider label="Speed factor" :target="speed_factor" :max="200" :multi="100" :step="5" command="M220" attribute-name="S" ></tool-slider>
            <v-divider></v-divider>
            <tool-slider label="Extrusion factor" :target="extrude_factor" :max="200" :multi="100" :step="1" command="M221" attribute-name="S" ></tool-slider>
        </v-card>
        <v-card class="mt-6" v-if="this['printer/getFans'].length">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon :class="'mdi mdi-fan '+(this['printer/getPartFanSpeed'] ? 'icon-rotate' : '')" left></v-icon>Fans</span>
                </v-toolbar-title>
            </v-toolbar>
            <div v-for="(fan, index) of this['printer/getFans']" v-bind:key="index">
                <v-divider v-if="index"></v-divider>
                <fan-slider :name="fan.name" :type="fan.type" :target="fan.speed" :controllable="fan.controllable" :multi="100" ></fan-slider>
            </div>
        </v-card>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import FanSlider from '../../inputs/FanSlider'
    import ToolSlider from '../../inputs/ToolSlider'

    export default {
        components: {
            FanSlider,
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
                'printer/getFans',
                'printer/getPartFanSpeed',
            ]),
        },
    }
</script>
