<template>
    <v-row dense>
        <v-col class="pa-0">
            <v-subheader class="_tool-slider-subheader px-1">
                <v-icon small class="mr-2">
                    {{ icon }}
                </v-icon>
                <span>{{ label }}</span>
                <v-btn
                    v-if="value !== defaultValue && !hasInputField"
                    x-small
                    icon
                    class="ml-2"
                    :disabled="isLocked"
                    @click="resetSlider">
                    <v-icon>{{ mdiRestart }}</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <span v-if="!hasInputField" class="font-weight-bold">{{ value }} {{ unit }}</span>
                <form @submit.prevent="submitInput">
                    <v-text-field
                        v-if="hasInputField"
                        v-model="numInput"
                        :error="errors().length > 0"
                        :suffix="unit"
                        type="number"
                        hide-spin-buttons
                        hide-details
                        outlined
                        dense
                        class="_slider-input d-flex align-center pt-1"
                        @blur="numInput = value"
                        @focus="$event.target.select()"
                        @keydown="checkInvalidChars">
                        <template v-if="value !== defaultValue || value !== numInput" #append>
                            <v-icon small @click="resetSlider">{{ mdiRestart }}</v-icon>
                        </template>
                    </v-text-field>
                </form>
            </v-subheader>
            <transition name="fade">
                <!-- display errors-->
                <div v-show="errors().length > 0" class="_error-msg d-flex justify-end">
                    {{ errors()[0] }}
                </div>
            </transition>
            <v-card-text class="pa-0 d-flex align-center">
                <v-btn
                    v-if="lockSliders && isTouchDevice"
                    plain
                    small
                    icon
                    class="_lock-button"
                    @click="isLocked = !isLocked">
                    <v-icon small :color="isLocked ? 'red' : ''">
                        {{ isLocked ? mdiLockOutline : mdiLockOpenVariantOutline }}
                    </v-icon>
                </v-btn>
                <v-slider
                    v-model="value"
                    v-touch="{ start: resetLockTimer }"
                    :disabled="isLocked"
                    :min="min"
                    :max="processedMax"
                    :color="colorBar"
                    hide-details
                    @change="changeSlider">
                    <template #prepend>
                        <v-icon :disabled="isLocked || value <= min" @click="decrement">{{ mdiMinus }}</v-icon>
                    </template>

                    <template #append>
                        <v-icon :disabled="isLocked || (value >= max && !dynamicRange)" @click="increment">
                            {{ mdiPlus }}
                        </v-icon>
                    </template>
                </v-slider>
            </v-card-text>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiLockOpenVariantOutline, mdiLockOutline, mdiMinus, mdiPlus, mdiRestart } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

@Component
export default class ToolSlider extends Mixins(BaseMixin) {
    mdiRestart = mdiRestart
    mdiLockOutline = mdiLockOutline
    mdiLockOpenVariantOutline = mdiLockOpenVariantOutline
    mdiMinus = mdiMinus
    mdiPlus = mdiPlus

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
    @Prop({ default: '' }) declare readonly label: string | TranslateResult
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

    errors() {
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
        if (this.errors().length > 0) return
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

<style scoped>
._tool-slider-subheader {
    height: auto;
}

._lock-button {
    margin-left: -6px;
}

._error-msg {
    color: #ff5252;
    font-size: 12px;
    padding: 4px 16px 2px 0;
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
    min-width: 4.2rem;
    max-width: 5rem;
    margin-left: 12px;
}

._slider-input >>> .v-input__slot {
    min-height: 1rem !important;
}

._slider-input >>> .v-text-field__slot input {
    padding-top: 4px;
    padding-bottom: 4px;
}

._slider-input >>> .v-input__append-inner {
    margin: auto -5px auto 0 !important;
}
</style>
