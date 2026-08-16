import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { GuiRemoteprintersState, GuiRemoteprintersStatePrinter } from '@/store/gui/remoteprinters/types'

const LOG_PREFIX = '[GUI][REMOTEPRINTERS]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<GuiRemoteprintersState, RootState> = {
    reset({ commit, dispatch, state }): void {
        Object.keys(state.printers).forEach((id) => {
            dispatch('farm/unregisterPrinter', id, { root: true })
        })

        commit('reset')
    },

    init({ commit, dispatch }, payload: Record<string, GuiRemoteprintersStatePrinter>): void {
        dispatch('reset')

        Object.entries(payload).forEach(([id, value]) => {
            commit('save', { id, value })
            dispatch(
                'farm/registerPrinter',
                {
                    id,
                    hostname: value.hostname ?? '',
                    port: value.port ?? 7125,
                    path: value.path ?? '',
                    settings: value.settings ?? {},
                },
                { root: true }
            )
        })
    },

    initFromLocalstorage({ dispatch, rootState }): void {
        let value = rootState.configInstances ?? []
        if (rootState.instancesDB === 'browser') value = JSON.parse(localStorage.getItem('printers') ?? '{}')
        if (!Array.isArray(value)) return

        const printers = Object.fromEntries(
            value.map((printer) => [uuidv4(), printer as GuiRemoteprintersStatePrinter])
        )

        dispatch('init', printers)
    },

    async upload(
        { commit, dispatch, rootState },
        payload: { id: string; value: GuiRemoteprintersStatePrinter }
    ): Promise<void> {
        const instancesDB = rootState.instancesDB ?? 'moonraker'

        switch (instancesDB) {
            case 'browser':
                commit('save', payload)
                await dispatch('uploadToLocalStore')
                break
            case 'moonraker':
                await dispatch('uploadToMoonraker', payload)
                break
            case 'json':
                logDebug("instancesDB 'json' is read-only, skipping upload")
                break
            default:
                logError(`Unknown instancesDB: ${instancesDB}`)
        }
    },

    async uploadToLocalStore({ state }): Promise<void> {
        const printers: GuiRemoteprintersStatePrinter[] = []

        Object.keys(state.printers).forEach((id: string) => {
            const printer = state.printers[id] ?? undefined
            if (!printer) return

            printers.push({
                hostname: printer.hostname,
                port: printer.port,
                name: printer.name,
                path: printer.path,
                settings: printer.settings,
            })
        })

        localStorage.setItem('printers', JSON.stringify(printers))
    },

    async uploadToMoonraker(
        { dispatch, state },
        payload: { id: string; value: GuiRemoteprintersStatePrinter }
    ): Promise<void> {
        const name = `remoteprinters.printers.${payload.id}`
        const printer = { ...(state.printers[payload.id] ?? {}), ...payload.value }
        // create a new object with only whitelisted properties to avoid writing unwanted properties to Moonraker
        const value = {
            hostname: printer.hostname,
            port: printer.port,
            path: printer.path,
            name: printer.name,
            settings: printer.settings,
        }

        await dispatch('gui/saveSetting', { name, value }, { root: true })
    },

    async store({ dispatch }, value: GuiRemoteprintersStatePrinter): Promise<void> {
        const id = uuidv4()

        await dispatch('upload', { id, value })
        dispatch(
            'farm/registerPrinter',
            {
                id,
                hostname: value.hostname ?? '',
                port: value.port ?? 7125,
                path: value.path ?? '',
                name: value.name,
            },
            { root: true }
        )
    },

    async update(
        { dispatch, state },
        payload: { id: string; value: Partial<GuiRemoteprintersStatePrinter> }
    ): Promise<void> {
        const id = payload.id
        const oldPrinter = state.printers[payload.id] ?? {}
        const printer = { ...oldPrinter, ...payload.value }
        const needUpdateFarmPrinter =
            oldPrinter.hostname !== printer.hostname ||
            oldPrinter.port !== printer.port ||
            oldPrinter.path !== printer.path

        await dispatch('upload', { id, value: printer })

        if (needUpdateFarmPrinter) {
            dispatch('farm/updatePrinter', { id, value: printer }, { root: true })
        }
    },

    async updateSettings(
        { dispatch },
        payload: { id: string; settings: GuiRemoteprintersStatePrinter['settings'] }
    ): Promise<void> {
        const id = payload.id
        const value = { settings: payload.settings }

        await dispatch('update', { id, value })
    },

    async delete({ commit, dispatch, rootState }, id: string): Promise<void> {
        commit('delete', id)
        dispatch('farm/unregisterPrinter', id, { root: true })

        const instancesDB = rootState.instancesDB ?? 'browser'
        switch (instancesDB) {
            case 'browser':
                await dispatch('uploadToLocalStore')
                break
            case 'moonraker':
                await dispatch('gui/deleteSetting', `remoteprinters.printers.${id}`, { root: true })
                break
            case 'json':
                logDebug("instancesDB 'json' is read-only, skipping delete")
                break
            default:
                logError(`Unknown instancesDB: ${instancesDB}`)
        }
    },
}
