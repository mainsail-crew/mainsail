<style scoped>
._spin_button_group {
    width: 24px;
    margin: -6px -6px 0 -6px;
}

.v-input--has-state {
    margin-bottom: -18px !important;
}
</style>

<template>
    <form v-on:submit.prevent="submit">
        <v-text-field
            v-model.number="value"
            class="d-flex align-top"
            @blur="value = target"
            @click:append="resetToDefault"
            @keydown="checkInvalidChars"
            :label="label"
            :suffix="unit"
            :append-icon="target !== defaultValue ? 'mdi-restart' : ''"
            :error="invalidInput()"
            :error-messages="inputErrors()"
            :disabled="disabled"
            :step="step"
            :min="min"
            :max="max"
            :dec="dec"
            type="number"
            hide-spin-buttons
            hide-details="auto"
            outlined
            dense>
            <template v-if="hasSpinner" v-slot:append-outer>
                <div class="_spin_button_group">
                    <v-btn
                        @click="incrementValue"
                        :disabled="(value >= max && max !== null) || error || disabled"
                        class="mt-n3"
                        icon
                        plain
                        small>
                        <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn
                        @click="decrementValue"
                        :disabled="value <= min || error || disabled"
                        class="mb-n3"
                        icon
                        plain
                        small>
                        <v-icon>mdi-chevron-down</v-icon>
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

@Component
export default class NumberInput extends Mixins(BaseMixin) {
    private value: number = 0
    private error: boolean = false
    private invalidChars: string[] = ['e', 'E', '+']

    // input field name and identifier
    @Prop({ type: String, required: true })
    declare readonly label: string

    @Prop({ type: String, required: true })
    declare readonly param: string

    // props defining incoming data
    @Prop({ type: Number, required: true, default: 0 })
    declare readonly target: number

    @Prop({ type: Number, required: true, default: 0 })
    declare readonly defaultValue: number

    // props for internal processing
    @Prop({ type: Number, required: true, default: 0 })
    declare readonly min: number

    @Prop({ type: Number, default: null })
    declare readonly max: number | null

    @Prop({ type: Number, required: true, default: 0 })
    declare readonly dec: number

    @Prop({ type: Number, required: false, default: 1 })
    declare readonly step: number

    @Prop({ type: String, required: true })
    declare readonly unit: string

    // spinner related props
    @Prop({ type: Boolean, required: false, default: false })
    declare readonly hasSpinner: boolean

    @Prop({ type: Number, required: false, default: 1 })
    declare readonly spinnerFactor: number

    // props for general internal behaviour
    @Prop({ type: Boolean, required: false, default: false })
    declare readonly disabled: boolean

    @Prop({ type: Boolean, required: false, default: false })
    declare readonly outputErrorMsg: boolean

    created(): void {
        this.value = this.target
    }

    @Watch('target')
    updateTarget(): void {
        this.value = this.target
    }

    incrementValue(): void {
        if (this.value + this.step * this.spinnerFactor < this.max! || this.max === null) {
            this.value = Math.round((this.value + this.step * this.spinnerFactor) * 10 ** this.dec) / 10 ** this.dec
        } else {
            this.value = this.max
        }
        this.submit()
    }

    decrementValue(): void {
        if (this.value - this.step * this.spinnerFactor > this.min) {
            this.value = Math.round((this.value - this.step * this.spinnerFactor) * 10 ** this.dec) / 10 ** this.dec
        } else {
            this.value = this.min
        }
        this.submit()
    }

    resetToDefault(): void {
        this.value = this.defaultValue
        this.submit()
    }

    submit(): void {
        if (this.invalidInput()) return
        this.$emit('target-changed', this.param, this.value)
        this.$emit('submit', this.param)
    }

    // input validation //
    checkInvalidChars(event: any): void {
        // add '-' to invalid characters if no negative input is allowed
        if (this.min >= 0) this.invalidChars.push('-')
        if (this.invalidChars.includes(event.key)) event.preventDefault()
    }

    invalidInput(): boolean {
        return this.value.toString() === '' || this.value < this.min || (this.value > this.max! && this.max !== null)
    }

    inputErrors() {
        if (!this.outputErrorMsg) return []

        const errors = []
        if (this.value.toString() === '') {
            // "Input must not be empty!"
            errors.push(this.$t('App.NumberInput.NoEmptyAllowedError'))
        }
        if (this.max === null && this.value < this.min) {
            // "Must be grater or equal than {min}!"
            errors.push(this.$t('App.NumberInput.GreaterOrEqualError', { min: this.min }))
        }
        if (this.max !== null && (this.value > this.max! || this.value < this.min)) {
            // "Must be between {min} and {max}!"
            errors.push(this.$t('App.NumberInput.MustBeBetweenError', { min: this.min, max: this.max }))
        }
        return errors
    }
}
</script>
