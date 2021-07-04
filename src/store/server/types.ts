import { ServerPowerState } from "@/store/server/power/types"
import { ServerUpdateMangerState } from "@/store/server/updateManager/types"
import { ServerHistoryState } from "@/store/server/history/types";

export interface ServerState {
    klippy_connected: boolean
    klippy_state: string
    klippy_message: string
    components: string[],
    failed_components: string[],
    warnings: string[],
    registered_directories: string[],
    events: ServerStateEvent[],
    config: any,
    system_info: any,
    moonraker_stats: any
    cpu_temp: number

    power?: ServerPowerState
    updateManager?: ServerUpdateMangerState
    history?: ServerHistoryState
}

export interface ServerStateEvent {
    date: Date
    formatTime: string
    type: string
    message: string
    formatMessage: string | string[]
}