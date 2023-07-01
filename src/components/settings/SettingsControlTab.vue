<style scoped></style>

<template>
    <div>
        <v-card flat>
            <v-card-text>
                <v-form ref="formControlExtruder">
                    <!-- TOOLHEAD CONTROL SETTINGS -->
                    <div class="d-flex align-center">
                        <v-icon style="opacity: 0.7">{{ mdiGamepad }}</v-icon>
                        <v-card-title class="mx-n2">
                            {{ $t('Panels.ToolheadControlPanel.Headline') }}
                        </v-card-title>
                        <v-divider class="ml-3"></v-divider>
                    </div>
                    <settings-row :title="$t('Settings.ControlTab.Style').toString()">
                        <v-select
                            v-model="controlStyle"
                            :items="controlStyles"
                            outlined
                            dense
                            hide-details
                            attach></v-select>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <template v-if="['circle', 'cross'].includes(controlStyle) && actionOptions.length > 1">
                        <settings-row :title="'Overwrite action button'">
                            <v-select
                                v-model="actionButton"
                                :items="actionOptions"
                                outlined
                                dense
                                hide-details
                                attach></v-select>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <settings-row
                        :title="$t('Settings.ControlTab.HideDuringPrint').toString()"
                        :dynamic-slot-width="true">
                        <v-switch v-model="hideDuringPrint" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row
                        :title="$t('Settings.ControlTab.EnableXYHoming').toString()"
                        :dynamic-slot-width="true">
                        <v-switch v-model="enableXYHoming" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <template v-if="['circle', 'cross'].includes(controlStyle)">
                        <settings-row
                            :title="$t('Settings.ControlTab.InvertXMovement').toString()"
                            :dynamic-slot-width="true">
                            <v-switch v-model="reverseX" hide-details class="mt-0"></v-switch>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                        <settings-row
                            :title="$t('Settings.ControlTab.InvertYMovement').toString()"
                            :dynamic-slot-width="true">
                            <v-switch v-model="reverseY" hide-details class="mt-0"></v-switch>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                        <settings-row
                            :title="$t('Settings.ControlTab.InvertZMovement').toString()"
                            :dynamic-slot-width="true">
                            <v-switch v-model="reverseZ" hide-details class="mt-0"></v-switch>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <settings-row :title="$t('Settings.ControlTab.SpeedXY').toString()">
                        <v-text-field
                            v-model="feedrateXY"
                            type="number"
                            suffix="mm/s"
                            hide-details="auto"
                            :rules="[(v) => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', { value: '0' })]"
                            outlined
                            dense
                            hide-spin-buttons
                            @blur="blurFeedrateXY"></v-text-field>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ControlTab.SpeedZ').toString()">
                        <v-text-field
                            v-model="feedrateZ"
                            type="number"
                            suffix="mm/s"
                            hide-details="auto"
                            :rules="[(v) => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', { value: '0' })]"
                            outlined
                            dense
                            hide-spin-buttons
                            @blur="blurFeedrateZ"></v-text-field>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <!-- CONTROL STYLE CROSS SPECIFICS -->
                    <template v-if="controlStyle === 'cross'">
                        <settings-row
                            :title="$t('Settings.ControlTab.MoveDistancesInMm').toString()"
                            :mobile-second-row="true">
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
                                    (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                    (v) =>
                                        v.length <= 9 ||
                                        $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '9' }),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <!-- CONTROL STYLE CIRCLE SPECIFICS -->
                    <template v-else-if="controlStyle === 'circle'">
                        <settings-row
                            :title="$t('Settings.ControlTab.MoveDistancesXYInMm').toString()"
                            :mobile-second-row="true">
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
                                    (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                    (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', { maximum: '4' }),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                        <settings-row
                            :title="$t('Settings.ControlTab.MoveDistancesZInMm').toString()"
                            :mobile-second-row="true">
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
                                    (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                    (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', { maximum: '4' }),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <!-- CONTROL STYLE BARS SPECIFICS -->
                    <template v-else>
                        <settings-row
                            :title="$t('Settings.ControlTab.MoveDistancesXYInMm').toString()"
                            :mobile-second-row="true">
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
                                    (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                    (v) =>
                                        v.length <= 3 ||
                                        $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '3' }),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                        <settings-row
                            :title="$t('Settings.ControlTab.MoveDistancesZInMm').toString()"
                            :mobile-second-row="true">
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
                                    (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                    (v) =>
                                        v.length <= 3 ||
                                        $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '3' }),
                                ]"
                                dense
                                outlined
                                hide-spin-buttons></v-combobox>
                        </settings-row>
                        <v-divider class="my-2"></v-divider>
                    </template>
                    <settings-row
                        :title="$t('Settings.ControlTab.ZOffsetIncrements').toString()"
                        :mobile-second-row="true">
                        <v-combobox
                            v-model="offsetsZ"
                            hide-selected
                            hide-details="auto"
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 4 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '4' }),
                            ]"
                            dense
                            outlined
                            hide-spin-buttons />
                    </settings-row>
                    <!-- EXTRUDER CONTROL SETTINGS -->
                    <div class="d-flex align-center">
                        <v-icon style="opacity: 0.7">{{ mdiPrinter3dNozzle }}</v-icon>
                        <v-card-title class="mx-n2">
                            {{ $t('Panels.ExtruderControlPanel.Headline') }}
                        </v-card-title>
                        <v-divider class="ml-3"></v-divider>
                    </div>
                    <settings-row
                        :title="$t('Settings.ControlTab.MoveDistancesEInMm').toString()"
                        :mobile-second-row="true">
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
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 5 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '5' }),
                            ]"
                            dense
                            outlined
                            hide-spin-buttons></v-combobox>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ControlTab.SpeedEInMms').toString()" :mobile-second-row="true">
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
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 5 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '5' }),
                            ]"
                            dense
                            outlined
                            hide-spin-buttons></v-combobox>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row
                        :title="$t('Settings.ControlTab.EstimatedExtrusionInfo').toString()"
                        :sub-title="$t('Settings.ControlTab.EstimatedExtrusionInfoDescription').toString()"
                        :dynamic-slot-width="true">
                        <v-switch v-model="showEstimatedExtrusionInfo" hide-details class="mt-0"></v-switch>
                    </settings-row>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPrinter3dNozzle, mdiGamepad } from '@mdi/js'

@Component({
    components: { SettingsRow },
})
export default class SettingsControlTab extends Mixins(BaseMixin, ControlMixin) {
    mdiGamepad = mdiGamepad
    mdiPrinter3dNozzle = mdiPrinter3dNozzle

    declare $refs: {
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

    get hideDuringPrint(): Boolean {
        return this.$store.state.gui.control.hideDuringPrint ?? false
    }

    set hideDuringPrint(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.hideDuringPrint', value: newVal })
    }

    get actionOptions() {
        let actions = [
            {
                text: this.$t('Settings.ControlTab.MotorsOff', {
                    isDefault: this.defaultActionButton === 'm84' ? this.$t('Settings.ControlTab.IsDefault') : '',
                }),
                value: 'm84',
            },
        ]
        if (this.existsQGL) {
            actions.push({
                text: this.$t('Settings.ControlTab.QuadGantryLevel', {
                    isDefault: this.defaultActionButton === 'qgl' ? this.$t('Settings.ControlTab.IsDefault') : '',
                }),
                value: 'qgl',
            })
        }
        if (this.existsZtilt) {
            actions.push({
                text: this.$t('Settings.ControlTab.ZTiltAdjust', {
                    isDefault: this.defaultActionButton === 'ztilt' ? this.$t('Settings.ControlTab.IsDefault') : '',
                }),
                value: 'ztilt',
            })
        }
        return actions
    }

    get actionButton(): string {
        return this.$store.state.gui.control.actionButton ?? this.defaultActionButton
    }

    set actionButton(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.actionButton', value: newVal })
    }

    get defaultActionButton() {
        return this.$store.getters['gui/getDefaultControlActionButton']
    }

    get enableXYHoming(): boolean {
        return this.$store.state.gui.control.enableXYHoming ?? false
    }

    set enableXYHoming(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.enableXYHoming', value: newVal })
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

    get offsetsZ() {
        const steps = this.$store.state.gui.control.offsetsZ
        return steps.sort(function (a: number, b: number) {
            return a - b
        })
    }

    set offsetsZ(steps) {
        // Use a set to prevent adding duplicate entries.
        const absSteps = new Set()
        for (const value of steps) absSteps.add(Math.abs(value))
        this.$store.dispatch('gui/saveSetting', { name: 'control.offsetsZ', value: Array.from(absSteps) })
    }

    get stepsAll() {
        const steps = this.$store.state.gui.control.stepsAll
        return (steps ?? []).sort(function (a: number, b: number) {
            return b - a
        })
    }

    set stepsAll(newVal) {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsAll', value: steps })
    }

    get stepsXY() {
        const steps = this.$store.state.gui.control.stepsXY
        return steps.sort(function (a: number, b: number) {
            return b - a
        })
    }

    set stepsXY(newVal) {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsXY', value: steps })
    }

    get stepsZ() {
        const steps = this.$store.state.gui.control.stepsZ
        return steps.sort(function (a: number, b: number) {
            return b - a
        })
    }

    set stepsZ(newVal) {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsZ', value: steps })
    }

    get stepsCircleXY() {
        const steps = this.$store.state.gui.control.stepsCircleXY
        return steps.sort(function (a: number, b: number) {
            return b - a
        })
    }

    set stepsCircleXY(newVal) {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsCircleXY', value: steps })
    }

    get stepsCircleZ() {
        const steps = this.$store.state.gui.control.stepsCircleZ
        return steps.sort(function (a: number, b: number) {
            return b - a
        })
    }

    set stepsCircleZ(newVal) {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.stepsCircleZ', value: steps })
    }

    get feedamountsE() {
        const steps = this.$store.state.gui.control.extruder.feedamounts
        return steps.sort(function (a: number, b: number) {
            return b - a
        })
    }

    set feedamountsE(newVal) {
        const absAmounts = []
        for (const value of newVal) absAmounts.push(Math.abs(value))
        const amounts = absAmounts.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamounts', value: amounts })
    }

    get feedratesE() {
        const steps = this.$store.state.gui.control.extruder.feedrates
        return steps.sort(function (a: number, b: number) {
            return b - a
        })
    }

    set feedratesE(newVal) {
        const absRates = []
        for (const value of newVal) absRates.push(Math.abs(value))
        const rates = absRates.filter(this.onlyUnique)

        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrates', value: rates })
    }

    get showEstimatedExtrusionInfo() {
        return this.$store.state.gui.control.extruder.showEstimatedExtrusionInfo
    }

    set showEstimatedExtrusionInfo(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.showEstimatedExtrusionInfo', value: newVal })
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
