import { ServerPowerState } from '@/store/server/power/types'
import { ServerUpdateMangerState } from '@/store/server/updateManager/types'
import { ServerHistoryState } from '@/store/server/history/types'
import { ServerTimelapseState } from '@/store/server/timelapse/types'

export interface ServerState {
    klippy_connected: boolean
    klippy_connected_timer: number | null
    klippy_state: string
    klippy_state_timer: number | null
    klippy_message: string
    components: string[],
    failed_components: string[],
    warnings: string[],
    registered_directories: string[],
    events: ServerStateEvent[],
    config: {
        // eslint-disable-next-line
        [key: string]: any
    },
    system_info: {
        available_services: string[]
        cpu_info: ServerStateCpuInfo
        distribution: ServerStateDistribution
        sd_info: ServerStateSdInfo
        service_state: ServerStateServiceStates
    } | null
    moonraker_stats: {
        cpu_usage: number,
        mem_units: string
        memory: number
        time: number
    } | null
    cpu_temp: number,
    throttled_state: {
        bits: number
        flags: string[]
    },
    dbNamespaces: string[]
    websocket_count: number
    moonraker_version: string

    power?: ServerPowerState
    updateManager?: ServerUpdateMangerState
    history?: ServerHistoryState
    timelapse?: ServerTimelapseState
}

export interface ServerStateEvent {
    date: Date
    formatTime: string
    type: string
    message: string
    formatMessage: string | string[]
}

export interface ServerStateCpuInfo {
    bits: string
    cpu_count: number
    cpu_desc: string
    serial_number: string
    hardware_desc: string
    memory_units: string
    model: string
    processor: string
    total_memory: number
}

export interface ServerStateDistribution {
    codename: string
    id: string
    like: string
    name: string
    version: string
    version_parts: {
        build_number: string
        major: string
        minor: string
    }
    release_info?: {
        name: string
        version_id: string
        id: string
    }
}

export interface ServerStateSdInfo {
    capacity: string
    manufacturer: string
    manufacturer_date: string
    manufacturer_id: string
    oem_id: string
    product_name: string
    product_revision: string
    serial_number: string
    total_bytes: number
}

export interface ServerStateServiceStates {
    [key: string]: ServerStateServiceState
}

export interface ServerStateServiceState {
    active_state: string
    sub_state: string
}