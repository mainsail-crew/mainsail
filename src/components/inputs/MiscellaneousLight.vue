<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_light-subheader">
                    <v-icon small left>{{ mdiLightbulbOutline }}</v-icon>
                    <span>{{ name }}</span>
                    <v-spacer></v-spacer>
                    <span class="_currentState" :style="currentStateStyle" @click="boolDialog = true"></span>
                </v-subheader>
            </v-col>
        </v-row>
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
                    <v-row>
                        <v-col class="text-center">
                            <color-picker :color="colorRGB" :options="options" @update:color="onColorChanged" />
                        </v-col>
                        <v-col>
                            <v-row>
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
                            <v-row>
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
                            <v-row>
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
import { mdiCloseThick, mdiLightbulbOutline } from '@mdi/js'
import { PrinterStateLight } from '@/store/printer/types'
import ColorPicker from '@/components/inputs/ColorPicker.vue'
import { ColorPickerProps } from '@jaames/iro/dist/ColorPicker'
import { Debounce } from 'vue-debounce-decorator'
import iro from '@jaames/iro'
// @ts-ignore

interface ColorData {
    red: number | null
    green: number | null
    blue: number | null
    white: number | null
}

@Component({
    components: {
        ColorPicker,
    },
})
export default class MiscellaneousLight extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiLightbulbOutline = mdiLightbulbOutline

    @Prop({ type: Object, required: true })
    declare object: PrinterStateLight

    boolDialog = false

    options: ColorPickerProps = {
        width: 200,
        margin: 15,
        layout: [
            {
                component: iro.ui.Wheel,
            },
            {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'value',
                },
            },
        ],
    }

    get name() {
        return convertName(this.object.name)
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

        const firstColorData = this.object.colorData[0]
        color.red = firstColorData[0] * 255
        color.green = firstColorData[1] * 255
        color.blue = firstColorData[2] * 255
        if (this.object.colorOrder.indexOf('W') !== -1) color.white = firstColorData[3] * 255

        return color
    }

    get existWhite() {
        return this.object.colorOrder.indexOf('W') !== -1
    }

    get currentStateStyle() {
        let output = this.colorRGB

        if (this.current.white !== null && this.current.red == 0 && this.current.green == 0 && this.current.blue == 0)
            output = `rgb(${this.current.white}, ${this.current.white}, ${this.current.white})`

        return {
            'background-color': output,
        }
    }

    get colorRGB() {
        return `rgb(${this.current.red ?? 0}, ${this.current.green ?? 0}, ${this.current.blue ?? 0}`
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

    @Debounce({ time: 250 })
    onColorChanged(color: ColorData) {
        const red = Math.round(((color.red ?? 0) / 255) * 10000) / 10000
        const green = Math.round(((color.green ?? 0) / 255) * 10000) / 10000
        const blue = Math.round(((color.blue ?? 0) / 255) * 10000) / 10000
        const white = Math.round(((color.white ?? 0) / 255) * 10000) / 10000

        let gcode = `SET_LED LED="${this.object.name}" RED=${red} GREEN=${green} BLUE=${blue}`
        if (this.existWhite) gcode += ` WHITE=${white}`
        gcode += ` TRANSMIT=1`

        this.$store.dispatch('server/addEvent', {
            message: gcode,
            type: 'command',
        })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    onColorInput(payload: { name: string; value: number }) {
        const color: ColorData = {
            red: this.current.red,
            green: this.current.green,
            blue: this.current.blue,
            white: this.current.white,
        }

        // @ts-ignore
        color[payload.name] = payload.value

        this.onColorChanged(color)
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
}
</style>
