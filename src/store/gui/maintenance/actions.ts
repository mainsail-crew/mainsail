import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiMaintenanceState, GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { themeDir } from '@/store/variables'
import { isJsonRpcError, JsonRpcError, NAMESPACE_NOT_FOUND } from '@/types/moonraker'
import i18n from '@/plugins/i18n'

const LOG_PREFIX = '[GUI][Maintenance]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<GuiMaintenanceState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    async init({ commit, dispatch }): Promise<void> {
        logDebug('init')
        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitComponents.Maintenance').toString(), {
            root: true,
        })

        const entries = await (async (): Promise<Record<string, GuiMaintenanceStateEntry>> => {
            try {
                const payload = await Vue.$socket.emitAndWait('server.database.get_item', { namespace: 'maintenance' })
                return (payload?.value ?? {}) as Record<string, GuiMaintenanceStateEntry>
            } catch (e) {
                if (!isJsonRpcError(e) || e.code !== NAMESPACE_NOT_FOUND) {
                    const message = (e as JsonRpcError).message || 'Unknown error'
                    logError('Error while fetching maintenance namespace', message)
                    throw e
                }

                logDebug('create Maintenance namespace')
                const defaults = (await dispatch('getDefaults')) as Record<string, GuiMaintenanceStateEntry>
                return await dispatch('initDatabase', defaults)
            }
        })()

        const initEntryKey = Object.keys(entries).find((key) => entries[key].name === 'MAINTENANCE_INIT')
        if (initEntryKey) delete entries[initEntryKey]

        logDebug(`Loaded ${Object.keys(entries).length} maintenance entries from database`)
        commit('initStore', entries)
    },

    async getDefaults({ rootGetters }): Promise<Record<string, Partial<GuiMaintenanceStateEntry>>> {
        const baseUrl = rootGetters['socket/getUrl']
        const url = `${baseUrl}/server/files/config/${themeDir}/maintenance.json?time=${Date.now()}`

        return await fetch(url)
            .then((response) => {
                if (response.status === 404) return { [uuidv4()]: { name: 'MAINTENANCE_INIT' } }
                else if (response.status !== 200) throw new Error(`Unexpected response status: ${response.status}`)

                return response.json()
            })
            .catch((e) => {
                logError('Error while fetching maintenance defaults, using fallback', e)

                return { [uuidv4()]: { name: 'MAINTENANCE_INIT' } }
            })
    },

    async initDatabase(
        { dispatch },
        defaults: Record<string, GuiMaintenanceStateEntry>
    ): Promise<Record<string, GuiMaintenanceStateEntry>> {
        const totals = await Vue.$socket.emitAndWait('server.history.totals').catch((e) => {
            logError('Error while fetching history totals', e)
            return null
        })

        const total_filament_used = totals?.job_totals.total_filament_used ?? 0
        const total_print_time = totals?.job_totals.total_print_time ?? 0
        const date = new Date().getTime() / 1000
        const entries: Record<string, GuiMaintenanceStateEntry> = {}

        for (const [key, entry] of Object.entries(defaults)) {
            entries[key] = {
                name: entry.name,
                note: entry.note ?? '',
                perform_note: null,
                start_time: date,
                end_time: null,
                start_filament: total_filament_used,
                end_filament: null,
                start_printtime: total_print_time,
                end_printtime: null,
                last_entry: null,

                reminder: {
                    type: entry.reminder?.type ?? null,

                    filament: {
                        bool: entry.reminder?.filament?.bool ?? false,
                        value: entry.reminder?.filament?.value ?? null,
                    },

                    printtime: {
                        bool: entry.reminder?.printtime?.bool ?? false,
                        value: entry.reminder?.printtime?.value ?? null,
                    },

                    date: {
                        bool: entry.reminder?.date?.bool ?? false,
                        value: entry.reminder?.date?.value ?? null,
                    },
                },
            }

            await dispatch('upload', { id: key, entry: entries[key] })
        }

        return entries
    },

    async upload(_, payload: { id: string; entry: GuiMaintenanceStateEntry }): Promise<void> {
        await Vue.$socket.emitAndWait('server.database.post_item', {
            namespace: 'maintenance',
            key: payload.id,
            value: payload.entry,
        })
    },

    async store({ commit, dispatch, state }, entry: GuiMaintenanceStateEntry): Promise<void> {
        const id = uuidv4()

        commit('store', { id, entry })
        await dispatch('upload', { id, entry: state.entries[id] })
    },

    async update({ commit, dispatch, state }, payload: Partial<GuiMaintenanceStateEntry>): Promise<void> {
        const { id, ...entry } = payload
        if (!id) return

        commit('update', { id, entry })
        if (!(id in state.entries)) return
        await dispatch('upload', { id, entry: state.entries[id] })
    },

    async delete({ commit }, id: string): Promise<void> {
        commit('delete', id)
        await Vue.$socket.emitAndWait('server.database.delete_item', { namespace: 'maintenance', key: id })
    },

    async perform({ dispatch, state, rootState }, payload: { id: string; note: string }): Promise<void> {
        const entry = state.entries[payload.id]
        if (!entry) return

        const totalFilament = rootState.server?.history?.job_totals?.total_filament_used ?? 0
        const totalPrintTime = rootState.server?.history?.job_totals?.total_print_time ?? 0

        const patch: Partial<GuiMaintenanceStateEntry> = {
            id: payload.id,
            end_time: Date.now() / 1000,
            end_filament: totalFilament,
            end_printtime: totalPrintTime,
            perform_note: payload.note.trim() || null,
        }

        await dispatch('update', patch)

        if (entry.reminder.type !== 'repeat') return
        const date = new Date()

        const newEntry: GuiMaintenanceStateEntry = {
            name: entry.name,
            note: entry.note,
            perform_note: null,
            // divided by 1000 to get seconds, because history entries are also in seconds
            start_time: date.getTime() / 1000,
            end_time: null,
            start_filament: totalFilament,
            end_filament: null,
            start_printtime: totalPrintTime,
            end_printtime: null,
            last_entry: payload.id,

            reminder: { ...entry.reminder },
        }

        await dispatch('store', newEntry)
    },
}
