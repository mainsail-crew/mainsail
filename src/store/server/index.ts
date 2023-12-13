import { Module } from 'vuex'
import { ServerState } from '@/store/server/types'
import { actions } from '@/store/server/actions'
import { mutations } from '@/store/server/mutations'
import { getters } from '@/store/server/getters'

// import modules
import { power } from '@/store/server/power'
import { updateManager } from '@/store/server/updateManager'
import { history } from '@/store/server/history'
import { timelapse } from '@/store/server/timelapse'
import { jobQueue } from '@/store/server/jobQueue'
import { announcements } from '@/store/server/announcements'
import { spoolman } from '@/store/server/spoolman'

// create getDefaultState
export const getDefaultState = (): ServerState => {
    return {
        klippy_connected: false,
        klippy_connected_timer: null,
        klippy_state: '',
        klippy_state_timer: null,
        klippy_message: '',
        components: [],
        failed_components: [],
        failed_init_components: [],
        warnings: [],
        registered_directories: [],
        events: [],
        config: {},
        system_info: null,
        system_boot_at: null,
        cpu_temp: 0,
        moonraker_stats: null,
        throttled_state: {
            bits: 0,
            flags: [],
        },
        network_stats: {},
        system_cpu_usage: {},
        dbNamespaces: [],
        websocket_count: 0,
        moonraker_version: '',
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const server: Module<ServerState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        power,
        updateManager,
        history,
        timelapse,
        jobQueue,
        announcements,
        spoolman,
    },
}
