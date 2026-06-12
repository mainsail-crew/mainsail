<template>
    <v-card flat>
        <v-card-text>
            <v-form ref="formControlExtruder">
                <!-- TOOLHEAD CONTROL SETTINGS -->
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiGamepad }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Panels.ToolheadControlPanel.Headline') }}
                    </v-card-title>
                    <v-divider class="ml-3" />
                </div>
                <settings-row :title="$t('Settings.ControlTab.Style')">
                    <v-select v-model="controlStyle" :items="controlStyles" item-title="text" item-value="value" variant="outlined" density="compact" hide-details attach />
                </settings-row>
                <v-divider class="my-2" />
                <template v-if="['circle', 'cross'].includes(controlStyle) && actionOptions.length > 1">
                    <settings-row :title="$t('Settings.ControlTab.OverwriteActionButton')">
                        <v-select v-model="actionButton" :items="actionOptions" item-title="text" item-value="value" variant="outlined" density="compact" hide-details attach />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <settings-row :title="$t('Settings.ControlTab.HideDuringPrint')" :dynamic-slot-width="true">
                    <v-switch v-model="hideDuringPrint" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.ControlTab.EnableXYHoming')" :dynamic-slot-width="true">
                    <v-switch v-model="enableXYHoming" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <template v-if="['circle', 'cross'].includes(controlStyle)">
                    <settings-row :title="$t('Settings.ControlTab.InvertXMovement')" :dynamic-slot-width="true">
                        <v-switch v-model="reverseX" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.InvertYMovement')" :dynamic-slot-width="true">
                        <v-switch v-model="reverseY" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.InvertZMovement')" :dynamic-slot-width="true">
                        <v-switch v-model="reverseZ" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <settings-row :title="$t('Settings.ControlTab.SpeedXY')">
                    <v-text-field
                        v-model="feedrateXY"
                        type="number"
                        suffix="mm/s"
                        hide-details="auto"
                        :rules="[(v) => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', { value: '0' })]"
                        variant="outlined"
                        density="compact"
                        hide-spin-buttons
                        @blur="blurFeedrateXY" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.ControlTab.SpeedZ')">
                    <v-text-field
                        v-model="feedrateZ"
                        type="number"
                        suffix="mm/s"
                        hide-details="auto"
                        :rules="[(v) => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', { value: '0' })]"
                        variant="outlined"
                        density="compact"
                        hide-spin-buttons
                        @blur="blurFeedrateZ" />
                </settings-row>
                <v-divider class="my-2" />
                <!-- CONTROL STYLE CROSS SPECIFICS -->
                <template v-if="controlStyle === 'cross'">
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsAll"
                            hide-selected
                            hide-details="auto"
                            multiple
                            chips
                            closable-chips
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 9 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '9' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <!-- CONTROL STYLE CIRCLE SPECIFICS -->
                <template v-else-if="controlStyle === 'circle'">
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsCircleXY"
                            hide-selected
                            hide-details="auto"
                            multiple
                            chips
                            closable-chips
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', { maximum: '4' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsCircleZ"
                            hide-selected
                            hide-details="auto"
                            multiple
                            chips
                            closable-chips
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', { maximum: '4' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <!-- CONTROL STYLE BARS SPECIFICS -->
                <template v-else>
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsXY"
                            hide-selected
                            hide-details="auto"
                            multiple
                            chips
                            closable-chips
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 3 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '3' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsZ"
                            hide-selected
                            hide-details="auto"
                            multiple
                            chips
                            closable-chips
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 3 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '3' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <template v-if="klipperReadyForGui && endstop_pin !== null">
                    <settings-row
                        :title="$t('Settings.ControlTab.ZOffsetSaveOption')"
                        :sub-title="$t('Settings.ControlTab.ZOffsetSaveOptionDescription')">
                        <v-select
                            v-model="offsetZSaveOption"
                            :items="offsetZSaveOptions"
                            item-title="text"
                            item-value="value"
                            class="mt-0"
                            hide-details
                            variant="outlined"
                            density="compact" />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <settings-row :title="$t('Settings.ControlTab.ZOffsetIncrements')" :mobile-second-row="true">
                    <v-combobox
                        v-model="offsetsZ"
                        hide-selected
                        hide-details="auto"
                        multiple
                        chips
                        closable-chips
                        append-icon=""
                        type="number"
                        :rules="[
                            (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                            (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '4' }),
                        ]"
                        density="compact"
                        variant="outlined"
                        hide-spin-buttons />
                </settings-row>
                <!-- EXTRUDER CONTROL SETTINGS -->
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiPrinter3dNozzle }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Panels.ExtruderControlPanel.Headline') }}
                    </v-card-title>
                    <v-divider class="ml-3" />
                </div>
                <settings-row :title="$t('Settings.ControlTab.MoveDistancesEInMm')" :mobile-second-row="true">
                    <v-combobox
                        v-model="feedamountsE"
                        hide-selected
                        hide-details="auto"
                        multiple
                        chips
                        closable-chips
                        append-icon=""
                        type="number"
                        :rules="[
                            (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                            (v) => v.length <= 5 || $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '5' }),
                        ]"
                        density="compact"
                        variant="outlined"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.ControlTab.SpeedEInMms')" :mobile-second-row="true">
                    <v-combobox
                        v-model="feedratesE"
                        hide-selected
                        hide-details="auto"
                        multiple
                        chips
                        closable-chips
                        append-icon=""
                        type="number"
                        :rules="[
                            (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                            (v) => v.length <= 5 || $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '5' }),
                        ]"
                        density="compact"
                        variant="outlined"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.ControlTab.EstimatedExtrusionInfo')"
                    :sub-title="$t('Settings.ControlTab.EstimatedExtrusionInfoDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="showEstimatedExtrusionInfo" hide-details class="mt-0" />
                </settings-row>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import { useZOffset } from '@/composables/useZOffset'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPrinter3dNozzle, mdiGamepad } from '@mdi/js'

const store = useStore()
const { t } = useI18n()
const { klipperReadyForGui } = useBase()
const { existsQGL, existsZtilt, defaultActionButton } = useControl()
const { endstop_pin, existZOffsetApplyEndstop, existZOffsetApplyProbe, autoSaveZOffsetOption } = useZOffset()

const formControlExtruder = ref<HTMLFormElement | null>(null)

const controlStyles = computed(() => [
    {
        text: t('Settings.ControlTab.Bars'),
        value: 'bars',
    },
    {
        text: t('Settings.ControlTab.Circle'),
        value: 'circle',
    },
    {
        text: t('Settings.ControlTab.Cross'),
        value: 'cross',
    },
])

const controlStyle = computed({
    get: () => store.state.gui.control.style ?? 'bar',
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.style', value: newVal })
    },
})

const hideDuringPrint = computed({
    get: () => store.state.gui.control.hideDuringPrint ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.hideDuringPrint', value: newVal })
    },
})

const actionOptions = computed(() => {
    const actions = [
        {
            text: t('Settings.ControlTab.MotorsOff', {
                isDefault: defaultActionButton.value === 'm84' ? t('Settings.ControlTab.IsDefault') : '',
            }),
            value: 'm84',
        },
    ]
    if (existsQGL.value) {
        actions.push({
            text: t('Settings.ControlTab.QuadGantryLevel', {
                isDefault: defaultActionButton.value === 'qgl' ? t('Settings.ControlTab.IsDefault') : '',
            }),
            value: 'qgl',
        })
    }
    if (existsZtilt.value) {
        actions.push({
            text: t('Settings.ControlTab.ZTiltAdjust', {
                isDefault: defaultActionButton.value === 'ztilt' ? t('Settings.ControlTab.IsDefault') : '',
            }),
            value: 'ztilt',
        })
    }
    return actions
})

const actionButton = computed({
    get: () => store.state.gui.control.actionButton ?? defaultActionButton.value,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.actionButton', value: newVal })
    },
})

const enableXYHoming = computed({
    get: () => store.state.gui.control.enableXYHoming ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.enableXYHoming', value: newVal })
    },
})

const reverseX = computed({
    get: () => store.state.gui.control.reverseX,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.reverseX', value: newVal })
    },
})

const reverseY = computed({
    get: () => store.state.gui.control.reverseY,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.reverseY', value: newVal })
    },
})

const reverseZ = computed({
    get: () => store.state.gui.control.reverseZ,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.reverseZ', value: newVal })
    },
})

const feedrateXY = computed({
    get: () => store.state.gui.control.feedrateXY,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.feedrateXY', value: newVal })
    },
})

const feedrateZ = computed({
    get: () => store.state.gui.control.feedrateZ,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.feedrateZ', value: newVal })
    },
})

const offsetsZ = computed({
    get: () => {
        const steps = store.state.gui.control.offsetsZ
        return [...steps].sort(function (a: number, b: number) {
            return a - b
        })
    },
    set: (steps) => {
        const absSteps = new Set<number>()
        for (const value of steps) absSteps.add(Math.abs(value))
        store.dispatch('gui/saveSetting', { name: 'control.offsetsZ', value: Array.from(absSteps) })
    },
})

const stepsAll = computed({
    get: () => {
        const steps = store.state.gui.control.stepsAll
        return (steps ?? []).sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.stepsAll', value: steps })
    },
})

const stepsXY = computed({
    get: () => {
        const steps = store.state.gui.control.stepsXY
        return [...steps].sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.stepsXY', value: steps })
    },
})

const stepsZ = computed({
    get: () => {
        const steps = store.state.gui.control.stepsZ
        return [...steps].sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.stepsZ', value: steps })
    },
})

const stepsCircleXY = computed({
    get: () => {
        const steps = store.state.gui.control.stepsCircleXY
        return [...steps].sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.stepsCircleXY', value: steps })
    },
})

const stepsCircleZ = computed({
    get: () => {
        const steps = store.state.gui.control.stepsCircleZ
        return [...steps].sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absSteps = []
        for (const value of newVal) absSteps.push(Math.abs(value))
        const steps = absSteps.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.stepsCircleZ', value: steps })
    },
})

const feedamountsE = computed({
    get: () => {
        const steps = store.state.gui.control.extruder.feedamounts
        return [...steps].sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absAmounts = []
        for (const value of newVal) absAmounts.push(Math.abs(value))
        const amounts = absAmounts.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamounts', value: amounts })
    },
})

const feedratesE = computed({
    get: () => {
        const steps = store.state.gui.control.extruder.feedrates
        return [...steps].sort(function (a: number, b: number) {
            return b - a
        })
    },
    set: (newVal) => {
        const absRates = []
        for (const value of newVal) absRates.push(Math.abs(value))
        const rates = absRates.filter(onlyUnique)
        store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrates', value: rates })
    },
})

const showEstimatedExtrusionInfo = computed({
    get: () => store.state.gui.control.extruder.showEstimatedExtrusionInfo,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.extruder.showEstimatedExtrusionInfo', value: newVal })
    },
})

const offsetZSaveOption = computed({
    get: () => store.state.gui.control.offsetZSaveOption ?? null,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'control.offsetZSaveOption', value: newVal })
    },
})

const offsetZSaveOptions = computed(() => {
    const defaultValue = autoSaveZOffsetOption.value.replace(/Z_OFFSET_APPLY_/g, '')

    const output: { value: string | null; text: string }[] = [
        {
            value: null,
            text: `Auto (${defaultValue})`,
        },
    ]

    if (existZOffsetApplyEndstop.value) {
        output.push({
            value: 'Z_OFFSET_APPLY_ENDSTOP',
            text: 'ENDSTOP',
        })
    }

    if (existZOffsetApplyProbe.value) {
        output.push({
            value: 'Z_OFFSET_APPLY_PROBE',
            text: 'PROBE',
        })
    }

    return output
})

function blurFeedrateXY() {
    if (!(feedrateXY.value > 0)) feedrateXY.value = 100
}

function blurFeedrateZ() {
    if (!(feedrateZ.value > 0)) feedrateZ.value = 25
}

function onlyUnique(value: number, index: number, self: number[]) {
    return self.indexOf(value) === index
}
</script>
