import {GetterTree} from 'vuex'
import {ServerState} from '@/store/server/types'
import {formatConsoleMessage, formatFilesize, formatTime} from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<ServerState, any> = {

    getConsoleEvents: (state) => (reverse = true, limit = 500) => {
        const events = [...state.events].slice(limit * -1) ?? []

        if (events.length < 20) {
            const date = events.length ? events[0].date : new Date()
            let message = ''

            message += '- Type <a class="command text--blue">HELP</a> to get a list of available commands.\n'
            message += '- Click on the "?" button to get a searchable list.\n'
            message += '- Commands in the console are clickable and will be placed into the input field.\n'
            message += '- Use the tab key to complete your inputs. If there are several options, a list is displayed.\n'
            message += '- Use the ⇵ arrow keys to navigate through the previous entries.\n'

            events.unshift({
                date: date,
                formatTime: formatTime(date),
                message: message,
                formatMessage: formatConsoleMessage(message),
                type: 'response',
            })
        }

        return (reverse) ? events.reverse() : events
    },

    getConfig: (state) => (section: string, attribute: string) => {
        if (
            section in state.config &&
            attribute in state.config[section]
        ) return state.config[section][attribute]

        return null
    },

    getHostStats: (state, getters, rootState, rootGetters) => {
        interface HostStats {
            cpuName: string | null
            cpuDesc: string | null
            version: string | null
            os: string | null
            release_info?: {
                name: string
                version_id: string
                id: string
            } | null
            load: number
            loadPercent: number
            loadProgressColor: string
            memoryFormat: string | null
            memUsed: string
            memAvail: string
            memTotal: string
            tempSensor: {
                temperature: number
                measured_min_temp: number | null,
                measured_max_temp: number | null
            }
        }

        let output: HostStats | null = null

        //state.printer.system_stats
        if ('system_info' in state) {
            let version: null | string = null
            if (rootState.printer?.software_version) {
                version = rootState.printer?.software_version.split('-').slice(0, 4).join('-')
            }

            const cpuCors = state.system_info?.cpu_info?.cpu_count ?? 1
            const load = Math.round((rootState.printer.system_stats?.sysload ?? 0) * 100) / 100
            const loadPercent = Math.round(load / cpuCors * 100)

            let loadProgressColor = 'primary'
            if (loadPercent > 95) loadProgressColor = 'error'
            else if (loadPercent > 80) loadProgressColor = 'warning'

            let memoryFormat: null | string = null
            const memAvail = (rootState.printer.system_stats?.memavail ?? 0) * 1024
            const memTotal = (state.system_info?.cpu_info?.total_memory ?? 0) * 1024

            if (memAvail > 0 && memTotal > 0) {
                memoryFormat = formatFilesize(memTotal - memAvail) + ' / ' + formatFilesize(memTotal)
            } else if (memTotal) {
                memoryFormat = formatFilesize(memTotal)
            }

            let tempSensor = rootGetters['printer/getHostTempSensor']
            if (tempSensor === null) {
                tempSensor = {
                    temperature: state.cpu_temp?.toFixed(0),
                    measured_min_temp: null,
                    measured_max_temp: null
                }
            }

            output = {
                cpuName: state.system_info?.cpu_info?.processor ?? null,
                cpuDesc: state.system_info?.cpu_info?.cpu_desc ?? null,
                version,
                os: state.system_info?.distribution?.name ?? null,
                release_info: state.system_info?.distribution?.release_info ?? null,
                load,
                loadPercent: loadPercent < 100 ? loadPercent : 100,
                loadProgressColor,
                memoryFormat,
                memUsed: formatFilesize(memTotal - memAvail),
                memAvail: formatFilesize(memAvail),
                memTotal: formatFilesize(memTotal),
                tempSensor,
            }
        }

        return output
    },
}