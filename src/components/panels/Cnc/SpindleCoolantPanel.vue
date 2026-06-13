<template>
    <panel
        v-if="klipperReadyForGui && (spindleEnabled || coolantEnabled)"
        :icon="mdiFan"
        title="Spindle & Coolant"
        :collapsible="true"
        card-class="spindle-coolant-panel">
        <v-container class="py-2">
            <template v-if="spindleEnabled">
                <v-row density="compact" class="mb-3">
                    <v-col cols="12">
                        <span class="text-caption font-weight-bold">Spindle Control:</span>
                    </v-col>
                    <v-col cols="4">
 <v-btn size="small" class="d-block w-100" color="success" @click="setSpindleOn">
                            <v-icon start>{{ mdiPlay }}</v-icon>
                            ON
                        </v-btn>
                    </v-col>
                    <v-col cols="4">
 <v-btn size="small" class="d-block w-100" color="error" @click="setSpindleOff">
                            <v-icon start>{{ mdiStop }}</v-icon>
                            OFF
                        </v-btn>
                    </v-col>
                    <v-col cols="4">
 <v-btn size="small" class="d-block w-100" color="info" @click="setSpindleCcwl">
                            <v-icon start>{{ mdiRotate3dVariant }}</v-icon>
                            CCW
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row density="compact" class="mb-3">
                    <v-col cols="8">
                        <v-text-field
                            v-model.number="spindleSpeedInput"
                            label="Spindle Speed (RPM)"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details
                            :min="0"
                            :max="24000"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="4">
 <v-btn size="small" class="d-block w-100" color="primary" :disabled="spindleSpeedInput === null" @click="setSpindleSpeed">
                            SET
                        </v-btn>
                    </v-col>
                </v-row>

                <v-divider v-if="coolantEnabled" class="my-3"></v-divider>
            </template>

            <template v-if="coolantEnabled">
                <v-row density="compact" class="mb-3">
                    <v-col cols="12">
                        <span class="text-caption font-weight-bold">Coolant Control:</span>
                    </v-col>
                    <v-col cols="6">
 <v-btn size="small" class="d-block w-100" color="success" @click="setCoolantFloodOn">
                            <v-icon start>{{ mdiWater }}</v-icon>
                            Flood ON
                        </v-btn>
                    </v-col>
                    <v-col cols="6">
 <v-btn size="small" class="d-block w-100" color="error" @click="setCoolantFloodOff">
                            <v-icon start>{{ mdiStop }}</v-icon>
                            Flood OFF
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row density="compact" class="mb-3">
                    <v-col cols="6">
 <v-btn size="small" class="d-block w-100" color="success" @click="setCoolantMistOn">
                            <v-icon start>{{ mdiSpray }}</v-icon>
                            Mist ON
                        </v-btn>
                    </v-col>
                    <v-col cols="6">
 <v-btn size="small" class="d-block w-100" color="error" @click="setCoolantMistOff">
                            <v-icon start>{{ mdiStop }}</v-icon>
                            Mist OFF
                        </v-btn>
                    </v-col>
                </v-row>
            </template>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useCncProfile } from '@/composables/useCncProfile'
import Panel from '@/components/ui/Panel.vue'
import { mdiFan, mdiPlay, mdiStop, mdiRotate3dVariant, mdiWater, mdiSpray } from '@mdi/js'
import { setCncCoolant, setCncSpindle } from '@/store/files/cncApi'

const { klipperReadyForGui } = useBase()
useControl()
const { spindleEnabled, coolantEnabled, requireConfirmForSpindleStart } = useCncProfile()

const store = useStore()

const spindleSpeedInput = ref<number | null>(null)

async function setSpindleOn() {
    await sendSpindle('cw')
}

async function setSpindleOff() {
    await sendSpindle('off')
}

async function setSpindleCwl() {
    await sendSpindle('cw')
}

async function setSpindleCcwl() {
    await sendSpindle('ccw')
}

async function setSpindleSpeed() {
    if (spindleSpeedInput.value !== null) {
        await sendSpindle(spindleSpeedInput.value > 0 ? 'cw' : 'off')
    }
}

async function sendSpindle(state: 'off' | 'cw' | 'ccw') {
    const rpm = spindleSpeedInput.value ?? 0
    const isStarting = state !== 'off'

    if (isStarting && requireConfirmForSpindleStart.value) {
        const suffix = rpm > 0 ? ` at ${rpm} RPM` : ''
        if (!window.confirm(`Send spindle command ${state.toUpperCase()}${suffix}?`)) return
    }

    try {
        await setCncSpindle(store.getters['socket/getUrl'], {
            state,
            rpm,
        })
        store.dispatch('server/addEvent', {
            message: `CNC spindle ${state}${state === 'off' ? '' : ` ${rpm}`}`,
            type: 'command',
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update spindle'
        useToast().error(message)
    }
}

async function setCoolantFloodOn() {
    await sendCoolant({ flood: true, mist: false })
}

async function setCoolantFloodOff() {
    await sendCoolant({ flood: false, mist: false })
}

async function setCoolantMistOn() {
    await sendCoolant({ flood: false, mist: true })
}

async function setCoolantMistOff() {
    await sendCoolant({ flood: false, mist: false })
}

async function sendCoolant(payload: { flood?: boolean; mist?: boolean }) {
    try {
        await setCncCoolant(store.getters['socket/getUrl'], payload)
        const active = payload.flood ? 'flood on' : payload.mist ? 'mist on' : 'off'
        store.dispatch('server/addEvent', {
            message: `CNC coolant ${active}`,
            type: 'command',
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update coolant'
        useToast().error(message)
    }
}
</script>

<style scoped>
</style>
