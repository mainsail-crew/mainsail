<template>
    <panel v-if="klipperReadyForGui" :icon="mdiFan" title="Spindle & Coolant" :collapsible="true" card-class="spindle-coolant-panel">
        <v-container class="py-2">
            <v-row density="compact" class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Spindle Control:</span>
                </v-col>
                <v-col cols="4">
                    <v-btn size="small" block color="success" @click="setSpindleOn">
                        <v-icon left>{{ mdiPlay }}</v-icon>
                        ON
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn size="small" block color="error" @click="setSpindleOff">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        OFF
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn size="small" block color="info" @click="setSpindleCcwl">
                        <v-icon left>{{ mdiRotate3dVariant }}</v-icon>
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
                    <v-btn size="small" block color="primary" :disabled="!spindleSpeedInput" @click="setSpindleSpeed">
                        SET
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-3"></v-divider>

            <v-row density="compact" class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Coolant Control:</span>
                </v-col>
                <v-col cols="6">
                    <v-btn size="small" block color="success" @click="setCoolantFloodOn">
                        <v-icon left>{{ mdiWater }}</v-icon>
                        Flood ON
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn size="small" block color="error" @click="setCoolantFloodOff">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        Flood OFF
                    </v-btn>
                </v-col>
            </v-row>
             <v-row density="compact" class="mb-3">
                <v-col cols="6">
                    <v-btn size="small" block color="success" @click="setCoolantMistOn">
                        <v-icon left>{{ mdiSpray }}</v-icon>
                        Mist ON
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn size="small" block color="error" @click="setCoolantMistOff">
                        <v-icon left>{{ mdiStop }}</v-icon>
                        Mist OFF
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import Panel from '@/components/ui/Panel.vue'
import { mdiFan, mdiPlay, mdiStop, mdiRotate3dVariant, mdiWater, mdiSpray } from '@mdi/js'
import { setCncCoolant, setCncSpindle } from '@/store/files/cncApi'

const { klipperReadyForGui } = useBase()
useControl()

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
