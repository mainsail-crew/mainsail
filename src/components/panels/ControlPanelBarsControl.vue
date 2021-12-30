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
            <v-col class="col-12  pb-0 text-center">
                <v-btn small @click="doHome" :loading="loadings.includes('homeAll')" :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"><v-icon class="mr-1">mdi-home</v-icon>{{ $t('Panels.ControlPanel.ALL') }}</v-btn>
                <v-btn small @click="doQGL" :loading="loadings.includes('qgl')" :color="colorQuadGantryLevel" class="ml-2" v-if="existsQGL">{{ $t('Panels.ControlPanel.QGL') }}</v-btn>
                <v-btn small @click="doZtilt" :loading="loadings.includes('zTilt')" :color="colorZTilt" class="ml-2" v-if="existsZtilt">{{ $t('Panels.ControlPanel.ZTilt') }}</v-btn>
            </v-col>
        </v-row>
        <v-row no-gutters class="mt-2">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('X-'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsorted" v-bind:key="'x-'+steps"><span class="body-2">–{{ steps }}</span></v-btn>
                    <v-btn @click="doHomeX" :color="homedAxes.includes('x') ? 'primary' : 'warning'" :loading="loadings.includes('homeX')" class="font-weight-bold btnHomeAxis">{{ $t('Panels.ControlPanel.X') }}</v-btn>
                    <v-btn @click="doSendMove('X+'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsortedReverse" v-bind:key="'x+'+steps"><span class="body-2">+{{ steps }}</span></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Y-'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsorted" v-bind:key="'y-'+steps"><span class="body-2">–{{ steps }}</span></v-btn>
                    <v-btn @click="doHomeY" :color="homedAxes.includes('y') ? 'primary' : 'warning'" :loading="loadings.includes('homeY')" class="font-weight-bold btnHomeAxis">{{ $t('Panels.ControlPanel.Y') }}</v-btn>
                    <v-btn @click="doSendMove('Y+'+steps, feedrateXY)" class="btnMinWidthAuto col" v-for="steps of stepsXYsortedReverse" v-bind:key="'y+'+steps"><span class="body-2">+{{ steps }}</span></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
            <v-col class="text-center">
                <v-btn-toggle dense no-gutters class="row no-gutters" style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="doSendMove('Z-'+steps, feedrateZ)" class="btnMinWidthAuto col" v-for="steps of stepsZsorted" v-bind:key="'z-'+steps"><span class="body-2">–{{ steps }}</span></v-btn>
                    <v-btn @click="doHomeZ" :color="homedAxes.includes('z') ? 'primary' : 'warning'" :loading="loadings.includes('homeZ')" class="font-weight-bold btnHomeAxis">{{ $t('Panels.ControlPanel.Z') }}</v-btn>
                    <v-btn @click="doSendMove('Z+'+steps, feedrateZ)" class="btnMinWidthAuto col" v-for="steps of stepsZsortedReverse" v-bind:key="'z+'+steps"><span class="body-2">+{{ steps }}</span></v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ControlMixin from '@/components/mixins/control'
@Component
export default class ControlPanelBarsControl extends Mixins(BaseMixin, ControlMixin) {
    get stepsXYsorted() {
        return [...this.$store.state.gui.control.stepsXY].sort(function(a, b) { return b-a })
    }

    get stepsXYsortedReverse() {
        return [...this.$store.state.gui.control.stepsXY].sort(function(a, b) { return a-b })
    }

    get stepsZsorted() {
        return [...this.$store.state.gui.control.stepsZ].sort(function(a, b) { return b-a })
    }

    get stepsZsortedReverse() {
        return [...this.$store.state.gui.control.stepsZ].sort(function(a, b) { return a-b })
    }
}
</script>
