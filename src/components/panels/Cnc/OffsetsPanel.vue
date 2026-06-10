<template>
    <panel v-if="klipperReadyForGui" :icon="mdiTable" title="Offsets" :collapsible="true" card-class="offsets-panel">
        <v-container class="py-2">
            <!-- Coordinate System Selector -->
            <v-row dense class="mb-3">
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

            <!-- Current Work Position -->
            <v-row dense class="mb-1">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Work Position:</span>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">X</div>
                    <div class="font-weight-bold">{{ currentWorkX.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">Y</div>
                    <div class="font-weight-bold">{{ currentWorkY.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">Z</div>
                    <div class="font-weight-bold">{{ currentWorkZ.toFixed(3) }}</div>
                </v-col>
            </v-row>

            <!-- WCS Origin Offset -->
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Origin Offset (machine):</span>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">X</div>
                    <div class="font-weight-medium">{{ wcsOriginOffsetX.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">Y</div>
                    <div class="font-weight-medium">{{ wcsOriginOffsetY.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">Z</div>
                    <div class="font-weight-medium">{{ wcsOriginOffsetZ.toFixed(3) }}</div>
                </v-col>
            </v-row>

            <!-- Set Work Zero Buttons -->
            <v-row dense class="mb-3">
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

            <!-- Manual Offset Entry -->
            <v-row dense class="mb-3">
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

            <!-- Apply/Reset Buttons -->
            <v-row dense class="mb-2">
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

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import {
    mdiTable,
    mdiTarget,
    mdiAxisZArrow,
    mdiCheck,
    mdiRestart,
} from '@mdi/js'
import { getCncWcs, selectCncWcs, setCncZero } from '@/store/files/cncApi'

@Component({
    components: {
        Panel,
    },
})
export default class OffsetsPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiTable = mdiTable
    mdiTarget = mdiTarget
    mdiAxisZArrow = mdiAxisZArrow
    mdiCheck = mdiCheck
    mdiRestart = mdiRestart

    offsetNames = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    offsetTooltips = [
        'G54 - Primary work coordinate system',
        'G55 - Secondary work coordinate system',
        'G56 - Tertiary work coordinate system',
        'G57 - Quaternary work coordinate system',
        'G58 - Fifth work coordinate system',
        'G59 - Sixth work coordinate system',
    ]

    data() {
        return {
            selectedOffsetIndex: 0,
            offsetInputX: 0,
            offsetInputY: 0,
            offsetInputZ: 0,
            wcsOffsets: {} as Record<string, Record<string, number>>,
        }
    }

    mounted() {
        void this.refreshActiveWcs()
    }

    get currentWorkPosition(): number[] {
        return this.$store.state.printer?.gcode_move?.gcode_position ?? [0, 0, 0, 0]
    }

    get currentWorkX(): number {
        return this.currentWorkPosition[0] ?? 0
    }

    get currentWorkY(): number {
        return this.currentWorkPosition[1] ?? 0
    }

    get currentWorkZ(): number {
        return this.currentWorkPosition[2] ?? 0
    }

    async refreshActiveWcs() {
        try {
            const wcs = await getCncWcs(this.$store.getters['socket/getUrl'])
            const active = typeof wcs?.active === 'string' ? wcs.active : 'G54'
            const index = this.offsetNames.indexOf(active)
            this.selectedOffsetIndex = index >= 0 ? index : 0
            if (wcs?.offsets && typeof wcs.offsets === 'object') {
                this.wcsOffsets = wcs.offsets as Record<string, Record<string, number>>
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load active WCS'
            this.$toast.error(message)
        }
    }

    async onWcsChange(idx: number | null) {
        if (idx === null) return

        const wcs = this.offsetNames[idx]
        if (!wcs) return

        try {
            await selectCncWcs(this.$store.getters['socket/getUrl'], { wcs })
            this.selectedOffsetIndex = idx
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to change work coordinate system'
            this.$toast.error(message)
        }
    }

    async setWorkZeroXY() {
        try {
            await setCncZero(this.$store.getters['socket/getUrl'], { axes: ['X', 'Y'] })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to set XY zero'
            this.$toast.error(message)
        }
    }

    async setWorkZeroZ() {
        try {
            await setCncZero(this.$store.getters['socket/getUrl'], { axes: ['Z'] })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to set Z zero'
            this.$toast.error(message)
        }
    }

    get wcsP(): number {
        return this.selectedOffsetIndex + 1
    }

    get wcsOriginOffsets(): Record<string, number> {
        return this.wcsOffsets[this.offsetNames[this.selectedOffsetIndex]] ?? { X: 0, Y: 0, Z: 0 }
    }

    get wcsOriginOffsetX(): number {
        return this.wcsOriginOffsets.X ?? 0
    }

    get wcsOriginOffsetY(): number {
        return this.wcsOriginOffsets.Y ?? 0
    }

    get wcsOriginOffsetZ(): number {
        return this.wcsOriginOffsets.Z ?? 0
    }

    applyOffsets() {
        const x = this.offsetInputX ?? 0
        const y = this.offsetInputY ?? 0
        const z = this.offsetInputZ ?? 0
        this.doSend(`G10 L20 P${this.wcsP} X${x} Y${y} Z${z}`)
        this.offsetInputX = 0
        this.offsetInputY = 0
        this.offsetInputZ = 0
    }

    resetOffsets() {
        this.doSend(`G10 L20 P${this.wcsP} X0 Y0 Z0`)
        this.offsetInputX = 0
        this.offsetInputY = 0
        this.offsetInputZ = 0
    }
}
</script>

<style scoped>
.tooltip-opaque {
    opacity: 1 !important;
}

/* Speed up tooltip fade transition (2x faster: 150ms instead of 300ms) */
.tooltip-opaque.v-tooltip__content {
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.6, 1) !important;
}
</style>
