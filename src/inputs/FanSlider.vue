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
                    <span>{{ convertName }}</span>
                    <v-spacer></v-spacer>
                    <span class="font-weight-bold">{{ Math.round(value) }} %</span>
                </v-subheader>
                <v-card-text class="py-0" v-if="controllable">
                    <v-slider
                        v-model="value"
                        :min="0"
                        :max="100"
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
    export default {
        data: function() {
            return {
                value: this.target * this.multi,
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
            multi: {
                type: Number,
                required: false,
                default: 1
            },
        },
        computed: {
            convertName() {
                let tmp = this.name;
                tmp = tmp.replaceAll("_", " ");
                tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1);

                return tmp;
            }
        },
        methods: {
            sendCmd() {
                let gcode = "";

                if (this.type === "fan") gcode = "M106 S"+(this.value * 2.55).toFixed(0);
                if (this.type === "fan_generic") gcode = "SET_FAN_SPEED FAN="+this.name+" SPEED="+(this.value/100);

                if (gcode !== "") {
                    this.$store.commit('server/addEvent', gcode);
                    this.$socket.sendObj('printer.gcode.script', { script: gcode });
                }
            },
            decrement() {
                this.value = this.value > 0 ? (this.value - 1).toFixed(0) : 0;
                this.sendCmd();
            },
            increment() {
                this.value = this.value < 100 ? (this.value + 1).toFixed(0) : 100;
                this.sendCmd();
            }
        },
        watch: {
            target: function(newVal) {
                this.value = newVal * this.multi;
            },
        },
        created: function() {

        },
    }
</script>
