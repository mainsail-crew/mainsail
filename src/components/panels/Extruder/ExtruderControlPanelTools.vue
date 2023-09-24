<template>
    <v-container v-if="toolchangeMacros.length > 1" class="pl-6 pr-6 pt-6 pb-0 mb-3">
        <v-row v-for="(row, index) in wrappedToolchangeMacros" :key="index">
            <v-item-group class="_btn-group py-0 mb-3">
                <v-btn
                    v-for="tool in row"
                    :key="tool.name"
                    :disabled="isPrinting"
                    :loading="loadings.includes(tool.name.toLowerCase())"
                    class="flex-grow-1 px-0"
                    :style="{
                        'background-color': tool.active
                            ? homedAxes.includes('xyz')
                                ? primaryColor
                                : warningColor
                            : '',
                        color: tool.active ? primaryTextColor : '',
                    }"
                    dense
                    @click="doSend(tool.name)">
                    <span
                        v-if="tool.color != null"
                        class="_extruderColorState mr-1"
                        :style="{
                            'border-color': tool.active ? primaryTextColor : '',
                            'background-color': '#' + tool.color,
                        }"></span>
                    {{ tool.name }}
                </v-btn>
            </v-item-group>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { mdiPrinter3dNozzle } from '@mdi/js'
import { Component, Mixins } from 'vue-property-decorator'
import { PrinterStateToolchangeMacro } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

@Component({})
export default class ExtruderControlPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiPrinter3dNozzle = mdiPrinter3dNozzle

    get macros() {
        return this.$store.getters['printer/getMacros']
    }

    get toolchangeMacros(): PrinterStateToolchangeMacro[] {
        const tools: PrinterStateToolchangeMacro[] = []
        this.macros
            .filter((macro: any) => macro.name.toUpperCase().match(/^T\d+/))
            .forEach((macro: any) =>
                tools.push({
                    name: macro.name,
                    active: macro.variables.active ?? false,
                    color: macro.variables.color ?? macro.variables.colour ?? null,
                })
            )
        return tools.sort((a, b) => {
            const numberA = parseInt(a.name.slice(1))
            const numberB = parseInt(b.name.slice(1))

            return numberA - numberB
        })
    }

    get wrappedToolchangeMacros(): any[] {
        const rows: any[] = []

        let maxCols = 6
        let rowIndex = 0
        let row: PrinterStateToolchangeMacro[] = []
        rows.push(row)
        for (const macro of this.toolchangeMacros) {
            if (rows[rowIndex].length == maxCols) {
                rowIndex = rowIndex + 1
                let row: PrinterStateToolchangeMacro[] = []
                rows.push(row)
            }
            rows[rowIndex].push(macro)
        }

        return rows
    }

    get isPrinting(): boolean {
        return ['printing'].includes(this.printer_state)
    }

    get primaryColor(): string {
        return this.$store.state.gui.uiSettings.primary
    }

    get primaryTextColor(): string {
        let splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.primaryColor)
        if (splits) {
            const r = parseInt(splits[1], 16) * 0.2126
            const g = parseInt(splits[2], 16) * 0.7152
            const b = parseInt(splits[3], 16) * 0.0722
            const perceivedLightness = (r + g + b) / 255

            return perceivedLightness > 0.7 ? '#222' : '#fff'
        }

        return '#ffffff'
    }

    get warningColor(): string {
        return this.$vuetify?.theme?.currentTheme?.warning?.toString() ?? '#ff8300'
    }

    doSend(gcode: string): void {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: gcode.toLowerCase() })
    }
}
</script>

<style lang="scss" scoped>
._extruderColorState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
}

._btn-group {
    border-radius: 4px;
    display: inline-flex;
    flex-wrap: nowrap;
    max-width: 100%;
    min-width: 100%;
    width: 100%;

    .v-btn {
        border-radius: 0;
        border-color: rgba(255, 255, 255, 0.12);
        border-style: solid;
        border-width: thin;
        box-shadow: none;
        height: 28px;
        opacity: 0.8;
        min-width: auto !important;
    }

    .v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .v-btn:not(:first-child) {
        border-left-width: 0;
    }
}
</style>
