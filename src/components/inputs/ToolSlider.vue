<style scoped>
._tool-slider-subheader {
    height: auto;
}

._lock-button {
    margin-left: -6px;
}

._error-message {
    color: #ff5252;
    font-size: 12px;
    padding: 0 16px 2px 0;
}

.fade-enter-active {
    animation: slide-in 0.15s reverse;
    opacity: 1;
}

.fade-leave-active {
    animation: slide-in 0.15s;
    opacity: 1;
}

@keyframes slide-in {
    100% {
        transform: translateY(-5px);
    }
}

._slider-input {
    font-size: 0.875rem;
    max-width: 5.4rem;
    margin-left: 12px;
}

._slider-input >>> .v-input__slot {
    min-height: 1rem !important;
}

._slider-input >>> .v-text-field__slot input {
    padding: 4px 0 4px;
}

._slider-input >>> .v-input__append-inner {
    margin: auto -5px auto 0 !important;
}
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-1 pt-3">
                <v-subheader class="_tool-slider-subheader">
                    <v-icon small :class="'mr-2'">
                        {{ icon }}
                    </v-icon>
                    <span>{{ label }}</span>
                    <v-btn
                        v-if="value !== defaultValue && !hasInputField"
                        class="ml-2"
                        x-small
                        icon
                        :disabled="isLocked"
                        @click="resetSlider">
                        <v-icon>mdi-restart</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <span v-if="!hasInputField" class="font-weight-bold">{{ value }} {{ unit }}</span>
                    <v-text-field
                        v-if="hasInputField"
                        class="_slider-input d-flex align-center pt-1"
                        v-model="numInput"
                        @blur="numInput = value"
                        @focus="$event.target.select()"
                        @keydown="checkInvalidChars"
                        @keyup.enter="submitInput"
                        :error="invalidInput()"
                        :suffix="unit"
                        type="number"
                        hide-spin-buttons
                        hide-details
                        outlined
                        dense>
                        <template v-if="value !== defaultValue || value !== numInput" v-slot:append>
                            <v-icon small @click="resetSlider">mdi-restart</v-icon>
                        </template>
                    </v-text-field>
                </v-subheader>
                <!-- display errors-->
                <transition name="fade">
                    <div v-show="inputErrors().length > 0" class="_error-message d-flex justify-end">
                        {{ inputErrors()[0] }}
                    </div>
                </transition>
                <v-card-text class="py-0 pb-2 d-flex align-center">
                    <v-btn
                        class="_lock-button"
                        v-if="lockSliders && isTouchDevice"
                        @click="isLocked = !isLocked"
                        plain
                        small
                        icon>
                        <v-icon small :color="isLocked ? 'red' : ''">
                            {{ isLocked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline' }}
                        </v-icon>
                    </v-btn>
                    <v-slider
                        v-model="value"
                        v-touch="{ start: resetLockTimer }"
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
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class ToolSlider extends Mixins(BaseMixin) {
    private declare timeout: ReturnType<typeof setTimeout>
    private isLocked: boolean = false
    private invalidChars: string[] = ['e', 'E', '+']

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
    @Prop({ type: Number, default: 100 }) declare readonly defaultValue: number
    @Prop({ type: Number, default: 100 }) declare readonly step: number
    @Prop({ type: Number, default: 1 }) declare readonly multi: number

    created(): void {
        this.value = this.target * this.multi
        this.numInput = this.value
        this.startValue = this.target * this.multi
        this.dynamicStep = Math.floor(this.max / 2)

        if (this.value >= this.processedMax) {
            this.processedMax = (Math.ceil(this.value / this.dynamicStep) + 1) * this.dynamicStep
        }
    }

    @Watch('lockSliders', { immediate: true })
    lockSlidersChanged(): void {
        this.isLocked = this.lockSliders && this.isTouchDevice
    }

    startLockTimer(): void {
        let t = this.lockSlidersDelay
        if (!this.isTouchDevice || !this.lockSliders || t <= 0) return
        this.timeout = setTimeout(() => (this.isLocked = true), t * 1000)
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

    // input validation //
    checkInvalidChars(event: any): void {
        // add '-' to invalid characters if no negative input is allowed
        if (this.min >= 0) this.invalidChars.push('-')
        if (this.invalidChars.includes(event.key)) event.preventDefault()
    }

    invalidInput(): boolean {
        return (
            this.numInput.toString() == '' ||
            (!this.dynamicRange && this.numInput) > this.max ||
            this.numInput < this.min
        )
    }

    inputErrors() {
        const errors = []
        if (this.numInput.toString() === '') {
            // "Input must not be empty!"
            errors.push(this.$t('App.NumberInput.NoEmptyAllowedError'))
        }
        if (this.numInput < this.min) {
            // "Must be grater or equal than {min}!"
            errors.push(this.$t('App.NumberInput.GreaterOrEqualError', { min: this.min }))
        }
        if ((!this.dynamicRange && this.numInput > this.max) || this.numInput < this.min) {
            // "Must be between {min} and {max}!"
            errors.push(this.$t('App.NumberInput.MustBeBetweenError', { min: this.min, max: this.max }))
        }
        return errors
    }

    submitInput(): void {
        if (this.invalidInput()) return
        if (!this.dynamicRange && this.numInput > this.max) this.value = this.max
        else this.value = this.numInput
        this.sendCmd()
    }

    resetSlider(): void {
        this.value = this.defaultValue
        this.numInput = this.defaultValue
        this.processedMax = this.max
        if (this.value >= this.processedMax) {
            this.processedMax = (Math.ceil(this.value / this.dynamicStep) + 1) * this.dynamicStep
        }

        this.sendCmd()
    }

    sendCmd(): void {
        const val = (Math.max(1, this.value) * this.attributeScale).toFixed(0)
        const gcode = `${this.command} ${this.attributeName}${val}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })

        this.startLockTimer()
    }

    decrement(): void {
        this.value = this.value > this.min ? Math.round(this.value - this.step) : this.min
        this.sendCmd()
    }

    increment(): void {
        this.value =
            this.value < this.processedMax || this.dynamicRange ? Math.round(this.value + this.step) : this.processedMax
        this.sendCmd()
    }
}
</script>
