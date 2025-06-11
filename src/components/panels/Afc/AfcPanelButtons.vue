<template>
    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.AfcPanel.Functions')" left>
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon>{{ mdiDotsVertical }}</v-icon>
            </v-btn>
        </template>
        <v-list dense>
            <v-list-item v-for="command in commands" :key="command.command">
                <v-btn class="w-100" small @click="doSend(command.command)">
                    <v-icon v-if="command.icon" small left>{{ command.icon }}</v-icon>
                    {{ command.text }}
                </v-btn>
            </v-list-item>
            <v-list-item v-for="macro in macros" :key="macro.macroName">
                <macro-button :macro="macro.macro" :alias="macro.text" color="" class="w-100" />
            </v-list-item>
            <v-list-item>
                <v-btn class="w-100" small @click="downloadDebugJson">
                    <v-icon small left>{{ mdiArrowDownBold }}</v-icon>
                    {{ $t('Panels.AfcPanel.DebugJson') }}
                </v-btn>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { mdiArrowDownBold, mdiDotsVertical, mdiLightbulbOnOutline, mdiLightbulbOutline, mdiWrench } from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'

@Component
export default class AfcPanelButtons extends Mixins(BaseMixin, AfcMixin) {
    mdiDotsVertical = mdiDotsVertical
    mdiArrowDownBold = mdiArrowDownBold

    get commands() {
        const commands = this.$store.state.printer.gcode?.commands ?? {}
        const commandsList = Object.keys(commands)

        return [
            {
                icon: mdiWrench,
                text: this.$t('Panels.AfcPanel.Calibrate'),
                command: 'AFC_CALIBRATION',
                disabled: false,
            },
            {
                icon: mdiLightbulbOnOutline,
                text: this.$t('Panels.AfcPanel.LedOn'),
                command: 'TURN_ON_AFC_LED',
                disabled: false,
            },
            {
                icon: mdiLightbulbOutline,
                text: this.$t('Panels.AfcPanel.LedOff'),
                command: 'TURN_OFF_AFC_LED',
                disabled: false,
            },
        ].filter((button) => {
            return commandsList.includes(button.command.toUpperCase())
        })
    }

    get macros() {
        const macros = this.$store.getters['printer/getMacros']
        const settings = this.$store.state.printer.configfile?.settings.afc ?? {}

        const afcMacros = []
        if (settings.wipe) {
            afcMacros.push({
                text: this.$t('Panels.AfcPanel.BrushNozzle'),
                macroName: settings?.wipe_cmd || 'AFC_BRUSH',
                disabled: this.printerIsPrintingOnly,
            })
        }

        if (settings.park) {
            afcMacros.push({
                text: this.$t('Panels.AfcPanel.ParkNozzle'),
                macroName: settings?.park_cmd || 'AFC_PARK',
                disabled: this.printerIsPrintingOnly,
            })
        }

        return afcMacros
            .map((button) => {
                return {
                    ...button,
                    macro:
                        macros.find(
                            (macro: PrinterStateMacro) => macro.name.toLowerCase() === button.macroName.toLowerCase()
                        ) ?? null,
                }
            })
            .filter((button) => button.macro !== null)
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    downloadDebugJson() {
        const AFC_DEBUG_FILENAME = 'afc_debug.json'
        const output: {
            config: { [key: string]: any }
            settings: { [key: string]: any }
            printer: { [key: string]: any }
        } = {
            config: {},
            settings: {},
            printer: {},
        }
        const printer = this.$store.state.printer ?? {}
        const config = printer.configfile?.config ?? {}
        const settings = printer.configfile?.settings ?? {}

        Object.keys(config)
            .filter((key) => key.toLowerCase().startsWith('afc'))
            .forEach((name) => {
                output.config[name] = { ...config[name] }
            })

        Object.keys(settings)
            .filter((key) => key.toLowerCase().startsWith('afc'))
            .forEach((name) => {
                output.settings[name] = { ...settings[name] }
            })

        Object.keys(printer)
            .filter((key) => key.toLowerCase().startsWith('afc'))
            .forEach((name) => {
                output.printer[name] = { ...printer[name] }
            })

        // Convert the output object to a JSON string and create a Blob for download
        const jsonString = JSON.stringify(output, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        // Create a link element to trigger the download
        const link = document.createElement('a')
        link.href = url
        link.download = AFC_DEBUG_FILENAME

        // Append the link to the body, click it to trigger download, then remove it
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the URL object
        URL.revokeObjectURL(url)
    }
}
</script>
