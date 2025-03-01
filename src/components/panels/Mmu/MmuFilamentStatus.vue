<template>
    <svg ref="filStatusSvg" viewBox="140 20 285 421" preserveAspectRatio="xMidYMid meet">
        <defs>
            <g
                id="sync-feedback"
                :style="'stroke:' + colorOutline + '; stroke-linecap: round; stroke-linejoin: round; fill: none;'">
                <path d="M18,9,13.78,3.39a1,1,0,0,0-1.56,0L8,9" style="stroke-width: 1; stroke-opacity: 0.8"></path>
                <path d="M13,8.24,18,15H15H8Z" style="stroke-width: 2"></path>
            </g>

            <g
                id="sissors"
                :style="'stroke:' + colorOutline + ';fill: none; stroke-linecap: round; stroke-linejoin: round;'">
                <path
                    d="M8.8,7.72c-.6,1.21-2.34,1.64-3.89,1S2.6,6.48,3.2,5.28s2.34-1.64,3.89-1S9.4,6.52,8.8,7.72Zm-3.89,1L21,16M7.09,19.68c-1.55.68-3.29.25-3.89-1s.17-2.73,1.71-3.4,3.29-.25,3.89,1S8.63,19,7.09,19.68ZM21,8,4.91,15.32"
                    style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2"></path>
                <line x1="31" y1="12.5" x2="44" y2="12.5" style="stroke-width: 1; stroke-dasharray: 2, 2" />
            </g>

            <g id="sync-extruder">
                <g
                    style="
                        stroke: none;
                        stroke-width: 2;
                        stroke-dasharray: none;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                        stroke-miterlimit: 4;
                    ">
                    <rect style="fill: rgb(131, 148, 150)" x="145" y="506" width="710" height="256" />
                    <rect style="fill: rgb(147, 161, 161)" x="324" y="506" width="355" height="256" />
                    <rect style="fill: rgb(101, 123, 131)" x="274" y="364" width="455" height="142" />
                    <rect style="fill: rgb(88, 110, 117)" x="181" y="222" rx="28" ry="28" width="639" height="142" />
                    <rect style="fill: rgb(88, 110, 117)" x="181" y="108" width="639" height="142" />
                    <path style="fill: rgb(88, 110, 117)" d="m 322 762 h 355 l -118 142 h -118 z" />
                </g>
                <g transform="matrix(23.2058 0 0 23.2058 329.7195 325.9517)">
                    <path
                        style="
                            stroke: rgb(0, 0, 0);
                            stroke-width: 0;
                            stroke-dasharray: none;
                            stroke-linecap: butt;
                            stroke-dashoffset: 0;
                            stroke-linejoin: miter;
                            stroke-miterlimit: 4;
                            is-custom-font: none;
                            font-file-url: none;
                            fill: rgb(254, 162, 54);
                            fill-rule: nonzero;
                            opacity: 1;
                        "
                        vector-effect="non-scaling-stroke"
                        transform=" translate(-15.4288, -16.4198)"
                        stroke-linecap="round"
                        d="M 25.032 26.16 c 2.884 -2.883 4.184 -6.74 3.928 -10.51 c -1.511 0.013 -3.021 0.021 -4.531 0.034 c 0.254 2.599 -0.603 5.287 -2.594 7.277 c -3.535 3.533 -9.263 3.533 -12.796 0 c -3.534 -3.533 -3.534 -9.26 0 -12.794 c 3.015 -3.016 7.625 -3.446 11.109 -1.314 c -1.181 1.167 -2.57 2.549 -2.57 2.549 c -1 1.062 0.016 1.766 0.69 1.77 h 8.828 c 0.338 0 0.611 -0.274 0.612 -0.612 V 3.804 c 0.041 -0.825 -0.865 -1.591 -1.756 -0.7 c 0 0 -1.495 1.48 -2.533 2.509 C 18.112 1.736 10.634 2.175 5.841 6.967 c -5.3 5.3 -5.3 13.892 0 19.193 C 11.141 31.459 19.733 31.459 25.032 26.16 z" />
                </g>
            </g>
            <g id="blob" style="stroke-linecap: round; stroke-linejoin: round">
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

        <rect
            x="150"
            y="30"
            width="265"
            height="130"
            :class="$vuetify.theme.dark ? 'zone-background-dark-theme' : 'zone-background-light-theme'"
            rx="10"
            ry="10" />
        <rect
            x="150"
            y="333"
            width="265"
            height="66"
            :class="$vuetify.theme.dark ? 'zone-background-dark-theme' : 'zone-background-light-theme'"
            rx="10"
            ry="10" />
        <g :style="'stroke:' + colorOutline + '; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1;'">
            <path
                d="M242 25 L242 405 L249 411 L251 411 L258 405 L258 25"
                style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1"></path>
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
            :style="
                'stroke:' +
                colorOutline +
                '; fill:' +
                colorFont +
                '; stroke-linejoin: round; stroke-width: 0; font-family: Roboto; font-size: 16;'
            ">
            <g v-if="hasSensor('mmu_pre_gate')">
                <circle cx="258" cy="50" r="8" style="stroke-width: 1" :class="sensorClass('mmu_pre_gate')" />
                <text x="278" y="55" :class="{ 'text-disabled': !isSensorEnabled('mmu_pre_gate') }">Pre-Gate</text>
            </g>

            <g v-if="hasSensor('mmu_gear')">
                <circle cx="258" cy="80" r="8" style="stroke-width: 1" :class="sensorClass('mmu_gear')" />
                <text x="278" y="85" :class="{ 'text-disabled': !isSensorEnabled('mmu_gear') }">Gear</text>
                <text v-if="homedToGear" x="219.5" y="85" font-weight="bold">H</text>
            </g>

            <g v-if="hasSensor('mmu_gate')">
                <circle cx="258" cy="110" r="8" style="stroke-width: 1" :class="sensorClass('mmu_gate')" />
                <text x="278" y="115" :class="{ 'text-disabled': !isSensorEnabled('mmu_gate') }">Gate</text>
                <transition name="fade">
                    <text v-if="homedToGate" x="219.5" y="115" font-weight="bold">H</text>
                </transition>
            </g>

            <circle cx="258" cy="140" r="8" style="stroke-width: 1" :class="encoderClass" />
            <path d="M257 135 L261 140 L257 145" stroke-width="2" fill="none" />
            <text x="278" y="145">Encoder</text>
            <text x="345" y="145" font-size="11px">{{ encoderPosText }}</text>
            <transition name="fade">
                <text v-if="homedToEncoder" x="219.5" y="145" font-weight="bold">H</text>
            </transition>

            <circle cx="258" cy="320" r="8" style="stroke-width: 1" :class="sensorClass('extruder')" />
            <text x="278" y="325" :class="{ 'text-disabled': !isSensorEnabled('extruder') }">Extruder</text>
            <transition name="fade">
                <text v-if="homedToExtruder" x="219.5" y="325" font-weight="bold">H</text>
            </transition>
            <transition name="fade">
                <text v-if="homedToExtruderEntrance" x="219.5" y="339" font-weight="bold">H</text>
            </transition>
            <circle cx="258" cy="350" r="8" style="stroke-width: 1" :class="sensorClass('toolhead')" />
            <text x="278" y="355" :class="{ 'text-disabled': !isSensorEnabled('toolhead') }">Toolhead</text>
            <transition name="fade">
                <text v-if="homedToToolhead" x="219.5" y="355" font-weight="bold">H</text>
            </transition>
            <text x="228" y="412" font-size="11px" font-weight="bold" text-anchor="end" :class="temperatureClass">
                {{ temperatureText }}
            </text>

            <g v-if="hasSyncFeedback">
                <transition name="fade">
                    <g v-if="isSensorTriggered('filament_tension')" key="tension">
                        <use xlink:href="#sync-feedback" transform="translate(258, 199) scale(1.2)" />
                        <use xlink:href="#sync-feedback" transform="translate(258, 271) scale(1.2,-1.2)" />
                    </g>
                </transition>
                <transition name="fade">
                    <g v-if="isSensorTriggered('filament_compression')" key="compression">
                        <use xlink:href="#sync-feedback" transform="translate(258, 235) scale(1.2)" />
                        <use xlink:href="#sync-feedback" transform="translate(258, 235) scale(1.2,-1.2)" />
                    </g>
                </transition>
                <transition name="fade">
                    <g
                        v-if="isSensorTriggered('filament_tension') || isSensorTriggered('filament_compression')"
                        key="feedback">
                        style="font-size: 14px"
                        <text
                            v-if="isSensorTriggered('filament_tension') && isSensorTriggered('filament_compression')"
                            x="288"
                            y="240"
                            fill="#FF0000">
                            Error!
                        </text>
                        <text v-else-if="isSensorTriggered('filament_tension')" x="288" y="240">Tension</text>
                        <text v-else-if="isSensorTriggered('filament_compression')" x="288" y="240">Compression</text>
                    </g>
                </transition>
            </g>
            <text x="160" y="60" :class="tool === -2 ? 'tool-bypass' : 'tool-text'">{{ toolText(tool) }}</text>
        </g>

        <transition name="fade">
            <use v-if="!syncDrive" ref="sync" xlink:href="#sync-extruder" transform="translate(278, 385) scale(.030)" />
        </transition>

        <use v-if="action == ACTION_CUTTING_FILAMENT" ref="cut" xlink:href="#sissors" class="cut1-effect" />
        <use v-if="action == ACTION_CUTTING_TIP" ref="cutTip" xlink:href="#sissors" class="cut2-effect" />

        <use
            v-if="action == ACTION_PURGING"
            ref="poop"
            xlink:href="#blob"
            class="blob-effect"
            :stroke="lowerNozzleColor"
            :fill="lowerNozzleColor" />
    </svg>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component({})
export default class MmuFilamentStatus extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ default: 0.7 }) readonly animationTime!: number

    private filamentRectHeight: number = 0
    private tipFormingClass: string = ''

    readonly POSITIONS = {
        unknown: 8,
        'before-pre-gate': 20,
        'pre-gate': 25, // Not currently used
        'after-pre-gate': 40,
        'before-gear': 50, // Not currently used
        gear: 55,
        'after-gear': 70,
        gate: 85,
        'after-gate': 100,
        encoder: 115, // Not currently used
        'start-bowden': 135, // Bowden range vvv
        'mid-bowden': 221,
        'end-bowden': 290,
        extruder: 295,
        'extruder-entrance': 308,
        'before-toolhead': 315, // Bowden range ^^^
        toolhead: 325,
        'cooling-tube': 338,
        'cut-point': 355,
        'nozzle-start': 371,
    } as const

    readonly BOWDEN_RANGE = 173 as const

    @Watch('$store.state.printer.mmu.bowden_progress')
    onBowdenProgress(): void {
        // Percentage movement in the bowden
        this.calcFilamentHeight(this.filamentPos)
    }

    @Watch('$store.state.printer.mmu.filament_pos')
    onFilamentPosChanged(newPos: number): void {
        // Filament position state
        this.calcFilamentHeight(newPos)
    }

    @Watch('$store.state.printer.mmu.sensors')
    onSensorsChanged(): void {
        // Update on sensor change
        this.calcFilamentHeight(this.filamentPos)
    }

    @Watch('$store.state.printer.mmu.action')
    onActionChanged(action: number): void {
        // Action being performed
        if (action === this.ACTION_FORMING_TIP) {
            this.tipFormingClass = 'form-tip-effect'
        } else {
            if (this.tipFormingClass) {
                this.$nextTick(() => {
                    this.animateFilament(this.POSITIONS['cooling-tube'], 1)
                })
            }
            this.tipFormingClass = ''
        }
    }

    get colorOutline(): string {
        return '#2CA9BC'
    }
    get colorOutlineContrast(): string {
        return '#222222'
    }
    get colorFont(): string {
        return '#FFFFFF'
    }

    private calcFilamentHeight(filamentPos: number): void {
        let pos = 0

        if (this.gate === this.TOOL_GATE_BYPASS) {
            // Bypass use case places more emphasis on sensors
            switch (filamentPos) {
                case this.FILAMENT_POS_EXTRUDER_ENTRY:
                    pos = this.POSITIONS['before-toolhead']
                    break

                case this.FILAMENT_POS_HOMED_TS:
                    pos = this.POSITIONS['toolhead']
                    break

                case this.FILAMENT_POS_IN_EXTRUDER:
                    pos = this.POSITIONS['cooling-tube']
                    break

                case this.FILAMENT_POS_LOADED:
                    pos = this.POSITIONS['nozzle-start']
                    break

                default:
                    // For everything else, rely on sensors
                    if (this.isSensorTriggered('toolhead')) {
                        pos = this.POSITIONS['toolhead']
                    } else if (this.isSensorTriggered('extruder')) {
                        pos = this.POSITIONS['extruder']
                    } else if (this.isSensorTriggered('mmu_gear')) {
                        pos = this.POSITIONS['after-gear']
                    } else if (this.isSensorTriggered('mmu_pre_gate')) {
                        pos = this.POSITIONS['after-pre-gate']
                    } else {
                        pos = this.POSITIONS['before-pre-gate']
                    }
                    break
            }
        } else {
            // Normal MMU use case leveraging state machine
            switch (filamentPos) {
                case this.FILAMENT_POS_UNLOADED:
                    if (this.isSensorTriggered('mmu_gear')) {
                        pos = this.POSITIONS['after-gear']
                    } else if (this.isSensorTriggered('mmu_pre_gate')) {
                        pos = this.POSITIONS['after-pre-gate']
                    } else {
                        pos = this.POSITIONS['before-pre-gate']
                    }
                    break

                case this.FILAMENT_POS_HOMED_GATE:
                    if (this.configGateHomingEndstop === 'mmu_gear') {
                        pos = this.POSITIONS['gear']
                    } else if (this.configGateHomingEndstop === 'mmu_gate') {
                        pos = this.POSITIONS['gate']
                    } else if (this.configGateHomingEndstop === 'extruder') {
                        pos = this.POSITIONS['extruder'] // Special no-bowden case
                    } else {
                        pos = this.POSITIONS['after-gate']
                    }
                    break

                // TODO: State not yet implmented in Happy Hare
                //case this.FILAMENT_POS_HOMED_ENCODER:
                //    pos = this.POSITIONS['encoder']
                //    break

                case this.FILAMENT_POS_START_BOWDEN:
                    if (this.bowdenProgress >= 0) {
                        pos = this.POSITIONS['start-bowden'] + (this.BOWDEN_RANGE * this.bowdenProgress) / 100
                    } else {
                        pos = this.POSITIONS['start-bowden']
                    }
                    break

                case this.FILAMENT_POS_IN_BOWDEN:
                    if (this.bowdenProgress >= 0) {
                        pos = this.POSITIONS['start-bowden'] + (this.BOWDEN_RANGE * this.bowdenProgress) / 100
                    } else {
                        pos = this.POSITIONS['mid-bowden']
                    }
                    break

                case this.FILAMENT_POS_END_BOWDEN:
                    if (
                        this.configGateHomingEndstop === 'none' ||
                        (this.hasSensor('toolhead') &&
                            this.isSensorEnabled('toolhead') &&
                            !this.configExtruderForceHoming)
                    ) {
                        // No extruder homing will be performed so indicate at the extruder now
                        pos = this.POSITIONS['extruder-entrance']
                    } else {
                        pos = this.POSITIONS['end-bowden']
                    }
                    break

                case this.FILAMENT_POS_HOMED_ENTRY:
                    pos = this.POSITIONS['extruder']
                    break

                case this.FILAMENT_POS_HOMED_EXTRUDER:
                    pos = this.POSITIONS['extruder-entrance']
                    break

                case this.FILAMENT_POS_EXTRUDER_ENTRY:
                    pos = this.POSITIONS['before-toolhead']
                    break

                case this.FILAMENT_POS_HOMED_TS:
                    pos = this.POSITIONS['toolhead']
                    break

                case this.FILAMENT_POS_IN_EXTRUDER:
                    pos = this.POSITIONS['cooling-tube']
                    break

                case this.FILAMENT_POS_LOADED:
                    pos = this.POSITIONS['nozzle-start']
                    break

                default: // this.FILAMENT_POS_UNKNOWN
                    pos = this.POSITIONS['unknown']
            }
        }
        this.animateFilament(pos)
    }

    private animateFilament(newHeight: number, animationTime: number = this.animationTime) {
        const rect = this.$refs.filamentRect as SVGElement
        if (rect) {
            if (animationTime > 0) {
                const currentHeight = parseFloat(getComputedStyle(rect).height) ?? this.POSITIONS['end-bowden']
                const difference = Math.abs(currentHeight - newHeight)
                const duration = Math.min((difference / this.BOWDEN_RANGE) * animationTime + 0.1, animationTime)
                rect.style.transition = `height ${duration}s ease-in`
            } else {
                rect.style.transition = 'none'
            }
        }
        this.filamentRectHeight = newHeight
    }

    get encoderPosText(): string {
        if (this.encoderPos < 10000) return `${this.encoderPos} mm`
        return this.encoderPos
    }

    get temperatureClass(): string {
        const canExtrude = this.$store.state.printer.extruder?.can_extrude ?? false
        if (canExtrude === false) return 'text-disabled'
        return ''
    }

    get temperatureText(): string {
        const extTemp = this.$store.state.printer.extruder?.temperature ?? null
        if (extTemp) return `${extTemp.toFixed(0)}°C`
        return ''
    }

    private hasSensor(sensorName: string): boolean {
        return sensorName in this.sensors
    }

    private isSensorEnabled(sensorName: string): boolean {
        return this.sensors[sensorName] !== null
    }

    private isSensorTriggered(sensorName: string): boolean {
        const value = this.sensors[sensorName]
        return value !== null && value === true
    }

    sensorClass(sensorName: string): string {
        if (!this.isSensorEnabled(sensorName)) {
            return sensorName === 'extruder' ? 'sensor-disabled-extruder' : 'sensor-disabled'
        } else {
            return this.isSensorTriggered(sensorName)
                ? 'sensor-triggered'
                : sensorName === 'extruder'
                  ? 'sensor-open-extruder'
                  : 'sensor-open'
        }
    }

    get encoderClass(): string {
        // TODO: Need to separate encoder runout disable from general availability (like other sensors)
        if (this.filamentPos === this.FILAMENT_POS_UNLOADED) return 'sensor-disabled'
        return this.encoderPos ? 'sensor-triggered' : 'sensor-open'
    }

    get hasSyncFeedback(): boolean {
        return (
            this.syncFeedbackEnabled && (this.hasSensor('filament_compression') || this.hasSensor('filament_tension'))
        )
    }

    get homedToEncoder(): boolean {
        if (this.filamentDirection === this.DIRECTION_LOAD) {
            return this.configGateHomingEndstop === 'encoder' && this.filamentPos === this.FILAMENT_POS_START_BOWDEN
        } else {
            return this.configGateHomingEndstop === 'encoder' && this.filamentPos === this.FILAMENT_POS_START_BOWDEN
        }
    }

    get homedToGear(): boolean {
        return this.configGateHomingEndstop === 'mmu_gear' && this.filamentPos === this.FILAMENT_POS_HOMED_GATE
    }

    get homedToGate(): boolean {
        return this.configGateHomingEndstop === 'mmu_gate' && this.filamentPos === this.FILAMENT_POS_HOMED_GATE
    }

    get homedToExtruder(): boolean {
        return this.filamentPos === this.FILAMENT_POS_HOMED_ENTRY
    }

    get homedToExtruderEntrance(): boolean {
        return this.filamentPos === this.FILAMENT_POS_HOMED_EXTRUDER
    }

    get homedToToolhead(): boolean {
        return this.filamentPos === this.FILAMENT_POS_HOMED_TS
    }

    get upperNozzleFull(): boolean {
        return this.filamentPos === this.FILAMENT_POS_LOADED || this.varsFilamentRemaining
    }

    get lowerNozzleFull(): boolean {
        return (
            this.filamentPos === this.FILAMENT_POS_LOADED ||
            this.varsFilamentRemaining ||
            this.varsFilamentRemainingColor
        )
    }

    get upperNozzleColor(): string {
        if (this.varsFilamentRemaining) return this.varsFilamentRemainingColor
        return 'none'
    }

    get lowerNozzleColor(): string {
        if (this.varsFilamentRemainingColor) return this.varsFilamentRemainingColor
        return this.currentGateColor
    }

    get currentGateColor(): string {
        let color = this.$store.state.printer.mmu?.gate_color[this.gate] ?? ''
        if (this.gate === this.TOOL_GATE_BYPASS) {
            // Assume active spoolman spool if available
            color = this.$store.state.server.spoolman?.active_spool?.filament.color_hex ?? null
        }
        return this.formColorString(color)
    }

    mounted() {
        this.calcFilamentHeight(this.filamentPos)
    }
}
</script>

<style scoped>
.text-disabled {
    opacity: 0.5;
}

.zone-background-light-theme {
    fill: #f0f0f0;
}

.zone-background-dark-theme {
    fill: #2c2c2c;
}

svg text {
    fill: currentColor;
}

.sensor-disabled {
    stroke: var(--v-secondary-lighten3, #808080);
    stroke-dasharray: 2, 1;
    fill: #2c2c2c;
}

.sensor-triggered {
    fill: limegreen;
}

.sensor-open {
    fill: #2c2c2c;
}

.sensor-disabled-extruder {
    stroke: var(--v-secondary-lighten3, #808080);
    stroke-dasharray: 2, 1;
    fill: var(--v-secondary-darken2, #1e1e1e);
}

.sensor-open-extruder {
    fill: var(--v-secondary-darken2, #1e1e1e);
}

.tool-text {
    font-size: 28px;
    font-weight: bold;
}

.tool-bypass {
    font-size: 16px;
    font-weight: normal;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.8s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
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
