export interface AFCState {
    units: Unit[]
    current_load: Lane | null
    current_lane: Lane | null
    next_lane: Lane | null
    lanes: Lane[]
    hubs: Hub[]
    buffers: FilBuffer[]
    extruders: Extruder[]
    laneList: string[]
    mapList: string[]
    bypass_status: boolean
}

export interface Unit {
    type: string
    screen: string
    name: string
    lanes: Lane[]
    hubs: Hub[]
    buffers: FilBuffer[]
    extruders: Extruder[]
}

export interface Lane {
    name: string
    unit: string
    hub: Hub
    buffer: FilBuffer
    extruder: Extruder
    lane: number
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
    empty: string
}

export interface Spool {
    material: string
    spool_id: string
    color: string
    weight: number
}

export interface Extruder {
    name: string
    lane_loaded: string
    ramming: boolean
    has_start_sensor: boolean
    has_end_sensor: boolean
    tool_start_status: boolean
    tool_end_status: boolean
}

export interface Hub {
    name: string
    state: boolean
    cut: boolean
}

export interface FilBuffer {
    name: string
    state: string
}

export interface Message {
    message: string
    type: string
}
