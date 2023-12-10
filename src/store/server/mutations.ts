import Vue from 'vue'
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
        Vue.set(state, 'klippy_connected', true)
    },

    setKlippyState(state, payload) {
        Vue.set(state, 'klippy_state', payload)
    },

    setKlippyStateTimer(state, payload) {
        Vue.set(state, 'klippy_state_timer', payload)
    },

    setKlippyMessage(state, payload) {
        Vue.set(state, 'klippy_message', payload)
    },

    setKlippyDisconnected(state) {
        Vue.set(state, 'klippy_connected', false)
        Vue.set(state, 'klippy_state', 'disconnected')
        Vue.set(state, 'klippy_message', 'Disconnected...')
    },

    setKlippyShutdown(state) {
        Vue.set(state, 'klippy_state', 'shutdown')
        Vue.set(state, 'klippy_message', 'Shutdown...')
    },

    setCpuTemp(state, payload) {
        Vue.set(state, 'cpu_temp', payload)
    },

    setMoonrakerStats(state, payload) {
        Vue.set(state, 'moonraker_stats', payload)
    },

    setNetworkStats(state, payload) {
        Vue.set(state, 'network_stats', payload)
    },

    setCpuStats(state, payload) {
        Vue.set(state, 'system_cpu_usage', payload)
    },

    setKlippyConnectedTimer(state, timer) {
        Vue.set(state, 'klippy_connected_timer', timer)
    },

    setProcStats(state, payload) {
        Vue.set(state, 'cpu_temp', payload.cpu_temp)
        Vue.set(state, 'moonraker_stats', payload.moonraker_stats)
    },

    setConnectionId(state, payload) {
        Vue.set(state, 'connection_id', payload)
    },

    setData(state, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        Object.entries(payload).forEach(([key, value]) => {
            Vue.set(state, key, value)
        })
    },

    saveDbNamespaces(state, payload) {
        Vue.set(state, 'dbNamespaces', payload)
    },

    setConfig(state, payload) {
        Vue.set(state, 'config', payload)
    },

    setConsoleClearedThisSession(state) {
        Vue.set(state, 'console_cleared_this_session', true)
    },

    clearGcodeStore(state) {
        Vue.set(state, 'events', [])
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
            if (type === 'response' && message.message.startsWith('// action:')) type = 'action'

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
        Vue.set(state, 'system_info', payload)
    },

    setThrottledState(state, payload) {
        if (payload && 'bits' in payload) Vue.set(state.throttled_state, 'bits', payload.bits)

        if (payload && 'flags' in payload) Vue.set(state.throttled_state, 'flags', payload.flags)
    },

    setSystemBootAt(state, payload) {
        Vue.set(state, 'system_boot_at', payload)
    },

    addRootDirectory(state, payload) {
        state.registered_directories.push(payload.name)
    },

    updateServiceState(state, payload) {
        const name = Object.keys(payload)[0]

        if (state.system_info?.service_state) Vue.set(state.system_info.service_state, name, payload[name])
    },

    addFailedInitComponent(state, payload) {
        const failed_init_components = state.failed_init_components
        if (!failed_init_components.includes(payload)) failed_init_components.push(payload)

        Vue.set(state, 'failed_init_components', failed_init_components)
    },

    removeComponent(state, payload) {
        const components = state.components
        const index = components.indexOf(payload)

        if (index === -1) return

        components.splice(index, 1)
        Vue.set(state, 'components', components)
    },
}
