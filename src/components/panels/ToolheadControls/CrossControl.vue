<style lang="scss" scoped>
.btnMinWidthAuto {
    min-width: auto !important;
}
</style>

<template>
    <div>
        <v-row>
            <v-col :cols="homeCols">
                <v-row dense class="mb-1">
                    <v-col cols="3"></v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="
                                doSendMove('Y' + (reverseY ? '-' : '+') + stepsReversed[selectedCrossStep], feedrateXY)
                            ">
                            <v-icon>{{ mdiChevronUp }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3"></v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="
                                doSendMove('Z' + (reverseZ ? '-' : '+') + stepsReversed[selectedCrossStep], feedrateZ)
                            ">
                            <v-icon>{{ mdiChevronUp }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col cols="3" class="p-rel">
                        <v-btn
                            class="btnMinWidthAuto fill-width p-abs"
                            style="top: -50%; width: calc(100% - 8px)"
                            :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="
                                doSendMove('X' + (!reverseX ? '-' : '+') + stepsReversed[selectedCrossStep], feedrateXY)
                            ">
                            <v-icon>{{ mdiChevronLeft }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="
                                doSendMove('Y' + (!reverseY ? '-' : '+') + stepsReversed[selectedCrossStep], feedrateXY)
                            ">
                            <v-icon>{{ mdiChevronDown }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3" class="p-rel">
                        <v-btn
                            class="btnMinWidthAuto fill-width p-abs"
                            style="top: -50%; width: calc(100% - 8px)"
                            :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="
                                doSendMove('X' + (reverseX ? '-' : '+') + stepsReversed[selectedCrossStep], feedrateXY)
                            ">
                            <v-icon>{{ mdiChevronRight }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="3">
                        <v-btn
                            class="btnMinWidthAuto fill-width"
                            :disabled="selectedCrossStep === null || selectedCrossStep === undefined"
                            @click="
                                doSendMove('Z' + (!reverseZ ? '-' : '+') + stepsReversed[selectedCrossStep], feedrateZ)
                            ">
                            <v-icon>{{ mdiChevronDown }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
            <v-col :cols="homeCols" class="d-flex align-center">
                <div class="flex-grow-1" style="border-radius: 4px; overflow: hidden">
                    <v-row dense class="" style="margin-bottom: -2px !important">
                        <v-col :cols="existsQGL || existsZtilt ? 6 : 12">
                            <v-btn
                                class="w-100"
                                tile
                                height="30"
                                :loading="loadings.includes('homeAll')"
                                :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                                @click="doHome">
                                <div class="d-flex align-center">
                                    <v-icon>{{ mdiHome }}</v-icon>
                                    <span class="ml-1">{{ $t('Panels.ToolheadControlPanel.ALL') }}</span>
                                </div>
                            </v-btn>
                        </v-col>
                        <v-col v-if="existsQGL || existsZtilt" cols="6" class="d-flex">
                            <v-btn
                                v-if="existsQGL"
                                class="btnMinWidthAuto flex-grow-1 px-0"
                                tile
                                dense
                                :color="colorQuadGantryLevel"
                                height="30"
                                :loading="loadings.includes('qgl')"
                                @click="doQGL">
                                {{ $t('Panels.ToolheadControlPanel.QGL') }}
                            </v-btn>
                            <v-btn
                                v-if="existsZtilt"
                                class="btnMinWidthAuto flex-grow-1 px-0"
                                tile
                                dense
                                :color="colorZTilt"
                                height="30"
                                :loading="loadings.includes('zTilt')"
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
        <v-row no-gutters class="mt-3">
            <v-col class="col-12">
                <v-btn-toggle
                    v-if="stepsReversed.length > 0"
                    :key="`all-steps-${stepsReversed.join('_')}`"
                    v-model="selectedCrossStep"
                    dense
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
import { mdiChevronUp, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiHome } from '@mdi/js'

@Component
export default class CrossControl extends Mixins(BaseMixin, ControlMixin) {
    private homeCols = 6

    mdiChevronUp = mdiChevronUp
    mdiChevronLeft = mdiChevronLeft
    mdiChevronRight = mdiChevronRight
    mdiChevronDown = mdiChevronDown
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
