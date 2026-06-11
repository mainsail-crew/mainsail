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
            hide-details
            outlined
            dense
            class="d-flex align-top"
            @blur="value = target.toString()"
            @focus="$event.target.select()"
            @keydown="checkInvalidChars">
            <template v-if="defaultValue !== null" #append>
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { mdiChevronDown, mdiChevronUp, mdiRestart } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

const { t } = useI18n()
useBase()

const props = defineProps<{
    label: TranslateResult | string
    param: string
    target: number
    defaultValue?: number | null
    min: number
    max: number | null
    dec: number
    step?: number
    unit?: string
    hasSpinner?: boolean
    spinnerFactor?: number
    disabled?: boolean
    outputErrorMsg?: boolean
}>()

const emit = defineEmits<{
    (e: 'submit', payload: { name: string; value: number }): void
}>()

const value = ref(props.target.toString())
const error = ref(false)
const invalidChars = ['e', 'E', '+']

watch(() => props.target, () => {
    value.value = props.target.toString()
})

function incrementValue(): void {
    if (inputValue.value + (props.step ?? 1) * (props.spinnerFactor ?? 1) < props.max! || props.max === null) {
        value.value = (
            Math.round((inputValue.value + (props.step ?? 1) * (props.spinnerFactor ?? 1)) * 10 ** props.dec) /
            10 ** props.dec
        ).toString()
    } else value.value = props.max.toString()

    submit()
}

function decrementValue(): void {
    if (inputValue.value - (props.step ?? 1) * (props.spinnerFactor ?? 1) > props.min) {
        value.value = (
            Math.round((inputValue.value - (props.step ?? 1) * (props.spinnerFactor ?? 1)) * 10 ** props.dec) /
            10 ** props.dec
        ).toString()
    } else value.value = props.min.toString()

    submit()
}

function resetToDefault(): void {
    value.value = props.defaultValue?.toString() ?? ''
    submit()
}

function submit(): void {
    if (invalidInput.value) return
    emit('submit', { name: props.param, value: inputValue.value })
}

function checkInvalidChars(event: KeyboardEvent): void {
    if (props.min >= 0) invalidChars.push('-')
    if (invalidChars.includes(event.key)) event.preventDefault()
}

const inputValue = computed<number>(() => {
    if (value.value.toString() === '') return 0
    return parseFloat(value.value.replace(',', '.'))
})

const invalidInput = computed(() => inputErrors.value.length > 0)

const inputErrors = computed(() => {
    if (!props.outputErrorMsg) return []

    const errs: string[] = []
    if (props.max === null && inputValue.value < props.min) {
        errs.push(t('App.NumberInput.GreaterOrEqualError', { min: props.min }))
    }
    if (props.max !== null && (inputValue.value > props.max! || inputValue.value < props.min)) {
        errs.push(t('App.NumberInput.MustBeBetweenError', { min: props.min, max: props.max }))
    }

    return errs
})
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
