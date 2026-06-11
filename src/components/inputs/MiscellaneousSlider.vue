<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col :class="pwm ? 'pb-1' : 'pb-3'">
                <v-list-subheader class="_fan-slider-subheader">
                    <v-icon
                        v-if="type === 'led' && target > 0"
                        class="mr-2"
                        small
                        :retain-focus-on-click="true"
                        @click="ledOff">
                        {{ mdiLightbulbOnOutline }}
                    </v-icon>
                    <v-icon v-else-if="type === 'led'" class="mr-2" small :retain-focus-on-click="true" @click="ledOn">
                        {{ mdiLightbulbOutline }}
                    </v-icon>
                    <v-icon v-else-if="type.includes('fan')" small :class="fanClasses">{{ mdiFan }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <small v-if="rpm !== null" :class="rpmClasses">{{ Math.round(rpm ?? 0) }} RPM</small>
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
                            :error="errors.length > 0"
                            suffix="%"
                            type="number"
                            hide-spin-buttons
                            hide-details
                            outlined
                            dense
                            class="_slider-input pt-1"
                            @blur="inputValue = Math.round(parseFloat(sliderValue) * 100)"
                            @focus="$event.target.select()"
                            @keydown="checkInvalidChars" />
                    </form>
                </v-list-subheader>
                <transition v-if="controllable && pwm" name="fade">
                    <div v-show="errors.length > 0" class="_error-msg d-flex justify-end">
                        {{ errors[0] ?? '' }}
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
                            <v-icon :disabled="isLocked || sliderValue >= 1" @click="increment">{{ mdiPlus }}</v-icon>
                        </template>
                    </v-slider>
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'
import { convertName } from '@/plugins/helpers'
import { useBase } from '@/composables/useBase'
import debounce from 'lodash.debounce'
import {
    mdiFan,
    mdiLockOpenVariantOutline,
    mdiLockOutline,
    mdiMinus,
    mdiPlus,
    mdiToggleSwitch,
    mdiToggleSwitchOffOutline,
    mdiLightbulbOutline,
    mdiLightbulbOnOutline,
} from '@mdi/js'

const { t } = useI18n()
const store = useStore()
const socket = useSocket()
const { isTouchDevice } = useBase()

const props = defineProps<{
    target: number
    max?: number
    name?: string
    type?: string
    controllable?: boolean
    pwm?: boolean
    rpm?: number | boolean
    multi?: number
    off_below?: number
    colorOrder?: string
}>()

let timeout: ReturnType<typeof setTimeout>
const isLocked = ref(false)
const invalidChars = ['e', 'E', '+']

const min = 0
const inputValue = ref(0)
const sliderValue = ref(0)

const value = computed(() => Math.round((props.target / (props.max ?? 1)) * 100) / 100)

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

const changeSliderValue = debounce(() => {
    if (value.value === sliderValue.value) return

    if (sliderValue.value < value.value && sliderValue.value < (props.off_below ?? 0)) {
        sliderValue.value = 0
    } else if (sliderValue.value > value.value && sliderValue.value < (props.off_below ?? 0)) {
        sliderValue.value = props.off_below ?? 0
    }

    sendCmd(sliderValue.value)
}, 500)

function sendCmd(newVal: number): void {
    if (value.value === newVal) return

    if (newVal < min) newVal = 0
    newVal = newVal * (props.multi ?? 1)

    let gcode = `SET_PIN PIN=${props.name} VALUE=${newVal.toFixed(2)}`
    if (props.type === 'fan') gcode = `M106 S${newVal.toFixed(0)}`
    if (props.type === 'fan_generic') gcode = `SET_FAN_SPEED FAN=${props.name} SPEED=${newVal}`
    if (props.type === 'led')
        gcode = `SET_LED LED=${props.name} ${ledChannelName.value}=${newVal.toFixed(2)} SYNC=0 TRANSMIT=1`

    if (gcode !== '') {
        store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        socket.emit('printer.gcode.script', { script: gcode })
    }

    startLockTimer()
}

function ledOff() {
    sendCmd(0)
}

function ledOn() {
    sendCmd(1)
}

function switchOutputPin(): void {
    const newVal = value.value ? 0 : 1
    const gcode = `SET_PIN PIN=${props.name} VALUE=${(newVal * (props.multi ?? 1)).toFixed(2)}`
    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode })
}

function decrement(): void {
    let newVal = value.value > 0 ? Math.round((value.value - 0.01) * 100) / 100 : 0
    if (value.value < (props.off_below ?? 0)) newVal = 0
    sendCmd(newVal)
}

function increment(): void {
    let newVal = value.value < 1.0 ? Math.round((value.value + 0.01) * 100) / 100 : 1.0
    if (value.value < (props.off_below ?? 0)) newVal = props.off_below
    sendCmd(newVal)
}

onMounted(() => {
    sliderValue.value = value.value
})

watch(value, (newVal: number) => {
    sliderValue.value = newVal
})

watch(sliderValue, (newVal: number) => {
    inputValue.value = Math.round(newVal * 100)
}, { immediate: true })

function checkInvalidChars(event: KeyboardEvent): void {
    if (min >= 0) invalidChars.push('-')
    if (invalidChars.includes(event.key)) event.preventDefault()
}

const errors = computed(() => {
    const errs: string[] = []
    const input = inputValue.value / 100
    if (inputValue.value.toString() === '') {
        errs.push(t('App.NumberInput.NoEmptyAllowedError'))
    }
    if (input < min) {
        errs.push(t('App.NumberInput.GreaterOrEqualError', { min: min * 100 }))
    }
    return errs
})

const disableFanAnimation = computed(() => store.state.gui.uiSettings.disableFanAnimation ?? false)

const fanClasses = computed(() => {
    const output = ['mr-2']
    if (!disableFanAnimation.value && value.value >= (props.off_below ?? 0) && value.value > 0) output.push('icon-rotate')

    return output
})

const rpmClasses = computed(() => {
    const output: (string | string[])[] = []
    if (!props.controllable) output.push(['mr-3', 'mt-1'])
    else output.push(['mt-2'])
    if (props.rpm === 0 && value.value > 0) output.push('red--text')

    return output
})

const ledChannelName = computed(() => {
    if (props.colorOrder === 'R') return 'RED'
    if (props.colorOrder === 'G') return 'GREEN'
    if (props.colorOrder === 'B') return 'BLUE'

    return 'WHITE'
})

function submitInput(): void {
    if (errors.value.length > 0) return

    let newVal = inputValue.value / 100
    if (value.value === 0 && newVal < (props.off_below ?? 0)) {
        newVal = props.off_below ?? 0
    } else if (value.value >= (props.off_below ?? 0) && newVal < (props.off_below ?? 0)) {
        newVal = 0
    }

    sendCmd(newVal)
}
</script>

<style scoped>
._fan-slider-subheader {
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
    padding: 4px 0 4px;
}
</style>
