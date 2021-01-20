<style>
    ._fan-slider-subheader {
        height: auto;
    }
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col>
                <v-subheader class="_fan-slider-subheader">
                    <v-icon small :class="'mr-2 '+(value ? 'icon-rotate' : '')" v-if="type !== 'output_pin'">mdi-fan</v-icon>
                    <span>{{ convertName(this.name) }}</span>
                    <v-spacer></v-spacer>
                    <span class="font-weight-bold" v-if="!controllable || (controllable && pwm)">{{ Math.round(value*100) }} %</span>
                    <v-icon v-if="controllable && !pwm" @click="switchOutputPin">{{ value ? "mdi-toggle-switch" : "mdi-toggle-switch-off-outline" }}</v-icon>
                </v-subheader>
                <v-card-text class="py-0" v-if="controllable && pwm">
                    <v-slider
                        v-model="value"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        @change="sendCmd"
                        hide-details>

                        <template v-slot:prepend>
                            <v-icon @click="decrement">mdi-minus</v-icon>
                        </template>

                        <template v-slot:append>
                            <v-icon @click="increment">mdi-plus</v-icon>
                        </template>
                    </v-slider>
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>


<script>
    import {convertName} from "@/plugins/helpers";

    export default {
        data: function() {
            return {
                value: this.target,
            }
        },
        props: {
            target: {
                type: Number,
                required: true,
            },
            name: {
                type: String,
                required: true,
                default: ''
            },
            type: {
                type: String,
                required: false,
                default: ''
            },
            controllable: {
                type: Boolean,
                required: false,
                default: false
            },
            pwm: {
                type: Boolean,
                required: false,
                default: false
            },
            multi: {
                type: Number,
                required: false,
                default: 1
            },
        },
        methods: {
            convertName: convertName,
            sendCmd() {
                let gcode = "";

                if (this.type === "fan") gcode = "M106 S"+(this.value * this.multi).toFixed(0)
                if (this.type === "fan_generic") gcode = "SET_FAN_SPEED FAN="+this.name+" SPEED="+(this.value*this.multi)
                if (this.type === "output_pin") gcode = "SET_PIN PIN="+this.name+" VALUE="+(this.value*this.multi).toFixed(2)

                if (gcode !== "") {
                    this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
                    this.$socket.sendObj('printer.gcode.script', { script: gcode })
                }
            },
            switchOutputPin() {
                this.value = this.value ? 0 : 1
                const gcode = "SET_PIN PIN="+this.name+" VALUE="+(this.value*this.multi).toFixed(2)
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: gcode })
            },
            decrement() {
                this.value = this.value > 0 ? (this.value - 0.01).toFixed(2) : 0;
                this.sendCmd();
            },
            increment() {
                this.value = this.value < 1 ? (this.value + 0.01).toFixed(2) : 100;
                this.sendCmd();
            }
        },
        watch: {
            target: function(newVal) {
                this.value = newVal;
            },
        },
        created: function() {

        },
    }
</script>
