import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerState } from '@/store/server/types'
import { formatConsoleMessage } from '@/plugins/helpers'
import { maxEventHistory } from '@/store/variables'

export const mutations: MutationTree<ServerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setKlippyConnected(state) {
        state.klippy_connected = true
    },

    setKlippyState(state, payload) {
        state.klippy_state = payload
    },

    setKlippyStateTimer(state, payload) {
        state.klippy_state_timer = payload
    },

    setKlippyMessage(state, payload) {
        state.klippy_message = payload
    },

    setKlippyDisconnected(state) {
        state.klippy_connected = false
        state.klippy_state = 'disconnected'
        state.klippy_message = 'Disconnected...'
    },

    setKlippyShutdown(state) {
        state.klippy_state = 'shutdown'
        state.klippy_message = 'Shutdown...'
    },

    setCpuTemp(state, payload) {
        state.cpu_temp = payload
    },

    setMoonrakerStats(state, payload) {
        state.moonraker_stats = payload
    },

    setNetworkStats(state, payload) {
        state.network_stats = payload
    },

    setCpuStats(state, payload) {
        state.system_cpu_usage = payload
    },

    setKlippyConnectedTimer(state, timer) {
        state.klippy_connected_timer = timer
    },

    setProcStats(state, payload) {
        state.cpu_temp = payload.cpu_temp
        state.moonraker_stats = payload.moonraker_stats
    },

    setConnectionId(state, payload) {
        state.connection_id = payload
    },

    setData(state, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        Object.entries(payload).forEach(([key, value]) => {
            state[key] = value
        })
    },

    saveDbNamespaces(state, payload) {
        state.dbNamespaces = payload
    },

    setConfig(state, payload) {
        state.config = payload
    },

    setConsoleClearedThisSession(state) {
        state.console_cleared_this_session = true
    },

    clearGcodeStore(state) {
        state.events = []
    },

    setGcodeStore(state, payload: { time: number; type: string; message: string }[]) {
        //const t0 = performance.now()

        if (payload.length >= maxEventHistory) {
            payload = payload.slice(payload.length - maxEventHistory)
        }

        payload.forEach((message) => {
            const date = new Date(message.time * 1000)
            let formatMessage = formatConsoleMessage(message.message)

            let type = message.type
            if (type === 'command') formatMessage = '<a class="command text--blue">' + formatMessage + '</a>'
            if (type === 'response') {
                if (message.message.startsWith('// action:')) type = 'action'
                else if (message.message.startsWith('// debug:')) type = 'debug'
            }

            state.events.push({
                date,
                message: message.message,
                formatMessage: formatMessage,
                type,
            })
        })

        //const t1 = performance.now()
        //window.console.debug("import events", t1-t0)
    },

    addEvent(state, payload) {
        if (
            ['command', 'autocomplete'].includes(payload.type) &&
            state.events[state.events.length - 1]?.type === 'autocomplete'
        ) {
            state.events.pop()
        }

        state.events.push({
            date: payload.date,
            message: payload.message,
            formatMessage: payload.formatMessage,
            type: payload.type,
        })

        if (state.events.length >= maxEventHistory) {
            state.events = state.events.slice(state.events.length - maxEventHistory)
        }
    },

    setSystemInfo(state, payload) {
        state.system_info = payload
    },

    setThrottledState(state, payload) {
        if (payload && 'bits' in payload) state.throttled_state.bits = payload.bits

        if (payload && 'flags' in payload) state.throttled_state.flags = payload.flags
    },

    setSystemBootAt(state, payload) {
        state.system_boot_at = payload
    },

    addRootDirectory(state, payload) {
        state.registered_directories.push(payload.name)
    },

    updateServiceState(state, payload) {
        const name = Object.keys(payload)[0]

        if (state.system_info?.service_state) state.system_info.service_state[name] = payload[name]
    },

    addFailedInitComponent(state, payload) {
        const failed_init_components = state.failed_init_components
        if (!failed_init_components.includes(payload)) failed_init_components.push(payload)

        state.failed_init_components = failed_init_components
    },

    removeComponent(state, payload) {
        const components = state.components
        const index = components.indexOf(payload)

        if (index === -1) return

        components.splice(index, 1)
        state.components = components
    },
}
