<template>
    <panel v-if="klipperReadyForGui" :icon="mdiGamepad" title="Jog" :collapsible="true" card-class="jog-panel">
        <v-container class="py-2">
            <v-row density="compact" class="mb-3">
                <v-col cols="12">
 <v-btn
                        size="small"
                        class="d-block w-100"
                        :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                        :loading="loadings.includes('homeAll')"
                        :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                        @click="doHome">
                        <v-icon start class="mr-1">{{ mdiHome }}</v-icon>
                        Home All
                    </v-btn>
                </v-col>
                <v-col cols="6">
 <v-btn
                        size="small"
                        class="d-block w-100"
                        :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                        :loading="loadings.includes('homeXY')"
                        :color="homedAxes.includes('xy') ? 'primary' : 'warning'"
                        @click="doHomeXY">
                        <v-icon start size="small">{{ mdiHome }}</v-icon>
                        Home XY
                    </v-btn>
                </v-col>
                <v-col cols="6">
 <v-btn
                        size="small"
                        class="d-block w-100"
                        :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                        :loading="loadings.includes('homeZ')"
                        :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                        @click="doHomeZ">
                        <v-icon start size="small">{{ mdiHome }}</v-icon>
                        Home Z
                    </v-btn>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-3">
                <v-col cols="12">
 <v-btn
                        size="small"
                        class="d-block w-100"
                        :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                        color="grey"
                        variant="outlined"
                        @click="disableSteppers">
                        <v-icon start size="small">{{ mdiCloseCircleOutline }}</v-icon>
                        Disable Steppers
                    </v-btn>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-3">
                <v-col cols="12" class="d-flex align-center">
                    <span class="text-caption mr-2">Jog Step:</span>
 <v-btn-toggle v-model="selectedStepIndex" density="compact" size="small" class="flex-grow-1">
 <v-btn v-for="(step, idx) in jogSteps" :key="idx" :value="idx" size="x-small">
                            {{ formatStep(step) }}
                        </v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-3">
                <v-col cols="6">
                    <v-text-field
                        v-model.number="feedrateXY"
                        label="XY Feed"
                        type="number"
                        :min="1"
                        :max="1000"
                        density="compact"
                        variant="outlined"
                        suffix="mm/min"
                        @change="saveFeedrates" />
                </v-col>
                <v-col cols="6">
                    <v-text-field
                        v-model.number="feedrateZ"
                        label="Z Feed"
                        type="number"
                        :min="1"
                        :max="500"
                        density="compact"
                        variant="outlined"
                        suffix="mm/min"
                        @change="saveFeedrates" />
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-2 justify-center">
                <v-col cols="12" md="6" class="d-flex flex-column align-center">
                    <div class="text-center mb-3 w-100">
                        <span class="text-caption font-weight-bold">XY Jog ({{ currentStep }} mm)</span>
                    </div>
                    <div class="jog-panel__xy-pad">
 <v-btn
                            class="jog-panel__xy-btn"
                            size="large"
                            :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                            @click="jog('Y', currentStep)">
                            <v-icon>{{ mdiChevronUp }}</v-icon>
                        </v-btn>
 <v-btn
                            class="jog-panel__xy-btn"
                            size="large"
                            :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                            @click="jog('X', -currentStep)">
                            <v-icon>{{ mdiChevronLeft }}</v-icon>
                        </v-btn>
 <v-btn
                            class="jog-panel__xy-btn jog-panel__xy-center"
                            size="large"
                            variant="outlined"
                            :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                            @click="jogStop">
                            <v-icon>{{ mdiStop }}</v-icon>
                        </v-btn>
 <v-btn
                            class="jog-panel__xy-btn"
                            size="large"
                            :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                            @click="jog('X', currentStep)">
                            <v-icon>{{ mdiChevronRight }}</v-icon>
                        </v-btn>
 <v-btn
                            class="jog-panel__xy-btn"
                            size="large"
                            :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                            @click="jog('Y', -currentStep)">
                            <v-icon>{{ mdiChevronDown }}</v-icon>
                        </v-btn>
                    </div>
                </v-col>

                <v-col cols="12" md="6" class="d-flex flex-column justify-center">
                    <div class="text-center mb-3">
                        <span class="text-caption font-weight-bold">Z Jog</span>
                    </div>
 <v-btn
                        class="jog-panel__jog-btn mb-2 d-block w-100"
                        size="large"
                        :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                        @click="jog('Z', currentStep)">
                        <v-icon>{{ mdiChevronUp }}</v-icon>
                        <span class="ml-2">+{{ currentStep }}</span>
                    </v-btn>
 <v-btn
                        class="jog-panel__jog-btn d-block w-100"
                        size="large"
                        :disabled="['printing'].includes(printer_state) || !allAxesHomed"
                        @click="jog('Z', -currentStep)">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                        <span class="ml-2">-{{ currentStep }}</span>
                    </v-btn>
                </v-col>
            </v-row>

            <v-row density="compact" class="my-2">
                <v-col cols="12">
 <v-btn
                        size="small"
                        class="d-block w-100"
                        :color="keyboardNavEnabled ? 'primary' : ''"
                        :variant="keyboardNavEnabled ? 'elevated' : 'outlined'"
                        @click="toggleKeyboardNav">
                        <v-icon size="small" start>{{ mdiKeyboard }}</v-icon>
                        Keyboard Nav {{ keyboardNavEnabled ? '(ON)' : '(OFF)' }}
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-3" />
            <v-row density="compact">
                <v-col cols="6">
                    <span class="text-caption text-secondary">Status:</span>
                    <v-chip size="small" :color="['printing'].includes(printer_state) ? 'warning' : 'primary'" class="mx-2">
                        {{ printer_state }}
                    </v-chip>
                </v-col>
                <v-col cols="6" class="text-right">
                    <span class="text-caption text-secondary">Homed:</span>
                    <v-chip size="small" :color="allAxesHomed ? 'primary' : 'warning'" class="mx-2">
                        {{ homedAxesDisplay }}
                    </v-chip>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useSocket } from '@/composables/useSocket'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiGamepad,
    mdiHome,
    mdiChevronUp,
    mdiChevronDown,
    mdiChevronLeft,
    mdiChevronRight,
    mdiStop,
    mdiCloseCircleOutline,
    mdiKeyboard,
} from '@mdi/js'
import { updateCncSettings } from '@/store/files/cncApi'

const { printer_state, klipperReadyForGui } = useBase()
const { homedAxes, doHome, doHomeXY, doHomeZ, doSend } = useControl()

const store = useStore()
const socket = useSocket()

const keyboardNavEnabled = ref(false)
const jogSteps = [1.0, 5.0, 10.0, 25.0, 100.0]
const lastJogTimestamps: Record<string, number> = {}
const jogRateLimitMs = 50

let keyboardJogHandler: ((event: KeyboardEvent) => void) | null = null

const currentStep = computed(() => jogSteps[selectedStepIndex.value])

const selectedStepIndex = computed({
    get: () => store.state.gui.control.selectedCncStepIndex ?? 2,
    set: (value: number) => {
        store.dispatch('gui/saveSetting', { name: 'control.selectedCncStepIndex', value })
    }
})

const homedAxesDisplay = computed(() => {
    if (homedAxes.value === 'xyz') return 'All'
    return homedAxes.value || 'None'
})

const allAxesHomed = computed(() =>
    homedAxes.value.includes('x') && homedAxes.value.includes('y') && homedAxes.value.includes('z')
)

const loadings = computed(() => store.state.server.loadings ?? [])

const feedrateXY = computed({
    get: () => store.state.gui.control.cncFeedrateXY ?? 500,
    set: (value: number) => {
        store.dispatch('gui/saveSetting', { name: 'control.cncFeedrateXY', value })
    }
})

const feedrateZ = computed({
    get: () => store.state.gui.control.cncFeedrateZ ?? 100,
    set: (value: number) => {
        store.dispatch('gui/saveSetting', { name: 'control.cncFeedrateZ', value })
    }
})

function saveFeedrates() {
    void updateCncSettings(store.getters['socket/getUrl'], {
        feedrateXY: feedrateXY.value,
        feedrateZ: feedrateZ.value,
    }).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to persist CNC feedrates'
        useToast().error(message)
    })
}

function formatStep(step: number): string {
    if (step < 1) return `${(step * 1000).toFixed(0)}µm`
    return `${step}mm`
}

function jog(axis: string, distance: number) {
    if (!useBase().socketIsConnected.value) {
        useToast().error('Cannot jog — not connected to printer')
        return
    }

    const key = `${axis}${distance >= 0 ? '+' : '-'}`
    const now = Date.now()
    const last = lastJogTimestamps[key] ?? 0
    if (now - last < jogRateLimitMs) return
    lastJogTimestamps[key] = now

    const feedrate = getAxisFeedrate(axis)
    const script = `SAVE_GCODE_STATE NAME=_ui_movement\nG91\nG1 ${axis}${distance} F${feedrate * 60}\nRESTORE_GCODE_STATE NAME=_ui_movement`
    socket.emit('printer.gcode.script', { script })
}

function toggleKeyboardNav() {
    keyboardNavEnabled.value = !keyboardNavEnabled.value
}

function disableSteppers() {
    doSend('M18')
}

function jogStop() {
    doSend('M112')
}

function getAxisFeedrate(axis: string): number {
    if (axis === 'Z') return feedrateZ.value
    return feedrateXY.value
}

function handleKeyboardJog(event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault()
    }

    if (!keyboardNavEnabled.value || ['printing'].includes(printer_state.value)) return

    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

    const step = currentStep.value
    switch (event.key) {
        case 'ArrowUp':
            void jog('Y', step)
            break
        case 'ArrowDown':
            void jog('Y', -step)
            break
        case 'ArrowLeft':
            void jog('X', -step)
            break
        case 'ArrowRight':
            void jog('X', step)
            break
    }
}

onMounted(() => {
    keyboardJogHandler = handleKeyboardJog
    document.addEventListener('keydown', keyboardJogHandler, true)
})

onBeforeUnmount(() => {
    if (keyboardJogHandler) {
        document.removeEventListener('keydown', keyboardJogHandler, true)
    }
})
</script>

<style scoped>
.jog-panel__xy-pad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-width: 220px;
    margin: 0 auto;
}

.jog-panel__xy-btn {
    aspect-ratio: 1 / 1;
    min-width: 60px !important;
}

.jog-panel__xy-center {
    grid-column: 2;
    grid-row: 2;
}

.jog-panel__xy-pad .v-btn:nth-child(1) {
    grid-column: 2;
    grid-row: 1;
}

.jog-panel__xy-pad .v-btn:nth-child(2) {
    grid-column: 1;
    grid-row: 2;
}

.jog-panel__xy-pad .v-btn:nth-child(3) {
    grid-column: 2;
    grid-row: 2;
}

.jog-panel__xy-pad .v-btn:nth-child(4) {
    grid-column: 3;
    grid-row: 2;
}

.jog-panel__xy-pad .v-btn:nth-child(5) {
    grid-column: 2;
    grid-row: 3;
}
</style>
