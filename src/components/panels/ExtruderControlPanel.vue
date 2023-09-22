<template>
    <panel
        v-if="klipperReadyForGui && extruders.length"
        :icon="mdiPrinter3dNozzle"
        :title="$t('Panels.ExtruderControlPanel.Headline').toString()"
        :collapsible="true"
        card-class="extruder-control-panel">
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
                                        :alias="$t('Panels.ExtruderControlPanel.UnloadFilament').toString()"
                                        :disabled="!canExecuteUnloadMacro || isPrinting"
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
                                        :alias="$t('Panels.ExtruderControlPanel.LoadFilament').toString()"
                                        :disabled="!canExecuteLoadMacro || isPrinting"
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
        <responsive :breakpoints="{ large: (el) => el.width >= 640 }">
            <template #default="{ el }">
                <!-- TOOL SELECTOR BUTTONS -->
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
                                {{ !isIdex ? tool.name : tool.title == null ? tool.name : tool.title }}
                            </v-btn>
                        </v-item-group>
                    </v-row>
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
                <template v-if="!(extruderSteppers.length > 0)">
                    <v-divider></v-divider>
                    <pressure-advance-settings></pressure-advance-settings>
                </template>
                <!-- FIRMWARE RETRACTION SETTINGS -->
                <template v-if="existsFirmwareRetraction">
                    <v-divider></v-divider>
                    <firmware-retraction-settings></firmware-retraction-settings>
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
                        <span>
                            {{ $t('Panels.ExtruderControlPanel.EstimatedExtrusion') }} ~ {{ extrudedLength }} mm @
                            {{ volumetricFlow }} mm³/s -
                            <v-icon x-small style="opacity: 0.4; margin-top: -2px">
                                {{ mdiDiameterVariant }}
                            </v-icon>
                            {{ nozzleDiameter }} mm
                        </span>
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
    mdiDotsVertical,
    mdiDiameterVariant,
} from '@mdi/js'
import { Component, Mixins, Watch } from 'vue-property-decorator'
import {
    PrinterStateExtruder,
    PrinterStateExtruderStepper,
    PrinterStateMacro,
    PrinterStateToolchangeMacro,
} from '@/store/printer/types'
import BaseMixin from '../mixins/base'
import ControlMixin from '../mixins/control'
import NumberInput from '@/components/inputs/NumberInput.vue'
import Panel from '@/components/ui/Panel.vue'
import PressureAdvanceSettings from '@/components/panels/ExtruderSettings/PressureAdvanceSettings.vue'
import FirmwareRetractionSettings from '@/components/panels/ExtruderSettings/FirmwareRetractionSettings.vue'
import Responsive from '@/components/ui/Responsive.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import TheScrewsTiltAdjustDialog from '../dialogs/TheScrewsTiltAdjustDialog.vue'

@Component({
    components: {
        Panel,
        PressureAdvanceSettings,
        FirmwareRetractionSettings,
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
    mdiDotsVertical = mdiDotsVertical
    mdiDiameterVariant = mdiDiameterVariant

    private heatWaitGcodes = ['printer.extruder.can_extrude', 'TEMPERATURE_WAIT', 'M109']

    get isPrinting(): boolean {
        return ['printing'].includes(this.printer_state)
    }

    get macros() {
        return this.$store.getters['printer/getMacros']
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

    get toolchangeMacros(): PrinterStateToolchangeMacro[] {
        return this.$store.getters['printer/getToolchangeMacros']
    }

    get loadFilamentMacro() {
        return this.macros.find((macro: PrinterStateMacro) => macro.name.toUpperCase() === 'LOAD_FILAMENT')
    }

    get unloadFilamentMacro() {
        return this.macros.find((macro: PrinterStateMacro) => macro.name.toUpperCase() === 'UNLOAD_FILAMENT')
    }

    /**
     * test if the load and unload macro include specific keywords. if true, we allow
     * execution of that macro even if at the current time extrudePossible === false
     */
    get canExecuteLoadMacro(): boolean {
        if (this.extrudePossible) return true

        return this.heatWaitGcodes.some((gcode) => this.loadFilamentMacro.prop.gcode.includes(gcode))
    }

    get canExecuteUnloadMacro(): boolean {
        if (this.extrudePossible) return true

        return this.heatWaitGcodes.some((gcode) => this.unloadFilamentMacro.prop.gcode.includes(gcode))
    }

    get showFilamentMacros(): boolean {
        return this.loadFilamentMacro !== undefined || this.unloadFilamentMacro !== undefined
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
        return Math.round(
            this.feedamount *
                this.extrudeFactor *
                (Math.pow(this.filamentDiameter, 2) / Math.pow(this.nozzleDiameter, 2))
        )
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

    get isIdex(): boolean {
        return 'dual_carriage' in this.$store.state.printer
    }

    get idexMode(): string {
        return this.$store.state.printer.dual_carriage?.carriage_1?.toString().toLowerCase()
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

._btn-qs {
    font-size: 0.8rem !important;
    max-height: 24px;
}

._btn-extruder-cmd {
    min-width: 135px !important;
}
</style>
