<template>
    <v-container :class="containerClass">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_light-subheader">
                    <v-icon v-if="(!root || groups.length === 0) && isOn" small left @click="off">
                        {{ mdiLightbulbOnOutline }}
                    </v-icon>
                    <v-icon v-else-if="!root || groups.length === 0" small left @click="on">
                        {{ mdiLightbulbOutline }}
                    </v-icon>
                    <span>{{ name }}</span>
                    <v-spacer />
                    <span
                        v-if="!root || groups.length === 0"
                        class="_currentState"
                        :style="currentStateStyle"
                        @click="boolDialog = true" />
                </v-subheader>
            </v-col>
        </v-row>
        <miscellaneous-light v-for="group in groups" :key="group.id" :object="object" :group="group" />
        <v-dialog v-model="boolDialog" persistent :width="400">
            <panel
                :title="name"
                :icon="mdiLightbulbOutline"
                card-class="temperature-edit-heater-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="boolDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pt-6">
                    <template v-if="presets.length">
                        <v-row>
                            <v-col class="light-presets-container pt-0 d-flex flex-wrap flex-row justify-center">
                                <v-tooltip v-for="preset in presets" :key="preset.id" top>
                                    <template #activator="{ on, attrs }">
                                        <div
                                            :style="presetStyle(preset)"
                                            v-bind="attrs"
                                            v-on="on"
                                            @click="usePreset(preset)" />
                                    </template>
                                    <span>{{ preset.name }}</span>
                                </v-tooltip>
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
                                        :default-value="Math.round(object.initialRed * 255)"
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
                                        :default-value="Math.round(object.initialGreen * 255)"
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
                                        :default-value="Math.round(object.initialBlue * 255)"
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
                                        :default-value="Math.round(object.initialWhite * 255)"
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
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiLightbulbOutline, mdiLightbulbOnOutline } from '@mdi/js'
import { PrinterStateLight } from '@/store/printer/types'
import ColorPicker from '@/components/inputs/ColorPicker.vue'
import { ColorPickerProps } from '@jaames/iro/dist/ColorPicker.d'
import { Debounce } from 'vue-debounce-decorator'
import iro from '@jaames/iro'
import { IroColor } from '@irojs/iro-core'
import { GuiMiscellaneousStateEntryLightgroup, GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

interface ColorData {
    red: number | null
    green: number | null
    blue: number | null
    white: number | null
}

@Component({
    components: {
        ColorPicker,
        MiscellaneousLight: () => import('@/components/inputs/MiscellaneousLight.vue'),
    },
})
export default class MiscellaneousLight extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiLightbulbOutline = mdiLightbulbOutline
    mdiLightbulbOnOutline = mdiLightbulbOnOutline

    @Prop({ type: Object, required: true })
    declare object: PrinterStateLight

    @Prop({ type: Boolean, default: false }) readonly root!: boolean
    @Prop(Object) readonly group!: GuiMiscellaneousStateEntryLightgroup | undefined

    private boolDialog = false
    private inputValue = 0

    get name() {
        if (this.group) return convertName(this.group.name)

        return convertName(this.object.name)
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

    get optionsColors() {
        let output: string[] = []

        this.presets.forEach((preset: GuiMiscellaneousStateEntryPreset) => {
            output.push(`rgb(${preset.red}%, ${preset.green}%, ${preset.blue}%)`)
        })

        return output
    }

    get current() {
        const color: ColorData = {
            red: 0,
            green: 0,
            blue: 0,
            white: null,
        }

        if (this.existWhite) color.white = 0
        if (this.object.colorData.length === 0) return color

        const firstColorData = this.object.colorData[(this.group?.start ?? 1) - 1]
        color.red = firstColorData[0] * 255
        color.green = firstColorData[1] * 255
        color.blue = firstColorData[2] * 255
        if (this.object.colorOrder.indexOf('W') !== -1) color.white = firstColorData[3] * 255

        return color
    }

    get isOn() {
        return (
            (this.current.red ?? 0) +
                (this.current?.green ?? 0) +
                (this.current.blue ?? 0) +
                (this.current.white ?? 0) >
            0
        )
    }

    get existRed() {
        return this.object.colorOrder.indexOf('R') !== -1
    }

    get existGreen() {
        return this.object.colorOrder.indexOf('G') !== -1
    }

    get existBlue() {
        return this.object.colorOrder.indexOf('B') !== -1
    }

    get existWhite() {
        return this.object.colorOrder.indexOf('W') !== -1
    }

    get currentStateStyle() {
        let output = this.colorRGB

        if (this.current.white !== null && this.current.red == 0 && this.current.green == 0 && this.current.blue == 0)
            output = `rgb(${this.current.white * 255}, ${this.current.white * 255}, ${this.current.white * 255})`

        return {
            'background-color': output,
        }
    }

    get colorRGB() {
        return `rgb(${Math.round(this.current.red ?? 0)}, ${Math.round(this.current.green ?? 0)}, ${Math.round(
            this.current.blue ?? 0
        )})`
    }

    get colorRGBW() {
        return `rgba(255, 255, 255, ${(this.current.white ?? 0) / 255})`
    }

    get redInt() {
        return Math.round(this.current.red ?? 0)
    }

    get greenInt() {
        return Math.round(this.current.green ?? 0)
    }

    get blueInt() {
        return Math.round(this.current.blue ?? 0)
    }

    get whiteInt() {
        return Math.round(this.current.white ?? 0)
    }

    get groups() {
        if (!this.root) return []

        return (
            this.$store.getters['gui/miscellaneous/getEntryLightgroups']({
                type: this.object.type,
                name: this.object.name,
            }) ?? []
        )
    }

    get presets() {
        return (
            this.$store.getters['gui/miscellaneous/getEntryPresets']({
                type: this.object.type,
                name: this.object.name,
            }) ?? []
        )
    }

    get containerClass() {
        let output = ['px-0']

        output.push(this.root ? 'py-2' : 'pt-2 pb-0')

        return output
    }

    colorChanged(color: ColorData) {
        if (
            Math.round(color.red ?? 0) === Math.round(this.current.red ?? 0) &&
            Math.round(color.green ?? 0) === Math.round(this.current.green ?? 0) &&
            Math.round(color.blue ?? 0) === Math.round(this.current.blue ?? 0) &&
            Math.round(color.white ?? 0) === Math.round(this.current.white ?? 0)
        )
            return

        const red = Math.round(((color.red ?? 0) / 255) * 10000) / 10000
        const green = Math.round(((color.green ?? 0) / 255) * 10000) / 10000
        const blue = Math.round(((color.blue ?? 0) / 255) * 10000) / 10000
        const white = Math.round(((color.white ?? 0) / 255) * 10000) / 10000

        let gcode = `SET_LED LED="${this.object.name}" RED=${red} GREEN=${green} BLUE=${blue}`
        if (this.existWhite) gcode += ` WHITE=${white}`
        gcode += ` SYNC=0`

        if (this.group) {
            const tmp = gcode

            for (let i = this.group.start; i <= this.group.end; i++) {
                if (i === this.group.start) {
                    gcode += ` INDEX=${i}`
                    continue
                }

                gcode += `\n${tmp} INDEX=${i}`
            }
        }

        gcode += ` TRANSMIT=1`

        this.$store.dispatch('server/addEvent', {
            message: gcode,
            type: 'command',
        })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    @Debounce({ time: 500 })
    onColorRGBChanged(payload: IroColor) {
        const color: ColorData = {
            red: payload.red,
            green: payload.green,
            blue: payload.blue,
            white: this.current.white,
        }

        this.colorChanged(color)
    }

    @Debounce({ time: 500 })
    onColorWhiteChanged(payload: IroColor) {
        const color: ColorData = {
            red: this.current.red,
            green: this.current.green,
            blue: this.current.blue,
            white: this.current.white,
        }

        // @ts-ignore
        color.white = payload.alpha * 255

        this.colorChanged(color)
    }

    @Debounce({ time: 500 })
    onColorInput(payload: { name: string; value: number }) {
        const color: ColorData = {
            red: this.current.red,
            green: this.current.green,
            blue: this.current.blue,
            white: this.current.white,
        }

        // @ts-ignore
        color[payload.name] = payload.value

        this.colorChanged(color)
    }

    off() {
        const color: ColorData = {
            red: 0,
            green: 0,
            blue: 0,
            white: 0,
        }

        this.colorChanged(color)
    }

    on() {
        const color: ColorData = {
            red: 255,
            green: 255,
            blue: 255,
            white: 255,
        }

        this.colorChanged(color)
    }

    presetStyle(preset: GuiMiscellaneousStateEntryPreset) {
        if ((preset?.red ?? 0) + (preset?.green ?? 0) + (preset?.blue ?? 0) === 0 && (preset?.white ?? 0) > 0) {
            return {
                backgroundColor: `rgb(${preset.white}%, ${preset.white}%, ${preset.white}%)`,
            }
        }

        return {
            backgroundColor: `rgb(${preset.red}%, ${preset.green}%, ${preset.blue}%)`,
        }
    }

    usePreset(preset: GuiMiscellaneousStateEntryPreset) {
        const color: ColorData = { ...preset }

        this.colorChanged(color)
    }
}
</script>

<style scoped>
._light-subheader {
    height: auto;
}

._currentState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    cursor: pointer;
}

.light-presets-container {
    gap: 6px;
}

.light-presets-container > div {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
