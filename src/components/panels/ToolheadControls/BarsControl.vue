<style lang="scss" scoped>
.btnHomeAxis {
    width: 36px;
    min-width: 36px !important;
}

.btnGroup {
    height: 28px !important;
}

.btnMinWidthAuto {
    min-width: auto !important;
}
</style>

<template>
    <div>
        <!-- HOME ALL / ACTION BUTTON -->
        <v-row no-gutters>
            <v-col class="col-12 pb-0 text-center">
                <v-btn
                    small
                    :disabled="['printing'].includes(printer_state)"
                    :loading="loadings.includes('homeAll')"
                    :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                    @click="doHome">
                    <v-icon class="mr-1">{{ mdiHome }}</v-icon>
                    {{ $t('Panels.ToolheadControlPanel.ALL') }}
                </v-btn>
                <v-btn
                    v-if="enableXYHoming"
                    :disabled="['printing'].includes(printer_state)"
                    :loading="loadings.includes('homeAll')"
                    :color="homedAxes.includes('xy') ? 'primary' : 'warning'"
                    small
                    class="ml-2"
                    @click="doHomeXY">
                    <v-icon class="mr-1">{{ mdiHome }}</v-icon>
                    XY
                </v-btn>
                <v-btn
                    v-if="existsQGL"
                    :disabled="['printing'].includes(printer_state)"
                    small
                    :loading="loadings.includes('qgl')"
                    :color="colorQuadGantryLevel"
                    class="ml-2"
                    @click="doQGL">
                    {{ $t('Panels.ToolheadControlPanel.QGL') }}
                </v-btn>
                <v-btn
                    v-if="existsZtilt"
                    :disabled="['printing'].includes(printer_state)"
                    small
                    :loading="loadings.includes('zTilt')"
                    :color="colorZTilt"
                    class="ml-2"
                    @click="doZtilt">
                    {{ $t('Panels.ToolheadControlPanel.ZTilt') }}
                </v-btn>
                <v-btn
                    small
                    :disabled="['printing'].includes(printer_state)"
                    :color="homedAxes !== '' ? 'primary' : 'warning'"
                    class="ml-2"
                    @click="doSend('M84')">
                    <v-icon>{{ mdiEngineOff }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <!-- X MOVEMENT BUTTONGROUPS -->
        <v-row no-gutters class="mt-2">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="steps of stepsXYsorted"
                        :key="'x-' + steps"
                        :disabled="['printing'].includes(printer_state)"
                        class="btnMinWidthAuto col btnGroup"
                        @click="doSendMove('X-' + steps, feedrateXY)">
                        <span class="body-2">–{{ steps }}</span>
                    </v-btn>
                    <v-btn
                        :disabled="['printing'].includes(printer_state)"
                        :color="homedAxes.includes('x') ? 'primary' : 'warning'"
                        :loading="loadings.includes('homeX')"
                        class="font-weight-bold btnHomeAxis btnGroup"
                        @click="doHomeX">
                        X
                    </v-btn>
                    <v-btn
                        v-for="steps of stepsXYsortedReverse"
                        :key="'x+' + steps"
                        :disabled="['printing'].includes(printer_state)"
                        class="btnMinWidthAuto col btnGroup"
                        @click="doSendMove('X+' + steps, feedrateXY)">
                        <span class="body-2">+{{ steps }}</span>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <!-- Y MOVEMENT BUTTONGROUPS -->
        <v-row no-gutters class="mt-3">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="steps of stepsXYsorted"
                        :key="'y-' + steps"
                        :disabled="['printing'].includes(printer_state)"
                        class="btnMinWidthAuto col btnGroup"
                        @click="doSendMove('Y-' + steps, feedrateXY)">
                        <span class="body-2">–{{ steps }}</span>
                    </v-btn>
                    <v-btn
                        :disabled="['printing'].includes(printer_state)"
                        :color="homedAxes.includes('y') ? 'primary' : 'warning'"
                        :loading="loadings.includes('homeY')"
                        class="font-weight-bold btnHomeAxis btnGroup"
                        @click="doHomeY">
                        Y
                    </v-btn>
                    <v-btn
                        v-for="steps of stepsXYsortedReverse"
                        :key="'y+' + steps"
                        :disabled="['printing'].includes(printer_state)"
                        class="btnMinWidthAuto col btnGroup"
                        @click="doSendMove('Y+' + steps, feedrateXY)">
                        <span class="body-2">+{{ steps }}</span>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <!-- Z MOVEMENT BUTTONGROUPS -->
        <v-row no-gutters class="mt-3">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%">
                    <v-btn
                        v-for="steps of stepsZsorted"
                        :key="'z-' + steps"
                        :disabled="['printing'].includes(printer_state)"
                        class="btnMinWidthAuto col btnGroup"
                        @click="doSendMove('Z-' + steps, feedrateZ)">
                        <span class="body-2">–{{ steps }}</span>
                    </v-btn>
                    <v-btn
                        :disabled="['printing'].includes(printer_state)"
                        :color="homedAxes.includes('z') ? 'primary' : 'warning'"
                        :loading="loadings.includes('homeZ')"
                        class="font-weight-bold btnHomeAxis btnGroup"
                        @click="doHomeZ">
                        Z
                    </v-btn>
                    <v-btn
                        v-for="steps of stepsZsortedReverse"
                        :key="'z+' + steps"
                        :disabled="['printing'].includes(printer_state)"
                        class="btnMinWidthAuto col btnGroup"
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
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiEngineOff, mdiHome } from '@mdi/js'

@Component
export default class BarsControl extends Mixins(BaseMixin, ControlMixin) {
    mdiEngineOff = mdiEngineOff
    mdiHome = mdiHome

    get enableXYHoming(): boolean {
        return this.$store.state.gui.control.enableXYHoming
    }

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
