<template>
    <panel v-if="klipperReadyForGui" :icon="mdiTable" title="Offsets" :collapsible="true" card-class="offsets-panel">
        <v-container class="py-2">
            <!-- Coordinate System Selector -->
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <span class="text-caption font-weight-bold">Coordinate System:</span>
                </v-col>
                <v-col cols="12">
                    <v-btn-toggle v-model="selectedOffsetIndex" dense small class="w-100">
                         <v-tooltip v-for="(offset, idx) in gcodeMoveOffsets" :key="idx" top content-class="tooltip-opaque">
                            <template #activator="{ on, attrs }">
                                <v-btn :value="idx" x-small v-bind="attrs" v-on="on">
                                    {{ offsetNames[idx] }}
                                </v-btn>
                            </template>
                            {{ offsetTooltips[idx] }}
                        </v-tooltip>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <!-- Current Offset Display -->
            <v-row dense class="mb-3">
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">X</div>
                    <div class="font-weight-bold">{{ currentOffsetX.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">Y</div>
                    <div class="font-weight-bold">{{ currentOffsetY.toFixed(3) }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                    <div class="text-caption text--secondary">Z</div>
                    <div class="font-weight-bold">{{ currentOffsetZ.toFixed(3) }}</div>
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

    get gcodeMoveOffsets(): number[][] {
        return this.$store.state.printer?.gcode_move?.homed_origin ?? [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    }

    get currentOffsetX(): number {
        return this.gcodeMoveOffsets[this.selectedOffsetIndex]?.[0] ?? 0
    }

    get currentOffsetY(): number {
        return this.gcodeMoveOffsets[this.selectedOffsetIndex]?.[1] ?? 0
    }

    get currentOffsetZ(): number {
        return this.gcodeMoveOffsets[this.selectedOffsetIndex]?.[2] ?? 0
    }

    get currentPosition(): number[] {
        return this.$store.state.printer?.gcode_move?.position ?? [0, 0, 0, 0]
    }

    setWorkZeroXY() {
        // G10 L2 Pn X0 Y0 - sets X and Y offset for coordinate system n to 0
        const offset = this.selectedOffsetIndex + 1 // G54=1, G55=2, etc.
        this.doSend(`G10 L2 P${offset} X0 Y0`)
    }

    setWorkZeroZ() {
        // G10 L2 Pn Z0 - sets Z offset for coordinate system n to 0
        const offset = this.selectedOffsetIndex + 1
        this.doSend(`G10 L2 P${offset} Z0`)
    }

    applyOffsets() {
        const offset = this.selectedOffsetIndex + 1
        const x = this.offsetInputX ?? 0
        const y = this.offsetInputY ?? 0
        const z = this.offsetInputZ ?? 0
        this.doSend(`G10 L2 P${offset} X${x} Y${y} Z${z}`)
        this.offsetInputX = 0
        this.offsetInputY = 0
        this.offsetInputZ = 0
    }

    resetOffsets() {
        const offset = this.selectedOffsetIndex + 1
        this.doSend(`G10 L2 P${offset} X0 Y0 Z0`)
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
</style>
