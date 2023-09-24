<template>
    <panel
        v-if="showPanel"
        :icon="mdiPrinter3dNozzle"
        :title="$t('Panels.ExtruderControlPanel.Headline')"
        :collapsible="true"
        card-class="extruder-control-panel"
        class="pb-1">
        <!-- PANEL-HEADER 3-DOT-MENU -->
        <template #buttons>
            <v-menu v-if="showFilamentMacros" :offset-y="true" :close-on-content-click="false" left>
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <!-- FILAMENT UNLOAD -->
                    <v-list-item v-if="unloadFilamentMacro">
                        <v-tooltip top :disabled="canExecuteUnloadMacro" color="secondary">
                            <template #activator="{ on }">
                                <div v-on="on">
                                    <macro-button
                                        :macro="unloadFilamentMacro"
                                        :alias="$t('Panels.ExtruderControlPanel.UnloadFilament')"
                                        :disabled="!canExecuteUnloadMacro || printerIsPrintingOnly"
                                        color="#272727" />
                                </div>
                            </template>
                            <span>
                                {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                {{ minExtrudeTemp }} °C
                            </span>
                        </v-tooltip>
                    </v-list-item>
                    <!-- FILAMENT LOAD -->
                    <v-list-item v-if="loadFilamentMacro">
                        <v-tooltip top :disabled="canExecuteLoadMacro" color="secondary">
                            <template #activator="{ on }">
                                <div v-on="on">
                                    <macro-button
                                        :macro="loadFilamentMacro"
                                        :alias="$t('Panels.ExtruderControlPanel.LoadFilament')"
                                        :disabled="!canExecuteLoadMacro || printerIsPrintingOnly"
                                        color="#272727" />
                                </div>
                            </template>
                            <span>
                                {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                {{ minExtrudeTemp }} °C
                            </span>
                        </v-tooltip>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <!-- TOOL SELECTOR BUTTONS -->
        <extruder-control-panel-tools />
        <!-- EXTRUSION FACTOR SLIDER -->
        <extrusion-factor-settings />
        <!-- PRESSURE ADVANCE SETTINGS -->
        <pressure-advance-settings />
        <!-- FIRMWARE RETRACTION SETTINGS -->
        <firmware-retraction-settings />
        <v-divider class="pb-1" />
        <!-- EXTRUDER INPUTS AND QUICKSELECTS -->
        <extruder-control-panel-control />
        <!-- EXTRUSION ESTIMATION NOTE -->
        <estimated-extrusion-output />
    </panel>
</template>

<script lang="ts">
import { mdiPrinter3dNozzle, mdiDotsVertical } from '@mdi/js'
import { Component, Mixins } from 'vue-property-decorator'
import { PrinterStateExtruder, PrinterStateMacro } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import Panel from '@/components/ui/Panel.vue'
import ExtruderMixin from '@/components/mixins/extruder'

@Component({
    components: {
        Panel,
    },
})
export default class ExtruderControlPanel extends Mixins(BaseMixin, ControlMixin, ExtruderMixin) {
    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiDotsVertical = mdiDotsVertical

    private heatWaitGcodes = ['printer.extruder.can_extrude', 'TEMPERATURE_WAIT', 'M109']

    get showPanel(): boolean {
        return this.klipperReadyForGui && this.extruders.length > 0
    }

    get macros() {
        return this.$store.getters['printer/getMacros']
    }

    get loadFilamentMacro(): PrinterStateMacro | undefined {
        return this.macros.find((macro: PrinterStateMacro) => macro.name.toUpperCase() === 'LOAD_FILAMENT')
    }

    get unloadFilamentMacro(): PrinterStateMacro | undefined {
        return this.macros.find((macro: PrinterStateMacro) => macro.name.toUpperCase() === 'UNLOAD_FILAMENT')
    }

    /**
     * test if the load and unload macro include specific keywords. if true, we allow
     * execution of that macro even if at the current time extrudePossible === false
     */
    get canExecuteLoadMacro(): boolean {
        if (this.extrudePossible) return true

        return this.heatWaitGcodes.some((gcode) => this.loadFilamentMacro?.prop.gcode.includes(gcode))
    }

    get canExecuteUnloadMacro(): boolean {
        if (this.extrudePossible) return true

        return this.heatWaitGcodes.some((gcode) => this.unloadFilamentMacro?.prop.gcode.includes(gcode))
    }

    get showFilamentMacros(): boolean {
        return this.loadFilamentMacro !== undefined || this.unloadFilamentMacro !== undefined
    }

    get extruders(): PrinterStateExtruder[] {
        return this.$store.getters['printer/getExtruders']
    }
}
</script>
