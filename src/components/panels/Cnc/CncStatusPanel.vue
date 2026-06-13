<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiAxisArrow"
        title="CNC Status"
        :collapsible="true"
        card-class="cnc-status-panel">
        <v-container class="py-2">
            <div class="cnc-status-panel__chips">
                <v-chip size="small" label :color="stateColor" class="mr-2">{{ printerStateLabel }}</v-chip>
                <v-chip size="small" label variant="outlined" class="mr-2">{{ coordinateModeLabel }}</v-chip>
                <v-chip size="small" label variant="outlined">{{ homedAxesLabel }}</v-chip>
            </div>

            <div class="cnc-status-panel__grid">
                <div class="cnc-status-panel__item">
                    <span class="cnc-status-panel__label">Active File</span>
                    <span class="cnc-status-panel__value cnc-status-panel__value--filename">{{ activeFile }}</span>
                </div>
                <div class="cnc-status-panel__item">
                    <span class="cnc-status-panel__label">Feed Override</span>
                    <span class="cnc-status-panel__value">{{ feedOverride }}</span>
                </div>
                <div class="cnc-status-panel__item">
                    <span class="cnc-status-panel__label">Requested Feed</span>
                    <span class="cnc-status-panel__value">{{ requestedFeed }}</span>
                </div>
                <div class="cnc-status-panel__item">
                    <span class="cnc-status-panel__label">Max Velocity</span>
                    <span class="cnc-status-panel__value">{{ maxVelocity }}</span>
                </div>
                <div class="cnc-status-panel__item">
                    <span class="cnc-status-panel__label">Host Load</span>
                    <span class="cnc-status-panel__value">{{ hostLoad }}</span>
                </div>
                <div class="cnc-status-panel__item">
                    <span class="cnc-status-panel__label">Free RAM</span>
                    <span class="cnc-status-panel__value">{{ freeRam }}</span>
                </div>
            </div>

            <div v-if="showMachineHealth && cncMetadataViewModel" class="cnc-status-panel__metadata">
                <div class="cnc-status-panel__metadata-header">
                    <span class="cnc-status-panel__metadata-title">CNC Metadata</span>
                    <v-chip size="x-small" label variant="outlined" :loading="cncMetadataLoading">{{ cncMetadataLoading ? 'Loading' : 'Loaded' }}</v-chip>
                </div>

                <div class="cnc-status-panel__metadata-grid">
                    <div class="cnc-status-panel__item">
                        <span class="cnc-status-panel__label">CAM Tool</span>
                        <span class="cnc-status-panel__value">{{ cncMetadataViewModel.camTool }}</span>
                    </div>
                    <div class="cnc-status-panel__item">
                        <span class="cnc-status-panel__label">Tool</span>
                        <span class="cnc-status-panel__value">{{ cncMetadataViewModel.tool }}</span>
                    </div>
                    <div class="cnc-status-panel__item">
                        <span class="cnc-status-panel__label">Spindle</span>
                        <span class="cnc-status-panel__value">{{ cncMetadataViewModel.spindle }}</span>
                    </div>
                    <div class="cnc-status-panel__item">
                        <span class="cnc-status-panel__label">Feeds</span>
                        <span class="cnc-status-panel__value">{{ cncMetadataViewModel.feeds }}</span>
                    </div>
                </div>

                <div class="cnc-status-panel__fields">
                    <div v-for="field in cncMetadataViewModel.fields" :key="field.label" class="cnc-status-panel__field">
                        <span class="cnc-status-panel__label">{{ field.label }}</span>
                        <span class="cnc-status-panel__value">{{ field.value }}</span>
                    </div>
                </div>
            </div>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useCncProfile } from '@/composables/useCncProfile'
import Panel from '@/components/ui/Panel.vue'
import { mdiAxisArrow } from '@mdi/js'
import { buildCncMetadataViewModel, loadCncMetadata, type CncMetadataViewModel } from '@/store/files/cncMetadata'

const { klipperReadyForGui, printer_state } = useBase()
const { absolute_coordinates, homedAxes } = useControl()
const { showMachineHealth } = useCncProfile()

const store = useStore()

const cncMetadataViewModel = ref<CncMetadataViewModel | null>(null)
const cncMetadataLoading = ref(false)
let cncMetadataRequestId = 0

const stateColor = computed(() => {
    switch (printer_state.value) {
        case 'printing':
            return 'success'
        case 'paused':
            return 'warning'
        case 'complete':
            return 'info'
        case 'error':
        case 'shutdown':
            return 'error'
        default:
            return 'primary'
    }
})

const printerStateLabel = computed(() =>
    printer_state.value ? printer_state.value.toUpperCase() : 'UNKNOWN'
)

const coordinateModeLabel = computed(() =>
    absolute_coordinates.value ? 'Absolute (G90)' : 'Relative (G91)'
)

const homedAxesLabel = computed(() => {
    const axes = homedAxes.value.toUpperCase()
    return axes ? `Homed: ${axes}` : 'Homed: none'
})

const activeGcodeFilename = computed(() =>
    store.state.printer.print_stats?.filename ?? ''
)

const activeFile = computed(() =>
    activeGcodeFilename.value || 'No active file'
)

const feedOverride = computed(() => {
    const factor = store.state.printer.gcode_move?.speed_factor ?? 1
    return `${Math.round(factor * 100)}%`
})

const requestedFeed = computed(() => {
    const speed = store.state.printer.gcode_move?.speed ?? 0
    return `${(speed / 60).toFixed(1)} mm/s`
})

const maxVelocity = computed(() => {
    const max = store.state.printer.toolhead?.max_velocity ?? 0
    return `${Number(max).toFixed(1)} mm/s`
})

const hostLoad = computed(() => {
    const load = store.state.printer.system_stats?.sysload ?? 0
    return load.toFixed(2)
})

const freeRam = computed(() => {
    const memAvail = store.state.printer.system_stats?.memavail ?? 0
    return `${Math.round(memAvail / 1024)} MB`
})

async function refreshCncMetadata() {
    const filename = activeGcodeFilename.value
    const requestId = ++cncMetadataRequestId

    if (!filename) {
        cncMetadataViewModel.value = null
        cncMetadataLoading.value = false
        return
    }

    cncMetadataLoading.value = true
    const apiUrl = store.getters['socket/getUrl']
    const metadata = await loadCncMetadata(apiUrl, filename)

    if (requestId !== cncMetadataRequestId) return

    cncMetadataViewModel.value = buildCncMetadataViewModel(metadata)
    cncMetadataLoading.value = false
}

onMounted(() => {
    void refreshCncMetadata()
})

watch(activeGcodeFilename, () => {
    void refreshCncMetadata()
})
</script>

<style scoped>
.cnc-status-panel__chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 0.75rem;
}

.cnc-status-panel__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.cnc-status-panel__metadata {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.cnc-status-panel__metadata-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.cnc-status-panel__metadata-title {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.02em;
}

.cnc-status-panel__metadata-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.cnc-status-panel__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.cnc-status-panel__item,
.cnc-status-panel__field {
    display: grid;
    gap: 0.2rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.5rem;
}

.cnc-status-panel__label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.72;
}

.cnc-status-panel__value {
    font-size: 1rem;
    font-weight: 600;
}

.cnc-status-panel__value--filename {
    word-break: break-word;
}

@media (max-width: 960px) {
    .cnc-status-panel__grid,
    .cnc-status-panel__metadata-grid,
    .cnc-status-panel__fields {
        grid-template-columns: 1fr;
    }
}
</style>
