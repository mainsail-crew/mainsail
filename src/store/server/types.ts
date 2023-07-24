import { ServerPowerState } from '@/store/server/power/types'
import { ServerUpdateManagerState } from '@/store/server/updateManager/types'
import { ServerHistoryState } from '@/store/server/history/types'
import { ServerTimelapseState } from '@/store/server/timelapse/types'

export interface ServerState {
    klippy_connected: boolean
    klippy_connected_timer: number | null
    klippy_state: string
    klippy_state_timer: number | null
    klippy_message: string
    components: string[]
    failed_components: string[]
    warnings: string[]
    registered_directories: string[]
    events: ServerStateEvent[]
    config: {
        // eslint-disable-next-line
        [key: string]: any
    }
    system_info: {
        available_services: string[]
        cpu_info: ServerStateCpuInfo
        distribution: ServerStateDistribution
        sd_info: ServerStateSdInfo
        service_state: ServerStateServiceStates
        python: {
            version: string[]
            version_string: string
        }
        network: {
            [key: string]: ServerStateNetwork
        }
        system_uptime: number | null
    } | null
    system_boot_at: Date | null
    moonraker_stats: {
        cpu_usage: number
        mem_units: string
        memory: number
        time: number
    } | null
    cpu_temp: number
    throttled_state: {
        bits: number
        flags: string[]
    }
    network_stats: {
        [name: string]: ServerStateNetworkInterface
    }
    system_cpu_usage: {
        [name: string]: number
    }
    dbNamespaces: string[]
    websocket_count: number
    moonraker_version: string

    console_cleared_this_session?: boolean

    power?: ServerPowerState
    updateManager?: ServerUpdateManagerState
    history?: ServerHistoryState
    timelapse?: ServerTimelapseState
}

export interface ServerStateEvent {
    date: Date
    time?: number
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

export interface ServerStateNetwork {
    mac_address: string
    ip_addresses: ServerStateNetworkIpaddresses[]
}

export interface ServerStateNetworkIpaddresses {
    family: 'ipv4' | 'ipv6'
    address: string
    is_link_local: boolean
}

export interface ServerStateNetworkInterface {
    bandwidth: number
    rx_bytes: number
    tx_bytes: number
    details?: ServerStateNetwork
}
