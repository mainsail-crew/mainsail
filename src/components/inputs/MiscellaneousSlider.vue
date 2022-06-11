<style scoped>
._fan-slider-subheader {
    height: auto;
}

._lock-button {
    margin-left: -6px;
}

._rpm {
    padding-top: 0.2rem !important;
    margin: 0 !important;
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
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col :class="pwm ? 'pb-1' : 'pb-3'">
                <v-subheader class="_fan-slider-subheader">
                    <v-icon
                        v-if="type !== 'output_pin'"
                        small
                        :class="'mr-2 ' + (value >= off_below && value > 0 ? 'icon-rotate' : '')">
                        {{ mdiFan }}
                    </v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer></v-spacer>
                    <small
                        v-if="rpm || rpm === 0"
                        :class="`mr-3 ${controllable && pwm ? '_rpm' : ''}
                                ${rpm === 0 && value > 0 ? 'red--text' : ''}`">
                        {{ Math.round(rpm) }} RPM
                    </small>
                    <span v-if="!controllable" class="font-weight-bold">
                        {{ Math.round(parseFloat(value) * 100) }} %
                    </span>
                    <v-icon v-if="controllable && !pwm" @click="switchOutputPin">
                        {{ value ? mdiToggleSwitch : mdiToggleSwitchOffOutline }}
                    </v-icon>
                    <form @submit.prevent="submitInput">
                        <v-text-field
                            v-if="controllable && pwm"
                            v-model="inputValue"
                            :error="errors().length > 0"
                            suffix="%"
                            type="number"
                            hide-spin-buttons
                            hide-details
                            outlined
                            dense
                            class="_slider-input pt-1"
                            @blur="inputValue = Math.round(parseFloat(sliderValue) * 100)"
                            @focus="$event.target.select()"
                            @keydown="checkInvalidChars"></v-text-field>
                    </form>
                </v-subheader>
                <transition name="fade">
                    <!-- display errors -->
                    <div v-show="errors().length > 0 && controllable && pwm" class="_error-msg d-flex justify-end">
                        {{ errors()[0] }}
                    </div>
                </transition>
                <v-card-text v-if="controllable && pwm" class="py-0 pb-2 d-flex align-center">
                    <v-btn
                        v-if="lockSliders && isTouchDevice && pwm"
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
                        v-model="sliderValue"
                        v-touch="{ start: resetLockTimer }"
                        :disabled="isLocked"
                        :min="0.0"
                        :max="1.0"
                        :step="0.01"
                        :color="sliderValue < off_below && sliderValue > 0 ? 'red' : undefined"
                        hide-details
                        @change="changeSliderValue">
                        <template #prepend>
                            <v-icon :disabled="isLocked || sliderValue <= min" @click="decrement">
                                {{ mdiMinus }}
                            </v-icon>
                        </template>

                        <template #append>
                            <v-icon :disabled="isLocked || sliderValue >= max" @click="increment">{{ mdiPlus }}</v-icon>
                        </template>
                    </v-slider>
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import {
    mdiFan,
    mdiLockOpenVariantOutline,
    mdiLockOutline,
    mdiMinus,
    mdiPlus,
    mdiToggleSwitch,
    mdiToggleSwitchOffOutline,
} from '@mdi/js'

@Component
export default class MiscellaneousSlider extends Mixins(BaseMixin) {
    mdiFan = mdiFan
    mdiToggleSwitch = mdiToggleSwitch
    mdiToggleSwitchOffOutline = mdiToggleSwitchOffOutline
    mdiLockOutline = mdiLockOutline
    mdiLockOpenVariantOutline = mdiLockOpenVariantOutline
    mdiMinus = mdiMinus
    mdiPlus = mdiPlus

    convertName = convertName
    private declare timeout: ReturnType<typeof setTimeout>
    private isLocked: boolean = false
    private invalidChars: string[] = ['e', 'E', '+']

    private min = 0
    private value = 0
    private inputValue = 0
    private sliderValue = 0

    @Prop({ type: Number, required: true }) declare target: number
    @Prop({ type: Number, default: 1 }) declare max: number
    @Prop({ type: String, default: '' }) declare name: string
    @Prop({ type: String, default: '' }) declare type: string
    @Prop({ type: Boolean, default: false }) declare controllable: boolean
    @Prop({ type: Boolean, default: false }) declare pwm: boolean
    @Prop({ type: [Number, Boolean], default: false }) declare rpm: number | boolean
    @Prop({ type: Number, default: 1 }) declare multi: number
    @Prop({ type: Number, default: 0 }) declare off_below: number

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

    @Debounce(500)
    changeSliderValue(): void {
        if (this.value === this.sliderValue) return
        /**
         * snap slider handle to 0 if dragging from above 'off_below' to below 'off_below'
         * snap slider handle to 'off_below' if dragging from 0 to below 'off_below'
         */
        if (this.sliderValue < this.value && this.sliderValue < this.off_below) {
            this.sliderValue = 0
        } else if (this.sliderValue > this.value && this.sliderValue < this.off_below) {
            this.sliderValue = this.off_below
        }
        this.value = this.sliderValue
        this.sendCmd()
    }

    sendCmd(): void {
        if (this.target === this.value) return

        let gcode = ''
        if (this.value < this.min) this.value = 0
        const l_value = this.value * this.multi
        if (this.type === 'fan') gcode = `M106 S${l_value.toFixed(0)}`
        if (this.type === 'fan_generic') gcode = `SET_FAN_SPEED FAN=${this.name} SPEED=${l_value}`
        if (this.type === 'output_pin') gcode = `SET_PIN PIN=${this.name} VALUE=${l_value.toFixed(2)}`

        if (gcode !== '') {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }

        this.startLockTimer()
    }

    switchOutputPin(): void {
        this.value = this.value ? 0 : 1
        const gcode = `SET_PIN PIN=${this.name} VALUE=${(this.value * this.multi).toFixed(2)}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    decrement(): void {
        this.value = this.value > 0 ? Math.round((this.value - 0.01) * 100) / 100 : 0
        if (this.value < this.off_below) this.value = 0
        this.sendCmd()
    }

    increment(): void {
        this.value = this.value < 1.0 ? Math.round((this.value + 0.01) * 100) / 100 : 1.0
        if (this.value < this.off_below) this.value = this.off_below
        this.sendCmd()
    }

    mounted(): void {
        this.value = this.target
    }

    @Watch('target')
    targetChanged(newVal: number): void {
        this.value = newVal
    }

    @Watch('value')
    valueChanged(newVal: number): void {
        this.sliderValue = newVal
    }

    @Watch('sliderValue', { immediate: true })
    sliderValueChanged(newVal: number): void {
        this.inputValue = Math.round(newVal * 100)
    }

    // input validation //
    checkInvalidChars(event: any): void {
        // add '-' to invalid characters if no negative input is allowed
        if (this.min >= 0) this.invalidChars.push('-')
        if (this.invalidChars.includes(event.key)) event.preventDefault()
    }

    errors() {
        const errors = []
        const input = this.inputValue / 100
        if (this.inputValue.toString() === '') {
            // "Input must not be empty!"
            errors.push(this.$t('App.NumberInput.NoEmptyAllowedError'))
        }
        if (input < this.min) {
            // "Must be grater or equal than {min}!"
            errors.push(this.$t('App.NumberInput.GreaterOrEqualError', { min: this.min * 100 }))
        }
        if (input > this.max || input < this.min) {
            // "Must be between {min} and {max}!"
            errors.push(this.$t('App.NumberInput.MustBeBetweenError', { min: this.min * 100, max: this.max * 100 }))
        }
        return errors
    }

    submitInput(): void {
        if (this.errors().length > 0) return

        const input = this.inputValue / 100
        if (this.value === 0 && input < this.off_below) {
            this.value = this.off_below
        } else if (this.value >= this.off_below && input < this.off_below) {
            this.value = 0
        } else this.value = input

        this.sendCmd()
    }
}
</script>
