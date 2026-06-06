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

            <!-- Current Work Position Display -->
            <v-row dense class="mb-3">
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
        }
    }

    get currentWorkPosition(): number[] {
        // Work position in the currently active WCS. Klipper exposes this as
        // `gcode_position` and reflects any G92 offset applied. Per-WCS origin
        // offsets (G54_origin .. G59_origin) are not queryable in standard
        // Klipper builds, and this build has no G10 support, so we display the
        // single active work position rather than 6 separate origins.
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

    onWcsChange(idx: number | null) {
        if (idx === null) return
        // Send a modal G54..G59 so any gcode file run in this session that
        // uses the same WCS sees a consistent active system. Klipper accepts
        // these commands but does not currently report the active WCS back
        // via gcode_move.gcode_system, so the selector's "active" state is
        // maintained locally.
        this.selectedOffsetIndex = idx
        this.doSend(`G${54 + idx}`)
    }

    setWorkZeroXY() {
        // G92 X0 Y0 — set the work position counter to 0 on X and Y at the
        // current machine location. Affects the currently active WCS. (Klipper
        // does not support G10, which would be the GRBL/LinuxCNC equivalent.)
        this.doSend('G92 X0 Y0')
    }

    setWorkZeroZ() {
        this.doSend('G92 Z0')
    }

    applyOffsets() {
        const x = this.offsetInputX ?? 0
        const y = this.offsetInputY ?? 0
        const z = this.offsetInputZ ?? 0
        this.doSend(`G92 X${x} Y${y} Z${z}`)
        this.offsetInputX = 0
        this.offsetInputY = 0
        this.offsetInputZ = 0
    }

    resetOffsets() {
        this.doSend('G92 X0 Y0 Z0')
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
