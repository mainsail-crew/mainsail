<style scoped>
    ._tool-slider-subheader {
        height: auto;
    }
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-1 pt-3">
                <v-subheader class="_tool-slider-subheader">
                    <v-btn plain small icon @click="isLocked = !isLocked">
                        <v-icon small :color="(isLocked ? 'red' : '')">
                            {{ isLocked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline' }}
                        </v-icon>
                    </v-btn>
                    <span>{{ label }}</span>
                    <v-btn
                        v-if="value !== defaultValue"
                        class="ml-2"
                        x-small
                        icon
                        :disabled="isLocked"
                        @click="resetSlider"
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
                        :disabled="isLocked"
                        :min="min"
                        :max="processedMax"
                        :color="colorBar"
                        @change="changeSlider"
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


<script lang="ts">
import {Component, Mixins, Prop, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {Debounce} from 'vue-debounce-decorator'

@Component
export default class ToolSlider extends Mixins(BaseMixin) {
    value = 0
    startValue = 0
    processedMax = 100
    dynamicStep = 50

    @Prop({ required: true }) readonly sliderName!: string
    @Prop({ type: Number, required: true }) readonly target!: number
    @Prop({ type: String, required: true }) readonly command!: string
    @Prop({ type: String, default: '' }) readonly attributeName!: string
    @Prop({ type: String, default: '' }) readonly label!: string
    @Prop({ type: String, default: '%' }) readonly unit!: string
    @Prop({ type: Number, default: 1 }) readonly attributeScale!: number
    @Prop({ type: Number, default: 0 }) readonly min!: number
    @Prop({ type: Number, default: 100 }) readonly max!: number
    @Prop({ type: Boolean, default: false }) readonly dynamicRange!: boolean
    @Prop({ type: Number, default: 100 }) readonly defaultValue!: number
    @Prop({ type: Number, default: 100 }) readonly step!: number
    @Prop({ type: Number, default: 1 }) readonly multi!: number

    created() {
        this.value = this.target * this.multi
        this.startValue = this.target * this.multi
        this.dynamicStep = Math.floor((this.max - this.min) / 2)

        if (this.value >= this.processedMax) {
            this.processedMax = (Math.ceil(this.value / this.dynamicStep) + 1) * this.dynamicStep
        }
    }

    get isLocked() {
        return this.$store.getters['gui/getLockedSliders'](this.sliderName)
    }

    set isLocked(newVal) {
        this.$store.dispatch('gui/saveSliderLockState', { name: this.sliderName, value: newVal })
    }

    get colorBar() {
        return this.max < this.value ? 'warning' : 'primary'
    }

    @Debounce(250)
    changeSlider() {
        this.sendCmd()

        if (!this.dynamicRange) return
        if (this.value >= this.processedMax) {
            this.processedMax = this.value + this.dynamicStep
        }
    }

    @Watch('target', { immediate: true })
    targetChanged(newVal: number) {
        this.value = Math.round(newVal * this.multi)

        if (!this.dynamicRange) return
        if (this.value >= this.processedMax) {
            this.processedMax = this.value + this.dynamicStep
        }
    }

    @Watch('max', { immediate: true })
    maxChanged(newVal: number) {
        this.processedMax = newVal > this.value ? newVal : Math.ceil(this.value / this.dynamicStep) * this.dynamicStep
    }

    resetSlider() {
        this.value = this.defaultValue
        this.processedMax = this.max
        if (this.value >= this.processedMax) {
            this.processedMax = (Math.ceil(this.value / this.dynamicStep) + 1) * this.dynamicStep
        }

        this.sendCmd()
    }

    sendCmd() {
        const gcode = this.command + ' ' + this.attributeName + (Math.max(1, this.value) * this.attributeScale).toFixed(0)
        this.$store.dispatch('server/addEvent', {message: gcode, type: 'command'})
        this.$socket.emit('printer.gcode.script', {script: gcode})
    }

    decrement() {
        this.value = this.value > this.min ? Math.round(this.value - this.step) : this.min
        this.sendCmd()
    }

    increment() {
        this.value = this.value < this.processedMax || this.dynamicRange ? Math.round(this.value + this.step) : this.processedMax
        this.sendCmd()
    }
}
</script>
