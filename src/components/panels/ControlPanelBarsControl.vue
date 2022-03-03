<style lang="scss" scoped>
.btnHomeAxis {
    width: 36px;
    min-width: 36px !important;
}

.btnMinWidthAuto {
    min-width: auto !important;
}
</style>

<template>
    <div>
        <v-row no-gutters>
            <v-col class="col-12 pb-0 text-center">
                <v-btn
                    small
                    :loading="loadings.includes('homeAll')"
                    :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                    @click="doHome">
                    <v-icon class="mr-1">{{ mdiHome }}</v-icon>
                    {{ $t('Panels.ControlPanel.ALL') }}
                </v-btn>
                <v-btn
                    v-if="existsQGL"
                    small
                    :loading="loadings.includes('qgl')"
                    :color="colorQuadGantryLevel"
                    class="ml-2"
                    @click="doQGL">
                    {{ $t('Panels.ControlPanel.QGL') }}
                </v-btn>
                <v-btn
                    v-if="existsZtilt"
                    small
                    :loading="loadings.includes('zTilt')"
                    :color="colorZTilt"
                    class="ml-2"
                    @click="doZtilt">
                    {{ $t('Panels.ControlPanel.ZTilt') }}
                </v-btn>
            </v-col>
        </v-row>
        <v-row no-gutters class="mt-2">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="steps of stepsXYsorted"
                        :key="'x-' + steps"
                        class="btnMinWidthAuto col"
                        @click="doSendMove('X-' + steps, feedrateXY)">
                        <span class="body-2">–{{ steps }}</span>
                    </v-btn>
                    <v-btn
                        :color="homedAxes.includes('x') ? 'primary' : 'warning'"
                        :loading="loadings.includes('homeX')"
                        class="font-weight-bold btnHomeAxis"
                        @click="doHomeX">
                        {{ $t('Panels.ControlPanel.X') }}
                    </v-btn>
                    <v-btn
                        v-for="steps of stepsXYsortedReverse"
                        :key="'x+' + steps"
                        class="btnMinWidthAuto col"
                        @click="doSendMove('X+' + steps, feedrateXY)">
                        <span class="body-2">+{{ steps }}</span>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="steps of stepsXYsorted"
                        :key="'y-' + steps"
                        class="btnMinWidthAuto col"
                        @click="doSendMove('Y-' + steps, feedrateXY)">
                        <span class="body-2">–{{ steps }}</span>
                    </v-btn>
                    <v-btn
                        :color="homedAxes.includes('y') ? 'primary' : 'warning'"
                        :loading="loadings.includes('homeY')"
                        class="font-weight-bold btnHomeAxis"
                        @click="doHomeY">
                        {{ $t('Panels.ControlPanel.Y') }}
                    </v-btn>
                    <v-btn
                        v-for="steps of stepsXYsortedReverse"
                        :key="'y+' + steps"
                        class="btnMinWidthAuto col"
                        @click="doSendMove('Y+' + steps, feedrateXY)">
                        <span class="body-2">+{{ steps }}</span>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="steps of stepsZsorted"
                        :key="'z-' + steps"
                        class="btnMinWidthAuto col"
                        @click="doSendMove('Z-' + steps, feedrateZ)">
                        <span class="body-2">–{{ steps }}</span>
                    </v-btn>
                    <v-btn
                        :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                        :loading="loadings.includes('homeZ')"
                        class="font-weight-bold btnHomeAxis"
                        @click="doHomeZ">
                        {{ $t('Panels.ControlPanel.Z') }}
                    </v-btn>
                    <v-btn
                        v-for="steps of stepsZsortedReverse"
                        :key="'z+' + steps"
                        class="btnMinWidthAuto col"
                        @click="doSendMove('Z+' + steps, feedrateZ)">
                        <span class="body-2">+{{ steps }}</span>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiHome } from '@mdi/js'
@Component
export default class ControlPanelBarsControl extends Mixins(BaseMixin, ControlMixin) {
    mdiHome = mdiHome

    get stepsXYsorted() {
        return [...this.$store.state.gui.control.stepsXY].sort(function (a, b) {
            return b - a
        })
    }

    get stepsXYsortedReverse() {
        return [...this.$store.state.gui.control.stepsXY].sort(function (a, b) {
            return a - b
        })
    }

    get stepsZsorted() {
        return [...this.$store.state.gui.control.stepsZ].sort(function (a, b) {
            return b - a
        })
    }

    get stepsZsortedReverse() {
        return [...this.$store.state.gui.control.stepsZ].sort(function (a, b) {
            return a - b
        })
    }
}
</script>
