import Component from 'vue-class-component'
import { W3C_COLORS } from '@/plugins/w3c'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

export interface Mmu {
    enabled: boolean
    num_gates: number
    is_homed: boolean
    is_locked: boolean
    is_paused: boolean
    is_in_print: boolean
    print_state: string
    unit: number
    tool: number
    gate: number
    active_filament: {
        filament_name: string
        material: string
        color: string
        spool_id: number
        temperature: number
    }
    num_toolchanges: number
    last_tool: number
    next_tool: number
    toolchange_purge_volume: number
    last_toolchange: string
    runout: boolean
    operation: string
    filament: string
    filament_position: number
    filament_pos: number
    filament_direction: typeof DIRECTION_LOAD | typeof DIRECTION_UNKNOWN | typeof DIRECTION_UNLOAD
    pending_spool_id: number
    ttg_map: number[]
    endless_spool_groups: number[]
    gate_status: number[]
    gate_filament_name: string[]
    gate_material: string[]
    gate_color: string[]
    gate_temperature: number[]
    gate_spool_id: number[]
    gate_speed_override: number[]
    gate_color_rgb: number[][]
    slicer_color_rgb: number[][]
    tool_extrusion_multipliers: number[]
    tool_speed_multipliers: number[]
    slicer_tool_map: {
        tools: any
        referenced_tools: number[]
        initial_tool: number | null
        purge_volumes: number[]
        total_toolchanges: number | null
        skip_automap: boolean
    }
    action:
        | typeof ACTION_IDLE
        | typeof ACTION_LOADING
        | typeof ACTION_LOADING_EXTRUDER
        | typeof ACTION_UNLOADING
        | typeof ACTION_UNLOADING_EXTRUDER
        | typeof ACTION_FORMING_TIP
        | typeof ACTION_CUTTING_TIP
        | typeof ACTION_HEATING
        | typeof ACTION_CHECKING
        | typeof ACTION_HOMING
        | typeof ACTION_SELECTING
        | typeof ACTION_CUTTING_FILAMENT
        | typeof ACTION_PURGING
    has_bypass: boolean
    sync_drive: boolean
    sync_feedback_bias_modelled: number
    sync_feedback_bias_raw: number
    sync_feedback_enabled: boolean
    sync_feedback_state: string
    clog_detection: number
    clog_detection_enabled: number
    endless_spool: number
    endless_spool_enabled: number
    print_start_detection: number
    reason_for_pause: string
    extruder_filament_remaining: number
    spoolman_support: 'off' | 'readonly' | 'push' | 'pull'
    bowden_progress: number
    espooler_active: 'rewind' | 'assist' | 'off'
    sensors: {
        mmu_pre_gate?: boolean
        mmu_gear?: boolean
        mmu_gate?: boolean
        filament_compression?: boolean
        filament_proportional?: boolean
        filament_tension?: boolean
        extruder?: boolean
        toolhead?: boolean
    }
    servo?: 'Up' | 'Down' | 'Move' | 'Unknown'
    grip?: 'Gripped' | 'Released' | 'Unknown'
    encoder?: {
        enabled: boolean
        encoder_pos: number
        flow_rate: number
        detection_mode: typeof DIRECTION_LOAD | typeof DIRECTION_UNKNOWN | typeof DIRECTION_UNLOAD
        desired_headroom: number
        detection_length: number
        headroom: number
        min_headroom: number
    }
}

export interface MmuMachine {
    num_units: number
    [key: string]: number | MmuMachineUnit
}

export interface MmuMachineUnit {
    name: string
    vendor:
        | '3MS'
        | 'AngryBeaver'
        | 'BoxTurtle'
        | 'EMU'
        | 'ERCF'
        | 'HappyHare'
        | 'KMS'
        | 'MMX'
        | 'NightOwl'
        | 'QuattroBox'
        | 'Tradrack'
        | 'VVD'
    version: string
    num_gates: number
    first_gate: number
    selector_type: 'VirtualSelector' | 'RotarySelector' | 'ServoSelector' | 'LinearSelector'
    variable_rotation_distances: boolean
    variable_bowden_lengths: boolean
    require_bowden_move: boolean
    filament_always_gripped: boolean
    has_bypass: boolean
    multi_gear: boolean
    environment_sensor: string
}

export const NO_FILAMENT_COLOR = '#808182E3'

export const TOOL_GATE_BYPASS = -2
export const TOOL_GATE_UNKNOWN = -1

export const GATE_UNKNOWN = -1
export const GATE_EMPTY = 0
export const GATE_AVAILABLE = 1 // Available to load from either buffer or spool
export const GATE_AVAILABLE_FROM_BUFFER = 2

export const UNIT_UNKNOWN = -1

export const FILAMENT_SPEED_OVERRIDE_MIN = 10
export const FILAMENT_SPEED_OVERRIDE_MAX = 150

export const MmuTtgMap_START_X = 10
export const MmuTtgMap_START_Y = 8
export const MmuTtgMap_VERTICAL_SPACING = 12
export const MmuTtgMap_GROUP_SPACING = 12
export const MmuTtgMap_MAP_SPACE = 80
export const MmuTtgMap_LEADER = 10

export const FILAMENT_POS_UNKNOWN = -1
export const FILAMENT_POS_UNLOADED = 0 // Parked in gate
export const FILAMENT_POS_HOMED_GATE = 1 // Homed at either gate or gear sensor (currently assumed mutually exclusive sensors)
export const FILAMENT_POS_START_BOWDEN = 2 // Point of fast load portion
export const FILAMENT_POS_IN_BOWDEN = 3 // Some unknown position in the bowden
export const FILAMENT_POS_END_BOWDEN = 4 // End of fast load portion
export const FILAMENT_POS_HOMED_ENTRY = 5 // Homed at entry sensor
export const FILAMENT_POS_HOMED_EXTRUDER = 6 // Collision homing case at extruder gear entry
export const FILAMENT_POS_EXTRUDER_ENTRY = 7 // Past extruder gear entry
export const FILAMENT_POS_HOMED_TS = 8 // Homed at toolhead sensor
export const FILAMENT_POS_IN_EXTRUDER = 9 // In extruder past toolhead sensor
export const FILAMENT_POS_LOADED = 10 // Homed to nozzle

export const DIRECTION_LOAD = 1
export const DIRECTION_UNKNOWN = 0
export const DIRECTION_UNLOAD = -1

export const ACTION_IDLE = 'Idle'
export const ACTION_LOADING = 'Loading'
export const ACTION_LOADING_EXTRUDER = 'Loading Ext'
export const ACTION_UNLOADING = 'Unloading'
export const ACTION_UNLOADING_EXTRUDER = 'Unloading Ext'
export const ACTION_FORMING_TIP = 'Forming Tip'
export const ACTION_CUTTING_TIP = 'Cutting Tip'
export const ACTION_HEATING = 'Heating'
export const ACTION_CHECKING = 'Checking'
export const ACTION_HOMING = 'Homing'
export const ACTION_SELECTING = 'Selecting'
export const ACTION_CUTTING_FILAMENT = 'Cutting Filament'
export const ACTION_PURGING = 'Purging'

@Component({})
export default class MmuMixin extends Mixins(BaseMixin) {
    get mmu(): Mmu | undefined {
        return this.$store.state.printer.mmu ?? undefined
    }

    get hasMmuEncoder() {
        return 'encoder' in (this.mmu ?? {})
    }

    get mmuMachine(): MmuMachine | undefined {
        return this.$store.state.printer.mmu_machine ?? undefined
    }

    get mmuSettings() {
        return this.$store.state.printer.configfile?.settings?.mmu ?? {}
    }

    get mmuSoftwareVars() {
        return this.$store.state.printer['gcode_macro _MMU_SOFTWARE_VARS']
    }

    get mmuNumGates() {
        return this.mmu?.num_gates ?? 0
    }

    get spoolWidth() {
        if (this.mmuNumGates <= 8) return 56
        if (this.mmuNumGates <= 16) return 48

        return 40
    }

    get ttgMap() {
        return this.mmu?.ttg_map ?? []
    }

    get endlessSpoolGroups() {
        return this.mmu?.endless_spool_groups ?? []
    }

    get mmuAction() {
        return this.mmu?.action ?? ACTION_IDLE
    }

    get mmuPrintState() {
        return this.mmu?.print_state ?? ''
    }

    get mmuSensors() {
        return this.mmu?.sensors ?? undefined
    }

    get mmuEncoder() {
        return this.mmu?.encoder ?? undefined
    }

    get mmuNumUnits() {
        return this.mmuMachine?.num_units ?? 1
    }

    get mmuUnit() {
        return this.mmu?.unit ?? UNIT_UNKNOWN
    }

    get mmuGate() {
        return this.mmu?.gate ?? TOOL_GATE_UNKNOWN
    }

    get mmuTool() {
        return this.mmu?.tool ?? TOOL_GATE_UNKNOWN
    }

    get mmuHasBypass() {
        return this.mmu?.has_bypass ?? false
    }

    get mmuFilamentPos() {
        return this.mmu?.filament_pos ?? FILAMENT_POS_UNKNOWN
    }

    get mmuSyncDrive() {
        return this.mmu?.sync_drive ?? false
    }

    get mmuSpoolmanSupport() {
        return this.mmu?.spoolman_support ?? 'off'
    }

    get mmuServo() {
        return this.mmu?.servo ?? 'Unknown'
    }

    get mmuGrip() {
        return this.mmu?.grip ?? 'Unknown'
    }

    get configGateHomingEndstop(): string {
        return this.mmuSettings?.gate_homing_endstop
    }

    get canSend(): boolean {
        const idleTimeout = this.$store.state.printer.idle_timeout?.state ?? ''

        return this.klipperReadyForGui && this.printer_state !== 'printing' && idleTimeout !== 'Printing'
    }

    /*
     * Helper functions
     */

    getMmuMachineUnit(unitIndex: number): MmuMachineUnit | undefined {
        return (this.mmuMachine?.[`unit_${unitIndex}`] as MmuMachineUnit) ?? undefined
    }

    hasMmuSensor(sensorName: keyof Mmu['sensors']) {
        return this.mmuSensors !== undefined && sensorName in this.mmuSensors
    }

    getMmuSensor(sensorName: keyof Mmu['sensors']) {
        return this.mmuSensors ? this.mmuSensors[sensorName] : undefined
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    formColorString(color: string | null) {
        if (!color) return NO_FILAMENT_COLOR

        const namedColor = W3C_COLORS.find((c) => c.name === color.toLowerCase())
        if (namedColor) {
            return namedColor.hex.length === 7 ? `${namedColor.hex}FF` : namedColor.hex.toUpperCase()
        }

        const hexPattern = /^#?([0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?)$/
        const match = color.match(hexPattern)
        if (!match) return NO_FILAMENT_COLOR

        const hex = match[1]
        const normalized = `#${hex}${hex.length === 6 ? 'FF' : ''}`

        return normalized.toUpperCase()
    }
}
