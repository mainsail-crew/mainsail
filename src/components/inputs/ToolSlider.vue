<style scoped>
    ._tool-slider-subheader {
        height: auto;
    }

    ._slider-input {
        font-size: 0.875rem;
        max-width: 4.5rem;
        margin-left: 12px;
    }

    ._slider-input >>> .v-input__slot {
        min-height: 1rem !important;
    }

    ._slider-input >>> .v-text-field__slot input {
        padding: 4px 0 4px;
    }

</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-1 pt-3">
                <v-subheader class="_tool-slider-subheader">
                    <v-btn
                        v-if="lockSliders && isTouchDevice"
                        @click="isLocked = !isLocked"
                        plain
                        small
                        icon
                    >
                        <v-icon small :color="(isLocked ? 'red' : '')">
                            {{ isLocked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline' }}
                        </v-icon>
                    </v-btn>
                    <v-icon small :class="'mr-2'">
                        {{ icon }}
                    </v-icon>
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
                    <span v-if="!hasInputField" class="font-weight-bold">
                        {{ value }} {{ unit }}
                    </span>
                </v-subheader>
                <v-card-text class="py-0 pb-2 d-flex align-center">
                    <v-slider
                        v-model="value"
                        v-touch="{start: resetLockTimer}"
                        :disabled="isLocked"
                        :min="min"
                        :max="processedMax"
                        :color="colorBar"
                        @change="changeSlider"
                        hide-details>

                        <template v-slot:prepend>
                            <v-icon @click="decrement" :disabled="isLocked || value <= min">mdi-minus</v-icon>
                        </template>

                        <template v-slot:append>
                            <v-icon @click="increment" :disabled="isLocked || value >= processedMax">mdi-plus</v-icon>
                        </template>
                    </v-slider>
                    <v-text-field
                        v-if="hasInputField"
                        class="_slider-input"
                        v-model="numInput"
                        @blur="numInput = value"
                        @keyup.enter="submitInput"
                        :error="(!dynamicRange && numInput > max) || numInput < min"
                        :suffix="unit"
                        type="number"
                        hide-spin-buttons
                        hide-details
                        outlined
                        dense>
                    </v-text-field>
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
    private declare timeout: ReturnType<typeof setTimeout>
    private isLocked = false

    private value = 0
    private numInput = 0
    private startValue = 0
    private processedMax = 100
    private dynamicStep = 50

    @Prop({ type: Number, required: true }) declare readonly target: number
    @Prop({ type: String, required: true }) declare readonly command: string
    @Prop({ type: String, default: '' }) declare readonly attributeName: string
    @Prop({ type: String, default: '' }) declare readonly label: string
    @Prop({ type: String, default: '' }) declare readonly icon: string
    @Prop({ type: String, default: '%' }) declare readonly unit: string
    @Prop({ type: Number, default: 1 }) declare readonly attributeScale: number
    @Prop({ type: Number, default: 0 }) declare readonly min: number
    @Prop({ type: Number, default: 100 }) declare readonly max: number
    @Prop({ type: Boolean, required: false, default: false }) declare readonly hasInputField: boolean
    @Prop({ type: Boolean, default: false }) declare readonly dynamicRange: boolean
    @Prop({ type: Number, default: 100 })  declare readonly defaultValue: number
    @Prop({ type: Number, default: 100 }) declare readonly step: number
    @Prop({ type: Number, default: 1 }) declare readonly multi: number

    created(): void {
        this.value = this.target * this.multi
        this.startValue = this.target * this.multi
        this.dynamicStep = Math.floor((this.max) / 2)

        if (this.value >= this.processedMax) {
            this.processedMax = (Math.ceil(this.value / this.dynamicStep) + 1) * this.dynamicStep
        }
    }

    @Watch('lockSliders', {immediate: true})
    lockSlidersChanged(): void {
        this.isLocked = this.lockSliders && this.isTouchDevice
    }

    startLockTimer(): void {
        let t = this.lockSlidersDelay
        if (!this.isTouchDevice || !this.lockSliders || (t <= 0)) return
        this.timeout = setTimeout(() => this.isLocked = true, t * 1000)
    }

    resetLockTimer(): void {
        clearTimeout(this.timeout)
    }

    get lockSliders(): boolean {
        return this.$store.state.gui.uiSettings.lockSlidersOnTouchDevices
    }

    get lockSlidersDelay(): number {
        return this.$store.state.gui.uiSettings.lockSlidersDelay
    }

    get colorBar(): string {
        return this.max < this.value ? 'warning' : 'primary'
    }

    @Debounce(250)
    changeSlider(): void {
        this.sendCmd()

        if (!this.dynamicRange) return
        if (this.value >= this.processedMax) {
            this.processedMax = this.value + this.dynamicStep
        }
    }

    @Watch('value', { immediate: true })
    valueChanged(newVal: number): void {
        this.numInput = newVal
    }

    @Watch('target', { immediate: true })
    targetChanged(newVal: number): void {
        this.value = Math.round(newVal * this.multi)

        if (!this.dynamicRange) return
        if (this.value >= this.processedMax) {
            this.processedMax = this.value + this.dynamicStep
        }
    }

    @Watch('max', { immediate: true })
    maxChanged(newVal: number): void {
        this.processedMax = newVal > this.value ? newVal : Math.ceil(this.value / this.dynamicStep) * this.dynamicStep
    }

    submitInput(): void {
        if (!this.dynamicRange && this.numInput > this.max) this.value = this.max
        else this.value = this.numInput
        this.sendCmd()
    }

    resetSlider(): void {
        this.value = this.defaultValue
        this.processedMax = this.max
        if (this.value >= this.processedMax) {
            this.processedMax = (Math.ceil(this.value / this.dynamicStep) + 1) * this.dynamicStep
        }

        this.sendCmd()
    }

    sendCmd(): void {
        const val = (Math.max(1, this.value) * this.attributeScale).toFixed(0)
        const gcode = `${this.command} ${this.attributeName}${val}`

        this.$store.dispatch('server/addEvent', {message: gcode, type: 'command'})
        this.$socket.emit('printer.gcode.script', {script: gcode})

        this.startLockTimer()
    }

    decrement(): void {
        this.value = this.value > this.min ? Math.round(this.value - this.step) : this.min
        this.sendCmd()
    }

    increment(): void {
        this.value = this.value < this.processedMax || this.dynamicRange ? Math.round(this.value + this.step) : this.processedMax
        this.sendCmd()
    }
}
</script>
