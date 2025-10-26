<template>
    <svg ref="filStatusSvg" viewBox="140 20 285 421" preserveAspectRatio="xMidYMid meet" class="svg-colors">
        <defs>
            <g
                id="sync-feedback"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="stroke: var(--color-outline)">
                <path d="M18,9,13.78,3.39a1,1,0,0,0-1.56,0L8,9" stroke-width="1" stroke-opacity="0.8" />
                <path d="M13,8.24,18,15H15H8Z" stroke-width="2" />
            </g>
            <g
                id="sissors"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="stroke: var(--color-outline)">
                <path
                    d="M8.8,7.72c-.6,1.21-2.34,1.64-3.89,1S2.6,6.48,3.2,5.28s2.34-1.64,3.89-1S9.4,6.52,8.8,7.72Zm-3.89,1L21,16M7.09,19.68c-1.55.68-3.29.25-3.89-1s.17-2.73,1.71-3.4,3.29-.25,3.89,1S8.63,19,7.09,19.68ZM21,8,4.91,15.32"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2" />
                <line x1="31" y1="12.5" x2="44" y2="12.5" stroke-width="1" stroke-dasharray="2,2" />
            </g>
            <g id="blob" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="0,0 -1,1 1,1 0,0" stroke-width="4" vector-effect="non-scaling-stroke" />
                <polygon
                    points="-0.1,0.3 -0.5,0.7 0.3,0.7 -0.1,0.3"
                    stroke-width="1"
                    stroke="white"
                    fill="white"
                    opacity="0.3"
                    vector-effect="non-scaling-stroke" />
            </g>
        </defs>

        <rect x="150" y="30" width="265" height="130" class="zone-background" rx="10" ry="10" />
        <rect x="150" y="333" width="265" height="66" class="zone-background" rx="10" ry="10" />
        <g style="stroke: var(--color-outline)">
            <path
                fill="none"
                d="M242 25 L242 405 L249 411 L251 411 L258 405 L258 25"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1" />
        </g>

        <rect
            ref="filamentRect"
            x="243"
            y="25"
            width="14"
            :height="filamentRectHeight"
            :fill="currentGateColor"
            :class="tipFormingClass" />
        <polygon v-if="upperNozzleFull" points="257,380 243,380 243,396 257,396" :fill="upperNozzleColor" />
        <polygon
            v-if="lowerNozzleFull"
            points="257,396 243,396 243,405 249,412 249,413 251,413 251,412 257,405"
            :fill="lowerNozzleColor" />

        <g
            style="stroke: var(--color-outline); font-family: 'Roboto', sans-serif; font-size: 16px"
            stroke-linejoin="round"
            stroke-width="0">
            <mmu-filament-status-sensor
                sensor-name="mmu_pre_gate"
                :sensor-text="$t('Panels.MmuPanel.PreGate')"
                :y-position="50" />
            <mmu-filament-status-sensor
                sensor-name="mmu_gear"
                :sensor-text="$t('Panels.MmuPanel.Gear')"
                :y-position="80" />
            <mmu-filament-status-sensor sensor-name="mmu_gate" :sensor-text="gateSensorName" :y-position="110" />

            <mmu-filament-status-encoder v-if="hasMmuEncoder" />

            <mmu-filament-status-sensor
                sensor-name="extruder"
                :sensor-text="$t('Panels.MmuPanel.Extruder')"
                :y-position="320"
                :outside-zone="true" />

            <transition name="fade">
                <text v-if="homedToExtruderEntrance" x="219.5" y="339" font-weight="bold">H</text>
            </transition>

            <mmu-filament-status-sensor
                sensor-name="toolhead"
                :sensor-text="$t('Panels.MmuPanel.Toolhead')"
                :y-position="350" />

            <mmu-filament-status-temperature />

            <mmu-filament-status-sync-feedback />

            <text x="160" y="60" :class="toolClass">{{ toolText }}</text>
        </g>

        <transition name="fade">
            <g v-if="syncDrive" id="sync-extruder" ref="sync" transform="translate(278, 385) scale(.030)">
                <g
                    stroke="none"
                    stroke-width="2"
                    stroke-dasharray="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-miterlimit="4">
                    <rect fill="rgb(131, 148, 150)" x="145" y="506" width="710" height="256" />
                    <rect fill="rgb(147, 161, 161)" x="324" y="506" width="355" height="256" />
                    <rect fill="rgb(101, 123, 131)" x="274" y="364" width="455" height="142" />
                    <rect fill="rgb(88, 110, 117)" x="181" y="222" rx="28" ry="28" width="639" height="142" />
                    <rect fill="rgb(88, 110, 117)" x="181" y="108" width="639" height="142" />
                    <path fill="rgb(88, 110, 117)" d="m 322 762 h 355 l -118 142 h -118 z" />
                </g>
                <g transform="matrix(23.2058 0 0 23.2058 329.7195 325.9517)">
                    <path
                        fill="rgb(254, 162, 54)"
                        fill-rule="nonzero"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="0"
                        stroke-dasharray="none"
                        stroke-dashoffset="miter"
                        stroke-linecap="butt"
                        stroke-linejoin="miter"
                        stroke-miterlimit="4"
                        vector-effect="non-scaling-stroke"
                        transform=" translate(-15.4288, -16.4198)"
                        d="M 25.032 26.16 c 2.884 -2.883 4.184 -6.74 3.928 -10.51 c -1.511 0.013 -3.021 0.021 -4.531 0.034 c 0.254 2.599 -0.603 5.287 -2.594 7.277 c -3.535 3.533 -9.263 3.533 -12.796 0 c -3.534 -3.533 -3.534 -9.26 0 -12.794 c 3.015 -3.016 7.625 -3.446 11.109 -1.314 c -1.181 1.167 -2.57 2.549 -2.57 2.549 c -1 1.062 0.016 1.766 0.69 1.77 h 8.828 c 0.338 0 0.611 -0.274 0.612 -0.612 V 3.804 c 0.041 -0.825 -0.865 -1.591 -1.756 -0.7 c 0 0 -1.495 1.48 -2.533 2.509 C 18.112 1.736 10.634 2.175 5.841 6.967 c -5.3 5.3 -5.3 13.892 0 19.193 C 11.141 31.459 19.733 31.459 25.032 26.16 z" />
                </g>
            </g>
        </transition>

        <transition name="fade">
            <g
                v-if="isGripped"
                id="filament-grip"
                ref="grip"
                transform="scale(.1) translate(1900, 420)"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path
                    fill="rgb(131,148,150)"
                    d="M368,368 V376 C368,380.41,364.41,384,360,384 H344 V360 H360 C364.41,360,368,363.59,368,368 Z M368,408 V416 C368,420.41,364.41,424,360,424 C293.65,424,340.73,424,312,424 C307.59,424,304,420.41,304,416 V408 C304,403.59,307.59,400,312,400 C326.91,400,345.09,400,360,400 C364.41,400,368,403.59,368,408 Z M248.97,461.66 L242.34,455.03 C237.81,450.5,231.78,448,225.38,448 H160 V368 H193.38 C199.79,368,205.82,365.5,210.35,360.97 L248.97,322.35 C250.49,320.84,252.5,320,254.63,320 H320 C324.42,320,328,323.59,328,328 V384 C322.21,384,317.79,384,312,384 C307.59,384,304,380.42,304,376 V350.61 C304,346.19,300.43,342.61,296,342.61 S288,346.19,288,350.61 V357.2 L262.56,389 C261.04,390.91,258.75,392,256.31,392 H217.05 C212.63,392,209.05,395.58,209.05,400 S212.63,408,217.05,408 H256.31 C263.64,408,270.47,404.72,275.06,399 L288.74,381.9 C289.71,385.74,291.62,389.21,294.2,392.06 C290.39,396.31,288,401.86,288,408 V416 C288,427.06,295.56,436.31,305.76,439.08 C304.65,441.84,304,444.85,304,448.01 V456.01 C304,458.82,304.58,461.49,305.48,464.01 H254.63 C252.49,464.01,250.48,463.17,248.97,461.67 Z M368,456 C368,460.41,364.41,464,360,464 H328 C323.59,464,320,460.41,320,456 V448 C320,443.59,323.59,440,328,440 H360 C364.41,440,368,443.59,368,448 V456 Z M368,328 V336 C368,340.41,364.41,344,360,344 H344 V328 C344,325.18,343.42,322.51,342.53,320 H360 C364.41,320,368,323.59,368,328 Z" />
                <path
                    :fill="currentGateColor"
                    d="M300,250 L350,250 L350,310 L300,310 Z M300,475 L350,475 L350,520 L300,520 Z" />
            </g>
        </transition>

        <use v-if="mmuAction === ACTION_CUTTING_FILAMENT" ref="cut" xlink:href="#sissors" class="cut1-effect" />
        <use v-if="mmuAction === ACTION_CUTTING_TIP" ref="cutTip" xlink:href="#sissors" class="cut2-effect" />

        <use
            v-if="mmuAction === ACTION_PURGING"
            ref="poop"
            xlink:href="#blob"
            class="blob-effect"
            :stroke="lowerNozzleColor"
            :fill="lowerNozzleColor" />
    </svg>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    ACTION_CUTTING_FILAMENT,
    ACTION_CUTTING_TIP,
    ACTION_FORMING_TIP,
    ACTION_PURGING,
    FILAMENT_POS_END_BOWDEN,
    FILAMENT_POS_EXTRUDER_ENTRY,
    FILAMENT_POS_HOMED_ENTRY,
    FILAMENT_POS_HOMED_EXTRUDER,
    FILAMENT_POS_HOMED_GATE,
    FILAMENT_POS_HOMED_TS,
    FILAMENT_POS_IN_BOWDEN,
    FILAMENT_POS_IN_EXTRUDER,
    FILAMENT_POS_LOADED,
    FILAMENT_POS_START_BOWDEN,
    FILAMENT_POS_UNLOADED,
    TOOL_GATE_BYPASS,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'
import MmuFilamentStatusEncoder from '@/components/panels/Mmu/MmuFilamentStatusEncoder.vue'
import MmuFilamentStatusSensor from '@/components/panels/Mmu/MmuFilamentStatusSensor.vue'
import MmuFilamentStatusTemperature from '@/components/panels/Mmu/MmuFilamentStatusTemperature.vue'

const POSITIONS = {
    UNKNOWN: 8,
    BEFORE_PRE_GATE: 20,
    PRE_GATE: 25,
    AFTER_PRE_GATE: 40,
    BEFORE_GEAR: 50,
    GEAR: 55,
    AFTER_GEAR: 70,
    GATE: 85,
    AFTER_GATE: 100,
    ENCODER: 115,
    START_BOWDEN: 135,
    MID_BOWDEN: 221,
    END_BOWDEN: 290,
    EXTRUDER: 295,
    EXTRUDER_ENTRANCE: 308,
    BEFORE_TOOLHEAD: 315,
    TOOLHEAD: 325,
    COOLING_TUBE: 338,
    CUT_POINT: 355,
    NOZZLE_START: 371,
} as const

const BOWDEN_RANGE = 173

@Component({
    components: {
        MmuFilamentStatusTemperature,
        MmuFilamentStatusSensor,
        MmuFilamentStatusEncoder,
    },
})
export default class MmuFilamentStatus extends Mixins(BaseMixin, MmuMixin) {
    ACTION_CUTTING_FILAMENT = ACTION_CUTTING_FILAMENT
    ACTION_CUTTING_TIP = ACTION_CUTTING_TIP
    ACTION_PURGING = ACTION_PURGING

    get tipFormingClass() {
        return this.mmuAction === ACTION_FORMING_TIP ? 'form-tip-effect' : ''
    }

    get filamentRectHeight() {
        window.console.log('Calculating filament height for position:', this.filamentPos, this.mmuGate)

        if (this.mmuGate === TOOL_GATE_BYPASS) {
            if (this.filamentPos === FILAMENT_POS_EXTRUDER_ENTRY) return POSITIONS.BEFORE_TOOLHEAD
            if (this.filamentPos === FILAMENT_POS_HOMED_TS) return POSITIONS.TOOLHEAD
            if (this.filamentPos === FILAMENT_POS_IN_EXTRUDER) return POSITIONS.COOLING_TUBE
            if (this.filamentPos === FILAMENT_POS_LOADED) return POSITIONS.NOZZLE_START

            if (this.toolheadSensor === true) return POSITIONS.TOOLHEAD
            if (this.extruderSensor === true) return POSITIONS.EXTRUDER
            if (this.mmuGearSensor === true) return POSITIONS.AFTER_GEAR
            if (this.mmuPreGateSensor === true) return POSITIONS.AFTER_PRE_GATE

            return POSITIONS.BEFORE_PRE_GATE
        }

        if (this.filamentPos === FILAMENT_POS_UNLOADED) {
            if (this.mmuGearSensor === true) return POSITIONS.AFTER_GEAR
            if (this.mmuPreGateSensor === true) return POSITIONS.AFTER_PRE_GATE

            return POSITIONS.BEFORE_PRE_GATE
        }

        if (this.filamentPos === FILAMENT_POS_HOMED_GATE) {
            if (this.configGateHomingEndstop === 'mmu_gear') return POSITIONS.GEAR
            if (this.configGateHomingEndstop === 'mmu_gate') return POSITIONS.GATE
            if (this.configGateHomingEndstop === 'extruder') return POSITIONS.EXTRUDER

            return POSITIONS.AFTER_GATE
        }

        if (
            [FILAMENT_POS_START_BOWDEN, FILAMENT_POS_IN_BOWDEN].includes(this.filamentPos) &&
            this.bowdenProgress >= 0
        ) {
            return POSITIONS.START_BOWDEN + (BOWDEN_RANGE * this.bowdenProgress) / 100
        }

        if (this.filamentPos === FILAMENT_POS_START_BOWDEN) return POSITIONS.START_BOWDEN
        if (this.filamentPos === FILAMENT_POS_IN_BOWDEN) return POSITIONS.MID_BOWDEN

        if (this.filamentPos === FILAMENT_POS_END_BOWDEN) {
            if (
                this.configGateHomingEndstop === 'none' ||
                (this.toolheadSensor !== undefined && this.toolheadSensor !== null && !this.configExtruderForceHoming)
            )
                return POSITIONS.EXTRUDER_ENTRANCE

            return POSITIONS.END_BOWDEN
        }

        if (this.filamentPos === FILAMENT_POS_HOMED_ENTRY) return POSITIONS.EXTRUDER
        if (this.filamentPos === FILAMENT_POS_HOMED_EXTRUDER) return POSITIONS.EXTRUDER_ENTRANCE
        if (this.filamentPos === FILAMENT_POS_EXTRUDER_ENTRY) return POSITIONS.BEFORE_TOOLHEAD
        if (this.filamentPos === FILAMENT_POS_HOMED_TS) return POSITIONS.TOOLHEAD
        if (this.filamentPos === FILAMENT_POS_IN_EXTRUDER) {
            if (this.toolheadSensor === false) return POSITIONS.BEFORE_TOOLHEAD

            return POSITIONS.COOLING_TUBE
        }

        if (this.filamentPos === FILAMENT_POS_LOADED) return POSITIONS.NOZZLE_START

        return POSITIONS.UNKNOWN
    }

    get toolheadSensor() {
        return this.getMmuSensor('toolhead')
    }

    get extruderSensor() {
        return this.getMmuSensor('extruder')
    }

    get mmuGearSensor() {
        return this.getMmuSensor('mmu_gear')
    }

    get mmuPreGateSensor() {
        return this.getMmuSensor('mmu_pre_gate')
    }

    get configExtruderForceHoming(): boolean {
        return (this.$store.state.printer.configfile.config.mmu?.extruder_force_homing ?? 0) === 1
    }

    get gateSensorName() {
        const unit = this.getMmuMachineUnit(this.unit)
        const multiGate = unit?.multi_gear ?? false

        return multiGate ? 'Hub (Gate)' : 'Gate'
    }

    get toolClass() {
        return this.mmuGate === TOOL_GATE_BYPASS ? 'tool-bypass' : 'tool-text'
    }

    get toolText() {
        if (this.mmuTool === TOOL_GATE_UNKNOWN) return 'T?'

        return this.mmuTool === TOOL_GATE_BYPASS ? 'Bypass' : `T${this.mmuTool}`
    }

    get homedToExtruderEntrance(): boolean {
        return this.filamentPos === FILAMENT_POS_HOMED_EXTRUDER
    }

    get upperNozzleFull(): boolean {
        return this.filamentPos === FILAMENT_POS_LOADED || !!this.varsFilamentRemaining
    }

    get lowerNozzleFull() {
        return (
            this.filamentPos === FILAMENT_POS_LOADED ||
            !!this.varsFilamentRemaining ||
            !!this.varsFilamentRemainingColor
        )
    }

    get upperNozzleColor() {
        return this.varsFilamentRemaining ? this.varsFilamentRemainingColor : 'none'
    }

    get lowerNozzleColor() {
        return this.varsFilamentRemainingColor || this.currentGateColor
    }

    get currentGateColor() {
        let color = this.$store.state.printer.mmu?.gate_color[this.mmuGate] ?? ''

        if (this.mmuGate === TOOL_GATE_BYPASS) {
            // Assume active spoolman spool if available
            color = this.$store.state.server.spoolman?.active_spool?.filament.color_hex ?? null
        }
        return this.formColorString(color)
    }

    get isGripped() {
        return this.grip === 'Gripped' || this.servo === 'Down'
    }
}
</script>

<style scoped>
.svg-colors {
    --background-light-theme: #ffffff;
    --zone-background-light-theme: #f0f0f0;
    --background-dark-theme: #1e1e1e;
    --zone-background-dark-theme: #2c2c2c;
    --disabled-stroke: #808080;
    --color-outline: #2ca9bc;
}

svg text {
    fill: currentColor;
}

.zone-background {
    fill: var(--zone-background-dark-theme);
}

html.theme--light .zone-background {
    fill: var(--zone-background-light-theme);
}

.tool-text {
    font-size: 28px;
    font-weight: bold;
}

.tool-bypass {
    font-size: 16px;
    font-weight: normal;
}

@keyframes fadeInOut {
    0%,
    100% {
        opacity: 0;
        transform: translate(250px, 414px) scale(1);
    }
    90% {
        opacity: 1;
        transform: translate(250px, 414px) scale(16);
    }
}
.blob-effect {
    animation: fadeInOut 4s infinite;
}

@keyframes cut1 {
    0%,
    100% {
        opacity: 0.5;
        transform: translate(190px, 145px) scale(1.2);
    }
    30%,
    70% {
        opacity: 1;
        transform: translate(205px, 145px) scale(1.2);
    }
}
.cut1-effect {
    animation: cut1 3s infinite;
}

@keyframes cut2 {
    0%,
    100% {
        opacity: 0.5;
        transform: translate(190px, 365px) scale(1.2);
    }
    30%,
    70% {
        opacity: 1;
        transform: translate(205px, 365px) scale(1.2);
    }
}
.cut2-effect {
    animation: cut2 3s infinite;
}

@keyframes form-tip {
    0%,
    100% {
        height: 371px;
    }
    50% {
        height: 338px;
    }
}
.form-tip-effect {
    animation: form-tip 1s infinite;
}
</style>
