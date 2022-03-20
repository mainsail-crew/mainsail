<style lang="scss" scoped>
.btnMinWidthAuto {
    min-width: auto !important;
}
.ml-05 {
    margin-left: 2px;
}
</style>

<template>
    <div>
        <v-row>
            <!-- DIRECTION BUTTONS -->
            <v-col :cols="homeCols">
                <v-row dense class="mb-1">
                    <v-col cols="3"></v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="!yAxisHomed || selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="moveY">
                            <v-icon>{{ mdiChevronUp }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3"></v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="!zAxisHomed || selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="moveZ">
                            <v-icon>{{ mdiChevronUp }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col cols="3" class="p-rel">
                        <v-btn
                            class="btnMinWidthAuto fill-width p-abs"
                            style="top: -50%; width: calc(100% - 8px)"
                            :disabled="!xAxisHomed || selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="moveX">
                            <v-icon>{{ mdiChevronLeft }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="!yAxisHomed || selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="moveY">
                            <v-icon>{{ mdiChevronDown }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3" class="p-rel">
                        <v-btn
                            class="btnMinWidthAuto fill-width p-abs"
                            style="top: -50%; width: calc(100% - 8px)"
                            :disabled="!xAxisHomed || selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="moveX">
                            <v-icon>{{ mdiChevronRight }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="!zAxisHomed || selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="moveZ">
                            <v-icon>{{ mdiChevronDown }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
            <!-- HOME / 5th ACTION BUTTONS -->
            <v-col :cols="homeCols" class="d-flex align-center">
                <div class="flex-grow-1" style="border-radius: 4px; overflow: hidden">
                    <v-row dense style="margin-bottom: -2px !important">
                        <v-col>
                            <v-btn
                                :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                                :loading="loadings.includes('homeAll')"
                                height="30"
                                tile
                                class="w-100"
                                @click="doHome">
                                <div class="d-flex align-center">
                                    <v-icon>{{ mdiHome }}</v-icon>
                                    <span class="ml-1">{{ $t('Panels.ToolheadControlPanel.ALL') }}</span>
                                </div>
                            </v-btn>
                        </v-col>
                        <v-col class="d-flex">
                            <v-btn
                                v-if="!existsQGL && !existsZtilt"
                                :color="homedAxes !== '' ? 'primary' : 'warning'"
                                height="30"
                                dense
                                tile
                                class="flex-grow-1 px-0"
                                @click="doSend('M84')">
                                <v-icon>{{ mdiEngineOff }}</v-icon>
                            </v-btn>
                            <v-btn
                                v-if="existsQGL"
                                :color="colorQuadGantryLevel"
                                :loading="loadings.includes('qgl')"
                                height="30"
                                dense
                                tile
                                class="btnMinWidthAuto flex-grow-1 px-0"
                                @click="doQGL">
                                {{ $t('Panels.ToolheadControlPanel.QGL') }}
                            </v-btn>
                            <v-btn
                                v-if="existsZtilt"
                                :loading="loadings.includes('zTilt')"
                                :color="colorZTilt"
                                height="30"
                                dense
                                tile
                                class="btnMinWidthAuto flex-grow-1 px-0"
                                @click="doZtilt">
                                {{ $t('Panels.ToolheadControlPanel.ZTilt') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row dense class="">
                        <v-col cols="4" class="flex-grow-1">
                            <v-btn
                                class="btnMinWidthAuto w-100"
                                tile
                                height="30"
                                :loading="loadings.includes('homeX')"
                                :color="homedAxes.includes('x') ? 'primary' : 'warning'"
                                @click="doHomeX">
                                {{ $t('Panels.ToolheadControlPanel.X') }}
                            </v-btn>
                        </v-col>
                        <v-col cols="4" class="flex-grow-1">
                            <v-btn
                                class="btnMinWidthAuto w-100"
                                tile
                                height="30"
                                :loading="loadings.includes('homeY')"
                                :color="homedAxes.includes('y') ? 'primary' : 'warning'"
                                @click="doHomeY">
                                {{ $t('Panels.ToolheadControlPanel.Y') }}
                            </v-btn>
                        </v-col>
                        <v-col cols="4" class="flex-grow-1">
                            <v-btn
                                class="btnMinWidthAuto w-100"
                                tile
                                height="30"
                                :loading="loadings.includes('homeZ')"
                                :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                                @click="doHomeZ">
                                {{ $t('Panels.ToolheadControlPanel.Z') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
        <!-- STEP SIZE BUTTON GROUP -->
        <v-row no-gutters class="mt-3">
            <v-col class="col-12">
                <v-btn-toggle
                    v-if="stepsReversed.length > 0"
                    :key="`all-steps-${stepsReversed.join('_')}`"
                    v-model="selectedCrossStep"
                    dense
                    mandatory
                    style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="step of stepsReversed"
                        :key="`step-${step}`"
                        dense
                        class="btnMinWidthAuto flex-grow-1 px-0"
                        style="height: 28px">
                        <span class="body-2">{{ step }}</span>
                    </v-btn>
                </v-btn-toggle>
                <div v-else class="font-weight-bold warning rounded pa-2">
                    {{ $t('Panels.ToolheadControlPanel.PleaseConfigureSteps') }}
                    <br />
                    <router-link style="color: white" to="/settings/interface">
                        {{ $t('Panels.ToolheadControlPanel.SettingsInterfaceControl') }}
                    </router-link>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiChevronUp, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiEngineOff, mdiHome } from '@mdi/js'

@Component
export default class CrossControl extends Mixins(BaseMixin, ControlMixin) {
    private homeCols = 6

    mdiChevronUp = mdiChevronUp
    mdiChevronLeft = mdiChevronLeft
    mdiChevronRight = mdiChevronRight
    mdiChevronDown = mdiChevronDown
    mdiEngineOff = mdiEngineOff
    mdiHome = mdiHome

    get selectedCrossStep() {
        return this.$store.state.gui.control.selectedCrossStep
    }

    set selectedCrossStep(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.selectedCrossStep', value: newVal })
    }

    get reverseX() {
        return this.$store.state.gui.control.reverseX
    }

    get reverseY() {
        return this.$store.state.gui.control.reverseY
    }

    get reverseZ() {
        return this.$store.state.gui.control.reverseZ
    }

    get stepsAll() {
        return this.$store.state.gui.control?.stepsAll ?? []
    }

    get stepsReversed() {
        return Array.from(new Set([...(this.stepsAll ?? [])])).sort((a, b) => a - b)
    }

    /**
     * Axes home states
     */
    get xAxisHomed(): boolean {
        return this.$store.state.printer.toolhead?.homed_axes.includes('x') ?? false
    }

    get yAxisHomed(): boolean {
        return this.$store.state.printer.toolhead?.homed_axes.includes('y') ?? false
    }

    get zAxisHomed(): boolean {
        return this.$store.state.printer.toolhead?.homed_axes.includes('z') ?? false
    }

    /**
     * Axes move commands
     */
    moveX() {
        const gcode = `X${this.reverseX ? '-' : '+'}${this.stepsReversed[this.selectedCrossStep]}`
        this.doSendMove(gcode, this.feedrateXY)
    }

    moveY() {
        const gcode = `Y${this.reverseY ? '-' : '+'}${this.stepsReversed[this.selectedCrossStep]}`
        this.doSendMove(gcode, this.feedrateXY)
    }

    moveZ() {
        const gcode = `Z${this.reverseZ ? '-' : '+'}${this.stepsReversed[this.selectedCrossStep]}`
        this.doSendMove(gcode, this.feedrateZ)
    }

    onResize() {
        this.homeCols = window.screen.width < 360 ? 12 : 6
    }

    created() {
        window.addEventListener('resize', this.onResize)
    }

    mounted() {
        if (window.screen.width < 330) {
            this.homeCols = 12
        }
    }

    destroyed() {
        window.removeEventListener('resize', this.onResize)
    }
}
</script>
