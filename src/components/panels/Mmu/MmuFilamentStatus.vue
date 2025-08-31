<template>
    <svg ref="filStatusSvg" viewBox="140 20 285 421" preserveAspectRatio="xMidYMid meet" class="svg-colors">
        <defs>
            <g
                id="sync-feedback"
                style="stroke: var(--color-outline); stroke-linecap: round; stroke-linejoin: round; fill: none">
                <path d="M18,9,13.78,3.39a1,1,0,0,0-1.56,0L8,9" style="stroke-width: 1; stroke-opacity: 0.8"></path>
                <path d="M13,8.24,18,15H15H8Z" style="stroke-width: 2"></path>
            </g>

            <g
                id="sissors"
                style="stroke: var(--color-outline); fill: none; stroke-linecap: round; stroke-linejoin: round">
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
            <g id="filament-grip" style="stroke-linecap: round; stroke-linejoin: round">
                <path
                    fill="rgb(131,148,150)"
                    d="M368,368 V376 C368,380.41,364.41,384,360,384 H344 V360 H360 C364.41,360,368,363.59,368,368 Z M368,408 V416 C368,420.41,364.41,424,360,424 C293.65,424,340.73,424,312,424 C307.59,424,304,420.41,304,416 V408 C304,403.59,307.59,400,312,400 C326.91,400,345.09,400,360,400 C364.41,400,368,403.59,368,408 Z M248.97,461.66 L242.34,455.03 C237.81,450.5,231.78,448,225.38,448 H160 V368 H193.38 C199.79,368,205.82,365.5,210.35,360.97 L248.97,322.35 C250.49,320.84,252.5,320,254.63,320 H320 C324.42,320,328,323.59,328,328 V384 C322.21,384,317.79,384,312,384 C307.59,384,304,380.42,304,376 V350.61 C304,346.19,300.43,342.61,296,342.61 S288,346.19,288,350.61 V357.2 L262.56,389 C261.04,390.91,258.75,392,256.31,392 H217.05 C212.63,392,209.05,395.58,209.05,400 S212.63,408,217.05,408 H256.31 C263.64,408,270.47,404.72,275.06,399 L288.74,381.9 C289.71,385.74,291.62,389.21,294.2,392.06 C290.39,396.31,288,401.86,288,408 V416 C288,427.06,295.56,436.31,305.76,439.08 C304.65,441.84,304,444.85,304,448.01 V456.01 C304,458.82,304.58,461.49,305.48,464.01 H254.63 C252.49,464.01,250.48,463.17,248.97,461.67 Z M368,456 C368,460.41,364.41,464,360,464 H328 C323.59,464,320,460.41,320,456 V448 C320,443.59,323.59,440,328,440 H360 C364.41,440,368,443.59,368,448 V456 Z M368,328 V336 C368,340.41,364.41,344,360,344 H344 V328 C344,325.18,343.42,322.51,342.53,320 H360 C364.41,320,368,323.59,368,328 Z"></path>
                <path
                    :fill="currentGateColor"
                    d="M300,250 L350,250 L350,310 L300,310 Z M300,475 L350,475 L350,520 L300,520 Z"></path>
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
        <g style="stroke: var(--color-outline); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1">
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
            style="
                stroke: var(--color-outline);
                stroke-linejoin: round;
                stroke-width: 0;
                font-family: Roboto;
                font-size: 16;
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
                <text x="278" y="115" :class="{ 'text-disabled': !isSensorEnabled('mmu_gate') }">
                    {{ gateSensorName }}
                </text>
                <transition name="fade">
                    <text v-if="homedToGate" x="219.5" y="115" font-weight="bold">H</text>
                </transition>
            </g>

            <g v-if="hasEncoder">
                <circle cx="258" cy="140" r="8" style="stroke-width: 1" :class="encoderClass" />
                <path d="M257 135 L261 140 L257 145" stroke-width="2" fill="none" />
                <text x="278" y="145">Encoder</text>
                <text x="345" y="145" font-size="11px">{{ encoderPosText }}</text>
                <transition name="fade">
                    <text v-if="homedToEncoder" x="219.5" y="145" font-weight="bold">H</text>
                </transition>
            </g>

            <g v-if="hasSensor('extruder')">
                <circle cx="258" cy="320" r="8" style="stroke-width: 1" :class="sensorClass('extruder')" />
                <text x="278" y="325" :class="{ 'text-disabled': !isSensorEnabled('extruder') }">Extruder</text>
                <transition name="fade">
                    <text v-if="homedToExtruder" x="219.5" y="325" font-weight="bold">H</text>
                </transition>
            </g>

            <transition name="fade">
                <text v-if="homedToExtruderEntrance" x="219.5" y="339" font-weight="bold">H</text>
            </transition>

            <g v-if="hasSensor('toolhead')">
                <circle cx="258" cy="350" r="8" style="stroke-width: 1" :class="sensorClass('toolhead')" />
                <text x="278" y="355" :class="{ 'text-disabled': !isSensorEnabled('toolhead') }">Toolhead</text>
                <transition name="fade">
                    <text v-if="homedToToolhead" x="219.5" y="355" font-weight="bold">H</text>
                </transition>
            </g>

            <text x="228" y="412" font-size="11px" font-weight="bold" text-anchor="end" :class="temperatureClass">
                {{ temperatureText }}
            </text>

            <g v-if="hasSyncFeedback && filamentPos >= FILAMENT_POS_END_BOWDEN">
                <transition name="fade">
                    <g
                        v-if="isSensorTriggered('filament_tension') && isSensorTriggered('filament_compression')"
                        key="neutral">
                        <text x="288" y="240">Neutral</text>
                        <use xlink:href="#sync-feedback" transform="translate(286, 247.5) scale(1.0,-1.0) rotate(90)" />
                    </g>
                    <g v-else-if="isSensorTriggered('filament_tension')" key="tension">
                        <text x="288" y="240">Tension</text>
                        <use xlink:href="#sync-feedback" transform="translate(258, 199) scale(1.2)" />
                        <use xlink:href="#sync-feedback" transform="translate(258, 271) scale(1.2,-1.2)" />
                    </g>
                    <g v-else-if="isSensorTriggered('filament_compression')" key="compression">
                        <text x="288" y="240">Compression</text>
                        <use xlink:href="#sync-feedback" transform="translate(258, 235) scale(1.2)" />
                        <use xlink:href="#sync-feedback" transform="translate(258, 235) scale(1.2,-1.2)" />
                    </g>
                </transition>
            </g>
            <text x="160" y="60" :class="tool === -2 ? 'tool-bypass' : 'tool-text'">{{ toolText(tool) }}</text>
        </g>

        <transition name="fade">
            <use v-if="syncDrive" ref="sync" xlink:href="#sync-extruder" transform="translate(278, 385) scale(.030)" />
        </transition>

        <transition name="fade">
            <use v-if="isGripped" ref="grip" xlink:href="#filament-grip" transform="scale(.1) translate(1900, 420)" />
        </transition>

        <use v-if="action === ACTION_CUTTING_FILAMENT" ref="cut" xlink:href="#sissors" class="cut1-effect" />
        <use v-if="action === ACTION_CUTTING_TIP" ref="cutTip" xlink:href="#sissors" class="cut2-effect" />

        <use
            v-if="action === ACTION_PURGING"
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
        'pre-gate': 25,
        'after-pre-gate': 40,
        'before-gear': 50,
        gear: 55,
        'after-gear': 70,
        gate: 85,
        'after-gate': 100,
        encoder: 115,
        'start-bowden': 135,
        'mid-bowden': 221,
        'end-bowden': 290,
        extruder: 295,
        'extruder-entrance': 308,
        'before-toolhead': 315,
        toolhead: 325,
        'cooling-tube': 338,
        'cut-point': 355,
        'nozzle-start': 371,
    } as const

    readonly BOWDEN_RANGE = 173 as const

    @Watch('bowdenProgress')
    onBowdenProgress(): void {
        // Percentage movement in the bowden
        this.calcFilamentHeight(this.filamentPos)
    }

    @Watch('filamentPos')
    onFilamentPosChanged(newPos: number): void {
        // Filament position state
        this.calcFilamentHeight(newPos)
    }

    @Watch('sensors')
    onSensorsChanged(): void {
        // Update on sensor change
        this.calcFilamentHeight(this.filamentPos)
    }

    @Watch('action')
    onActionChanged(action: string): void {
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

            this.animateFilament(pos)
            return
        }

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
                    (this.hasSensor('toolhead') && this.isSensorEnabled('toolhead') && !this.configExtruderForceHoming)
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
                if (
                    this.hasSensor('toolhead') &&
                    this.isSensorEnabled('toolhead') &&
                    !this.isSensorTriggered('toolhead')
                ) {
                    pos = this.POSITIONS['before-toolhead'] // Don't show beyond toolhead sensor if not triggered
                }
                break

            case this.FILAMENT_POS_LOADED:
                pos = this.POSITIONS['nozzle-start']
                break

            default: // this.FILAMENT_POS_UNKNOWN
                pos = this.POSITIONS['unknown']
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
        return `${this.encoderPos}`
    }

    get gateSensorName(): string {
        if (this.unitDetails(this.unit).multiGear) {
            return 'Hub (Gate)'
        }
        return 'Gate'
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
        let sClass = ''
        if (!this.isSensorEnabled(sensorName)) {
            sClass = sensorName === 'extruder' ? 'sensor-disabled-extruder' : 'sensor-disabled'
        } else {
            sClass = this.isSensorTriggered(sensorName)
                ? 'sensor-triggered'
                : sensorName === 'extruder'
                  ? 'sensor-open-extruder'
                  : 'sensor-open'
        }
        return this.$vuetify.theme.dark ? sClass + '-dark-theme' : sClass + '-light-theme'
    }

    get encoderClass(): string {
        let eClass = ''
        // TODO: Need to separate encoder runout disable from general availability (like other sensors)
        if (this.filamentPos === this.FILAMENT_POS_UNLOADED) eClass = 'sensor-disabled'
        eClass = this.encoderPos ? 'sensor-triggered' : 'sensor-open'
        return this.$vuetify.theme.dark ? eClass + '-dark-theme' : eClass + '-light-theme'
    }

    get hasSyncFeedback(): boolean {
        return (
            this.syncFeedbackEnabled && (this.hasSensor('filament_compression') || this.hasSensor('filament_tension'))
        )
    }

    get homedToEncoder(): boolean {
        if (this.filamentDirection === this.DIRECTION_LOAD) {
            return this.configGateHomingEndstop === 'encoder' && this.filamentPos === this.FILAMENT_POS_START_BOWDEN
        }
        return this.configGateHomingEndstop === 'encoder' && this.filamentPos === this.FILAMENT_POS_START_BOWDEN
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
        return this.filamentPos === this.FILAMENT_POS_LOADED || !!this.varsFilamentRemaining
    }

    get lowerNozzleFull(): boolean {
        return (
            this.filamentPos === this.FILAMENT_POS_LOADED ||
            !!this.varsFilamentRemaining ||
            !!this.varsFilamentRemainingColor
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

    get isGripped(): boolean {
        return this.grip === 'Gripped' || this.servo === 'Down'
    }

    mounted() {
        this.calcFilamentHeight(this.filamentPos)
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

.text-disabled {
    opacity: 0.5;
}

.zone-background-light-theme {
    fill: var(--zone-background-light-theme);
}

.sensor-triggered-light-theme {
    fill: limegreen;
}

.sensor-disabled-light-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-light-theme);
}

.sensor-open-light-theme {
    fill: var(--zone-background-light-theme);
}

.sensor-disabled-extruder-light-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--background-light-theme);
}

.sensor-open-extruder-light-theme {
    fill: var(--background-light-theme);
}

.zone-background-dark-theme {
    fill: var(--zone-background-dark-theme);
}

.sensor-triggered-dark-theme {
    fill: limegreen;
}

.sensor-disabled-dark-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-dark-theme);
}

.sensor-open-dark-theme {
    fill: var(--zone-background-dark-theme);
}

.sensor-disabled-extruder-dark-theme {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--background-dark-theme);
}

.sensor-open-extruder-dark-theme {
    fill: var(--background-dark-theme);
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
