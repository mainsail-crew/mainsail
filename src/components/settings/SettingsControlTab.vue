<style scoped>

</style>

<template>
    <v-form ref="formControlExtruder">
        <v-card flat class="theme-settings theme-control-tab-settings">
            <v-card-text>
                <settings-row :title="$t('Settings.ControlTab.EnableCross')" :dynamicSlotWidth="true">
                    <v-switch v-model="useCross" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <template v-if="useCross">
                    <settings-row :title="$t('Settings.ControlTab.InvertXMovement')" :dynamicSlotWidth="true">
                        <v-switch v-model="reverseX" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ControlTab.InvertYMovement')" :dynamicSlotWidth="true">
                        <v-switch v-model="reverseY" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ControlTab.InvertZMovement')" :dynamicSlotWidth="true">
                        <v-switch v-model="reverseZ" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                </template>
                <settings-row :title="$t('Settings.ControlTab.SpeedXY')">
                    <v-text-field
                        v-model="feedrateXY"
                        @blur="blurFeedrateXY"
                        type="number"
                        suffix="mm/s"
                        hide-details="auto"
                        :rules="[v => v > 0 || 'Minimum speed is 1']"
                        outlined
                        dense
                    ></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ControlTab.SpeedZ')">
                    <v-text-field
                        v-model="feedrateZ"
                        @blur="blurFeedrateZ"
                        type="number"
                        suffix="mm/s"
                        hide-details="auto"
                        :rules="[v => v > 0 || 'Minimum speed is 1']"
                        outlined
                        dense
                    ></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <template v-if="useCross">
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsAll"
                            hide-selected
                            hide-details
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                v => v.length > 0 || 'Minimum 1 value',
                                v => v.length < 9 || 'For narrow screens it is recommended to enter max. 3 values.',
                            ]"
                            dense
                            outlined
                        ></v-combobox>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                </template>
                <template v-else>
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsXY"
                            hide-selected
                            hide-details
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                v => v.length > 0 || 'Minimum 1 value',
                                v => v.length < 9 || 'For narrow screens it is recommended to enter max. 3 values.',
                            ]"
                            dense
                            outlined
                        ></v-combobox>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsZ"
                            hide-selected
                            hide-details
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                v => v.length > 0 || 'Minimum 1 value',
                                v => v.length < 9 || 'For narrow screens it is recommended to enter max. 3 values.',
                            ]"
                            dense
                            outlined
                        ></v-combobox>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                </template>
                <settings-row :title="$t('Settings.ControlTab.MoveDistancesEInMm')" :mobile-second-row="true">
                    <v-combobox
                        v-model="feedamountsE"
                        hide-selected
                        hide-details="auto"
                        multiple
                        small-chips
                        :deletable-chips="true"
                        append-icon=""
                        type="number"
                        :rules="[
                            v => v.length > 0 || 'Minimum 1 value',
                            v => v.length < 6 || 'For narrow screens it is recommended to enter max. 5 values.',
                        ]"
                        dense
                        outlined
                    ></v-combobox>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ControlTab.SpeedEInMms')" :mobile-second-row="true">
                    <v-combobox
                        v-model="feedratesE"
                        hide-selected
                        hide-details="auto"
                        multiple
                        small-chips
                        :deletable-chips="true"
                        append-icon=""
                        type="number"
                        :rules="[
                            v => v.length > 0 || 'Minimum 1 value',
                            v => v.length < 6 || 'For narrow screens it is recommended to enter max. 5 values.',
                        ]"
                        dense
                        outlined
                    ></v-combobox>
                </settings-row>
            </v-card-text>
        </v-card>
    </v-form>
</template>

<script lang="ts">

import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from "@/components/settings/SettingsRow.vue";
@Component({
    components: {SettingsRow}
})
export default class SettingsControlTab extends Mixins(BaseMixin) {

    $refs!: {
        formControlExtruder: HTMLFormElement
    }

    get useCross() {
        return this.$store.state.gui.dashboard.control.useCross;
    }

    set useCross(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.useCross', value: newVal })
    }

    get reverseX() {
        return this.$store.state.gui.dashboard.control.reverseX
    }

    set reverseX(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.reverseX', value: newVal })
    }

    get reverseY() {
        return this.$store.state.gui.dashboard.control.reverseY
    }

    set reverseY(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.reverseY', value: newVal })
    }

    get reverseZ() {
        return this.$store.state.gui.dashboard.control.reverseZ
    }

    set reverseZ(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.reverseZ', value: newVal })
    }

    get feedrateXY() {
        return this.$store.state.gui.dashboard.control.feedrateXY
    }

    set feedrateXY(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.feedrateXY', value: newVal })
    }

    get feedrateZ() {
        return this.$store.state.gui.dashboard.control.feedrateZ
    }

    set feedrateZ(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.feedrateZ', value: newVal })
    }

    get stepsAll() {
        const steps = this.$store.state.gui.dashboard.control.stepsAll
        return (steps ?? []).sort(function (a: number,b: number) { return b-a })
    }

    set stepsAll(newVal) {
        const absSteps = []
        for(const value of newVal) absSteps.push(Math.abs(value))

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.stepsAll', value: absSteps })
    }

    get stepsXY() {
        const steps = this.$store.state.gui.dashboard.control.stepsXY
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set stepsXY(steps) {
        const absSteps = []
        for(const value of steps) absSteps.push(Math.abs(value))

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.stepsXY', value: absSteps })
    }

    get stepsZ() {
        const steps = this.$store.state.gui.dashboard.control.stepsZ
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set stepsZ(steps) {
        const absSteps = []
        for(const value of steps) absSteps.push(Math.abs(value))

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.control.stepsZ', value: absSteps })
    }

    get feedamountsE() {
        const steps = this.$store.state.gui.dashboard.extruder.feedamounts
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set feedamountsE(amounts) {
        const absAmounts = []
        for(const value of amounts) absAmounts.push(Math.abs(value))

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.extruder.feedamounts', value: absAmounts })
    }

    get feedratesE() {
        const steps = this.$store.state.gui.dashboard.extruder.feedrates
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set feedratesE(rates) {
        const absRates = []
        for(const value of rates) absRates.push(Math.abs(value))

        this.$store.dispatch('gui/saveSetting', { name: 'dashboard.extruder.feedrates', value: absRates })
    }

    blurFeedrateXY() {
        if (!(this.feedrateXY > 0)) this.feedrateXY = 100
    }

    blurFeedrateZ() {
        if (!(this.feedrateZ > 0)) this.feedrateZ = 25
    }

    mounted() {
        this.$refs.formControlExtruder.validate()
    }
}
</script>
