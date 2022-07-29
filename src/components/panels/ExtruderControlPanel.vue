<template>
    <panel
        v-if="klipperReadyForGui && extruders.length"
        :icon="mdiPrinter3dNozzle"
        :title="$t('Panels.ExtruderControlPanel.Headline').toString()"
        :collapsible="true"
        card-class="extruder-control-panel">
        <!-- PANEL-HEADER 3-DOT-MENU -->
        <template #buttons>
            <v-menu v-if="filamentChangeMacros" left :offset-y="true" :close-on-content-click="false" class="pa-0">
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <v-list-item>
                        <!-- FILAMENT UNLOAD -->
                        <v-tooltip top :disabled="extrudePossible || allowUnloadFilament" color="secondary">
                            <template #activator="{ on }">
                                <div style="width: 100%" v-on="on">
                                    <v-btn
                                        :loading="loadings.includes('btnUnloadFilament')"
                                        :disabled="
                                            (!extrudePossible && !allowUnloadFilament) ||
                                            loadings.includes('btnLoadFilament') ||
                                            isPrinting
                                        "
                                        small
                                        style="width: 100%"
                                        @click="sendUnloadFilament()">
                                        <span class="d-flex align-center">
                                            <v-icon left small style="transform: rotate(270deg)" class="mr-1">
                                                {{ mdiLocationExit }}
                                            </v-icon>
                                            {{ $t('Panels.ExtruderControlPanel.UnloadFilament') }}
                                        </span>
                                    </v-btn>
                                </div>
                            </template>
                            <span>
                                {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                {{ minExtrudeTemp }} °C
                            </span>
                        </v-tooltip>
                    </v-list-item>
                    <v-list-item>
                        <!-- FILAMENT LOAD -->
                        <v-tooltip top :disabled="extrudePossible || allowLoadFilament" color="secondary">
                            <template #activator="{ on }">
                                <div style="width: 100%" v-on="on">
                                    <v-btn
                                        :loading="loadings.includes('btnLoadFilament')"
                                        :disabled="
                                            (!extrudePossible && !allowLoadFilament) ||
                                            loadings.includes('btnUnloadFilament') ||
                                            isPrinting
                                        "
                                        small
                                        style="width: 100%"
                                        @click="sendLoadFilament()">
                                        <span class="d-flex align-center">
                                            <v-icon left small style="transform: rotate(90deg)" class="mr-1">
                                                {{ mdiLocationEnter }}
                                            </v-icon>
                                            {{ $t('Panels.ExtruderControlPanel.LoadFilament') }}
                                        </span>
                                    </v-btn>
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
        <responsive :breakpoints="{ large: (el) => el.width >= 640 }">
            <template #default="{ el }">
                <!-- TOOL SELECTOR BUTTONS -->
                <v-container v-if="toolchangeMacros.length > 1" class="pb-1">
                    <v-item-group class="_btn-group py-0">
                        <v-btn
                            v-for="tool in toolchangeMacros"
                            :key="tool.name"
                            :class="tool.active ? 'primary--text' : {}"
                            :disabled="isPrinting"
                            dense
                            class="flex-grow-1 px-0"
                            @click="doSend(tool.name)">
                            {{ tool.name }}
                        </v-btn>
                    </v-item-group>
                </v-container>
                <!-- EXTRUSION FACTOR SLIDER -->
                <v-container class="pb-1">
                    <tool-slider
                        :label="$t('Panels.ExtruderControlPanel.ExtrusionFactor').toString()"
                        :icon="mdiPrinter3dNozzleOutline"
                        :target="extrudeFactor"
                        :min="1"
                        :max="200"
                        :multi="100"
                        :step="1"
                        :has-input-field="true"
                        command="M221"
                        attribute-name="S"></tool-slider>
                </v-container>
                <!-- PRESSURE ADVANCE SETTINGS -->
                <template v-if="!extruderSteppers.length > 0">
                    <v-divider></v-divider>
                    <pressure-advance-settings></pressure-advance-settings>
                </template>
                <v-divider class="pb-1"></v-divider>
                <!-- EXTRUDER INPUTS AND QUICKSELECTS -->
                <v-container>
                    <v-row>
                        <v-col>
                            <number-input
                                :label="$t('Panels.ExtruderControlPanel.FilamentLength').toString()"
                                param="feedamount"
                                :target="feedamount"
                                :disabled="isPrinting"
                                :output-error-msg="true"
                                :has-spinner="true"
                                :spinner-factor="100"
                                :step="0.01"
                                :min="0.01"
                                :max="maxExtrudeOnlyDistance"
                                :dec="2"
                                unit="mm"
                                :submit-on-blur="true"
                                @submit="setFeedamount"></number-input>
                            <v-item-group class="_btn-group pt-3">
                                <v-btn
                                    v-for="value in feedamountsSorted"
                                    :key="value"
                                    :disabled="isPrinting"
                                    dense
                                    class="_btn-qs flex-grow-1 px-0"
                                    @click="setFeedamount({ value })">
                                    {{ value }}
                                </v-btn>
                            </v-item-group>
                        </v-col>
                        <v-col>
                            <number-input
                                :label="$t('Panels.ExtruderControlPanel.ExtrusionFeedrate').toString()"
                                param="feedrate"
                                :target="feedrate"
                                :disabled="isPrinting"
                                :has-spinner="true"
                                :output-error-msg="true"
                                :spinner-factor="100"
                                :step="0.01"
                                :min="0.01"
                                :max="null"
                                :dec="2"
                                type="number"
                                unit="mm/s"
                                @submit="setFeedrate"></number-input>
                            <v-item-group class="_btn-group pt-3">
                                <v-btn
                                    v-for="value in feedratesSorted"
                                    :key="value"
                                    :disabled="isPrinting"
                                    dense
                                    class="_btn-qs flex-grow-1 px-0"
                                    @click="setFeedrate({ value })">
                                    {{ value }}
                                </v-btn>
                            </v-item-group>
                        </v-col>
                        <!-- EXTRUDE AND RETRACT BUTTON LARGE SIZED PANEL -->
                        <v-col v-if="el.is.large" class="col-3 d-flex align-center flex-column justify-center">
                            <!-- RETRACT -->
                            <v-tooltip left :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                                <template #activator="{ on }">
                                    <div class="mb-4" v-on="on">
                                        <v-btn
                                            :loading="loadings.includes('btnRetract')"
                                            :disabled="!extrudePossible || tooLargeExtrusion || isPrinting"
                                            small
                                            class="_btn-extruder-cmd"
                                            @click="sendRetract()">
                                            <v-icon small class="mr-1">{{ mdiArrowUpBold }}</v-icon>
                                            {{ $t('Panels.ExtruderControlPanel.Retract') }}
                                        </v-btn>
                                    </div>
                                </template>
                                <span v-show="!extrudePossible">
                                    {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                    {{ minExtrudeTemp }} °C
                                </span>
                                <span v-show="tooLargeExtrusion">
                                    {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                    <br />
                                    {{ $t('Panels.ExtruderControlPanel.Requested') }}:
                                    {{ feedamount * extrudeFactor }} mm
                                    <br />
                                    {{ $t('Panels.ExtruderControlPanel.Allowed') }}: {{ maxExtrudeOnlyDistance }} mm
                                </span>
                            </v-tooltip>
                            <!-- EXTRUDE  -->
                            <v-tooltip left :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                                <template #activator="{ on }">
                                    <div v-on="on">
                                        <v-btn
                                            :loading="loadings.includes('btnDetract')"
                                            :disabled="!extrudePossible || tooLargeExtrusion || isPrinting"
                                            small
                                            class="_btn-extruder-cmd"
                                            @click="sendExtrude()">
                                            <v-icon small class="mr-1">{{ mdiArrowDownBold }}</v-icon>
                                            {{ $t('Panels.ExtruderControlPanel.Extrude') }}
                                        </v-btn>
                                    </div>
                                </template>
                                <span v-show="!extrudePossible">
                                    {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                    {{ minExtrudeTemp }} °C
                                </span>
                                <span v-show="tooLargeExtrusion">
                                    {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                    <br />
                                    {{ $t('Panels.ExtruderControlPanel.Requested') }}:
                                    {{ feedamount * extrudeFactor }} mm
                                    <br />
                                    {{ $t('Panels.ExtruderControlPanel.Allowed') }}: {{ maxExtrudeOnlyDistance }} mm
                                </span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                    <!-- EXTRUDE AND RETRACT BUTTON SMALL AND MEDIUM SIZED PANEL -->
                    <v-row v-if="!el.is.large" :class="{ 'pb-1': !showEstimatedExtrusion }">
                        <v-col class="pa-0">
                            <div class="d-flex justify-space-around">
                                <div class="d-flex align-center">
                                    <!-- RETRACT -->
                                    <v-tooltip top :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                                        <template #activator="{ on }">
                                            <div class="pt-1 pb-2 px-3" v-on="on">
                                                <v-btn
                                                    :loading="loadings.includes('btnRetract')"
                                                    :disabled="!extrudePossible || tooLargeExtrusion || isPrinting"
                                                    small
                                                    class="_btn-extruder-cmd"
                                                    @click="sendRetract()">
                                                    <v-icon small class="mr-1">{{ mdiArrowUpBold }}</v-icon>
                                                    {{ $t('Panels.ExtruderControlPanel.Retract') }}
                                                </v-btn>
                                            </div>
                                        </template>
                                        <span v-show="!extrudePossible">
                                            {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                            {{ minExtrudeTemp }} °C
                                        </span>
                                        <span v-show="tooLargeExtrusion">
                                            {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                            <br />
                                            {{ $t('Panels.ExtruderControlPanel.Requested') }}:
                                            {{ feedamount * extrudeFactor }} mm
                                            <br />
                                            {{ $t('Panels.ExtruderControlPanel.Allowed') }}:
                                            {{ maxExtrudeOnlyDistance }} mm
                                        </span>
                                    </v-tooltip>
                                    <!-- EXTRUDE  -->
                                    <v-tooltip top :disabled="extrudePossible && !tooLargeExtrusion" color="secondary">
                                        <template #activator="{ on }">
                                            <div class="pt-1 pb-2 px-3" v-on="on">
                                                <v-btn
                                                    :loading="loadings.includes('btnDetract')"
                                                    :disabled="!extrudePossible || tooLargeExtrusion || isPrinting"
                                                    small
                                                    class="_btn-extruder-cmd"
                                                    @click="sendExtrude()">
                                                    <v-icon small class="mr-1">{{ mdiArrowDownBold }}</v-icon>
                                                    {{ $t('Panels.ExtruderControlPanel.Extrude') }}
                                                </v-btn>
                                            </div>
                                        </template>
                                        <span v-show="!extrudePossible">
                                            {{ $t('Panels.ExtruderControlPanel.ExtruderTempTooLow') }}
                                            {{ minExtrudeTemp }} °C
                                        </span>
                                        <span v-show="tooLargeExtrusion">
                                            {{ $t('Panels.ExtruderControlPanel.TooLargeExtrusion') }}
                                            <br />
                                            {{ $t('Panels.ExtruderControlPanel.Requested') }}:
                                            {{ feedamount * extrudeFactor }} mm
                                            <br />
                                            {{ $t('Panels.ExtruderControlPanel.Allowed') }}:
                                            {{ maxExtrudeOnlyDistance }} mm
                                        </span>
                                    </v-tooltip>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
                <!-- EXTRUSION ESTIMATION NOTE -->
                <v-container v-if="showEstimatedExtrusion" class="pa-0 ma-0 pb-2">
                    <div
                        v-if="filamentDiameter && nozzleDiameter"
                        style="font-size: 0.8em"
                        class="text--disabled text-caption font-weight-light d-flex justify-center">
                        {{ $t('Panels.ExtruderControlPanel.EstimatedExtrusion') }} ~ {{ extrudedLength }} mm @
                        {{ volumetricFlow }} mm³/s
                    </div>
                </v-container>
            </template>
        </responsive>
    </panel>
</template>

<script lang="ts">
import {
    mdiArrowDownBold,
    mdiArrowUpBold,
    mdiPrinter3dNozzle,
    mdiPrinter3dNozzleOutline,
    mdiLocationEnter,
    mdiLocationExit,
    mdiDotsVertical,
} from '@mdi/js'
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { PrinterStateExtruder, PrinterStateExtruderStepper, PrinterStateToolchangeMacro } from '@/store/printer/types'
import BaseMixin from '../mixins/base'
import ControlMixin from '../mixins/control'
import NumberInput from '@/components/inputs/NumberInput.vue'
import Panel from '@/components/ui/Panel.vue'
import PressureAdvanceSettings from '@/components/panels/MachineSettings/PressureAdvanceSettings.vue'
import Responsive from '@/components/ui/Responsive.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'

@Component({
    components: {
        Panel,
        PressureAdvanceSettings,
        NumberInput,
        Responsive,
        ToolSlider,
    },
})
export default class ExtruderControlPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiArrowUpBold = mdiArrowUpBold
    mdiArrowDownBold = mdiArrowDownBold
    mdiPrinter3dNozzle = mdiPrinter3dNozzle
    mdiPrinter3dNozzleOutline = mdiPrinter3dNozzleOutline
    mdiLocationEnter = mdiLocationEnter
    mdiLocationExit = mdiLocationExit
    mdiDotsVertical = mdiDotsVertical

    private allowUnloadFilament: boolean = false
    private allowLoadFilament: boolean = false

    get isPrinting(): boolean {
        return ['printing'].includes(this.printer_state)
    }

    get toolchangeMacros(): PrinterStateToolchangeMacro[] {
        return this.$store.getters['printer/getToolchangeMacros']
    }

    get filamentChangeMacros(): boolean {
        let filamentMacros: string[] = []
        const allMacros = this.$store.getters['printer/getMacros']

        /**
         * find the index of the LOAD_FILAMENT and UNLOAD_FILAMENT gcode macro.
         * if found, push the name to filamentMacros array,
         * to check later if both necessary macros are present
         */
        const loadFilamentMacro: number = allMacros.findIndex((macro: any) => {
            if (macro.name === 'LOAD_FILAMENT') {
                filamentMacros.push(macro.name)
                return true
            }
        })
        const unloadFilamentMacro: number = allMacros.findIndex((macro: any) => {
            if (macro.name === 'UNLOAD_FILAMENT') {
                filamentMacros.push(macro.name)
                return true
            }
        })

        /**
         * define the strings of which the gcode macro must contain
         * at least one in order to be allowed to be executed
         * even if at the current time extrudePossible === false
         */
        const commands = ['printer.extruder.can_extrude', 'TEMPERATURE_WAIT', 'M109']
        if (commands.some((command) => allMacros[loadFilamentMacro].prop.gcode.includes(command))) {
            this.allowLoadFilament = true
        }
        if (commands.some((command) => allMacros[unloadFilamentMacro].prop.gcode.includes(command))) {
            this.allowUnloadFilament = true
        }

        return filamentMacros.length === 2
    }

    get extruders(): PrinterStateExtruder[] {
        return this.$store.getters['printer/getExtruders']
    }

    get extruderSteppers(): PrinterStateExtruderStepper[] {
        return this.$store.getters['printer/getExtruderSteppers']
    }

    get activeExtruder(): string {
        return this.$store.state.printer.toolhead?.extruder
    }

    get filamentDiameter(): number {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]?.filament_diameter ?? 1.75
    }

    get nozzleDiameter(): number {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]?.nozzle_diameter ?? 0.4
    }

    get feedamounts(): number[] {
        return this.$store.state.gui.control.extruder?.feedamounts ?? []
    }

    get feedrates(): number[] {
        return this.$store.state.gui.control.extruder?.feedrates ?? []
    }

    get feedamountsSorted(): number[] {
        return [...this.feedamounts].sort((a, b) => {
            return b - a
        })
    }

    get feedratesSorted(): number[] {
        return [...this.feedrates].sort((a, b) => {
            return b - a
        })
    }

    get feedamount(): number {
        return parseFloat(this.$store.state.gui.control.extruder.feedamount)
    }

    setFeedamount(params: { value: number }): void {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamount', value: params.value })
    }

    get feedrate(): number {
        return parseFloat(this.$store.state.gui.control.extruder.feedrate)
    }

    setFeedrate(params: { value: number }): void {
        this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrate', value: params.value })
    }

    get extrudePossible(): boolean {
        return this.$store.getters['printer/getExtrudePossible']
    }

    get minExtrudeTemp(): number {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]?.min_extrude_temp ?? 170
    }

    get maxExtrudeOnlyDistance(): number {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]?.max_extrude_only_distance ?? 50
    }

    get tooLargeExtrusion(): boolean {
        return this.feedamount * this.extrudeFactor > this.maxExtrudeOnlyDistance
    }

    get extrudedLength(): number {
        return Math.round(this.feedamount * this.extrudeFactor * (this.filamentDiameter / this.nozzleDiameter))
    }

    get volumetricFlow(): number {
        return Math.round(Math.pow(this.filamentDiameter / 2, 2) * Math.PI * this.feedrate * 10) / 10
    }

    get extrudeFactor() {
        return this.$store.state.printer?.gcode_move?.extrude_factor ?? 1
    }

    get showEstimatedExtrusion() {
        return this.$store.state.gui.control.extruder.showEstimatedExtrusionInfo
    }

    @Watch('maxExtrudeOnlyDistance', { immediate: true })
    onMaxExtrudeOnlyDistanceChange(): void {
        /**
         * If, while switching from ex. A to ex. B, the feedamount
         * from ex. A exceeds the maxExtrudeOnlyDistance of ex. B,
         * set the feedamount to maxExtrudeOnlyDistance of ex. B
         */
        if (this.feedamount > this.maxExtrudeOnlyDistance) {
            this.setFeedamount({ value: this.maxExtrudeOnlyDistance })
        }
    }

    sendRetract(): void {
        const gcode = `M83\nG1 E-${this.feedamount} F${this.feedrate * 60}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnRetract' })
    }

    sendExtrude(): void {
        const gcode = `M83\nG1 E${this.feedamount} F${this.feedrate * 60}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnDetract' })
    }

    sendUnloadFilament(): void {
        const gcode = 'UNLOAD_FILAMENT'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnUnloadFilament' })
    }

    sendLoadFilament(): void {
        const gcode = 'LOAD_FILAMENT'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'btnLoadFilament' })
    }
}
</script>

<style lang="scss" scoped>
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

._btn-qs {
    font-size: 0.8rem !important;
    max-height: 24px;
}

._btn-extruder-cmd {
    min-width: 135px !important;
}
</style>
