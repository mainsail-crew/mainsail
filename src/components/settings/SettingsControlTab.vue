<style scoped>

</style>

<template>
    <div>
        <v-card flat>
            <v-card-text>
                <v-form ref="formControlExtruder">
                    <settings-row :title="$t('Settings.ControlTab.Style')">
                        <v-select v-model="controlStyle" :items="controlStyles" outlined dense hide-details attach></v-select>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <template v-if="['circle', 'cross'].includes(controlStyle)">
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
                            :rules="[v => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', {value: '0'})]"
                            outlined
                            dense
                            hide-spin-buttons
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
                            :rules="[v => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', {value: '0'})]"
                            outlined
                            dense
                            hide-spin-buttons
                        ></v-text-field>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <template v-if="controlStyle === 'cross'">
                        <settings-row :title="$t('Settings.ControlTab.MoveDistancesInMm')" :mobile-second-row="true">
                            <v-combobox
                                v-model="stepsAll"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 9 || $t('Settings.ControlTab.MaximumValuesVisibility', {maximum: '9'}),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons
                            ></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <template v-else-if="controlStyle === 'circle'">
                        <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                            <v-combobox
                                v-model="stepsCircleXY"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', {maximum: '4'}),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons
                            ></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                        <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                            <v-combobox
                                v-model="stepsCircleZ"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', {maximum: '4'}),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons
                            ></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <template v-else>
                        <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                            <v-combobox
                                v-model="stepsXY"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 3 || $t('Settings.ControlTab.MaximumValuesVisibility', {maximum: '3'}),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons
                            ></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                        <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                            <v-combobox
                                v-model="stepsZ"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 3 || $t('Settings.ControlTab.MaximumValuesVisibility', {maximum: '3'}),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons
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
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 5 || $t('Settings.ControlTab.MaximumValuesVisibility', {maximum: '5'}),
                                ]"
                            dense
                            outlined
                            hide-spin-buttons
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
                                    v => v.length > 0 || $t('Settings.ControlTab.MinimumValues', {minimum: '1'}),
                                    v => v.length <= 5 || $t('Settings.ControlTab.MaximumValuesVisibility', {maximum: '5'}),
                                ]"
                            dense
                            outlined
                            hide-spin-buttons
                        ></v-combobox>
                    </settings-row>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">

import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
@Component({
    components: {SettingsRow}
})
export default class SettingsControlTab extends Mixins(BaseMixin) {

    $refs!: {
        formControlExtruder: HTMLFormElement
    }

    get controlStyles() {
        return [
            {
                text: this.$t('Settings.ControlTab.Bars'),
                value: 'bars',
            },
            {
                text: this.$t('Settings.ControlTab.Circle'),
                value: 'circle',
            },
            {
                text: this.$t('Settings.ControlTab.Cross'),
                value: 'cross',
            },
        ]
    }

    get controlStyle() {
        return this.$store.state.gui.control.style ?? 'bar'
    }

    set controlStyle(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.style', value: newVal })
    }

    get reverseX() {
        return this.$store.state.gui.control.reverseX
    }

    set reverseX(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.reverseX', value: newVal })
    }

    get reverseY() {
        return this.$store.state.gui.control.reverseY
    }

    set reverseY(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.reverseY', value: newVal })
    }

    get reverseZ() {
        return this.$store.state.gui.control.reverseZ
    }

    set reverseZ(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.reverseZ', value: newVal })
    }

    get feedrateXY() {
        return this.$store.state.gui.control.feedrateXY
    }

    set feedrateXY(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.feedrateXY', value: newVal })
    }

    get feedrateZ() {
        return this.$store.state.gui.control.feedrateZ
    }

    set feedrateZ(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.feedrateZ', value: newVal })
    }

    get stepsAll() {
        const steps = this.$store.state.gui.control.stepsAll
        return (steps ?? []).sort(function (a: number,b: number) { return b-a })
    }

    set stepsAll(newVal) {
        const absSteps = []
        for(const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsAll', value: steps })
    }

    get stepsXY() {
        const steps = this.$store.state.gui.control.stepsXY
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set stepsXY(newVal) {
        const absSteps = []
        for(const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsXY', value: steps })
    }

    get stepsZ() {
        const steps = this.$store.state.gui.control.stepsZ
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set stepsZ(newVal) {
        const absSteps = []
        for(const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsZ', value: steps })
    }

    get stepsCircleXY() {
        const steps = this.$store.state.gui.control.stepsCircleXY
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set stepsCircleXY(newVal) {
        const absSteps = []
        for(const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsCircleXY', value: steps })
    }

    get stepsCircleZ() {
        const steps = this.$store.state.gui.control.stepsCircleZ
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set stepsCircleZ(newVal) {
        const absSteps = []
        for(const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsCircleZ', value: steps })
    }

    get feedamountsE() {
        const steps = this.$store.state.gui.control.extruder.feedamounts
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set feedamountsE(newVal) {
        const absAmounts = []
        for(const value of newVal) absAmounts.push(Math.abs(value))
        const amounts = absAmounts.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamounts', value: amounts })
    }

    get feedratesE() {
        const steps = this.$store.state.gui.control.extruder.feedrates
        return steps.sort(function (a: number,b: number) { return b-a })
    }

    set feedratesE(newVal) {
        const absRates = []
        for(const value of newVal) absRates.push(Math.abs(value))
        const rates = absRates.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrates', value: rates })
    }

    blurFeedrateXY() {
        if (!(this.feedrateXY > 0)) this.feedrateXY = 100
    }

    blurFeedrateZ() {
        if (!(this.feedrateZ > 0)) this.feedrateZ = 25
    }

    onlyUnique(value: any, index: any, self: any[]) {
        return self.indexOf(value) === index
    }

    mounted() {
        this.$refs.formControlExtruder.validate()
    }
}
</script>
