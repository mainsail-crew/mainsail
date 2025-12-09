<template>
    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.AfcPanel.Functions')" left>
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon>{{ mdiDotsVertical }}</v-icon>
            </v-btn>
        </template>
        <v-list dense>
            <v-list-item v-for="macro in macros" :key="macro.macroName">
                <macro-button
                    :macro="macro.macro"
                    :alias="macro.text"
                    :icon="macro.icon"
                    :disabled="macro.disabled"
                    color=""
                    class="w-100" />
            </v-list-item>
            <v-list-item>
                <v-btn class="w-100" small @click="showAfcSettings = true">
                    <v-icon small left>{{ mdiVariable }}</v-icon>
                    {{ $t('Panels.AfcPanel.AfcSettings') }}
                </v-btn>
                <afc-settings-dialog :show="showAfcSettings" @close="showAfcSettings = false" />
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
import {
    mdiArrowDownBold,
    mdiDotsVertical,
    mdiLightbulbOnOutline,
    mdiLightbulbOutline,
    mdiVariable,
    mdiWrench,
} from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'
import { TranslateResult } from 'vue-i18n'

@Component
export default class AfcPanelButtons extends Mixins(BaseMixin, AfcMixin) {
    mdiDotsVertical = mdiDotsVertical
    mdiArrowDownBold = mdiArrowDownBold
    mdiVariable = mdiVariable

    showAfcSettings = false

    get macros() {
        const macros = this.$store.getters['printer/getMacros']
        const settings = this.$store.state.printer.configfile?.settings.afc ?? {}
        const ledState = this.afc.led_state ?? false

        const afcMacros: {
            icon: string | null
            text: string | TranslateResult
            macroName: string
            disabled: boolean
        }[] = [
            {
                icon: mdiWrench,
                text: this.$t('Panels.AfcPanel.Calibrate'),
                macroName: 'AFC_CALIBRATION',
                disabled: this.printerIsPrintingOnly,
            },
            {
                icon: ledState ? mdiLightbulbOnOutline : mdiLightbulbOutline,
                text: ledState ? this.$t('Panels.AfcPanel.LedOff') : this.$t('Panels.AfcPanel.LedOn'),
                macroName: ledState ? 'TURN_OFF_AFC_LED' : 'TURN_ON_AFC_LED',
                disabled: false,
            },
        ]

        if (this.afc?.td1_present) {
            afcMacros.push({
                icon: '',
                text: this.$t('Panels.AfcPanel.CaptureTD'),
                macroName: 'AFC_GET_TD_ONE_DATA',
                disabled: this.printerIsPrintingOnly,
            })
        }

        if (settings.wipe) {
            afcMacros.push({
                icon: null,
                text: this.$t('Panels.AfcPanel.BrushNozzle'),
                macroName: settings?.wipe_cmd || 'AFC_BRUSH',
                disabled: this.printerIsPrintingOnly,
            })
        }

        if (settings.park) {
            afcMacros.push({
                icon: null,
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
