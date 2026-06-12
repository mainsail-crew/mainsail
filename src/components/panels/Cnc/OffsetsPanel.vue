<template>
    <panel v-if="klipperReadyForGui" :icon="mdiTable" title="Offsets" :collapsible="true" card-class="offsets-panel">
        <v-container class="py-2">
            <v-row density="compact" class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Coordinate System:</span>
                </v-col>
                <v-col cols="12">
                    <v-btn-toggle :value="selectedOffsetIndex" dense small class="w-100" @change="onWcsChange">
                        <v-tooltip v-for="(name, idx) in offsetNames" :key="idx" top content-class="tooltip-opaque" transition="fade-transition" :open-delay="0" :close-delay="0">
                            <template #activator="{ on, attrs }">
                                <v-btn :value="idx" x-small v-bind="attrs" v-on="on">
                                    {{ name }}
                                </v-btn>
                            </template>
                            {{ offsetTooltips[idx] }}
                        </v-tooltip>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-1">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Work Position:</span>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text-secondary">X</div>
                    <div class="font-weight-bold">{{ currentWorkX.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text-secondary">Y</div>
                    <div class="font-weight-bold">{{ currentWorkY.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text-secondary">Z</div>
                    <div class="font-weight-bold">{{ currentWorkZ.toFixed(3) }}</div>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Origin Offset (machine):</span>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text-secondary">X</div>
                    <div class="font-weight-medium">{{ wcsOriginOffsetX.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text-secondary">Y</div>
                    <div class="font-weight-medium">{{ wcsOriginOffsetY.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text-secondary">Z</div>
                    <div class="font-weight-medium">{{ wcsOriginOffsetZ.toFixed(3) }}</div>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Set Work Zero:</span>
                </v-col>
                <v-col cols="6">
                    <v-btn small block outlined @click="setWorkZeroXY">
                        <v-icon small left>{{ mdiTarget }}</v-icon>
                        Set XY Zero
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn small block outlined @click="setWorkZeroZ">
                        <v-icon small left>{{ mdiAxisZArrow }}</v-icon>
                        Set Z Zero
                    </v-btn>
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Manual Offset:</span>
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model.number="offsetInputX"
                        label="X"
                        type="number"
                        dense
                        outlined
                        step="0.001" />
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model.number="offsetInputY"
                        label="Y"
                        type="number"
                        dense
                        outlined
                        step="0.001" />
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model.number="offsetInputZ"
                        label="Z"
                        type="number"
                        dense
                        outlined
                        step="0.001" />
                </v-col>
            </v-row>

            <v-row density="compact" class="mb-2">
                <v-col cols="6">
                    <v-btn small block color="primary" @click="applyOffsets">
                        <v-icon small left>{{ mdiCheck }}</v-icon>
                        Apply
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn small block outlined @click="resetOffsets">
                        <v-icon small left>{{ mdiRestart }}</v-icon>
                        Reset
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useSocket } from '@/composables/useSocket'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiTable,
    mdiTarget,
    mdiAxisZArrow,
    mdiCheck,
    mdiRestart,
} from '@mdi/js'
import { getCncWcs, selectCncWcs, setCncZero } from '@/store/files/cncApi'

const { klipperReadyForGui } = useBase()
const { doSend } = useControl()

const store = useStore()
const socket = useSocket()

const offsetNames = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
const offsetTooltips = [
    'G54 - Primary work coordinate system',
    'G55 - Secondary work coordinate system',
    'G56 - Tertiary work coordinate system',
    'G57 - Quaternary work coordinate system',
    'G58 - Fifth work coordinate system',
    'G59 - Sixth work coordinate system',
]

const selectedOffsetIndex = ref(0)
const offsetInputX = ref(0)
const offsetInputY = ref(0)
const offsetInputZ = ref(0)
const wcsOffsets = reactive<Record<string, Record<string, number>>>({})

const currentWorkPosition = computed(() =>
    store.state.printer?.gcode_move?.gcode_position ?? [0, 0, 0, 0]
)

const currentWorkX = computed(() => currentWorkPosition.value[0] ?? 0)
const currentWorkY = computed(() => currentWorkPosition.value[1] ?? 0)
const currentWorkZ = computed(() => currentWorkPosition.value[2] ?? 0)

const wcsP = computed(() => selectedOffsetIndex.value + 1)

const wcsOriginOffsets = computed(() =>
    wcsOffsets[offsetNames[selectedOffsetIndex.value]] ?? { X: 0, Y: 0, Z: 0 }
)

const wcsOriginOffsetX = computed(() => wcsOriginOffsets.value.X ?? 0)
const wcsOriginOffsetY = computed(() => wcsOriginOffsets.value.Y ?? 0)
const wcsOriginOffsetZ = computed(() => wcsOriginOffsets.value.Z ?? 0)

async function refreshActiveWcs() {
    try {
        const wcs = await getCncWcs(store.getters['socket/getUrl'])
        const active = typeof wcs?.active === 'string' ? wcs.active : 'G54'
        const index = offsetNames.indexOf(active)
        selectedOffsetIndex.value = index >= 0 ? index : 0
        if (wcs?.offsets && typeof wcs.offsets === 'object') {
            Object.assign(wcsOffsets, wcs.offsets as Record<string, Record<string, number>>)
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load active WCS'
        useToast().error(message)
    }
}

async function onWcsChange(idx: number | null) {
    if (idx === null) return

    const wcs = offsetNames[idx]
    if (!wcs) return

    try {
        await selectCncWcs(store.getters['socket/getUrl'], { wcs })
        selectedOffsetIndex.value = idx
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to change work coordinate system'
        useToast().error(message)
    }
}

async function setWorkZeroXY() {
    try {
        await setCncZero(store.getters['socket/getUrl'], { axes: ['X', 'Y'] })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to set XY zero'
        useToast().error(message)
    }
}

async function setWorkZeroZ() {
    try {
        await setCncZero(store.getters['socket/getUrl'], { axes: ['Z'] })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to set Z zero'
        useToast().error(message)
    }
}

function applyOffsets() {
    const x = offsetInputX.value ?? 0
    const y = offsetInputY.value ?? 0
    const z = offsetInputZ.value ?? 0
    doSend(`G10 L20 P${wcsP.value} X${x} Y${y} Z${z}`)
    offsetInputX.value = 0
    offsetInputY.value = 0
    offsetInputZ.value = 0
}

function resetOffsets() {
    doSend(`G10 L20 P${wcsP.value} X0 Y0 Z0`)
    offsetInputX.value = 0
    offsetInputY.value = 0
    offsetInputZ.value = 0
}

onMounted(() => {
    void refreshActiveWcs()
})
</script>

<style scoped>
.tooltip-opaque {
    opacity: 1 !important;
}

.tooltip-opaque.v-tooltip__content {
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.6, 1) !important;
}
</style>
