<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ title }}</h3>
            <settings-row :title="$t('Settings.MiscellaneousTab.Name')">
                <v-text-field
                    v-model="presetname"
                    hide-details="auto"
                    :rules="[rules.required, rules.presetUnique]"
                    dense
                    outlined />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row :title="$t('Settings.MiscellaneousTab.Color')">
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
        <v-card-actions>
            <v-spacer />
            <v-btn text @click="close">{{ $t('Settings.Cancel') }}</v-btn>
            <v-btn v-if="presetId !== null" text color="primary" @click="updatePreset">
                {{ $t('Settings.Update') }}
            </v-btn>
            <v-btn v-else text color="primary" @click="storePreset">{{ $t('Settings.Store') }}</v-btn>
        </v-card-actions>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMiscellaneousStateEntry, GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'
import { ColorPickerProps } from '@jaames/iro/dist/ColorPicker'
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
    components: { SettingsRow },
})
export default class SettingsMiscellaneousTabLightPresetsForm extends Mixins(BaseMixin) {
    presetname = ''
    red: number | null = null
    green: number | null = null
    blue: number | null = null
    white: number | null = null

    rules = {
        required: (value: string) => value !== '' || 'required',
        presetUnique: (value: string) => !this.existsPresetName(value) || 'Name already exists',
        min: (value: number) => value >= 0 || 'Must be minimum 0',
        max: (value: number) => value <= 255 || 'Must be smaller then 256',
    }

    @Prop({ type: String, default: null }) declare type: string | null
    @Prop({ type: String, default: null }) declare name: string | null
    @Prop({ type: String, default: null }) declare presetId: string | null

    get title() {
        if (this.presetId) return this.$t('Settings.MiscellaneousTab.EditPreset')

        return this.$t('Settings.MiscellaneousTab.CreatePreset')
    }

    get settings() {
        if (!this.type || !this.name) return null

        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        return this.$store.state.printer?.configfile?.settings[key] ?? {}
    }

    get colorOrder() {
        if (this.type?.toLowerCase() === 'led') {
            let colorOrder = ''
            if ('red_pin' in this.settings) colorOrder += 'R'
            if ('green_pin' in this.settings) colorOrder += 'G'
            if ('blue_pin' in this.settings) colorOrder += 'B'
            if ('white_pin' in this.settings) colorOrder += 'W'

            return colorOrder
        }

        // is array
        if (Array.isArray(this.settings.color_order)) {
            return this.settings.color_order[0] ?? ''
        }

        return this.settings.color_order ?? ''
    }

    get existRed() {
        return this.colorOrder.includes('R')
    }

    get existGreen() {
        return this.colorOrder.includes('G')
    }

    get existBlue() {
        return this.colorOrder.includes('B')
    }

    get existWhite() {
        return this.colorOrder.includes('W')
    }

    get colorRGB() {
        return `rgb(${this.redInt}, ${this.greenInt}, ${this.blueInt})`
    }

    get colorRGBW() {
        const white = this.whiteInt / 255

        return `rgba(255, 255, 255, ${white})`
    }

    get light() {
        if (!this.type || !this.name) return null

        const key = `${this.type} ${this.name}`
        return this.$store.state.printer[key] ?? {}
    }

    get entry(): GuiMiscellaneousStateEntry {
        const entries = this.$store.state.gui.miscellaneous.entries ?? {}

        const key = Object.keys(entries).find((key) => {
            const entry = entries[key]
            return entry.type === this.type && entry.name === this.name
        })

        return entries[key ?? ''] ?? {}
    }

    get presets() {
        if (!this.entry?.lightgroups) return []

        const presets: GuiMiscellaneousStateEntryPreset[] = []
        Object.keys(this.entry.presets).forEach((key) => {
            const preset = this.entry.presets[key]

            presets.push({
                ...preset,
                id: key,
            })
        })

        return caseInsensitiveSort(presets, 'name')
    }

    get preset() {
        if (!this.presetId) return null

        return this.presets.find((preset) => preset.id === this.presetId) ?? null
    }

    get redInt() {
        return Math.round(this.red ?? 0)
    }

    get greenInt() {
        return Math.round(this.green ?? 0)
    }

    get blueInt() {
        return Math.round(this.blue ?? 0)
    }

    get whiteInt() {
        return Math.round(this.white ?? 0)
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

    @Debounce({ time: 250 })
    onColorRGBChanged(payload: IroColor) {
        const color: ColorData = {
            red: payload.red,
            green: payload.green,
            blue: payload.blue,
            white: this.white,
        }

        this.colorChanged(color)
    }

    @Debounce({ time: 250 })
    onColorWhiteChanged(payload: IroColor) {
        const color: ColorData = {
            red: this.red,
            green: this.green,
            blue: this.blue,
            white: this.white,
        }

        // @ts-ignore
        color.white = payload.alpha * 255

        this.colorChanged(color)
    }

    onColorInput(payload: { name: string; value: number }) {
        const color: ColorData = {
            red: this.red,
            green: this.green,
            blue: this.blue,
            white: this.white,
        }

        // @ts-ignore
        color[payload.name] = payload.value

        this.colorChanged(color)
    }

    colorChanged(color: ColorData) {
        this.red = color.red
        this.green = color.green
        this.blue = color.blue
        this.white = color.white
    }

    @Watch('preset', { immediate: true })
    onPresetChanged() {
        this.presetname = this.preset?.name ?? ''
        this.red = this.preset?.red ?? null
        this.green = this.preset?.green ?? null
        this.blue = this.preset?.blue ?? null
        this.white = this.preset?.white ?? null
    }

    close() {
        this.$emit('close')
    }

    storePreset() {
        this.$store.dispatch('gui/miscellaneous/storePreset', {
            type: this.type,
            name: this.name,
            preset: {
                name: this.presetname,
                // parseInt & toString is just to force a integer
                red: this.red !== null ? parseInt(this.red.toString(), 10) : 0,
                green: this.green !== null ? parseInt(this.green.toString(), 10) : 0,
                blue: this.blue !== null ? parseInt(this.blue.toString(), 10) : 0,
                white: this.white !== null ? parseInt(this.white.toString(), 10) : 0,
            },
        })

        this.close()
    }

    updatePreset() {
        this.$store.dispatch('gui/miscellaneous/updatePreset', {
            type: this.type,
            name: this.name,
            presetId: this.presetId,
            preset: {
                name: this.presetname,
                // parseInt & toString is just to force a integer
                red: this.red !== null ? parseInt(this.red.toString(), 10) : 0,
                green: this.green !== null ? parseInt(this.green.toString(), 10) : 0,
                blue: this.blue !== null ? parseInt(this.blue.toString(), 10) : 0,
                white: this.white !== null ? parseInt(this.white.toString(), 10) : 0,
            },
        })

        this.close()
    }

    existsPresetName(name: string) {
        return (
            this.presets.findIndex(
                (preset: GuiMiscellaneousStateEntryPreset) => preset.name === name && preset.id !== this.presetId
            ) >= 0
        )
    }
}
</script>
