import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiMaintenanceState, MaintenanceJson } from '@/store/gui/maintenance/types'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import { themeDir } from '@/store/variables'

export const actions: ActionTree<GuiMaintenanceState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        Vue.$socket.emit(
            'server.database.get_item',
            { namespace: 'maintenance' },
            { action: 'gui/maintenance/initStore' }
        )
    },

    async initDb({ dispatch, rootGetters }) {
        const baseUrl = rootGetters['socket/getUrl']
        const url = `${baseUrl}/server/files/config/${themeDir}/maintenance.json?time=${Date.now()}`

        const defaults: MaintenanceJson = await fetch(url)
            .then((response) => {
                if (response.status !== 200) return { entries: [] }

                return response.json()
            })
            .catch((e) => {
                window.console.error('maintenance.json cannot be parsed', e)
                return { entries: [] }
            })

        // stop, when no entries are available/found
        const entries = defaults.entries ?? []
        if (entries?.length === 0) {
            Vue.$socket.emit('server.database.post_item', {
                namespace: 'maintenance',
                key: uuidv4(),
                value: {
                    name: 'MAINTENANCE_INIT',
                },
            })

            return
        }

        const totals = await fetch(`${baseUrl}/server/history/totals`)
            .then((response) => {
                if (response.status !== 200) return {}

                return response.json()
            })
            .then((response: any) => response.result?.job_totals ?? {})
            .catch((e) => {
                window.console.debug('History totals could not be loaded', e)
            })

        const total_filament = totals.total_filament_used ?? 0
        const total_print_time = totals.total_print_time ?? 0
        const date = new Date().getTime() / 1000

        entries.forEach((entry) => {
            dispatch('store', {
                entry: {
                    name: entry.name,
                    note: entry.note ?? '',
                    start_time: date,
                    end_time: null,
                    start_filament: total_filament,
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
                },
            })
        })
    },

    async initStore({ commit, dispatch }, payload) {
        await commit('reset')

        const entries = payload.value ?? {}
        const initKey = Object.keys(entries).find((key) => entries[key]?.name === 'MAINTENANCE_INIT')
        if (initKey) delete entries[initKey]

        await commit('initStore', entries)
        await dispatch('socket/removeInitModule', 'gui/maintenance/init', { root: true })
    },

    upload(_, payload) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'maintenance',
            key: payload.id,
            value: payload.value,
        })
    },

    store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('store', { id, values: payload.entry })
        dispatch('upload', {
            id,
            value: state.entries[id],
        })
    },

    update({ commit, dispatch }, payload) {
        const id = payload.id
        delete payload.id

        commit('update', {
            id: id,
            entry: payload,
        })
        dispatch('upload', {
            id: id,
            value: payload,
        })
    },

    delete({ commit }, payload) {
        commit('delete', payload)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'maintenance', key: payload })
    },

    perform({ dispatch, state, rootState }, payload: { id: string; note: string }) {
        const entry = state.entries[payload.id]
        if (!entry) return

        const totalFilament = rootState.server?.history?.job_totals?.total_filament_used ?? 0
        const totalPrintTime = rootState.server?.history?.job_totals?.total_print_time ?? 0

        entry.id = payload.id
        entry.end_time = Date.now() / 1000
        entry.end_filament = totalFilament
        entry.end_printtime = totalPrintTime
        entry.perform_note = payload.note.trim() || null

        dispatch('update', entry)

        if (entry.reminder.type === 'repeat') {
            const date = new Date()

            dispatch('store', {
                entry: {
                    name: entry.name,
                    note: entry.note,
                    // divided by 1000 to get seconds, because history entries are also in seconds
                    start_time: date.getTime() / 1000,
                    end_time: null,
                    start_filament: totalFilament,
                    end_filament: null,
                    start_printtime: totalPrintTime,
                    end_printtime: null,
                    last_entry: payload.id,

                    reminder: { ...entry.reminder },
                },
            })
        }
    },
}
