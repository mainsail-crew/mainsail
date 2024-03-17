import Vue from 'vue'
import { ActionTree } from 'vuex'
import { GuiMaintenanceState } from '@/store/gui/maintenance/types'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'

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

    async initStore({ commit, dispatch }, payload) {
        await commit('reset')
        await commit('initStore', payload)
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

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', {
            id: payload.id,
            value: state.entries[payload.id],
        })
    },

    delete({ commit }, payload) {
        commit('delete', payload)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'maintenance', key: payload })
    },

    perform({ dispatch, state, rootState }, payload: { id: string }) {
        const entry = state.entries[payload.id]
        if (!entry) return

        const totalFilament = rootState.server?.history?.job_totals?.total_filament_used ?? 0
        const totalPrintTime = rootState.server?.history?.job_totals?.total_print_time ?? 0

        entry.end_time = Date.now() / 1000
        entry.end_filament = totalFilament
        entry.end_printtime = totalPrintTime

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

                    reminder: { ...entry.reminder },
                },
            })
        }
    },
}
