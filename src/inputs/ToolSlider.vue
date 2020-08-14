<style>

</style>

<template>
    <v-row>
        <v-col class="col-auto"><v-icon @click="decrement">mdi-minus</v-icon></v-col>
        <v-col class="col"><v-slider v-model="value" thumb-label="always" :label="label" :min="min" :max="variableMax" @change="sendCmd" hide-details></v-slider></v-col>
        <v-col class="col-auto"><v-icon @click="increment">mdi-plus</v-icon></v-col>
    </v-row>
</template>


<script>
    export default {
        data: function() {
            return {
                value: this.target * this.multi,
                variableMax: this.max,
            }
        },
        props: {
            target: {
                type: Number,
                required: true,
            },
            command: {
                type: String,
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
            extenderSteps: {
                type: Number,
                required: false,
                default: 100
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
                this.$socket.sendObj('post_printer_gcode_script', { script: this.command+' '+this.attributeName+(this.value*this.attributeScale).toFixed(0) });
            },
            decrement() {
                this.value--;
                this.sendCmd();
            },
            increment() {
                this.value++;
                this.sendCmd();
            },
            checkExpand() {
                if (this.value > 0) {
                    if (this.value > this.variableMax) {
                        let tmpMulti = Math.ceil((this.value - this.variableMax) / this.extenderSteps);
                        this.variableMax += tmpMulti * this.extenderSteps;
                    } else if (this.value > (this.variableMax - this.extenderSteps)) {
                        this.variableMax += this.extenderSteps;
                    }
                }
            }
        },
        watch: {
            target: function() {
                this.value = this.target * this.multi;
            },
            value: function() {
                setTimeout(() => {
                    this.checkExpand();
                }, 1000);
            }
        },
        created: function() {
            if (this.value > this.variableMax) {
                let tmpMulti = Math.ceil((this.value - this.variableMax) / this.extenderSteps);
                this.variableMax += tmpMulti * this.extenderSteps;

                if (this.variableMax === this.value) this.variableMax += this.extenderSteps;
            }
        }
    }
</script>