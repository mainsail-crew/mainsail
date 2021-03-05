<style>
    ._fan-slider-subheader {
        height: auto;
    }
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col :class="pwm ? 'pb-1' : 'pb-3'">
                <v-subheader class="_fan-slider-subheader">
                    <v-icon small :class="'mr-2 '+(value >= off_below && value > 0 ? 'icon-rotate' : '')" v-if="type !== 'output_pin'">mdi-fan</v-icon>
                    <span>{{ convertName(this.name) }}</span>
                    <v-spacer></v-spacer>
                    <small v-if="rpm || rpm === 0" :class="'mr-3 ' + (rpm === 0 && value > 0 ? 'red--text' : '')">{{ Math.round(rpm) }} RPM</small>
                    <span class="font-weight-bold" v-if="!controllable || (controllable && pwm)">{{ Math.round(parseFloat(value)*100) }} %</span>
                    <v-icon v-if="controllable && !pwm" @click="switchOutputPin">{{ value ? "mdi-toggle-switch" : "mdi-toggle-switch-off-outline" }}</v-icon>
                </v-subheader>
                <v-card-text class="py-0" v-if="controllable && pwm">
                    <v-slider
                        v-model="value"
                        :min="0.0"
                        :max="1.0"
                        :step="0.01"
                        :color="value < off_below && value > 0 ? 'red' : undefined"
                        @start="sliding = true"
                        @end="sendCmd()"
                        hide-details
                    >
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
        props: {
            target: {
                type: Number,
                required: true,
            },
            max: {
                type: Number,
                required: false,
                default: 1,
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
            rpm: {
                type: [Number, Boolean],
                required: false,
                default: false
            },
            multi: {
                type: Number,
                required: false,
                default: 1
            },
            off_below: {
                type: Number,
                required: false,
                default: 0
            }
        },
        data() {
            return {
                min: 0,
                value: this.target,
                sliding: false,
            }
        },
        methods: {
            convertName: convertName,
            sendCmd() {
                if (this.sliding) {
                    let gcode = "";

                    if (this.value < this.min) {
                        this.value = 0;
                    }

                    if (this.target === this.value) {
                        return;
                    }

                    const l_value = this.value * this.multi;

                    if (this.type === "fan") gcode = "M106 S" + (l_value).toFixed(0)
                    if (this.type === "fan_generic") {
                        gcode = "SET_FAN_SPEED FAN=" + this.name + " SPEED=" + (l_value)
                    }
                    if (this.type === "output_pin") gcode = "SET_PIN PIN=" + this.name + " VALUE=" + (l_value).toFixed(2)

                    if (gcode !== "") {
                        this.$store.commit('server/addEvent', {message: gcode, type: 'command'})
                        this.$socket.sendObj('printer.gcode.script', {script: gcode})
                    }

                    this.sliding = false;
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
                this.value = this.value < 1.0 ? (this.value + 0.01).toFixed(2) : 1.0;
                if (this.value < this.min) {
                    this.value = this.min;
                }
                this.sendCmd();
            }
        },
        watch: {
            target(newVal) {
                this.value = newVal / this.max;
            }
        }
    }
</script>
