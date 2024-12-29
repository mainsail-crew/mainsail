export interface AFCState {
    data: AFCRoot
    activeUnit: Unit | null
    activeLane: Lane | null
}

export interface AFCRoot {
    units: Unit[]
    system: System
    laneList: string[]
    mapList: string[]
}

export interface Spool {
    material: string
    spool_id: string
    color: string
    weight: number
}

export interface Lane {
    LANE: number
    map: string
    load: boolean
    prep: boolean
    tool_loaded: boolean
    loaded_to_hub: boolean
    spool: Spool
    runout_lane: string
    filament_status: string
    filament_status_led: string
    status: string
    unitName: string
    laneName: string
    empty: string
}

export interface Unit {
    system: {
        type: string
        hub_loaded: boolean
        can_cut: boolean
        screen: string
    }
    unitName: string
    lanes: Lane[]
}

export interface Extruder {
    name: string
    lane_loaded: string
    tool_start_sensor: boolean
    tool_end_sensor: boolean
    buffer: string
    buffer_status: string
}

export interface System {
    current_load: string | null
    num_units: number
    num_lanes: number
    num_extruders: number
    extruders: Extruder[]
}
