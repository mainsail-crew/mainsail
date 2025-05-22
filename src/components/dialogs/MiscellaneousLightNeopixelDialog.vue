<template>
    <v-dialog :value="showDialog" width="400">
        <panel
            :title="outputName"
            :icon="mdiLightbulbOutline"
            card-class="miscellaneous-light-neopixel-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <template v-if="presets.length">
                    <v-row>
                        <v-col class="light-presets-container d-flex flex-wrap flex-row justify-center">
                            <miscellaneous-light-neopixel-dialog-preset
                                v-for="preset in presets"
                                :key="preset.id"
                                :preset="preset"
                                @update-color="updateColor" />
                        </v-col>
                    </v-row>
                    <v-divider class="my-3" />
                </template>
                <v-row>
                    <v-col class="text-center">
                        <color-picker
                            :color="colorRGB"
                            :options="colorPickerOptions"
                            @update:color="onColorRGBChanged" />
                        <color-picker
                            v-if="colorOrder.includes('W')"
                            :color="colorRGBW"
                            :options="colorPickerWhiteOptions"
                            class="mt-3"
                            @update:color="onColorWhiteChanged" />
                    </v-col>
                    <v-col>
                        <v-row v-if="colorOrder.includes('R')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.Red')"
                                    param="red"
                                    :target="targetRed"
                                    :default-value="defaultRed"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :output-error-msg="true"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                        <v-row v-if="colorOrder.includes('G')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.Green')"
                                    param="green"
                                    :target="targetGreen"
                                    :default-value="defaultGreen"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                        <v-row v-if="colorOrder.includes('B')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.Blue')"
                                    param="blue"
                                    :target="targetBlue"
                                    :default-value="defaultBlue"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                        <v-row v-if="colorOrder.includes('W')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.White')"
                                    param="white"
                                    :target="targetWhite"
                                    :default-value="defaultWhite"
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
            </v-card-text>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { mdiCloseThick, mdiLightbulbOutline } from '@mdi/js'
import BaseMixin from '@/components/mixins/base'
import { caseInsensitiveSort, convertName } from '@/plugins/helpers'
import { ColorPickerProps } from '@jaames/iro/dist/ColorPicker.d'
import iro from '@jaames/iro'
import { IroColor } from '@irojs/iro-core'
import { Debounce } from 'vue-debounce-decorator'
import { GuiMiscellaneousStateEntry } from '@/store/gui/miscellaneous/types'
import MiscellaneousLightNeopixelDialogPreset from '@/components/dialogs/MiscellaneousLightNeopixelDialogPreset.vue'

interface ColorData {
    red: number
    green: number
    blue: number
    white: number

    [key: string]: number
}

@Component({
    components: { MiscellaneousLightNeopixelDialogPreset },
})
export default class MiscellaneousLightNeopixelDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiLightbulbOutline = mdiLightbulbOutline

    @Prop({ type: Boolean, default: false }) showDialog!: boolean
    @Prop({ type: String, required: true }) type!: string
    @Prop({ type: String, required: true }) name!: string
    @Prop({ type: Object, required: false }) group!: GuiMiscellaneousStateEntry
    @Prop({ type: Number, default: 1 }) index!: number

    get outputName() {
        return convertName(this.name)
    }

    get settings() {
        const settings = this.$store.state.printer.configfile.settings ?? {}

        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        return settings[key] ?? {}
    }

    get guiEntry() {
        const entries = (this.$store.state.gui.miscellaneous.entries ?? {}) as GuiMiscellaneousStateEntry[]

        const result = Object.entries(entries).find(([, value]) => {
            return value.type === this.type && value.name === this.name
        })

        return result ? result[1] : null
    }

    get presets() {
        if (!this.guiEntry?.presets) return []

        const presets = Object.entries(this.guiEntry.presets).map(([key, value]) => {
            return { ...value, id: key }
        })

        window.console.log(presets)

        return caseInsensitiveSort(presets, 'name')
    }

    get colorOrder() {
        if (this.type !== 'led') {
            const colorOrder = this.settings.color_order ?? []

            return colorOrder[0] ?? ''
        }

        const pins = ['red_pin', 'green_pin', 'blue_pin', 'white_pin']
        let colorOrder = ''
        pins.forEach((pin) => {
            if (pin in this.settings) colorOrder += pin.substring(0, 1).toUpperCase()
        })

        return colorOrder
    }

    get defaultRed() {
        return Math.round((this.settings.initial_red ?? 0) * 255)
    }

    get defaultGreen() {
        return Math.round((this.settings.initial_green ?? 0) * 255)
    }

    get defaultBlue() {
        return Math.round((this.settings.initial_blue ?? 0) * 255)
    }

    get defaultWhite() {
        return Math.round((this.settings.initial_white ?? 0) * 255)
    }

    get targetRed() {
        return Math.round((this.current.red ?? 0) * 255)
    }

    get targetGreen() {
        return Math.round((this.current.green ?? 0) * 255)
    }

    get targetBlue() {
        return Math.round((this.current.blue ?? 0) * 255)
    }

    get targetWhite() {
        return Math.round((this.current.white ?? 0) * 255)
    }

    get printerObject() {
        const printer = this.$store.state.printer ?? {}

        return printer[`${this.type} ${this.name}`] ?? {}
    }

    get colorData() {
        return this.printerObject.color_data ?? []
    }

    get current() {
        const data = this.colorData[this.index - 1] ?? []

        return {
            red: data[0] ?? null,
            green: data[1] ?? null,
            blue: data[2] ?? null,
            white: data[3] ?? null,
        }
    }

    get colorPickerOptions() {
        let options: ColorPickerProps = {
            width: 200,
            margin: 15,
            layout: [],
        }

        if (this.colorOrder.includes('R')) {
            // @ts-ignore
            options?.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'red',
                },
            })
        }

        if (this.colorOrder.includes('G')) {
            // @ts-ignore
            options?.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'green',
                },
            })
        }

        if (this.colorOrder.includes('B')) {
            // @ts-ignore
            options?.layout.push({
                component: iro.ui.Slider,
                options: {
                    sliderType: 'blue',
                },
            })
        }

        if (this.colorOrder.includes('R') && this.colorOrder.includes('G') && this.colorOrder.includes('B')) {
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

    get colorRGB() {
        const red = Math.round((this.current.red ?? 0) * 255)
        const green = Math.round((this.current.green ?? 0) * 255)
        const blue = Math.round((this.current.blue ?? 0) * 255)

        return `rgb(${red}, ${green}, ${blue})`
    }

    get colorRGBW() {
        return `rgba(255, 255, 255, ${this.current.white ?? 0})`
    }

    @Debounce({ time: 500 })
    onColorRGBChanged(value: IroColor) {
        if (value.red === this.targetRed && value.green === this.targetGreen && value.blue === this.targetBlue) return

        const color: ColorData = {
            red: value.red,
            green: value.green,
            blue: value.blue,
            white: this.targetWhite,
        }

        this.updateColor(color)
    }

    @Debounce({ time: 500 })
    onColorWhiteChanged(value: IroColor) {
        if (value.alpha === this.targetWhite) return

        const color: ColorData = {
            red: this.targetRed,
            green: this.targetGreen,
            blue: this.targetBlue,
            white: Math.round(value.alpha * 255),
        }

        this.updateColor(color)
    }

    @Debounce({ time: 500 })
    onColorInput(payload: { name: string; value: number }) {
        const color: ColorData = {
            red: this.targetRed,
            green: this.targetGreen,
            blue: this.targetBlue,
            white: this.targetWhite,
        }

        // stop when the value is the same as the current value
        if (!(payload.name in color) || color[payload.name] === payload.value) return

        color[payload.name] = payload.value
        this.updateColor(color)
    }

    updateColor(colorData: ColorData) {
        const red = Math.round((colorData.red / 255) * 100) / 100
        const green = Math.round((colorData.green / 255) * 100) / 100
        const blue = Math.round((colorData.blue / 255) * 100) / 100
        const white = Math.round((colorData.white / 255) * 100) / 100

        this.$emit('update-color', red, green, blue, white)
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>

<style scoped>
.light-presets-container {
    gap: 6px;
}

.light-presets-container ::v-deep > div {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
