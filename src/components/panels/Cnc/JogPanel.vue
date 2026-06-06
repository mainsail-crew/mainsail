<template>
    <panel v-if="klipperReadyForGui" :icon="mdiGamepad" title="Jog" :collapsible="true" card-class="jog-panel">
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

            <!-- XY and Z Jog Controls Container -->
            <v-row dense class="mb-2 justify-center">
                <!-- XY Jog Controls -->
                <v-col cols="12" md="8" class="d-flex flex-column align-center">
                    <div class="text-center mb-3 w-100">
                        <span class="text-caption font-weight-bold">XY Jog ({{ currentStep }} mm)</span>
                    </div>
                    <div class="jog-panel__xy-pad">
                        <!-- Up -->
                        <v-btn
                            class="jog-panel__xy-btn"
                            large
                            :disabled="['printing'].includes(printer_state)"
                            @click="jog('Y', currentStep)">
                            <v-icon>{{ mdiChevronUp }}</v-icon>
                        </v-btn>
                        <!-- Left -->
                        <v-btn
                            class="jog-panel__xy-btn"
                            large
                            :disabled="['printing'].includes(printer_state)"
                            @click="jog('X', -currentStep)">
                            <v-icon>{{ mdiChevronLeft }}</v-icon>
                        </v-btn>
                        <!-- Center (Stop) -->
                        <v-btn
                            class="jog-panel__xy-btn jog-panel__xy-center"
                            large
                            outlined
                            :disabled="['printing'].includes(printer_state)"
                            @click="jogStop">
                            <v-icon>{{ mdiStop }}</v-icon>
                        </v-btn>
                        <!-- Right -->
                        <v-btn
                            class="jog-panel__xy-btn"
                            large
                            :disabled="['printing'].includes(printer_state)"
                            @click="jog('X', currentStep)">
                            <v-icon>{{ mdiChevronRight }}</v-icon>
                        </v-btn>
                        <!-- Down -->
                        <v-btn
                            class="jog-panel__xy-btn"
                            large
                            :disabled="['printing'].includes(printer_state)"
                            @click="jog('Y', -currentStep)">
                            <v-icon>{{ mdiChevronDown }}</v-icon>
                        </v-btn>
                    </div>
                </v-col>

                <!-- Z Jog Controls -->
                <v-col cols="12" md="4" class="d-flex flex-column justify-center">
                    <div class="text-center mb-3">
                        <span class="text-caption font-weight-bold">Z Jog</span>
                    </div>
                    <v-btn
                        block
                        large
                        :disabled="['printing'].includes(printer_state)"
                        class="jog-panel__jog-btn mb-2"
                        @click="jog('Z', currentStep)">
                        <v-icon>{{ mdiChevronUp }}</v-icon>
                        <span class="ml-2">+{{ currentStep }}</span>
                    </v-btn>
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

            <!-- Keyboard navigation toggle -->
            <v-row dense class="my-2">
                <v-col cols="12">
                    <v-btn
                        small
                        block
                        :color="keyboardNavEnabled ? 'primary' : ''"
                        :outlined="!keyboardNavEnabled"
                        @click="toggleKeyboardNav">
                        <v-icon small left>{{ mdiKeyboard }}</v-icon>
                        Keyboard Nav {{ keyboardNavEnabled ? '(ON)' : '(OFF)' }}
                    </v-btn>
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
    mdiGamepad,
    mdiHome,
    mdiChevronUp,
    mdiChevronDown,
    mdiChevronLeft,
    mdiChevronRight,
    mdiStop,
    mdiKeyboard,
} from '@mdi/js'

@Component({
    components: {
        Panel,
    },
    data() {
        return {
            selectedStepIndex: 2,
            continuousJog: false,
            keyboardNavEnabled: false,
        }
    },
})
export default class JogPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiGamepad = mdiGamepad
    mdiHome = mdiHome
    mdiChevronUp = mdiChevronUp
    mdiChevronDown = mdiChevronDown
    mdiChevronLeft = mdiChevronLeft
    mdiChevronRight = mdiChevronRight
    mdiStop = mdiStop
    mdiKeyboard = mdiKeyboard

    // Jog step presets (in mm)
    jogSteps = [1.0, 5.0, 10.0, 25.0, 0.1]

    mounted() {
        // Bind handler to preserve 'this' context
        this._keyboardJogHandler = this.handleKeyboardJog.bind(this)
        document.addEventListener('keydown', this._keyboardJogHandler, true)
    }

    beforeDestroy() {
        if (this._keyboardJogHandler) {
            document.removeEventListener('keydown', this._keyboardJogHandler, true)
        }
    }

    handleKeyboardJog(event: KeyboardEvent) {
        // Prevent default for arrow keys immediately
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault()
        }
        
        console.log('🎮 handleKeyboardJog:', event.key, 'enabled=', this.keyboardNavEnabled)
        
        if (!this.keyboardNavEnabled || ['printing'].includes(this.printer_state)) {
            console.log('  → skipped')
            return
        }
        
        // Skip if the event target is an input, textarea, or select element
        const target = event.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return
        
        const step = this.currentStep
        
        switch (event.key) {
            case 'ArrowUp':
                this.jog('Y', step)
                break
            case 'ArrowDown':
                this.jog('Y', -step)
                break
            case 'ArrowLeft':
                this.jog('X', -step)
                break
            case 'ArrowRight':
                this.jog('X', step)
                break
            default:
                return
        }
    }

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
            this.doSendMove(`${axis}${distance > 0 ? '+' : ''}${distance}`, this.getAxisFeedrate(axis))
        } else {
            // Single step jog
            this.doSendMove(`${axis}${distance > 0 ? '+' : ''}${distance}`, this.getAxisFeedrate(axis))
        }
    }

    toggleKeyboardNav() {
        this.keyboardNavEnabled = !this.keyboardNavEnabled
        console.log('Keyboard nav toggled:', this.keyboardNavEnabled)
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

/* Position buttons in proper numpad layout */
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

.jog-panel__z-row {
    gap: 8px;
}
</style>
