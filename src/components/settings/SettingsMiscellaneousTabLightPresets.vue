<template>
    <div>
        <template v-if="boolForm">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.CreatePreset') }}</h3>
                <settings-row :title="$t('Settings.MiscellaneousTab.Name').toString()">
                    <v-text-field
                        v-model="form.name"
                        hide-details="auto"
                        :rules="[rules.required, rules.presetUnique]"
                        dense
                        outlined></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.MiscellaneousTab.Color').toString()">
                    <v-row>
                        <v-col class="text-center">
                            <color-picker
                                :color="colorRGB"
                                :options="colorPickerOptions"
                                @update:color="onColorRGBChanged" />
                            <color-picker
                                v-if="existWhite"
                                :color="colorRGBW"
                                :options="colorPickerWhiteOptions"
                                class="mt-3"
                                @update:color="onColorWhiteChanged" />
                        </v-col>
                        <v-col>
                            <v-row v-if="existRed">
                                <v-col>
                                    <number-input
                                        :label="$t('Panels.MiscellaneousPanel.Light.Red')"
                                        param="red"
                                        :target="redInt"
                                        :min="0"
                                        :max="255"
                                        :dec="1"
                                        :step="1"
                                        :output-error-msg="true"
                                        :has-spinner="true"
                                        @submit="onColorInput" />
                                </v-col>
                            </v-row>
                            <v-row v-if="existGreen">
                                <v-col>
                                    <number-input
                                        :label="$t('Panels.MiscellaneousPanel.Light.Green')"
                                        param="green"
                                        :target="greenInt"
                                        :min="0"
                                        :max="255"
                                        :dec="1"
                                        :step="1"
                                        :has-spinner="true"
                                        @submit="onColorInput" />
                                </v-col>
                            </v-row>
                            <v-row v-if="existBlue">
                                <v-col>
                                    <number-input
                                        :label="$t('Panels.MiscellaneousPanel.Light.Blue')"
                                        param="blue"
                                        :target="blueInt"
                                        :min="0"
                                        :max="255"
                                        :dec="1"
                                        :step="1"
                                        :has-spinner="true"
                                        @submit="onColorInput" />
                                </v-col>
                            </v-row>
                            <v-row v-if="existWhite">
                                <v-col>
                                    <number-input
                                        :label="$t('Panels.MiscellaneousPanel.Light.White')"
                                        param="white"
                                        :target="whiteInt"
                                        :min="0"
                                        :max="255"
                                        :dec="1"
                                        :step="1"
                                        :has-spinner="true"
                                        @submit="onColorInput" />
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="closeForm">{{ $t('Settings.Cancel') }}</v-btn>
                <v-btn v-if="form.id !== null" text color="primary" @click="updatePreset">
                    {{ $t('Settings.Update') }}
                </v-btn>
                <v-btn v-else text color="primary" @click="storePreset">{{ $t('Settings.Store') }}</v-btn>
            </v-card-actions>
        </template>
        <template v-else>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightPresets', { name: light.name }) }}</h3>
                <template v-if="light">
                    <template v-if="presets.length">
                        <div v-for="(preset, index) in presets" :key="preset.id">
                            <v-divider v-if="index" class="my-2"></v-divider>
                            <settings-row
                                :title="preset.name"
                                :sub-title="entryDescriptionText(preset)"
                                :dynamic-slot-width="true">
                                <v-btn small outlined class="ml-3" @click="editPreset(preset)">
                                    <v-icon left small>{{ mdiPencil }}</v-icon>
                                    {{ $t('Settings.Edit') }}
                                </v-btn>
                                <v-btn
                                    small
                                    outlined
                                    class="ml-3 minwidth-0 px-2"
                                    color="error"
                                    @click="deletePreset(preset.id)">
                                    <v-icon small>{{ mdiDelete }}</v-icon>
                                </v-btn>
                            </settings-row>
                        </div>
                    </template>
                    <template v-else>
                        <v-row>
                            <v-col>
                                <p class="mb-0 text-center font-italic">
                                    {{ $t('Settings.MiscellaneousTab.NoPresetFound') }}
                                </p>
                            </v-col>
                        </v-row>
                    </template>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">
                                {{ $t('Settings.MiscellaneousTab.UnableToLoadPreset') }}
                            </p>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="$emit('close')">{{ $t('Settings.Close') }}</v-btn>
                <v-btn text color="primary" @click="createPreset">
                    {{ $t('Settings.MiscellaneousTab.AddPreset') }}
                </v-btn>
            </v-card-actions>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { caseInsensitiveSort, convertName } from '@/plugins/helpers'
import { PrinterStateLight } from '@/store/printer/types'
import { GuiMiscellaneousStateEntry, GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'
import { ColorPickerProps } from '@jaames/iro/dist/ColorPicker.d'
import iro from '@jaames/iro'
import { Debounce } from 'vue-debounce-decorator'
import { IroColor } from '@irojs/iro-core'

interface ColorData {
    red: number | null
    green: number | null
    blue: number | null
    white: number | null
}

@Component({
    components: {
        SettingsRow,
    },
})
export default class SettingsMiscellaneousTabLightPresets extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPencil = mdiPencil

    convertName = convertName

    private boolForm = false

    private form: {
        id: string | null
        name: string
        red: number | null
        green: number | null
        blue: number | null
        white: number | null
    } = {
        id: null,
        name: '',
        red: null,
        green: null,
        blue: null,
        white: null,
    }

    private rules = {
        required: (value: string) => value !== '' || 'required',
        presetUnique: (value: string) => !this.existsPresetName(value) || 'Name already exists',
        min: (value: number) => value >= 0 || 'Must be minimum 0',
        max: (value: number) => value <= 255 || 'Must be smaller then 256',
    }

    @Prop({ type: Object, default: null })
    declare light: PrinterStateLight | null

    get entry() {
        return this.$store.getters['gui/miscellaneous/getEntry']({
            type: this.light?.type,
            name: this.light?.name,
        }) as GuiMiscellaneousStateEntry | null
    }

    get presets() {
        if (!this.entry) return []

        const presets: GuiMiscellaneousStateEntryPreset[] = []
        Object.entries(this.entry.presets).forEach(([key, preset]) => {
            presets.push({
                ...preset,
                id: key,
            })
        })
        window.console.log('getEntryPresets', presets)

        return caseInsensitiveSort(presets, 'name')
    }

    get existRed() {
        return this.light?.colorOrder.indexOf('R') !== -1
    }

    get existGreen() {
        return this.light?.colorOrder.indexOf('G') !== -1
    }

    get existBlue() {
        return this.light?.colorOrder.indexOf('B') !== -1
    }

    get existWhite() {
        return this.light?.colorOrder.indexOf('W') !== -1
    }

    get colorRGB() {
        return `rgb(${Math.round(this.form.red ?? 0)}, ${Math.round(this.form.green ?? 0)}, ${Math.round(
            this.form.blue ?? 0
        )})`
    }

    get colorRGBW() {
        return `rgba(255, 255, 255, ${(this.form.white ?? 0) / 255})`
    }

    get redInt() {
        return Math.round(this.form.red ?? 0)
    }

    get greenInt() {
        return Math.round(this.form.green ?? 0)
    }

    get blueInt() {
        return Math.round(this.form.blue ?? 0)
    }

    get whiteInt() {
        return Math.round(this.form.white ?? 0)
    }

    get colorPickerOptions() {
        let options: ColorPickerProps = {
            width: 200,
            margin: 15,
            layout: [],
        }

        if (this.existRed) {
            // @ts-ignore
            options?.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'red',
                },
            })
        }

        if (this.existGreen) {
            // @ts-ignore
            options?.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'green',
                },
            })
        }

        if (this.existBlue) {
            // @ts-ignore
            options?.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'blue',
                },
            })
        }

        if (this.existRed && this.existGreen && this.existBlue) {
            options.layout = [
                {
                    component: iro.ui.Wheel,
                },
                {
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'value',
                    },
                },
            ]
        }

        return options
    }

    get colorPickerWhiteOptions() {
        let options: ColorPickerProps = {
            width: 200,
            margin: 15,
            layout: [
                {
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'alpha',
                    },
                },
            ],
        }

        return options
    }

    entryDescriptionText(preset: GuiMiscellaneousStateEntryPreset) {
        let output: string[] = []

        if (this.light?.colorOrder.includes('R')) output.push(`R: ${preset.red}`)
        if (this.light?.colorOrder.includes('G')) output.push(`G: ${preset.green}`)
        if (this.light?.colorOrder.includes('B')) output.push(`B: ${preset.blue}`)
        if (this.light?.colorOrder.includes('W')) output.push(`W: ${preset.white}`)

        return output.join(', ')
    }

    createPreset() {
        this.form.id = null
        this.form.name = ''
        this.form.red = this.light?.colorOrder.indexOf('R') != -1 ? 0 : null
        this.form.green = this.light?.colorOrder.indexOf('G') != -1 ? 0 : null
        this.form.blue = this.light?.colorOrder.indexOf('B') != -1 ? 0 : null
        this.form.white = this.light?.colorOrder.indexOf('W') != -1 ? 0 : null
        this.boolForm = true
    }

    editPreset(preset: GuiMiscellaneousStateEntryPreset) {
        this.form.id = preset.id ?? null
        this.form.name = preset.name
        this.form.red = this.light?.colorOrder.indexOf('R') != -1 ? preset.red : null
        this.form.green = this.light?.colorOrder.indexOf('G') != -1 ? preset.green : null
        this.form.blue = this.light?.colorOrder.indexOf('B') != -1 ? preset.blue : null
        this.form.white = this.light?.colorOrder.indexOf('W') != -1 ? preset.white : null
        this.boolForm = true
    }

    closeForm() {
        this.boolForm = false
    }

    storePreset() {
        this.$store.dispatch('gui/miscellaneous/storePreset', {
            entry: this.light,
            preset: this.form,
        })

        this.boolForm = false
    }

    updatePreset() {
        this.$store.dispatch('gui/miscellaneous/updatePreset', {
            entry: this.light,
            preset: this.form,
        })

        this.boolForm = false
    }

    deletePreset(presetId: string) {
        this.$store.dispatch('gui/miscellaneous/deletePreset', {
            entry: this.light,
            presetId: presetId,
        })
    }

    existsPresetName(name: string) {
        return (
            this.presets.findIndex(
                (group: GuiMiscellaneousStateEntryPreset) => group.name === name && group.id != this.form.id
            ) >= 0
        )
    }

    @Debounce({ time: 250 })
    onColorRGBChanged(payload: IroColor) {
        const color: ColorData = {
            red: payload.red,
            green: payload.green,
            blue: payload.blue,
            white: this.form.white,
        }

        this.colorChanged(color)
    }

    @Debounce({ time: 250 })
    onColorWhiteChanged(payload: IroColor) {
        const color: ColorData = {
            red: this.form.red,
            green: this.form.green,
            blue: this.form.blue,
            white: this.form.white,
        }

        // @ts-ignore
        color.white = payload.alpha * 255

        this.colorChanged(color)
    }

    onColorInput(payload: { name: string; value: number }) {
        const color: ColorData = {
            red: this.form.red,
            green: this.form.green,
            blue: this.form.blue,
            white: this.form.white,
        }

        // @ts-ignore
        color[payload.name] = payload.value

        this.colorChanged(color)
    }

    colorChanged(color: ColorData) {
        this.form.red = color.red
        this.form.green = color.green
        this.form.blue = color.blue
        this.form.white = color.white
    }
}
</script>

<style scoped></style>
