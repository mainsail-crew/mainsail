<template>
    <panel v-if="klipperReadyForGui" :icon="mdiGamepad2" title="Jog" :collapsible="true" card-class="jog-panel">
        <!-- Homing and utility buttons -->
        <v-container class="py-2">
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <v-btn
                        small
                        block
                        :disabled="['printing'].includes(printer_state)"
                        :loading="loadings.includes('homeAll')"
                        :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                        @click="doHome">
                        <v-icon left class="mr-1">{{ mdiHome }}</v-icon>
                        Home All
                    </v-btn>
                </v-col>
                <v-col v-if="enableXYHoming" cols="6">
                    <v-btn
                        small
                        block
                        :disabled="['printing'].includes(printer_state)"
                        :loading="loadings.includes('homeXY')"
                        :color="homedAxes.includes('xy') ? 'primary' : 'warning'"
                        @click="doHomeXY">
                        <v-icon left small>{{ mdiHome }}</v-icon>
                        Home XY
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn
                        small
                        block
                        :disabled="['printing'].includes(printer_state)"
                        :loading="loadings.includes('homeZ')"
                        :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                        @click="doHomeZ">
                        <v-icon left small>{{ mdiHome }}</v-icon>
                        Home Z
                    </v-btn>
                </v-col>
            </v-row>

            <!-- Jog step size selector -->
            <v-row dense class="mb-3">
                <v-col cols="12" class="d-flex align-center">
                    <span class="text-caption mr-2">Jog Step:</span>
                    <v-btn-toggle v-model="selectedStepIndex" dense small class="flex-grow-1">
                        <v-btn v-for="(step, idx) in jogSteps" :key="idx" :value="idx" x-small>
                            {{ formatStep(step) }}
                        </v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <!-- Feedrate controls -->
            <v-row dense class="mb-3">
                <v-col cols="6">
                    <v-text-field
                        v-model.number="feedrateXY"
                        label="XY Feed"
                        type="number"
                        :min="1"
                        :max="1000"
                        dense
                        outlined
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
                        dense
                        outlined
                        suffix="mm/min"
                        @change="saveFeedrates" />
                </v-col>
            </v-row>

            <!-- XY Jog Controls -->
            <v-row dense class="jog-panel__xy-grid mb-4">
                <v-col cols="12" class="text-center mb-2">
                    <span class="text-caption font-weight-bold">XY Jog ({{ currentStep }} mm)</span>
                </v-col>

                <!-- Top row: Y+ -->
                <v-col cols="4" offset="4" class="text-center">
                    <v-btn
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn"
                        @click="jog('Y', currentStep)">
                        <v-icon>{{ mdiChevronUp }}</v-icon>
                    </v-btn>
                </v-col>

                <!-- Middle row: X-, center, X+ -->
                <v-col cols="4" class="text-center">
                    <v-btn
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn"
                        @click="jog('X', -currentStep)">
                        <v-icon>{{ mdiChevronLeft }}</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="4" class="text-center">
                    <v-btn
                        large
                        :disabled="['printing'].includes(printer_state)"
                        outlined
                        class="jog-panel__center-btn"
                        @click="jogStop">
                        <v-icon>{{ mdiStop }}</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="4" class="text-center">
                    <v-btn
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn"
                        @click="jog('X', currentStep)">
                        <v-icon>{{ mdiChevronRight }}</v-icon>
                    </v-btn>
                </v-col>

                <!-- Bottom row: Y- -->
                <v-col cols="4" offset="4" class="text-center">
                    <v-btn
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn"
                        @click="jog('Y', -currentStep)">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <!-- Z Jog Controls -->
            <v-row dense class="jog-panel__z-row mb-2">
                <v-col cols="12" class="text-center mb-2">
                    <span class="text-caption font-weight-bold">Z Jog</span>
                </v-col>
                <v-col cols="6">
                    <v-btn
                        block
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn"
                        @click="jog('Z', currentStep)">
                        <v-icon>{{ mdiChevronUp }}</v-icon>
                        <span class="ml-2">+{{ currentStep }}</span>
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn
                        block
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn"
                        @click="jog('Z', -currentStep)">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                        <span class="ml-2">-{{ currentStep }}</span>
                    </v-btn>
                </v-col>
            </v-row>

            <!-- Continuous jog mode toggle (optional) -->
            <v-row dense>
                <v-col cols="12">
                    <v-checkbox
                        v-model="continuousJog"
                        label="Continuous Jog (hold button)"
                        dense
                        hide-details />
                </v-col>
            </v-row>

            <!-- Status indicators -->
            <v-divider class="my-3" />
            <v-row dense>
                <v-col cols="6">
                    <span class="text-caption text--secondary">Status:</span>
                    <v-chip small :color="['printing'].includes(printer_state) ? 'warning' : 'primary'">
                        {{ printer_state }}
                    </v-chip>
                </v-col>
                <v-col cols="6" class="text-right">
                    <span class="text-caption text--secondary">Homed:</span>
                    <v-chip small :color="allAxesHomed ? 'primary' : 'warning'">
                        {{ homedAxesDisplay }}
                    </v-chip>
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
    mdiGamepad2,
    mdiHome,
    mdiChevronUp,
    mdiChevronDown,
    mdiChevronLeft,
    mdiChevronRight,
    mdiStop,
} from '@mdi/js'

@Component({
    components: {
        Panel,
    },
})
export default class JogPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiGamepad2 = mdiGamepad2
    mdiHome = mdiHome
    mdiChevronUp = mdiChevronUp
    mdiChevronDown = mdiChevronDown
    mdiChevronLeft = mdiChevronLeft
    mdiChevronRight = mdiChevronRight
    mdiStop = mdiStop

    selectedStepIndex = 0
    continuousJog = false

    // Jog step presets (in mm)
    jogSteps = [0.1, 0.5, 1.0, 5.0, 10.0, 25.0]

    get currentStep(): number {
        return this.jogSteps[this.selectedStepIndex]
    }

    get homedAxesDisplay(): string {
        if (this.homedAxes === 'xyz') {
            return 'All'
        }
        return this.homedAxes || 'None'
    }

    get allAxesHomed(): boolean {
        return this.homedAxes.includes('x') && this.homedAxes.includes('y') && this.homedAxes.includes('z')
    }

    get enableXYHoming(): boolean {
        return this.$store.state.gui.control.enableXYHoming
    }

    get loadings(): string[] {
        return this.$store.state.server.loadings ?? []
    }

    get printer_state(): string {
        return this.$store.state.printer?.print_stats?.state ?? 'unknown'
    }

    get klipperReadyForGui(): boolean {
        return this.$store.getters['server/klipperReadyForGui']
    }

    saveFeedrates() {
        this.$store.dispatch('gui/updateSettings', {
            control: {
                feedrateXY: this.feedrateXY,
                feedrateZ: this.feedrateZ,
            },
        })
    }

    formatStep(step: number): string {
        if (step < 1) {
            return `${(step * 1000).toFixed(0)}µm`
        }
        return `${step}mm`
    }

    jog(axis: string, distance: number) {
        if (this.continuousJog) {
            // For continuous jog, emit a command and let go-to-zero handle it
            this.doSendMove(`${axis}${distance > 0 ? '+' : ''}${Math.abs(distance)}`, this.getAxisFeedrate(axis))
        } else {
            // Single step jog
            this.doSendMove(`${axis}${distance > 0 ? '+' : ''}${Math.abs(distance)}`, this.getAxisFeedrate(axis))
        }
    }

    jogStop() {
        this.doSend('M112')
    }

    getAxisFeedrate(axis: string): number {
        if (axis === 'Z') {
            return this.feedrateZ
        }
        return this.feedrateXY
    }
}
</script>

<style scoped>
.jog-panel__xy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
}

.jog-panel__jog-btn {
    aspect-ratio: 1 / 1;
    min-width: 60px !important;
}

.jog-panel__center-btn {
    aspect-ratio: 1 / 1;
    min-width: 60px !important;
}

.jog-panel__z-row {
    gap: 8px;
}
</style>
