<style>
    ._tool-slider-subheader {
        height: auto;
    }
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-1 pt-3">
                <v-subheader class="_tool-slider-subheader">
                    <span>{{ label }}</span>
                    <v-btn
                        v-if="value !== defaultValue"
                        class="ml-2"
                        x-small
                        icon
                        @click="processedMin = min; processedMax = max; value = defaultValue; sliding = true; sendCmd()"
                    >
                        <v-icon>mdi-restart</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <span class="font-weight-bold">
                        {{ value }} {{ unit }}
                    </span>
                </v-subheader>
                <v-card-text class="py-0">
                    <v-slider
                        v-model="value"
                        :min="min"
                        :max="processedMax"
                        @start="sliding = true"
                        @end="sendCmd()"
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
        props: {
            target: {
                type: Number,
                required: true,
            },
            command: {
                required: true,
            },
            attributeName: {
                type: String,
                required: false,
                default: ''
            },
            label: {
                type: String,
                required: false,
                default: ''
            },
            unit: {
                type: String,
                required: false,
                default: '%'
            },
            attributeScale: {
                type: Number,
                required: false,
                default: 1
            },
            min: {
                type: Number,
                required: false,
                default: 0
            },
            max: {
                type: Number,
                required: false,
                default: 100
            },
            dynamicRange: {
                type: Boolean,
                required: false,
                default: false
            },
            dynamicDebounceTime: {
                type: Number,
                required: false,
                default: 250
            },
            dynamicClamp: {
                type: Array,
                required: false,
                default: () => ([0, 1000])
            },
            defaultValue: {
                type: Number,
                required: false,
                default: 100
            },
            step: {
                type: Number,
                required: false,
                default: 1
            },
            multi: {
                type: Number,
                required: false,
                default: 1
            }
        },
        data() {
            return {
                value: this.target * this.multi,
                startValue: this.target * this.multi,
                sliding: false,
                processedMin: this.min,
                processedMax: this.max,
                dynamicStep: Math.floor((this.max - this.min) / 2),
                dynamicValue: 30,
                editing: false,
                processingTimer: null
            }
        },
        created() {
            if (this.value > this.max || this.value < this.min) {
                this.processedMax = Math.ceil(this.value / this.defaultValue) * this.defaultValue;
                this.processedMin = Math.floor(this.value / this.defaultValue) * this.defaultValue - this.defaultValue;
            }
        },
        computed: {

        },
        watch: {
            target: {
                immediate: true,
                handler(newVal) {
                    this.value = Math.round(newVal * this.multi);
                    if (!this.dynamicRange) {
                        return;
                    }
                    if (this.processingTimer) {
                        clearTimeout(this.processingTimer);
                        this.processingTimer = null;
                    }
                    if (this.value >= this.processedMax) {
                        this.processingTimer = setTimeout(() => {
                            const [min, max] = this.dynamicClamp;
                            this.processedMin = Math.max(min, this.value - this.dynamicStep);
                            this.processedMax = Math.min(max, this.value + this.dynamicStep);
                        }, this.dynamicDebounceTime);
                    }
                }
            },
        },
        methods: {
            sendCmd(btnPress = false) {
                if (this.sliding || btnPress) {
                    let gcode = this.command + ' ' + this.attributeName + (Math.max(1, this.value) * this.attributeScale).toFixed(0)
                    this.$store.commit('server/addEvent', {message: gcode, type: 'command'})
                    this.$socket.sendObj('printer.gcode.script', {script: gcode})
                    this.sliding = false;
                }
            },
            decrement() {
                this.value = this.value > this.min ? Math.round(this.value - this.step) : this.min
                this.sendCmd(true);
            },
            increment() {
                this.value = this.value < this.processedMax ? Math.round(this.value + this.step) : this.processedMax
                this.sendCmd(true);
            }
        }
    }
</script>
