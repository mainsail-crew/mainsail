import Vue from 'vue'
import Component from 'vue-class-component'
import { W3C_COLORS } from '@/components/mixins/w3c'
import type { FileStateGcodefile } from '@/store/files/types'
import type { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({})
export default class MmuMixin extends Vue {
    get hasMmu(): boolean {
        return !!this.$store.state.printer.mmu
    }

    get hasEncoder(): boolean {
        return !!this.$store.state.printer.mmu?.encoder
    }

    /*
     * Select encoder properties
     */
    get encoderPos(): number {
        return Math.round(this.$store.state.printer.mmu?.encoder?.encoder_pos ?? 0)
    }

    get encoderEnabled(): boolean {
        return this.$store.state.printer.mmu?.encoder?.enabled
    }

    get encoderDesiredHeadroom(): number {
        return this.$store.state.printer.mmu?.encoder?.desired_headroom
    }

    get encoderDetectionLength(): number {
        return this.$store.state.printer.mmu?.encoder?.detection_length
    }

    get encoderDetectionMode(): number {
        return this.$store.state.printer.mmu?.encoder?.detection_mode
    }

    get encoderFlowRate(): number {
        return this.$store.state.printer.mmu?.encoder?.flow_rate
    }

    /*
     * All Happy Hare mmu_machine printer variables
     */
    get numUnits(): number {
        return this.$store.state.printer.mmu_machine?.num_units ?? 1
    }

    unitDetails(unitIndex: number): MmuUnitDetails {
        const unitRef = `unit_${unitIndex}`
        const ud: MmuUnitDetails = {
            name: this.$store.state.printer.mmu_machine?.[unitRef]?.name ?? 'Unit',
            vendor: this.$store.state.printer.mmu_machine?.[unitRef]?.vendor ?? 'Other',
            version: this.$store.state.printer.mmu_machine?.[unitRef]?.version ?? '1.0',
            numGates: this.$store.state.printer.mmu_machine?.[unitRef]?.num_gates ?? 1,
            firstGate: this.$store.state.printer.mmu_machine?.[unitRef]?.first_gate ?? 0,
            selectorType: this.$store.state.printer.mmu_machine?.[unitRef]?.selector_type ?? 'VirtualSelector',
            variableRotationDistances:
                this.$store.state.printer.mmu_machine?.[unitRef]?.variable_rotation_distances ?? true,
            variableBowdenLengths: this.$store.state.printer.mmu_machine?.[unitRef]?.variable_bowden_lengths ?? true,
            requireBowdenMove: this.$store.state.printer.mmu_machine?.[unitRef]?.require_bowden_move ?? true,
            filamentAlwaysGripped: this.$store.state.printer.mmu_machine?.[unitRef]?.filament_always_gripped ?? false,
            hasBypass: this.$store.state.printer.mmu_machine?.[unitRef]?.has_bypass ?? false,
            multiGear: this.$store.state.printer.mmu_machine?.[unitRef]?.multi_gear ?? false,
        }
        return ud
    }

    /*
     * All Happy Hare mmu printer variables
     */
    get enabled(): boolean {
        return this.$store.state.printer.mmu?.enabled ?? false
    }

    get numGates(): number {
        return this.$store.state.printer.mmu?.num_gates ?? 0
    }

    get printState(): string {
        return this.$store.state.printer.mmu?.print_state
    }

    get isPrinting(): boolean {
        return ['started', 'printing'].includes(this.$store.state.printer.mmu?.print_state)
    }

    get isInPrint(): boolean {
        return ['printing', 'pause_locked', 'paused'].includes(this.$store.state.printer.mmu?.print_state)
    }

    get isMmuPaused(): boolean {
        return ['pause_locked', 'paused'].includes(this.$store.state.printer.mmu?.print_state)
    }

    get isMmuPausedAndLocked(): boolean {
        return ['pause_locked'].includes(this.$store.state.printer.mmu?.print_state)
    }

    get isHomed(): boolean {
        return this.$store.state.printer.mmu?.is_homed ?? false
    }

    get unit(): number {
        return this.$store.state.printer.mmu?.unit ?? this.UNIT_UNKNOWN
    }
    readonly UNIT_UNKNOWN: number = -1

    get gate(): number {
        return this.$store.state.printer.mmu?.gate ?? this.TOOL_GATE_UNKNOWN
    }
    get tool(): number {
        return this.$store.state.printer.mmu?.tool ?? this.TOOL_GATE_UNKNOWN
    }
    readonly TOOL_GATE_UNKNOWN: number = -1
    readonly TOOL_GATE_BYPASS: number = -2

    get activeFilament(): object[] {
        return this.$store.state.printer.mmu?.active_filament
    }

    get numToolchanges(): number {
        return this.$store.state.printer.mmu?.num_toolchanges ?? 0
    }

    get lastTool(): number {
        return this.$store.state.printer.mmu?.last_tool ?? this.TOOL_GATE_UNKNOWN
    }

    get nextTool(): number {
        return this.$store.state.printer.mmu?.next_tool ?? this.TOOL_GATE_UNKNOWN
    }

    get toolchangePurgeVolue(): number {
        return this.$store.state.printer.mmu?.toolchange_purge_volume ?? 0
    }

    get lastToolchange(): string {
        return this.$store.state.printer.mmu?.last_toolchange ?? ''
    }

    get operation(): string {
        return this.$store.state.printer.mmu?.operation ?? ''
    }

    get filament(): string {
        return this.$store.state.printer.mmu?.filament ?? 'Unknown'
    }

    get filamentPosition(): number {
        return (this.$store.state.printer.mmu?.filament_position ?? 0).toFixed(1)
    }

    get filamentPos(): number {
        return this.$store.state.printer.mmu?.filament_pos ?? this.FILAMENT_POS_UNKNOWN
    }
    readonly FILAMENT_POS_UNKNOWN: number = -1
    readonly FILAMENT_POS_UNLOADED: number = 0 // Parked in gate
    readonly FILAMENT_POS_HOMED_GATE: number = 1 // Homed at either gate or gear sensor (currently assumed mutually exclusive sensors)
    readonly FILAMENT_POS_START_BOWDEN: number = 2 // Point of fast load portion
    readonly FILAMENT_POS_IN_BOWDEN: number = 3 // Some unknown position in the bowden
    readonly FILAMENT_POS_END_BOWDEN: number = 4 // End of fast load portion
    readonly FILAMENT_POS_HOMED_ENTRY: number = 5 // Homed at entry sensor
    readonly FILAMENT_POS_HOMED_EXTRUDER: number = 6 // Collision homing case at extruder gear entry
    readonly FILAMENT_POS_EXTRUDER_ENTRY: number = 7 // Past extruder gear entry
    readonly FILAMENT_POS_HOMED_TS: number = 8 // Homed at toolhead sensor
    readonly FILAMENT_POS_IN_EXTRUDER: number = 9 // In extruder past toolhead sensor
    readonly FILAMENT_POS_LOADED: number = 10 // Homed to nozzle

    get filamentDirection(): number {
        return this.$store.state.printer.mmu?.filament_direction
    }
    readonly DIRECTION_LOAD: number = 1
    readonly DIRECTION_UNKNOWN: number = 0
    readonly DIRECTION_UNLOAD: number = -1

    get bowdenProgress(): number {
        return this.$store.state.printer.mmu?.bowden_progress ?? -1
    }

    get ttgMap(): number[] {
        return this.$store.state.printer.mmu?.ttg_map
    }

    get endlessSpoolGroups(): number[] {
        return this.$store.state.printer.mmu?.endless_spool_groups
    }

    get gateStatus(): number[] {
        return this.$store.state.printer.mmu?.gate_status
    }
    readonly GATE_UNKNOWN: number = -1
    readonly GATE_EMPTY: number = 0
    readonly GATE_AVAILABLE: number = 1 // Available to load from either buffer or spool
    readonly GATE_AVAILABLE_FROM_BUFFER: number = 2

    get gateFilamentName(): string[] {
        return this.$store.state.printer.mmu?.gate_filament_name
    }

    get gateMaterial(): string[] {
        return this.$store.state.printer.mmu?.gate_material
    }

    get gateColor(): string[] {
        return this.$store.state.printer.mmu?.gate_color
    }

    get gateTemperature(): number[] {
        return this.$store.state.printer.mmu?.gate_temperature
    }

    get gateSpoolId(): number[] {
        return this.$store.state.printer.mmu?.gate_spool_id
    }

    get gateSpeedOverride(): number[] {
        return this.$store.state.printer.mmu?.gate_speed_override
    }

    get gateMap(): MmuGateDetails[] {
        return this.gateStatus.map((_, index) => this.gateDetails(index))
    }

    gateDetails(gateIndex: number): MmuGateDetails {
        const mmu = this.$store.state.printer.mmu
        const active = this.$store.state.server.spoolman?.active_spool

        const defaults: MmuGateDetails = {
            index: gateIndex,
            status: this.GATE_UNKNOWN,
            filamentName: 'Unknown',
            material: 'Unknown',
            color: this.formColorString(null),
            temperature: -1,
            spoolId: -1,
            speedOverride: 100,
            endlessSpoolGroup: gateIndex,
        }

        if (gateIndex === this.TOOL_GATE_BYPASS) {
            const base: MmuGateDetails = {
                ...defaults,
                endlessSpoolGroup: null,
            }

            if (this.gate === gateIndex) {
                return {
                    ...base,
                    filamentName: active?.filament?.name ?? 'No active spool',
                    material: active?.filament?.material ?? 'Unknown',
                    color: this.formColorString(active?.filament?.color_hex ?? null),
                    temperature: active?.filament?.settings_extruder_temp ?? -1,
                    spoolId: active?.id ?? -1,
                }
            }

            return base
        }

        return {
            ...defaults,
            status: mmu?.gate_status?.[gateIndex] ?? this.GATE_UNKNOWN,
            filamentName: mmu?.gate_filament_name?.[gateIndex] || 'Unknown',
            material: mmu?.gate_material?.[gateIndex] || 'Unknown',
            color: this.formColorString(mmu?.gate_color?.[gateIndex] ?? ''),
            temperature: mmu?.gate_temperature?.[gateIndex] ?? -1,
            spoolId: mmu?.gate_spool_id?.[gateIndex] ?? -1,
            speedOverride: mmu?.gate_speed_override?.[gateIndex] ?? 100,
            endlessSpoolGroup: mmu?.endless_spool_groups?.[gateIndex] ?? defaults.endlessSpoolGroup,
        }
    }

    spoolmanSpool(spoolId: number): ServerSpoolmanStateSpool | null {
        const activeSpool = this.$store.state.server.spoolman.active_spool ?? null
        if (activeSpool?.id === spoolId) {
            return activeSpool
        }
        const spools = this.$store.state.server.spoolman?.spools ?? []
        return spools.find((spool) => spool.id === spoolId) ?? null
    }

    get slicerToolMap(): object {
        return this.$store.state.printer.mmu?.slicer_tool_map
    }

    toolDetails(toolIndex: number, file?: FileStateGcodefile): SlicerToolDetails {
        const td: Partial<SlicerToolDetails> = {}

        // Have file so use metadata
        if (file) {
            // Different slicers use extruder/filament colors differently
            let c1: string[]
            let c2: string[]

            switch (file.slicer) {
                case 'OrcaSlicer':
                case 'BambuStudio':
                    c1 = file.filament_colors ?? []
                    c2 = file.extruder_colors ?? []
                    break
                case 'SuperSlicer':
                default: // Assume PrusaSlicer
                    c1 = file.extruder_colors ?? []
                    c2 = file.filament_colors ?? []
                    break
            }
            const colors = c1.length === 0 || c1.every((str) => str === '') ? c2 : c1
            td.color = colors.length > toolIndex ? this.formColorString(colors[toolIndex]) : this.formColorString('')

            // This is just a string so split
            const materials = file.filament_type ?? ''
            const processedMaterials = materials ? materials.split(/[,;]/).map((element) => element.trim()) : []
            td.material = processedMaterials[toolIndex] || 'Unknown'

            const temps = file.filament_temps ?? []
            td.temp = temps.length > toolIndex ? temps[toolIndex] : -1

            // This is just a string so split
            const names = file.filament_name ?? ''
            const processedNames = names
                ? names.split(/[,;]/).map((element) => element.trim().replace(/^["']|["']$/g, ''))
                : []
            td.name = processedNames[toolIndex] || 'Unknown'

            const referencedTools = file.referenced_tools ?? []
            td.inUse = referencedTools?.includes(toolIndex) ?? false
        } else {
            // Use Happy Hare's slicer_tool_map
            td.color = this.formColorString(
                this.$store.state.printer.mmu?.slicer_tool_map?.tools?.[toolIndex]?.color ?? ''
            )
            td.material = this.$store.state.printer.mmu?.slicer_tool_map?.tools?.[toolIndex]?.material || 'Unknown'
            td.temp = this.$store.state.printer.mmu?.slicer_tool_map?.tools?.[toolIndex]?.temp ?? -1
            td.name = this.$store.state.printer.mmu?.slicer_tool_map?.tools?.[toolIndex]?.name || 'Unknown'
            td.inUse = this.$store.state.printer.mmu?.slicer_tool_map?.tools?.[toolIndex]?.in_use || false
        }
        return td
    }

    get action(): string {
        return this.$store.state.printer.mmu?.action
    }
    readonly ACTION_IDLE: string = 'Idle'
    readonly ACTION_LOADING: string = 'Loading'
    readonly ACTION_LOADING_EXTRUDER: string = 'Loading Ext'
    readonly ACTION_UNLOADING: string = 'Unloading'
    readonly ACTION_UNLOADING_EXTRUDER: string = 'Unloading Ext'
    readonly ACTION_FORMING_TIP: string = 'Forming Tip'
    readonly ACTION_CUTTING_TIP: string = 'Cutting Tip'
    readonly ACTION_HEATING: string = 'Heating'
    readonly ACTION_CHECKING: string = 'Checking'
    readonly ACTION_HOMING: string = 'Homing'
    readonly ACTION_SELECTING: string = 'Selecting'
    readonly ACTION_CUTTING_FILAMENT: string = 'Cutting Filament'
    readonly ACTION_PURGING: string = 'Purging'

    get hasBypass(): boolean {
        return this.$store.state.printer.mmu?.has_bypass ?? false
    }

    get syncDrive(): boolean {
        return this.$store.state.printer.mmu?.sync_drive
    }

    //return this.$store.state.printer.mmu?.sync_feedback_state

    get syncFeedbackEnabled(): boolean {
        return this.$store.state.printer.mmu?.sync_feedback_enabled
    }

    get clogDetectionEnabled(): boolean {
        return this.$store.state.printer.mmu?.clog_detection_enabled
    }

    get endlessSpoolEnabled(): boolean {
        return this.$store.state.printer.mmu?.endless_spool_enabled
    }

    get reasonForPause(): string {
        return this.$store.state.printer.mmu?.reason_for_pause ?? ''
    }

    get extruderFilamentRemaining(): number {
        return this.$store.state.printer.mmu?.extruder_filament_remaining
    }

    get spoolmanSupport(): string {
        return this.$store.state.printer.mmu?.spoolman_support ?? 'off'
    }
    readonly SPOOLMAN_OFF: string = 'off' // Spoolman disabled
    readonly SPOOLMAN_READONLY: string = 'readonly' // Get filament attributes only
    readonly SPOOLMAN_PUSH: string = 'push' // Local gatemap is the source or truth
    readonly SPOOLMAN_PULL: string = 'pull' // Spoolman db is the source of truth

    get sensors(): { [key: string]: boolean | null } {
        return this.$store.state.printer.mmu?.sensors ?? []
    }

    get espoolerActive(): string {
        return this.$store.state.printer.mmu?.espooler_active ?? ''
    }
    readonly ESPOOLER_REWIND: string = 'rewind'
    readonly ESPOOLER_ASSIST: string = 'assist'

    /*
     * Optional printer variables based on selector type
     */
    get servo(): string {
        return this.$store.state.printer.mmu?.servo ?? 'Unknown'
    }

    get grip(): string {
        return this.$store.state.printer.mmu?.grip ?? 'Unknown'
    }

    /*
     * Selective Happy Hare configuration parameters
     */

    get configGateHomingEndstop(): string {
        return this.$store.state.printer.configfile.config.mmu?.gate_homing_endstop
    }

    get configExtruderHomingEndstop(): string {
        return this.$store.state.printer.configfile.config.mmu?.extruder_homing_endstop
    }

    get configExtruderForceHoming(): boolean {
        return (this.$store.state.printer.configfile.config.mmu?.extruder_force_homing ?? 0) === 1
    }

    get configTMacroColor(): string {
        return this.$store.state.printer.configfile.config.mmu?.t_macro_color ?? 'slicer'
    }
    readonly T_MACRO_COLOR_OPTIONS: string[] = ['slicer', 'allgates', 'gatemap', 'off']

    get varsCalibrationBowdenLengths(): number[] {
        return this.$store.state.printer.save_variables?.variables?.mmu_calibration_bowden_lengths
    }

    get varsFilamentRemaining(): string {
        return this.$store.state.printer.save_variables?.variables?.mmu_state_filament_remaining ?? 0
    }

    get varsFilamentRemainingColor(): string {
        const color = this.$store.state.printer.save_variables?.variables?.mmu_state_filament_remaining_color ?? ''
        if (color) return this.formColorString(color)
        return color
    }

    get macroVarsLedEnable(): boolean {
        return this.$store.state.printer['gcode_macro _MMU_LED_VARS']?.led_enable ?? false
    }

    get macroVarsLedAnimation(): boolean {
        return this.$store.state.printer['gcode_macro _MMU_LED_VARS']?.led_animation ?? true
    }

    get macroVarsDefaultEntryEffect(): string {
        return this.$store.state.printer['gcode_macro _MMU_LED_VARS']?.default_entry_effect ?? 'off'
    }

    get macroVarsDefaultExitEffect(): string {
        return this.$store.state.printer['gcode_macro _MMU_LED_VARS']?.default_exit_effect ?? 'off'
    }

    get macroVarsDefaultStatusEffect(): string {
        return this.$store.state.printer['gcode_macro _MMU_LED_VARS']?.default_status_effect ?? 'off'
    }
    readonly LED_OPTIONS: string[] = ['off', 'gate_status', 'filament_color', 'slicer_color']
    readonly LED_STATUS_OPTIONS: string[] = [...this.LED_OPTIONS, 'on']

    get macroVarsAutomapStrategy(): string {
        return this.$store.state.printer['gcode_macro _MMU_SOFTWARE_VARS']?.automap_strategy ?? 'none'
    }
    readonly AUTOMAP_OPTIONS: string[] = ['none', 'filament_name', 'material', 'color', 'closest_color', 'spool_id']

    /*
     * Miscellaneous
     */

    gateText(gate: number): string {
        return gate === -1 ? '?' : gate === this.TOOL_GATE_BYPASS ? 'Bypass' : '@' + gate
    }

    toolText(tool: number): string {
        return tool === -1 ? 'T?' : tool === this.TOOL_GATE_BYPASS ? 'Bypass' : 'T' + tool
    }

    // Empty string if nothing to report
    get toolchangeText(): string {
        if (this.nextTool === this.TOOL_GATE_UNKNOWN) return ''

        const label = (t: number) => (t === this.TOOL_GATE_BYPASS ? 'Bypass' : `T${t}`)
        const parts: string[] = ['Changing tool']
        if (this.lastTool !== this.TOOL_GATE_UNKNOWN) {
            parts.push('from', label(this.lastTool))
        }
        parts.push('to', label(this.nextTool))
        return parts.join(' ')
    }

    refreshSpoolmanData() {
        this.$store.dispatch('server/spoolman/refreshSpools')
    }

    async doLoadingSend(gcode: string, loadingKey: string) {
        await this.$store.dispatch('socket/addLoading', { name: loadingKey })
        this.doSend(gcode)
        await new Promise((resolve) => setTimeout(resolve, 500))
        await this.$store.dispatch('socket/removeLoading', { name: loadingKey })
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    get canSend(): boolean {
        const idleTimeout = this.$store.state.printer.idle_timeout?.state
        return (
            this.klipperReadyForGui && !['printing'].includes(this.printer_state) && !['Printing'].includes(idleTimeout)
        )
    }

    /*
     * Helper functions
     */

    // Fix Happy Hare color strings (# problematic in klipper CLI)
    readonly NO_FILAMENT_COLOR = '#808182E3'
    formColorString(color: string | null): string {
        let hexaColor = this.NO_FILAMENT_COLOR
        if (!color) return hexaColor

        // Check if the color is a named color
        const namedColor = W3C_COLORS.find((c) => c.name === color.toLowerCase())
        if (namedColor) {
            hexaColor = namedColor.hex
        } else {
            // Validate and format hex color codes
            const hexColorPattern = /^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/
            if (hexColorPattern.test(color)) {
                hexaColor = color
                if (!hexaColor.startsWith('#')) hexaColor = '#' + hexaColor
            }
        }
        if (hexaColor.length < 8) hexaColor = hexaColor + 'FF'
        return hexaColor.toUpperCase()
    }

    getLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
        const a = [r, g, b].map(function (v) {
            v /= 255
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        })
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
    }
}
