<template>
    <form @submit.prevent="submit">
        <v-text-field
            v-model="value"
            :label="label"
            :suffix="unit"
            :error="invalidInput"
            :error-messages="inputErrors"
            :disabled="disabled"
            :step="step"
            :min="min"
            :max="max"
            :dec="dec"
            hide-spin-buttons
            hide-details="auto"
            outlined
            dense
            class="d-flex align-top"
            @blur="value = target.toString()"
            @focus="$event.target.select()"
            @keydown="checkInvalidChars">
            <template v-if="defaultValue" #append>
                <v-icon @click="resetToDefault">{{ value !== defaultValue.toString() ? mdiRestart : '' }}</v-icon>
            </template>
            <template v-if="hasSpinner" #append-outer>
                <div class="_spin_button_group">
                    <v-btn
                        :disabled="(value >= max && max !== null) || error || disabled"
                        class="mt-n3"
                        icon
                        plain
                        small
                        @click="incrementValue">
                        <v-icon>{{ mdiChevronUp }}</v-icon>
                    </v-btn>
                    <v-btn
                        :disabled="value <= min || error || disabled"
                        class="mb-n3"
                        icon
                        plain
                        small
                        @click="decrementValue">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                    </v-btn>
                </div>
            </template>
        </v-text-field>
    </form>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown, mdiChevronUp, mdiRestart } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

@Component
export default class NumberInput extends Mixins(BaseMixin) {
    mdiRestart = mdiRestart
    mdiChevronUp = mdiChevronUp
    mdiChevronDown = mdiChevronDown

    private value: string = '0'
    private error: boolean = false
    private invalidChars: string[] = ['e', 'E', '+']

    // input field name and identifier
    @Prop({ required: true }) declare readonly label: TranslateResult | string
    @Prop({ type: String, required: true }) declare readonly param: string
    // props defining incoming data
    @Prop({ type: Number, required: true }) declare readonly target: number
    @Prop({ type: Number, required: false }) declare readonly defaultValue: number
    // props for internal processing
    @Prop({ type: Number, required: true }) declare readonly min: number
    @Prop({ default: null }) declare readonly max: number | null
    @Prop({ type: Number, required: true }) declare readonly dec: number
    @Prop({ type: Number, required: false, default: 1 }) declare readonly step: number
    @Prop({ type: String, required: false }) declare readonly unit: string
    // spinner related props
    @Prop({ type: Boolean, required: false, default: false }) declare readonly hasSpinner: boolean
    @Prop({ type: Number, required: false, default: 1 }) declare readonly spinnerFactor: number
    // props for general internal behaviour
    @Prop({ type: Boolean, required: false, default: false }) declare readonly disabled: boolean
    @Prop({ type: Boolean, required: false, default: false }) declare readonly outputErrorMsg: boolean

    created(): void {
        this.value = this.target.toString()
    }

    @Watch('target')
    updateTarget(): void {
        this.value = this.target.toString()
    }

    incrementValue(): void {
        if (this.inputValue + this.step * this.spinnerFactor < this.max! || this.max === null) {
            this.value = (
                Math.round((this.inputValue + this.step * this.spinnerFactor) * 10 ** this.dec) /
                10 ** this.dec
            ).toString()
        } else this.value = this.max.toString()

        this.submit()
    }

    decrementValue(): void {
        if (this.inputValue - this.step * this.spinnerFactor > this.min) {
            this.value = (
                Math.round((this.inputValue - this.step * this.spinnerFactor) * 10 ** this.dec) /
                10 ** this.dec
            ).toString()
        } else this.value = this.min.toString()

        this.submit()
    }

    resetToDefault(): void {
        this.value = this.defaultValue.toString()
        this.submit()
    }

    submit(): void {
        if (this.invalidInput) return
        this.$emit('submit', { name: this.param, value: this.inputValue })
    }

    // input validation //
    checkInvalidChars(event: any): void {
        // add '-' to invalid characters if no negative input is allowed
        if (this.min >= 0) this.invalidChars.push('-')
        if (this.invalidChars.includes(event.key)) event.preventDefault()
    }

    // this function only parse this.value, to escape an empty input
    get inputValue(): number {
        if (this.value.toString() === '') return 0

        return parseFloat(this.value.replace(',', '.'))
    }

    get invalidInput(): boolean {
        return this.inputErrors.length > 0
    }

    get inputErrors() {
        if (!this.outputErrorMsg) return []

        const errors = []
        if (this.max === null && this.inputValue < this.min) {
            // "Must be grater or equal than {min}!"
            errors.push(this.$t('App.NumberInput.GreaterOrEqualError', { min: this.min }))
        }
        if (this.max !== null && (this.inputValue > this.max! || this.inputValue < this.min)) {
            // "Must be between {min} and {max}!"
            errors.push(this.$t('App.NumberInput.MustBeBetweenError', { min: this.min, max: this.max }))
        }

        return errors
    }
}
</script>

<style scoped>
._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}

.v-input--has-state {
    margin-bottom: -18px !important;
}
</style>
