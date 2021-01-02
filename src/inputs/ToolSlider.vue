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
                    <v-spacer></v-spacer>
                    <span class="font-weight-bold">{{ value }} {{ unit }}</span>
                </v-subheader>
                <v-card-text class="py-0">
                    <v-slider
                        v-model="value"
                        :min="min"
                        :max="max"
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
        computed: {

        },
        methods: {
            sendCmd() {
                let gcode = this.command+' '+this.attributeName+(this.value*this.attributeScale).toFixed(0)
                this.$store.commit('server/addEvent', gcode)
                this.$socket.sendObj('printer.gcode.script', { script: gcode })
            },
            decrement() {
                this.value = this.value > this.min ? (this.value - this.step).toFixed(0) : this.min
                this.sendCmd();
            },
            increment() {
                this.value = this.value < this.max ? (this.value + this.step).toFixed(0) : this.max
                this.sendCmd();
            }
        },
        watch: {
            target: function(newVal) {
                this.value = newVal * this.multi;
            },
        },
        created: function() {
        }
    }
</script>
