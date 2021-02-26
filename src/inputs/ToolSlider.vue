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
                        <v-progress-circular
                            v-if="sliding && (value === processedMin || value === processedMax)"
                            class="mr-2"
                            indeterminate
                            color="info"
                            :size="20"
                            :width="2"
                        ></v-progress-circular>
                        {{ value }} {{ unit }}
                    </span>
                </v-subheader>
                <v-card-text class="py-0">
                    <v-slider
                        v-model="value"
                        :min="processedMin"
                        :max="processedMax"
                        @start="sliding = true"
                        @end="sendCmd"
                        @input="processNewRange"
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
            },
        },
        data() {
            return {
                value: this.target * this.multi,
                startValue: this.target * this.multi,
                sliding: false,
                processedMin: this.min,
                processedMax: this.max,
                dynamicStep: Math.floor((this.max - this.min) / 2),
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
            target: function(newVal) {
                this.value = newVal * this.multi;
            },
        },
        methods: {
            processNewRange() {
                if (!this.dynamicRange || !this.sliding) {
                    return;
                }
                if (this.processingTimer) {
                    clearInterval(this.processingTimer);
                    this.processingTimer = null;
                }
                if (this.value === this.processedMax || this.value === this.processedMin) {
                    this.processingTimer = setInterval(() => {
                        let was = '';
                        if (this.value === this.processedMax) {
                            was = 'max';
                        } else if(this.value === this.processedMin) {
                            was = 'min';
                        }
                        this.processedMin = Math.max(0, this.value - this.dynamicStep);
                        this.processedMax = Math.min(1000, this.value + this.dynamicStep);
                        this.value = was === 'max' ? this.processedMax : this.processedMin;
                    }, 500);
                }
            },
            sendCmd() {
                if (this.sliding) {
                    let gcode = this.command + ' ' + this.attributeName + (Math.max(1, this.value) * this.attributeScale).toFixed(0)
                    this.$store.commit('server/addEvent', {message: gcode, type: 'command'})
                    this.$socket.sendObj('printer.gcode.script', {script: gcode})
                    this.sliding = false;
                    if (this.processingTimer) {
                        clearInterval(this.processingTimer);
                        this.processingTimer = null;
                    }
                }
            },
            decrement() {
                this.value = this.value > this.min ? (this.value - this.step).toFixed(0) : this.min
                this.sendCmd();
            },
            increment() {
                this.value = this.value < this.max ? (this.value + this.step).toFixed(0) : this.max
                this.sendCmd();
            }
        }
    }
</script>
