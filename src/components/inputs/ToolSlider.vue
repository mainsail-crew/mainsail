<template>
    <v-row density="compact">
        <v-col class="pa-0">
            <v-list-subheader class="_tool-slider-subheader px-1">
                <v-icon size="small" class="mr-2">
                    {{ icon }}
                </v-icon>
                <span>{{ label }}</span>
 <v-btn
                    v-if="_value !== defaultValue && !hasInputField"
                    size="x-small"
                    icon
                    class="ml-2"
                    :disabled="isLocked"
                    @click="resetSlider">
                    <v-icon>{{ mdiRestart }}</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <span v-if="!hasInputField" class="font-weight-bold">{{ _value }} {{ unit }}</span>
                <form @submit.prevent="submitInput">
                    <v-text-field
                        v-if="hasInputField"
                        v-model="numInput"
                        :error="errors().length > 0"
                        :suffix="unit"
                        type="number"
                        hide-spin-buttons
                        hide-details
                        variant="outlined"
                        density="compact"
                        class="_slider-input d-flex align-center pt-1"
                        @blur="numInput = _value"
                        @focus="$event.target.select()"
                        @keydown="checkInvalidChars">
                        <template v-if="_value !== defaultValue || _value !== numInput" #append>
                            <v-icon size="small" @click="resetSlider">{{ mdiRestart }}</v-icon>
                        </template>
                    </v-text-field>
                </form>
            </v-list-subheader>
            <transition name="fade">
                <div v-show="errors().length > 0" class="_error-msg d-flex justify-end">
                    {{ errors()[0] }}
                </div>
            </transition>
            <v-card-text class="pa-0 d-flex align-center">
 <v-btn
                    v-if="lockSliders && isTouchDevice"
                    variant="plain"
                    size="small"
                    icon
                    class="_lock-button"
                    @click="isLocked = !isLocked">
                    <v-icon size="small" :color="isLocked ? 'red' : ''">
                        {{ isLocked ? mdiLockOutline : mdiLockOpenVariantOutline }}
                    </v-icon>
                </v-btn>
                <v-slider
                    v-model="_value"
                    v-touch="{ start: resetLockTimer }"
                    :disabled="isLocked"
                    :min="min"
                    :max="processedMax"
                    :color="colorBar"
                    hide-details
                    @change="changeSlider">
                    <template #prepend>
                        <v-icon :disabled="isLocked || _value <= min" @click="decrement">{{ mdiMinus }}</v-icon>
                    </template>

                    <template #append>
                        <v-icon :disabled="isLocked || (_value >= max && !dynamicRange)" @click="increment">
                            {{ mdiPlus }}
                        </v-icon>
                    </template>
                </v-slider>
            </v-card-text>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import debounce from 'lodash.debounce'
import { mdiLockOpenVariantOutline, mdiLockOutline, mdiMinus, mdiPlus, mdiRestart } from '@mdi/js'
import type { TranslateResult } from 'vue-i18n'

const { t } = useI18n()
const store = useStore()
const socket = useSocket()
const { isTouchDevice } = useBase()

const props = defineProps<{
    target: number
    command: string
    attributeName?: string
    label?: string | TranslateResult
    icon?: string
    unit?: string
    attributeScale?: number
    min?: number
    max?: number
    hasInputField?: boolean
    dynamicRange?: boolean
    defaultValue?: number
    step?: number
    multi?: number
}>()

let timeout: ReturnType<typeof setTimeout>
const isLocked = ref(false)
const invalidChars = ['e', 'E', '+']

const _value = ref(0)
const numInput = ref(0)
const processedMax = ref(100)
const dynamicStep = ref(50)

const inputMin = computed(() => props.min ?? 0)

const lockSliders = computed(() => store.state.gui.uiSettings.lockSlidersOnTouchDevices)

watch([lockSliders, isTouchDevice], () => {
    isLocked.value = lockSliders.value && isTouchDevice.value
}, { immediate: true })

function startLockTimer(): void {
    const t = store.state.gui.uiSettings.lockSlidersDelay ?? 0
    if (!isTouchDevice.value || !lockSliders.value || t <= 0) return
    timeout = setTimeout(() => (isLocked.value = true), t * 1000)
}

function resetLockTimer(): void {
    clearTimeout(timeout)
}

const colorBar = computed(() => (props.max ?? 100) < _value.value ? 'warning' : 'primary')

const changeSlider = debounce(() => {
    sendCmd()

    if (!props.dynamicRange) return
    if (_value.value >= processedMax.value) {
        processedMax.value = _value.value + dynamicStep.value
    }
}, 250)

watch(_value, (newVal: number) => {
    numInput.value = newVal
}, { immediate: true })

watch(() => props.target, (newVal: number) => {
    _value.value = Math.round(newVal * (props.multi ?? 1))

    if (!props.dynamicRange) return
    if (_value.value >= processedMax.value) {
        processedMax.value = _value.value + dynamicStep.value
    }
}, { immediate: true })

watch(() => props.max, (newVal: number) => {
    processedMax.value = newVal > _value.value ? newVal : Math.ceil(_value.value / dynamicStep.value) * dynamicStep.value
}, { immediate: true })

function checkInvalidChars(event: KeyboardEvent): void {
    if (inputMin.value >= 0) invalidChars.push('-')
    if (invalidChars.includes(event.key)) event.preventDefault()
}

function errors() {
    const errs: string[] = []
    if (numInput.value.toString() === '') {
        errs.push(t('App.NumberInput.NoEmptyAllowedError'))
    }
    if (numInput.value < inputMin.value) {
        errs.push(t('App.NumberInput.GreaterOrEqualError', { min: inputMin.value }))
    }
    if ((!props.dynamicRange && numInput.value > (props.max ?? 100)) || numInput.value < inputMin.value) {
        errs.push(t('App.NumberInput.MustBeBetweenError', { min: inputMin.value, max: props.max ?? 100 }))
    }
    return errs
}

function submitInput(): void {
    if (errors().length > 0) return
    if (!props.dynamicRange && numInput.value > (props.max ?? 100)) _value.value = props.max ?? 100
    else _value.value = numInput.value
    sendCmd()
}

function resetSlider(): void {
    _value.value = props.defaultValue ?? 100
    numInput.value = props.defaultValue ?? 100
    processedMax.value = props.max ?? 100
    if (_value.value >= processedMax.value) {
        processedMax.value = (Math.ceil(_value.value / dynamicStep.value) + 1) * dynamicStep.value
    }

    sendCmd()
}

function sendCmd(): void {
    const val = (Math.max(1, _value.value) * (props.attributeScale ?? 1)).toFixed(0)
    const gcode = `${props.command} ${props.attributeName ?? ''}${val}`

    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode })

    startLockTimer()
}

function decrement(): void {
    _value.value = _value.value > inputMin.value ? Math.round(_value.value - (props.step ?? 1)) : inputMin.value
    sendCmd()
}

function increment(): void {
    _value.value =
        _value.value < processedMax.value || props.dynamicRange ? Math.round(_value.value + (props.step ?? 1)) : processedMax.value
    sendCmd()
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

._slider-input :deep(.v-input__slot) {
    min-height: 1rem !important;
}

._slider-input :deep(.v-text-field__slot) input {
    padding-top: 4px;
    padding-bottom: 4px;
}

._slider-input :deep(.v-input__append-inner) {
    margin: auto -5px auto 0 !important;
}
</style>
