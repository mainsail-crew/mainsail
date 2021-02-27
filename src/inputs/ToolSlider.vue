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
<!--                        <template v-if="dynamicRange">
                            <v-progress-circular
                                v-if="sliding && (value === processedMin || value === processedMax)"
                                class="mr-2"
                                indeterminate
                                color="info"
                                :size="20"
                                :width="2"
                            ></v-progress-circular>
                        </template>-->
                        <template v-if="editable">
                            <v-btn @click="editing = true" icon x-small>
                                <v-icon x-small>mdi-pencil</v-icon>
                            </v-btn>
                            <v-dialog v-model="editing" :max-width="200">
                                <v-card>
                                    <v-card-title>{{ label }}</v-card-title>
                                    <v-card-text>
                                        <div class="d-flex justify-center text-center">
                                            <v-text-field
                                                ref="editInput"
                                                :value="value"
                                                type="number"
                                                class="flex-shrink-1"
                                                style="width: 80px;"
                                                autofocus
                                                @keypress.enter="editSpeed()"
                                            >
                                                <span
                                                    slot="append"
                                                >{{ unit }}</span>
                                            </v-text-field>
                                        </div>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn color="red darken-1" text @click="editing = false">Cancel</v-btn>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text @click="editSpeed()">Ok</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                        {{ value }} {{ unit }}
                    </span>
                </v-subheader>
                <v-card-text class="py-0">
                    <v-slider
                        v-if="!newDynamic"
                        v-model="value"
                        :min="processedMin"
                        :max="processedMax"
                        @start="sliding = true"
                        @end="sendCmd"
                        hide-details>

                        <template v-slot:prepend>
                            <v-icon @click="decrement">mdi-minus</v-icon>
                        </template>

                        <template v-slot:append>
                            <v-icon @click="increment">mdi-plus</v-icon>
                        </template>
                    </v-slider>
                    <v-slider
                        v-else
                        v-model="dynamicValue"
                        :min="0"
                        :max="60"
                        :step="10"
                        color="none"
                        thumb-color="blue"
                        :thumb-size="20"
                        track-fill-color="blue"
                        track-color="blue"
                        @start="sliding = true"
                        @input="changeDynamicRange"
                        @end="dynamicValue = 30; clearInterval(dynamicTimer); dynamicTimer = null; sendCmd(); sliding = false;"
                    >
                        <template #thumb-label="{ value }">
                            <template v-if="value > 30">
                                <span class="d-flex">
                                    <v-icon
                                        v-for="key in Array(Math.abs(value - 30) / 10).keys()" :key="'arrow-' + key"
                                        style="height: 8px; width: 4px;"
                                        small
                                    >mdi-menu-right</v-icon>
                                </span>
                            </template>
                            <template v-if="value < 30">
                                <span class="d-flex">
                                    <v-icon
                                        v-for="key in Array(Math.abs(value - 30) / 10).keys()" :key="'arrow-' + key"
                                        style="height: 8px; width: 4px;"
                                        small
                                    >mdi-menu-left</v-icon>
                                </span>
                            </template>
                            <template v-if="value === 30">
                                <v-icon
                                    style="transform: rotateZ(90deg)"
                                    small
                                >
                                    mdi-menu-swap
                                </v-icon>
                            </template>
                        </template>
                        <template v-slot:prepend>
                            <v-icon @click="decrement" class="mr-5">mdi-minus</v-icon>
                        </template>

                        <template v-slot:append>
                            <v-icon @click="increment" class="ml-5">mdi-plus</v-icon>
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
            newDynamic: {
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
            editable: {
                type: Boolean,
                required: false,
                default: false
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
                dynamicTimer: null,
                dynamicValue: 30,
                editing: false,
                processingTimer: null,
                clearInterval: (timer) => clearInterval(timer)
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
                    if (this.value === this.processedMax || this.value === this.processedMin) {
                        this.processingTimer = setTimeout(() => {
                            this.processedMin = Math.max(0, this.value - this.dynamicStep);
                            this.processedMax = Math.min(1000, this.value + this.dynamicStep);
                        }, 1000);
                    }
                }
            },
        },
        methods: {
            editSpeed() {
                if (this.$refs.editInput) {
                    try {
                        const newValue = parseInt(this.$refs.editInput.internalValue);
                        if (!isNaN(newValue)) {
                            this.value = this.clamp(newValue, Math.max(1, this.min), this.max);
                            this.sendCmd(true);
                        }
                    } catch(e) {
                        console.error(e);
                    }
                }
                this.editing = false;
            },
            changeDynamicRange() {
                if (this.dynamicTimer) {
                    clearInterval(this.dynamicTimer);
                    this.dynamicTimer = null;
                }
                const normalised = this.dynamicValue - 30;
                const step = Math.abs(normalised) / 10;
                this.dynamicTimer = setInterval(() => {
                    let addVal = 0;
                    if (normalised < 0) {
                        addVal = -1;
                    } else if(normalised > 0) {
                        addVal = 1;
                    }
                    this.value = this.clamp(this.value + addVal, this.min, this.max);
                }, 500 * (1 / Math.pow(5, step)));
            },
            processNewRange() {
                if (!this.dynamicRange || !this.sliding) {
                    return;
                }
                if (this.processingTimer) {
                    clearTimeout(this.processingTimer);
                    this.processingTimer = null;
                }
                if (this.value === this.processedMax || this.value === this.processedMin) {
                    this.processingTimer = setTimeout(() => {
                        this.processedMin = Math.max(0, this.value - this.dynamicStep);
                        this.processedMax = Math.min(1000, this.value + this.dynamicStep);
                    }, 1000);
                }
                /*if (this.value === this.processedMax || this.value === this.processedMin) {
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
                }*/
            },
            sendCmd(btnPress = false) {
                if (this.sliding || btnPress) {
                    let gcode = this.command + ' ' + this.attributeName + (Math.max(1, this.value) * this.attributeScale).toFixed(0)
                    this.$store.commit('server/addEvent', {message: gcode, type: 'command'})
                    this.$socket.sendObj('printer.gcode.script', {script: gcode})
                    this.sliding = false;
                }
            },
            clamp(value, min, max) {
                return Math.max(min, Math.min(max, value ?? 0));
            },
            decrement() {
                this.value = this.value > this.min ? Math.round(this.value - this.step) : this.min
                this.sendCmd(true);
            },
            increment() {
                this.value = this.value < this.max ? Math.round(this.value + this.step) : this.max
                this.sendCmd(true);
            }
        }
    }
</script>
