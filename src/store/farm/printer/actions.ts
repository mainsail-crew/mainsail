import { ActionTree } from 'vuex'
import {
    FarmPrinterSettings,
    FarmPrinterState,
    FarmPrinterStateData,
    FarmPrinterStateMainsail,
} from '@/store/farm/printer/types'
import { RootState } from '@/store/types'
import { GuiState } from '@/store/gui/types'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { createFarmClient, getFarmClient } from '@/store/farm/printer/clients'
import { getDefaultMainsail } from '@/store/farm/printer/index'
import { themeDir } from '@/store/variables'
import { JsonRpcSocket } from '@/plugins/jsonRpcSocket'
import { isRecord } from '@/plugins/helpers'
import { isJsonRpcError, NAMESPACE_NOT_FOUND } from '@/types/moonraker'

const LOG_PREFIX = '[FARM]'
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

/** Klipper objects the farm panel needs. Objects with a space in the name must match exactly. */
const SUBSCRIBED_OBJECTS = [
    'webhooks',
    'print_stats',
    'virtual_sdcard',
    'display_status',
    'heater_bed',
    'temperature_fan chamber',
    'temperature_sensor chamber',
]
const EXTRUDER_OBJECT = /^extruder\d*$/

/** Server notifications that are passed on to an action. All others are ignored. */
const NOTIFICATION_ACTIONS: Record<string, string> = {
    notify_status_update: 'onStatusUpdate',
    notify_klippy_ready: 'onKlippyReady',
    notify_klippy_shutdown: 'onKlippyShutdown',
    notify_klippy_disconnected: 'onKlippyDisconnected',
}

/** The client of a printer. Throws if the printer is not connected (e.g. it was unregistered meanwhile). */
const requireClient = (id: string): JsonRpcSocket => {
    const client = getFarmClient(id)
    if (!client) throw new Error(`No client for farm printer ${id}`)

    return client
}

const parseMainsail = (value: unknown): FarmPrinterStateMainsail => {
    const defaults = getDefaultMainsail()
    if (!isRecord(value)) return defaults

    const general = (isRecord(value.general) ? value.general : {}) as Partial<GuiState['general']>
    const uiSettings = (isRecord(value.uiSettings) ? value.uiSettings : {}) as Partial<GuiState['uiSettings']>

    return {
        printername: general.printername ?? defaults.printername,
        logoColor: uiSettings.logo ?? defaults.logoColor,
        calcPrintProgress: general.calcPrintProgress ?? defaults.calcPrintProgress,
        calcEtaTime: general.calcEtaTime ?? defaults.calcEtaTime,
    }
}

export const actions: ActionTree<FarmPrinterState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    /** Opens a new connection. An existing connection is dropped, so this is also used to reconnect. */
    connect({ state, commit, dispatch, getters }): void {
        // an existing connection is dropped without onClose, so reset its state here
        commit('setSocket', { isConnected: false, isConnecting: true })
        commit('setKlippyState', 'disconnected')

        const client =
            getFarmClient(state.id) ??
            createFarmClient(state.id, getters.socketUrl, {
                onOpen: () => dispatch('onOpen'),
                onClose: () => dispatch('onClose'),
                onNotification: ({ method, params }) => {
                    const action = NOTIFICATION_ACTIONS[method]
                    if (action) dispatch(action, params?.[0])
                },
            })

        client.setUrl(getters.socketUrl)
        client.connect()
    },

    disconnect({ state }): void {
        getFarmClient(state.id)?.close()
    },

    async onOpen({ commit, dispatch }): Promise<void> {
        commit('setSocket', { isConnected: true, isConnecting: false })
        await dispatch('init')
    },

    onClose({ commit }): void {
        commit('setSocket', { isConnected: false, isConnecting: false })
        commit('setKlippyState', 'disconnected')
    },

    async init({ state, commit, dispatch }): Promise<void> {
        try {
            const info = await requireClient(state.id).request('server.info')
            commit('setKlippyState', info.klippy_state)
        } catch (error) {
            logError(`${state.socket.hostname}: server.info failed`, error)
            return
        }

        await dispatch('fetchPrinterData')
    },

    async fetchPrinterData({ state, dispatch }): Promise<void> {
        const requests = [dispatch('fetchThemeFiles'), dispatch('fetchMainsail'), dispatch('fetchWebcams')]
        // during startup, Moonraker sends notify_klippy_ready once the printer objects are available
        if (!['disconnected', 'startup'].includes(state.klippyState)) requests.push(dispatch('subscribe'))

        const results = await Promise.allSettled(requests)
        results.forEach((result) => {
            if (result.status === 'rejected') logError(`${state.socket.hostname}:`, result.reason)
        })
    },

    async subscribe({ state, commit, dispatch }): Promise<void> {
        const client = requireClient(state.id)
        const { objects } = await client.request('printer.objects.list')

        const subscriptions = Object.fromEntries(
            objects
                .filter((name) => SUBSCRIBED_OBJECTS.includes(name) || EXTRUDER_OBJECT.test(name))
                .map((name) => [name, null])
        )
        if (Object.keys(subscriptions).length === 0) return

        const result = await client.request('printer.objects.subscribe', { objects: subscriptions })
        commit('resetData')
        await dispatch('onStatusUpdate', result.status)
    },

    async fetchThemeFiles({ state, commit }): Promise<void> {
        const files = await requireClient(state.id).request('server.files.list', { root: 'config' })
        const themeFiles = files.map((file) => file.path).filter((path) => path.startsWith(`${themeDir}/`))

        commit('setThemeFiles', themeFiles)
    },

    async fetchMainsail({ state, commit }): Promise<void> {
        try {
            const response = await requireClient(state.id).request('server.database.get_item', {
                namespace: 'mainsail',
            })
            commit('setMainsail', parseMainsail(response.value))
        } catch (error) {
            // a printer without a mainsail namespace uses the defaults
            if (!isJsonRpcError(error) || error.code !== NAMESPACE_NOT_FOUND) throw error
            commit('setMainsail', getDefaultMainsail())
        }
    },

    async fetchWebcams({ state, commit }): Promise<void> {
        const { webcams } = await requireClient(state.id).request('server.webcams.list')
        commit('setWebcams', webcams as GuiWebcamStateWebcam[])
    },

    async fetchCurrentFile({ state, commit }, filename: string): Promise<void> {
        if (filename === '') {
            commit('setCurrentFile', null)
            return
        }

        try {
            const metadata = await requireClient(state.id).request('server.files.metadata', { filename })
            // the printer could have started another file in the meantime
            if (state.data.print_stats?.filename !== filename) return

            commit('setCurrentFile', {
                filename,
                thumbnails: metadata.thumbnails ?? [],
                gcode_start_byte: metadata.gcode_start_byte ?? null,
                gcode_end_byte: metadata.gcode_end_byte ?? null,
                filament_total: metadata.filament_total ?? null,
                estimated_time: metadata.estimated_time ?? null,
            })
        } catch (error) {
            if (state.data.print_stats?.filename === filename) commit('setCurrentFile', null)
            logError(`${state.socket.hostname}: cannot load metadata of ${filename}`, error)
        }
    },

    async onStatusUpdate({ state, commit, dispatch }, status: FarmPrinterStateData): Promise<void> {
        commit('setData', status)

        const filename = status.print_stats?.filename
        if (filename === undefined || filename === state.currentFile?.filename) return

        await dispatch('fetchCurrentFile', filename)
    },

    async onKlippyReady({ state, commit, dispatch }): Promise<void> {
        commit('setKlippyState', 'ready')

        try {
            await dispatch('subscribe')
        } catch (error) {
            logError(`${state.socket.hostname}: subscribe failed`, error)
        }
    },

    onKlippyShutdown({ commit }): void {
        commit('setKlippyState', 'shutdown')
    },

    onKlippyDisconnected({ commit }): void {
        commit('setKlippyState', 'disconnected')
        commit('resetData')
    },

    async saveSettings({ commit, dispatch, state }, settings: FarmPrinterSettings): Promise<void> {
        commit('setSettings', settings)
        await dispatch('gui/remoteprinters/updateSettings', { id: state.id, settings: state.settings }, { root: true })
    },
}
